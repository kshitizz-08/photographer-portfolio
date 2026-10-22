import React, { useState, useEffect, useRef } from "react";
import {
  resolveImageUrl,
  getResponsiveSrcSet,
  extractGoogleDriveFileId,
  FALLBACK_IMAGE_PLACEHOLDER,
} from "../../utils/imageUrl";

/**
 * SafeImage — High-performance resilient responsive image component.
 *
 * Capabilities:
 * - Automatically optimizes image resolution and format (WebP/AVIF via CDN auto-format).
 * - Generates responsive `srcSet` and `sizes` for supported CDNs (Unsplash, Google Drive, Cloudinary).
 * - Multi-stage fallback for Google Drive (lh3 direct -> thumbnail -> uc export).
 * - Instant rendering if image is already cached in browser memory (detects img.complete).
 * - Prevents layout shifts (CLS) by maintaining container dimensions and aspect ratio.
 * - Displays graceful loading shimmer skeleton and fallback on broken images.
 */
export default function SafeImage({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  fallbackSrc = null,
  showErrorFallback = true,
  loading,
  fetchPriority,
  decoding = "async",
  hero = false,
  targetWidth,
  widths,
  sizes,
  aspectRatio,
  width,
  height,
  onLoad,
  onError,
  style,
  ...props
}) {
  const imgRef = useRef(null);

  // Determine appropriate loading and priority defaults based on `hero` flag
  const isEager = hero || loading === "eager" || fetchPriority === "high";
  const effectiveLoading = isEager ? "eager" : (loading || "lazy");
  const effectiveFetchPriority = fetchPriority || (hero ? "high" : "auto");

  // Determine target width and srcset widths
  const effectiveTargetWidth = targetWidth || (hero ? 1920 : 800);
  const effectiveWidths = widths || (hero ? [640, 1080, 1920, 2560] : [400, 800, 1200]);
  const effectiveSizes = sizes || (hero ? "100vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw");

  const primarySrc = resolveImageUrl(src, { width: effectiveTargetWidth });
  const srcSetString = getResponsiveSrcSet(src, effectiveWidths);

  const [currentSrc, setCurrentSrc] = useState(primarySrc);
  const [currentSrcSet, setCurrentSrcSet] = useState(srcSetString);
  const [status, setStatus] = useState("loading"); // "loading" | "loaded" | "error"
  const [fallbackAttempt, setFallbackAttempt] = useState(0);

  useEffect(() => {
    const nextSrc = resolveImageUrl(src, { width: effectiveTargetWidth });
    const nextSrcSet = getResponsiveSrcSet(src, effectiveWidths);

    setCurrentSrc(nextSrc);
    setCurrentSrcSet(nextSrcSet);

    if (!nextSrc) {
      setStatus("error");
    } else {
      setStatus("loading");
    }
    setFallbackAttempt(0);
  }, [src, effectiveTargetWidth]);

  // Check if image is already loaded from browser cache upon mount / update
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setStatus("loaded");
      }
    }
  }, [currentSrc]);

  const handleLoad = (e) => {
    setStatus("loaded");
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    // Multi-stage Google Drive fallback sequence
    try {
      const parsed = new URL(src);
      const driveId = extractGoogleDriveFileId(parsed);
      if (driveId) {
        if (fallbackAttempt === 0) {
          setFallbackAttempt(1);
          setCurrentSrcSet("");
          setCurrentSrc(`https://drive.google.com/thumbnail?id=${driveId}&sz=w${effectiveTargetWidth}`);
          setStatus("loading");
          return;
        } else if (fallbackAttempt === 1) {
          setFallbackAttempt(2);
          setCurrentSrcSet("");
          setCurrentSrc(`https://drive.google.com/uc?export=view&id=${driveId}`);
          setStatus("loading");
          return;
        }
      }
    } catch {
      // Continue to standard fallback
    }

    if (fallbackSrc && fallbackAttempt < 3 && fallbackSrc !== currentSrc) {
      setFallbackAttempt(3);
      setCurrentSrcSet("");
      setCurrentSrc(resolveImageUrl(fallbackSrc, { width: effectiveTargetWidth }));
      setStatus("loading");
    } else {
      setStatus("error");
      if (onError) onError(e);
    }
  };

  const containerStyle = {
    ...(aspectRatio ? { aspectRatio } : {}),
    ...(style || {}),
  };

  if (status === "error" && showErrorFallback) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#1c1c1c] text-[#888888] select-none p-4 text-center overflow-hidden ${className} ${containerClassName}`}
        style={containerStyle}
        role="img"
        aria-label={alt || "Image unavailable"}
      >
        <svg
          className="w-7 h-7 mb-1.5 text-[#C4A882]/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-[10px] tracking-wider uppercase text-[#888888]/80 font-sans">
          Photograph unavailable
        </span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={currentSrc || FALLBACK_IMAGE_PLACEHOLDER}
      srcSet={currentSrcSet || undefined}
      sizes={currentSrcSet ? effectiveSizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={effectiveLoading}
      fetchPriority={effectiveFetchPriority}
      decoding={decoding}
      referrerPolicy="no-referrer"
      onLoad={handleLoad}
      onError={handleError}
      style={containerStyle}
      className={`${className} transition-opacity duration-300 ${
        status === "loaded" ? "opacity-100" : "opacity-95"
      }`}
      {...props}
    />
  );
}
