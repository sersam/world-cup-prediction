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
    winner?: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
    duration?: string | null;
    fullTime?: {
      home?: number | null;
      away?: number | null;
    };
    regularTime?: {
      home?: number | null;
      away?: number | null;
    };
    extraTime?: {
      home?: number | null;
      away?: number | null;
    };
    penalties?: {
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
  scoreWinner: string | null;
  scoreDuration: string | null;
  penaltyHomeGoals: number | null;
  penaltyAwayGoals: number | null;
};

function toMatchStatus(status: string): MatchStatus {
  return status in MatchStatus ? (status as MatchStatus) : MatchStatus.SCHEDULED;
}

type FootballDataScore = NonNullable<FootballDataMatch["score"]>;
type FootballDataScorePart = NonNullable<FootballDataScore["fullTime"]>;

function scoreValue(score: FootballDataScorePart | undefined, side: "home" | "away") {
  return score?.[side] ?? null;
}

function combineScores(
  first: FootballDataScorePart | undefined,
  second: FootballDataScorePart | undefined,
) {
  const home = (scoreValue(first, "home") ?? 0) + (scoreValue(second, "home") ?? 0);
  const away = (scoreValue(first, "away") ?? 0) + (scoreValue(second, "away") ?? 0);

  if (
    scoreValue(first, "home") === null &&
    scoreValue(first, "away") === null &&
    scoreValue(second, "home") === null &&
    scoreValue(second, "away") === null
  ) {
    return null;
  }

  return { home, away };
}

function matchScoreFromScore(score: FootballDataScore | undefined) {
  if (!score) return null;

  const matchScore = scoreBeforePenaltiesFromScore(score);
  if (matchScore) return matchScore;

  return score.fullTime ?? null;
}

function scoreBeforePenaltiesFromScore(score: FootballDataScore) {
  return combineScores(score.regularTime, score.extraTime);
}

function penaltyScoreFromScore(score: FootballDataScore | undefined) {
  if (!score || score.duration !== "PENALTY_SHOOTOUT") return null;

  const scoreBeforePenalties = scoreBeforePenaltiesFromScore(score);
  if (
    score.fullTime &&
    scoreBeforePenalties &&
    score.fullTime.home !== null &&
    score.fullTime.home !== undefined &&
    score.fullTime.away !== null &&
    score.fullTime.away !== undefined
  ) {
    return {
      home: score.fullTime.home - scoreBeforePenalties.home,
      away: score.fullTime.away - scoreBeforePenalties.away,
    };
  }

  return score.penalties ?? null;
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
    const finalScore = matchScoreFromScore(match.score);
    const penaltyScore = penaltyScoreFromScore(match.score);
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
      scoreWinner: isFinished ? match.score?.winner ?? null : null,
      scoreDuration: isFinished ? match.score?.duration ?? null : null,
      penaltyHomeGoals: isFinished ? penaltyScore?.home ?? null : null,
      penaltyAwayGoals: isFinished ? penaltyScore?.away ?? null : null,
    };
  });
}
