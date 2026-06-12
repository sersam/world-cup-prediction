import { NextResponse } from "next/server";
import { syncWorldCupMatches } from "@/lib/sync";

export async function POST(request: Request) {
  const syncSecret = process.env.SYNC_SECRET;
  if (syncSecret && request.headers.get("x-sync-secret") !== syncSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncWorldCupMatches();
  return NextResponse.json(result);
}
