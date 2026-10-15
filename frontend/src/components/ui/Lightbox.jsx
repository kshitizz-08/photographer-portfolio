import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, MapPin, AlertCircle } from "lucide-react";
import { resolveImageUrl } from "../../utils/imageUrl";

/**
 * Lightbox — full-screen photo viewer.
 *
 * Props:
 *   photos  – array of { id, src, alt, category, location?, year? }
 *   initial – starting index (number)
 *   onClose – callback to unmount the lightbox
 */
export default function Lightbox({ photos, initial = 0, onClose }) {
  const [index,   setIndex]   = useState(initial);
  const [loaded,  setLoaded]  = useState(false);
  const [hasError, setHasError] = useState(false);
  const closeRef = useRef(null);

  const photo = photos[index];
  const total = photos.length;

  const prev = useCallback(
    () => { setLoaded(false); setHasError(false); setIndex((i) => (i - 1 + total) % total); },
    [total]
  );
  const next = useCallback(
    () => { setLoaded(false); setHasError(false); setIndex((i) => (i + 1) % total); },
    [total]
  );

  // ── Keyboard navigation + Escape ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the close button for screen-reader accessibility
    closeRef.current?.focus();
    return () => { document.body.style.overflow = original; };
  }, []);

  // Reset loaded state when photo changes
  useEffect(() => { setLoaded(false); }, [index]);

  // ── Backdrop click closes ─────────────────────────────────────────────────
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo viewer: ${photo.alt}`}
      className="fixed inset-0 z-[100] bg-black/96 flex items-center justify-center"
      onClick={handleBackdrop}
    >
      {/* ── Top bar ── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10">
        {/* Counter */}
        <span className="font-sans text-xs text-white/40 tracking-widest tabular-nums">
          {index + 1}&nbsp;/&nbsp;{total}
        </span>

        {/* Category pill */}
        <span className="hidden sm:block font-sans text-[10px] tracking-[0.2em] uppercase text-white/30 border border-white/15 px-3 py-1">
          {photo.category}
        </span>

        {/* Close button */}
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close photo viewer (Escape)"
          className="p-1.5 text-white/50 hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
        >
          <X size={22} />
        </button>
      </div>

      {/* ── Prev arrow ── */}
      {total > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          aria-label="Previous photo"
          className="absolute left-3 md:left-6 p-2 text-white/40 hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 z-10"
        >
          <ChevronLeft size={34} strokeWidth={1.5} />
        </button>
      )}

      {/* ── Image area ── */}
      <div className="relative max-w-[90vw] max-h-[82vh] flex items-center justify-center mx-14 md:mx-20">
        {/* Loading skeleton */}
        {!loaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        )}

        {hasError ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-black/60 border border-white/10 rounded-lg text-white/70 max-w-md">
            <AlertCircle size={36} className="text-[#C4A882] mb-3" />
            <p className="text-sm font-medium mb-1">Image Unavailable</p>
            <p className="text-xs text-white/50">
              The full resolution image could not be displayed. The source link may be restricted or expired.
            </p>
          </div>
        ) : (
          <img
            key={photo.id}
            src={resolveImageUrl(photo.src)}
            alt={photo.alt}
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => {
              setLoaded(true);
              setHasError(true);
            }}
            className={`max-h-[82vh] max-w-full object-contain transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            draggable={false}
          />
        )}
      </div>

      {/* ── Next arrow ── */}
      {total > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          aria-label="Next photo"
          className="absolute right-3 md:right-6 p-2 text-white/40 hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 z-10"
        >
          <ChevronRight size={34} strokeWidth={1.5} />
        </button>
      )}

      {/* ── Bottom caption ── */}
      <div className="absolute bottom-0 left-0 right-0 px-5 py-5 z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1">
        <p className="font-sans text-sm text-white/60 max-w-lg leading-snug">
          {photo.alt}
        </p>
        {(photo.location || photo.year) && (
          <p className="flex items-center gap-1.5 font-sans text-xs text-white/30 shrink-0">
            {photo.location && (
              <>
                <MapPin size={11} className="shrink-0" />
                {photo.location}
              </>
            )}
            {photo.location && photo.year && <span className="mx-1">·</span>}
            {photo.year}
          </p>
        )}
      </div>
    </div>
  );
}
