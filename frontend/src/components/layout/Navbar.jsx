import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useProfile } from "../../context/ProfileContext";

const NAV_LINKS = [
  { to: "/",         label: "Home"      },
  { to: "/portfolio",label: "Portfolio" },
  { to: "/services", label: "Services"  },
  { to: "/about",    label: "About"     },
  { to: "/contact",  label: "Contact"   },
];

export default function Navbar() {
  const { profile } = useProfile();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const linkClass = ({ isActive }) =>
    `text-sm tracking-widest uppercase transition-colors duration-200 ${
      isActive
        ? "text-[#141414] border-b border-[#C4A882] pb-0.5"
        : "text-[#6b6b6b] hover:text-[#141414]"
    }`;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#FAF9F7]/95 backdrop-blur-sm border-b border-[#E0DDD8] py-4"
            : "bg-transparent py-6"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            className="font-serif text-xl text-[#141414] tracking-wide hover:opacity-75 transition-opacity"
          >
            {profile.name}
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.to === "/"} className={linkClass}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <Link
            to="/contact"
            className="hidden md:inline-flex items-center gap-2 text-sm tracking-widest uppercase border border-[#141414] text-[#141414] px-5 py-2 hover:bg-[#141414] hover:text-[#FAF9F7] transition-all duration-200"
          >
            Book a Shoot
          </Link>

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-1 text-[#141414]"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#FAF9F7] flex flex-col pt-24 pb-10 px-8">
          <ul className="flex flex-col gap-8 mt-4">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `font-serif text-3xl transition-colors ${
                      isActive ? "text-[#141414]" : "text-[#6b6b6b] hover:text-[#141414]"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className="mt-auto self-start text-sm tracking-widest uppercase border border-[#141414] px-6 py-3 hover:bg-[#141414] hover:text-[#FAF9F7] transition-all duration-200"
          >
            Book a Shoot
          </Link>
        </div>
      )}
    </>
  );
}
