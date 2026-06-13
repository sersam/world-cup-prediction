import { describe, expect, it } from "vitest";
import { flagFromTeamCode, teamNameEsFromCode } from "@/lib/flags";

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

  it("uses separate home nation flags instead of the United Kingdom flag", () => {
    expect(flagFromTeamCode("ENG")).toBe(
      "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
    );
    expect(flagFromTeamCode("SCO")).toBe(
      "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
    );
    expect(flagFromTeamCode("WAL")).toBe(
      "\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}",
    );
    expect(flagFromTeamCode("GB")).toBe("🇬🇧");
  });
});

describe("teamNameEsFromCode", () => {
  it("translates FIFA team codes to Spanish country names", () => {
    expect(teamNameEsFromCode("USA", "United States")).toBe("Estados Unidos");
    expect(teamNameEsFromCode("KOR", "South Korea")).toBe("Corea del Sur");
    expect(teamNameEsFromCode("NED", "Netherlands")).toBe("Países Bajos");
    expect(teamNameEsFromCode("GER", "Germany")).toBe("Alemania");
  });

  it("uses Spanish names for home nations and falls back when code is missing", () => {
    expect(teamNameEsFromCode("ENG", "England")).toBe("Inglaterra");
    expect(teamNameEsFromCode(null, "Equipo por confirmar")).toBe("Equipo por confirmar");
  });
});
