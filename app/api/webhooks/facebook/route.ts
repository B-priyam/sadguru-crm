// app/api/webhooks/facebook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ----------------------------------------------------------------------
// Environment Variables Required (.env.local or Vercel Environment)
// ----------------------------------------------------------------------
const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
const APP_SECRET = process.env.FB_APP_SECRET;
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

// ======================================================================
// 1. GET ROUTE: Handshake Verification
// Called automatically when you click "Verify & Save" in Meta Dashboard
// ======================================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    console.log("🔍 Meta GET Verification Request Received:", { mode, token });

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook Handshake Successful!");
      return new NextResponse(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    console.error("❌ Verification failed. Token mismatch.");
    return NextResponse.json({ error: "Verification failed" }, { status: 403 });
  } catch (err: any) {
    console.error("❌ GET Webhook Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ======================================================================
// 2. POST ROUTE: Receive Real-Time Lead Events
// Called by Meta whenever a lead form is submitted
// ======================================================================
export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Incoming Meta POST Event Received");

    const rawBody = await req.text();
    const signatureHeader = req.headers.get("x-hub-signature-256");

    // 1. Security check: Verify HMAC signature
    if (!verifyMetaSignature(rawBody, signatureHeader)) {
      console.error("❌ Invalid HMAC SHA-256 Signature");
      return NextResponse.json(
        { error: "Invalid HMAC signature" },
        { status: 401 },
      );
    }

    const data = JSON.parse(rawBody);

    // 2. Parse leadgen event
    if (data.object === "page") {
      for (const entry of data.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === "leadgen") {
            const leadgenId = change.value?.leadgen_id;
            const formId = change.value?.form_id;

            console.log(
              `📩 Processing Leadgen ID: ${leadgenId} (Form ID: ${formId})`,
            );

            // Execute processing asynchronously without await
            // Ensures Meta gets HTTP 200 immediately to prevent time-out/Pending status
            processLeadAsync(leadgenId, formId).catch((err) =>
              console.error("❌ Async Lead Processing Error:", err),
            );
          }
        }
      }
    }

    // Always respond with HTTP 200 immediately to Meta
    return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (err: any) {
    console.error("❌ POST Webhook Error:", err);
    // Return 200 to prevent Meta from retrying broken webhook requests continuously
    return NextResponse.json({ status: "ERROR_HANDLED" }, { status: 200 });
  }
}

// ----------------------------------------------------------------------
// HELPER 1: Safe HMAC Signature Verification
// Prevents Buffer length mismatch crashes in Node.js
// ----------------------------------------------------------------------
function verifyMetaSignature(
  payload: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader || !APP_SECRET) {
    console.warn(
      "⚠️ Missing signature header or APP_SECRET environment variable",
    );
    return false;
  }

  const parts = signatureHeader.split("=");
  const signatureHash = parts[1];

  if (!signatureHash) return false;

  const expectedHash = crypto
    .createHmac("sha256", APP_SECRET)
    .update(payload)
    .digest("hex");

  const bufSignature = Buffer.from(signatureHash, "utf8");
  const bufExpected = Buffer.from(expectedHash, "utf8");

  // Prevent timingSafeEqual buffer length mismatch crash
  if (bufSignature.length !== bufExpected.length) {
    console.error("❌ Signature Buffer length mismatch!");
    return false;
  }

  return crypto.timingSafeEqual(bufSignature, bufExpected);
}

// ----------------------------------------------------------------------
// HELPER 2: Fetch Lead from Meta Graph API v25.0 & Save to DB
// ----------------------------------------------------------------------
async function processLeadAsync(leadgenId: string, formId: string) {
  if (!PAGE_ACCESS_TOKEN) {
    console.error(
      "❌ FB_PAGE_ACCESS_TOKEN is missing in environment variables!",
    );
    return;
  }

  // Request full lead fields from Graph API
  const url = `https://graph.facebook.com/v25.0/${leadgenId}?access_token=${PAGE_ACCESS_TOKEN}`;

  const res = await fetch(url);
  const leadData = await res.json();

  if (leadData.error) {
    console.error("❌ Graph API Error Response:", leadData.error);
    return;
  }

  // Parse questions & answers from field_data array
  const parsedFields: Record<string, string> = {
    metaLeadId: leadgenId,
    formId: formId,
    createdTime: leadData.created_time,
  };

  if (Array.isArray(leadData.field_data)) {
    leadData.field_data.forEach((field: { name: string; values: string[] }) => {
      parsedFields[field.name] = field.values[0] ?? "";
    });
  }

  // Format record payload for your CRM
  const crmLeadPayload = {
    name:
      parsedFields["full_name"] ||
      `${parsedFields["first_name"] || ""} ${parsedFields["last_name"] || ""}`.trim(),
    email: parsedFields["email"] || null,
    phone: parsedFields["phone_number"] || null,
    source: "Facebook Lead Ads",
    rawFields: parsedFields,
  };

  // Persist to database
  await insertIntoCRMDatabase(crmLeadPayload);
}

async function insertIntoCRMDatabase(leadPayload: Record<string, any>) {
  // TODO: Replace this log with your database insert statement
  // e.g., await db.lead.create({ data: leadPayload });
  console.log(
    "🎉 SUCCESS! Ingested New Lead into CRM:",
    JSON.stringify(leadPayload, null, 2),
  );
}
