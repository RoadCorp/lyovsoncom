import { after } from "next/server";
import { getPayloadClient } from "@/utilities/payload-client";

type ApiTelemetrySummary = Record<
  string,
  boolean | number | string | null | undefined
>;

export function logApiTelemetry(args: {
  route: string;
  startedAt: number;
  level?: "error" | "info" | "warn";
  summary?: ApiTelemetrySummary;
}) {
  const { route, startedAt, level = "info", summary } = args;

  after(async () => {
    const payload = await getPayloadClient();
    const logData = {
      msg: route,
      durationMs: Date.now() - startedAt,
      ...summary,
    };

    if (level === "error") {
      payload.logger.error(logData);
      return;
    }

    if (level === "warn") {
      payload.logger.warn(logData);
      return;
    }

    payload.logger.info(logData);
  });
}
