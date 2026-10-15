import React, { useState, useEffect } from "react";
import { resolveImageUrl, FALLBACK_IMAGE_PLACEHOLDER } from "../../utils/imageUrl";

/**
 * SafeImage — Reusable resilient image component.
 *
 * - Automatically resolves universal image URLs (Google Drive, Dropbox, Imgur, direct URLs).
 * - Appends referrerPolicy="no-referrer" to prevent hotlink-protection blocks.
 * - Manages loading and error states smoothly without breaking page layouts.
 * - Displays a fallback placeholder if the URL cannot be loaded.
 */
export default function SafeImage({
  src,
  alt = "",
  className = "",
  fallbackSrc = null,
  showErrorFallback = true,
  loading = "lazy",
  fetchPriority = "auto",
  onLoad,
  onError,
  ...props
}) {
  const resolvedSrc = resolveImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);
  const [status, setStatus] = useState("loading"); // "loading" | "loaded" | "error"
  const [triedFallback, setTriedFallback] = useState(false);

  useEffect(() => {
    const nextSrc = resolveImageUrl(src);
    setCurrentSrc(nextSrc);
    if (!nextSrc) {
      setStatus("error");
    } else {
      setStatus("loading");
    }
    setTriedFallback(false);
  }, [src]);

  const handleLoad = (e) => {
    setStatus("loaded");
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    if (fallbackSrc && !triedFallback && fallbackSrc !== currentSrc) {
      setTriedFallback(true);
      setCurrentSrc(resolveImageUrl(fallbackSrc));
      setStatus("loading");
    } else {
      setStatus("error");
      if (onError) onError(e);
    }
  };

  if (status === "error" && showErrorFallback) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#1c1c1c] text-[#888888] select-none p-4 text-center ${className}`}
        role="img"
        aria-label={alt || "Image unavailable"}
      >
        <svg
          className="w-8 h-8 mb-1.5 text-[#C4A882]/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-[10px] tracking-wider uppercase text-[#888888]/80 font-sans">
          Image not available
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc || FALLBACK_IMAGE_PLACEHOLDER}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      referrerPolicy="no-referrer"
      onLoad={handleLoad}
      onError={handleError}
      className={`${className} ${
        status === "loading" ? "opacity-0" : "opacity-100"
      } transition-opacity duration-300`}
      {...props}
    />
  );
}
