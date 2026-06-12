import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function GroupPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (user.groupId) redirect("/");

  return (
    <main className="pitch-bg pitch-lines min-h-screen px-5 py-10 text-[#102015]">
      <section className="relative z-10 mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147a45]">
            Hola, {user.nickname}
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Elige tu grupo</h1>
        </div>

        <article className="glass-panel rounded-lg p-6 text-[#102015]">
          <h2 className="text-2xl font-semibold">Crear grupo</h2>
          <form action="/api/groups" className="mt-5 grid gap-4" method="post">
            <label className="grid gap-2 text-sm font-semibold">
              Nombre
              <input
                className="h-12 rounded-md border border-[#bad0b6] bg-white px-3 text-base"
                maxLength={60}
                minLength={2}
                name="name"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Codigo
              <input
                className="h-12 rounded-md border border-[#bad0b6] bg-white px-3 font-mono text-base uppercase"
                maxLength={24}
                minLength={3}
                name="code"
                required
              />
            </label>
            <button className="h-12 rounded-md bg-[#147a45] font-semibold text-white shadow-md" type="submit">
              Crear y entrar
            </button>
          </form>
        </article>

        <article className="glass-panel rounded-lg p-6 text-[#102015]">
          <h2 className="text-2xl font-semibold">Unirse con codigo</h2>
          <form action="/api/groups/join" className="mt-5 grid gap-4" method="post">
            <label className="grid gap-2 text-sm font-semibold">
              Codigo del grupo
              <input
                className="h-12 rounded-md border border-[#bad0b6] bg-white px-3 font-mono text-base uppercase"
                maxLength={24}
                minLength={3}
                name="code"
                required
              />
            </label>
            <button className="h-12 rounded-md bg-[#102015] font-semibold text-white shadow-md" type="submit">
              Unirme
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}
