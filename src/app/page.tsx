import Link from "next/link";
import { redirect } from "next/navigation";
import { MatchStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { formatMatchDate, getTomorrowWindow, isPredictionOpen } from "@/lib/dates";
import { flagFromTeamCode } from "@/lib/flags";
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

  return (
    <span
      aria-label={`Bandera de ${label}`}
      className={`flag-ball ${small ? "flag-ball-sm" : ""}`}
      title={label}
    >
      {flag || "•"}
    </span>
  );
}

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (!user.groupId) redirect("/grupo");

  const tomorrow = getTomorrowWindow();
  const [groupUsers, tomorrowMatches, upcomingMatches, finishedMatches] = await Promise.all([
    prisma.user.findMany({
      where: { groupId: user.groupId },
      include: { predictions: { where: { groupId: user.groupId } } },
    }),
    prisma.match.findMany({
      where: {
        utcDate: { gte: tomorrow.start, lt: tomorrow.end },
      },
      include: {
        predictions: {
          where: {
            userId: user.id,
            groupId: user.groupId,
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
            groupId: user.groupId,
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
            groupId: user.groupId,
          },
        },
      },
      orderBy: { utcDate: "desc" },
      take: 24,
    }),
  ]);

  const matches = tomorrowMatches.length > 0 ? tomorrowMatches : upcomingMatches;
  const topThree = buildRanking(groupUsers).slice(0, 3);

  return (
    <main className="pitch-bg pitch-lines min-h-screen text-[#102015]">
      <section className="relative z-10 mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-8 px-4 py-6 sm:px-8">
        <header className="glass-panel rounded-xl p-5 md:flex md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147a45]">
              {user.group?.name}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-5xl">
              Predicciones del Mundial
            </h1>
          </div>
          <nav className="mt-4 flex flex-wrap gap-2 text-sm font-semibold md:mt-0">
            <Link className="rounded-md bg-[#facc15] px-4 py-2 text-[#102015]" href="/ranking">
              Ranking grupo
            </Link>
            <Link
              className="rounded-md border border-[#147a45] px-4 py-2 text-[#102015]"
              href="/ranking-global"
            >
              Ranking global
            </Link>
          </nav>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {topThree.map((entry, index) => (
            <article
              className="glass-panel rounded-lg p-5 text-[#102015]"
              key={entry.id}
            >
              <p className="text-sm font-semibold text-[#147a45]">Top {index + 1}</p>
              <h2 className="mt-2 truncate text-2xl font-semibold">{entry.nickname}</h2>
              <p className="mt-3 inline-flex rounded-md bg-[#102015] px-3 py-2 text-3xl font-bold text-[#facc15]">
                {entry.points} pts
              </p>
            </article>
          ))}
          {topThree.length === 0 ? (
            <article className="glass-panel rounded-lg p-5 text-[#102015] md:col-span-3">
              <h2 className="text-xl font-semibold">Todavia no hay puntuaciones</h2>
              <p className="mt-2 text-[#526154]">
                Cuando se puntuen los primeros partidos, aparecera aqui el top 3.
              </p>
            </article>
          ) : null}
        </section>

        <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold">
                {tomorrowMatches.length > 0 ? "Partidos de manana" : "Proximos partidos"}
              </h2>
              <p className="text-sm text-[#526154]">
                Puedes editar cada prediccion hasta el inicio del partido.
              </p>
            </div>

            {matches.length === 0 ? (
              <div className="glass-panel rounded-lg p-6 text-[#102015]">
                <h3 className="text-lg font-semibold">
                  {finishedMatches.length > 0
                    ? "No hay proximos partidos"
                    : "No hay partidos sincronizados"}
                </h3>
                {finishedMatches.length > 0 ? (
                  <p className="mt-2 text-[#526154]">
                    La sincronizacion actual solo tiene partidos finalizados. Puedes revisarlos en
                    el historico.
                  </p>
                ) : (
                  <p className="mt-2 text-[#526154]">
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

                  return (
                    <article
                      className="match-card min-w-0 rounded-lg p-4 text-[#102015]"
                      key={match.id}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#526154]">
                            {formatMatchDate(match.utcDate)}
                          </p>
                          <h3 className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-xl font-semibold">
                            <FlagBall code={match.homeTeamCode} label={match.homeTeam} small />
                            <span className="min-w-0 break-words">{match.homeTeam}</span>
                            <span className="rounded-full bg-[#e7efe3] px-2 py-1 text-xs font-bold text-[#147a45]">
                              vs
                            </span>
                            <FlagBall code={match.awayTeamCode} label={match.awayTeam} small />
                            <span className="min-w-0 break-words">{match.awayTeam}</span>
                          </h3>
                          <p className="mt-2 text-sm font-semibold text-[#147a45]">
                            {resultText(match)}
                          </p>
                        </div>

                        <form
                          action="/api/predictions"
                          className="grid w-full min-w-0 grid-cols-2 gap-3 md:w-auto md:grid-cols-[auto_auto_auto] md:items-end"
                          method="post"
                        >
                          <input name="matchId" type="hidden" value={match.id} />
                          <label className="grid gap-1 text-xs font-semibold uppercase text-[#526154]">
                            <span>Local</span>
                            <span className="flex min-w-0 items-center gap-2">
                              <FlagBall code={match.homeTeamCode} label={match.homeTeam} />
                              <input
                                className="h-11 w-16 rounded-md border border-[#bad0b6] bg-white px-3 text-center text-base font-bold"
                                defaultValue={prediction?.predictedHome ?? ""}
                                disabled={!open}
                                min={0}
                                name="predictedHome"
                                required
                                type="number"
                              />
                            </span>
                          </label>
                          <label className="grid gap-1 text-xs font-semibold uppercase text-[#526154]">
                            <span>Visit.</span>
                            <span className="flex min-w-0 items-center gap-2">
                              <FlagBall code={match.awayTeamCode} label={match.awayTeam} />
                              <input
                                className="h-11 w-16 rounded-md border border-[#bad0b6] bg-white px-3 text-center text-base font-bold"
                                defaultValue={prediction?.predictedAway ?? ""}
                                disabled={!open}
                                min={0}
                                name="predictedAway"
                                required
                                type="number"
                              />
                            </span>
                          </label>
                          <button
                            className="col-span-2 h-11 rounded-md bg-[#147a45] px-4 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:bg-[#9aaa92] md:col-span-1"
                            disabled={!open}
                            type="submit"
                          >
                            {prediction ? "Actualizar" : "Guardar"}
                          </button>
                        </form>
                      </div>
                      <p className="mt-3 min-w-0 rounded-md bg-[#edf5e9] px-3 py-2 text-sm text-[#526154]">
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

            <section className="pt-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-semibold">Historico de partidos</h2>
                <p className="text-sm text-[#526154]">
                  Resultados finales y tu prediccion en este grupo.
                </p>
              </div>

              {finishedMatches.length === 0 ? (
                <div className="glass-panel mt-4 rounded-lg p-6 text-[#102015]">
                  <h3 className="text-lg font-semibold">Todavia no hay partidos finalizados</h3>
                  <p className="mt-2 text-[#526154]">
                    Cuando la API marque partidos como finalizados, apareceran aqui con su
                    resultado.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {finishedMatches.map((match) => {
                    const prediction = match.predictions[0];

                    return (
                      <article
                        className="match-card min-w-0 rounded-lg p-4 text-[#102015]"
                        key={match.id}
                      >
                        <p className="text-sm font-medium text-[#526154]">
                          {formatMatchDate(match.utcDate)}
                        </p>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="flex min-w-0 flex-wrap items-center gap-2 text-lg font-semibold">
                            <FlagBall code={match.homeTeamCode} label={match.homeTeam} small />
                            <span className="min-w-0 break-words">{match.homeTeam}</span>
                            <span className="rounded-full bg-[#e7efe3] px-2 py-1 text-xs font-bold text-[#147a45]">
                              vs
                            </span>
                            <FlagBall code={match.awayTeamCode} label={match.awayTeam} small />
                            <span className="min-w-0 break-words">{match.awayTeam}</span>
                          </h3>
                          <p className="rounded-md bg-[#102015] px-3 py-2 text-center font-mono text-lg font-bold text-[#facc15]">
                            {resultText(match)}
                          </p>
                        </div>
                        <p className="mt-3 min-w-0 rounded-md bg-[#edf5e9] px-3 py-2 text-sm text-[#526154]">
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

          <aside className="glass-panel min-w-0 rounded-lg p-5 text-[#102015]">
            <h2 className="text-xl font-semibold">Tu marcador</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#526154]">Usuario</dt>
                <dd className="font-semibold">{user.nickname}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#526154]">Codigo grupo</dt>
                <dd className="font-mono font-semibold">{user.group?.code}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#526154]">Puntos globales</dt>
                <dd className="font-semibold">{user.totalPoints}</dd>
              </div>
            </dl>
            <p className="mt-5 rounded-md bg-[#edf5e9] p-3 text-sm text-[#526154]">
              Resultado exacto: 10 puntos. Signo 1X2 correcto, empate incluido: 5 puntos.
            </p>
          </aside>
        </section>
      </section>
    </main>
  );
}
