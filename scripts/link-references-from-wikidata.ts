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

const idOf = (value: number | Reference | null | undefined) =>
  typeof value === "object" ? value?.id : value;
/** The first link to each target, among those not already linked. */
function newLinks<T>(
  rows: T[],
  target: (row: T) => number,
  known: Set<number>
) {
  return rows.filter((row) => {
    const id = target(row);
    if (known.has(id)) {
      return false;
    }
    known.add(id);
    return true;
  });
}
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
  // Starting from what is linked, plus the reference itself.
  const known = (ids: (number | Reference | null | undefined)[] = []) =>
    new Set([doc.id, ...ids.flatMap((id) => idOf(id) ?? [])]);
  const works = !isAgent(doc.type);

  const credits = works
    ? newLinks(
        links.credits,
        (row) => row.agent,
        known(doc.credits?.map((row) => row.agent))
      )
    : [];
  const partOf = works
    ? newLinks(
        links.partOf,
        (row) => row.whole,
        known(doc.partOf?.map((row) => row.whole))
      )
    : [];
  const basedOn = works
    ? newLinks(links.basedOn, (id) => id, known(doc.basedOn ?? []))
    : [];
  const members =
    doc.type === "organization"
      ? newLinks(
          links.members,
          (row) => row.member,
          known(doc.members?.map((row) => row.member))
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
    try {
      await payload.update({
        collection: "references",
        id: doc.id,
        context: { skipRevalidation: true },
        data: {
          basedOn: [
            ...(doc.basedOn ?? []).flatMap((id) => idOf(id) ?? []),
            ...basedOn,
          ],
          credits: [...(doc.credits ?? []), ...credits],
          members: [...(doc.members ?? []), ...members],
          partOf: [...(doc.partOf ?? []), ...partOf],
        },
        overrideAccess: true,
      });
    } catch (error) {
      // One reference that won't save shouldn't stop the rest.
      changed -= 1;
      payload.logger.error({ err: error, msg: `Skipped ${doc.title}` });
    }
  }
}

payload.logger.info(
  `${write ? "Linked" : "Would link"} ${changed} of ${docs.length} references`
);
process.exit(0);
