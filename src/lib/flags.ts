const fifaToIso2: Record<string, string> = {
  ARG: "AR",
  AUS: "AU",
  AUT: "AT",
  BEL: "BE",
  BRA: "BR",
  CAN: "CA",
  CHI: "CL",
  CMR: "CM",
  COL: "CO",
  CRC: "CR",
  CRO: "HR",
  DEN: "DK",
  ECU: "EC",
  ENG: "GB",
  ESP: "ES",
  FRA: "FR",
  GER: "DE",
  GHA: "GH",
  IRN: "IR",
  ITA: "IT",
  JPN: "JP",
  KOR: "KR",
  MAR: "MA",
  MEX: "MX",
  NED: "NL",
  NGA: "NG",
  NZL: "NZ",
  PAR: "PY",
  PER: "PE",
  POL: "PL",
  POR: "PT",
  QAT: "QA",
  KSA: "SA",
  SCO: "GB",
  SEN: "SN",
  SRB: "RS",
  SUI: "CH",
  TUN: "TN",
  UKR: "UA",
  URU: "UY",
  USA: "US",
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
