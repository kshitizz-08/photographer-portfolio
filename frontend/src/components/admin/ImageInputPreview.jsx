import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import {
  validateImageUrl,
  resolveImageUrl,
  extractGoogleDriveFileId,
} from "../../utils/imageUrl";

/**
 * ImageInputPreview — Universal Image URL input with live preview.
 *
 * Requirements addressed:
 * - Live preview for any entered image URL (Google Drive, Dropbox, Imgur, direct URLs).
 * - Real-time update as the photographer types or pastes.
 * - Loading indicator while image is loading.
 * - Clear, helpful error messages if image cannot be displayed.
 * - Preserves previous saved image if the new URL is invalid or fails to load.
 * - Allows reverting back to saved image with a single click.
 */
export default function ImageInputPreview({
  label = "Image URL *",
  value = "",
  onChange,
  savedValue = "",
  required = false,
  placeholder = "https://images.unsplash.com/... or Google Drive link",
  id,
}) {
  const [loadStatus, setLoadStatus] = useState("idle"); // "idle" | "loading" | "loaded" | "error"
  const [validationError, setValidationError] = useState(null);

  const trimmedValue = (value || "").trim();
  const resolvedUrl = resolveImageUrl(trimmedValue);
  const isGoogleDrive = Boolean(
    trimmedValue &&
      (trimmedValue.includes("drive.google.com") ||
        trimmedValue.includes("docs.google.com"))
  );
  const isDropbox = Boolean(trimmedValue && trimmedValue.includes("dropbox.com"));

  useEffect(() => {
    if (!trimmedValue) {
      setLoadStatus("idle");
      setValidationError(null);
      return;
    }

    const valResult = validateImageUrl(trimmedValue);
    if (!valResult.valid) {
      setValidationError(valResult.error);
      setLoadStatus("error");
      return;
    }

    setValidationError(null);
    setLoadStatus("loading");
  }, [trimmedValue]);

  const handleRevert = () => {
    if (onChange && savedValue) {
      onChange({ target: { value: savedValue } });
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-[#C4A882]"
        >
          {label}
        </label>
      )}

      {/* URL Input */}
      <div className="relative">
        <input
          id={id}
          type="text"
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 bg-[#1a1a1a] border rounded-lg text-xs text-[#FAF9F7] outline-none transition-colors ${
            validationError || loadStatus === "error"
              ? "border-red-500/60 focus:border-red-400"
              : "border-[#333333] focus:border-[#C4A882]"
          }`}
        />
      </div>

      {/* Helper text about universal support */}
      <p className="text-[11px] text-[#777777]">
        Supports direct links (.jpg, .png, .webp, .gif), Google Drive, Dropbox, Imgur, and public CDNs.
      </p>

      {/* Live Preview Box */}
      {trimmedValue ? (
        <div className="rounded-lg bg-[#141414] border border-[#2a2a2a] p-2.5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {/* Image Preview Thumbnail */}
            <div className="relative w-16 h-16 rounded overflow-hidden bg-black shrink-0 border border-[#333333] flex items-center justify-center">
              {loadStatus === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                  <Loader2 size={18} className="animate-spin text-[#C4A882]" />
                </div>
              )}

              {resolvedUrl && !validationError ? (
                <img
                  src={resolvedUrl}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  onLoad={() => setLoadStatus("loaded")}
                  onError={() => {
                    setLoadStatus("error");
                  }}
                  className={`w-full h-full object-cover transition-opacity duration-200 ${
                    loadStatus === "loaded" ? "opacity-100" : "opacity-0"
                  }`}
                />
              ) : null}

              {loadStatus === "error" && (
                <div className="w-full h-full flex items-center justify-center bg-red-950/20 text-red-400">
                  <AlertTriangle size={20} />
                </div>
              )}
            </div>

            {/* Status Information */}
            <div className="text-[11px] min-w-0 flex-1">
              {loadStatus === "loading" && (
                <span className="text-[#C4A882] font-medium flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" /> Loading preview...
                </span>
              )}

              {loadStatus === "loaded" && (
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  {isGoogleDrive
                    ? "Google Drive image linked"
                    : isDropbox
                    ? "Dropbox image linked"
                    : "Direct image linked"}
                </span>
              )}

              {loadStatus === "error" && (
                <span className="text-red-400 font-medium flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  {validationError ? "Invalid URL format" : "Unable to display image"}
                </span>
              )}

              <p className="truncate text-[#666666] mt-0.5" title={trimmedValue}>
                {trimmedValue}
              </p>
            </div>
          </div>

          {/* Detailed Error Message if Load Fails */}
          {loadStatus === "error" && (
            <div className="text-[11px] text-red-300/90 bg-red-950/30 border border-red-900/40 rounded p-2">
              {validationError ? (
                <p>{validationError}</p>
              ) : isGoogleDrive ? (
                <p>
                  Google Drive image could not be loaded. Please ensure the file&apos;s sharing permission in Google Drive is set to <strong>&ldquo;Anyone with the link can view&rdquo;</strong>.
                </p>
              ) : (
                <p>
                  The image could not be loaded from this address. Please make sure the URL points to a publicly accessible image and the hosting site allows external embedding without authentication.
                </p>
              )}
            </div>
          )}

          {/* Preserve saved image indicator & revert option */}
          {loadStatus === "error" && savedValue && savedValue !== trimmedValue && (
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#222222] text-[11px] text-[#888888]">
              <span className="truncate">
                Previous saved image will be preserved:{" "}
                <span className="text-[#FAF9F7]">{savedValue}</span>
              </span>
              <button
                type="button"
                onClick={handleRevert}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#222222] hover:bg-[#333333] text-[#FAF9F7] text-[10px] shrink-0 transition-colors"
                title="Restore previously saved image URL"
              >
                <RotateCcw size={10} /> Revert
              </button>
            </div>
          )}
        </div>
      ) : savedValue ? (
        /* Empty input with existing saved image preview */
        <div className="rounded-lg bg-[#141414] border border-[#2a2a2a] p-2 flex items-center gap-3">
          <div className="w-12 h-12 rounded overflow-hidden bg-black shrink-0 border border-[#333333]">
            <img
              src={resolveImageUrl(savedValue)}
              alt="Saved"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-[11px] text-[#888888] truncate flex-1">
            <span className="text-[#C4A882]">Current saved image</span>
            <p className="truncate text-[#666666]">{savedValue}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
