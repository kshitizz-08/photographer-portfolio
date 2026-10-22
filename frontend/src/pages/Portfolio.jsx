import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PhotoGrid, { PhotoGridSkeleton } from "../components/ui/PhotoGrid";
import SafeImage from "../components/common/SafeImage";
import { LoadingSpinner, ErrorState, EmptyState, GalleriesStripSkeleton } from "../components/ui/StatusNotice";
import { getPortfolioPhotos, getGalleries } from "../services/api";
import { CATEGORIES } from "../data/sampleData";

// ── Gallery cards strip ───────────────────────────────────────────────────────
function GalleriesStrip({ galleries, loading }) {
  if (loading) {
    return <GalleriesStripSkeleton count={3} />;
  }

  if (!galleries || galleries.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 mb-14" aria-labelledby="galleries-strip-heading">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-[#6b6b6b] mb-2">
            Curated Stories
          </p>
          <h2 id="galleries-strip-heading" className="font-serif text-2xl text-[#141414]">
            Gallery Collections
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleries.map((gallery) => (
          <Link
            key={gallery.slug}
            to={`/gallery/${gallery.slug}`}
            id={`gallery-card-${gallery.slug}`}
            className="group block overflow-hidden bg-[#E8E5DF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A882]"
            aria-label={`Open gallery: ${gallery.title}`}
          >
            {/* Cover image */}
            <div className="aspect-[4/3] overflow-hidden relative">
              <SafeImage
                src={gallery.coverImage?.imageUrl || gallery.coverImage?.src}
                alt={gallery.coverImage?.altText || gallery.coverImage?.alt || gallery.title}
                loading="lazy"
                decoding="async"
                targetWidth={800}
                widths={[400, 800, 1200]}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              {/* Category pill */}
              <span className="absolute top-3 left-3 text-[10px] tracking-[0.2em] uppercase bg-[#FAF9F7]/90 text-[#141414] px-2.5 py-1">
                {gallery.category}
              </span>
            </div>

            {/* Card footer */}
            <div className="flex items-center justify-between px-4 py-4 border-t border-[#E0DDD8]">
              <div className="min-w-0">
                <h3 className="font-serif text-base text-[#141414] group-hover:text-[#C4A882] transition-colors truncate">
                  {gallery.title}
                </h3>
                <p className="text-[11px] text-[#6b6b6b] mt-0.5 truncate">{gallery.subtitle}</p>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 ml-3 text-[#aaa] group-hover:text-[#141414] group-hover:translate-x-0.5 transition-all duration-200"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Portfolio page ────────────────────────────────────────────────────────────
export default function Portfolio() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category") || "All";
  const [activeCategory, setActiveCategory] = useState(urlCategory);

  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [photoError, setPhotoError] = useState(null);

  const [galleries, setGalleries] = useState([]);
  const [loadingGalleries, setLoadingGalleries] = useState(true);

  useEffect(() => {
    setActiveCategory(urlCategory);
  }, [urlCategory]);

  // Load photos independently so gallery response does not block photo display
  const loadPhotos = async (cat = activeCategory) => {
    setLoadingPhotos(true);
    setPhotoError(null);
    try {
      const data = await getPortfolioPhotos({
        category: cat === "All" ? undefined : cat,
      });
      setPhotos(data.photos || []);
    } catch (err) {
      console.error("[Portfolio] Photo API fetch error:", err);
      setPhotoError(err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  // Load galleries in parallel without blocking photographs
  const loadGalleries = async (cat = activeCategory) => {
    setLoadingGalleries(true);
    try {
      const list = await getGalleries({
        category: cat === "All" ? undefined : cat,
      });
      setGalleries(list || []);
    } catch (err) {
      console.warn("[Portfolio] Gallery fetch non-fatal error:", err.message);
      setGalleries([]);
    } finally {
      setLoadingGalleries(false);
    }
  };

  useEffect(() => {
    loadPhotos(activeCategory);
    loadGalleries(activeCategory);
  }, [activeCategory]);

  const handleCategoryChange = (cat) => {
    if (cat === activeCategory) return;
    setActiveCategory(cat);
    setSearchParams(cat === "All" ? {} : { category: cat });
    document
      .getElementById("portfolio-gallery-cards")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="pt-28 md:pt-32">
      {/* ── Page header ── */}
      <section
        className="max-w-7xl mx-auto px-6 mb-10 md:mb-14"
        aria-labelledby="portfolio-heading"
      >
        <p className="text-xs tracking-[0.3em] uppercase text-[#6b6b6b] mb-3">Work</p>
        <h1
          id="portfolio-heading"
          className="font-serif text-5xl md:text-6xl text-[#141414] mb-6"
        >
          Portfolio
        </h1>
        <div className="w-12 h-px bg-[#C4A882] mb-8" />
        <p className="text-sm text-[#6b6b6b] max-w-lg leading-relaxed">
          A selection of work across weddings, portraits, fashion, events, and travel.
          Browse curated gallery collections or explore individual photographs below.
        </p>
      </section>

      {/* ── Category filter bar ── */}
      <section
        className="max-w-7xl mx-auto px-6 mb-12"
        aria-label="Filter by category"
      >
        <div
          role="tablist"
          aria-label="Photography categories"
          className="flex items-center gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                role="tab"
                id={`filter-tab-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                aria-selected={isActive}
                onClick={() => handleCategoryChange(cat)}
                className={`
                  shrink-0 flex items-center gap-1.5
                  text-xs tracking-widest uppercase whitespace-nowrap
                  px-4 py-2 border transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A882]
                  ${
                    isActive
                      ? "bg-[#141414] text-[#FAF9F7] border-[#141414]"
                      : "bg-transparent text-[#6b6b6b] border-[#E0DDD8] hover:border-[#141414] hover:text-[#141414]"
                  }
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {!loadingPhotos && !photoError && (
          <p className="mt-4 text-xs text-[#aaa] tracking-wide">
            Showing{" "}
            <span className="text-[#6b6b6b] font-medium">{photos.length}</span>{" "}
            {photos.length === 1 ? "photograph" : "photographs"}
            {activeCategory !== "All" && (
              <>
                {" "}in{" "}
                <span className="text-[#6b6b6b] font-medium">{activeCategory}</span>
              </>
            )}
          </p>
        )}
      </section>

      {/* ── Gallery collections cards ── */}
      <div id="portfolio-gallery-cards">
        <GalleriesStrip galleries={galleries} loading={loadingGalleries} />
      </div>

      {/* ── Main Content Area ── */}
      {loadingPhotos ? (
        <div className="max-w-7xl mx-auto px-6 pb-28">
          <LoadingSpinner message="Fetching portfolio photographs…" />
          <PhotoGridSkeleton count={9} />
        </div>
      ) : photoError ? (
        <ErrorState
          error={photoError}
          onRetry={() => loadPhotos(activeCategory)}
          title="Could Not Load Portfolio"
        />
      ) : (
        <>
          {/* Divider between galleries and photo grid */}
          {photos.length > 0 && galleries.length > 0 && (
            <div className="max-w-7xl mx-auto px-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-[#E0DDD8]" />
                <p className="text-xs tracking-[0.3em] uppercase text-[#aaa]">All Photographs</p>
                <div className="flex-1 h-px bg-[#E0DDD8]" />
              </div>
            </div>
          )}

          {/* Photo grid or Empty State */}
          <section
            id="portfolio-grid"
            className="max-w-7xl mx-auto px-6 pb-28"
            aria-label={`${activeCategory} photography`}
            aria-live="polite"
          >
            {photos.length > 0 ? (
              <PhotoGrid photos={photos} />
            ) : (
              <EmptyState
                title="No photographs found"
                message={`There are no published photographs in the "${activeCategory}" collection yet.`}
                onReset={activeCategory !== "All" ? () => handleCategoryChange("All") : null}
              />
            )}
          </section>
        </>
      )}
    </main>
  );
}
