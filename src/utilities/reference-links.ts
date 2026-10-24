import type { Reference } from "@/payload-types";

// How a hub reads a reference's links: the byline from its credits, its
// place in a whole, and the lists of what links to it.

type CreditRole = NonNullable<Reference["credits"]>[number]["role"];

/** The phrase before each role's names; the makers share "by". */
const ROLE_PHRASES: Record<CreditRole, string> = {
  author: "by",
  creator: "by",
  developer: "by",
  director: "directed by",
  host: "hosted by",
  narrator: "narrated by",
  performer: "by",
  translator: "translated by",
};

export interface CreditGroup {
  agents: Reference[];
  phrase: string;
}

function populated(value: number | Reference | null | undefined) {
  return typeof value === "object" && value?.slug ? value : null;
}

/** Credits grouped by phrase, makers first: "by A and B", "narrated by C". */
export function groupCredits(credits: Reference["credits"]): CreditGroup[] {
  const groups = new Map<string, Reference[]>();
  const named = new Set<number>();
  for (const credit of credits ?? []) {
    const agent = populated(credit.agent);
    // One mention per agent: their first role wins.
    if (!agent || named.has(agent.id)) {
      continue;
    }
    named.add(agent.id);
    const phrase = ROLE_PHRASES[credit.role];
    groups.set(phrase, [...(groups.get(phrase) ?? []), agent]);
  }
  return [...groups]
    .map(([phrase, agents]) => ({ agents, phrase }))
    .sort((a, b) => Number(b.phrase === "by") - Number(a.phrase === "by"));
}

/** The makers' names, for titles: "Jim Butcher", else the creator text. */
export function makerNames(reference: Reference) {
  const makers = groupCredits(reference.credits).find(
    (group) => group.phrase === "by"
  );
  return (
    makers?.agents.map((agent) => agent.title).join(", ") ||
    reference.creator ||
    null
  );
}

/** "Book 3", "#3" or nothing: where a part sits in its whole. */
export function placeLabel(row: {
  label?: string | null;
  position?: number | null;
}) {
  if (row.label) {
    return row.label;
  }
  return typeof row.position === "number" ? `#${row.position}` : null;
}

export interface LinkedReference {
  note?: string;
  reference: Reference;
}

/** The wholes a reference belongs to, with its place in each. */
export function getWholes(reference: Reference): LinkedReference[] {
  return (reference.partOf ?? []).flatMap((row) => {
    const whole = populated(row.whole);
    return whole
      ? [{ note: placeLabel(row) ?? undefined, reference: whole }]
      : [];
  });
}

/** A join's references, once each: a join on an array field returns a
 * reference once per matching row. */
function joined(join: { docs?: (number | Reference)[] } | undefined) {
  const seen = new Set<number>();
  return (join?.docs ?? []).flatMap((doc) => {
    const reference = populated(doc);
    if (!reference || seen.has(reference.id)) {
      return [];
    }
    seen.add(reference.id);
    return [reference];
  });
}

const byYear = (a: Reference, b: Reference) =>
  (a.year ?? Number.POSITIVE_INFINITY) - (b.year ?? Number.POSITIVE_INFINITY);

/** A whole's parts in order: by year, then by position. Positions are often
 * known for only some parts, so they can't lead. */
export function getParts(reference: Reference): LinkedReference[] {
  return joined(reference.parts)
    .map((part) => {
      const row = part.partOf?.find(
        (candidate) =>
          (typeof candidate.whole === "object"
            ? candidate.whole?.id
            : candidate.whole) === reference.id
      );
      return {
        note: row ? (placeLabel(row) ?? undefined) : undefined,
        position: row?.position ?? Number.POSITIVE_INFINITY,
        reference: part,
      };
    })
    .sort((a, b) => byYear(a.reference, b.reference) || a.position - b.position)
    .map(({ note, reference: part }) => ({ note, reference: part }));
}

/** "1991–2004", "2010–" or nothing. */
function yearsLabel(start?: number | null, end?: number | null) {
  if (!(start || end)) {
    return null;
  }
  return `${start ?? ""}–${end ?? ""}`;
}

/** A group's members, with their roles and years. */
export function getMembers(reference: Reference): LinkedReference[] {
  // Someone who left and came back has a row per stint; they show once.
  const members = new Map<number, LinkedReference & { notes: string[] }>();
  for (const row of reference.members ?? []) {
    const member = populated(row.member);
    if (!member) {
      continue;
    }
    const note = [row.role, yearsLabel(row.start, row.end)]
      .filter(Boolean)
      .join(", ");
    const entry = members.get(member.id) ?? { notes: [], reference: member };
    if (note) {
      entry.notes.push(note);
    }
    members.set(member.id, entry);
  }
  return [...members.values()].map(({ notes, reference: member }) => ({
    note: notes.join("; ") || undefined,
    reference: member,
  }));
}

/** The lists a hub shows below its activities, in reading order. */
export function getRelatedLists(reference: Reference) {
  const plain = (references: Reference[]) =>
    references.map((related) => ({ reference: related }));
  return [
    {
      items: getParts(reference),
      label: reference.type === "series" ? "In this series" : "Includes",
    },
    {
      items: plain(
        (reference.basedOn ?? []).flatMap((value) => populated(value) ?? [])
      ),
      label: "Based on",
    },
    {
      items: plain(joined(reference.adaptations).sort(byYear)),
      label: "Adaptations",
    },
    { items: plain(joined(reference.credited).sort(byYear)), label: "Works" },
    { items: getMembers(reference), label: "Members" },
    { items: plain(joined(reference.memberOf)), label: "Member of" },
  ].filter((list) => list.items.length > 0);
}
