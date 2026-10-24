import type {
  ArrayFieldValidation,
  Field,
  FilterOptions,
  Where,
} from "payload";

// How references connect: who made a work, what it belongs to, what it
// adapts, and who is in a band. Each link is stored once, on the reference
// it describes; the other side reads it through a join.

export const CREDIT_ROLES = [
  { label: "Author", value: "author" },
  { label: "Creator", value: "creator" },
  { label: "Developer", value: "developer" },
  { label: "Director", value: "director" },
  { label: "Host", value: "host" },
  { label: "Narrator", value: "narrator" },
  { label: "Performer", value: "performer" },
  { label: "Translator", value: "translator" },
] as const;

export type CreditRole = (typeof CREDIT_ROLES)[number]["value"];

const AGENT_TYPES = ["person", "organization"];
// Deeper nesting than a franchise, its series and their volumes is a
// mistake; the walk stops there rather than querying without end.
const MAX_NESTING = 10;

const isAgent = (type: unknown) => AGENT_TYPES.includes(type as string);

/** Other references only, optionally of some types. */
function otherReferences(where?: Where): FilterOptions {
  return ({ id }) => {
    const others: Where | undefined = id
      ? { id: { not_equals: id } }
      : undefined;
    if (where && others) {
      return { and: [where, others] };
    }
    return where ?? others ?? true;
  };
}

function idOf(value: unknown) {
  return typeof value === "object" && value !== null
    ? (value as { id: number }).id
    : (value as number | null | undefined);
}

/** A reference can't be part of itself, however many levels up. */
const validatePartOf: ArrayFieldValidation = async (value, { id, req }) => {
  const rows = (Array.isArray(value) ? value : []) as { whole?: unknown }[];
  let frontier = rows.map((row) => idOf(row.whole)).filter(Boolean);
  if (id === undefined || frontier.length === 0) {
    return true;
  }
  const seen = new Set<number>();
  for (let level = 0; level < MAX_NESTING && frontier.length > 0; level++) {
    if (frontier.includes(Number(id))) {
      return "A reference can't be part of itself";
    }
    for (const whole of frontier) {
      seen.add(whole as number);
    }
    const { docs } = await req.payload.find({
      collection: "references",
      depth: 0,
      pagination: false,
      req,
      select: { partOf: true },
      where: { id: { in: frontier } },
    });
    frontier = docs
      .flatMap((doc) => doc.partOf?.map((row) => idOf(row.whole)) ?? [])
      .filter((whole) => whole && !seen.has(whole));
  }
  return true;
};

export const relationFields: Field[] = [
  {
    name: "credits",
    type: "array",
    admin: {
      description: "Who made it, each linked to their own reference",
      condition: (data) => !isAgent(data?.type),
      initCollapsed: true,
    },
    fields: [
      {
        type: "row",
        fields: [
          {
            name: "agent",
            type: "relationship",
            relationTo: "references",
            required: true,
            filterOptions: otherReferences({ type: { in: AGENT_TYPES } }),
            admin: { width: "60%" },
          },
          {
            name: "role",
            type: "select",
            required: true,
            options: [...CREDIT_ROLES],
            admin: { width: "40%" },
          },
        ],
      },
    ],
  },
  {
    name: "partOf",
    type: "array",
    label: "Part of",
    validate: validatePartOf,
    admin: {
      description: "Series, franchise, album or season it belongs to",
      condition: (data) => !isAgent(data?.type),
      initCollapsed: true,
    },
    fields: [
      {
        type: "row",
        fields: [
          {
            name: "whole",
            type: "relationship",
            relationTo: "references",
            required: true,
            filterOptions: otherReferences({ type: { not_in: AGENT_TYPES } }),
            admin: { width: "50%" },
          },
          {
            name: "position",
            type: "number",
            min: 0,
            admin: { width: "20%", description: "Order in the whole" },
          },
          {
            name: "label",
            type: "text",
            admin: { width: "30%", placeholder: "Book 1, Track 3" },
          },
        ],
      },
    ],
  },
  {
    name: "basedOn",
    type: "relationship",
    label: "Based on",
    relationTo: "references",
    hasMany: true,
    filterOptions: otherReferences({ type: { not_in: AGENT_TYPES } }),
    admin: {
      description: "The works it adapts",
      condition: (data) => !isAgent(data?.type),
    },
  },
  {
    name: "members",
    type: "array",
    admin: {
      description: "People in the band or group",
      condition: (data) => data?.type === "organization",
      initCollapsed: true,
    },
    fields: [
      {
        type: "row",
        fields: [
          {
            name: "member",
            type: "relationship",
            relationTo: "references",
            required: true,
            filterOptions: otherReferences({ type: { equals: "person" } }),
            admin: { width: "40%" },
          },
          {
            name: "start",
            type: "number",
            min: 0,
            max: 9999,
            admin: { width: "15%", placeholder: "Year" },
          },
          {
            name: "end",
            type: "number",
            min: 0,
            max: 9999,
            admin: { width: "15%", placeholder: "Year" },
          },
          {
            name: "role",
            type: "text",
            admin: { width: "30%", placeholder: "Vocals, guitar" },
          },
        ],
      },
    ],
  },
  // The other side of each link, read-only.
  {
    name: "credited",
    type: "join",
    collection: "references",
    on: "credits.agent",
    defaultLimit: 0,
    admin: {
      description: "Works that credit them",
      condition: (data) => isAgent(data?.type),
    },
  },
  {
    name: "parts",
    type: "join",
    collection: "references",
    on: "partOf.whole",
    defaultLimit: 0,
    admin: {
      condition: (data) => !isAgent(data?.type),
    },
  },
  {
    name: "adaptations",
    type: "join",
    collection: "references",
    on: "basedOn",
    defaultLimit: 0,
    admin: {
      condition: (data) => !isAgent(data?.type),
    },
  },
  {
    name: "memberOf",
    type: "join",
    label: "Member of",
    collection: "references",
    on: "members.member",
    defaultLimit: 0,
    admin: {
      condition: (data) => data?.type === "person",
    },
  },
];
