import { AlertCircle, Database, RefreshCw, FolderSearch } from "lucide-react";

/**
 * Editorial loading spinner matching the website aesthetic
 */
export function LoadingSpinner({ message = "Loading photographs…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-8 h-8 border border-[#141414] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-serif text-lg text-[#141414] tracking-wide">{message}</p>
      <p className="text-xs text-[#888] tracking-widest uppercase mt-1">Connecting to gallery collection</p>
    </div>
  );
}

/**
 * Editorial error state that explains what is missing (e.g. MongoDB or server connection)
 */
export function ErrorState({ error, onRetry, title = "Unable to Load Content" }) {
  const isDbError =
    error?.isDbError ||
    error?.status === 503 ||
    (typeof error?.message === "string" && error.message.toLowerCase().includes("database"));

  return (
    <div className="max-w-xl mx-auto my-12 p-8 border border-[#E0DDD8] bg-[#FDFCFB] text-center">
      <div className="w-12 h-12 mx-auto mb-4 border border-[#E0DDD8] rounded-full flex items-center justify-center text-[#9c3d3d]">
        {isDbError ? <Database size={20} /> : <AlertCircle size={20} />}
      </div>

      <h3 className="font-serif text-2xl text-[#141414] mb-3">
        {isDbError ? "Database Not Configured" : title}
      </h3>

      <p className="text-sm text-[#666] leading-relaxed mb-6">
        {error?.message || "An unexpected error occurred while communicating with the portfolio API."}
      </p>

      {isDbError && (
        <div className="text-left bg-[#F5F2EB] border border-[#E8E4DC] p-4 mb-6 text-xs text-[#444] font-mono leading-relaxed">
          <p className="font-bold text-[#141414] mb-1">To configure MongoDB:</p>
          <p>1. Open <span className="underline">backend/.env</span></p>
          <p>2. Set <span className="text-[#9c3d3d]">MONGODB_URI</span>=your_connection_string</p>
          <p>3. Run <span className="text-[#141414]">npm run seed</span> in the backend folder</p>
        </div>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 border border-[#141414] px-6 py-2.5 text-xs tracking-widest uppercase text-[#141414] hover:bg-[#141414] hover:text-[#FAF9F7] transition-all"
        >
          <RefreshCw size={13} /> Try Again
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
