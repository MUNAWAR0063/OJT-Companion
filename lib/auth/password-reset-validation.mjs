export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
}

export function validatePasswordResetEmail(email) {
  if (!String(email).trim()) return "Email is required"
  if (!isValidEmail(email)) return "Enter a valid email address"
  return ""
}

export function validateNewPassword(newPassword, confirmPassword) {
  if (!newPassword) return "New password is required"
  if (newPassword.length < 8) return "Password must be at least 8 characters"
  if (newPassword !== confirmPassword) return "Passwords do not match"
  return ""
}
