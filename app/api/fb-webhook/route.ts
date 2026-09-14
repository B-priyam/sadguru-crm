// app/api/fb-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub_mode");
  const token = req.nextUrl.searchParams.get("hub_verify_token");
  const challenge = req.nextUrl.searchParams.get("hub_challenge");

  console.log("HELLLO", req.nextUrl.searchParams);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge);
  }
  return NextResponse.json({ error: "Invalid" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field === "leadgen") {
        const { leadgen_id } = change.value;
        await processLead(leadgen_id);
      }
    }
  }

  return NextResponse.json({ success: true });
}

async function processLead(leadgenId: string) {
  console.log("test", leadgenId);
  const res = await fetch(
    `https://graph.facebook.com/v25.0/${leadgenId}?access_token=${process.env.FB_PAGE_ACCESS_TOKEN}`,
  );
  //   const res = await fetch(
  //     `https://graph.facebook.com/v25.0/${leadgenId}?access_token=${process.env.FB_PAGE_TOKEN}`,
  //   );
  const lead = await res.json();

  // lead.field_data → array of { name, values[] }
  // Store in DB, push to frontend, etc.
  console.log("New lead:", lead);
}
