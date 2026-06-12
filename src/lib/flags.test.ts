import { describe, expect, it } from "vitest";
import { flagFromTeamCode } from "@/lib/flags";

const syncedWorldCupCodes = [
  "ALG",
  "ARG",
  "AUS",
  "AUT",
  "BEL",
  "BIH",
  "BRA",
  "CAN",
  "CIV",
  "COD",
  "COL",
  "CPV",
  "CRO",
  "CUW",
  "CZE",
  "ECU",
  "EGY",
  "ENG",
  "ESP",
  "FRA",
  "GER",
  "GHA",
  "HAI",
  "IRN",
  "IRQ",
  "JOR",
  "JPN",
  "KOR",
  "KSA",
  "MAR",
  "MEX",
  "NED",
  "NOR",
  "NZL",
  "PAN",
  "PAR",
  "POR",
  "QAT",
  "RSA",
  "SCO",
  "SEN",
  "SUI",
  "SWE",
  "TUN",
  "TUR",
  "URY",
  "USA",
  "UZB",
];

describe("flagFromTeamCode", () => {
  it("returns flag emoji for every synced World Cup team code", () => {
    for (const code of syncedWorldCupCodes) {
      expect(flagFromTeamCode(code), code).not.toBe(code);
    }
  });
});
