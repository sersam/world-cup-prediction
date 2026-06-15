# Predicción Mundial

App web full-stack para predicciones del Mundial por grupos. El usuario se registra
con usuario + contrasena, puede crear o unirse a varios grupos, moverse entre ellos,
predecir resultados y competir en el ranking de cada grupo.

## Stack

- Next.js App Router + TypeScript
- Prisma + Postgres
- football-data.org para calendario/resultados
- Vitest para reglas de dominio

## Configuracion

1. Instala dependencias:

```bash
npm install
```

2. Crea `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

3. Configura como minimo:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/prediccion_mundial"
FOOTBALL_DATA_API_TOKEN="tu-token"
SESSION_SECRET="un-secreto-largo"
APP_TIMEZONE="Europe/Madrid"
```

4. Genera cliente Prisma y crea tablas:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

5. Arranca desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Sincronizar partidos

Con `FOOTBALL_DATA_API_TOKEN` configurado:

```bash
curl -X POST http://localhost:3000/api/sync
```

Si defines `SYNC_SECRET`, envia tambien:

```bash
curl -X POST http://localhost:3000/api/sync -H "x-sync-secret: tu-secreto"
```

Para probar la app sin token externo, carga partidos de demo:

```bash
npm run db:seed
```

## Verificacion

```bash
npm run lint
npm test
npm run build
```

## Despliegue

Para usar la app con varios usuarios, despliega Next.js en Vercel o Netlify y usa
un Postgres gestionado. Guia recomendada:

[docs/deploy-vercel-neon.md](docs/deploy-vercel-neon.md)
