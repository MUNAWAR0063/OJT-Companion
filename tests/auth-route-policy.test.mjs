import assert from "node:assert/strict"
import test from "node:test"
import {
  authRouteRedirect,
  isAuthEntryRoute,
  isProtectedRoute,
  isPublicAuthRoute,
  loginRedirectPath,
  PROTECTED_ROUTE_PREFIXES,
  safeLoginDestination,
} from "../lib/auth/auth-route-policy.mjs"
import { localAuthFallbackEnabled } from "../lib/auth/auth-env.mjs"

test("marks dashboard and workspace pages as protected", () => {
  for (const route of ["/dashboard", "/competencies", "/settings", "/logout", "/learning/roadmap"]) {
    assert.equal(isProtectedRoute(route), true, `${route} should be protected`)
  }
})

test("keeps all authentication and recovery routes public", () => {
  for (const route of [
    "/login",
    "/register",
    "/signup",
    "/create-account",
    "/auth/signup",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",
    "/auth/confirm",
  ]) {
    assert.equal(isPublicAuthRoute(route), true, `${route} should be public auth route`)
    assert.equal(isProtectedRoute(route), false, `${route} should not be protected`)
  }
})

test("only redirects authenticated users away from auth entry pages", () => {
  for (const route of ["/login", "/register", "/signup", "/create-account", "/forgot-password"]) {
    assert.equal(isAuthEntryRoute(route), true, `${route} should be an auth entry route`)
  }
  for (const route of ["/reset-password", "/auth/callback", "/auth/confirm"]) {
    assert.equal(isAuthEntryRoute(route), false, `${route} must remain available during auth flows`)
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

test("prevents login next parameters from looping to auth pages or external URLs", () => {
  assert.equal(safeLoginDestination("/dashboard"), "/dashboard")
  assert.equal(safeLoginDestination("/equipment?tab=motors"), "/equipment?tab=motors")
  assert.equal(safeLoginDestination("/login"), "/dashboard")
  assert.equal(safeLoginDestination("/register"), "/dashboard")
  assert.equal(safeLoginDestination("//malicious.example"), "/dashboard")
  assert.equal(safeLoginDestination("https://malicious.example"), "/dashboard")
})

test("allows anonymous registration while preserving protected dashboard behavior", () => {
  assert.equal(authRouteRedirect("/login", "", false), null)
  assert.equal(authRouteRedirect("/register", "", false), null)
  assert.equal(authRouteRedirect("/create-account", "", false), null)
  assert.equal(authRouteRedirect("/forgot-password", "", false), null)
  assert.equal(authRouteRedirect("/reset-password", "", false), null)
  assert.equal(authRouteRedirect("/auth/callback", "?code=test", false), null)
  assert.equal(
    authRouteRedirect("/dashboard", "", false),
    "/login?next=%2Fdashboard"
  )
  assert.equal(authRouteRedirect("/login", "", true), "/dashboard")
  assert.equal(authRouteRedirect("/register", "", true), "/dashboard")
  assert.equal(authRouteRedirect("/auth/callback", "?code=test", true), null)
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
