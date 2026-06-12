import { describe, expect, it } from "vitest";
import { isPredictionOpen } from "@/lib/dates";

describe("isPredictionOpen", () => {
  it("allows predictions before kickoff", () => {
    expect(
      isPredictionOpen(
        new Date("2026-06-12T20:00:00.000Z"),
        new Date("2026-06-12T19:59:59.000Z"),
      ),
    ).toBe(true);
  });

  it("blocks predictions from kickoff", () => {
    expect(
      isPredictionOpen(
        new Date("2026-06-12T20:00:00.000Z"),
        new Date("2026-06-12T20:00:00.000Z"),
      ),
    ).toBe(false);
  });
});
