import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import PhotoGrid from "../components/ui/PhotoGrid";
import SafeImage from "../components/common/SafeImage";
import { getFeaturedPortfolioPhotos, getServices } from "../services/api";
import { useProfile } from "../context/ProfileContext";
import { formatINRFrom } from "../utils/currency";
import {
  HERO_IMAGE,
  PHOTOGRAPHER_PORTRAIT,
  SERVICES as FALLBACK_SERVICES,
  TESTIMONIALS,
} from "../data/sampleData";

// ── Section: Hero ─────────────────────────────────────────────────────────────
function Hero({ photographer }) {
  const p = photographer;
  return (
    <section className="relative h-screen min-h-[600px] flex items-end" aria-label="Hero">
      {/* Background image */}
      <div className="absolute inset-0">
        <SafeImage
          src={p.heroImage || HERO_IMAGE}
          alt="Photography hero — sweeping mountain landscape"
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Text */}
      <div className="relative max-w-7xl mx-auto px-6 pb-20 w-full">
        <p className="text-white/60 text-xs tracking-[0.35em] uppercase mb-5">
          {p.location || "New York, USA & Worldwide"}
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight max-w-3xl mb-8">
          {p.heroHeading || p.tagline || "Capturing Moments That Last Forever."}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/portfolio"
            id="hero-explore-btn"
            className="inline-flex items-center gap-2 bg-[#FAF9F7] text-[#141414] text-sm tracking-widest uppercase px-7 py-3.5 hover:bg-white transition-colors duration-200"
          >
            Explore My Work
            <ArrowRight size={15} />
          </Link>
          <Link
            to="/contact"
            id="hero-book-btn"
            className="inline-flex items-center gap-2 border border-white text-white text-sm tracking-widest uppercase px-7 py-3.5 hover:bg-white/10 transition-colors duration-200"
          >
            Book a Shoot
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
        <ChevronDown size={22} />
      </div>
    </section>
  );
}

// ── Section: Featured Work ────────────────────────────────────────────────────
function FeaturedWork({ photos }) {
  const displayPhotos = photos || [];
  return (
    <section className="max-w-7xl mx-auto px-6 py-28" aria-labelledby="featured-heading">
      <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-[#6b6b6b] mb-3">Selected Work</p>
          <h2 id="featured-heading" className="font-serif text-4xl md:text-5xl text-[#141414]">
            Featured Photography
          </h2>
        </div>
        <Link
          to="/portfolio"
          className="flex items-center gap-2 text-sm tracking-widest uppercase text-[#6b6b6b] hover:text-[#141414] transition-colors border-b border-transparent hover:border-[#141414] pb-0.5"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>
      {displayPhotos.length > 0 ? (
        <PhotoGrid photos={displayPhotos} />
      ) : (
        <div className="py-16 text-center border border-dashed border-[#E0DDD8] my-4 px-6">
          <p className="font-serif text-xl text-[#141414] mb-2">No Featured Photographs</p>
          <p className="text-sm text-[#777] max-w-md mx-auto mb-6">
            No photographs have been marked as featured yet.
          </p>
          <Link
            to="/portfolio"
            className="text-xs tracking-widest uppercase border-b border-[#141414] pb-1 text-[#141414] hover:text-[#C4A882] transition-colors"
          >
            Explore Full Portfolio
          </Link>
        </div>
      )}
    </section>
  );
}

// ── Section: Categories ───────────────────────────────────────────────────────
function Categories() {
  const items = [
    {
      label: "Wedding",
      sub: "Timeless celebrations",
      img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "Pre-Wedding",
      sub: "Love before the big day",
      img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "Portrait",
      sub: "Authentic presence",
      img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "Events",
      sub: "Moments worth remembering",
      img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "Fashion",
      sub: "Editorial & style",
      img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "Travel",
      sub: "Places & light",
      img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <section className="bg-[#F5F3EF] py-28" aria-labelledby="categories-heading">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-[#6b6b6b] mb-3">Specialisations</p>
          <h2 id="categories-heading" className="font-serif text-4xl md:text-5xl text-[#141414]">
            Photography Categories
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {items.map((item) => (
            <Link
              key={item.label}
              to={`/portfolio?category=${item.label}`}
              className="group relative overflow-hidden aspect-[3/4] bg-[#E0DDD8]"
              aria-label={`Browse ${item.label} photography`}
            >
              <SafeImage
                src={item.img}
                alt={item.label}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors duration-300 flex flex-col items-center justify-end pb-8">
                <h3 className="font-serif text-white text-xl md:text-2xl">{item.label}</h3>
                <p className="text-white/60 text-xs tracking-wider uppercase mt-1">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: About Snippet ────────────────────────────────────────────────────
function AboutSnippet({ photographer }) {
  const p = photographer || FALLBACK_PHOTOGRAPHER;
  const portrait = p.profileImage?.imageUrl || p.profileImage?.src || PHOTOGRAPHER_PORTRAIT;

  return (
    <section className="max-w-7xl mx-auto px-6 py-28" aria-labelledby="about-snippet-heading">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Image */}
        <div className="aspect-[4/5] overflow-hidden bg-[#E0DDD8]">
          <SafeImage
            src={portrait}
            alt={`${p.name} — photographer`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-6">
          <p className="text-xs tracking-[0.3em] uppercase text-[#6b6b6b]">
            {p.sectionLabel || "The Photographer"}
          </p>
          <h2 id="about-snippet-heading" className="font-serif text-4xl md:text-5xl text-[#141414] leading-snug">
            {p.name}
          </h2>
          <div className="w-12 h-px bg-[#C4A882]" />
          <p className="text-[#6b6b6b] leading-relaxed text-base">
            {p.bio}
          </p>
          {p.bioExtra && (
            <p className="text-[#6b6b6b] leading-relaxed text-base">
              {p.bioExtra}
            </p>
          )}
          <Link
            to="/about"
            className="self-start flex items-center gap-2 text-sm tracking-widest uppercase text-[#141414] border-b border-[#141414] pb-0.5 hover:border-[#C4A882] hover:text-[#C4A882] transition-colors"
          >
            Read My Story <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Section: Services Preview ─────────────────────────────────────────────────
function ServicesPreview({ services }) {
  const items = services && services.length > 0 ? services.slice(0, 4) : FALLBACK_SERVICES;

  return (
    <section className="bg-[#141414] py-28" aria-labelledby="services-preview-heading">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-3">What I Offer</p>
            <h2 id="services-preview-heading" className="font-serif text-4xl md:text-5xl text-[#FAF9F7]">
              Services
            </h2>
          </div>
          <Link
            to="/services"
            className="flex items-center gap-2 text-sm tracking-widest uppercase text-white/50 hover:text-white transition-colors border-b border-transparent hover:border-white/50 pb-0.5"
          >
            All Services <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
          {items.map((service, idx) => {
            const title = service.name || service.title;
            const imgSrc = service.coverImage?.imageUrl || service.coverImage?.src || service.image;
            const price = formatINRFrom(service.startingPrice) || service.price || null;

            return (
              <div key={service.slug || service._id || idx} className="bg-[#141414] p-8 hover:bg-[#1e1e1e] transition-colors group">
                <div className="aspect-square overflow-hidden mb-6 bg-white/5">
                  {imgSrc && (
                    <SafeImage
                      src={imgSrc}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                    />
                  )}
                </div>
                <h3 className="font-serif text-lg text-[#FAF9F7] mb-2">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-4 line-clamp-3">
                  {service.description}
                </p>
                {price && (
                  <p className="text-xs tracking-widest uppercase text-[#C4A882]">{price}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Section: Testimonials ─────────────────────────────────────────────────────
function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-28" aria-labelledby="testimonials-heading">
      <div className="text-center mb-14">
        <p className="text-xs tracking-[0.3em] uppercase text-[#6b6b6b] mb-3">Kind Words</p>
        <h2 id="testimonials-heading" className="font-serif text-4xl md:text-5xl text-[#141414]">
          Client Stories
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {TESTIMONIALS.map((t) => (
          <blockquote key={t.id} className="flex flex-col gap-5 border-t border-[#E0DDD8] pt-8">
            <p className="font-serif text-lg text-[#141414] leading-relaxed italic">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer>
              <cite className="not-italic">
                <span className="block text-sm font-medium text-[#141414]">{t.name}</span>
                <span className="text-xs text-[#6b6b6b] tracking-wide">{t.role}</span>
              </cite>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

// ── Section: Contact CTA ──────────────────────────────────────────────────────
function ContactCTA() {
  return (
    <section className="bg-[#F5F3EF] py-28 px-6 text-center" aria-labelledby="cta-heading">
      <p className="text-xs tracking-[0.3em] uppercase text-[#6b6b6b] mb-4">Ready to Begin?</p>
      <h2 id="cta-heading" className="font-serif text-4xl md:text-5xl text-[#141414] max-w-2xl mx-auto mb-6 leading-snug">
        Let&rsquo;s create something beautiful together.
      </h2>
      <p className="text-[#6b6b6b] max-w-md mx-auto mb-10 leading-relaxed">
        Whether you are planning a wedding, need professional portraits, or have a creative project in mind — I would love to hear from you.
      </p>
      <Link
        to="/contact"
        id="home-cta-btn"
        className="inline-flex items-center gap-2 bg-[#141414] text-[#FAF9F7] text-sm tracking-widest uppercase px-8 py-4 hover:bg-[#3a3a3a] transition-colors duration-200"
      >
        Start a Conversation <ArrowRight size={15} />
      </Link>
    </section>
  );
}

// ── Page: Home ────────────────────────────────────────────────────────────────
export default function Home() {
  const { profile } = useProfile();
  const [featuredPhotos, setFeaturedPhotos] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    getFeaturedPortfolioPhotos()
      .then((data) => setFeaturedPhotos(data || []))
      .catch((err) => {
        console.warn("[Home] Could not load featured photos:", err.message);
        setFeaturedPhotos([]);
      });

    getServices()
      .then((data) => setServices(data || []))
      .catch((err) => console.warn("[Home] Using fallback services:", err.message));
  }, []);

  return (
    <main>
      <Hero photographer={profile} />
      <FeaturedWork photos={featuredPhotos} />
      <Categories />
      <AboutSnippet photographer={profile} />
      <ServicesPreview services={services} />
      <Testimonials />
      <ContactCTA />
    </main>
  );
}
