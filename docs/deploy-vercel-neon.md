# Despliegue en Vercel + Neon

Esta app necesita un runtime Next.js y una base Postgres compartida. Para varios
usuarios, no uses la base local de Homebrew: usa Neon, Supabase, Railway, Render
u otro Postgres gestionado.

## 1. Preparar GitHub

1. Crea un repositorio en GitHub.
2. Sube este proyecto.
3. Asegurate de que `.env` no se sube. El repo solo debe incluir `.env.example`.

## 2. Crear Postgres en Neon

1. Crea un proyecto en Neon.
2. Copia la connection string pooled si Neon la ofrece.
3. Usa SSL requerido si aparece en la URL.

Ejemplo:

```bash
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
```

## 3. Crear proyecto en Vercel

1. Importa el repo desde GitHub.
2. Framework: Next.js.
3. Build command: `npm run build`.
4. Install command: `npm install`.

## 4. Variables de entorno en Vercel

Configura estas variables para Production, Preview y Development si quieres usar
los tres entornos:

```bash
DATABASE_URL="postgresql://..."
FOOTBALL_DATA_API_TOKEN="..."
SESSION_SECRET="genera-un-secreto-largo"
SYNC_SECRET="genera-otro-secreto-largo"
APP_TIMEZONE="Europe/Madrid"
```

Genera secretos con:

```bash
openssl rand -base64 32
```

Importante: rota el token de `football-data.org` si ya se compartio fuera del
dashboard de secretos.

## 5. Migrar base de datos

Tras el primer deploy, ejecuta migraciones contra la base cloud:

```bash
npx prisma migrate deploy
```

Puedes hacerlo desde Vercel CLI con las variables del proyecto cargadas, o desde
tu terminal exportando `DATABASE_URL` de Neon temporalmente.

## 6. Sincronizar partidos reales

Cuando el deploy este activo, llama al endpoint de sync:

```bash
curl -X POST https://TU-DOMINIO.vercel.app/api/sync \
  -H "x-sync-secret: TU_SYNC_SECRET"
```

Esto cargara o actualizara partidos desde `football-data.org`.

## 7. Checklist de produccion

- `.env` no esta en Git.
- `SESSION_SECRET` y `SYNC_SECRET` son largos y distintos.
- `DATABASE_URL` apunta a Postgres cloud, no a localhost.
- `npx prisma migrate deploy` se ejecuto correctamente.
- `/api/sync` devuelve `{ "synced": ... }`.
- La pantalla principal permite crear usuario, grupo y predicciones.
