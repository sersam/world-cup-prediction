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
  ENG: "GB",
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
  SCO: "GB",
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
  WAL: "GB",
};

export function flagFromTeamCode(code?: string | null): string {
  if (!code) return "";

  const normalized = code.trim().toUpperCase();
  const iso2 = /^[A-Z]{2}$/.test(normalized)
    ? normalized
    : fifaToIso2[normalized];

  if (!iso2) return normalized;

  return [...iso2]
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}
