#!/usr/bin/env node
/**
 * scripts/finalQualityCheck.js
 * Comprehensive end-to-end quality check script covering all required workflows.
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import mongoose from "mongoose";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "jalindarpalephotography@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Jalu@9900";

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

async function testJson(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, data, headers: res.headers };
}

async function main() {
  console.log("\n=======================================================");
  console.log("  EMOHARMONY — COMPREHENSIVE FINAL QUALITY CHECK");
  console.log("=======================================================\n");

  // ── 0. Frontend & Backend Availability ────────────────────────────────────
  console.log("── WORKFLOW 0: Infrastructure & Server Availability ────────");
  const beHealth = await testJson(`${BASE_URL}/health`);
  assert(beHealth.status === 200 && beHealth.data.status === "ok", "Backend health endpoint returns 200 ok");
  assert(beHealth.data.database?.state === "connected", "Database connection state is 'connected'");

  const feRes = await fetch(FRONTEND_URL).catch(() => null);
  assert(feRes && feRes.status === 200, "Frontend dev server is running on http://localhost:5173");

  // ── 1. Visitor browses homepage and portfolio ──────────────────────────────
  console.log("\n── WORKFLOW 1: Visitor browses homepage & portfolio ────────");
  const photographerRes = await testJson(`${BASE_URL}/photographer`);
  assert(photographerRes.status === 200, "GET /api/photographer returns 200");
  assert(Boolean(photographerRes.data?.photographer?.name), `Photographer profile loaded: ${photographerRes.data?.photographer?.name}`);
  assert(!photographerRes.data?.photographer?.password, "Sensitive password field is omitted from public profile");
  assert(!photographerRes.data?.photographer?.privateNotes, "Sensitive privateNotes field is omitted from public profile");

  const featuredRes = await testJson(`${BASE_URL}/portfolio/featured`);
  assert(featuredRes.status === 200, "GET /api/portfolio/featured returns 200");
  assert(Array.isArray(featuredRes.data?.photos), "Featured photos returned as an array");

  const publicPortfolioRes = await testJson(`${BASE_URL}/portfolio?page=1&limit=20`);
  assert(publicPortfolioRes.status === 200, "GET /api/portfolio returns 200");
  assert(Array.isArray(publicPortfolioRes.data?.photos), "Public photos returned as an array");
  assert(publicPortfolioRes.data?.total !== undefined, `Total public photographs: ${publicPortfolioRes.data?.total}`);

  const servicesRes = await testJson(`${BASE_URL}/services`);
  assert(servicesRes.status === 200, "GET /api/services returns 200");
  assert(Array.isArray(servicesRes.data?.services) && servicesRes.data.services.length > 0, "Public photography services listed");

  // ── 2. Visitor filters photographs ─────────────────────────────────────────
  console.log("\n── WORKFLOW 2: Visitor filters photographs ──────────────────");
  const weddingFilter = await testJson(`${BASE_URL}/portfolio?category=Wedding`);
  assert(weddingFilter.status === 200, "Category filter 'Wedding' returns 200");
  const allWeddings = weddingFilter.data?.photos?.every(p => p.category === "Wedding");
  assert(allWeddings !== false, "All returned photos in filter match category 'Wedding'");

  const portraitFilter = await testJson(`${BASE_URL}/portfolio?category=Portrait`);
  assert(portraitFilter.status === 200, "Category filter 'Portrait' returns 200");
  const allPortraits = portraitFilter.data?.photos?.every(p => p.category === "Portrait");
  assert(allPortraits !== false, "All returned photos in filter match category 'Portrait'");

  const fashionFilter = await testJson(`${BASE_URL}/portfolio?category=Fashion`);
  assert(fashionFilter.status === 200, "Category filter 'Fashion' returns 200");

  // ── 3. Visitor opens a shared gallery URL directly ─────────────────────────
  console.log("\n── WORKFLOW 3: Visitor opens shared gallery directly ────────");
  const publicGalleriesRes = await testJson(`${BASE_URL}/galleries`);
  assert(publicGalleriesRes.status === 200, "GET /api/galleries returns 200");
  assert(Array.isArray(publicGalleriesRes.data?.galleries), "Curated public galleries array returned");
  
  if (publicGalleriesRes.data?.galleries?.length > 0) {
    const sampleSlug = publicGalleriesRes.data.galleries[0].slug;
    const directGallery = await testJson(`${BASE_URL}/galleries/${sampleSlug}`);
    assert(directGallery.status === 200, `Direct access to gallery slug '/gallery/${sampleSlug}' returns 200`);
    assert(directGallery.data?.gallery?.slug === sampleSlug, "Returned gallery matches requested slug");
    assert(Array.isArray(directGallery.data?.gallery?.photos), "Gallery contains photos array");
  }

  const nonexistentGallery = await testJson(`${BASE_URL}/galleries/nonexistent-gallery-slug-9999`);
  assert(nonexistentGallery.status === 404, "Accessing invalid gallery slug returns 404 cleanly");

  // ── 4. Visitor submits shoot inquiry ───────────────────────────────────────
  console.log("\n── WORKFLOW 4: Visitor submits shoot inquiry ────────────────");
  const testEmail = `client_${Date.now()}@example.com`;
  const inquiryPayload = {
    name: "Sophia & Liam Montgomery",
    email: testEmail,
    phone: "+1 (415) 555-8921",
    shootType: "Wedding",
    eventType: "Wedding",
    preferredDate: "2026-09-18",
    location: "Napa Valley, CA",
    guestCount: 120,
    budget: "$7,500+",
    message: "We adore your documentary style and natural light approach. We would love to book you for our September wedding!",
    preferredContact: "email"
  };

  const submitInquiry = await testJson(`${BASE_URL}/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inquiryPayload)
  });
  assert(submitInquiry.status === 201, "POST /api/inquiries returns 201 Created");
  assert(submitInquiry.data?.success === true, "Inquiry submission response indicates success");
  const createdRefId = submitInquiry.data?.referenceId || submitInquiry.data?.inquiry?.referenceId;
  assert(Boolean(createdRefId), `Generated inquiry reference ID: ${createdRefId}`);

  // Validation test: missing required fields
  const invalidInquiry = await testJson(`${BASE_URL}/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Incomplete" })
  });
  assert(invalidInquiry.status === 422, "Validation check: Submitting missing fields rejected with 422 Unprocessable Entity");

  // ── 5. Inquiry stored in MongoDB ───────────────────────────────────────────
  console.log("\n── WORKFLOW 5: Inquiry persistence in MongoDB ───────────────");
  await mongoose.connect(process.env.MONGODB_URI);
  const foundInDb = await mongoose.connection.collection("inquiries").findOne({ email: testEmail });
  assert(Boolean(foundInDb), "Inquiry document successfully located in MongoDB inquiries collection");
  assert(foundInDb?.referenceId === createdRefId, "Persisted inquiry reference ID matches response");
  assert(foundInDb?.status === "new", "Initial inquiry status defaults to 'new'");

  // ── 6. Photographer logs in securely ───────────────────────────────────────
  console.log("\n── WORKFLOW 6: Secure Admin Authentication ──────────────────");
  // Test invalid login
  const invalidLogin = await testJson(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: "WrongPassword999!" })
  });
  assert(invalidLogin.status === 401, "Invalid password correctly rejected with 401 Unauthorized");

  // Test valid login
  const validLoginRes = await fetch(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  cookie = validLoginRes.headers.get("set-cookie") || "";
  assert(validLoginRes.status === 200, "Valid credentials accepted with 200 OK");
  assert(Boolean(cookie), "Secure HTTP-only session cookie set in headers");
  assert(cookie.includes("HttpOnly") || cookie.includes("httponly"), "Cookie specifies HttpOnly attribute");

  // Verify session /api/admin/me
  const meRes = await testJson(`${BASE_URL}/admin/me`, { headers: { cookie } });
  assert(meRes.status === 200, "GET /api/admin/me verifies active session");
  assert(meRes.data?.photographer?.email === ADMIN_EMAIL, "Returned session belongs to authorized photographer");

  // ── 7. Photographer manages portfolio (Create, Edit, Publish, Delete) ───────
  console.log("\n── WORKFLOW 7: Photographer Portfolio Management ────────────");
  const newPhoto = await testJson(`${BASE_URL}/admin/portfolio`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      title: "Quality Check Golden Hour Shoot",
      category: "Wedding",
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=80",
      altText: "Golden hour bride and groom portrait in open field",
      description: "Sunset romance in golden hour lighting",
      isFeatured: true,
      isPublished: true,
      sortOrder: 1
    })
  });
  assert(newPhoto.status === 201, "POST /api/admin/portfolio creates photograph (201)");
  const photoId = newPhoto.data?.photo?._id;
  assert(Boolean(photoId), `Created photo ID: ${photoId}`);

  // Verify it appears on public portfolio
  const checkPublicPhoto = await testJson(`${BASE_URL}/portfolio`);
  const foundInPublic = checkPublicPhoto.data?.photos?.some(p => p._id === photoId);
  assert(foundInPublic === true, "New photograph immediately visible on public website");

  // Toggle publish off
  const unpublishPhoto = await testJson(`${BASE_URL}/admin/portfolio/${photoId}/publish`, {
    method: "PATCH",
    headers: { cookie }
  });
  assert(unpublishPhoto.status === 200, "PATCH toggle publish status succeeds");
  const checkPublicAfterUnpublish = await testJson(`${BASE_URL}/portfolio`);
  const foundAfterUnpublish = checkPublicAfterUnpublish.data?.photos?.some(p => p._id === photoId);
  assert(foundAfterUnpublish === false, "Unpublished photograph immediately hidden from public visitors");

  // Edit photograph
  const editPhoto = await testJson(`${BASE_URL}/admin/portfolio/${photoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      title: "Updated QC Golden Hour Portrait",
      category: "Portrait",
      description: "Updated description caption"
    })
  });
  assert(editPhoto.status === 200, "PUT /api/admin/portfolio/:id edits photograph title & category");

  // Delete test photograph
  const deletePhoto = await testJson(`${BASE_URL}/admin/portfolio/${photoId}`, {
    method: "DELETE",
    headers: { cookie }
  });
  assert(deletePhoto.status === 200, "DELETE /api/admin/portfolio/:id removes photograph");

  // ── 8. Photographer creates and shares gallery ─────────────────────────────
  console.log("\n── WORKFLOW 8: Photographer Gallery Management ──────────────");
  const uniqueSlug = `qc-gallery-${Date.now()}`;
  const newGallery = await testJson(`${BASE_URL}/admin/galleries`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      title: "Coastal Sunset Romance QC",
      category: "Wedding",
      slug: uniqueSlug,
      description: "Editorial seaside gallery created for quality verification.",
      coverImage: {
        imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600&auto=format&fit=crop&q=80",
        altText: "Seaside cliff vows"
      },
      isPublished: true,
      photos: []
    })
  });
  assert(newGallery.status === 201, "POST /api/admin/galleries creates gallery (201)");
  const galleryId = newGallery.data?.gallery?._id;
  const gallerySlug = newGallery.data?.gallery?.slug;
  assert(Boolean(galleryId), `Gallery created with ID: ${galleryId}`);

  // Verify public direct link access
  const checkPublicGallery = await testJson(`${BASE_URL}/galleries/${gallerySlug}`);
  assert(checkPublicGallery.status === 200, `Public visitors can open shared gallery link '/gallery/${gallerySlug}'`);

  // Delete test gallery
  const deleteGallery = await testJson(`${BASE_URL}/admin/galleries/${galleryId}`, {
    method: "DELETE",
    headers: { cookie }
  });
  assert(deleteGallery.status === 200, "DELETE /api/admin/galleries/:id removes gallery");

  // ── 9. Photographer views and updates client inquiries ─────────────────────
  console.log("\n── WORKFLOW 9: Photographer Inquiries Management ────────────");
  const listInquiries = await testJson(`${BASE_URL}/admin/inquiries`, { headers: { cookie } });
  assert(listInquiries.status === 200, "GET /api/admin/inquiries lists client inquiries");
  const foundSubmitted = listInquiries.data?.inquiries?.find(i => i.referenceId === createdRefId);
  assert(Boolean(foundSubmitted), "Previously submitted client inquiry found in admin inquiries list");
  const targetInquiryId = foundSubmitted?._id;

  if (targetInquiryId) {
    // Update inquiry status and add private notes
    const updateInquiry = await testJson(`${BASE_URL}/admin/inquiries/${targetInquiryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        status: "replied",
        adminNotes: "Client reached out via phone. Sent wedding package brochure."
      })
    });
    assert(updateInquiry.status === 200, "PATCH /api/admin/inquiries/:id updates status to 'replied'");
    assert(updateInquiry.data?.inquiry?.adminNotes?.includes("brochure"), "Private admin note persisted in MongoDB");

    // Clean up test inquiry
    const deleteInquiry = await testJson(`${BASE_URL}/admin/inquiries/${targetInquiryId}`, {
      method: "DELETE",
      headers: { cookie }
    });
    assert(deleteInquiry.status === 200, "DELETE /api/admin/inquiries/:id deletes inquiry cleanly");
  }

  // ── 10. Unauthenticated Access Control on Protected Endpoints ───────────────
  console.log("\n── WORKFLOW 10: Access Control on Protected Endpoints ────────");
  const protectedEndpoints = [
    { method: "GET", path: "/admin/me" },
    { method: "GET", path: "/admin/stats" },
    { method: "GET", path: "/admin/inquiries" },
    { method: "GET", path: "/admin/profile" },
    { method: "POST", path: "/admin/portfolio" },
    { method: "POST", path: "/admin/galleries" },
    { method: "POST", path: "/admin/services" },
    { method: "PUT", path: "/admin/profile" }
  ];

  for (const ep of protectedEndpoints) {
    const res = await testJson(`${BASE_URL}${ep.path}`, { method: ep.method });
    assert(res.status === 401, `Unauthenticated ${ep.method} ${ep.path} strictly rejected with 401 Unauthorized`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n=======================================================");
  console.log(`  QUALITY CHECK COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================");

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Quality check failed with unexpected exception:", err);
  process.exit(1);
});
