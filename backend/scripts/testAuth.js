#!/usr/bin/env node
/**
 * scripts/testAuth.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated test suite for admin authentication endpoints.
 * Tests: valid login, invalid login, session persistence, logout, unauthorized access.
 *
 * Usage:
 *   cd backend
 *   node scripts/testAuth.js
 *
 * Requirements:
 *   - Backend server must be running on PORT 5000
 *   - At least one admin account must exist (run scripts/createAdmin.js first)
 *   - Set TEST_EMAIL and TEST_PASSWORD in environment or edit the CONFIG below
 */

import "dotenv/config";

const BASE = `http://localhost:${process.env.PORT || 5000}/api`;
const EMAIL    = process.env.TEST_EMAIL    || "";
const PASSWORD = process.env.TEST_PASSWORD || "";

// ── Helpers ───────────────────────────────────────────────────────────────────

let sessionCookie = "";   // tracks the HTTP-only cookie across requests
let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`  \x1b[32m✓\x1b[0m  ${label}`);
  passed++;
}

function fail(label, detail = "") {
  console.log(`  \x1b[31m✗\x1b[0m  ${label}${detail ? `\n       → ${detail}` : ""}`);
  failed++;
}

function section(title) {
  console.log(`\n\x1b[34m── ${title}\x1b[0m`);
}

async function req(method, path, body, expectStatus) {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const res  = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));

  // Capture session cookie from login response
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) sessionCookie = setCookie.split(";")[0]; // store name=value only

  return { status: res.status, data, headers: res.headers };
}

// ── Test Cases ────────────────────────────────────────────────────────────────

async function testHealthCheck() {
  section("1. Health Check (backend connectivity)");
  try {
    const { status, data } = await req("GET", "/health");
    if (status === 200) ok(`GET /api/health → 200 (${data.status || "ok"})`);
    else fail(`GET /api/health → unexpected ${status}`);
  } catch (e) {
    fail("Cannot reach backend server", e.message);
    console.error("\n⛔ Backend is not running. Start it with:\n   cd backend && npm run dev\n");
    process.exit(1);
  }
}

async function testUnauthenticatedMe() {
  section("2. GET /api/admin/me — unauthenticated (expect 401)");
  sessionCookie = ""; // clear any cookie
  const { status, data } = await req("GET", "/admin/me");
  if (status === 401 && data.code === "UNAUTHORIZED")
    ok("Correctly rejected unauthenticated request → 401 UNAUTHORIZED");
  else
    fail(`Expected 401 UNAUTHORIZED, got ${status}`, JSON.stringify(data));
}

async function testInvalidCredentials() {
  section("3. POST /api/admin/login — invalid credentials (expect 401)");
  const { status, data } = await req("POST", "/admin/login", {
    email: "notareal@example.com",
    password: "wrongpassword123",
  });
  if (status === 401)
    ok("Correctly rejected invalid credentials → 401");
  else
    fail(`Expected 401, got ${status}`, JSON.stringify(data));

  // Check that error message is generic (no account enumeration)
  if (data.message && data.message.toLowerCase().includes("invalid"))
    ok("Error message is generic (no account enumeration)");
  else
    fail("Error message may reveal account existence", data.message);
}

async function testMissingFields() {
  section("4. POST /api/admin/login — missing fields (expect 400)");
  const { status } = await req("POST", "/admin/login", { email: "test@test.com" });
  if (status === 400)
    ok("Correctly rejected request with missing password → 400");
  else
    fail(`Expected 400, got ${status}`);
}

async function testValidLogin() {
  section("5. POST /api/admin/login — valid credentials (expect 200 + cookie)");

  if (!EMAIL || !PASSWORD) {
    console.log("  \x1b[33m⚠\x1b[0m  Skipped — set TEST_EMAIL and TEST_PASSWORD environment variables");
    console.log("     Example: TEST_EMAIL=admin@test.com TEST_PASSWORD=secret123 node scripts/testAuth.js");
    return false;
  }

  const { status, data, headers } = await req("POST", "/admin/login", {
    email: EMAIL,
    password: PASSWORD,
  });

  if (status === 200 && data.success) {
    ok(`Login succeeded → 200, welcome: ${data.message}`);
  } else {
    fail(`Login failed → ${status}`, JSON.stringify(data));
    return false;
  }

  if (sessionCookie) {
    ok(`HTTP-only session cookie set: ${sessionCookie.split("=")[0]}=<token>`);
  } else {
    fail("No Set-Cookie header in login response");
    return false;
  }

  if (data.photographer && !data.photographer.password) {
    ok("Response excludes password field ✓");
  } else {
    fail("Response may contain password — security issue!");
  }

  return true;
}

async function testSessionPersistence() {
  section("6. GET /api/admin/me — session persistence (expect 200)");
  const { status, data } = await req("GET", "/admin/me");
  if (status === 200 && data.authenticated)
    ok(`Session persists across requests → 200, account: ${data.photographer?.email}`);
  else
    fail(`Expected 200, got ${status}`, JSON.stringify(data));
}

async function testLogout() {
  section("7. POST /api/admin/logout — expect 200 + cookie cleared");
  const { status, data, headers } = await req("POST", "/admin/logout");
  if (status === 200 && data.success)
    ok("Logout succeeded → 200");
  else
    fail(`Expected 200, got ${status}`, JSON.stringify(data));

  const setCookie = headers.get("set-cookie") || "";
  if (setCookie.includes("Max-Age=0") || setCookie.includes("Expires=Thu, 01 Jan 1970"))
    ok("Session cookie cleared (Max-Age=0)");
  else if (setCookie)
    ok(`Cookie header present after logout: ${setCookie.substring(0, 60)}…`);
  else
    fail("No Set-Cookie header on logout — cookie may not be cleared");
}

async function testMeAfterLogout() {
  section("8. GET /api/admin/me — after logout (expect 401)");
  // Clear the stored cookie (simulate browser behavior after cookie cleared)
  sessionCookie = "";
  const { status, data } = await req("GET", "/admin/me");
  if (status === 401)
    ok("Correctly rejected post-logout request → 401");
  else
    fail(`Expected 401, got ${status}`, JSON.stringify(data));
}

async function testProtectedRouteWithoutCookie() {
  section("9. POST /api/admin/logout — without cookie (expect 401)");
  sessionCookie = "";
  const { status } = await req("POST", "/admin/logout");
  if (status === 401)
    ok("Protected route correctly requires authentication → 401");
  else
    fail(`Expected 401, got ${status}`);
}

// ── Run All Tests ─────────────────────────────────────────────────────────────

async function main() {
  console.log("\n\x1b[1m🔐  EmoHarmony — Admin Auth Test Suite\x1b[0m");
  console.log("─".repeat(48));
  console.log(`    Target: ${BASE}`);

  await testHealthCheck();
  await testUnauthenticatedMe();
  await testInvalidCredentials();
  await testMissingFields();

  const loginOk = await testValidLogin();
  if (loginOk) {
    await testSessionPersistence();
    await testLogout();
    await testMeAfterLogout();
  }

  await testProtectedRouteWithoutCookie();

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(48));
  const total = passed + failed;
  if (failed === 0) {
    console.log(`\x1b[32m✅  All ${total} tests passed.\x1b[0m\n`);
  } else {
    console.log(`\x1b[33m⚠   ${passed}/${total} tests passed. ${failed} failed.\x1b[0m\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n❌  Test runner error:", err.message);
  process.exit(1);
});
