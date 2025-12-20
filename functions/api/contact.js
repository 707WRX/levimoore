export async function onRequestPost(context) {
  try {
    const req = context.request;
    const body = await req.json().catch(() => ({}));

    const name = (body.name || "").toString().trim();
    const email = (body.email || "").toString().trim();
    const phone = (body.phone || "").toString().trim();
    const intent = (body.intent || "").toString().trim();
    const message = (body.message || "").toString().trim();
    const source = (body.source || "").toString().trim();

    if (!name || !email || !message) {
      return json({ error: "Missing required fields." }, 400);
    }

    // basic anti-abuse (optional)
    if (message.length > 4000) {
      return json({ error: "Message too long." }, 400);
    }

    const RESEND_API_KEY = context.env.RESEND_API_KEY;
    const TO_EMAIL = context.env.TO_EMAIL || "Levi@thehurstgrp.com";
    const FROM_EMAIL = context.env.FROM_EMAIL || "website@yourdomain.com";

    if (!RESEND_API_KEY) return json({ error: "Server not configured." }, 500);

    const subject = `New website inquiry (${intent || "General"}) — ${name}`;
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>New Inquiry</h2>
        <p><b>Name:</b> ${escapeHtml(name)}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
        <p><b>Phone:</b> ${escapeHtml(phone || "-")}</p>
        <p><b>Intent:</b> ${escapeHtml(intent || "-")}</p>
        <p><b>Source:</b> ${escapeHtml(source || "-")}</p>
        <hr/>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>
    `;

    const payload = {
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      reply_to: email,
      subject,
      html
    };

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const t = await r.text();
      return json({ error: "Resend error", detail: t }, 502);
    }

    return json({ ok: true }, 200);

  } catch (err) {
    return json({ error: "Unexpected error." }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
