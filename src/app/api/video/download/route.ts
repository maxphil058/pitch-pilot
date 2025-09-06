// src/app/api/video/download/route.ts
import { NextRequest } from "next/server";
import fs from "node:fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const path = "/tmp/generated.mp4";
  if (!fs.existsSync(path)) {
    return new Response(JSON.stringify({ ok: false, error: "generated video not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }
  const stream = fs.createReadStream(path);
  return new Response(stream as any, {
    headers: {
      "content-type": "video/mp4",
      "cache-control": "no-store",
    },
  });
}
