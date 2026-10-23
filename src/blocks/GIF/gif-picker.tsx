"use client";

import {
  Button,
  FieldLabel,
  TextInput,
  useForm,
  useFormFields,
} from "@payloadcms/ui";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { getGiphyApiKey } from "./actions";
import {
  extractVideoUrls,
  formatAspectRatio,
  type GiphyResult,
  searchGiphy,
} from "./giphy";

/**
 * GIF Picker Component for Payload Admin
 *
 * Searches GIPHY from the browser inside the Lexical editor's GIF block.
 * A pick stores GIPHY's media URLs (hotlinked, like YouTube and X embeds)
 * and replaces any uploaded file; choosing an upload clears the pick.
 */

// Fields a GIPHY pick fills in.
const PICK_FIELDS = [
  "alt",
  "aspectRatio",
  "mp4Url",
  "posterUrl",
  "sourceUrl",
  "webmUrl",
] as const;

type MediaValue = number | { id: number } | null | undefined;

/** An uploaded video's width / height, read from its metadata. */
async function readVideoAspectRatio(id: number): Promise<string | null> {
  const response = await fetch(`/api/media/${id}?depth=0`, {
    credentials: "include",
  });
  if (!response.ok) {
    return null;
  }
  const { mimeType, url } = await response.json();
  if (!(url && mimeType?.startsWith("video/"))) {
    return null;
  }

  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.preload = "metadata";
    video.onloadedmetadata = () =>
      resolve(
        video.videoWidth && video.videoHeight
          ? formatAspectRatio(video.videoWidth, video.videoHeight)
          : null
      );
    video.onerror = () => resolve(null);
    video.src = url;
  });
}

// Component
export const GifPicker: React.FC = () => {
  // Form integration
  const { dispatchFields } = useForm();

  // Read existing field values to check if GIF is already selected
  const existingMp4Url = useFormFields(
    ([fields]) => fields.mp4Url?.value as string | undefined
  );
  const existingPosterUrl = useFormFields(
    ([fields]) => fields.posterUrl?.value as string | undefined
  );
  const mediaValue = useFormFields(
    ([fields]) => fields.media?.value as MediaValue
  );
  const mediaId = typeof mediaValue === "object" ? mediaValue?.id : mediaValue;
  const lastMediaId = useRef<number | null | undefined>(mediaId);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<GiphyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGifId, setSelectedGifId] = useState<string | null>(null);
  const [showSearchMode, setShowSearchMode] = useState(false);
  const apiKeyRef = useRef<string | null>(null);

  // Handlers
  const handleSearch = useCallback(async () => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      apiKeyRef.current ??= await getGiphyApiKey();
      const gifs = await searchGiphy(apiKeyRef.current, searchTerm);
      setResults(gifs);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to search GIFs. Please try again."
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const setFields = useCallback(
    (values: Record<string, unknown>) => {
      for (const [path, value] of Object.entries(values)) {
        dispatchFields({ type: "UPDATE", path, value });
      }
    },
    [dispatchFields]
  );

  const handleSelectGif = useCallback(
    (result: GiphyResult) => {
      // A pick replaces an uploaded file.
      lastMediaId.current = null;
      setFields({
        ...extractVideoUrls(result),
        media: null,
        poster: null,
        webmUrl: null,
      });

      // Mark as selected, close search, and switch to preview mode
      setSelectedGifId(result.id);
      setResults([]);
      setSearchTerm("");
      setShowSearchMode(false);
    },
    [setFields]
  );

  const handleChangeGif = useCallback(() => {
    setShowSearchMode(true);
    setSelectedGifId(null);
  }, []);

  const handleRemoveGif = useCallback(() => {
    setFields(Object.fromEntries(PICK_FIELDS.map((path) => [path, null])));
    setShowSearchMode(false);
    setSelectedGifId(null);
  }, [setFields]);

  // Choosing an upload clears the pick and reads the video's aspect ratio.
  useEffect(() => {
    if (mediaId === lastMediaId.current) {
      return;
    }
    lastMediaId.current = mediaId;
    if (!mediaId) {
      return;
    }

    setFields(Object.fromEntries(PICK_FIELDS.map((path) => [path, null])));
    let cancelled = false;
    readVideoAspectRatio(mediaId)
      .then((aspectRatio) => {
        if (aspectRatio && !cancelled) {
          setFields({ aspectRatio });
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [mediaId, setFields]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  // Debounced auto-search
  const DEBOUNCE_DELAY_MS = 500;
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, DEBOUNCE_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerm, handleSearch]);

  // Determine if we should show preview mode
  const hasExistingGif = existingMp4Url && existingPosterUrl;
  const shouldShowPreview = hasExistingGif && !showSearchMode;

  // Preview URL
  const previewUrl = existingPosterUrl;

  // Render
  return (
    <div className="field-type gif-picker">
      {shouldShowPreview ? (
        <>
          <FieldLabel label="Selected GIF" />
          <div className="gif-picker__preview">
            <div className="gif-picker__thumb">
              {previewUrl ? (
                // biome-ignore lint/performance/noImgElement: Payload admin component cannot use Next.js Image
                <img
                  alt="Selected GIF preview"
                  className="gif-picker__thumb-image"
                  height={120}
                  src={previewUrl}
                  width={120}
                />
              ) : (
                <div className="gif-picker__thumb-placeholder">Loading...</div>
              )}
            </div>
            <div className="gif-picker__actions">
              <Button onClick={handleChangeGif}>Change GIF</Button>
              <Button buttonStyle="secondary" onClick={handleRemoveGif}>
                Remove GIF
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <FieldLabel label="Search GIPHY" />

          <div className="gif-picker__search">
            <div className="gif-picker__search-input">
              <TextInput
                onChange={(e: string | React.ChangeEvent<HTMLInputElement>) => {
                  if (typeof e === "string") {
                    setSearchTerm(e);
                  } else if (e?.target?.value !== undefined) {
                    setSearchTerm(e.target.value);
                  }
                }}
                onKeyDown={handleKeyPress}
                path="gifSearchTerm"
                placeholder="Search for GIFs..."
                value={searchTerm}
              />
            </div>
            <Button disabled={loading || !searchTerm} onClick={handleSearch}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {error && <div className="gif-picker__error">{error}</div>}

          {results.length > 0 && (
            <div className="gif-picker__results">
              {results.map((result) => {
                const isSelected = selectedGifId === result.id;
                const thumb = result.images.fixed_width;
                const resultClassName = isSelected
                  ? "gif-picker__result gif-picker__result--selected"
                  : "gif-picker__result";

                return (
                  <button
                    className={resultClassName}
                    key={result.id}
                    onClick={() => handleSelectGif(result)}
                    type="button"
                  >
                    {/* biome-ignore lint/performance/noImgElement: Payload admin component cannot use Next.js Image */}
                    <img
                      alt={result.title || "GIF preview"}
                      className="gif-picker__result-image"
                      height={Number(thumb.height)}
                      src={thumb.webp || thumb.url}
                      width={Number(thumb.width)}
                    />
                  </button>
                );
              })}
            </div>
          )}

          <p className="gif-picker__attribution">Powered by GIPHY</p>

          {!loading && results.length === 0 && searchTerm && !error && (
            <div className="gif-picker__empty">
              No GIFs found for "{searchTerm}". Try a different search term.
            </div>
          )}
        </>
      )}
    </div>
  );
};
