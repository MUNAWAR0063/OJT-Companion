import assert from "node:assert/strict"
import test from "node:test"
import {
  PRODUCTION_SITE_URL,
  buildAuthCallbackUrl,
  normalizeSiteUrl,
  safeAuthNext,
} from "../lib/auth/auth-url.mjs"

test("uses the Vercel production domain when no site URL is configured", () => {
  assert.equal(normalizeSiteUrl(undefined), PRODUCTION_SITE_URL)
  assert.equal(normalizeSiteUrl(""), PRODUCTION_SITE_URL)
})

test("normalizes configured site URLs without changing their origin", () => {
  assert.equal(normalizeSiteUrl("https://ojt-companion.vercel.app/"), PRODUCTION_SITE_URL)
  assert.equal(normalizeSiteUrl("http://localhost:3000/"), "http://localhost:3000")
})

test("only permits internal callback destinations", () => {
  assert.equal(safeAuthNext("/reset-password"), "/reset-password")
  assert.equal(safeAuthNext("/login?next=%2Fdashboard"), "/login?next=%2Fdashboard")
  assert.equal(safeAuthNext("https://malicious.example"), "/dashboard")
  assert.equal(safeAuthNext("//malicious.example"), "/dashboard")
  assert.equal(safeAuthNext("/\\malicious.example"), "/dashboard")
})

test("builds a production callback URL that preserves the intended destination", () => {
  const callback = new URL(
    buildAuthCallbackUrl(
      PRODUCTION_SITE_URL,
      "/login?next=%2Fdashboard",
      "verification"
    )
  )

  assert.equal(callback.origin, PRODUCTION_SITE_URL)
  assert.equal(callback.pathname, "/auth/callback")
  assert.equal(callback.searchParams.get("next"), "/login?next=%2Fdashboard")
  assert.equal(callback.searchParams.get("flow"), "verification")
})

test("builds the reset-password callback on the production domain", () => {
  const callback = new URL(
    buildAuthCallbackUrl(PRODUCTION_SITE_URL, "/reset-password", "recovery")
  )

  assert.equal(
    callback.toString(),
    "https://ojt-companion.vercel.app/auth/callback?next=%2Freset-password&flow=recovery"
  )
})
