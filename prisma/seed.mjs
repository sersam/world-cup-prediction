import { PrismaClient, MatchStatus } from "@prisma/client";

const prisma = new PrismaClient();

function dateAtUtc(daysFromNow, hour, minute = 0) {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysFromNow,
      hour,
      minute,
      0,
    ),
  );
}

const matches = [
  {
    externalId: 900001,
    homeTeam: "Espana",
    awayTeam: "Mexico",
    homeTeamCode: "ESP",
    awayTeamCode: "MEX",
    utcDate: dateAtUtc(1, 18),
    matchday: 1,
    stage: "GROUP_STAGE",
    groupName: "Grupo A",
  },
  {
    externalId: 900002,
    homeTeam: "Argentina",
    awayTeam: "Japon",
    homeTeamCode: "ARG",
    awayTeamCode: "JPN",
    utcDate: dateAtUtc(1, 21),
    matchday: 1,
    stage: "GROUP_STAGE",
    groupName: "Grupo B",
  },
  {
    externalId: 900003,
    homeTeam: "Francia",
    awayTeam: "Marruecos",
    homeTeamCode: "FRA",
    awayTeamCode: "MAR",
    utcDate: dateAtUtc(2, 17),
    matchday: 1,
    stage: "GROUP_STAGE",
    groupName: "Grupo C",
  },
  {
    externalId: 900004,
    homeTeam: "Brasil",
    awayTeam: "Portugal",
    homeTeamCode: "BRA",
    awayTeamCode: "POR",
    utcDate: dateAtUtc(2, 20),
    matchday: 1,
    stage: "GROUP_STAGE",
    groupName: "Grupo D",
  },
];

for (const match of matches) {
  await prisma.match.upsert({
    where: { externalId: match.externalId },
    create: {
      ...match,
      competition: "WC",
      status: MatchStatus.SCHEDULED,
    },
    update: {
      ...match,
      competition: "WC",
      status: MatchStatus.SCHEDULED,
      finalHomeGoals: null,
      finalAwayGoals: null,
      scoreWinner: null,
      scoreDuration: null,
      penaltyHomeGoals: null,
      penaltyAwayGoals: null,
    },
  });
}

await prisma.$disconnect();

console.log(`Seeded ${matches.length} demo matches.`);
