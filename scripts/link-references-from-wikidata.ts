/**
 * Add the credits, "part of", "based on" and member links Wikidata knows of
 * between existing references, as the catalog picker does on import. Links
 * already there stay; nothing is removed and no reference is created.
 *
 * Dry run:  pnpm payload run scripts/link-references-from-wikidata.ts
 * Write:    LINK_WRITE=1 pnpm payload run scripts/link-references-from-wikidata.ts
 *
 * Writes skip cache invalidation; invalidate the references tag after.
 */
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { resolveLinks } from "@/collections/References/catalog/import";
import { getWikidataFacts } from "@/collections/References/catalog/wikidata";
import type { Reference } from "@/payload-types";

const write = process.env.LINK_WRITE === "1";
const payload = await getPayload({ config: await configPromise });

const { docs } = await payload.find({
  collection: "references",
  depth: 0,
  pagination: false,
  where: { wikidataId: { exists: true } },
});

const idOf = (value: number | Reference) =>
  typeof value === "object" ? value.id : value;
const isAgent = (type: Reference["type"]) =>
  type === "person" || type === "organization";

let changed = 0;
for (const doc of docs) {
  if (!doc.wikidataId) {
    continue;
  }
  const facts = await getWikidataFacts(doc.wikidataId);
  if (!facts.links) {
    continue;
  }
  const links = await resolveLinks({ payload }, facts.links);
  const other = (id: number) => id !== doc.id;

  const knownCredits = new Set(doc.credits?.map((row) => idOf(row.agent)));
  const credits = isAgent(doc.type)
    ? []
    : links.credits.filter(
        (row) => other(row.agent) && !knownCredits.has(row.agent)
      );
  const knownWholes = new Set(doc.partOf?.map((row) => idOf(row.whole)));
  const partOf = isAgent(doc.type)
    ? []
    : links.partOf.filter(
        (row) => other(row.whole) && !knownWholes.has(row.whole)
      );
  const knownBases = new Set(doc.basedOn?.map(idOf));
  const basedOn = isAgent(doc.type)
    ? []
    : links.basedOn.filter((id) => other(id) && !knownBases.has(id));
  const knownMembers = new Set(doc.members?.map((row) => idOf(row.member)));
  const members =
    doc.type === "organization"
      ? links.members.filter(
          (row) => other(row.member) && !knownMembers.has(row.member)
        )
      : [];

  if (credits.length + partOf.length + basedOn.length + members.length === 0) {
    continue;
  }
  changed += 1;
  payload.logger.info(
    `${doc.title}: ${JSON.stringify({ basedOn, credits, members, partOf })}`
  );
  if (write) {
    await payload.update({
      collection: "references",
      id: doc.id,
      context: { skipRevalidation: true },
      data: {
        basedOn: [...(doc.basedOn ?? []).map(idOf), ...basedOn],
        credits: [...(doc.credits ?? []), ...credits],
        members: [...(doc.members ?? []), ...members],
        partOf: [...(doc.partOf ?? []), ...partOf],
      },
      overrideAccess: true,
    });
  }
}

payload.logger.info(
  `${write ? "Linked" : "Would link"} ${changed} of ${docs.length} references`
);
process.exit(0);
