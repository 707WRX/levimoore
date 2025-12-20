# Levi Moore — Website (Cloudflare Pages + GitHub)

## What’s inside
- Static pages: `index.html`, `about.html`, `contact.html`, `legal.html`
- Styles: `/css/style.css`
- JS: `/js/main.js` (drawer, reveal, glass glow, magnetic buttons, contact form)
- Serverless: `/functions/api/contact.js` (Cloudflare Pages Function → Resend)

## Replace the portrait
Put Levi’s real portrait image at:
`/assets/img/levi.png` (keep the same filename)

## Resend setup (Cloudflare Pages)
1) Create a Resend API key.
2) In Cloudflare Pages → Settings → Environment variables:
   - `RESEND_API_KEY` = your key
   - `TO_EMAIL` = Levi@thehurstgrp.com (or whatever Levi wants)
   - `FROM_EMAIL` = a verified sender on Resend (example: website@levimoore.com)

> Note: Resend requires `FROM_EMAIL` to be from a domain you’ve verified.

## Local dev
This is a static site. Open `index.html` via a local server if you want fetch to work consistently.

## Deploy
- Push this folder to GitHub
- Connect repo to Cloudflare Pages
- Build command: none
- Output directory: `/` (root)
