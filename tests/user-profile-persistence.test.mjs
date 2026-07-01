import assert from "node:assert/strict"
import test from "node:test"
import { mergeStoredProfile, profileForStorage } from "../lib/user-profile-persistence.mjs"

const defaultProfile = {
  fullName: "OJT Trainee",
  displayName: "",
  email: "",
  phoneNumber: "",
  discipline: "Electrical Engineering Trainee",
  company: "Medco E&P",
  program: "Operations Apprentice Development Program",
  ojtBatch: "OADP 2026",
  bio: "",
  profileImage: "",
  avatarPath: "",
}

test("persists avatar path without storing runtime profile image URLs", () => {
  const stored = profileForStorage({
    ...defaultProfile,
    profileImage: "blob:http://localhost/avatar",
    avatarPath: "user-123/profile/avatar-1720000000000.png",
  })

  assert.equal(stored.profileImage, "")
  assert.equal(stored.avatarPath, "user-123/profile/avatar-1720000000000.png")
})

test("does not restore stale signed or object URLs as profile images", () => {
  const merged = mergeStoredProfile(defaultProfile, {
    displayName: "Trainee",
    profileImage: "https://signed.example/avatar?token=expired",
    avatarPath: "user-123/profile/avatar-1720000000000.png",
  })

  assert.equal(merged.displayName, "Trainee")
  assert.equal(merged.profileImage, "")
  assert.equal(merged.avatarPath, "user-123/profile/avatar-1720000000000.png")
})
