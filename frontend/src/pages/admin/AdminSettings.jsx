/**
 * pages/admin/AdminSettings.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Photographer profile, studio details, and administrative settings.
 * All changes update the Photographer document in MongoDB and are immediately
 * reflected across public pages (Home hero, About page, Contact, Footer).
 */

import { useState, useEffect } from "react";
import {
  Settings,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Camera,
  Globe,
  Share2,
  FileText,
  User,
  Shield
} from "lucide-react";
import ImageInputPreview from "../../components/admin/ImageInputPreview";
import { validateImageUrl } from "../../utils/imageUrl";
import { getAdminProfile, updateAdminProfile } from "../../services/api";
import { useProfile } from "../../context/ProfileContext";

export default function AdminSettings() {
  const { updateCachedProfile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);
  const [savedProfileImageUrl, setSavedProfileImageUrl] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    heroHeading: "",
    heroSubheading: "",
    bio: "",
    shortBio: "",
    profileImageUrl: "",
    profileAltText: "",
    instagram: "",
    facebook: "",
    pinterest: "",
    twitter: "",
    privateNotes: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminProfile();
      if (res.success && res.profile) {
        const p = res.profile;
        setFormData({
          name: p.name || "",
          title: p.title || "",
          email: p.email || "",
          phone: p.phone || "",
          location: p.location || "",
          heroHeading: p.heroHeading || "",
          heroSubheading: p.heroSubheading || "",
          bio: p.bio || "",
          shortBio: p.shortBio || "",
          profileImageUrl: p.profileImage?.imageUrl || p.profileImage?.src || "",
          profileAltText: p.profileImage?.altText || p.profileImage?.alt || "",
          instagram: p.socialLinks?.instagram || "",
          facebook: p.socialLinks?.facebook || "",
          pinterest: p.socialLinks?.pinterest || "",
          twitter: p.socialLinks?.twitter || "",
          privateNotes: p.privateNotes || "",
        });
        setSavedProfileImageUrl(p.profileImage?.imageUrl || p.profileImage?.src || "");
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError("Failed to load photographer profile settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showNotice = (msg) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Photographer name is required.");
      return;
    }

    if (formData.profileImageUrl.trim()) {
      const valResult = validateImageUrl(formData.profileImageUrl);
      if (!valResult.valid) {
        setError(valResult.error || "Please enter a valid portrait image URL.");
        return;
      }
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: formData.name.trim(),
      title: formData.title.trim(),
      phone: formData.phone.trim(),
      location: formData.location.trim(),
      heroHeading: formData.heroHeading.trim(),
      heroSubheading: formData.heroSubheading.trim(),
      bio: formData.bio.trim(),
      shortBio: formData.shortBio.trim(),
      profileImage: {
        imageUrl: formData.profileImageUrl.trim(),
        altText: formData.profileAltText.trim() || formData.name.trim(),
      },
      socialLinks: {
        instagram: formData.instagram.trim(),
        facebook: formData.facebook.trim(),
        pinterest: formData.pinterest.trim(),
        twitter: formData.twitter.trim(),
      },
      privateNotes: formData.privateNotes,
    };

    try {
      const res = await updateAdminProfile(payload);
      if (res.success) {
        setSavedProfileImageUrl(formData.profileImageUrl.trim());
        updateCachedProfile({
          ...payload,
          profileImage: payload.profileImage,
          socialLinks: payload.socialLinks,
        });
        showNotice("Studio settings and profile updated successfully in MongoDB!");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setError(err.message || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C4A882]/15">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF9F7]">
            Studio Settings & Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#999999] mt-0.5">
            Configure photographer credentials, artist bio, hero taglines, and social media channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#C4A882]/30 hover:border-[#C4A882] text-xs text-[#FAF9F7] rounded-md transition-colors"
          >
            <ExternalLink size={13} />
            Preview About Page
          </a>
        </div>
      </div>

      {/* ── Alerts ──────────────────────────────────────────────────── */}
      {successNotice && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check size={16} />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Main Form ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center text-sm text-[#666666]">
          Loading studio profile from MongoDB…
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Section 1: Basic Identity & Studio Contact */}
          <div className="p-6 rounded-xl bg-[#141414] border border-[#C4A882]/15 space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#FAF9F7] flex items-center gap-2 pb-2 border-b border-[#222222]">
              <User size={18} className="text-[#C4A882]" />
              Photographer Identity & Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Professional Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fine Art & Editorial Photographer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Studio Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA & Worldwide"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Studio Phone
                </label>
                <input
                  type="text"
                  placeholder="+1 (415) 555-0199"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Website Editorial Copy & Hero Section */}
          <div className="p-6 rounded-xl bg-[#141414] border border-[#C4A882]/15 space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#FAF9F7] flex items-center gap-2 pb-2 border-b border-[#222222]">
              <Globe size={18} className="text-[#C4A882]" />
              Website Hero & Editorial Copy
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                Hero Heading (Home Page Top Tagline)
              </label>
              <input
                type="text"
                placeholder="Capturing Moments That Last Forever."
                value={formData.heroHeading}
                onChange={(e) => setFormData({ ...formData, heroHeading: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                Hero Subheading
              </label>
              <input
                type="text"
                placeholder="Visual storyteller specializing in authentic love stories, portraits, and refined aesthetics."
                value={formData.heroSubheading}
                onChange={(e) => setFormData({ ...formData, heroSubheading: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                Short Bio (Footer & Teasers)
              </label>
              <textarea
                rows={2}
                value={formData.shortBio}
                onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                Full Artist Bio (About Page)
              </label>
              <textarea
                rows={5}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] leading-relaxed outline-none"
              />
            </div>
          </div>

          {/* Section 3: Photographer Portrait Image */}
          <div className="p-6 rounded-xl bg-[#141414] border border-[#C4A882]/15 space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#FAF9F7] flex items-center gap-2 pb-2 border-b border-[#222222]">
              <Camera size={18} className="text-[#C4A882]" />
              Artist Portrait Image
            </h2>

            <div className="space-y-4">
              <ImageInputPreview
                id="settings-profile-image-url"
                label="Portrait Image URL"
                required={false}
                value={formData.profileImageUrl}
                savedValue={savedProfileImageUrl}
                onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                placeholder="https://... or Google Drive link"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Image Alt Text
                </label>
                <input
                  type="text"
                  placeholder="Elena Vasquez holding a 35mm camera"
                  value={formData.profileAltText}
                  onChange={(e) => setFormData({ ...formData, profileAltText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Social Media Links */}
          <div className="p-6 rounded-xl bg-[#141414] border border-[#C4A882]/15 space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#FAF9F7] flex items-center gap-2 pb-2 border-b border-[#222222]">
              <Share2 size={18} className="text-[#C4A882]" />
              Social Media Channels
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Instagram
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/yourhandle"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Facebook
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/yourpage"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Pinterest
                </label>
                <input
                  type="url"
                  placeholder="https://pinterest.com/yourhandle"
                  value={formData.pinterest}
                  onChange={(e) => setFormData({ ...formData, pinterest: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Twitter / X
                </label>
                <input
                  type="url"
                  placeholder="https://twitter.com/yourhandle"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Private Administrative Notes */}
          <div className="p-6 rounded-xl bg-[#141414] border border-[#C4A882]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#FAF9F7] flex items-center gap-2 pb-2 border-b border-[#222222]">
              <Shield size={18} className="text-[#C4A882]" />
              Internal Administrative Studio Notes (Never Disclosed Publicly)
            </h2>
            <p className="text-xs text-[#888888]">
              Private notes, flight travel policies, gear serial numbers, manager contacts, or studio agreements.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Travel radius 100 miles. Equipment: Canon R5 + 50mm f/1.2L…"
              value={formData.privateNotes}
              onChange={(e) => setFormData({ ...formData, privateNotes: e.target.value })}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              id="admin-save-settings-btn"
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#C4A882] hover:bg-[#a8895f] text-[#0A0A0A] font-semibold text-xs tracking-wider uppercase rounded-md transition-all shadow-md shadow-[#C4A882]/10 disabled:opacity-50"
            >
              {saving ? "Saving to Database…" : "Save Studio Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
