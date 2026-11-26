import { describe, expect, it } from "vitest";
import {
  countWords,
  estimateReadingTimeMinutes,
  formatReadingTime,
} from "./reading-time";

function makeDoc(text: string) {
  return {
    root: {
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", text }],
        },
      ],
    },
  };
}

describe("reading time", () => {
  it("returns null for empty or missing content", () => {
    expect(estimateReadingTimeMinutes(null)).toBeNull();
    expect(estimateReadingTimeMinutes(makeDoc("   "))).toBeNull();
    expect(countWords("   ")).toBe(0);
  });

  it("rounds short pieces up to 1 minute", () => {
    expect(estimateReadingTimeMinutes(makeDoc("A brief note."))).toBe(1);
    expect(formatReadingTime(1)).toBe("1 min read");
  });

  it("scales reading time at roughly 220 words per minute", () => {
    const words660 = Array.from({ length: 660 }, (_, i) => `word${i}`).join(
      " "
    );
    expect(estimateReadingTimeMinutes(makeDoc(words660))).toBe(3);
    expect(formatReadingTime(3)).toBe("3 min read");
  });
});
