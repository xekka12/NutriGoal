import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";
import { isOtpConfigured, sendOtp, verifyOtp } from "../lib/otpClient";

const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
}) {
  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          className="input"
          type={show ? "text" : "password"}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          title="At least 8 characters with uppercase, lowercase, number, and special character"
          minLength={8}
          required
          style={{ paddingRight: 48 }}
        />
        <button
          type="button"
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
          onClick={onToggleShow}
          style={{
            position: "absolute",
            top: "50%",
            right: 12,
            transform: "translateY(-50%)",
            display: "grid",
            placeItems: "center",
            width: 28,
            height: 28,
            border: 0,
            borderRadius: 999,
            background: "transparent",
            color: "var(--muted)",
            cursor: "pointer",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20 }}
            aria-hidden="true"
          >
            {show ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const passwordRules = [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "At least 1 capital letter", passed: /[A-Z]/.test(password) },
    { label: "At least 1 small letter", passed: /[a-z]/.test(password) },
    { label: "At least 1 number", passed: /\d/.test(password) },
    {
      label: "At least 1 special character",
      passed: /[^A-Za-z\d]/.test(password),
    },
  ];
  const passwordsMatch = Boolean(confirmPassword) && password === confirmPassword;

  const validateSignup = () => {
    const trimmedFirstName = firstName.trim();
    const trimmedMiddleName = middleName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (!NAME_REGEX.test(trimmedFirstName)) {
      return "First name must contain letters and spaces only.";
    }
    if (!NAME_REGEX.test(trimmedMiddleName)) {
      return "Middle name must contain letters and spaces only.";
    }
    if (!NAME_REGEX.test(trimmedLastName)) {
      return "Last name must contain letters and spaces only.";
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return "Please enter a valid email address with @, like Gmail, Yahoo, or Outlook.";
    }
    if (!PASSWORD_REGEX.test(password)) {
      return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
    }
    if (password !== confirmPassword) {
      return "Password and confirm password do not match.";
    }

    return "";
  };

  const resetOtpState = () => {
    setOtp("");
    setOtpVerified(false);
    setOtpModalOpen(false);
    setOtpMessage("");
  };

  const handleSendOtp = async () => {
    setError("");
    setOtpMessage("");

    const cleanEmail = email.trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return setError("Please enter a valid email address before sending OTP.");
    }
    if (!isOtpConfigured()) {
      return setError(
        "OTP is not configured. Add VITE_OTP_SCRIPT_URL to .env and restart npm run dev."
      );
    }

    setOtpLoading(true);
    try {
      const result = await sendOtp(cleanEmail);
      setOtpVerified(false);
      setOtpModalOpen(true);
      setOtpMessage(result.message || "OTP sent. Please check your email.");
    } catch (otpError) {
      setError(otpError.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setOtpMessage("");

    const cleanEmail = email.trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return setError("Please enter a valid email address.");
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      return setError("OTP must be 6 digits.");
    }
    if (!isOtpConfigured()) {
      return setError(
        "OTP is not configured. Add VITE_OTP_SCRIPT_URL to .env and restart npm run dev."
      );
    }

    setOtpLoading(true);
    try {
      const result = await verifyOtp(cleanEmail, otp.trim());
      setOtpVerified(true);
      setOtpMessage(result.message || "Email verified.");
      await createSupabaseAccount();
    } catch (otpError) {
      setOtpVerified(false);
      setError(otpError.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const createSupabaseAccount = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return setError(
        "Error."
      );
    }

    setLoading(true);

    const cleanFirstName = firstName.trim();
    const cleanMiddleName = middleName.trim();
    const cleanLastName = lastName.trim();
    const cleanSuffix = suffix.trim();
    const cleanEmail = email.trim();

    const fullName = [cleanFirstName, cleanMiddleName, cleanLastName, cleanSuffix]
      .filter(Boolean)
      .join(" ");

    // Gumagawa ng user sa Auth (auth.users) — yan ang "Auth" sa Schema Visualizer.
    // data.user.id (uuid) ang ilalagay sa tbl_meal_plans.user_id kapag may meal plan na.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          first_name: cleanFirstName,
          middle_name: cleanMiddleName,
          last_name: cleanLastName,
          suffix: cleanSuffix || null,
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      return setError(signUpError.message);
    }

    setLoading(false);

    if (data.user) {
      navigate("/login");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!isSupabaseConfigured || !supabase) {
      return setError(
        "Error."
      );
    }

    if (!isOtpConfigured()) {
      return setError(
        "OTP is not configured. Add VITE_OTP_SCRIPT_URL to .env and restart npm run dev."
      );
    }

    const validationError = validateSignup();
    if (validationError) {
      return setError(validationError);
    }

    if (otpVerified) return createSupabaseAccount();

    await handleSendOtp();
  };

  return (
    <div className="auth">
      <div className="auth__card glass">
        <div className="auth__brand">
          <span className="material-symbols-outlined auth__brandIcon">
            restaurant_menu
          </span>
          <div className="auth__brandName">Smart Meal Planner</div>
        </div>

        <h1 className="auth__title">Create your account</h1>
        <p className="auth__subtitle">
          Start building healthy meal plans that match your budget.
        </p>

        {!isSupabaseConfigured && (
          <div className="error" style={{ marginBottom: 16 }}>
            Missing .env file. Copy .env.example to .env, add your Supabase URL
            and anon key, then restart the dev server.
          </div>
        )}

        {!isOtpConfigured() && (
          <div className="error" style={{ marginBottom: 16 }}>
            Missing OTP endpoint. Add your Apps Script web app URL as
            VITE_OTP_SCRIPT_URL in .env, then restart the dev server.
          </div>
        )}

        <form className="auth__form" autoComplete="off" onSubmit={handleSignup}>
          <div className="formgrid formgrid--2">
            <div className="field">
              <label className="label" htmlFor="firstName">
                First name
              </label>
              <input
                id="firstName"
                className="input"
                type="text"
                placeholder="Juan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                pattern="[A-Za-z ]+"
                title="Letters and spaces only"
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="lastName">
                Last name
              </label>
              <input
                id="lastName"
                className="input"
                type="text"
                placeholder="Dela Cruz"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                pattern="[A-Za-z ]+"
                title="Letters and spaces only"
                required
              />
            </div>
          </div>

          <div className="formgrid formgrid--2">
            <div className="field">
              <label className="label" htmlFor="middleName">
                Middle name
              </label>
              <input
                id="middleName"
                className="input"
                type="text"
                placeholder="Santos"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                autoComplete="additional-name"
                pattern="[A-Za-z ]+"
                title="Letters and spaces only"
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="suffix">
                Suffix <span className="label__hint">(optional)</span>
              </label>
              <input
                id="suffix"
                className="input"
                type="text"
                placeholder="Jr., Sr., III"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                autoComplete="honorific-suffix"
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="registerEmail">
              Email
            </label>
            <input
              id="registerEmail"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                resetOtpState();
              }}
              autoComplete="email"
              title="Enter a valid email address"
              required
            />
          </div>

          <PasswordField
            id="registerPassword"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            show={showPassword}
            onToggleShow={() => setShowPassword((current) => !current)}
            autoComplete="new-password"
          />

          <div
            style={{
              display: "grid",
              gap: 6,
              padding: "10px 12px",
              borderRadius: 14,
              background: "rgba(0, 0, 0, 0.03)",
            }}
          >
            {passwordRules.map((rule) => (
              <div
                className="helper"
                key={rule.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 0,
                  color: rule.passed ? "#047857" : "var(--muted)",
                  fontWeight: rule.passed ? 700 : 500,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 17 }}
                  aria-hidden="true"
                >
                  {rule.passed ? "check_circle" : "radio_button_unchecked"}
                </span>
                {rule.label}
              </div>
            ))}
          </div>

          <PasswordField
            id="confirmPassword"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            show={showConfirmPassword}
            onToggleShow={() =>
              setShowConfirmPassword((current) => !current)
            }
            autoComplete="new-password"
          />

          {confirmPassword ? (
            <div
              className="helper"
              style={{
                color: passwordsMatch ? "#047857" : "#93000a",
                fontWeight: 700,
              }}
            >
              {passwordsMatch
                ? "Passwords match."
                : "Passwords do not match yet."}
            </div>
          ) : null}

          <button
            className="primarybtn"
            type="submit"
            disabled={
              loading ||
              otpLoading ||
              !email ||
              !password ||
              !confirmPassword ||
              !firstName ||
              !middleName ||
              !lastName
            }
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              person_add
            </span>
            {otpLoading
              ? "Sending OTP..."
              : loading
                ? "Creating account..."
                : "Create account"}
          </button>

          <div className="auth__footer">
            <span>Already have an account?</span>{" "}
            <Link className="auth__link" to="/login">
              Log in
            </Link>
          </div>
        </form>

        {error && <div className="error">{error}</div>}
      </div>

      {otpModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="otpTitle"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "grid",
            placeItems: "center",
            padding: 16,
            background: "rgba(15, 23, 42, 0.45)",
          }}
        >
          <div
            className="glass"
            style={{
              width: "min(420px, 100%)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <h3 id="otpTitle" className="auth__title" style={{ marginBottom: 8 }}>
              Verify your email
            </h3>
            <p className="auth__subtitle" style={{ marginBottom: 16 }}>
              We sent a 6-digit OTP to <strong>{email.trim()}</strong>. Enter it
              below to finish creating your account.
            </p>

            <div className="field">
              <label className="label" htmlFor="registerOtp">
                Email OTP
              </label>
              <input
                id="registerOtp"
                className="input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setOtpVerified(false);
                }}
                autoFocus
              />
              {otpMessage ? <div className="helper">{otpMessage}</div> : null}
            </div>

            {error ? <div className="error">{error}</div> : null}

            <div className="formgrid formgrid--2" style={{ marginTop: 16 }}>
              <button
                className="softbtn"
                type="button"
                onClick={() => {
                  setOtpModalOpen(false);
                  setOtp("");
                  setError("");
                }}
                disabled={otpLoading || loading}
              >
                Cancel
              </button>
              <button
                className="primarybtn"
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpLoading || loading || otp.length !== 6}
              >
                {otpLoading || loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>

            <button
              className="auth__link"
              type="button"
              onClick={handleSendOtp}
              disabled={otpLoading || loading}
              style={{
                background: "transparent",
                border: 0,
                cursor: "pointer",
                padding: 0,
                marginTop: 12,
              }}
            >
              Resend OTP
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
