const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const OTP_EXPIRY_SECONDS = 10 * 60;
const OTP_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getScriptProperty(name) {
  const value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) {
    throw new Error(`Missing script property: ${name}`);
  }
  return value;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function sendBrevoOtp(email, otp) {
  const apiKey = getScriptProperty("BREVO_API_KEY");
  const senderEmail = getScriptProperty("OTP_FROM_EMAIL");
  const senderName =
    PropertiesService.getScriptProperties().getProperty("OTP_FROM_NAME") ||
    "Smart Meal Planner";

  const body = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email }],
    subject: "Your Smart Meal Planner OTP",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${otp}</div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
    textContent: `Your Smart Meal Planner OTP is ${otp}. It expires in 10 minutes.`,
  };

  const response = UrlFetchApp.fetch(BREVO_API_URL, {
    method: "post",
    contentType: "application/json",
    headers: {
      "api-key": apiKey,
      accept: "application/json",
    },
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });

  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error(`Brevo failed (${code}): ${response.getContentText()}`);
  }
}

function getSupabaseConfig() {
  const url = getScriptProperty("SUPABASE_URL").replace(/\/$/, "");
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
    throw new Error(
      "Invalid SUPABASE_URL script property. It must look like https://your-project-id.supabase.co"
    );
  }

  return {
    url,
    serviceRoleKey: getScriptProperty("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

function supabaseAdminFetch(path, options) {
  const config = getSupabaseConfig();
  let response;

  try {
    response = UrlFetchApp.fetch(`${config.url}${path}`, {
      ...options,
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
        "Content-Type": "application/json",
        ...(options && options.headers ? options.headers : {}),
      },
      muteHttpExceptions: true,
    });
  } catch (error) {
    throw new Error(
      `Could not reach Supabase. Check SUPABASE_URL in Apps Script properties. ${error.message}`
    );
  }

  const code = response.getResponseCode();
  const text = response.getContentText();
  const body = text ? JSON.parse(text) : null;

  if (code < 200 || code >= 300) {
    const message = body && body.message ? body.message : text;
    throw new Error(`Supabase admin failed (${code}): ${message}`);
  }

  return body;
}

function findSupabaseUserByEmail(email) {
  const perPage = 100;
  for (let page = 1; page <= 10; page += 1) {
    const result = supabaseAdminFetch(
      `/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
      { method: "get" }
    );
    const users = Array.isArray(result) ? result : result.users || [];
    const found = users.find(
      (user) => normalizeEmail(user.email) === normalizeEmail(email)
    );

    if (found) return found;
    if (users.length < perPage) return null;
  }

  return null;
}

function updateSupabaseUserPassword(userId, password) {
  return supabaseAdminFetch(`/auth/v1/admin/users/${userId}`, {
    method: "put",
    payload: JSON.stringify({ password }),
  });
}

function handleSendOtp(email) {
  if (!isValidEmail(email)) {
    throw new Error("Please enter a valid email address.");
  }

  const cache = CacheService.getScriptCache();
  const cooldownKey = `otp-cooldown:${email}`;
  if (cache.get(cooldownKey)) {
    throw new Error("Please wait 1 minute before requesting another OTP.");
  }

  const otp = makeOtp();
  cache.put(
    `otp:${email}`,
    JSON.stringify({ otp, attempts: 0 }),
    OTP_EXPIRY_SECONDS
  );
  cache.put(cooldownKey, "1", OTP_COOLDOWN_SECONDS);

  sendBrevoOtp(email, otp);

  return { ok: true, message: "OTP sent. Please check your email." };
}

function handleSendResetOtp(email) {
  if (!isValidEmail(email)) {
    throw new Error("Please enter a valid email address.");
  }

  const user = findSupabaseUserByEmail(email);
  if (!user) {
    throw new Error("Account does not exist on this app.");
  }

  const cache = CacheService.getScriptCache();
  const cooldownKey = `reset-otp-cooldown:${email}`;
  if (cache.get(cooldownKey)) {
    throw new Error("Please wait 1 minute before requesting another OTP.");
  }

  const otp = makeOtp();
  cache.put(
    `reset-otp:${email}`,
    JSON.stringify({ otp, attempts: 0, userId: user.id }),
    OTP_EXPIRY_SECONDS
  );
  cache.put(cooldownKey, "1", OTP_COOLDOWN_SECONDS);

  sendBrevoOtp(email, otp);

  return { ok: true, message: "OTP sent. Please check your email." };
}

function handleVerifyOtp(email, otp) {
  if (!isValidEmail(email)) {
    throw new Error("Please enter a valid email address.");
  }

  const cleanOtp = String(otp || "").trim();
  if (!/^\d{6}$/.test(cleanOtp)) {
    throw new Error("OTP must be 6 digits.");
  }

  const cache = CacheService.getScriptCache();
  const key = `otp:${email}`;
  const raw = cache.get(key);
  if (!raw) {
    throw new Error("OTP expired or not found. Please request a new OTP.");
  }

  const record = JSON.parse(raw);
  const attempts = Number(record.attempts || 0);
  if (attempts >= OTP_MAX_ATTEMPTS) {
    cache.remove(key);
    throw new Error("Too many OTP attempts. Please request a new OTP.");
  }

  if (record.otp !== cleanOtp) {
    cache.put(
      key,
      JSON.stringify({ otp: record.otp, attempts: attempts + 1 }),
      OTP_EXPIRY_SECONDS
    );
    throw new Error("Invalid OTP.");
  }

  cache.remove(key);
  return { ok: true, message: "Email verified." };
}

function handleResetPassword(email, otp, password) {
  if (!isValidEmail(email)) {
    throw new Error("Please enter a valid email address.");
  }

  const cleanOtp = String(otp || "").trim();
  if (!/^\d{6}$/.test(cleanOtp)) {
    throw new Error("OTP must be 6 digits.");
  }

  if (!PASSWORD_REGEX.test(String(password || ""))) {
    throw new Error(
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
    );
  }

  const cache = CacheService.getScriptCache();
  const key = `reset-otp:${email}`;
  const raw = cache.get(key);
  if (!raw) {
    throw new Error("OTP expired or not found. Please request a new OTP.");
  }

  const record = JSON.parse(raw);
  const attempts = Number(record.attempts || 0);
  if (attempts >= OTP_MAX_ATTEMPTS) {
    cache.remove(key);
    throw new Error("Too many OTP attempts. Please request a new OTP.");
  }

  if (record.otp !== cleanOtp) {
    cache.put(
      key,
      JSON.stringify({
        otp: record.otp,
        attempts: attempts + 1,
        userId: record.userId,
      }),
      OTP_EXPIRY_SECONDS
    );
    throw new Error("Invalid OTP.");
  }

  updateSupabaseUserPassword(record.userId, password);
  cache.remove(key);

  return { ok: true, message: "Password reset successful. You can now log in." };
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const action = payload.action;
    const email = normalizeEmail(payload.email);

    if (action === "sendOtp") {
      return jsonResponse(handleSendOtp(email));
    }

    if (action === "sendResetOtp") {
      return jsonResponse(handleSendResetOtp(email));
    }

    if (action === "verifyOtp") {
      return jsonResponse(handleVerifyOtp(email, payload.otp));
    }

    if (action === "resetPassword") {
      return jsonResponse(
        handleResetPassword(email, payload.otp, payload.password)
      );
    }

    throw new Error("Invalid OTP action.");
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}
