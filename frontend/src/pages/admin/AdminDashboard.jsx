/**
 * pages/admin/AdminDashboard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Photographer Studio Overview Dashboard.
 * Displays real-time database counts, quick management links, recent inquiries,
 * and portfolio overview.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Images,
  FolderOpen,
  Sparkles,
  Inbox,
  Plus,
  ArrowRight,
  Clock,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Star
} from "lucide-react";
import SafeImage from "../../components/common/SafeImage";
import { useAuth } from "../../context/AuthContext";
import { getAdminStats } from "../../services/api";

export default function AdminDashboard() {
  const { photographer } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getAdminStats();
      if (res.success) {
        setStatsData(res);
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError("Failed to load dashboard analytics. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = statsData?.stats;
  const recentInquiries = statsData?.recentInquiries || [];
  const recentPhotos = statsData?.recentPhotos || [];

  return (
    <div className="space-y-8">
      {/* ── Greeting & Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C4A882]/15">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C4A882] font-semibold">
            Executive Studio Overview
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF9F7] mt-1">
            Welcome, {photographer?.name || "Photographer"}
          </h1>
          <p className="text-sm text-[#999999] mt-1">
            Manage your fine art portfolio, galleries, investment packages, and client leads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/portfolio"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C4A882] hover:bg-[#a8895f] text-[#0A0A0A] font-semibold text-xs tracking-wider uppercase rounded-md transition-all shadow-md shadow-[#C4A882]/10"
          >
            <Plus size={16} />
            Add Photograph
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#C4A882]/30 hover:border-[#C4A882] text-xs text-[#FAF9F7] rounded-md transition-colors"
          >
            <ExternalLink size={14} />
            Live Site
          </a>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* ── Metric Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Photos Card */}
        <div className="p-5 rounded-xl bg-[#141414] border border-[#C4A882]/20 hover:border-[#C4A882]/40 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#999999] font-medium">
              Portfolio Photos
            </span>
            <div className="p-2 rounded-lg bg-[#C4A882]/10 text-[#C4A882]">
              <Images size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#FAF9F7]">
              {loading ? "…" : stats?.photos?.total ?? 0}
            </span>
            <span className="text-xs text-[#666666]">total in archive</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#222222] flex items-center justify-between text-xs text-[#999999]">
            <span>{stats?.photos?.published ?? 0} published</span>
            <span className="text-[#C4A882]">{stats?.photos?.featured ?? 0} featured</span>
          </div>
        </div>

        {/* Galleries Card */}
        <div className="p-5 rounded-xl bg-[#141414] border border-[#C4A882]/20 hover:border-[#C4A882]/40 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#999999] font-medium">
              Galleries
            </span>
            <div className="p-2 rounded-lg bg-[#C4A882]/10 text-[#C4A882]">
              <FolderOpen size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#FAF9F7]">
              {loading ? "…" : stats?.galleries?.total ?? 0}
            </span>
            <span className="text-xs text-[#666666]">collections</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#222222] flex items-center justify-between text-xs text-[#999999]">
            <span>{stats?.galleries?.published ?? 0} live collections</span>
            <Link to="/admin/galleries" className="hover:text-[#C4A882] transition-colors">
              Manage →
            </Link>
          </div>
        </div>

        {/* Services Card */}
        <div className="p-5 rounded-xl bg-[#141414] border border-[#C4A882]/20 hover:border-[#C4A882]/40 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#999999] font-medium">
              Services & Packages
            </span>
            <div className="p-2 rounded-lg bg-[#C4A882]/10 text-[#C4A882]">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#FAF9F7]">
              {loading ? "…" : stats?.services?.total ?? 0}
            </span>
            <span className="text-xs text-[#666666]">offerings</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#222222] flex items-center justify-between text-xs text-[#999999]">
            <span>{stats?.services?.published ?? 0} active packages</span>
            <Link to="/admin/services" className="hover:text-[#C4A882] transition-colors">
              Edit →
            </Link>
          </div>
        </div>

        {/* Inquiries Card */}
        <div className="p-5 rounded-xl bg-[#141414] border border-[#C4A882]/20 hover:border-[#C4A882]/40 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#999999] font-medium">
              Client Inquiries
            </span>
            <div className="p-2 rounded-lg bg-[#C4A882]/10 text-[#C4A882]">
              <Inbox size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#FAF9F7]">
              {loading ? "…" : stats?.inquiries?.total ?? 0}
            </span>
            {stats?.inquiries?.new > 0 ? (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#C4A882] text-[#0A0A0A]">
                {stats.inquiries.new} New
              </span>
            ) : (
              <span className="text-xs text-[#666666]">all reviewed</span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-[#222222] flex items-center justify-between text-xs text-[#999999]">
            <span className="text-emerald-400">Database connected</span>
            <Link to="/admin/inquiries" className="hover:text-[#C4A882] transition-colors">
              Open Inbox →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Content Grid: Recent Inquiries & Recent Photos ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Client Inquiries (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#141414] border border-[#C4A882]/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222222]">
              <div className="flex items-center gap-2">
                <Inbox size={18} className="text-[#C4A882]" />
                <h2 className="font-serif text-lg font-bold text-[#FAF9F7]">
                  Recent Client Inquiries
                </h2>
              </div>
              <Link
                to="/admin/inquiries"
                className="text-xs text-[#C4A882] hover:underline flex items-center gap-1"
              >
                View all ({stats?.inquiries?.total ?? 0})
                <ArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-[#666666]">
                Loading inquiries from MongoDB…
              </div>
            ) : recentInquiries.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#666666]">
                No client inquiries recorded yet. Test submissions from the public Contact page will appear here.
              </div>
            ) : (
              <div className="divide-y divide-[#222222]">
                {recentInquiries.map((inq) => {
                  const statusColors = {
                    new: "bg-amber-500/15 text-amber-300 border-amber-500/30",
                    read: "bg-blue-500/15 text-blue-300 border-blue-500/30",
                    replied: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
                    booked: "bg-purple-500/15 text-purple-300 border-purple-500/30",
                    archived: "bg-stone-500/15 text-stone-300 border-stone-500/30",
                  };
                  return (
                    <div
                      key={inq._id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1a1a1a] px-2 rounded-lg transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-[#FAF9F7] truncate">
                            {inq.name}
                          </span>
                          <span
                            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              statusColors[inq.status] || "bg-stone-500/15 text-stone-300"
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[#888888] mt-1 flex-wrap">
                          <span>{inq.shootType || "Session"}</span>
                          {inq.preferredDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {inq.preferredDate}
                            </span>
                          )}
                          <span className="text-[#666666] truncate">{inq.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`mailto:${inq.email}?subject=${photographer?.name ?? "Photography"} - Regarding your ${inq.shootType || "shoot"} inquiry`}
                          className="p-1.5 rounded bg-[#222222] hover:bg-[#333333] text-[#999999] hover:text-[#FAF9F7] transition-colors"
                          title="Send Email"
                        >
                          <Mail size={14} />
                        </a>
                        <Link
                          to="/admin/inquiries"
                          className="px-2.5 py-1 text-xs border border-[#C4A882]/30 hover:border-[#C4A882] text-[#C4A882] rounded transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Studio Actions & Portfolio Preview */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="p-6 rounded-xl bg-[#141414] border border-[#C4A882]/15">
            <h3 className="font-serif text-base font-bold text-[#FAF9F7] mb-3 pb-2 border-b border-[#222222]">
              Quick Shortcuts
            </h3>
            <div className="space-y-2">
              <Link
                to="/admin/portfolio"
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222222] text-sm text-[#FAF9F7] hover:text-[#C4A882] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Images size={16} className="text-[#C4A882]" />
                  <span>Manage Portfolio</span>
                </div>
                <ArrowRight size={14} className="text-[#666666]" />
              </Link>

              <Link
                to="/admin/galleries"
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222222] text-sm text-[#FAF9F7] hover:text-[#C4A882] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <FolderOpen size={16} className="text-[#C4A882]" />
                  <span>Manage Galleries</span>
                </div>
                <ArrowRight size={14} className="text-[#666666]" />
              </Link>

              <Link
                to="/admin/services"
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222222] text-sm text-[#FAF9F7] hover:text-[#C4A882] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-[#C4A882]" />
                  <span>Update Services</span>
                </div>
                <ArrowRight size={14} className="text-[#666666]" />
              </Link>

              <Link
                to="/admin/settings"
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222222] text-sm text-[#FAF9F7] hover:text-[#C4A882] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#C4A882]" />
                  <span>Photographer Profile</span>
                </div>
                <ArrowRight size={14} className="text-[#666666]" />
              </Link>
            </div>
          </div>

          {/* Recent Portfolio Additions Preview */}
          <div className="p-6 rounded-xl bg-[#141414] border border-[#C4A882]/15">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#222222]">
              <h3 className="font-serif text-base font-bold text-[#FAF9F7]">
                Recent Uploads
              </h3>
              <Link to="/admin/portfolio" className="text-xs text-[#C4A882] hover:underline">
                View all
              </Link>
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-[#666666]">Loading…</div>
            ) : recentPhotos.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#666666]">No photos added yet.</div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {recentPhotos.map((photo) => (
                  <div
                    key={photo._id}
                    className="group relative aspect-square rounded overflow-hidden bg-[#222222]"
                    title={photo.title}
                  >
                    <SafeImage
                      src={photo.imageUrl || photo.src}
                      alt={photo.altText || photo.alt || photo.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {photo.isFeatured && (
                      <span className="absolute top-1 right-1 p-0.5 rounded bg-black/60 text-amber-400">
                        <Star size={10} fill="currentColor" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
