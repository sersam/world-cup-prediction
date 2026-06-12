import { NextResponse } from "next/server";
import { smartSyncWorldCupMatches, syncWorldCupMatches } from "@/lib/sync";

async function runSync(mode: "full" | "smart") {
  const result =
    mode === "smart" ? await smartSyncWorldCupMatches() : await syncWorldCupMatches();
  return NextResponse.json(result);
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get("authorization")?.trim();

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runSync("smart");
}

export async function POST(request: Request) {
  const syncSecret = process.env.SYNC_SECRET?.trim();
  if (syncSecret && request.headers.get("x-sync-secret") !== syncSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runSync("full");
}
