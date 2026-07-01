export function localAuthFallbackEnabled(isSupabaseConfigured, nodeEnv) {
  return !isSupabaseConfigured && nodeEnv !== "production"
}
