import { describe, expect, it } from "vitest";
import { draftSaveGuard } from "./draft-save-guard";

type HookArgs = Parameters<typeof draftSaveGuard>[0];

function run({
  data,
  draft,
  user,
}: {
  data: Record<string, unknown>;
  draft: boolean;
  user: { collection: string } | null;
}) {
  const req = { context: {}, user } as unknown as HookArgs["req"];
  const args = draftSaveGuard({
    args: { data, draft, req },
    operation: "update",
    req,
  } as unknown as HookArgs) as { data: Record<string, unknown> };
  return { data: args.data, context: req.context };
}

describe("draft save guard", () => {
  it("keeps an agent's draft save a draft when it echoes a published status", () => {
    const { data, context } = run({
      data: { _status: "published", title: "Edit" },
      draft: true,
      user: { collection: "agents" },
    });
    expect(data._status).toBe("draft");
    expect(context.draftSave).toBe(true);
  });

  it("lets a Lyovson publish through a draft-flagged save", () => {
    const { data, context } = run({
      data: { _status: "published" },
      draft: true,
      user: { collection: "lyovsons" },
    });
    expect(data._status).toBe("published");
    expect(context.draftSave).toBeUndefined();
  });

  it("leaves a publish without the draft flag alone", () => {
    const { data, context } = run({
      data: { _status: "published" },
      draft: false,
      user: { collection: "agents" },
    });
    expect(data._status).toBe("published");
    expect(context.draftSave).toBeUndefined();
  });
});
