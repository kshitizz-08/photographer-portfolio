import { useState, useEffect } from "react";
import { AlertCircle, Database, RefreshCw, FolderSearch, Clock } from "lucide-react";

/**
 * Editorial loading spinner matching the website aesthetic.
 * Shows progressive messaging if the request takes longer than 2.8 seconds,
 * informing users when the backend is waking up from a free-tier idle period.
 */
export function LoadingSpinner({
  message = "Loading photographs…",
  submessage = "Connecting to gallery collection",
}) {
  const [isDelayed, setIsDelayed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayed(true);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn" role="status">
      <div className="relative w-9 h-9 mb-4">
        <div className="w-9 h-9 border border-[#E0DDD8] rounded-full" />
        <div className="absolute inset-0 w-9 h-9 border border-[#141414] border-t-transparent rounded-full animate-spin" />
      </div>

      <p className="font-serif text-lg text-[#141414] tracking-wide">{message}</p>

      {isDelayed ? (
        <div className="mt-2.5 max-w-sm px-4 py-1.5 bg-[#F5F2EB] border border-[#E8E4DC] rounded text-xs text-[#6b6b6b] flex items-center justify-center gap-1.5 animate-fadeIn">
          <Clock size={13} className="text-[#C4A882] shrink-0" />
          <span>Server is waking up from idle (~30–50s on free tier)…</span>
        </div>
      ) : (
        <p className="text-xs text-[#888] tracking-widest uppercase mt-1">{submessage}</p>
      )}
    </div>
  );
}

/**
 * Editorial error state that explains issues with friendly messaging.
 * Differentiates cold starts/timeouts, database availability, and generic errors.
 * Includes a safe retry button with loading state to prevent rapid spam clicks.
 */
export function ErrorState({
  error,
  onRetry,
  title = "Unable to Load Content",
  compact = false,
}) {
  const [retrying, setRetrying] = useState(false);

  const isColdStart =
    error?.isColdStart ||
    error?.isTimeout ||
    error?.status === 502 ||
    error?.status === 503 ||
    error?.status === 504 ||
    error?.code === "TIMEOUT" ||
    error?.code === "NETWORK_ERROR";

  const isDbError =
    !isColdStart &&
    (error?.isDbError ||
      error?.status === 503 ||
      (typeof error?.message === "string" && error.message.toLowerCase().includes("database")));

  const handleRetry = async () => {
    if (retrying || !onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  const resolvedTitle = isColdStart
    ? "Server is Spinning Up"
    : isDbError
    ? "Database Unavailable"
    : title;

  const resolvedMessage =
    error?.friendlyMessage ||
    (isColdStart
      ? "The backend is hosted on a free cloud tier that idles after 15 minutes of inactivity. It takes about 30–50 seconds to wake up."
      : error?.message ||
        "An unexpected issue occurred while communicating with the portfolio API.");

  return (
    <div
      className={`max-w-xl mx-auto ${
        compact ? "my-6 p-6" : "my-12 p-8"
      } border border-[#E0DDD8] bg-[#FDFCFB] text-center`}
      role="alert"
    >
      <div
        className={`w-12 h-12 mx-auto mb-4 border border-[#E0DDD8] rounded-full flex items-center justify-center ${
          isColdStart ? "text-[#C4A882]" : "text-[#9c3d3d]"
        }`}
      >
        {isColdStart ? <Clock size={20} /> : isDbError ? <Database size={20} /> : <AlertCircle size={20} />}
      </div>

      <h3 className="font-serif text-2xl text-[#141414] mb-3">{resolvedTitle}</h3>

      <p className="text-sm text-[#666] leading-relaxed mb-6 max-w-md mx-auto">
        {resolvedMessage}
      </p>

      {onRetry && (
        <button
          onClick={handleRetry}
          disabled={retrying}
          className={`
            inline-flex items-center gap-2 border px-6 py-2.5 text-xs tracking-widest uppercase transition-all
            ${
              retrying
                ? "border-[#aaa] text-[#aaa] cursor-not-allowed bg-transparent"
                : "border-[#141414] text-[#141414] hover:bg-[#141414] hover:text-[#FAF9F7]"
            }
          `}
        >
          <RefreshCw size={13} className={retrying ? "animate-spin" : ""} />
          {retrying ? "Retrying…" : isColdStart ? "Try Connecting Again" : "Try Again"}
        </button>
      )}
    </div>
  );
}

/**
 * Empty state for filters or empty galleries
 */
export function EmptyState({
  title = "No Photographs Found",
  message = "There are no published photographs in this category yet.",
  onReset,
}) {
  return (
    <div className="py-20 text-center border border-dashed border-[#E0DDD8] my-8 px-6">
      <FolderSearch size={32} className="mx-auto text-[#aaa] mb-4" />
      <h3 className="font-serif text-2xl text-[#141414] mb-2">{title}</h3>
      <p className="text-sm text-[#777] max-w-md mx-auto mb-6">{message}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="text-xs tracking-widest uppercase border-b border-[#141414] pb-1 text-[#141414] hover:text-[#C4A882] transition-colors"
        >
          View All Work
        </button>
      )}
    </div>
  );
}

/**
 * Skeleton for the curated galleries strip on Portfolio page
 */
export function GalleriesStripSkeleton({ count = 3 }) {
  return (
    <div className="max-w-7xl mx-auto px-6 mb-14" aria-busy="true" aria-label="Loading galleries">
      <div className="mb-8">
        <div className="w-24 h-3 bg-[#EAE7E1] mb-2 animate-pulse" />
        <div className="w-48 h-6 bg-[#EAE7E1] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-[#E8E5DF] overflow-hidden">
            <div className="aspect-[4/3] bg-[#E0DDD8] animate-pulse relative">
              <div className="absolute top-3 left-3 w-16 h-5 bg-[#FAF9F7]/60" />
            </div>
            <div className="p-4 border-t border-[#E0DDD8] flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="w-3/4 h-4 bg-[#D6D2CA] animate-pulse" />
                <div className="w-1/2 h-3 bg-[#D6D2CA] animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for single Gallery page while loading the hero and photos
 */
export function GalleryDetailSkeleton() {
  return (
    <div className="animate-fadeIn" aria-busy="true" aria-label="Loading gallery">
      {/* Hero cover skeleton */}
      <div className="relative h-[60vh] min-h-[420px] bg-[#222222] animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-12 left-6 sm:left-12 max-w-3xl w-full pr-6 space-y-3">
          <div className="w-24 h-4 bg-white/20 rounded" />
          <div className="w-3/4 h-10 bg-white/30 rounded" />
          <div className="w-1/2 h-4 bg-white/15 rounded" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-8">
        <div className="flex items-center justify-between border-b border-[#E0DDD8] pb-6 flex-wrap gap-4">
          <div className="flex gap-4">
            <div className="w-24 h-4 bg-[#EAE7E1] animate-pulse" />
            <div className="w-24 h-4 bg-[#EAE7E1] animate-pulse" />
          </div>
          <div className="w-28 h-8 bg-[#EAE7E1] animate-pulse" />
        </div>

        <div className="space-y-3 max-w-xl">
          <div className="w-full h-3 bg-[#EAE7E1] animate-pulse" />
          <div className="w-5/6 h-3 bg-[#EAE7E1] animate-pulse" />
        </div>

        {/* Photos masonry skeleton */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 pt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="break-inside-avoid mb-3">
              <div
                className={`w-full ${
                  i % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/3]"
                } bg-[#EAE7E1] animate-pulse`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Services page
 */
export function ServicesListSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 flex flex-col divide-y divide-[#E0DDD8]" aria-busy="true">
      {[1, 2].map((i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-0 py-16 animate-pulse">
          <div className={`aspect-[4/3] bg-[#EAE7E1] ${i % 2 === 1 ? "md:order-2" : ""}`} />
          <div className={`flex flex-col justify-center ${i % 2 === 1 ? "md:pr-16 md:order-1" : "md:pl-16"} py-8 space-y-4`}>
            <div className="w-24 h-3 bg-[#EAE7E1]" />
            <div className="w-3/4 h-8 bg-[#EAE7E1]" />
            <div className="w-full h-4 bg-[#EAE7E1]" />
            <div className="w-2/3 h-4 bg-[#EAE7E1]" />
            <div className="w-32 h-10 bg-[#EAE7E1] mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
