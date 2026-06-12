import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildRanking } from "@/lib/rankings";

export const dynamic = "force-dynamic";

export default async function GroupRankingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (!user.groupId) redirect("/grupo");

  const users = await prisma.user.findMany({
    where: { groupId: user.groupId },
    include: { predictions: { where: { groupId: user.groupId } } },
  });
  const ranking = buildRanking(users);

  return (
    <main className="pitch-bg pitch-lines min-h-screen px-5 py-8 text-[#102015]">
      <section className="relative z-10 mx-auto w-full max-w-4xl">
        <Link className="text-sm font-semibold text-[#147a45]" href="/">
          Volver
        </Link>
        <h1 className="mt-4 text-3xl font-semibold">Ranking del grupo</h1>
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
