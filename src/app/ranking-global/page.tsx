import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildRanking } from "@/lib/rankings";

export const dynamic = "force-dynamic";

export default async function GlobalRankingPage() {
  const users = await prisma.user.findMany({
    include: { predictions: true },
  });
  const ranking = buildRanking(users);

  return (
    <main className="pitch-bg pitch-lines min-h-screen px-5 py-8 text-[#102015]">
      <section className="relative z-10 mx-auto w-full max-w-4xl">
        <Link className="text-sm font-semibold text-[#147a45]" href="/">
          Volver
        </Link>
        <h1 className="mt-4 text-3xl font-semibold">Ranking global</h1>
        <div className="glass-panel mt-6 overflow-hidden rounded-lg text-[#102015]">
          {ranking.map((entry, index) => (
            <div
              className="grid grid-cols-[64px_1fr_96px] items-center border-b border-[#dfeadd] px-4 py-3 last:border-b-0"
              key={entry.id}
            >
              <span className="font-mono text-sm text-[#526154]">#{index + 1}</span>
              <span className="truncate font-semibold">{entry.nickname}</span>
              <span className="text-right font-bold text-[#147a45]">{entry.points} pts</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
