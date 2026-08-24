import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";
import {
  isOtpConfigured,
  resetPasswordWithOtp,
  sendPasswordResetOtp,
} from "../lib/otpClient";

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

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState("");
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const resetPasswordRules = [
    { label: "At least 8 characters", passed: newPassword.length >= 8 },
    { label: "At least 1 capital letter", passed: /[A-Z]/.test(newPassword) },
    { label: "At least 1 small letter", passed: /[a-z]/.test(newPassword) },
    { label: "At least 1 number", passed: /\d/.test(newPassword) },
    {
      label: "At least 1 special character",
      passed: /[^A-Za-z\d]/.test(newPassword),
    },
  ];
  const resetPasswordsMatch =
    Boolean(confirmNewPassword) && newPassword === confirmNewPassword;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setResetMessage("");
    setShowForgotPassword(false);

    if (!isSupabaseConfigured || !supabase) {
      return setError("Supabase is not configured.");
    }

    const cleanEmail = email.trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return setError("Please enter a valid email address.");
    }

    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    setLoading(false);

    if (loginError) {
      setShowForgotPassword(true);
      return setError("Invalid email or password.");
    }

    navigate("/dashboard");
  };

  const handleForgotPassword = async () => {
    setError("");
    setResetMessage("");
    setResetStatus("");

    if (!isOtpConfigured()) {
      return setError(
        "OTP is not configured. Add VITE_OTP_SCRIPT_URL to .env and restart npm run dev."
      );
    }

    const cleanEmail = email.trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return setError("Enter your email first, then click Forgot password.");
    }

    setResetLoading(true);
    setResetStatus("Checking account...");

    try {
      const result = await sendPasswordResetOtp(cleanEmail);
      setResetOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
      setResetModalOpen(true);
      setResetMessage(result.message || "OTP sent. Please check your email.");
      setResetStatus("");
    } catch (resetError) {
      setError(resetError.message);
    } finally {
      setResetLoading(false);
      setResetStatus("");
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setResetMessage("");
    setResetStatus("");

    if (!/^\d{6}$/.test(resetOtp.trim())) {
      return setError("OTP must be 6 digits.");
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      return setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
    }
    if (newPassword !== confirmNewPassword) {
      return setError("New password and confirm password do not match.");
    }

    setResetLoading(true);
    setResetStatus("Resetting password...");

    try {
      const result = await resetPasswordWithOtp(
        email.trim(),
        resetOtp.trim(),
        newPassword,
      );
      setResetModalOpen(false);
      setPassword("");
      setResetOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowForgotPassword(false);
      setResetMessage(
        result.message || "Password reset successful. You can now log in.",
      );
    } catch (resetError) {
      setError(resetError.message);
    } finally {
      setResetLoading(false);
      setResetStatus("");
    }
  };

  return (
    <div className="auth auth--login">
      <div className="auth__card glass">
        <div className="auth__brand">
          <span className="material-symbols-outlined auth__brandIcon">
            restaurant_menu
          </span>
          <div className="auth__brandName">Smart Meal Planner</div>
        </div>

        <h1 className="auth__title">Welcome back</h1>
        <p className="auth__subtitle">Log in to continue planning your meals.</p>

        {!isSupabaseConfigured && (
          <div className="error" style={{ marginBottom: 16 }}>
            Missing Supabase config. Add your project URL and anon key in .env.
          </div>
        )}

        <form className="auth__form" onSubmit={handleLogin}>
          <div className="field">
            <label className="label" htmlFor="loginEmail">
              Email
            </label>
            <input
              id="loginEmail"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setResetMessage("");
                setShowForgotPassword(false);
                setResetModalOpen(false);
              }}
              autoComplete="email"
              required
            />
          </div>

          <PasswordField
            id="loginPassword"
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
              setResetMessage("");
              setShowForgotPassword(false);
            }}
            show={showPassword}
            onToggleShow={() => setShowPassword((current) => !current)}
            autoComplete="current-password"
          />

          {error ? <div className="error">{error}</div> : null}

          {showForgotPassword ? (
            <button
              className="auth__link"
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              style={{
                alignSelf: "flex-start",
                background: "transparent",
                border: 0,
                cursor: "pointer",
                padding: 0,
                fontWeight: 800,
              }}
            >
              {resetLoading
                ? resetStatus || "Checking account..."
                : "Forgot password?"}
            </button>
          ) : null}

          {resetMessage ? <div className="helper">{resetMessage}</div> : null}

          <button
            className="primarybtn"
            type="submit"
            disabled={loading || !email || !password}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              login
            </span>
            {loading ? "Logging in..." : "Log in"}
          </button>

          <div className="auth__footer">
            <span>Don&apos;t have an account?</span>{" "}
            <Link className="auth__link" to="/register">
              Create one
            </Link>
          </div>
        </form>
      </div>

      {resetModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resetTitle"
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
              width: "min(440px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <h3 id="resetTitle" className="auth__title" style={{ marginBottom: 8 }}>
              Reset password
            </h3>
            <p className="auth__subtitle" style={{ marginBottom: 16 }}>
              We sent a 6-digit OTP to <strong>{email.trim()}</strong>. Enter the
              OTP and your new password below.
            </p>

            <div className="field">
              <label className="label" htmlFor="resetOtp">
                Email OTP
              </label>
              <input
                id="resetOtp"
                className="input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit OTP"
                value={resetOtp}
                onChange={(e) =>
                  setResetOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
            </div>

            <PasswordField
              id="newPassword"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              show={showNewPassword}
              onToggleShow={() => setShowNewPassword((current) => !current)}
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
              {resetPasswordRules.map((rule) => (
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
              id="confirmNewPassword"
              label="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              show={showConfirmNewPassword}
              onToggleShow={() =>
                setShowConfirmNewPassword((current) => !current)
              }
              autoComplete="new-password"
            />

            {confirmNewPassword ? (
              <div
                className="helper"
                style={{
                  color: resetPasswordsMatch ? "#047857" : "#93000a",
                  fontWeight: 700,
                }}
              >
                {resetPasswordsMatch
                  ? "Passwords match."
                  : "Passwords do not match yet."}
              </div>
            ) : null}

            {error ? <div className="error">{error}</div> : null}
            {resetMessage ? <div className="helper">{resetMessage}</div> : null}

            <div className="formgrid formgrid--2" style={{ marginTop: 16 }}>
              <button
                className="softbtn"
                type="button"
                onClick={() => {
                  setResetModalOpen(false);
                  setResetOtp("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                  setError("");
                }}
                disabled={resetLoading}
              >
                Cancel
              </button>
              <button
                className="primarybtn"
                type="button"
                onClick={handleResetPassword}
                disabled={
                  resetLoading ||
                  resetOtp.length !== 6 ||
                  !PASSWORD_REGEX.test(newPassword) ||
                  !resetPasswordsMatch
                }
              >
                {resetLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>

            <button
              className="auth__link"
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
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

