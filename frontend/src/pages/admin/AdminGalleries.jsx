/**
 * pages/admin/AdminGalleries.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Gallery collections management:
 * - Create and edit galleries
 * - Add photographs to galleries (pick from existing portfolio or add image URLs)
 * - Generate unique shareable slugs with auto-slug generation
 * - Publish and unpublish galleries
 * - Copy shareable gallery links with clipboard feedback
 */

import { useState, useEffect } from "react";
import {
  FolderOpen,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  X,
  Search,
  Images,
  AlertCircle,
  Link as LinkIcon
} from "lucide-react";
import SafeImage from "../../components/common/SafeImage";
import ImageInputPreview from "../../components/admin/ImageInputPreview";
import { validateImageUrl } from "../../utils/imageUrl";
import {
  getAdminGalleries,
  createAdminGallery,
  updateAdminGallery,
  deleteAdminGallery,
  togglePublishGallery,
  getAdminPortfolio
} from "../../services/api";

const CATEGORIES = ["Wedding", "Pre-Wedding", "Portrait", "Events", "Fashion", "Travel"];

// Helper: auto slugify
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export default function AdminGalleries() {
  const [galleries, setGalleries] = useState([]);
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Search filter
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Delete State
  const [galleryToDelete, setGalleryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    category: "Wedding",
    coverImageUrl: "",
    coverAltText: "",
    location: "",
    year: new Date().getFullYear(),
    isPublished: true,
    selectedImageIds: [], // IDs from PortfolioImage
    extraPhotos: [], // [{ src, alt, aspect }]
  });

  // Extra photo input state inside modal
  const [extraPhotoInput, setExtraPhotoInput] = useState({ src: "", alt: "", aspect: "portrait" });

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      setError(null);
      const [galRes, photoRes] = await Promise.all([
        getAdminGalleries(),
        getAdminPortfolio(),
      ]);
      if (galRes.success) {
        setGalleries(galRes.galleries || []);
      }
      if (photoRes.success) {
        setPortfolioPhotos(photoRes.photos || []);
      }
    } catch (err) {
      console.error("Error fetching galleries:", err);
      setError("Unable to load galleries from MongoDB.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const showNotice = (msg) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Copy shareable link
  const handleCopyLink = (slug) => {
    const fullUrl = `${window.location.origin}/gallery/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    showNotice(`Shareable link copied to clipboard: ${fullUrl}`);
    setTimeout(() => setCopiedSlug(null), 3000);
  };

  // Open Create Modal
  const handleOpenNewModal = () => {
    setEditingGallery(null);
    setFormData({
      title: "",
      slug: "",
      subtitle: "",
      description: "",
      category: "Wedding",
      coverImageUrl: "",
      coverAltText: "",
      location: "",
      year: new Date().getFullYear(),
      isPublished: true,
      selectedImageIds: [],
      extraPhotos: [],
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (gallery) => {
    setEditingGallery(gallery);
    const existingImageIds = (gallery.images || []).map((img) =>
      typeof img === "object" ? img._id : img
    );

    setFormData({
      title: gallery.title || "",
      slug: gallery.slug || "",
      subtitle: gallery.subtitle || "",
      description: gallery.description || "",
      category: gallery.category || "Wedding",
      coverImageUrl: gallery.coverImage?.imageUrl || gallery.coverImage?.src || "",
      coverAltText: gallery.coverImage?.altText || gallery.coverImage?.alt || "",
      location: gallery.location || "",
      year: gallery.year || new Date().getFullYear(),
      isPublished: Boolean(gallery.isPublished ?? gallery.published),
      selectedImageIds: existingImageIds,
      extraPhotos: gallery.photos || [],
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Title change with auto-slug generation
  const handleTitleChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !editingGallery ? slugify(val) : prev.slug,
    }));
  };

  // Toggle image selection in modal
  const handleToggleImageSelection = (id) => {
    setFormData((prev) => {
      const exists = prev.selectedImageIds.includes(id);
      return {
        ...prev,
        selectedImageIds: exists
          ? prev.selectedImageIds.filter((imgId) => imgId !== id)
          : [...prev.selectedImageIds, id],
      };
    });
  };

  // Add extra direct image
  const handleAddExtraPhoto = () => {
    if (!extraPhotoInput.src.trim()) return;
    const valResult = validateImageUrl(extraPhotoInput.src);
    if (!valResult.valid) {
      setModalError(valResult.error || "Invalid image URL format.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      extraPhotos: [
        ...prev.extraPhotos,
        {
          src: extraPhotoInput.src.trim(),
          alt: extraPhotoInput.alt.trim() || formData.title,
          aspect: extraPhotoInput.aspect,
        },
      ],
    }));
    setExtraPhotoInput({ src: "", alt: "", aspect: "portrait" });
  };

  // Remove extra direct image
  const handleRemoveExtraPhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      extraPhotos: prev.extraPhotos.filter((_, i) => i !== index),
    }));
  };

  // Submit modal
  const handleSaveGallery = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setModalError("Gallery title is required.");
      return;
    }
    if (!formData.coverImageUrl.trim()) {
      setModalError("Cover image URL is required.");
      return;
    }
    const valResult = validateImageUrl(formData.coverImageUrl);
    if (!valResult.valid) {
      setModalError(valResult.error || "Please enter a valid cover image URL.");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || slugify(formData.title),
      subtitle: formData.subtitle.trim(),
      description: formData.description.trim(),
      category: formData.category,
      coverImage: {
        imageUrl: formData.coverImageUrl.trim(),
        altText: formData.coverAltText.trim() || formData.title.trim(),
      },
      location: formData.location.trim(),
      year: Number(formData.year),
      isPublished: Boolean(formData.isPublished),
      images: formData.selectedImageIds,
      photos: formData.extraPhotos,
    };

    setSaving(true);
    setModalError(null);

    try {
      if (editingGallery) {
        await updateAdminGallery(editingGallery._id, payload);
        showNotice(`Updated gallery "${formData.title}".`);
      } else {
        await createAdminGallery(payload);
        showNotice(`Created new gallery "${formData.title}".`);
      }
      setIsModalOpen(false);
      fetchGalleries();
    } catch (err) {
      console.error("Save gallery error:", err);
      setModalError(err.message || "Failed to save gallery.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle publish
  const handleTogglePublish = async (gallery) => {
    try {
      await togglePublishGallery(gallery._id);
      setGalleries((prev) =>
        prev.map((g) =>
          g._id === gallery._id ? { ...g, isPublished: !g.isPublished } : g
        )
      );
      showNotice(
        `Gallery "${gallery.title}" ${!gallery.isPublished ? "published to live site" : "unpublished"}.`
      );
    } catch (err) {
      setError("Failed to toggle publish status.");
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!galleryToDelete) return;
    setDeleting(true);
    try {
      await deleteAdminGallery(galleryToDelete._id);
      setGalleries((prev) => prev.filter((g) => g._id !== galleryToDelete._id));
      showNotice(`Deleted gallery "${galleryToDelete.title}".`);
      setGalleryToDelete(null);
    } catch (err) {
      setError("Failed to delete gallery.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredGalleries = galleries.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      g.title?.toLowerCase().includes(q) ||
      g.slug?.toLowerCase().includes(q) ||
      g.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C4A882]/15">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF9F7]">
            Curated Galleries
          </h1>
          <p className="text-xs sm:text-sm text-[#999999] mt-0.5">
            Organize themed collections, link portfolio photos, generate unique slugs, and share custom client links.
          </p>
        </div>

        <button
          id="admin-create-gallery-btn"
          onClick={handleOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C4A882] hover:bg-[#a8895f] text-[#0A0A0A] font-semibold text-xs tracking-wider uppercase rounded-md transition-all shadow-md shadow-[#C4A882]/10"
        >
          <Plus size={16} />
          Create Gallery
        </button>
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

      {/* ── Search Bar ──────────────────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-[#141414] border border-[#C4A882]/15 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
          <input
            type="text"
            placeholder="Search galleries by title, slug, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] placeholder-[#666666] outline-none transition-colors"
          />
        </div>
        <div className="text-xs text-[#888888]">
          Total Galleries: <span className="text-[#C4A882] font-bold">{galleries.length}</span>
        </div>
      </div>

      {/* ── Galleries Grid ──────────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center text-sm text-[#666666]">
          Loading galleries from MongoDB…
        </div>
      ) : filteredGalleries.length === 0 ? (
        <div className="py-20 text-center rounded-xl bg-[#141414] border border-[#C4A882]/15">
          <FolderOpen size={32} className="mx-auto text-[#666666] mb-3" />
          <h3 className="font-serif text-base font-bold text-[#FAF9F7]">No galleries found</h3>
          <p className="text-xs text-[#888888] mt-1 max-w-sm mx-auto">
            Create your first curated shoot gallery with a unique shareable slug.
          </p>
          <button
            onClick={handleOpenNewModal}
            className="mt-4 px-4 py-2 bg-[#C4A882] text-[#0A0A0A] font-semibold text-xs tracking-wider uppercase rounded-md hover:bg-[#a8895f] transition-all"
          >
            Create Gallery
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGalleries.map((gallery) => {
            const isPub = Boolean(gallery.isPublished ?? gallery.published);
            const totalPhotosCount =
              (gallery.images?.length || 0) + (gallery.photos?.length || 0);

            return (
              <div
                key={gallery._id}
                className="rounded-xl bg-[#141414] border border-[#C4A882]/15 hover:border-[#C4A882]/40 transition-all flex flex-col overflow-hidden group shadow-lg"
              >
                {/* Cover Image & Badges */}
                <div className="relative aspect-[16/10] bg-[#1a1a1a] overflow-hidden">
                  <SafeImage
                    src={gallery.coverImage?.imageUrl || gallery.coverImage?.src}
                    alt={gallery.coverImage?.altText || gallery.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-semibold bg-black/75 backdrop-blur-md text-[#FAF9F7] border border-white/10">
                      {gallery.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-black/60 backdrop-blur-md text-[#C4A882]">
                      {totalPhotosCount} photographs
                    </span>
                  </div>

                  {/* Publish Toggle Button */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleTogglePublish(gallery)}
                      title={isPub ? "Published (click to unpublish)" : "Draft (click to publish)"}
                      className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                        isPub
                          ? "bg-emerald-500/90 text-[#0A0A0A]"
                          : "bg-black/60 text-[#888888] hover:text-emerald-400"
                      }`}
                    >
                      {isPub ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                  </div>

                  {/* Bottom title overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-serif text-lg font-bold text-white drop-shadow truncate">
                      {gallery.title}
                    </h3>
                    {gallery.subtitle && (
                      <p className="text-xs text-white/80 drop-shadow truncate mt-0.5">
                        {gallery.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  {/* Slug & Link Sharing */}
                  <div className="p-2.5 rounded-lg bg-[#1a1a1a] border border-[#262626] flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-1.5 text-xs text-[#888888]">
                      <LinkIcon size={12} className="text-[#C4A882] shrink-0" />
                      <span className="font-mono text-[11px] text-[#C4A882] truncate">
                        /gallery/{gallery.slug}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyLink(gallery.slug)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#262626] hover:bg-[#333333] text-[11px] text-[#FAF9F7] shrink-0 transition-colors"
                      title="Copy public link"
                    >
                      {copiedSlug === gallery.slug ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Description preview */}
                  {gallery.description && (
                    <p className="text-xs text-[#888888] line-clamp-2">
                      {gallery.description}
                    </p>
                  )}

                  {/* Footer Bar */}
                  <div className="pt-3 border-t border-[#222222] flex items-center justify-between">
                    <a
                      href={`/gallery/${gallery.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#888888] hover:text-[#C4A882] transition-colors"
                    >
                      <ExternalLink size={12} />
                      Preview
                    </a>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(gallery)}
                        className="p-1.5 text-[#C4A882] hover:bg-[#C4A882]/10 rounded transition-colors"
                        title="Edit Gallery"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setGalleryToDelete(gallery)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete Gallery"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#141414] border border-[#C4A882]/30 rounded-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-[#888888] hover:text-[#FAF9F7]"
            >
              <X size={20} />
            </button>

            <h2 className="font-serif text-xl font-bold text-[#FAF9F7] mb-1">
              {editingGallery ? "Edit Gallery Collection" : "Create New Gallery"}
            </h2>
            <p className="text-xs text-[#888888] mb-5">
              Curate a photography story with custom title, unique shareable slug, and linked portfolio shots.
            </p>

            {modalError && (
              <div className="p-3 mb-4 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveGallery} className="space-y-4">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                    Gallery Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Whispers of the Coast"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                    Shareable Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="whispers-of-the-coast"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#C4A882] font-mono outline-none"
                  />
                  <p className="text-[10px] text-[#666666] mt-1">
                    URL: /gallery/{formData.slug || "slug"}
                  </p>
                </div>
              </div>

              {/* Subtitle & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. An editorial wedding story in Big Sur"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cover Image URL with Live Preview */}
              <ImageInputPreview
                id="gallery-cover-url-input"
                label="Cover Image URL *"
                required
                value={formData.coverImageUrl}
                savedValue={editingGallery?.coverImage?.imageUrl || editingGallery?.coverImage?.src || ""}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                placeholder="https://... or Google Drive link"
              />

              {/* Cover Alt Text */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Cover Alt Text
                </label>
                <input
                  type="text"
                  placeholder="Alt text for cover image"
                  value={formData.coverAltText}
                  onChange={(e) => setFormData({ ...formData, coverAltText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                />
              </div>

              {/* Location & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Carmel-by-the-Sea, California"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                    Year
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Editorial Story Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Detailed narrative about the couple, location, or atmosphere…"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                />
              </div>

              {/* ── PHOTO SELECTION: Link from Portfolio ─────────────── */}
              <div className="pt-2 border-t border-[#222222]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#C4A882]">
                    Link Portfolio Photos ({formData.selectedImageIds.length} selected)
                  </label>
                  <span className="text-[10px] text-[#888888]">
                    Click photos to include in this gallery
                  </span>
                </div>

                <div className="max-h-44 overflow-y-auto p-2 rounded-lg bg-[#1a1a1a] border border-[#333333] grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {portfolioPhotos.map((photo) => {
                    const isSelected = formData.selectedImageIds.includes(photo._id);
                    return (
                      <div
                        key={photo._id}
                        onClick={() => handleToggleImageSelection(photo._id)}
                        className={`relative aspect-square rounded overflow-hidden cursor-pointer border-2 transition-all ${
                          isSelected
                            ? "border-[#C4A882] scale-[0.96]"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <SafeImage
                          src={photo.imageUrl || photo.src}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 p-0.5 rounded-full bg-[#C4A882] text-[#0A0A0A]">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── EXTRA PHOTOS VIA IMAGE URL ───────────────────────── */}
              <div className="pt-2 border-t border-[#222222]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Add Additional Photos by Image URL ({formData.extraPhotos.length} added)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={extraPhotoInput.src}
                    onChange={(e) => setExtraPhotoInput({ ...extraPhotoInput, src: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-[#1a1a1a] border border-[#333333] rounded-lg text-xs text-[#FAF9F7] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddExtraPhoto}
                    className="px-3 py-1.5 bg-[#333333] hover:bg-[#444444] text-xs text-[#FAF9F7] rounded-lg"
                  >
                    + Add
                  </button>
                </div>

                {formData.extraPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.extraPhotos.map((p, idx) => (
                      <div
                        key={idx}
                        className="relative w-12 h-12 rounded overflow-hidden border border-[#444] group"
                      >
                        <SafeImage src={p.src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExtraPhoto(idx)}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Publish Toggle */}
              <div className="pt-2 border-t border-[#222222]">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#FAF9F7]">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#1a1a1a] border-[#333333] text-[#C4A882] focus:ring-0"
                  />
                  <span>Publish Gallery to Live Website</span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#222222] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#333333] hover:border-[#666666] text-xs text-[#FAF9F7] rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#C4A882] hover:bg-[#a8895f] text-[#0A0A0A] font-semibold text-xs tracking-wider uppercase rounded-md transition-all disabled:opacity-50"
                >
                  {saving ? "Saving…" : editingGallery ? "Save Changes" : "Create Gallery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ──────────────────────────────── */}
      {galleryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#141414] border border-red-500/30 rounded-xl p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-[#FAF9F7] mb-2">
              Delete Gallery?
            </h3>
            <p className="text-xs text-[#888888] mb-4">
              Are you sure you want to delete <strong className="text-[#FAF9F7]">"{galleryToDelete.title}"</strong> (/{galleryToDelete.slug})? The gallery collection will be permanently removed from MongoDB. Underlying portfolio images will remain intact.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setGalleryToDelete(null)}
                className="px-4 py-2 border border-[#333333] text-xs text-[#FAF9F7] rounded-md hover:bg-[#222222]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-md transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
