export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  datos: "Revisa los datos del grupo y del usuario.",
  codigo: "Ese codigo de grupo ya existe. Prueba con otro.",
  "no-existe": "No existe ningun grupo con ese codigo.",
  password: "La contrasena no coincide con ese usuario.",
  "already-in-group": "Ese usuario ya pertenece a otro grupo.",
};

export default async function GroupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
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
            Primero crea un grupo o introduce un codigo de invitacion. Despues entraras con tu
            usuario y contrasena dentro de ese grupo.
          </p>
          {error ? (
            <p className="mt-4 rounded-md border border-[#fca5a5] bg-[#fff3f1] p-3 text-sm text-[#9f1239]">
              {error}
            </p>
          ) : null}
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
            <div className="grid gap-4 border-t border-[#dfeadd] pt-4">
              <label className="grid gap-2 text-sm font-semibold">
                Tu usuario
                <input
                  className="h-12 rounded-md border border-[#bad0b6] bg-white px-3 text-base"
                  maxLength={40}
                  minLength={2}
                  name="nickname"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Tu contrasena
                <input
                  className="h-12 rounded-md border border-[#bad0b6] bg-white px-3 text-base"
                  maxLength={64}
                  minLength={4}
                  name="password"
                  required
                  type="password"
                />
              </label>
            </div>
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
