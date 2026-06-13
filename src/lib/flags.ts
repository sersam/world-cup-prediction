const specialTeamFlags: Record<string, string> = {
  ENG: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  SCO: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
  WAL: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}",
};

const fifaToIso2: Record<string, string> = {
  ALG: "DZ",
  ARG: "AR",
  AUS: "AU",
  AUT: "AT",
  BEL: "BE",
  BIH: "BA",
  BRA: "BR",
  CAN: "CA",
  CHI: "CL",
  CIV: "CI",
  CMR: "CM",
  COD: "CD",
  COL: "CO",
  CPV: "CV",
  CRC: "CR",
  CRO: "HR",
  CUW: "CW",
  CZE: "CZ",
  DEN: "DK",
  ECU: "EC",
  EGY: "EG",
  ESP: "ES",
  FRA: "FR",
  GER: "DE",
  GHA: "GH",
  HAI: "HT",
  IRN: "IR",
  IRQ: "IQ",
  ITA: "IT",
  JOR: "JO",
  JPN: "JP",
  KOR: "KR",
  MAR: "MA",
  MEX: "MX",
  NED: "NL",
  NGA: "NG",
  NOR: "NO",
  NZL: "NZ",
  PAN: "PA",
  PAR: "PY",
  PER: "PE",
  POL: "PL",
  POR: "PT",
  QAT: "QA",
  RSA: "ZA",
  KSA: "SA",
  SEN: "SN",
  SRB: "RS",
  SUI: "CH",
  SWE: "SE",
  TUN: "TN",
  TUR: "TR",
  UKR: "UA",
  URU: "UY",
  URY: "UY",
  USA: "US",
  UZB: "UZ",
};

export function flagFromTeamCode(code?: string | null): string {
  if (!code) return "";

  const normalized = code.trim().toUpperCase();
  const specialFlag = specialTeamFlags[normalized];

  if (specialFlag) return specialFlag;

  const iso2 = /^[A-Z]{2}$/.test(normalized)
    ? normalized
    : fifaToIso2[normalized];

  if (!iso2) return normalized;

  return [...iso2]
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}
