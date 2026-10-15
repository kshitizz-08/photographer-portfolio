#!/usr/bin/env node
/**
 * scripts/testAdminEndToEnd.js
 * ─────────────────────────────────────────────────────────────────────────────
 * End-to-end automated verification for Photographer Admin operations:
 * 1. Admin login & cookie persistence
 * 2. Dashboard stats retrieval
 * 3. Portfolio CRUD, publish/featured toggle, reorder, and public website reflection
 * 4. Gallery CRUD, unique slug generation, photo linking, and public website reflection
 * 5. Services CRUD, publish toggle, and public website reflection
 * 6. Inquiry submission, admin review, status transition, private notes, and deletion
 * 7. Photographer profile update and public website reflection
 */

import "dotenv/config";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@emoharmony.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminEmo2026!";

let cookie = "";
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function run() {
  console.log("\n=======================================================");
  console.log("  EMOHARMONY — ADMIN DASHBOARD & STUDIO E2E TEST SUITE");
  console.log("=======================================================\n");

  // ── 1. Admin Authentication ────────────────────────────────────────────────
  console.log("1. Authenticating Admin Photographer...");
  const loginRes = await fetch(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  cookie = loginRes.headers.get("set-cookie") || "";
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, `Login status 200 (got ${loginRes.status})`);
  assert(loginData.success === true, "Login returns success: true");
  assert(Boolean(cookie), "Session cookie received");

  // ── 2. Dashboard Stats ─────────────────────────────────────────────────────
  console.log("\n2. Checking Dashboard Analytics & Counts...");
  const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
    headers: { cookie },
  });
  const statsData = await statsRes.json();
  assert(statsRes.status === 200, "GET /api/admin/stats returns 200");
  assert(statsData.stats?.photos?.total !== undefined, "Stats includes photos count");
  assert(statsData.stats?.galleries?.total !== undefined, "Stats includes galleries count");
  assert(statsData.stats?.services?.total !== undefined, "Stats includes services count");
  assert(statsData.stats?.inquiries?.total !== undefined, "Stats includes inquiries count");

  // ── 3. Portfolio Management ────────────────────────────────────────────────
  console.log("\n3. Testing Portfolio Management & Public Website Reflection...");
  const testPhotoTitle = `E2E Autumn Wedding ${Date.now()}`;
  const createPhotoRes = await fetch(`${BASE_URL}/admin/portfolio`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      title: testPhotoTitle,
      category: "Wedding",
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      altText: "Autumn wedding ceremony in Napa Valley",
      description: "Sunset wedding ceremony with natural golden light.",
      isFeatured: true,
      isPublished: true,
      location: "Napa Valley, CA",
      year: 2026,
    }),
  });
  const createPhotoData = await createPhotoRes.json();
  assert(createPhotoRes.status === 201, "POST /api/admin/portfolio creates photo (201)");
  const createdPhotoId = createPhotoData.photo?._id;
  assert(Boolean(createdPhotoId), `Created photo ID: ${createdPhotoId}`);

  // Verify reflection on public /api/portfolio
  const publicPortfolioRes = await fetch(`${BASE_URL}/portfolio`);
  const publicPortfolioData = await publicPortfolioRes.json();
  const foundInPublic = publicPortfolioData.photos?.some((p) => p.title === testPhotoTitle);
  assert(foundInPublic, "Created photo is immediately visible on public website (/api/portfolio)");

  // Toggle publish off
  const togglePubRes = await fetch(`${BASE_URL}/admin/portfolio/${createdPhotoId}/publish`, {
    method: "PATCH",
    headers: { cookie },
  });
  const togglePubData = await togglePubRes.json();
  assert(togglePubData.isPublished === false, "Photo published status toggled to false");

  // Verify unpublish is reflected on public website
  const publicPortfolioRes2 = await fetch(`${BASE_URL}/portfolio`);
  const publicPortfolioData2 = await publicPortfolioRes2.json();
  const hiddenInPublic = !publicPortfolioData2.photos?.some((p) => p.title === testPhotoTitle);
  assert(hiddenInPublic, "Unpublished photo is immediately hidden from public website");

  // Toggle featured status
  const toggleFeatRes = await fetch(`${BASE_URL}/admin/portfolio/${createdPhotoId}/featured`, {
    method: "PATCH",
    headers: { cookie },
  });
  const toggleFeatData = await toggleFeatRes.json();
  assert(toggleFeatData.isFeatured === false, "Photo featured status toggled to false");

  // Edit photo
  const editPhotoRes = await fetch(`${BASE_URL}/admin/portfolio/${createdPhotoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      title: `${testPhotoTitle} (Edited)`,
      isPublished: true,
    }),
  });
  const editPhotoData = await editPhotoRes.json();
  assert(editPhotoData.success === true, "PUT /api/admin/portfolio/:id edits photograph");

  // Reorder photos
  const reorderRes = await fetch(`${BASE_URL}/admin/portfolio/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ photoIds: [createdPhotoId] }),
  });
  assert(reorderRes.status === 200, "PUT /api/admin/portfolio/reorder updates photo sequence");

  // Clean up photo
  const deletePhotoRes = await fetch(`${BASE_URL}/admin/portfolio/${createdPhotoId}`, {
    method: "DELETE",
    headers: { cookie },
  });
  assert(deletePhotoRes.status === 200, "DELETE /api/admin/portfolio/:id deletes photo");

  // ── 4. Gallery Management ──────────────────────────────────────────────────
  console.log("\n4. Testing Gallery Management & Shareable Slugs...");
  const testGalleryTitle = `E2E Coastal Romance ${Date.now()}`;
  const createGalRes = await fetch(`${BASE_URL}/admin/galleries`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      title: testGalleryTitle,
      category: "Wedding",
      subtitle: "Intimate cliffside vows",
      description: "An editorial collection photographed along Highway 1.",
      coverImage: {
        imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
        altText: "Couple standing on ocean bluffs",
      },
      location: "Big Sur, CA",
      year: 2026,
      isPublished: true,
    }),
  });
  const createGalData = await createGalRes.json();
  assert(createGalRes.status === 201, "POST /api/admin/galleries creates gallery (201)");
  const createdGal = createGalData.gallery;
  assert(Boolean(createdGal?._id), "Gallery has ID");
  assert(Boolean(createdGal?.slug), `Auto-generated unique slug: ${createdGal?.slug}`);

  // Verify reflection on public /api/galleries and /api/galleries/:slug
  const publicGalRes = await fetch(`${BASE_URL}/galleries`);
  const publicGalData = await publicGalRes.json();
  const foundGalPublic = publicGalData.galleries?.some((g) => g.slug === createdGal.slug);
  assert(foundGalPublic, "Created gallery is visible on public website (/api/galleries)");

  const publicSingleGalRes = await fetch(`${BASE_URL}/galleries/${createdGal.slug}`);
  const publicSingleGalData = await publicSingleGalRes.json();
  assert(publicSingleGalRes.status === 200, "GET /api/galleries/:slug loads single gallery");
  assert(publicSingleGalData.gallery?.title === testGalleryTitle, "Gallery title matches on public page");

  // Toggle publish off
  const toggleGalPubRes = await fetch(`${BASE_URL}/admin/galleries/${createdGal._id}/publish`, {
    method: "PATCH",
    headers: { cookie },
  });
  const toggleGalPubData = await toggleGalPubRes.json();
  assert(toggleGalPubData.isPublished === false, "Gallery published toggled to false");

  // Verify unpublish hides gallery
  const publicGalRes2 = await fetch(`${BASE_URL}/galleries`);
  const publicGalData2 = await publicGalRes2.json();
  const hiddenGalPublic = !publicGalData2.galleries?.some((g) => g.slug === createdGal.slug);
  assert(hiddenGalPublic, "Unpublished gallery is hidden from public website");

  // Clean up gallery
  const deleteGalRes = await fetch(`${BASE_URL}/admin/galleries/${createdGal._id}`, {
    method: "DELETE",
    headers: { cookie },
  });
  assert(deleteGalRes.status === 200, "DELETE /api/admin/galleries/:id deletes gallery");

  // ── 5. Services Management ─────────────────────────────────────────────────
  console.log("\n5. Testing Services Management & Public Website Reflection...");
  const testServiceName = `E2E Destination Elopement ${Date.now()}`;
  const createServiceRes = await fetch(`${BASE_URL}/admin/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      name: testServiceName,
      description: "Comprehensive 2-day elopement storytelling anywhere worldwide.",
      startingPrice: 4800,
      currency: "INR",
      deliverables: "600+ high-res images, 10-year cloud storage, custom print box",
      features: ["All travel expenses included", "Drone aerial coverage", "Online client gallery"],
      isPublished: true,
    }),
  });
  const createServiceData = await createServiceRes.json();
  assert(createServiceRes.status === 201, "POST /api/admin/services creates service package (201)");
  const createdServiceId = createServiceData.service?._id;

  // Verify reflection on public /api/services
  const publicServicesRes = await fetch(`${BASE_URL}/services`);
  const publicServicesData = await publicServicesRes.json();
  const foundServicePublic = publicServicesData.services?.some((s) => s.name === testServiceName);
  assert(foundServicePublic, "Created service is visible on public website (/api/services)");

  // Toggle publish off
  const toggleServPubRes = await fetch(`${BASE_URL}/admin/services/${createdServiceId}/publish`, {
    method: "PATCH",
    headers: { cookie },
  });
  const toggleServPubData = await toggleServPubRes.json();
  assert(toggleServPubData.isPublished === false, "Service published toggled to false");

  // Clean up service
  const deleteServRes = await fetch(`${BASE_URL}/admin/services/${createdServiceId}`, {
    method: "DELETE",
    headers: { cookie },
  });
  assert(deleteServRes.status === 200, "DELETE /api/admin/services/:id deletes service");

  // ── 6. Inquiries Management & Private Notes ────────────────────────────────
  console.log("\n6. Testing Inquiries Management & Private Notes...");
  const clientEmail = `client_${Date.now()}@example.com`;
  const submitInquiryRes = await fetch(`${BASE_URL}/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Sophia Montgomery",
      email: clientEmail,
      phone: "+1 (415) 555-0144",
      shootType: "Wedding",
      preferredDate: "2026-10-24",
      location: "Carmel Valley Ranch",
      budget: "$5,000 - $7,000",
      message: "We adore your natural lighting and documentary style! Looking for full day coverage.",
    }),
  });
  const submitInquiryData = await submitInquiryRes.json();
  assert(submitInquiryRes.status === 201, "POST /api/inquiries submits client lead (201)");
  const referenceId = submitInquiryData.referenceId;
  assert(Boolean(referenceId), `Auto-generated reference ID: ${referenceId}`);

  // Fetch inquiries in admin panel
  const adminInqRes = await fetch(`${BASE_URL}/admin/inquiries?search=${encodeURIComponent(clientEmail)}`, {
    headers: { cookie },
  });
  const adminInqData = await adminInqRes.json();
  assert(adminInqRes.status === 200, "GET /api/admin/inquiries lists inquiries");
  const targetInquiry = adminInqData.inquiries?.find((i) => i.email === clientEmail);
  assert(Boolean(targetInquiry), "Submitted inquiry found in admin inquiries");

  // Update inquiry status
  const updateStatusRes = await fetch(`${BASE_URL}/admin/inquiries/${targetInquiry._id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      status: "replied",
      adminNotes: "Spoke via phone. Quoted $5,500. Sending contract for signature.",
    }),
  });
  const updateStatusData = await updateStatusRes.json();
  assert(updateStatusData.inquiry?.status === "replied", "Inquiry status updated to 'replied'");
  assert(
    updateStatusData.inquiry?.adminNotes === "Spoke via phone. Quoted $5,500. Sending contract for signature.",
    "Private admin note persisted in MongoDB and returned to admin"
  );

  // Delete unwanted inquiry with confirmation
  const deleteInqRes = await fetch(`${BASE_URL}/admin/inquiries/${targetInquiry._id}`, {
    method: "DELETE",
    headers: { cookie },
  });
  assert(deleteInqRes.status === 200, "DELETE /api/admin/inquiries/:id permanently removes inquiry");

  // ── 7. Profile & Settings Management ───────────────────────────────────────
  console.log("\n7. Testing Photographer Profile Settings & Reflection...");
  const newHeroHeading = `Documentary Fine Art Photography ${Date.now()}`;
  const updateProfileRes = await fetch(`${BASE_URL}/admin/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      heroHeading: newHeroHeading,
      privateNotes: "Internal note: Preferred lens 50mm f/1.2; travel passport valid through 2030.",
    }),
  });
  const updateProfileData = await updateProfileRes.json();
  assert(updateProfileRes.status === 200, "PUT /api/admin/profile updates photographer profile");

  // Verify reflection on public /api/photographer
  const publicProfileRes = await fetch(`${BASE_URL}/photographer`);
  const publicProfileData = await publicProfileRes.json();
  assert(
    publicProfileData.photographer?.heroHeading === newHeroHeading,
    "Updated heroHeading is immediately reflected on public website (/api/photographer)"
  );
  assert(
    publicProfileData.photographer?.privateNotes === undefined,
    "Private admin notes are strictly omitted from public API response"
  );

  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n=======================================================");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
