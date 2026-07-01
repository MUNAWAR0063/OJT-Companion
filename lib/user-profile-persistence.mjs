export function profileForStorage(profile) {
  return {
    ...profile,
    profileImage: "",
  }
}

export function mergeStoredProfile(defaultProfile, persistedProfile) {
  return {
    ...defaultProfile,
    ...(persistedProfile ?? {}),
    profileImage: "",
  }
}
