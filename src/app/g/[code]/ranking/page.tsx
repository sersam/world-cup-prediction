import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildRanking } from "@/lib/rankings";

export const dynamic = "force-dynamic";

const rankingMedals = ["🥇", "🥈", "🥉"] as const;

export default async function GroupRankingPage({
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

  const users = await prisma.user.findMany({
    where: {
      memberships: {
        some: { groupId: group.id },
      },
    },
    include: { predictions: { where: { groupId: group.id } } },
  });
  const ranking = buildRanking(users);

  return (
    <main className="pitch-bg pitch-lines min-h-screen px-5 py-8 text-[#151515]">
      <section className="relative z-10 mx-auto w-full max-w-4xl">
        <Link className="brand-link text-sm font-semibold" href={`/g/${group.code}`}>
          Volver
        </Link>
        <div className="brand-lockup mt-4">
          <span className="brand-logo" aria-hidden="true">
            <Image alt="" height={650} priority src="/brand/world-cup-2026.webp" width={866} />
          </span>
          <div className="min-w-0">
            <p className="brand-kicker text-sm font-semibold">Mundial 2026</p>
            <h1 className="brand-heading mt-2 text-3xl">Ranking de {group.name}</h1>
          </div>
        </div>
        <div className="brand-rule mt-5" />
        <div className="glass-panel mt-6 overflow-hidden rounded-lg text-[#151515]">
          {ranking.map((entry, index) => (
            <div
              className="grid grid-cols-[64px_1fr_96px] items-center border-b border-[#e7dcc6] px-4 py-3 last:border-b-0"
              key={entry.id}
            >
              <span className="font-mono text-sm text-[#5d615f]">
                {rankingMedals[index] ?? `#${index + 1}`}
              </span>
              <span className="truncate font-semibold">{entry.nickname}</span>
              <span className="text-right font-bold text-[#007a3d]">{entry.points} pts</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
