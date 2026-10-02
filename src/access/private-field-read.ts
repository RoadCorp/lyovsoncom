import type { FieldAccess } from "payload";

/**
 * Request-context flag for server routes that have already authorized the
 * caller (admin session or CRON_SECRET) but read with `overrideAccess: false`
 * to keep document-level publication rules.
 */
export const TRUSTED_EMBEDDING_READ = "trustedEmbeddingRead";

/** Hides a field from anonymous REST/GraphQL and access-checked reads. */
export const authenticatedFieldRead: FieldAccess = ({ req: { user } }) =>
  Boolean(user);

/** Embedding and search-text fields: signed-in users or trusted routes. */
export const embeddingFieldRead: FieldAccess = ({ req }) =>
  Boolean(req.user) || req.context?.[TRUSTED_EMBEDDING_READ] === true;
