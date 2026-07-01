import assert from "node:assert/strict"
import test from "node:test"
import {
  validateNewPassword,
  validatePasswordResetEmail,
} from "../lib/auth/password-reset-validation.mjs"

test("validates the password reset email without exposing account state", () => {
  assert.equal(validatePasswordResetEmail(""), "Email is required")
  assert.equal(validatePasswordResetEmail("invalid"), "Enter a valid email address")
  assert.equal(validatePasswordResetEmail("trainee@example.com"), "")
})

test("requires an eight-character matching replacement password", () => {
  assert.equal(validateNewPassword("", ""), "New password is required")
  assert.equal(
    validateNewPassword("short", "short"),
    "Password must be at least 8 characters"
  )
  assert.equal(
    validateNewPassword("new-password", "different-password"),
    "Passwords do not match"
  )
  assert.equal(validateNewPassword("new-password", "new-password"), "")
})
