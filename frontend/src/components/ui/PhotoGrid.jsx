import { useState } from "react";
import PhotoCard from "./PhotoCard";
import Lightbox from "./Lightbox";

// Map the photo's `aspect` hint to a Tailwind aspect-ratio class
const ASPECT_MAP = {
  portrait:  "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square:    "aspect-square",
  tall:      "aspect-[2/3]",
};

/**
 * Skeleton placeholder grid for zero layout shift during async loads.
 */
export function PhotoGridSkeleton({
  count = 6,
  columns = "columns-1 sm:columns-2 lg:columns-3",
}) {
  const aspects = ["aspect-[3/4]", "aspect-[4/3]", "aspect-[3/4]", "aspect-[2/3]", "aspect-square", "aspect-[3/4]"];
  return (
    <div className={`${columns} gap-3`} aria-busy="true" aria-label="Loading photos">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="break-inside-avoid mb-3">
          <div
            className={`w-full ${aspects[i % aspects.length]} bg-[#EAE7E1] animate-pulse`}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * PhotoGrid — CSS-columns masonry grid with integrated lightbox.
 *
 * Props:
 *   photos       – array of photo objects (see sampleData.js for shape)
 *   showLightbox – boolean (default true); set false on Home page featured strip
 *   columns      – responsive column classes string (default below)
 */
export default function PhotoGrid({
  photos,
  showLightbox = true,
  columns = "columns-1 sm:columns-2 lg:columns-3",
}) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (photo) => {
    if (!showLightbox) return;
    const idx = photos.findIndex((p) => p.id === photo.id);
    if (idx !== -1) setLightboxIndex(idx);
  };

  return (
    <>
      {/* CSS columns masonry — items flow top-to-bottom within each column */}
      <div className={`${columns} gap-3`}>
        {photos.map((photo) => {
          const aspectClass = ASPECT_MAP[photo.aspect] ?? "aspect-[3/4]";
          return (
            <div key={photo.id} className="break-inside-avoid mb-3">
              <PhotoCard
                photo={photo}
                onClick={openLightbox}
                className={aspectClass}
              />
            </div>
          );
        })}
      </div>

      {/* Lightbox portal */}
      {showLightbox && lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          initial={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
