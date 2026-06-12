import { NextResponse } from "next/server";
import { syncWorldCupMatches } from "@/lib/sync";

async function runSync() {
  const result = await syncWorldCupMatches();
  return NextResponse.json(result);
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runSync();
}

export async function POST(request: Request) {
  const syncSecret = process.env.SYNC_SECRET;
  if (syncSecret && request.headers.get("x-sync-secret") !== syncSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runSync();
}
