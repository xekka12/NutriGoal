const OTP_ENDPOINT = import.meta.env.VITE_OTP_SCRIPT_URL;

async function callOtpEndpoint(payload) {
  if (!OTP_ENDPOINT) {
    throw new Error(
      "Missing VITE_OTP_SCRIPT_URL. Add your deployed Apps Script web app URL to .env, then restart npm run dev."
    );
  }

  const response = await fetch(OTP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok || !result.ok) {
    if (result.error === "Invalid OTP action.") {
      throw new Error(
        "Apps Script deployment is outdated. Paste the latest brevoOtp.gs code, deploy a new version, then try again."
      );
    }

    if (
      result.error?.includes("DNS error") ||
      result.error?.includes("Could not reach Supabase") ||
      result.error?.includes("Invalid SUPABASE_URL")
    ) {
      throw new Error(
        "OTP server Supabase URL is incorrect. In Apps Script properties, set SUPABASE_URL to https://nvjnulhijliwjvewzfai.supabase.co"
      );
    }

    throw new Error(result.error || "OTP request failed.");
  }

  return result;
}

export function isOtpConfigured() {
  return Boolean(OTP_ENDPOINT);
}

export function sendOtp(email) {
  return callOtpEndpoint({ action: "sendOtp", email });
}

export function verifyOtp(email, otp) {
  return callOtpEndpoint({ action: "verifyOtp", email, otp });
}

export function sendPasswordResetOtp(email) {
  return callOtpEndpoint({ action: "sendResetOtp", email });
}

export function resetPasswordWithOtp(email, otp, password) {
  return callOtpEndpoint({ action: "resetPassword", email, otp, password });
}
