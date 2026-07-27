import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  isOtpConfigured,
  resetPasswordWithOtp,
  sendPasswordResetOtp,
} from "../lib/otpClient";
import { supabase } from "../lib/supabaseClient";

const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const OPTIONAL_NAME_REGEX = /^$|^[A-Za-z]+(?: [A-Za-z]+)*$/;
const SUFFIX_REGEX = /^$|^[A-Za-z. ]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const AVATAR_BUCKET = "profile-avatars";
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

function useThemeClass() {
  const prefersDark = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  }, []);
  const [isDark, setIsDark] = useState(prefersDark);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDark]);

  return { isDark, setIsDark };
}

function TopNavLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? "topnav__link topnav__link--active" : "topnav__link"
      }
      end
    >
      {children}
    </NavLink>
  );
}

function BottomNavLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? "bottomnav__item bottomnav__item--active" : "bottomnav__item"
      }
      end
      aria-label={label}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="bottomnav__label">{label}</span>
    </NavLink>
  );
}

function BottomProfileButton({ onClick }) {
  return (
    <button
      className="bottomnav__item"
      type="button"
      aria-label="Profile"
      onClick={onClick}
    >
      <span className="material-symbols-outlined">person</span>
      <span className="bottomnav__label">Profile</span>
    </button>
  );
}

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
      <div className="passwordWrap">
        <input
          id={id}
          className="input"
          type={show ? "text" : "password"}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          minLength={8}
        />
        <button
          className="passwordToggle"
          type="button"
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
          onClick={onToggleShow}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {show ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
    </div>
  );
}

function PasswordChecklist({ password }) {
  const rules = [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "At least 1 capital letter", passed: /[A-Z]/.test(password) },
    { label: "At least 1 small letter", passed: /[a-z]/.test(password) },
    { label: "At least 1 number", passed: /\d/.test(password) },
    {
      label: "At least 1 special character",
      passed: /[^A-Za-z\d]/.test(password),
    },
  ];

  return (
    <div className="passwordChecklist">
      {rules.map((rule) => (
        <div
          className={
            rule.passed
              ? "passwordChecklist__item passwordChecklist__item--passed"
              : "passwordChecklist__item"
          }
          key={rule.label}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {rule.passed ? "check_circle" : "radio_button_unchecked"}
          </span>
          {rule.label}
        </div>
      ))}
    </div>
  );
}

function AvatarDisplay({ avatarUrl, initials, className }) {
  if (avatarUrl) {
    return (
      <img
        className={`${className}__img`}
        src={avatarUrl}
        alt="Profile avatar"
      />
    );
  }

  return initials;
}

function getInitials(user) {
  const metadata = user?.user_metadata ?? {};
  const firstName = String(metadata.first_name || "").trim();
  const lastName = String(metadata.last_name || "").trim();
  const fullName = String(metadata.full_name || "").trim();

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  if (fullName) {
    const parts = fullName.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return `${first}${last}`.toUpperCase() || "U";
  }

  return String(user?.email?.[0] || "U").toUpperCase();
}

function getProfileForm(user) {
  const metadata = user?.user_metadata ?? {};

  return {
    firstName: String(metadata.first_name || "").trim(),
    middleName: String(metadata.middle_name || "").trim(),
    lastName: String(metadata.last_name || "").trim(),
    suffix: String(metadata.suffix || "").trim(),
    email: String(user?.email || "").trim(),
    avatarUrl: String(metadata.avatar_url || "").trim(),
  };
}

function validateProfileForm(profile) {
  if (!NAME_REGEX.test(profile.firstName.trim())) {
    return "First name must contain letters and spaces only.";
  }
  if (!OPTIONAL_NAME_REGEX.test(profile.middleName.trim())) {
    return "Middle name must contain letters and spaces only.";
  }
  if (!NAME_REGEX.test(profile.lastName.trim())) {
    return "Last name must contain letters and spaces only.";
  }
  if (!SUFFIX_REGEX.test(profile.suffix.trim())) {
    return "Suffix must contain letters, spaces, or dots only.";
  }

  return "";
}

export default function MealLayout() {
  const navigate = useNavigate();
  const { isDark, setIsDark } = useThemeClass();
  const [initials, setInitials] = useState("U");
  const [currentUser, setCurrentUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState(getProfileForm(null));
  const [profileLoading, setProfileLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetOtp, setResetOtp] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] =
    useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const newPasswordsMatch =
    Boolean(confirmNewPassword) && newPassword === confirmNewPassword;
  const resetPasswordsMatch =
    Boolean(resetConfirmPassword) && resetNewPassword === resetConfirmPassword;

  const applyUser = (user) => {
    setCurrentUser(user);
    setInitials(getInitials(user));
    setProfileForm(getProfileForm(user));
  };

  useEffect(() => {
    localStorage.removeItem("mealPlanHistory");
    localStorage.removeItem("savedMealPlans");
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      if (!supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (isMounted) {
        applyUser(user);
      }
    };

    loadUser();

    const { data } =
      supabase?.auth.onAuthStateChange((_event, session) => {
        applyUser(session?.user ?? null);
      }) ?? {};

    return () => {
      isMounted = false;
      data?.subscription?.unsubscribe();
    };
  }, []);

  const handleProfileChange = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
    setProfileError("");
    setProfileMessage("");
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    setProfileError("");
    setProfileMessage("");

    if (!file) return;
    if (!supabase || !currentUser) {
      return setProfileError("Please log in first.");
    }
    if (!file.type.startsWith("image/")) {
      return setProfileError("Profile photo must be an image file.");
    }
    if (file.size > MAX_AVATAR_SIZE) {
      return setProfileError("Profile photo must be 2MB or smaller.");
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${currentUser.id}/avatar-${Date.now()}.${extension}`;

    setAvatarUploading(true);

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      setAvatarUploading(false);
      return setProfileError(
        "Could not upload profile photo. Make sure the profile-avatars storage bucket exists and has the correct policies.",
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...(currentUser.user_metadata ?? {}),
        avatar_url: publicUrl,
      },
    });

    setAvatarUploading(false);

    if (error) return setProfileError(error.message);

    applyUser(data.user);
    setProfileMessage("Profile photo updated successfully.");
  };

  const handleRemoveAvatar = async () => {
    setProfileError("");
    setProfileMessage("");

    if (!supabase || !currentUser) {
      return setProfileError("Please log in first.");
    }

    setAvatarUploading(true);
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...(currentUser.user_metadata ?? {}),
        avatar_url: "",
      },
    });
    setAvatarUploading(false);

    if (error) return setProfileError(error.message);

    applyUser(data.user);
    setProfileMessage("Profile photo removed.");
  };

  const handleSaveProfile = async () => {
    setProfileError("");
    setProfileMessage("");

    if (!supabase || !currentUser) {
      return setProfileError("Please log in first.");
    }

    const validationError = validateProfileForm(profileForm);
    if (validationError) return setProfileError(validationError);

    const cleanProfile = {
      first_name: profileForm.firstName.trim(),
      middle_name: profileForm.middleName.trim(),
      last_name: profileForm.lastName.trim(),
      suffix: profileForm.suffix.trim(),
    };
    const fullName = [
      cleanProfile.first_name,
      cleanProfile.middle_name,
      cleanProfile.last_name,
      cleanProfile.suffix,
    ]
      .filter(Boolean)
      .join(" ");

    setProfileLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...(currentUser.user_metadata ?? {}),
        ...cleanProfile,
        full_name: fullName,
        avatar_url: profileForm.avatarUrl,
      },
    });
    setProfileLoading(false);

    if (error) return setProfileError(error.message);

    applyUser(data.user);
    setProfileMessage("Profile updated successfully.");
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordMessage("");

    if (!supabase || !currentUser) {
      return setPasswordError("Please log in first.");
    }
    if (!currentPassword) {
      return setPasswordError("Enter your current password first.");
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      return setPasswordError(
        "New password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      );
    }
    if (newPassword !== confirmNewPassword) {
      return setPasswordError("New password and confirm password do not match.");
    }

    setPasswordLoading(true);

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: profileForm.email,
      password: currentPassword,
    });

    if (verifyError) {
      setPasswordLoading(false);
      return setPasswordError("Current password is incorrect.");
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);

    if (error) return setPasswordError(error.message);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordMessage("Password changed successfully.");
  };

  const handleSendResetOtp = async () => {
    setResetError("");
    setResetMessage("");

    if (!isOtpConfigured()) {
      return setResetError(
        "OTP is not configured. Add VITE_OTP_SCRIPT_URL to .env and restart npm run dev.",
      );
    }
    if (!profileForm.email) {
      return setResetError("No email found for this account.");
    }

    setResetLoading(true);
    try {
      const result = await sendPasswordResetOtp(profileForm.email);
      setResetOtpSent(true);
      setResetOtp("");
      setResetNewPassword("");
      setResetConfirmPassword("");
      setResetMessage(result.message || "OTP sent. Please check your email.");
    } catch (error) {
      setResetError(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPasswordWithOtp = async () => {
    setResetError("");
    setResetMessage("");

    if (!/^\d{6}$/.test(resetOtp.trim())) {
      return setResetError("OTP must be 6 digits.");
    }
    if (!PASSWORD_REGEX.test(resetNewPassword)) {
      return setResetError(
        "New password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      );
    }
    if (resetNewPassword !== resetConfirmPassword) {
      return setResetError("New password and confirm password do not match.");
    }

    setResetLoading(true);
    try {
      const result = await resetPasswordWithOtp(
        profileForm.email,
        resetOtp.trim(),
        resetNewPassword,
      );
      setResetOtp("");
      setResetNewPassword("");
      setResetConfirmPassword("");
      setResetOtpSent(false);
      setCurrentPassword("");
      setPasswordMessage(
        result.message || "Password reset successful. Use your new password next time.",
      );
    } catch (error) {
      setResetError(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const closeProfileModal = () => {
    setProfileOpen(false);
    setProfileError("");
    setProfileMessage("");
    setPasswordError("");
    setPasswordMessage("");
    setResetError("");
    setResetMessage("");
  };

  const openLogoutConfirm = () => {
    closeProfileModal();
    setLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = async () => {
    if (!supabase) return;

    setLogoutLoading(true);
    await supabase.auth.signOut();
    setLogoutLoading(false);
    setLogoutConfirmOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="page">
      <header className="topappbar">
        <nav className="topappbar__inner">
          <div className="brand">
            <span className="material-symbols-outlined brand__icon">
              restaurant_menu
            </span>
            <div className="brand__name">
              <span className="brand__name--full">Smart Meal Planner</span>
              <span className="brand__name--short">Meal Planner</span>
            </div>
          </div>

          <div className="topnav">
            <TopNavLink to="/dashboard">Dashboard</TopNavLink>
            <TopNavLink to="/history">History</TopNavLink>
            <TopNavLink to="/saved-plans">Saved</TopNavLink>
            <TopNavLink to="/about">About</TopNavLink>
          </div>

          <div className="topactions">
            <button
              className="iconbtn"
              type="button"
              aria-label="Toggle theme"
              onClick={() => setIsDark((v) => !v)}
              title={isDark ? "Switch to light" : "Switch to dark"}
            >
              <span className="material-symbols-outlined">
                {isDark ? "light_mode" : "dark_mode"}
              </span>
            </button>
            <button
              className="avatar"
              type="button"
              aria-label="Open profile"
              onClick={() => setProfileOpen(true)}
            >
              <AvatarDisplay
                avatarUrl={profileForm.avatarUrl}
                initials={initials}
                className="avatar"
              />
            </button>
            <button
              className="iconbtn iconbtn--logout"
              type="button"
              aria-label="Log out"
              onClick={openLogoutConfirm}
              title="Log out"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </nav>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <footer className="bottomnav">
        <BottomNavLink to="/dashboard" icon="dashboard" label="Dashboard" />
        <BottomNavLink to="/history" icon="history" label="History" />
        <BottomNavLink to="/saved-plans" icon="bookmark" label="Saved" />
        <BottomProfileButton onClick={() => setProfileOpen(true)} />
      </footer>

      {profileOpen ? (
        <div
          className="modalOverlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accountTitle"
        >
          <div className="accountModal glass modalScroll">
            <div className="accountModal__head">
              <div>
                <p className="accountModal__eyebrow">Account settings</p>
                <h3 id="accountTitle" className="accountModal__title">
                  Your Profile
                </h3>
              </div>
              <button
                className="iconbtn"
                type="button"
                aria-label="Close profile"
                onClick={closeProfileModal}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="accountSummary">
              <div className="accountSummary__photo">
                <div className="accountSummary__avatar">
                  <AvatarDisplay
                    avatarUrl={profileForm.avatarUrl}
                    initials={initials}
                    className="accountSummary__avatar"
                  />
                </div>
                <label className="uploadBtn uploadBtn--compact">
                  {avatarUploading ? "Uploading..." : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                  />
                </label>
                {profileForm.avatarUrl ? (
                  <button
                    className="removePhotoBtn"
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={avatarUploading}
                  >
                    Remove Photo
                  </button>
                ) : null}
              </div>
              <div className="accountSummary__info">
                <strong>
                  {[profileForm.firstName, profileForm.lastName]
                    .filter(Boolean)
                    .join(" ") || "Smart Meal Planner User"}
                </strong>
                <p>{profileForm.email}</p>
              </div>
            </div>

            <div className="accountSection">
              <h4 className="accountSection__title">Personal information</h4>
              <div className="formgrid formgrid--2">
                <div className="field">
                  <label className="label" htmlFor="profileFirstName">
                    First Name
                  </label>
                  <input
                    id="profileFirstName"
                    className="input"
                    value={profileForm.firstName}
                    onChange={(event) =>
                      handleProfileChange("firstName", event.target.value)
                    }
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="profileMiddleName">
                    Middle Name
                  </label>
                  <input
                    id="profileMiddleName"
                    className="input"
                    value={profileForm.middleName}
                    onChange={(event) =>
                      handleProfileChange("middleName", event.target.value)
                    }
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="profileLastName">
                    Last Name
                  </label>
                  <input
                    id="profileLastName"
                    className="input"
                    value={profileForm.lastName}
                    onChange={(event) =>
                      handleProfileChange("lastName", event.target.value)
                    }
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="profileSuffix">
                    Suffix <span className="label__hint">optional</span>
                  </label>
                  <input
                    id="profileSuffix"
                    className="input"
                    value={profileForm.suffix}
                    onChange={(event) =>
                      handleProfileChange("suffix", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="profileEmail">
                  Email
                </label>
                <input
                  id="profileEmail"
                  className="input"
                  value={profileForm.email}
                  disabled
                  readOnly
                />
                <p className="helper">
                  Email is connected to your login account, so it cannot be
                  edited here.
                </p>
              </div>

              {profileError ? <div className="error">{profileError}</div> : null}
              {profileMessage ? (
                <div className="success">{profileMessage}</div>
              ) : null}

              <button
                className="primarybtn"
                type="button"
                onClick={handleSaveProfile}
                disabled={profileLoading}
              >
                {profileLoading ? "Saving..." : "Save Profile"}
              </button>
            </div>

            <div className="accountSection">
              <h4 className="accountSection__title">Change password</h4>
              <PasswordField
                id="currentPassword"
                label="Current Password"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  setPasswordError("");
                }}
                show={showCurrentPassword}
                onToggleShow={() => setShowCurrentPassword((value) => !value)}
                autoComplete="current-password"
              />
              <PasswordField
                id="newProfilePassword"
                label="New Password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setPasswordError("");
                }}
                show={showNewPassword}
                onToggleShow={() => setShowNewPassword((value) => !value)}
                autoComplete="new-password"
              />
              <PasswordChecklist password={newPassword} />
              <PasswordField
                id="confirmProfilePassword"
                label="Confirm New Password"
                value={confirmNewPassword}
                onChange={(event) => {
                  setConfirmNewPassword(event.target.value);
                  setPasswordError("");
                }}
                show={showConfirmNewPassword}
                onToggleShow={() => setShowConfirmNewPassword((value) => !value)}
                autoComplete="new-password"
              />
              {confirmNewPassword ? (
                <p
                  className={
                    newPasswordsMatch ? "helper helper--success" : "helper errorText"
                  }
                >
                  {newPasswordsMatch
                    ? "Passwords match."
                    : "Passwords do not match yet."}
                </p>
              ) : null}
              {passwordError ? <div className="error">{passwordError}</div> : null}
              {passwordMessage ? (
                <div className="success">{passwordMessage}</div>
              ) : null}
              <button
                className="primarybtn"
                type="button"
                onClick={handleChangePassword}
                disabled={
                  passwordLoading ||
                  !currentPassword ||
                  !PASSWORD_REGEX.test(newPassword) ||
                  !newPasswordsMatch
                }
              >
                {passwordLoading ? "Changing..." : "Change Password"}
              </button>
            </div>

            <div className="accountSection">
              <h4 className="accountSection__title">Forgot current password?</h4>
              <p className="helper">
                If you cannot remember your current password, send an OTP to
                your email and set a new password.
              </p>
              <button
                className="softbtn softbtn--light"
                type="button"
                onClick={handleSendResetOtp}
                disabled={resetLoading}
              >
                {resetLoading && !resetOtpSent ? "Sending OTP..." : "Send OTP"}
              </button>

              {resetOtpSent ? (
                <div className="accountResetBox">
                  <div className="field">
                    <label className="label" htmlFor="profileResetOtp">
                      Email OTP
                    </label>
                    <input
                      id="profileResetOtp"
                      className="input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6-digit OTP"
                      value={resetOtp}
                      onChange={(event) =>
                        setResetOtp(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                    />
                  </div>
                  <PasswordField
                    id="profileResetNewPassword"
                    label="New Password"
                    value={resetNewPassword}
                    onChange={(event) => setResetNewPassword(event.target.value)}
                    show={showResetNewPassword}
                    onToggleShow={() =>
                      setShowResetNewPassword((value) => !value)
                    }
                    autoComplete="new-password"
                  />
                  <PasswordChecklist password={resetNewPassword} />
                  <PasswordField
                    id="profileResetConfirmPassword"
                    label="Confirm New Password"
                    value={resetConfirmPassword}
                    onChange={(event) =>
                      setResetConfirmPassword(event.target.value)
                    }
                    show={showResetConfirmPassword}
                    onToggleShow={() =>
                      setShowResetConfirmPassword((value) => !value)
                    }
                    autoComplete="new-password"
                  />
                  {resetConfirmPassword ? (
                    <p
                      className={
                        resetPasswordsMatch
                          ? "helper helper--success"
                          : "helper errorText"
                      }
                    >
                      {resetPasswordsMatch
                        ? "Passwords match."
                        : "Passwords do not match yet."}
                    </p>
                  ) : null}
                  <button
                    className="primarybtn"
                    type="button"
                    onClick={handleResetPasswordWithOtp}
                    disabled={
                      resetLoading ||
                      resetOtp.length !== 6 ||
                      !PASSWORD_REGEX.test(resetNewPassword) ||
                      !resetPasswordsMatch
                    }
                  >
                    {resetLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              ) : null}

              {resetError ? <div className="error">{resetError}</div> : null}
              {resetMessage ? <div className="success">{resetMessage}</div> : null}
            </div>

            <div className="accountSection">
              <button
                className="softbtn softbtn--danger accountLogoutBtn"
                type="button"
                onClick={openLogoutConfirm}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  logout
                </span>
                Log Out
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {logoutConfirmOpen ? (
        <div
          className="modalOverlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logoutTitle"
        >
          <div className="confirmModal glass">
            <h3 id="logoutTitle" className="confirmModal__title">
              Log out?
            </h3>
            <p className="confirmModal__text">
              Are you sure you want to log out of your account?
            </p>
            <div className="confirmModal__actions">
              <button
                className="softbtn"
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                disabled={logoutLoading}
              >
                No
              </button>
              <button
                className="softbtn softbtn--danger"
                type="button"
                onClick={handleConfirmLogout}
                disabled={logoutLoading}
              >
                {logoutLoading ? "Logging out..." : "Yes, Log Out"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

