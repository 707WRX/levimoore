export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

    const {
      name,
      email,
      phone,
      intent,
      message
    } = data || {};

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const html = `
<!doctype html>
<html>
  <body style="
    margin:0;
    padding:0;
    background:#07080B;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
    color:#ffffff;
  ">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="
            max-width:560px;
            background:#0B0D12;
            border:1px solid rgba(214,186,110,.25);
            border-radius:16px;
            padding:28px;
          ">
            <tr>
              <td style="font-size:18px;font-weight:600;letter-spacing:-0.01em;">
                New Contact Request
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:rgba(255,255,255,.55);padding-top:4px;">
                Levi Moore · Fortuna, CA
              </td>
            </tr>

            <tr>
              <td style="padding:18px 0;">
                <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(214,186,110,.45),transparent);"></div>
              </td>
            </tr>

            <tr>
              <td style="font-size:13px;color:rgba(255,255,255,.55);">Name</td>
            </tr>
            <tr>
              <td style="font-size:15px;padding-bottom:14px;">${name}</td>
            </tr>

            <tr>
              <td style="font-size:13px;color:rgba(255,255,255,.55);">Email</td>
            </tr>
            <tr>
              <td style="font-size:15px;padding-bottom:14px;">${email}</td>
            </tr>

            ${phone ? `
            <tr>
              <td style="font-size:13px;color:rgba(255,255,255,.55);">Phone</td>
            </tr>
            <tr>
              <td style="font-size:15px;padding-bottom:14px;">${phone}</td>
            </tr>` : ``}

            ${intent ? `
            <tr>
              <td style="font-size:13px;color:rgba(255,255,255,.55);">Interest</td>
            </tr>
            <tr>
              <td style="font-size:15px;padding-bottom:18px;">${intent}</td>
            </tr>` : ``}

            <tr>
              <td style="font-size:13px;color:rgba(255,255,255,.55);padding-bottom:6px;">Message</td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.6;white-space:pre-line;color:rgba(255,255,255,.9);">
                ${message}
              </td>
            </tr>

            <tr>
              <td style="padding-top:26px;font-size:12px;color:rgba(255,255,255,.45);">
                Sent via levimoore.com contact form
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: env.TO_EMAIL,
        reply_to: email,
        subject: `New inquiry from ${name}`,
        html
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(
        JSON.stringify({ error: err }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200 }
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}
