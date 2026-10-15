import { Link } from "react-router-dom";
import { Share2, Link2, Mail, MapPin } from "lucide-react";
import { useProfile } from "../../context/ProfileContext";

const NAV_LINKS = [
  { to: "/portfolio", label: "Portfolio" },
  { to: "/services",  label: "Services"  },
  { to: "/about",     label: "About"     },
  { to: "/contact",   label: "Contact"   },
];

export default function Footer() {
  const { profile } = useProfile();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#141414] text-[#FAF9F7] mt-32">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 border-b border-white/10 pb-14">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="font-serif text-2xl text-[#FAF9F7] hover:opacity-75 transition-opacity">
              {profile.name}
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              {profile.shortBio || profile.bio}
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-5 mt-2">
              <a
                href={profile.socialLinks?.instagram || profile.instagram || "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white/40 hover:text-[#C4A882] transition-colors"
              >
                <Share2 size={18} />
              </a>
              <a
                href={profile.socialLinks?.facebook || profile.facebook || "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-white/40 hover:text-[#C4A882] transition-colors"
              >
                <Link2 size={18} />
              </a>
            </div>
          </div>

          {/* Navigation column */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs tracking-widest uppercase text-white/30 mb-1">Pages</h3>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-white/60 hover:text-[#FAF9F7] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs tracking-widest uppercase text-white/30 mb-1">Get in Touch</h3>
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-[#FAF9F7] transition-colors"
            >
              <Mail size={15} className="shrink-0" />
              {profile.email}
            </a>
            <span className="flex items-center gap-2 text-sm text-white/60">
              <MapPin size={15} className="shrink-0" />
              {profile.location}
            </span>
            <Link
              to="/contact"
              className="mt-2 self-start text-xs tracking-widest uppercase border border-white/30 text-white/70 px-5 py-2.5 hover:border-white hover:text-[#FAF9F7] transition-all duration-200"
            >
              Book a Session
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 text-xs text-white/30">
          <p>© {year} {profile.name}. All rights reserved.</p>
          <p>Photography • {profile.location || "Fine Art"}</p>
        </div>
      </div>
    </footer>
  );
}
