import SafeImage from "../common/SafeImage";

/**
 * PhotoCard — single photo tile with a subtle hover overlay.
 *
 * Props:
 *   photo     – { id, src, alt, category, location?, year?, aspect? }
 *   onClick   – called with photo object when the tile is activated
 *   className – additional classes for the outer container
 */
export default function PhotoCard({ photo, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={() => onClick(photo)}
      className={`group relative block overflow-hidden bg-[#E8E5DF] w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A882] focus-visible:ring-offset-2 ${className}`}
      aria-label={`Open photo: ${photo.alt}`}
    >
      {/* Photo */}
      <SafeImage
        src={photo.src || photo.imageUrl}
        alt={photo.alt || photo.altText || photo.title}
        loading="eager"
        decoding="async"
        targetWidth={800}
        widths={[400, 800, 1200]}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />

      {/* Hover overlay — slides up from bottom */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/70 to-transparent pt-12 pb-4 px-4"
      >
        <p className="text-[10px] text-white/60 tracking-[0.2em] uppercase mb-0.5">
          {photo.category}
          {photo.location && ` · ${photo.location}`}
        </p>
        <p className="text-sm text-white font-serif leading-snug line-clamp-2">
          {photo.alt}
        </p>
      </div>
    </button>
  );
}
