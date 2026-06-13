import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { BadgeList } from "@/app/_components/badges";
import { getCurrentUser } from "@/lib/auth";
import { buildGroupBadges } from "@/lib/badges";
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
  });
  const ranking = buildRanking(users);
  const groupBadges = buildGroupBadges(users, {
    ranking,
  });

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
                Ranking
              </h1>
              <div className="brand-rule mt-3" />
            </div>
          </div>
          <nav className="mt-5 flex flex-wrap gap-2 text-sm font-semibold md:mt-0">
            <Link className="brand-button-gold rounded-md px-4 py-2" href={`/g/${group.code}`}>
              &lt; Volver
            </Link>
          </nav>
        </header>
        <div className="ranking-list glass-panel mt-6 overflow-visible rounded-lg text-[#151515]">
          {ranking.map((entry, index) => (
            <div
              className="grid grid-cols-[64px_minmax(0,1fr)_96px] items-center border-b border-[#e7dcc6] px-4 py-3 last:border-b-0"
              key={entry.id}
            >
              <span className="font-mono text-sm text-[#5d615f]">
                {rankingMedals[index] ?? `#${index + 1}`}
              </span>
              <span className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="truncate font-semibold">{entry.nickname}</span>
                {(groupBadges.get(entry.id)?.length ?? 0) > 0 ? (
                  <BadgeList badges={groupBadges.get(entry.id)!} compact limit={4} />
                ) : null}
              </span>
              <span className="text-right font-bold text-[#007a3d]">{entry.points} pts</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
