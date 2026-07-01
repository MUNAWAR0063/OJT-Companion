import assert from "node:assert/strict"
import test from "node:test"
import {
  isProtectedRoute,
  isPublicAuthRoute,
  loginRedirectPath,
  PROTECTED_ROUTE_PREFIXES,
} from "../lib/auth/auth-route-policy.mjs"
import { localAuthFallbackEnabled } from "../lib/auth/auth-env.mjs"

test("marks dashboard and workspace pages as protected", () => {
  for (const route of ["/dashboard", "/competencies", "/settings", "/logout", "/learning/roadmap"]) {
    assert.equal(isProtectedRoute(route), true, `${route} should be protected`)
  }
})

test("keeps login, register, and forgot password public", () => {
  for (const route of ["/login", "/register", "/forgot-password"]) {
    assert.equal(isPublicAuthRoute(route), true, `${route} should be public auth route`)
    assert.equal(isProtectedRoute(route), false, `${route} should not be protected`)
  }
})

test("does not protect marketing and legal pages", () => {
  for (const route of ["/", "/about", "/protection-policy"]) {
    assert.equal(isProtectedRoute(route), false, `${route} should remain public`)
  }
})

test("builds login redirect with original protected destination", () => {
  assert.equal(
    loginRedirectPath("/dashboard", "?tab=today"),
    "/login?next=%2Fdashboard%3Ftab%3Dtoday"
  )
})

test("protected route list includes no public auth routes", () => {
  for (const route of PROTECTED_ROUTE_PREFIXES) {
    assert.equal(isPublicAuthRoute(route), false, `${route} overlaps public auth routes`)
  }
})

test("disables local auth fallback in production even when Supabase is not configured", () => {
  assert.equal(localAuthFallbackEnabled(false, "production"), false)
  assert.equal(localAuthFallbackEnabled(false, "development"), true)
  assert.equal(localAuthFallbackEnabled(true, "development"), false)
})
