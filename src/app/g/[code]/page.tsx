import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MatchStatus } from "@prisma/client";
import { BadgeList } from "@/app/_components/badges";
import { getCurrentUser } from "@/lib/auth";
import { buildGroupBadges } from "@/lib/badges";
import { formatMatchDate, getTodayWindow, getTomorrowWindow, isPredictionOpen } from "@/lib/dates";
import { flagFromTeamCode, flagImageSrcFromTeamCode, teamNameEsFromCode } from "@/lib/flags";
import { prisma } from "@/lib/prisma";
import { buildRanking } from "@/lib/rankings";

export const dynamic = "force-dynamic";

function resultText(match: {
  status: MatchStatus;
  finalHomeGoals: number | null;
  finalAwayGoals: number | null;
}) {
  if (
    match.status === MatchStatus.FINISHED &&
    match.finalHomeGoals !== null &&
    match.finalAwayGoals !== null
  ) {
    return `${match.finalHomeGoals} - ${match.finalAwayGoals}`;
  }

  return match.status === MatchStatus.IN_PLAY ? "En juego" : "Pendiente";
}

function predictionText(
  prediction?: {
    predictedHome: number;
    predictedAway: number;
    points: number;
  },
) {
  if (!prediction) return "Sin prediccion";
  return `${prediction.predictedHome} - ${prediction.predictedAway} · ${prediction.points} pts`;
}

function predictionButtonContent({
  match,
  open,
  hasPrediction,
}: {
  match: { status: MatchStatus };
  open: boolean;
  hasPrediction: boolean;
}) {
  if (open) return hasPrediction ? "Actualizar" : "Guardar";

  if (match.status === MatchStatus.FINISHED) return "Finalizado";

  if (match.status === MatchStatus.IN_PLAY || match.status === MatchStatus.PAUSED) {
    return (
      <span className="inline-flex items-center justify-center gap-2">
        <span>En curso</span>
        <span aria-hidden="true" className="live-ball">
          ⚽
        </span>
      </span>
    );
  }

  return "Cerrado";
}

function FlagBall({
  code,
  label,
  small = false,
}: {
  code?: string | null;
  label: string;
  small?: boolean;
}) {
  const flag = flagFromTeamCode(code);
  const flagImageSrc = flagImageSrcFromTeamCode(code);

  return (
    <span
      aria-label={`Bandera de ${label}`}
      className={`flag-ball ${small ? "flag-ball-sm" : ""}`}
      title={label}
    >
      {flagImageSrc ? (
        <Image alt="" aria-hidden="true" className="flag-ball-img" fill src={flagImageSrc} />
      ) : (
        <span className="flag-ball-fill" aria-hidden="true">
          {flag || "•"}
        </span>
      )}
    </span>
  );
}

const podiumConfig = [
  {
    rank: 2,
    medal: "🥈",
    label: "Plata",
    orderClass: "order-1",
    cardClass: "pt-3",
    stepClass: "h-10 bg-[#d8dde3] text-[#151515] md:h-14",
  },
  {
    rank: 1,
    medal: "🥇",
    label: "Oro",
    orderClass: "order-2",
    cardClass: "pt-0",
    stepClass: "h-14 bg-[#f2b705] text-[#151515] md:h-20",
  },
  {
    rank: 3,
    medal: "🥉",
    label: "Bronce",
    orderClass: "order-3",
    cardClass: "pt-5",
    stepClass: "h-8 bg-[#c98f58] text-white md:h-11",
  },
] as const;

export default async function GroupHome({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  const { code } = await params;
  const group = user.memberships.find(
    (membership) => membership.group.code === code.toUpperCase(),
  )?.group;
  if (!group) redirect("/grupo");

  const headerStore = await headers();
  const host = headerStore.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const inviteUrl = `${protocol}://${host}/entrar?code=${group.code}`;

  const today = getTodayWindow();
  const tomorrow = getTomorrowWindow();
  const [groupUsers, activeWindowMatches, upcomingMatches, finishedMatches] = await Promise.all([
    prisma.user.findMany({
      where: {
        memberships: {
          some: { groupId: group.id },
        },
      },
      include: {
        predictions: {
          where: { groupId: group.id },
          include: {
            match: {
              select: {
                utcDate: true,
              },
            },
          },
        },
      },
    }),
    prisma.match.findMany({
      where: {
        utcDate: { gte: today.start, lt: tomorrow.end },
      },
      include: {
        predictions: {
          where: {
            userId: user.id,
            groupId: group.id,
          },
        },
      },
      orderBy: { utcDate: "asc" },
    }),
    prisma.match.findMany({
      where: {
        utcDate: { gte: new Date() },
      },
      include: {
        predictions: {
          where: {
            userId: user.id,
            groupId: group.id,
          },
        },
      },
      orderBy: { utcDate: "asc" },
      take: 12,
    }),
    prisma.match.findMany({
      where: {
        status: MatchStatus.FINISHED,
      },
      include: {
        predictions: {
          where: {
            userId: user.id,
            groupId: group.id,
          },
        },
      },
      orderBy: { utcDate: "desc" },
      take: 24,
    }),
  ]);

  const matches = activeWindowMatches.length > 0 ? activeWindowMatches : upcomingMatches;
  const topThree = buildRanking(groupUsers).slice(0, 3);
  const ranking = buildRanking(groupUsers);
  const groupBadges = buildGroupBadges(groupUsers, {
    ranking,
  });
  const currentUserBadges = groupBadges.get(user.id) ?? [];

  return (
    <main className="pitch-bg pitch-lines min-h-screen text-[#151515]">
      <section className="relative z-10 mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-8 px-4 py-6 sm:px-8">
        <header className="brand-panel rounded-xl p-5 md:flex md:items-center md:justify-between">
          <div className="brand-lockup min-w-0">
            <span className="brand-logo" aria-hidden="true">
              <Image
                alt=""
                height={650}
                priority
                src="/brand/world-cup-2026.webp"
                width={866}
              />
            </span>
            <div className="min-w-0">
              <p className="brand-kicker text-sm font-semibold">{group.name}</p>
              <h1 className="brand-heading-on-dark mt-2 text-3xl tracking-normal sm:text-5xl">
                Predicciones del Mundial
              </h1>
              <div className="brand-rule mt-3" />
            </div>
          </div>
          <nav className="mt-5 flex flex-wrap gap-2 text-sm font-semibold md:mt-0">
            <Link className="brand-button-gold rounded-md px-4 py-2" href={`/g/${group.code}/ranking`}>
              Ranking
            </Link>
          </nav>
        </header>

        <section className="glass-panel rounded-lg p-3 text-[#151515] md:p-4">
          {topThree.length > 0 ? (
            <div className="grid grid-cols-3 items-end gap-2 md:gap-3">
              {podiumConfig.map((slot) => {
                const entry = topThree[slot.rank - 1];
                if (!entry) return null;

                return (
                  <article
                    className={`flex min-w-0 flex-col justify-end ${slot.orderClass} ${slot.cardClass} md:pt-0`}
                    key={entry.id}
                  >
                    <div className="min-w-0 rounded-lg border border-[#e7dcc6] bg-white/80 p-2 text-center shadow-sm md:p-3 md:text-left">
                      <div className="flex items-center justify-center gap-1 md:justify-between md:gap-3">
                        <span
                          aria-label={`Medalla de ${slot.label}`}
                          className="text-xl leading-none md:text-3xl"
                        >
                          {slot.medal}
                        </span>
                        <span className="rounded-full bg-[#fff4d6] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#007a3d] md:px-2 md:py-1 md:text-xs">
                          #{slot.rank}
                        </span>
                      </div>
                      <div className="mt-1 min-w-0 md:mt-2">
                        <h2 className="truncate text-xs font-semibold md:text-lg">
                          {entry.nickname}
                        </h2>
                        <p className="text-xs font-bold text-[#007a3d] md:text-sm">
                          {entry.points} pts
                        </p>
                        {(groupBadges.get(entry.id)?.length ?? 0) > 0 ? (
                          <div className="mt-2 flex justify-center md:justify-start">
                            <BadgeList badges={groupBadges.get(entry.id)!} compact limit={4} />
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div
                      className={`mt-1 flex items-center justify-center rounded-t-md px-2 text-sm font-black md:mt-2 md:px-3 md:text-lg ${slot.stepClass}`}
                    >
                      {slot.rank}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
          {topThree.length === 0 ? (
            <article className="p-2 text-[#151515]">
              <h2 className="text-xl font-semibold">Todavia no hay puntuaciones</h2>
              <p className="mt-2 text-[#5d615f]">
                Cuando se puntuen los primeros partidos, aparecera aqui el top 3.
              </p>
            </article>
          ) : null}
        </section>

        <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold">
                {activeWindowMatches.length > 0 ? "Partidos de hoy y manana" : "Proximos partidos"}
              </h2>
              <p className="text-sm text-[#5d615f]">
                Puedes editar cada prediccion hasta el inicio del partido.
              </p>
            </div>

            {matches.length === 0 ? (
              <div className="glass-panel rounded-lg p-6 text-[#151515]">
                <h3 className="text-lg font-semibold">
                  {finishedMatches.length > 0
                    ? "No hay proximos partidos"
                    : "No hay partidos sincronizados"}
                </h3>
                {finishedMatches.length > 0 ? (
                  <p className="mt-2 text-[#5d615f]">
                    La sincronizacion actual solo tiene partidos finalizados. Puedes revisarlos en
                    el historico.
                  </p>
                ) : (
                  <p className="mt-2 text-[#5d615f]">
                    Configura `FOOTBALL_DATA_API_TOKEN` y ejecuta `POST /api/sync` para cargar el
                    calendario del Mundial.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((match) => {
                  const prediction = match.predictions[0];
                  const open = isPredictionOpen(match.utcDate);
                  const missingClosedPrediction = !open && !prediction;
                  const homeTeamName = teamNameEsFromCode(match.homeTeamCode, match.homeTeam);
                  const awayTeamName = teamNameEsFromCode(match.awayTeamCode, match.awayTeam);

                  return (
                    <article
                      className="match-card min-w-0 rounded-lg p-4 text-[#151515]"
                      key={match.id}
                    >
                      <form action="/api/predictions" className="grid gap-3" method="post">
                        <input name="matchId" type="hidden" value={match.id} />
                        <input name="groupCode" type="hidden" value={group.code} />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-[#5d615f]">
                            {formatMatchDate(match.utcDate)}
                          </p>
                          <span className="rounded-full bg-[#eaf1ff] px-2 py-1 text-xs font-bold text-[#007a3d]">
                            {resultText(match)}
                          </span>
                        </div>
                        <div className="grid gap-2">
                          <label className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-[#e7dcc6] bg-white px-3 py-2">
                            <span className="flex min-w-0 items-center gap-2">
                              <FlagBall code={match.homeTeamCode} label={homeTeamName} small />
                              <span className="min-w-0 break-words text-lg font-semibold">
                                {homeTeamName}
                              </span>
                            </span>
                            <span className="grid gap-1 text-center text-[10px] font-semibold uppercase text-[#5d615f]">
                              Local
                              <input
                                className="h-11 w-16 rounded-md border border-[#d6c7aa] bg-white px-3 text-center text-base font-bold"
                                defaultValue={
                                  prediction?.predictedHome ?? (missingClosedPrediction ? "-" : "")
                                }
                                disabled={!open}
                                min={0}
                                name="predictedHome"
                                required
                                type={missingClosedPrediction ? "text" : "number"}
                              />
                            </span>
                          </label>
                          <label className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-[#e7dcc6] bg-white px-3 py-2">
                            <span className="flex min-w-0 items-center gap-2">
                              <FlagBall code={match.awayTeamCode} label={awayTeamName} small />
                              <span className="min-w-0 break-words text-lg font-semibold">
                                {awayTeamName}
                              </span>
                            </span>
                            <span className="grid gap-1 text-center text-[10px] font-semibold uppercase text-[#5d615f]">
                              Visit.
                              <input
                                className="h-11 w-16 rounded-md border border-[#d6c7aa] bg-white px-3 text-center text-base font-bold"
                                defaultValue={
                                  prediction?.predictedAway ?? (missingClosedPrediction ? "-" : "")
                                }
                                disabled={!open}
                                min={0}
                                name="predictedAway"
                                required
                                type={missingClosedPrediction ? "text" : "number"}
                              />
                            </span>
                          </label>
                        </div>
                        <div className="grid gap-2 rounded-md bg-[#fff4d6] px-3 py-2 text-sm text-[#5d615f] sm:grid-cols-3">
                          <span>
                            Real:{" "}
                            <strong className="text-[#1d1b16]">{resultText(match)}</strong>
                          </span>
                          <span>
                            Prediccion:{" "}
                            <strong className="text-[#1d1b16]">
                              {predictionText(prediction).split(" · ")[0]}
                            </strong>
                          </span>
                          <span>
                            Puntos:{" "}
                            <strong className="text-[#1d1b16]">
                              {prediction ? `${prediction.points} pts` : "-"}
                            </strong>
                          </span>
                        </div>
                        <button
                          className="h-11 rounded-md bg-[#007a3d] px-4 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:bg-[#a7aaa7]"
                          disabled={!open}
                          type="submit"
                        >
                          {predictionButtonContent({
                            match,
                            open,
                            hasPrediction: Boolean(prediction),
                          })}
                        </button>
                      </form>
                    </article>
                  );
                })}
              </div>
            )}

            <section className="pt-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-semibold">Historico de partidos</h2>
                <p className="text-sm text-[#5d615f]">
                  Resultados finales y tu prediccion en este grupo.
                </p>
              </div>

              {finishedMatches.length === 0 ? (
                <div className="glass-panel mt-4 rounded-lg p-6 text-[#151515]">
                  <h3 className="text-lg font-semibold">Todavia no hay partidos finalizados</h3>
                  <p className="mt-2 text-[#5d615f]">
                    Cuando la API marque partidos como finalizados, apareceran aqui con su
                    resultado.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {finishedMatches.map((match) => {
                    const prediction = match.predictions[0];
                    const homeTeamName = teamNameEsFromCode(match.homeTeamCode, match.homeTeam);
                    const awayTeamName = teamNameEsFromCode(match.awayTeamCode, match.awayTeam);

                    return (
                      <article
                        className="match-card min-w-0 rounded-lg p-4 text-[#151515]"
                        key={match.id}
                      >
                        <p className="text-sm font-medium text-[#5d615f]">
                          {formatMatchDate(match.utcDate)}
                        </p>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="flex min-w-0 flex-wrap items-center gap-2 text-lg font-semibold">
                            <FlagBall code={match.homeTeamCode} label={homeTeamName} small />
                            <span className="min-w-0 break-words">{homeTeamName}</span>
                            <span className="rounded-full bg-[#eaf1ff] px-2 py-1 text-xs font-bold text-[#007a3d]">
                              vs
                            </span>
                            <FlagBall code={match.awayTeamCode} label={awayTeamName} small />
                            <span className="min-w-0 break-words">{awayTeamName}</span>
                          </h3>
                          <p className="rounded-md bg-[#151515] px-3 py-2 text-center font-mono text-lg font-bold text-[#f2b705]">
                            {resultText(match)}
                          </p>
                        </div>
                        <p className="mt-3 min-w-0 rounded-md bg-[#fff4d6] px-3 py-2 text-sm text-[#5d615f]">
                          Tu prediccion:{" "}
                          <span className="font-semibold text-[#1d1b16]">
                            {predictionText(prediction)}
                          </span>
                        </p>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="glass-panel min-w-0 rounded-lg p-5 text-[#151515]">
            <h2 className="text-xl font-semibold">Tu marcador</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#5d615f]">Usuario</dt>
                <dd className="font-semibold">{user.nickname}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#5d615f]">Codigo grupo</dt>
                <dd className="font-mono font-semibold">{group.code}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#5d615f]">Puntos globales</dt>
                <dd className="font-semibold">{user.totalPoints}</dd>
              </div>
            </dl>
            <section className="mt-5 rounded-lg border border-[#e7dcc6] bg-white p-3">
              <h3 className="text-sm font-semibold text-[#151515]">Tus insignias</h3>
              <div className="mt-3">
                <BadgeList badges={currentUserBadges} compact limit={6} />
              </div>
            </section>
            <section className="mt-5 rounded-lg border border-[#e7dcc6] bg-[#fff4d6] p-3">
              <h3 className="text-sm font-semibold text-[#151515]">Sistema de puntuacion</h3>
              <div className="mt-3 grid gap-2">
                <div className="flex items-center gap-3 rounded-md bg-white p-3">
                  <span className="flex h-11 w-14 flex-none items-center justify-center rounded-md bg-[#151515] font-mono text-xl font-black text-[#f2b705]">
                    +10
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">Resultado exacto</p>
                    <p className="text-xs text-[#5d615f]">Marcador completo acertado.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-md bg-white p-3">
                  <span className="flex h-11 w-14 flex-none items-center justify-center rounded-md bg-[#007a3d] font-mono text-xl font-black text-white">
                    +5
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">Signo 1X2 correcto</p>
                    <p className="text-xs text-[#5d615f]">Victoria, derrota o empate acertado.</p>
                  </div>
                </div>
              </div>
            </section>
            <div className="mt-5 rounded-md border border-[#e7dcc6] bg-white p-3">
              <h3 className="text-sm font-semibold">Comparte este link</h3>
              <p className="mt-1 text-xs leading-5 text-[#5d615f]">
                Quien lo abra entrara directamente a este grupo y solo tendra que poner usuario y
                contrasena.
              </p>
              <input
                className="mt-3 w-full rounded-md border border-[#d6c7aa] bg-[#fffaf0] px-3 py-2 text-xs"
                readOnly
                value={inviteUrl}
              />
            </div>
            <div className="mt-5 rounded-md border border-[#e7dcc6] bg-white p-3">
              <h3 className="text-sm font-semibold">Tus grupos</h3>
              <div className="mt-3 grid gap-2">
                {user.memberships.map((membership) => (
                  <Link
                    className={`rounded-md px-3 py-2 text-sm font-semibold ${
                      membership.groupId === group.id
                        ? "bg-[#007a3d] text-white"
                        : "bg-[#fff4d6] text-[#151515]"
                    }`}
                    href={`/g/${membership.group.code}`}
                    key={membership.groupId}
                  >
                    {membership.group.name}
                  </Link>
                ))}
              </div>
              <Link className="mt-3 block text-sm font-semibold text-[#007a3d]" href="/grupo">
                Crear o unirme a otro grupo
              </Link>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
