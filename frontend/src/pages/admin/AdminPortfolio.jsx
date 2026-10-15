/**
 * pages/admin/AdminPortfolio.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive portfolio management for the photographer:
 * - Add photograph via image URL with live preview
 * - Edit photo metadata and category
 * - Delete photo with confirmation dialog
 * - Select categories (Wedding, Pre-Wedding, Portrait, Events, Fashion, Travel)
 * - Toggle featured status (single-click)
 * - Toggle published status (single-click)
 * - Reorder photographs (Move Up / Move Down)
 */

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Star,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  AlertCircle,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";
import SafeImage from "../../components/common/SafeImage";
import ImageInputPreview from "../../components/admin/ImageInputPreview";
import { validateImageUrl } from "../../utils/imageUrl";
import {
  getAdminPortfolio,
  createAdminPhoto,
  updateAdminPhoto,
  deleteAdminPhoto,
  togglePublishPhoto,
  toggleFeaturedPhoto,
  reorderAdminPhotos
} from "../../services/api";

const CATEGORIES = ["Wedding", "Pre-Wedding", "Portrait", "Events", "Fashion", "Travel"];
const ASPECTS = ["portrait", "landscape", "square", "tall"];

export default function AdminPortfolio() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'published', 'unpublished', 'featured'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    category: "Wedding",
    altText: "",
    description: "",
    aspect: "portrait",
    location: "",
    year: new Date().getFullYear(),
    isFeatured: false,
    isPublished: true,
  });

  // Delete Confirmation State
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load photos
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminPortfolio();
      if (res.success) {
        setPhotos(res.photos || []);
      }
    } catch (err) {
      console.error("Error fetching admin portfolio:", err);
      setError("Unable to load portfolio photos. Please verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const showNotice = (msg) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Open modal for new photograph
  const handleOpenNewModal = () => {
    setEditingPhoto(null);
    setFormData({
      title: "",
      imageUrl: "",
      category: selectedCategory !== "All" ? selectedCategory : "Wedding",
      altText: "",
      description: "",
      aspect: "portrait",
      location: "",
      year: new Date().getFullYear(),
      isFeatured: false,
      isPublished: true,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (photo) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title || "",
      imageUrl: photo.imageUrl || photo.src || "",
      category: photo.category || "Wedding",
      altText: photo.altText || photo.alt || "",
      description: photo.description || "",
      aspect: photo.aspect || "portrait",
      location: photo.location || "",
      year: photo.year || new Date().getFullYear(),
      isFeatured: Boolean(photo.isFeatured ?? photo.featured),
      isPublished: Boolean(photo.isPublished ?? photo.published),
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Submit modal (Create or Update)
  const handleSavePhoto = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setModalError("Photograph title is required.");
      return;
    }
    if (!formData.imageUrl.trim()) {
      setModalError("Image URL is required.");
      return;
    }

    const valResult = validateImageUrl(formData.imageUrl);
    if (!valResult.valid) {
      setModalError(valResult.error || "Please provide a valid image URL.");
      return;
    }

    setSaving(true);
    setModalError(null);

    try {
      if (editingPhoto) {
        await updateAdminPhoto(editingPhoto._id, formData);
        showNotice(`Updated photograph "${formData.title}".`);
      } else {
        await createAdminPhoto(formData);
        showNotice(`Added photograph "${formData.title}" to portfolio.`);
      }
      setIsModalOpen(false);
      fetchPhotos();
    } catch (err) {
      console.error("Save photo error:", err);
      setModalError(err.message || "Failed to save photograph.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (photo) => {
    try {
      await toggleFeaturedPhoto(photo._id);
      setPhotos((prev) =>
        prev.map((p) =>
          p._id === photo._id ? { ...p, isFeatured: !p.isFeatured, featured: !p.featured } : p
        )
      );
      showNotice(
        `Photo "${photo.title}" ${!photo.isFeatured ? "marked as featured" : "removed from featured"}.`
      );
    } catch (err) {
      setError("Failed to toggle featured status.");
    }
  };

  // Toggle Publish
  const handleTogglePublish = async (photo) => {
    try {
      await togglePublishPhoto(photo._id);
      setPhotos((prev) =>
        prev.map((p) =>
          p._id === photo._id ? { ...p, isPublished: !p.isPublished, published: !p.published } : p
        )
      );
      showNotice(
        `Photo "${photo.title}" ${!photo.isPublished ? "published to live site" : "unpublished"}.`
      );
    } catch (err) {
      setError("Failed to toggle publish status.");
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!photoToDelete) return;
    setDeleting(true);
    try {
      await deleteAdminPhoto(photoToDelete._id);
      setPhotos((prev) => prev.filter((p) => p._id !== photoToDelete._id));
      showNotice(`Deleted photograph "${photoToDelete.title}".`);
      setPhotoToDelete(null);
    } catch (err) {
      setError("Failed to delete photograph.");
    } finally {
      setDeleting(false);
    }
  };

  // Move Order Up / Down
  const handleMoveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(index, 1);
    newPhotos.splice(targetIndex, 0, moved);

    setPhotos(newPhotos);

    try {
      const ids = newPhotos.map((p) => p._id);
      await reorderAdminPhotos(ids);
      showNotice("Portfolio order updated.");
    } catch (err) {
      setError("Failed to save reorder. Reverting…");
      fetchPhotos();
    }
  };

  // Filtered list
  const filteredPhotos = photos.filter((p) => {
    const matchesSearch =
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && (p.isPublished ?? p.published)) ||
      (statusFilter === "unpublished" && !(p.isPublished ?? p.published)) ||
      (statusFilter === "featured" && (p.isFeatured ?? p.featured));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C4A882]/15">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF9F7]">
            Portfolio Archive
          </h1>
          <p className="text-xs sm:text-sm text-[#999999] mt-0.5">
            Upload photographs using URLs, manage categories, reorder showcase items, and control live visibility.
          </p>
        </div>

        <button
          id="admin-add-photo-btn"
          onClick={handleOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C4A882] hover:bg-[#a8895f] text-[#0A0A0A] font-semibold text-xs tracking-wider uppercase rounded-md transition-all shadow-md shadow-[#C4A882]/10"
        >
          <Plus size={16} />
          Add Photograph
        </button>
      </div>

      {/* ── Alerts & Notices ────────────────────────────────────────── */}
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

      {/* ── Filters & Search ────────────────────────────────────────── */}
      <div className="space-y-3 p-4 rounded-xl bg-[#141414] border border-[#C4A882]/15">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
            <input
              id="admin-photo-search"
              type="text"
              placeholder="Search by title or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] placeholder-[#666666] outline-none transition-colors"
            />
          </div>

          {/* Status filter dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#888888]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
            >
              <option value="all">All Photos</option>
              <option value="published">Published Only</option>
              <option value="unpublished">Unpublished (Draft)</option>
              <option value="featured">Featured Only</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === "All"
                ? "bg-[#C4A882] text-[#0A0A0A] font-semibold"
                : "bg-[#1f1f1f] text-[#999999] hover:text-[#FAF9F7]"
            }`}
          >
            All ({photos.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = photos.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#C4A882] text-[#0A0A0A] font-semibold"
                    : "bg-[#1f1f1f] text-[#999999] hover:text-[#FAF9F7]"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Photographs List / Grid ─────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center text-sm text-[#666666]">
          Loading photographs from MongoDB archive…
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="py-20 text-center rounded-xl bg-[#141414] border border-[#C4A882]/15">
          <ImageIcon size={32} className="mx-auto text-[#666666] mb-3" />
          <h3 className="font-serif text-base font-bold text-[#FAF9F7]">No photographs found</h3>
          <p className="text-xs text-[#888888] mt-1 max-w-sm mx-auto">
            {search || selectedCategory !== "All" || statusFilter !== "all"
              ? "No photographs match the current filter criteria."
              : "Your portfolio is currently empty. Click 'Add Photograph' to upload your first image."}
          </p>
          <button
            onClick={handleOpenNewModal}
            className="mt-4 px-4 py-2 bg-[#C4A882] text-[#0A0A0A] font-semibold text-xs tracking-wider uppercase rounded-md hover:bg-[#a8895f] transition-all"
          >
            Add Photograph
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPhotos.map((photo, index) => {
            const isPub = Boolean(photo.isPublished ?? photo.published);
            const isFeat = Boolean(photo.isFeatured ?? photo.featured);

            return (
              <div
                key={photo._id}
                className="rounded-xl bg-[#141414] border border-[#C4A882]/15 hover:border-[#C4A882]/40 transition-all flex flex-col overflow-hidden group shadow-lg"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-[4/3] bg-[#1a1a1a] overflow-hidden">
                  <SafeImage
                    src={photo.imageUrl || photo.src}
                    alt={photo.altText || photo.alt || photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Category Pill */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-semibold bg-black/75 backdrop-blur-md text-[#FAF9F7] border border-white/10">
                    {photo.category}
                  </span>

                  {/* Status indicators */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {/* Featured toggle badge */}
                    <button
                      onClick={() => handleToggleFeatured(photo)}
                      title={isFeat ? "Featured photo (click to unfeature)" : "Click to mark featured"}
                      className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                        isFeat
                          ? "bg-amber-500/90 text-[#0A0A0A]"
                          : "bg-black/60 text-[#888888] hover:text-amber-400"
                      }`}
                    >
                      <Star size={13} fill={isFeat ? "currentColor" : "none"} />
                    </button>

                    {/* Published toggle badge */}
                    <button
                      onClick={() => handleTogglePublish(photo)}
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
                </div>

                {/* Card Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-[#FAF9F7] truncate" title={photo.title}>
                      {photo.title}
                    </h3>
                    {photo.description && (
                      <p className="text-[11px] text-[#888888] mt-1 line-clamp-2" title={photo.description}>
                        {photo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-[#666666]">
                      {photo.location && <span>📍 {photo.location}</span>}
                      {photo.year && <span>🗓️ {photo.year}</span>}
                      <span>Order: #{photo.sortOrder ?? index}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3 pt-3 border-t border-[#222222] flex items-center justify-between">
                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveOrder(index, -1)}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 text-[#888888] hover:text-[#FAF9F7] disabled:opacity-20 disabled:hover:text-[#888888] rounded hover:bg-[#222222]"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(index, 1)}
                        disabled={index === photos.length - 1}
                        title="Move Down"
                        className="p-1 text-[#888888] hover:text-[#FAF9F7] disabled:opacity-20 disabled:hover:text-[#888888] rounded hover:bg-[#222222]"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>

                    {/* Edit & Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(photo)}
                        className="p-1.5 text-[#C4A882] hover:bg-[#C4A882]/10 rounded transition-colors"
                        title="Edit photograph details"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setPhotoToDelete(photo)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete photograph"
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

      {/* ── Add / Edit Modal ────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-[#141414] border border-[#C4A882]/30 rounded-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-[#888888] hover:text-[#FAF9F7]"
            >
              <X size={20} />
            </button>

            <h2 className="font-serif text-xl font-bold text-[#FAF9F7] mb-1">
              {editingPhoto ? "Edit Photograph" : "Add Photograph to Portfolio"}
            </h2>
            <p className="text-xs text-[#888888] mb-5">
              Enter photograph details, category, and image URL. Changes will update MongoDB immediately.
            </p>

            {modalError && (
              <div className="p-3 mb-4 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSavePhoto} className="space-y-4">
              {/* Universal Image URL with live preview */}
              <ImageInputPreview
                id="photo-image-url-input"
                label="Image URL *"
                required
                value={formData.imageUrl}
                savedValue={editingPhoto?.imageUrl || editingPhoto?.src || ""}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://... or Google Drive link"
              />

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset Ceremony in Big Sur"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                />
              </div>

              {/* Category & Aspect Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                    Aspect Ratio
                  </label>
                  <select
                    value={formData.aspect}
                    onChange={(e) => setFormData({ ...formData, aspect: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                  >
                    {ASPECTS.map((asp) => (
                      <option key={asp} value={asp}>
                        {asp.charAt(0).toUpperCase() + asp.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Alt Text (Accessibility)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bride and groom exchanging vows under eucalyptus trees"
                  value={formData.altText}
                  onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
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
                    placeholder="e.g. Positano, Italy"
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
                  Editorial Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short notes about lighting, mood, or context…"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                />
              </div>

              {/* Toggles: Featured & Published */}
              <div className="pt-2 border-t border-[#222222] flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#FAF9F7]">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#1a1a1a] border-[#333333] text-[#C4A882] focus:ring-0"
                  />
                  <span>Mark as Featured (Home Showcase)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#FAF9F7]">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#1a1a1a] border-[#333333] text-[#C4A882] focus:ring-0"
                  />
                  <span>Publish to Public Website</span>
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
                  {saving ? "Saving…" : editingPhoto ? "Save Changes" : "Add Photograph"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ──────────────────────────────── */}
      {photoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#141414] border border-red-500/30 rounded-xl p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-[#FAF9F7] mb-2">
              Delete Photograph?
            </h3>
            <p className="text-xs text-[#888888] mb-4">
              Are you sure you want to delete <strong className="text-[#FAF9F7]">"{photoToDelete.title}"</strong>? This will permanently remove the record from MongoDB and dissociate it from any galleries.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPhotoToDelete(null)}
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
