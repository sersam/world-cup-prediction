import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  config:
    "Falta configurar DATABASE_URL. Crea el archivo .env, ejecuta la migracion y vuelve a intentarlo.",
  datos: "Revisa el usuario y la contrasena. La contrasena debe tener al menos 4 caracteres.",
  password: "La contrasena no coincide con ese usuario.",
  pin: "La contrasena no coincide con ese usuario.",
};

export default async function EnterPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.groupId) redirect("/");
  if (user && !user.groupId) redirect("/grupo");
  const params = await searchParams;
  const error = params?.error ? errorMessages[params.error] : null;

  return (
    <main className="pitch-bg pitch-lines grid min-h-screen place-items-center px-5 py-10 text-[#102015]">
      <section className="glass-panel relative z-10 w-full max-w-md rounded-lg p-6 text-[#102015]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147a45]">
          Mundial
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Entra o crea tu usuario</h1>
        <p className="mt-3 text-sm leading-6 text-[#526154]">
          El usuario es el nombre que aparecera en los rankings. La contrasena protege tus
          predicciones para que nadie pueda entrar con tu usuario y cambiarlas.
        </p>
        {error ? (
          <p className="mt-4 rounded-md border border-[#fca5a5] bg-[#fff3f1] p-3 text-sm text-[#9f1239]">
            {error}
          </p>
        ) : null}
        <form action="/api/auth/enter" className="mt-6 grid gap-4" method="post">
          <label className="grid gap-2 text-sm font-semibold">
            Usuario
            <input
              className="h-12 rounded-md border border-[#bad0b6] bg-white px-3 text-base"
              maxLength={40}
              minLength={2}
              name="nickname"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Contrasena
            <input
              className="h-12 rounded-md border border-[#bad0b6] bg-white px-3 text-base"
              maxLength={64}
              minLength={4}
              name="password"
              required
              type="password"
            />
          </label>
          <button className="h-12 rounded-md bg-[#147a45] font-semibold text-white shadow-md" type="submit">
            Continuar
          </button>
        </form>
      </section>
    </main>
  );
}
