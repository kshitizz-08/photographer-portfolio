/**
 * pages/admin/AdminInquiries.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Client inquiries & studio CRM management:
 * - View client inquiries with reference IDs
 * - Search by client name, email, phone, location, shoot type
 * - Filter by workflow status (new, read, replied, booked, archived)
 * - Update inquiry status with instant MongoDB persistence
 * - Add and update private administrative notes
 * - One-click Email contact (mailto) and WhatsApp direct chat links
 * - Delete unwanted inquiries with confirmation dialog
 */

import { useState, useEffect } from "react";
import {
  Inbox,
  Search,
  Filter,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  MapPin,
  DollarSign,
  Trash2,
  Check,
  X,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import {
  getAdminInquiries,
  updateAdminInquiry,
  deleteAdminInquiry
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const STATUS_OPTIONS = [
  { value: "new",      label: "New",      badge: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { value: "read",     label: "Read",     badge: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  { value: "replied",  label: "Replied",  badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  { value: "booked",   label: "Booked",   badge: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  { value: "archived", label: "Archived", badge: "bg-stone-500/15 text-stone-300 border-stone-500/30" },
];

export default function AdminInquiries() {
  const { photographer } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Private note editing state: { [inquiryId]: string }
  const [noteDrafts, setNoteDrafts] = useState({});
  const [savingNoteId, setSavingNoteId] = useState(null);

  // Delete confirmation state
  const [inquiryToDelete, setInquiryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminInquiries({
        status: selectedStatus,
        search,
      });
      if (res.success) {
        setInquiries(res.inquiries || []);
        // Initialize note drafts from incoming data
        const drafts = {};
        (res.inquiries || []).forEach((inq) => {
          drafts[inq._id] = inq.adminNotes || "";
        });
        setNoteDrafts(drafts);
      }
    } catch (err) {
      console.error("Fetch inquiries error:", err);
      setError("Unable to load inquiries from MongoDB.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [selectedStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInquiries();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const showNotice = (msg) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Status Change
  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      await updateAdminInquiry(inquiryId, { status: newStatus });
      setInquiries((prev) =>
        prev.map((inq) => (inq._id === inquiryId ? { ...inq, status: newStatus } : inq))
      );
      showNotice(`Status updated to "${newStatus}".`);
    } catch (err) {
      setError("Failed to update inquiry status.");
    }
  };

  // Save Private Note
  const handleSaveNote = async (inquiryId) => {
    const noteText = noteDrafts[inquiryId] ?? "";
    setSavingNoteId(inquiryId);
    try {
      await updateAdminInquiry(inquiryId, { adminNotes: noteText });
      setInquiries((prev) =>
        prev.map((inq) => (inq._id === inquiryId ? { ...inq, adminNotes: noteText } : inq))
      );
      showNotice("Private admin note saved to MongoDB.");
    } catch (err) {
      setError("Failed to save private note.");
    } finally {
      setSavingNoteId(null);
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!inquiryToDelete) return;
    setDeleting(true);
    try {
      await deleteAdminInquiry(inquiryToDelete._id);
      setInquiries((prev) => prev.filter((inq) => inq._id !== inquiryToDelete._id));
      showNotice(`Inquiry from ${inquiryToDelete.name} deleted.`);
      setInquiryToDelete(null);
    } catch (err) {
      setError("Failed to delete inquiry.");
    } finally {
      setDeleting(false);
    }
  };

  // Helper for WhatsApp URL
  const getWhatsAppLink = (phone, name, refId) => {
    if (!phone) return null;
    const cleanNumber = phone.replace(/[^0-9]/g, "");
    if (!cleanNumber) return null;
    const message = encodeURIComponent(
      `Hello ${name}, thank you for reaching out to ${photographer?.name ?? "our photography studio"} regarding your inquiry [${refId}].`
    );
    return `https://wa.me/${cleanNumber}?text=${message}`;
  };

  // Counts by status
  const countAll = inquiries.length;
  const countNew = inquiries.filter((i) => i.status === "new").length;

  return (
    <div className="space-y-6">
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C4A882]/15">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF9F7]">
            Client Inquiries & Leads
          </h1>
          <p className="text-xs sm:text-sm text-[#999999] mt-0.5">
            Review client shoot requests, update booking workflows, log private notes, and initiate direct communication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#141414] border border-[#C4A882]/20 text-xs text-[#FAF9F7]">
            Total Inquiries: <strong className="text-[#C4A882]">{inquiries.length}</strong>
          </span>
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

      {/* ── Filters & Search ────────────────────────────────────────── */}
      <div className="space-y-3 p-4 rounded-xl bg-[#141414] border border-[#C4A882]/15">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
            <input
              id="admin-inquiries-search"
              type="text"
              placeholder="Search by client name, email, phone, location, or reference ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded-lg text-xs text-[#FAF9F7] placeholder-[#666666] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Status Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              selectedStatus === "all"
                ? "bg-[#C4A882] text-[#0A0A0A] font-semibold"
                : "bg-[#1f1f1f] text-[#999999] hover:text-[#FAF9F7]"
            }`}
          >
            All Inquiries
          </button>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedStatus === opt.value
                  ? "bg-[#C4A882] text-[#0A0A0A] font-semibold"
                  : "bg-[#1f1f1f] text-[#999999] hover:text-[#FAF9F7]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Inquiries List ──────────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center text-sm text-[#666666]">
          Loading client inquiries from MongoDB…
        </div>
      ) : inquiries.length === 0 ? (
        <div className="py-20 text-center rounded-xl bg-[#141414] border border-[#C4A882]/15">
          <Inbox size={32} className="mx-auto text-[#666666] mb-3" />
          <h3 className="font-serif text-base font-bold text-[#FAF9F7]">No inquiries found</h3>
          <p className="text-xs text-[#888888] mt-1 max-w-sm mx-auto">
            {search || selectedStatus !== "all"
              ? "No inquiries match your filter criteria."
              : "No client inquiries have been submitted yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const currentStatusObj =
              STATUS_OPTIONS.find((s) => s.value === inq.status) || STATUS_OPTIONS[0];
            const waLink = getWhatsAppLink(inq.phone, inq.name, inq.referenceId);
            const dateStr = inq.createdAt
              ? new Date(inq.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <div
                key={inq._id}
                className="rounded-xl bg-[#141414] border border-[#C4A882]/15 hover:border-[#C4A882]/35 transition-all p-5 shadow-lg space-y-4"
              >
                {/* Header: Name, Reference ID, Timestamp, Status Dropdown, Delete */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222222]">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-serif text-lg font-bold text-[#FAF9F7]">
                        {inq.name}
                      </h3>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#1f1f1f] text-[#C4A882] border border-[#333333]">
                        {inq.referenceId}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${currentStatusObj.badge}`}
                      >
                        {currentStatusObj.label}
                      </span>
                    </div>
                    {dateStr && (
                      <span className="text-[11px] text-[#666666] flex items-center gap-1 mt-1">
                        <Clock size={11} /> Submitted {dateStr}
                      </span>
                    )}
                  </div>

                  {/* Status Dropdown & Delete Button */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#888888]">Status:</span>
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                        className="px-2.5 py-1 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded text-xs text-[#FAF9F7] outline-none"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => setInquiryToDelete(inq)}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete inquiry"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Grid: Contact Information & Shoot Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Client Details & Contact Actions */}
                  <div className="space-y-2 p-3.5 rounded-lg bg-[#191919] border border-[#262626]">
                    <span className="text-[10px] uppercase tracking-wider text-[#C4A882] font-semibold block">
                      Client Contact Info
                    </span>

                    <div className="flex items-center justify-between">
                      <span className="text-[#888888]">Email:</span>
                      <span className="text-[#FAF9F7] font-medium">{inq.email}</span>
                    </div>

                    {inq.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#888888]">Phone:</span>
                        <span className="text-[#FAF9F7] font-medium">{inq.phone}</span>
                      </div>
                    )}

                    {/* Quick Contact Buttons */}
                    <div className="pt-2 border-t border-[#2d2d2d] flex items-center gap-2">
                      <a
                        href={`mailto:${inq.email}?subject=Regarding your photography inquiry [${inq.referenceId}]`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#262626] hover:bg-[#333333] text-xs text-[#FAF9F7] transition-colors"
                      >
                        <Mail size={13} className="text-[#C4A882]" />
                        Email Client
                      </a>

                      {waLink ? (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-700/40 text-xs text-emerald-300 transition-colors"
                        >
                          <Phone size={13} className="text-emerald-400" />
                          Chat on WhatsApp
                        </a>
                      ) : (
                        inq.phone && (
                          <a
                            href={`tel:${inq.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#262626] hover:bg-[#333333] text-xs text-[#FAF9F7] transition-colors"
                          >
                            <Phone size={13} className="text-[#C4A882]" />
                            Call Client
                          </a>
                        )
                      )}
                    </div>
                  </div>

                  {/* Shoot Details */}
                  <div className="space-y-2 p-3.5 rounded-lg bg-[#191919] border border-[#262626]">
                    <span className="text-[10px] uppercase tracking-wider text-[#C4A882] font-semibold block">
                      Shoot & Event Details
                    </span>

                    <div className="flex items-center justify-between">
                      <span className="text-[#888888]">Shoot Type:</span>
                      <span className="text-[#FAF9F7] font-medium">{inq.shootType}</span>
                    </div>

                    {inq.preferredDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#888888]">Preferred Date:</span>
                        <span className="text-[#FAF9F7] font-medium">{inq.preferredDate}</span>
                      </div>
                    )}

                    {inq.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#888888]">Location:</span>
                        <span className="text-[#FAF9F7] font-medium">{inq.location}</span>
                      </div>
                    )}

                    {inq.budget && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#888888]">Budget Range:</span>
                        <span className="text-[#C4A882] font-medium">{inq.budget}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Client Message */}
                <div className="p-3.5 rounded-lg bg-[#171717] border border-[#222222] text-xs">
                  <span className="text-[10px] uppercase tracking-wider text-[#666666] font-semibold block mb-1">
                    Client's Message:
                  </span>
                  <p className="text-[#dddddd] whitespace-pre-wrap leading-relaxed">
                    {inq.message}
                  </p>
                </div>

                {/* ── PRIVATE ADMIN NOTES ─────────────────────────────────── */}
                <div className="p-3.5 rounded-lg bg-[#141414] border border-[#C4A882]/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-[#C4A882] font-bold flex items-center gap-1.5">
                      <FileText size={12} />
                      Photographer Private Notes (Internal Only)
                    </span>
                    <button
                      type="button"
                      disabled={savingNoteId === inq._id}
                      onClick={() => handleSaveNote(inq._id)}
                      className="px-2.5 py-1 bg-[#C4A882] hover:bg-[#a8895f] text-[#0A0A0A] font-semibold text-[11px] rounded transition-all disabled:opacity-50"
                    >
                      {savingNoteId === inq._id ? "Saving…" : "Save Note"}
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Log private notes: consultation dates, custom quotes, contract status, special requests…"
                    value={noteDrafts[inq._id] ?? ""}
                    onChange={(e) =>
                      setNoteDrafts({ ...noteDrafts, [inq._id]: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#1a1a1a] border border-[#333333] focus:border-[#C4A882] rounded text-xs text-[#FAF9F7] placeholder-[#555555] outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete Confirmation Dialog ──────────────────────────────── */}
      {inquiryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#141414] border border-red-500/30 rounded-xl p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-[#FAF9F7] mb-2">
              Delete Client Inquiry?
            </h3>
            <p className="text-xs text-[#888888] mb-4">
              Are you sure you want to delete the inquiry from{" "}
              <strong className="text-[#FAF9F7]">{inquiryToDelete.name}</strong> ({inquiryToDelete.referenceId})? This action cannot be undone and will permanently remove this record from MongoDB.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setInquiryToDelete(null)}
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
