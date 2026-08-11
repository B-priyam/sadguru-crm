// app/api/webhooks/facebook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ----------------------------------------------------------------------
// Environment Variables Required (.env.local)
// ----------------------------------------------------------------------
const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
const APP_SECRET = process.env.FB_APP_SECRET;
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

// ======================================================================
// 1. GET ROUTE: Handshake Verification
// Called automatically by Meta when you click "Verify & Save" in Developer Dashboard
// ======================================================================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Verify that hub.mode is 'subscribe' and token matches your environment variable
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    // Return ONLY the challenge plain text string with HTTP 200
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Verification failed
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// ======================================================================
// 2. POST ROUTE: Event Receiver & Lead Processing
// Called by Meta every time a user fills out your Lead Ad Form
// ======================================================================
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signatureHeader = req.headers.get("x-hub-signature-256");

  // Security Check: Verify request signature to make sure it came from Meta
  if (!verifyMetaSignature(rawBody, signatureHeader)) {
    return NextResponse.json(
      { error: "Invalid HMAC signature" },
      { status: 401 },
    );
  }

  const data = JSON.parse(rawBody);

  // Check if this payload is a page event
  if (data.object === "page") {
    for (const entry of data.entry) {
      for (const change of entry.changes) {
        // Confirm event is a new lead generation
        if (change.field === "leadgen") {
          const leadgenId = change.value.leadgen_id;
          const formId = change.value.form_id;

          // Process asynchronously so we can return HTTP 200 to Meta immediately
          // (Meta drops/retries webhooks if your endpoint takes longer than 5 seconds)
          fetchAndSaveLead(leadgenId, formId).catch((err) =>
            console.error("Error fetching lead details:", err),
          );
        }
      }
    }
  }

  // Always return HTTP 200 to Meta right away
  return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
}

// ----------------------------------------------------------------------
// HELPER 1: Verify HMAC SHA-256 Signature
// ----------------------------------------------------------------------
function verifyMetaSignature(
  payload: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader || !APP_SECRET) return false;

  const parts = signatureHeader.split("=");
  const signatureHash = parts[1];

  const expectedHash = crypto
    .createHmac("sha256", APP_SECRET)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signatureHash, "utf8"),
    Buffer.from(expectedHash, "utf8"),
  );
}

// ----------------------------------------------------------------------
// HELPER 2: Fetch Actual Lead Answers & Save to CRM DB
// ----------------------------------------------------------------------
async function fetchAndSaveLead(leadgenId: string, formId: string) {
  // 1. Meta Webhooks DO NOT send personal user data inside the payload.
  //    They only send `leadgen_id`. We must request full answers via Graph API.
  const graphApiUrl = `https://graph.facebook.com/v25.0/${leadgenId}?access_token=${PAGE_ACCESS_TOKEN}`;

  const res = await fetch(graphApiUrl);
  const leadData = await res.json();

  if (leadData.error) {
    throw new Error(`Graph API error: ${JSON.stringify(leadData.error)}`);
  }

  // 2. Extract and format questions/answers from field_data array
  const formattedFields: Record<string, string> = {
    metaLeadId: leadgenId,
    formId: formId,
    createdTime: leadData.created_time,
  };

  if (Array.isArray(leadData.field_data)) {
    leadData.field_data.forEach((field: { name: string; values: string[] }) => {
      formattedFields[field.name] = field.values[0] ?? "";
    });
  }

  // 3. Map values to your CRM model structure
  const crmLeadPayload = {
    name:
      formattedFields["full_name"] ||
      `${formattedFields["first_name"] || ""} ${formattedFields["last_name"] || ""}`.trim(),
    email: formattedFields["email"] || null,
    phone: formattedFields["phone_number"] || null,
    source: "Facebook Lead Ads",
    rawResponses: formattedFields,
  };

  // 4. Save into Database (Replace console.log with Prisma/Supabase/Postgres call)
  await insertIntoDatabase(crmLeadPayload);
}

async function insertIntoDatabase(leadPayload: Record<string, any>) {
  // TODO: Add your DB query here
  // e.g., await db.lead.create({ data: leadPayload });
  console.log("✅ New Lead Saved to CRM:", leadPayload);
}
