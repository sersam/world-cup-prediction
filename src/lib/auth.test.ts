import { describe, expect, it } from "vitest";
import { isValidGroupCode, normalizeGroupCode } from "@/lib/auth";

describe("normalizeGroupCode", () => {
  it("removes accents and keeps URL-safe group codes", () => {
    expect(normalizeGroupCode(" Peña 2026 ")).toBe("PENA-2026");
    expect(normalizeGroupCode("la_roj@")).toBe("LA-ROJ");
  });

  it("validates normalized group codes", () => {
    expect(isValidGroupCode("PENA-2026")).toBe(true);
    expect(isValidGroupCode("PE")).toBe(false);
    expect(isValidGroupCode("PEÑA")).toBe(false);
  });
});
