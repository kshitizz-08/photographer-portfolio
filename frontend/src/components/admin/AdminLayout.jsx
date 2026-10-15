/**
 * components/admin/AdminLayout.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Master layout for the photographer's admin portal.
 * Features:
 * - Fixed responsive sidebar with brand identity, nav items, and inquiry badges
 * - Topbar with mobile drawer trigger, live site link, and user profile
 * - Responsive shell for dashboard, portfolio, galleries, services, inquiries, settings
 */

import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Images,
  FolderOpen,
  Sparkles,
  Inbox,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Camera,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAdminStats } from "../../services/api";

const NAV_ITEMS = [
  { name: "Dashboard",   path: "/admin/dashboard",  icon: LayoutDashboard },
  { name: "Portfolio",   path: "/admin/portfolio",  icon: Images },
  { name: "Galleries",   path: "/admin/galleries",  icon: FolderOpen },
  { name: "Services",    path: "/admin/services",   icon: Sparkles },
  { name: "Inquiries",   path: "/admin/inquiries",  icon: Inbox, hasBadge: true },
  { name: "Settings",    path: "/admin/settings",   icon: Settings },
];

export default function AdminLayout() {
  const { photographer, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [newInquiriesCount, setNewInquiriesCount] = useState(0);

  // Fetch pending inquiry count for sidebar badge
  const refreshInquiriesCount = async () => {
    try {
      const data = await getAdminStats();
      if (data?.stats?.inquiries?.new !== undefined) {
        setNewInquiriesCount(data.stats.inquiries.new);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshInquiriesCount();
    const interval = setInterval(refreshInquiriesCount, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAF9F7] font-sans flex flex-col md:flex-row antialiased selection:bg-[#C4A882]/30 selection:text-[#FAF9F7]">
      {/* ── Sidebar Desktop & Mobile ────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#111111]/95 backdrop-blur-xl border-r border-[#C4A882]/15 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-[#C4A882]/15">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-[#C4A882]/15 border border-[#C4A882]/30 flex items-center justify-center text-[#C4A882] group-hover:scale-105 transition-transform">
              <Camera size={18} />
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-wide text-[#FAF9F7] group-hover:text-[#C4A882] transition-colors block leading-tight">
                EmoHarmony
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#C4A882] font-semibold block">
                Photographer Admin
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-[#999999] hover:text-[#FAF9F7] p-1"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#C4A882]/15 text-[#C4A882] font-semibold border-l-2 border-[#C4A882]"
                      : "text-[#999999] hover:text-[#FAF9F7] hover:bg-[#FFFFFF]/5"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.hasBadge && newInquiriesCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#C4A882] text-[#0A0A0A]">
                    {newInquiriesCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-[#C4A882]/15 space-y-3 bg-[#0D0D0D]">
          {/* Live site link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[#999999] hover:text-[#C4A882] hover:bg-[#FFFFFF]/5 rounded-md transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} />
              View Public Website
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#666666]">Live</span>
          </a>

          {/* User info & Logout */}
          <div className="pt-2 border-t border-[#222222] flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-medium text-[#FAF9F7] truncate">
                {photographer?.name || "Photographer"}
              </p>
              <p className="text-[10px] text-[#666666] truncate">
                {photographer?.email || ""}
              </p>
            </div>
            <button
              id="admin-sidebar-logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-1.5 text-[#f87171] hover:bg-[#f87171]/10 rounded-md transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 h-16 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#C4A882]/15 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-[#999999] hover:text-[#FAF9F7] p-1.5 rounded-md hover:bg-[#FFFFFF]/5"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-xs uppercase tracking-widest text-[#C4A882] font-semibold">
                Studio Management Portal
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#999999] hover:text-[#C4A882] transition-colors"
            >
              <ExternalLink size={13} />
              Live Site
            </a>
            <div className="h-4 w-px bg-[#333333] hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#C4A882]/20 border border-[#C4A882]/40 flex items-center justify-center text-xs font-serif font-bold text-[#C4A882]">
                {photographer?.name ? photographer.name.charAt(0) : "P"}
              </div>
              <span className="text-xs font-medium text-[#FAF9F7] hidden sm:inline">
                {photographer?.name || "Photographer"}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
