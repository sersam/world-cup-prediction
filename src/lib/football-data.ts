import { MatchStatus } from "@prisma/client";

type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: keyof typeof MatchStatus;
  matchday?: number | null;
  stage?: string | null;
  group?: string | null;
  homeTeam: { name?: string | null; tla?: string | null };
  awayTeam: { name?: string | null; tla?: string | null };
  score?: {
    fullTime?: {
      home?: number | null;
      away?: number | null;
    };
  };
};

type FootballDataResponse = {
  matches: FootballDataMatch[];
};

export type SyncedMatch = {
  externalId: number;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamCode: string | null;
  awayTeamCode: string | null;
  utcDate: Date;
  status: MatchStatus;
  matchday: number | null;
  stage: string | null;
  groupName: string | null;
  finalHomeGoals: number | null;
  finalAwayGoals: number | null;
};

function toMatchStatus(status: string): MatchStatus {
  return status in MatchStatus ? (status as MatchStatus) : MatchStatus.SCHEDULED;
}

export async function fetchWorldCupMatches(): Promise<SyncedMatch[]> {
  const token = process.env.FOOTBALL_DATA_API_TOKEN;
  if (!token) {
    throw new Error("FOOTBALL_DATA_API_TOKEN is required to sync matches.");
  }

  const response = await fetch("https://api.football-data.org/v4/competitions/WC/matches", {
    headers: { "X-Auth-Token": token },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`football-data.org sync failed: ${response.status}`);
  }

  const payload = (await response.json()) as FootballDataResponse;

  return payload.matches.map((match) => {
    const finalScore = match.score?.fullTime;
    const status = toMatchStatus(match.status);
    const isFinished = status === MatchStatus.FINISHED;

    return {
      externalId: match.id,
      competition: "WC",
      homeTeam: match.homeTeam.name || "Equipo local por confirmar",
      awayTeam: match.awayTeam.name || "Equipo visitante por confirmar",
      homeTeamCode: match.homeTeam.tla || null,
      awayTeamCode: match.awayTeam.tla || null,
      utcDate: new Date(match.utcDate),
      status,
      matchday: match.matchday ?? null,
      stage: match.stage ?? null,
      groupName: match.group ?? null,
      finalHomeGoals: isFinished ? finalScore?.home ?? null : null,
      finalAwayGoals: isFinished ? finalScore?.away ?? null : null,
    };
  });
}
