export function getUserFullName(user) {
  if (!user) return "User";

  const metadata = user.user_metadata ?? {};
  const parts = [
    metadata.first_name,
    metadata.middle_name,
    metadata.last_name,
    metadata.suffix,
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  if (parts.length) return parts.join(" ");

  const fullName = String(metadata.full_name || "").trim();
  if (fullName) return fullName;

  return String(user.email || "User").trim();
}
