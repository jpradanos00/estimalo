import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FEEDBACK_EMAIL = Deno.env.get("FEEDBACK_EMAIL");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, apikey, Content-Type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const { type, description, email } = await req.json();

  if (!description || !type) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  if (!RESEND_API_KEY || !FEEDBACK_EMAIL) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const typeLabel = type === "bug" ? "Bug Report" : "Feature Request";
  const subject = `[estímalo] ${typeLabel}`;

  const html = `
    <h2>${typeLabel}</h2>
    <p><strong>Description:</strong></p>
    <p>${description.replace(/\n/g, "<br>")}</p>
    ${email ? `<p><strong>Contact:</strong> ${email}</p>` : ""}
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "estímalo <feedback@estimalo.pages.dev>",
        to: FEEDBACK_EMAIL,
        subject,
        html,
        reply_to: email || undefined,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(errBody);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
