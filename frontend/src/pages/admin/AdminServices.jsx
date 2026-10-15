/**
 * pages/admin/AdminServices.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Photography services & investment packages management:
 * - Add new service packages
 * - Edit service description, pricing, features, deliverables
 * - Toggle publication status (live on public /services page)
 * - Delete service packages with confirmation
 */

import { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  IndianRupee,
  Tag,
  Package
} from "lucide-react";
import SafeImage from "../../components/common/SafeImage";
import ImageInputPreview from "../../components/admin/ImageInputPreview";
import { validateImageUrl } from "../../utils/imageUrl";
import {
  getAdminServices,
  createAdminService,
  updateAdminService,
  deleteAdminService,
  togglePublishService
} from "../../services/api";
import { formatINR } from "../../utils/currency";

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

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Delete State
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    startingPrice: "",
    currency: "INR",
    coverImageUrl: "",
    coverAltText: "",
    deliverables: "",
    features: [""],
    isPublished: true,
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminServices();
      if (res.success) {
        setServices(res.services || []);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Unable to load services from MongoDB.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const showNotice = (msg) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Open Create Modal
  const handleOpenNewModal = () => {
    setEditingService(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      startingPrice: "",
      currency: "INR",
      coverImageUrl: "",
      coverAltText: "",
      deliverables: "",
      features: [""],
      isPublished: true,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || "",
      slug: service.slug || "",
      description: service.description || "",
      startingPrice: service.startingPrice !== null && service.startingPrice !== undefined ? String(service.startingPrice) : "",
      currency: service.currency || "INR",
      coverImageUrl: service.coverImage?.imageUrl || service.coverImage?.src || "",
      coverAltText: service.coverImage?.altText || service.coverImage?.alt || "",
      deliverables: service.deliverables || "",
      features: service.features?.length ? [...service.features] : [""],
      isPublished: Boolean(service.isPublished ?? service.published),
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Handle Features array inputs
  const handleFeatureChange = (index, val) => {
    const updated = [...formData.features];
    updated[index] = val;
    setFormData({ ...formData, features: updated });
  };

  const handleAddFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const handleRemoveFeature = (index) => {
    const updated = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: updated.length ? updated : [""] });
  };

  // Submit Modal
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError("Service package name is required.");
      return;
    }
    if (!formData.description.trim()) {
      setModalError("Service description is required.");
      return;
    }

    if (formData.coverImageUrl.trim()) {
      const valResult = validateImageUrl(formData.coverImageUrl);
      if (!valResult.valid) {
        setModalError(valResult.error || "Please enter a valid cover image URL.");
        return;
      }
    }

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || slugify(formData.name),
      description: formData.description.trim(),
      startingPrice: formData.startingPrice !== "" ? Number(formData.startingPrice) : null,
      currency: formData.currency || "INR",
      deliverables: formData.deliverables.trim(),
      features: formData.features.map((f) => f.trim()).filter(Boolean),
      isPublished: Boolean(formData.isPublished),
      coverImage: {
        imageUrl: formData.coverImageUrl.trim(),
        altText: formData.coverAltText.trim() || formData.name.trim(),
      },
    };

    setSaving(true);
    setModalError(null);

    try {
      if (editingService) {
        await updateAdminService(editingService._id, payload);
        showNotice(`Updated service package "${formData.name}".`);
      } else {
        await createAdminService(payload);
        showNotice(`Created new service package "${formData.name}".`);
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error("Save service error:", err);
      setModalError(err.message || "Failed to save service.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle publish
  const handleTogglePublish = async (service) => {
    try {
      await togglePublishService(service._id);
      setServices((prev) =>
        prev.map((s) =>
          s._id === service._id ? { ...s, isPublished: !s.isPublished } : s
        )
      );
      showNotice(
        `Service "${service.name}" ${!service.isPublished ? "published to public website" : "unpublished"}.`
      );
    } catch (err) {
      setError("Failed to toggle publish status.");
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    setDeleting(true);
    try {
      await deleteAdminService(serviceToDelete._id);
      setServices((prev) => prev.filter((s) => s._id !== serviceToDelete._id));
      showNotice(`Deleted service package "${serviceToDelete.name}".`);
      setServiceToDelete(null);
    } catch (err) {
      setError("Failed to delete service.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C4A882]/15">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF9F7]">
            Services & Investment Packages
          </h1>
          <p className="text-xs sm:text-sm text-[#999999] mt-0.5">
            Configure photography packages, deliverables, starting rates, and live availability.
          </p>
        </div>

        <button
          id="admin-add-service-btn"
          onClick={handleOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C4A882] hover:bg-[#a8895f] text-[#0A0A0A] font-semibold text-xs tracking-wider uppercase rounded-md transition-all shadow-md shadow-[#C4A882]/10"
        >
          <Plus size={16} />
          Add Service
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

      {/* ── Services Grid ───────────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center text-sm text-[#666666]">
          Loading services from MongoDB…
        </div>
      ) : services.length === 0 ? (
        <div className="py-20 text-center rounded-xl bg-[#141414] border border-[#C4A882]/15">
          <Sparkles size={32} className="mx-auto text-[#666666] mb-3" />
          <h3 className="font-serif text-base font-bold text-[#FAF9F7]">No services defined</h3>
          <p className="text-xs text-[#888888] mt-1 max-w-sm mx-auto">
            Create your photography packages to showcase your offerings to prospective clients.
          </p>
          <button
            onClick={handleOpenNewModal}
            className="mt-4 px-4 py-2 bg-[#C4A882] text-[#0A0A0A] font-semibold text-xs tracking-wider uppercase rounded-md hover:bg-[#a8895f] transition-all"
          >
            Add Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const isPub = Boolean(service.isPublished ?? service.published);
            const priceDisplay =
              service.startingPrice !== null && service.startingPrice !== undefined
                ? formatINR(service.startingPrice)
                : "Contact for pricing";

            return (
              <div
                key={service._id}
                className="rounded-xl bg-[#141414] border border-[#C4A882]/15 hover:border-[#C4A882]/40 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
              >
                <div>
                  {/* Top Cover Image or Banner */}
                  {service.coverImage?.imageUrl || service.coverImage?.src ? (
                    <div className="relative h-40 bg-[#1a1a1a] overflow-hidden">
                      <SafeImage
                        src={service.coverImage?.imageUrl || service.coverImage?.src}
                        alt={service.coverImage?.altText || service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => handleTogglePublish(service)}
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
                  ) : (
                    <div className="p-4 pb-0 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-[#C4A882] font-semibold">
                        Investment Package
                      </span>
                      <button
                        onClick={() => handleTogglePublish(service)}
                        title={isPub ? "Published (click to unpublish)" : "Draft (click to publish)"}
                        className={`p-1.5 rounded-full transition-colors ${
                          isPub
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-[#222222] text-[#888888] hover:text-emerald-400"
                        }`}
                      >
                        {isPub ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#FAF9F7]">
                        {service.name}
                      </h3>
                      <div className="text-sm font-semibold text-[#C4A882] mt-1">
                        Starting from {priceDisplay}
                      </div>
                    </div>

                    <p className="text-xs text-[#888888] line-clamp-3">
                      {service.description}
                    </p>

                    {/* Features list */}
                    {service.features && service.features.length > 0 && (
                      <div className="pt-2 border-t border-[#222222] space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-[#666666] font-semibold block">
                          Included In Package:
                        </span>
                        <ul className="space-y-1">
                          {service.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-[#cccccc]">
                              <Check size={12} className="text-[#C4A882] mt-0.5 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Deliverables summary */}
                    {service.deliverables && (
                      <div className="p-2.5 rounded bg-[#1a1a1a] border border-[#262626] text-[11px] text-[#999999]">
                        <span className="font-semibold text-[#FAF9F7] block mb-0.5">Deliverables:</span>
                        {service.deliverables}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 pt-3 border-t border-[#222222] flex items-center justify-between bg-[#0e0e0e]">
                  <span className={`text-[10px] uppercase tracking-wider font-semibold ${isPub ? "text-emerald-400" : "text-[#888888]"}`}>
                    {isPub ? "● Live on Website" : "○ Draft / Hidden"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(service)}
                      className="p-1.5 text-[#C4A882] hover:bg-[#C4A882]/10 rounded transition-colors"
                      title="Edit Service"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setServiceToDelete(service)}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 size={14} />
                    </button>
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
              {editingService ? "Edit Service Package" : "Add Service Package"}
            </h2>
            <p className="text-xs text-[#888888] mb-5">
              Define deliverables, features, and rates for your photography offerings.
            </p>

            {modalError && (
              <div className="p-3 mb-4 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveService} className="space-y-4">
              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wedding Full Day"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        name,
                        slug: !editingService ? slugify(name) : formData.slug,
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="wedding-full-day"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#C4A882] font-mono outline-none"
                  />
                </div>
              </div>

              {/* Price (INR) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Price (INR ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 35000"
                    value={formData.startingPrice}
                    onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                    className="w-full pl-7 pr-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                  />
                </div>
                <p className="text-[10px] text-[#666666] mt-1">Enter the numeric amount in Indian Rupees. Leave blank to show "Contact for pricing".</p>
              </div>

              {/* Cover Image URL */}
              {/* Cover Image URL with Live Preview */}
              <ImageInputPreview
                id="service-cover-url-input"
                label="Cover Image URL"
                required={false}
                value={formData.coverImageUrl}
                savedValue={editingService?.coverImage?.imageUrl || editingService?.coverImage?.src || ""}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                placeholder="https://... or Google Drive link"
              />

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Comprehensive description of what is included in this photography experience…"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                />
              </div>

              {/* Deliverables */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882] mb-1.5">
                  Deliverables Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500+ edited images, 4-week delivery turnaround, online gallery"
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                />
              </div>

              {/* Feature Bullet Points */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#C4A882]">
                    Included Features (Bullet Points)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-xs text-[#C4A882] hover:underline"
                  >
                    + Add Bullet
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Up to 8 hours of continuous coverage"
                        value={feat}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1.5 text-[#888888] hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
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
                  <span>Publish Package to Live Website</span>
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
                  {saving ? "Saving…" : editingService ? "Save Changes" : "Add Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ──────────────────────────────── */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#141414] border border-red-500/30 rounded-xl p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-[#FAF9F7] mb-2">
              Delete Service Package?
            </h3>
            <p className="text-xs text-[#888888] mb-4">
              Are you sure you want to delete <strong className="text-[#FAF9F7]">"{serviceToDelete.name}"</strong>? This package will be permanently removed from MongoDB and no longer appear on your public services page.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setServiceToDelete(null)}
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
