import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  MapPin,
  Calendar,
  Camera,
} from "lucide-react";
import PhotoGrid from "../components/ui/PhotoGrid";
import SafeImage from "../components/common/SafeImage";
import { LoadingSpinner, ErrorState, GalleryDetailSkeleton } from "../components/ui/StatusNotice";
import { getGalleryBySlug, getGalleries } from "../services/api";

// ── Copy-link button ──────────────────────────────────────────────────────────
function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, []);

  return (
    <button
      id="copy-gallery-link"
      onClick={handleCopy}
      aria-label={copied ? "Link copied" : "Copy gallery link to clipboard"}
      className={`
        inline-flex items-center gap-2 text-xs tracking-widest uppercase
        border px-4 py-2.5 transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A882]
        ${
          copied
            ? "border-[#C4A882] text-[#C4A882]"
            : "border-[#E0DDD8] text-[#6b6b6b] hover:border-[#141414] hover:text-[#141414]"
        }
      `}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Link Copied" : "Copy Link"}
    </button>
  );
}

// ── Related galleries strip ───────────────────────────────────────────────────
function RelatedGalleries({ currentSlug, currentCategory, allGalleries }) {
  const related = (allGalleries || []).filter(
    (g) => g.slug !== currentSlug && g.category === currentCategory
  ).slice(0, 3);

  const others = (allGalleries || []).filter(
    (g) => g.slug !== currentSlug && g.category !== currentCategory
  );
  const combined = [...related, ...others].slice(0, 3);

  if (combined.length === 0) return null;

  return (
    <section className="border-t border-[#E0DDD8] pt-16 mt-16" aria-labelledby="related-heading">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-[#6b6b6b] mb-2">More Stories</p>
          <h2 id="related-heading" className="font-serif text-3xl text-[#141414]">
            Other Galleries
          </h2>
        </div>
        <Link
          to="/portfolio"
          className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#6b6b6b] hover:text-[#141414] transition-colors border-b border-transparent hover:border-[#141414] pb-0.5"
        >
          View Portfolio <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {combined.map((g) => (
          <Link
            key={g.slug}
            to={`/gallery/${g.slug}`}
            className="group block overflow-hidden bg-[#E8E5DF]"
            aria-label={`View gallery: ${g.title}`}
          >
            <div className="aspect-[4/3] overflow-hidden">
              <SafeImage
                src={g.coverImage?.imageUrl || g.coverImage?.src}
                alt={g.coverImage?.altText || g.coverImage?.alt || g.title}
                loading="lazy"
                decoding="async"
                targetWidth={800}
                widths={[400, 800, 1200]}
                sizes="(max-width: 640px) 100vw, 33vw"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
            <div className="p-4 border-t border-[#E0DDD8]">
              <h3 className="font-serif text-base text-[#141414] group-hover:text-[#C4A882] transition-colors truncate">
                {g.title}
              </h3>
              <p className="text-[11px] text-[#6b6b6b] mt-0.5 truncate">{g.subtitle || g.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Not-found state ───────────────────────────────────────────────────────────
function GalleryNotFound({ slug, allGalleries }) {
  return (
    <main className="pt-32 pb-28">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center gap-6 py-24">
        <div className="w-16 h-16 border border-[#E0DDD8] flex items-center justify-center">
          <Camera size={24} className="text-[#C4A882]" />
        </div>
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-[#6b6b6b] mb-3">404</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#141414] mb-4">
            Gallery Not Found
          </h1>
          <p className="text-[#6b6b6b] max-w-sm leading-relaxed">
            No gallery exists at <code className="text-sm bg-[#F5F3EF] px-1.5 py-0.5">/gallery/{slug}</code>.
            It may have been renamed or removed.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 bg-[#141414] text-[#FAF9F7] text-xs tracking-widest uppercase px-6 py-3 hover:bg-[#3a3a3a] transition-colors duration-200"
          >
            <ArrowLeft size={13} /> Browse Portfolio
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 border border-[#E0DDD8] text-[#6b6b6b] text-xs tracking-widest uppercase px-6 py-3 hover:border-[#141414] hover:text-[#141414] transition-all duration-200"
          >
            Go Home
          </Link>
        </div>

        {allGalleries && allGalleries.length > 0 && (
          <div className="w-full max-w-2xl mt-8 text-left border-t border-[#E0DDD8] pt-8">
            <p className="text-xs tracking-[0.3em] uppercase text-[#6b6b6b] mb-5">
              Available Galleries
            </p>
            <ul className="flex flex-col divide-y divide-[#E0DDD8]">
              {allGalleries.map((g) => (
                <li key={g.slug}>
                  <Link
                    to={`/gallery/${g.slug}`}
                    className="flex items-center justify-between py-3 group"
                  >
                    <span className="font-serif text-base text-[#141414] group-hover:text-[#C4A882] transition-colors">
                      {g.title}
                    </span>
                    <span className="text-xs text-[#6b6b6b]">
                      {g.category} {g.year ? `· ${g.year}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}

// ── Main Gallery page ─────────────────────────────────────────────────────────
export default function Gallery() {
  const { slug } = useParams();
  const [gallery, setGallery] = useState(null);
  const [allGalleries, setAllGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGallery = async () => {
    setLoading(true);
    setError(null);
    try {
      // Essential request: fetch this specific gallery first
      const fetchedGallery = await getGalleryBySlug(slug);
      setGallery(fetchedGallery);

      // Non-blocking background fetch for other recommendations
      getGalleries()
        .then((list) => setAllGalleries(list || []))
        .catch(() => setAllGalleries([]));
    } catch (err) {
      console.error("[Gallery] Fetch error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (loading) {
    return (
      <main className="pt-20 pb-28">
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">
          <LoadingSpinner message="Loading gallery story…" />
        </div>
        <GalleryDetailSkeleton />
      </main>
    );
  }

  if (error && error.status === 404) {
    return <GalleryNotFound slug={slug} allGalleries={allGalleries} />;
  }

  if (error) {
    return (
      <main className="pt-32 pb-28 max-w-7xl mx-auto px-6">
        <ErrorState error={error} onRetry={loadGallery} title="Failed to Load Gallery" />
      </main>
    );
  }

  if (!gallery) {
    return <GalleryNotFound slug={slug} allGalleries={allGalleries} />;
  }

  const coverSrc = gallery.coverImage?.imageUrl || gallery.coverImage?.src;
  const coverAlt = gallery.coverImage?.altText || gallery.coverImage?.alt || gallery.title;

  return (
    <main>
      {/* ── Hero cover ── */}
      <section className="relative h-[60vh] min-h-[420px] flex items-end" aria-label="Gallery cover">
        <div className="absolute inset-0">
          <SafeImage
            src={coverSrc}
            alt={coverAlt}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            hero={true}
            targetWidth={1920}
            widths={[640, 1080, 1920, 2560]}
            sizes="100vw"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pb-14 w-full">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-white/50 text-xs tracking-widest uppercase mb-6 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} /> Portfolio
          </Link>

          <p className="text-white/50 text-[10px] tracking-[0.3em] uppercase mb-3">
            {gallery.category}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-3">
            {gallery.title}
          </h1>
          {gallery.subtitle && (
            <p className="text-white/70 text-sm tracking-wide font-light">{gallery.subtitle}</p>
          )}
        </div>
      </section>

      {/* ── Narrative & Meta bar ── */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2">
            <div className="w-10 h-px bg-[#C4A882] mb-6" />
            <p className="text-[#3a3a3a] text-base md:text-lg leading-relaxed font-light">
              {gallery.description}
            </p>
          </div>

          <aside className="border border-[#E0DDD8] p-6 flex flex-col gap-5 text-xs text-[#6b6b6b]">
            {gallery.location && (
              <div className="flex items-center gap-3">
                <MapPin size={14} className="text-[#C4A882] shrink-0" />
                <span>{gallery.location}</span>
              </div>
            )}
            {gallery.year && (
              <div className="flex items-center gap-3">
                <Calendar size={14} className="text-[#C4A882] shrink-0" />
                <span>{gallery.year}</span>
              </div>
            )}
            {gallery.photos && (
              <div className="flex items-center gap-3">
                <Camera size={14} className="text-[#C4A882] shrink-0" />
                <span>{gallery.photos.length} Photographs</span>
              </div>
            )}

            <div className="pt-2 border-t border-[#E0DDD8] flex items-center justify-between gap-3">
              <CopyLinkButton />
              <Link
                to={`/contact?ref=${gallery.slug}`}
                className="bg-[#141414] text-[#FAF9F7] text-xs tracking-widest uppercase px-4 py-2.5 hover:bg-[#333] transition-colors text-center"
              >
                Book Similar
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Photo Grid ── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {gallery.photos && gallery.photos.length > 0 ? (
          <PhotoGrid photos={gallery.photos} />
        ) : (
          <p className="text-center py-12 text-sm text-[#888]">No photographs in this collection yet.</p>
        )}
      </section>

      {/* ── Related Galleries ── */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <RelatedGalleries
          currentSlug={slug}
          currentCategory={gallery.category}
          allGalleries={allGalleries}
        />
      </div>
    </main>
  );
}
