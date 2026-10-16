/**
 * Numbers a portfolio highlight can read live instead of a typed value.
 * Kept free of imports so the Projects collection config can list them.
 */
export const LIVE_METRICS = {
  "lyovson-posts": "Lyóvson.com: published posts",
  "lyovson-activities": "Lyóvson.com: public activities",
  "avenews-publications": "AveNews: publication pages in its sitemaps",
  "concernedeu-releases": "Concerned EU: releases in the public record",
} as const;

export type LiveMetric = keyof typeof LIVE_METRICS;
