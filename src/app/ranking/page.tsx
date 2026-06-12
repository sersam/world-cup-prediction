import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function GroupRankingRedirectPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  const firstGroup = user.memberships[0]?.group;
  if (!firstGroup) redirect("/grupo");

  redirect(`/g/${firstGroup.code}/ranking`);
}
