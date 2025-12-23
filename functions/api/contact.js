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
            <!-- Header -->
            <tr>
              <td style="padding-bottom:20px;">
                <div style="
                  font-size:18px;
                  font-weight:600;
                  letter-spacing:-0.01em;
                ">
                  New Contact Request
                </div>
                <div style="
                  margin-top:4px;
                  font-size:13px;
                  color:rgba(255,255,255,.6);
                ">
                  Levi Moore · Fortuna, CA
                </div>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:16px 0;">
                <div style="
                  height:1px;
                  background:linear-gradient(
                    90deg,
                    rgba(214,186,110,.0),
                    rgba(214,186,110,.45),
                    rgba(214,186,110,.0)
                  );
                "></div>
              </td>
            </tr>

            <!-- Details -->
            <tr>
              <td style="padding-bottom:18px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:13px;color:rgba(255,255,255,.55);padding-bottom:6px;">
                      Name
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:15px;padding-bottom:14px;">
                      ${name}
                    </td>
                  </tr>

                  <tr>
                    <td style="font-size:13px;color:rgba(255,255,255,.55);padding-bottom:6px;">
                      Email
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:15px;padding-bottom:14px;">
                      ${email}
                    </td>
                  </tr>

                  ${phone ? `
                  <tr>
                    <td style="font-size:13px;color:rgba(255,255,255,.55);padding-bottom:6px;">
                      Phone
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:15px;padding-bottom:14px;">
                      ${phone}
                    </td>
                  </tr>
                  ` : ``}

                  ${intent ? `
                  <tr>
                    <td style="font-size:13px;color:rgba(255,255,255,.55);padding-bottom:6px;">
                      Interest
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:15px;padding-bottom:14px;">
                      ${intent}
                    </td>
                  </tr>
                  ` : ``}
                </table>
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style="padding-top:10px;">
                <div style="
                  font-size:13px;
                  color:rgba(255,255,255,.55);
                  margin-bottom:8px;
                ">
                  Message
                </div>
                <div style="
                  font-size:15px;
                  line-height:1.6;
                  color:rgba(255,255,255,.9);
                  white-space:pre-line;
                ">
                  ${message}
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding-top:28px;">
                <div style="
                  font-size:12px;
                  color:rgba(255,255,255,.45);
                ">
                  This message was sent via levimoore.com contact form.
                </div>
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
        from: env.FROM_EMAIL,       // onboarding@resend.dev
        to: env.TO_EMAIL,           // Levi@thehurstgrp.com
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
