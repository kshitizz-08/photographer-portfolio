import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Link2,
  Send,
  CheckCircle,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { useProfile } from "../context/ProfileContext";
import { submitInquiry } from "../services/api";

const SHOOT_TYPES = [
  "Wedding",
  "Pre-Wedding",
  "Portrait / Headshots",
  "Family & Lifestyle",
  "Editorial / Commercial",
  "Events",
  "Other",
];

const BUDGET_OPTIONS = [
  "Under ₹1,00,000",
  "₹1,00,000 – ₹2,50,000",
  "₹2,50,000 – ₹5,00,000",
  "₹5,00,000 – ₹10,00,000",
  "₹10,00,000+",
  "Flexible / To be discussed",
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  shootType: "",
  preferredDate: "",
  location: "",
  budget: "",
  message: "",
};

export default function Contact() {
  const { profile } = useProfile();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState(null);
  const [serverError, setServerError] = useState("");
  const [copiedRef, setCopiedRef] = useState(false);

  // Pre-fill session type or reference gallery from URL query parameters
  useEffect(() => {
    const prefillType = searchParams.get("eventType") || searchParams.get("shootType");
    const prefillRef = searchParams.get("ref");
    if (prefillType || prefillRef) {
      setForm((prev) => ({
        ...prev,
        shootType: prefillType || prev.shootType,
        message: prefillRef
          ? `Hi Jalindar, I saw your "${prefillRef}" gallery and would love to discuss a similar shoot!`
          : prev.message,
      }));
    }
  }, [searchParams]);

  // Client-side validation before sending request
  const validate = () => {
    const e = {};
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedMessage = form.message.trim();

    if (!trimmedName) {
      e.name = "Your name is required.";
    } else if (trimmedName.length < 2) {
      e.name = "Name must be at least 2 characters.";
    } else if (trimmedName.length > 120) {
      e.name = "Name must be 120 characters or fewer.";
    }

    if (!trimmedEmail) {
      e.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      e.email = "Please provide a valid email address.";
    }

    if (!form.shootType) {
      e.shootType = "Please select a shoot type.";
    }

    if (!trimmedMessage) {
      e.message = "A message explaining your vision is required.";
    } else if (trimmedMessage.length < 10) {
      e.message = "Please share a few more details (minimum 10 characters).";
    } else if (trimmedMessage.length > 3000) {
      e.message = "Message must be 3,000 characters or fewer.";
    }

    if (form.phone && form.phone.trim().length > 30) {
      e.phone = "Phone number must be 30 characters or fewer.";
    }

    if (form.location && form.location.trim().length > 200) {
      e.location = "Location must be 200 characters or fewer.";
    }

    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (serverError) setServerError("");
  };

  const handleCopyReference = useCallback(async (refId) => {
    try {
      await navigator.clipboard.writeText(refId);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    } catch {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions caused by rapid clicks
    if (submitting) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to the first error
      const firstErrorField = Object.keys(validationErrors)[0];
      document.getElementById(`contact-${firstErrorField}`)?.focus();
      return;
    }

    setSubmitting(true);
    setServerError("");

    try {
      const response = await submitInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        shootType: form.shootType,
        preferredDate: form.preferredDate,
        location: form.location.trim(),
        budget: form.budget,
        message: form.message.trim(),
        referenceGallery: searchParams.get("ref") || undefined,
      });

      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to submit inquiry.");
      }

      // Store inquiry details for thank-you display
      setSubmittedInquiry({
        referenceId: response.referenceId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        shootType: form.shootType,
        preferredDate: form.preferredDate,
        location: form.location.trim(),
        budget: form.budget,
        createdAt: new Date().toISOString(),
      });

      setForm(EMPTY_FORM);
    } catch (err) {
      console.error("[Contact Page] Submission error:", err);
      setServerError(
        err.message ||
          "We could not save your inquiry at this moment. Please check your internet connection or email directly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full border-b ${
      errors[field] ? "border-red-400" : "border-[#E0DDD8]"
    } bg-transparent py-3 text-sm text-[#141414] placeholder:text-[#aaa] focus:outline-none focus:border-[#141414] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <main className="pt-32 pb-28">
      {/* ── Page Header ── */}
      <section className="max-w-7xl mx-auto px-6 mb-16" aria-labelledby="contact-heading">
        <p className="text-xs tracking-[0.3em] uppercase text-[#6b6b6b] mb-3">Shoot Inquiries</p>
        <h1 id="contact-heading" className="font-serif text-5xl md:text-6xl text-[#141414] mb-6">
          Let&rsquo;s Talk
        </h1>
        <div className="w-12 h-px bg-[#C4A882]" />
      </section>

      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-16 lg:gap-20">
          {/* ── Sidebar Contact info ── */}
          <aside className="md:col-span-2 flex flex-col gap-10">
            <p className="text-[#6b6b6b] leading-relaxed">
              Every shoot is approached with care, curiosity, and artistic intention. Complete the inquiry
              form with your date and vision, and {profile.name || "I"} will reply within 48 hours with availability and
              investment details.
            </p>

            <div className="flex flex-col gap-6">
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-4 group"
              >
                <div className="w-10 h-10 border border-[#E0DDD8] flex items-center justify-center group-hover:border-[#141414] transition-colors">
                  <Mail size={16} className="text-[#6b6b6b]" />
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-[#6b6b6b] mb-0.5">Email</p>
                  <p className="text-sm text-[#141414]">{profile.email}</p>
                </div>
              </a>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-[#E0DDD8] flex items-center justify-center">
                  <Phone size={16} className="text-[#6b6b6b]" />
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-[#6b6b6b] mb-0.5">Phone</p>
                  <p className="text-sm text-[#141414]">{profile.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-[#E0DDD8] flex items-center justify-center">
                  <MapPin size={16} className="text-[#6b6b6b]" />
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-[#6b6b6b] mb-0.5">Based In</p>
                  <p className="text-sm text-[#141414]">{profile.location}</p>
                </div>
              </div>
            </div>

            {/* Social links */}
            <div className="border-t border-[#E0DDD8] pt-8">
              <p className="text-xs tracking-widest uppercase text-[#6b6b6b] mb-4">Follow Along</p>
              <div className="flex items-center gap-5">
                <a
                  href="https://www.instagram.com/jalindar_pale_photography"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex items-center gap-2 text-sm text-[#6b6b6b] hover:text-[#E1306C] transition-colors group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#E1306C]">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                  </svg>
                  Instagram
                </a>
                <a
                  href="https://wa.me/918408031390"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex items-center gap-2 text-sm text-[#6b6b6b] hover:text-[#25D366] transition-colors group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#25D366]">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </aside>

          {/* ── Main Form or Thank You State ── */}
          <div className="md:col-span-3">
            {submittedInquiry ? (
              /* ── Professional Thank You State ── */
              <div
                id="inquiry-success-card"
                className="border border-[#E0DDD8] bg-[#FDFCFB] p-8 sm:p-12 text-left"
                aria-live="polite"
              >
                <div className="flex items-center gap-3 text-[#C4A882] mb-4">
                  <CheckCircle size={32} />
                  <span className="text-xs tracking-[0.25em] uppercase text-[#6b6b6b]">
                    Inquiry Confirmed
                  </span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl text-[#141414] mb-3">
                  Thank You, {submittedInquiry.name}
                </h2>

                <p className="text-[#6b6b6b] text-sm leading-relaxed mb-8">
                  Your inquiry has been successfully recorded in our studio database. Jalindar personally
                  reviews every shoot brief and will be in touch within 48 hours at{" "}
                  <strong className="text-[#141414] font-medium">{submittedInquiry.email}</strong>.
                </p>

                {/* Reference ID Banner */}
                <div className="bg-[#F5F2EB] border border-[#E8E4DC] p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] tracking-widest uppercase text-[#888] mb-1">
                      Inquiry Reference Number
                    </p>
                    <p className="font-mono text-lg font-semibold text-[#141414] tracking-wide">
                      {submittedInquiry.referenceId}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyReference(submittedInquiry.referenceId)}
                    id="copy-reference-btn"
                    className="inline-flex items-center gap-2 border border-[#141414] px-4 py-2 text-xs tracking-widest uppercase text-[#141414] hover:bg-[#141414] hover:text-[#FAF9F7] transition-all self-start sm:self-auto"
                    aria-label="Copy inquiry reference number"
                  >
                    {copiedRef ? <Check size={13} className="text-[#C4A882]" /> : <Copy size={13} />}
                    {copiedRef ? "Copied" : "Copy Reference"}
                  </button>
                </div>

                {/* Summary Table */}
                <div className="border border-[#E0DDD8] divide-y divide-[#E0DDD8] text-xs mb-8">
                  <div className="flex justify-between py-2.5 px-4 bg-[#FAF9F7]">
                    <span className="text-[#888] uppercase tracking-wider">Shoot Type</span>
                    <span className="font-medium text-[#141414]">{submittedInquiry.shootType}</span>
                  </div>
                  {submittedInquiry.preferredDate && (
                    <div className="flex justify-between py-2.5 px-4">
                      <span className="text-[#888] uppercase tracking-wider">Preferred Date</span>
                      <span className="font-medium text-[#141414]">{submittedInquiry.preferredDate}</span>
                    </div>
                  )}
                  {submittedInquiry.location && (
                    <div className="flex justify-between py-2.5 px-4 bg-[#FAF9F7]">
                      <span className="text-[#888] uppercase tracking-wider">Location</span>
                      <span className="font-medium text-[#141414]">{submittedInquiry.location}</span>
                    </div>
                  )}
                  {submittedInquiry.budget && (
                    <div className="flex justify-between py-2.5 px-4">
                      <span className="text-[#888] uppercase tracking-wider">Estimated Budget</span>
                      <span className="font-medium text-[#141414]">{submittedInquiry.budget}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-[#E0DDD8]">
                  <div className="flex items-center gap-2 text-xs text-[#888]">
                    <Clock size={14} className="text-[#C4A882]" />
                    <span>Response time: Under 48 hours</span>
                  </div>

                  <button
                    onClick={() => {
                      setSubmittedInquiry(null);
                      setServerError("");
                    }}
                    id="submit-another-inquiry-btn"
                    className="text-xs tracking-widest uppercase border-b border-[#141414] pb-0.5 text-[#141414] hover:text-[#C4A882] hover:border-[#C4A882] transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              /* ── Inquiry Submission Form ── */
              <form
                id="contact-form"
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-8"
                aria-label="Photography inquiry form"
              >
                {/* Server Error Notice */}
                {serverError && (
                  <div
                    role="alert"
                    className="p-4 border border-red-300 bg-red-50/70 text-red-700 text-xs flex items-start gap-3 leading-relaxed"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Submission could not be completed</p>
                      <p className="mt-0.5">{serverError}</p>
                    </div>
                  </div>
                )}

                {/* Row 1: Client Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="text-xs tracking-widest uppercase text-[#6b6b6b] block mb-2"
                    >
                      Client Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      disabled={submitting}
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className={inputClass("name")}
                      aria-required="true"
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="text-xs tracking-widest uppercase text-[#6b6b6b] block mb-2"
                    >
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      disabled={submitting}
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className={inputClass("email")}
                      aria-required="true"
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                </div>

                {/* Row 2: Phone & Shoot Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="text-xs tracking-widest uppercase text-[#6b6b6b] block mb-2"
                    >
                      Phone Number <span className="text-[#aaa] text-[10px] lowercase">(optional)</span>
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      disabled={submitting}
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className={inputClass("phone")}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-shootType"
                      className="text-xs tracking-widest uppercase text-[#6b6b6b] block mb-2"
                    >
                      Shoot Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="contact-shootType"
                      name="shootType"
                      disabled={submitting}
                      value={form.shootType}
                      onChange={handleChange}
                      className={`${inputClass("shootType")} appearance-none cursor-pointer`}
                      aria-required="true"
                    >
                      <option value="">Select a shoot type…</option>
                      {SHOOT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    {errors.shootType && (
                      <p className="text-xs text-red-500 mt-1">{errors.shootType}</p>
                    )}
                  </div>
                </div>

                {/* Row 3: Preferred Shoot Date & Shoot Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label
                      htmlFor="contact-preferredDate"
                      className="text-xs tracking-widest uppercase text-[#6b6b6b] block mb-2"
                    >
                      Preferred Shoot Date <span className="text-[#aaa] text-[10px] lowercase">(optional)</span>
                    </label>
                    <input
                      id="contact-preferredDate"
                      name="preferredDate"
                      type="date"
                      disabled={submitting}
                      value={form.preferredDate}
                      onChange={handleChange}
                      className={inputClass("preferredDate")}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-location"
                      className="text-xs tracking-widest uppercase text-[#6b6b6b] block mb-2"
                    >
                      Shoot Location <span className="text-[#aaa] text-[10px] lowercase">(optional)</span>
                    </label>
                    <input
                      id="contact-location"
                      name="location"
                      type="text"
                      disabled={submitting}
                      value={form.location}
                      onChange={handleChange}
                      placeholder="City, venue, or country"
                      className={inputClass("location")}
                    />
                    {errors.location && (
                      <p className="text-xs text-red-500 mt-1">{errors.location}</p>
                    )}
                  </div>
                </div>

                {/* Row 4: Estimated Budget */}
                <div>
                  <label
                    htmlFor="contact-budget"
                    className="text-xs tracking-widest uppercase text-[#6b6b6b] block mb-2"
                  >
                    Estimated Budget <span className="text-[#aaa] text-[10px] lowercase">(optional)</span>
                  </label>
                  <select
                    id="contact-budget"
                    name="budget"
                    disabled={submitting}
                    value={form.budget}
                    onChange={handleChange}
                    className={`${inputClass("budget")} appearance-none cursor-pointer`}
                  >
                    <option value="">Select an estimated budget range…</option>
                    {BUDGET_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 5: Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="text-xs tracking-widest uppercase text-[#6b6b6b] block mb-2"
                  >
                    Tell Me About Your Vision <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    disabled={submitting}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Share your ideas, event schedule, aesthetic preferences, or questions…"
                    className={`${inputClass("message")} resize-none`}
                    aria-required="true"
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500 mt-1">{errors.message}</p>
                  )}
                </div>

                {/* Submit button with loading spinner and duplicate prevention */}
                <button
                  type="submit"
                  id="contact-submit-btn"
                  disabled={submitting}
                  className="self-start inline-flex items-center gap-3 bg-[#141414] text-[#FAF9F7] text-xs tracking-widest uppercase px-8 py-4 hover:bg-[#3a3a3a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting Inquiry…</span>
                    </>
                  ) : (
                    <>
                      <span>Send Inquiry</span>
                      <Send size={13} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
