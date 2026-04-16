"use client";

import {
  Button,
  FieldLabel,
  TextInput,
  useForm,
  useFormFields,
} from "@payloadcms/ui";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

import { extractVideoUrls, searchGifs } from "./actions";

/**
 * GIF Picker Component for Payload Admin
 *
 * Provides an integrated Tenor GIF search interface directly in the
 * Lexical editor's GIF block. Users can search and select GIFs without
 * leaving the admin panel.
 */

// Types
interface TenorResult {
  id: string;
  media_formats: {
    tinygif: {
      url: string;
      dims: [number, number];
    };
    mp4: {
      url: string;
      dims: [number, number];
    };
  };
}

// Component
export const GifPicker: React.FC = () => {
  // Field paths for storing video URLs directly
  const mp4UrlFieldPath = "mp4Url";
  const webmUrlFieldPath = "webmUrl";
  const posterUrlFieldPath = "posterUrl";
  const aspectRatioFieldPath = "aspectRatio";

  // Form integration
  const { dispatchFields } = useForm();

  // Read existing field values to check if GIF is already selected
  const existingMp4Url = useFormFields(
    ([fields]) => fields[mp4UrlFieldPath]?.value as string | undefined
  );
  const existingPosterUrl = useFormFields(
    ([fields]) => fields[posterUrlFieldPath]?.value as string | undefined
  );

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<TenorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGifId, setSelectedGifId] = useState<string | null>(null);
  const [showSearchMode, setShowSearchMode] = useState(false);

  // Handlers
  const handleSearch = useCallback(async () => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const gifs = await searchGifs(searchTerm);
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

  const handleSelectGif = useCallback(
    async (result: TenorResult) => {
      // Extract video URLs and metadata
      const videoData = await extractVideoUrls(result);

      // Update form fields with video URLs
      dispatchFields({
        type: "UPDATE",
        path: mp4UrlFieldPath,
        value: videoData.mp4Url,
      });

      dispatchFields({
        type: "UPDATE",
        path: webmUrlFieldPath,
        value: videoData.webmUrl || null,
      });

      dispatchFields({
        type: "UPDATE",
        path: posterUrlFieldPath,
        value: videoData.posterUrl,
      });

      dispatchFields({
        type: "UPDATE",
        path: aspectRatioFieldPath,
        value: videoData.aspectRatio,
      });

      // Mark as selected, close search, and switch to preview mode
      setSelectedGifId(result.id);
      setResults([]);
      setSearchTerm("");
      setShowSearchMode(false);
    },
    [dispatchFields]
  );

  const handleChangeGif = useCallback(() => {
    setShowSearchMode(true);
    setSelectedGifId(null);
  }, []);

  const handleRemoveGif = useCallback(() => {
    // Clear all GIF fields
    dispatchFields({ type: "UPDATE", path: mp4UrlFieldPath, value: null });
    dispatchFields({ type: "UPDATE", path: webmUrlFieldPath, value: null });
    dispatchFields({ type: "UPDATE", path: posterUrlFieldPath, value: null });
    dispatchFields({ type: "UPDATE", path: aspectRatioFieldPath, value: null });
    setShowSearchMode(false);
    setSelectedGifId(null);
  }, [dispatchFields]);

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
          <FieldLabel label="Search Tenor GIFs" />

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
                      alt="GIF preview"
                      className="gif-picker__result-image"
                      height={result.media_formats.tinygif.dims[1]}
                      src={result.media_formats.tinygif.url}
                      width={result.media_formats.tinygif.dims[0]}
                    />
                  </button>
                );
              })}
            </div>
          )}

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
