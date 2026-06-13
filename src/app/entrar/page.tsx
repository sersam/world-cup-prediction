import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser, normalizeGroupCode } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  config:
    "Falta configurar DATABASE_URL. Crea el archivo .env, ejecuta la migracion y vuelve a intentarlo.",
  datos: "Revisa el usuario y la contrasena. La contrasena debe tener al menos 4 caracteres.",
  password: "La contrasena no coincide con ese usuario.",
  pin: "La contrasena no coincide con ese usuario.",
  "already-member": "Ese usuario ya pertenece a este grupo.",
};

export default async function EnterPage({
  searchParams,
}: {
  searchParams?: Promise<{ code?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  if (user && !params?.code) redirect("/");

  const code = params?.code ? normalizeGroupCode(params.code) : null;
  const group = code ? await prisma.group.findUnique({ where: { code } }) : null;
  if (code && !group) redirect("/grupo?error=no-existe");
  if (user && group) {
    await prisma.groupMember.upsert({
      where: { userId_groupId: { userId: user.id, groupId: group.id } },
      create: { userId: user.id, groupId: group.id },
      update: {},
    });
    redirect(`/g/${group.code}`);
  }

  const error = params?.error ? errorMessages[params.error] : null;

  return (
    <main className="pitch-bg pitch-lines grid min-h-screen place-items-center px-5 py-10 text-[#151515]">
      <section className="glass-panel relative z-10 w-full max-w-md rounded-lg p-6 text-[#151515]">
        <div className="brand-lockup">
          <span className="brand-logo" aria-hidden="true">
            <Image alt="" height={650} priority src="/brand/world-cup-2026.webp" width={866} />
          </span>
          <div className="min-w-0">
            <p className="brand-kicker text-sm font-semibold">Mundial 2026</p>
            <h1 className="brand-heading mt-2 text-3xl">
              {group ? `Entra en ${group.name}` : "Entra o crea tu usuario"}
            </h1>
          </div>
        </div>
        <div className="brand-rule mt-5" />
        <p className="mt-3 text-sm leading-6 text-[#5d615f]">
          El usuario es el nombre que aparecera en los rankings. La contrasena protege tus
          predicciones para que nadie pueda entrar con tu usuario y cambiarlas.
        </p>
        {error ? (
          <p className="mt-4 rounded-md border border-[#fca5a5] bg-[#fff3f1] p-3 text-sm text-[#9f1239]">
            {error}
          </p>
        ) : null}
        <form action="/api/auth/enter" className="mt-6 grid gap-4" method="post">
          {group ? <input name="code" type="hidden" value={group.code} /> : null}
          <label className="grid gap-2 text-sm font-semibold">
            Usuario
            <input
              className="h-12 rounded-md border border-[#d6c7aa] bg-white px-3 text-base"
              maxLength={40}
              minLength={2}
              name="nickname"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Contrasena
            <input
              className="h-12 rounded-md border border-[#d6c7aa] bg-white px-3 text-base"
              maxLength={64}
              minLength={4}
              name="password"
              required
              type="password"
            />
          </label>
          <button className="h-12 rounded-md bg-[#007a3d] font-semibold text-white shadow-md" type="submit">
            Continuar
          </button>
        </form>
      </section>
    </main>
  );
}
