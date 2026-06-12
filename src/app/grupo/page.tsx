import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  datos: "Revisa los datos del grupo y del usuario.",
  codigo: "Ese codigo de grupo ya existe. Prueba con otro.",
  "no-existe": "No existe ningun grupo con ese codigo.",
  password: "La contrasena no coincide con ese usuario.",
};

export default async function GroupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  const params = await searchParams;
  const error = params?.error ? errorMessages[params.error] : null;

  return (
    <main className="pitch-bg pitch-lines min-h-screen px-5 py-10 text-[#102015]">
      <section className="relative z-10 mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147a45]">
            Mundial
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Elige tu grupo</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#526154]">
            Hola, {user.nickname}. Puedes crear un grupo nuevo, unirte con codigo o moverte entre
            los grupos en los que ya estas.
          </p>
          {error ? (
            <p className="mt-4 rounded-md border border-[#fca5a5] bg-[#fff3f1] p-3 text-sm text-[#9f1239]">
              {error}
            </p>
          ) : null}
        </div>

        {user.memberships.length > 0 ? (
          <article className="glass-panel rounded-lg p-6 text-[#102015] md:col-span-2">
            <h2 className="text-2xl font-semibold">Tus grupos</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {user.memberships.map((membership) => (
                <Link
                  className="rounded-lg border border-[#dfeadd] bg-white p-4 font-semibold text-[#102015] shadow-sm"
                  href={`/g/${membership.group.code}`}
                  key={membership.groupId}
                >
                  <span className="block truncate">{membership.group.name}</span>
                  <span className="mt-2 block font-mono text-sm text-[#147a45]">
                    {membership.group.code}
                  </span>
                </Link>
              ))}
            </div>
          </article>
        ) : null}

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
