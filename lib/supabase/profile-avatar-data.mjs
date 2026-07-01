export function avatarPathFromProfileData(profileData) {
  if (!profileData || typeof profileData !== "object") return ""

  if (typeof profileData.avatar_path === "string" && profileData.avatar_path) {
    return profileData.avatar_path
  }

  const nestedPath = profileData.state?.profile?.avatarPath
  return typeof nestedPath === "string" ? nestedPath : ""
}
