"use client";

import {
  Button,
  FieldLabel,
  TextInput,
  useForm,
  useFormFields,
} from "@payloadcms/ui";
import type React from "react";
import { useEffect, useState } from "react";

import { getCatalogLabel, importCatalogItem, searchCatalog } from "./actions";
import {
  type CatalogItem,
  type CatalogSource,
  type ReferenceType,
  SOURCE_LABELS,
} from "./shared";

/**
 * Catalog search at the top of the reference form. It searches the catalog
 * for the chosen type as you type; picking a result fills the title,
 * creator, year, links, Wikidata item and cover. Works in the drawer that
 * opens from an activity or post, so a new work never needs a second trip.
 */

const DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 2;

function useField<T>(path: string) {
  return useFormFields(([fields]) => fields[path]?.value as T | undefined);
}

export const CatalogPicker: React.FC = () => {
  const { dispatchFields } = useForm();
  const type = useField<ReferenceType>("type");
  const title = useField<string>("title");
  const image = useField<unknown>("image");
  const source = useField<CatalogSource>("catalogSource");
  const url = useField<string>("url");
  const wikidataId = useField<string>("wikidataId");
  const description = useField<string>("description");

  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<string>();
  const [results, setResults] = useState<CatalogItem[]>([]);
  const [status, setStatus] = useState<
    "idle" | "searching" | "importing" | "error"
  >("idle");
  const [error, setError] = useState<string>();
  const [searching, setSearching] = useState(!source);

  useEffect(() => {
    if (type) {
      getCatalogLabel(type).then(setCatalog, () => setCatalog(undefined));
    }
  }, [type]);

  useEffect(() => {
    const term = query.trim();
    if (!type || term.length < MIN_QUERY_LENGTH) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timeout = setTimeout(async () => {
      setStatus("searching");
      const response = await searchCatalog(type, term).catch(() => ({
        error: "Search failed. Try again.",
      }));
      if (cancelled) {
        return;
      }
      if ("error" in response) {
        setError(response.error);
        setStatus("error");
        setResults([]);
      } else {
        setError(undefined);
        setStatus("idle");
        setResults(response.items);
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, type]);

  const fill = (values: Record<string, unknown>) => {
    for (const [path, value] of Object.entries(values)) {
      dispatchFields({ path, type: "UPDATE", value });
    }
  };

  const pick = async (item: CatalogItem) => {
    setStatus("importing");
    try {
      // A linked reference's image came from its catalog, so a new pick
      // replaces it; a hand-picked image on an unlinked one stays.
      fill(await importCatalogItem(item, !(image && !source)));
      setResults([]);
      setQuery("");
      setSearching(false);
      setStatus("idle");
    } catch {
      setError("Couldn't import that one. Try again.");
      setStatus("error");
    }
  };

  const unlink = () => {
    fill({ catalogId: null, catalogSource: null, url: null, wikidataId: null });
    setSearching(true);
  };

  if (!type) {
    return (
      <div className="field-type catalog-picker">
        <FieldLabel label="Find in a catalog" />
        <p className="catalog-picker__hint">Choose a type to search.</p>
      </div>
    );
  }

  if (source && !searching) {
    return (
      <div className="field-type catalog-picker">
        <FieldLabel label="Linked" />
        <div className="catalog-picker__linked">
          <div className="catalog-picker__linked-text">
            {url ? (
              <a href={url} rel="noopener noreferrer" target="_blank">
                {SOURCE_LABELS[source]}
              </a>
            ) : (
              SOURCE_LABELS[source]
            )}
            {wikidataId ? (
              <>
                {" · "}
                <a
                  href={`https://www.wikidata.org/wiki/${wikidataId}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Wikidata {wikidataId}
                </a>
              </>
            ) : (
              " · no Wikidata match"
            )}
            {description ? (
              <span className="catalog-picker__muted"> · {description}</span>
            ) : null}
          </div>
          <div className="catalog-picker__actions">
            <Button
              buttonStyle="secondary"
              onClick={() => {
                setQuery(title ?? "");
                setSearching(true);
              }}
              size="medium"
            >
              Search again
            </Button>
            <Button buttonStyle="secondary" onClick={unlink} size="medium">
              Unlink
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="field-type catalog-picker">
      <FieldLabel
        label={catalog ? `Find in ${catalog}` : "Find in a catalog"}
      />
      <TextInput
        onChange={(event: string | React.ChangeEvent<HTMLInputElement>) =>
          setQuery(typeof event === "string" ? event : event.target.value)
        }
        path="catalogQuery"
        placeholder="Title, and the author or year if there are many"
        value={query}
      />
      <p aria-live="polite" className="catalog-picker__hint">
        {status === "searching" && "Searching…"}
        {status === "importing" && "Importing, fetching the cover…"}
        {status === "error" && error}
        {status === "idle" &&
          query.trim().length >= MIN_QUERY_LENGTH &&
          results.length === 0 &&
          "Nothing found. Fill the fields below by hand, or try another spelling."}
        {status === "idle" &&
          query.trim().length < MIN_QUERY_LENGTH &&
          "Pick a result to fill the title, creator, year, links and cover."}
      </p>
      {results.length > 0 && (
        <ul className="catalog-picker__results">
          {results.map((item) => (
            <li key={`${item.source}:${item.sourceId}`}>
              <button
                className="catalog-picker__result"
                disabled={status === "importing"}
                onClick={() => pick(item)}
                type="button"
              >
                <span className="catalog-picker__thumb">
                  {item.thumbUrl ? (
                    // biome-ignore lint/performance/noImgElement: Payload admin component cannot use Next.js Image
                    <img
                      alt=""
                      height={72}
                      loading="lazy"
                      src={item.thumbUrl}
                      width={48}
                    />
                  ) : null}
                </span>
                <span className="catalog-picker__text">
                  <strong>{item.title}</strong>
                  <span className="catalog-picker__muted">
                    {[item.creator, item.year, item.description]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {source ? (
        <Button
          buttonStyle="secondary"
          onClick={() => setSearching(false)}
          size="medium"
        >
          Cancel
        </Button>
      ) : null}
    </div>
  );
};
