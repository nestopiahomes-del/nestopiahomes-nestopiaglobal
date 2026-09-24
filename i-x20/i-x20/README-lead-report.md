# Nestopia Property Deal Calculator — deployment & lead storage

## What changed

- Branded A4 PDF report with a Nestopia-style cover, executive summary, AirROI market search, comparable listings, seasonality and closing/contact page.
- Report filename format:
  `Nestopia Homes - [City] - [Street] - [bedrooms]/[bathrooms].pdf`
- UK reports use Nestopia Homes / GBP; India reports use Nestopia Global / INR. The calculator can auto-detect from the address or you can select the market.
- The homepage calculator CTA now takes visitors directly to the report form to encourage lead capture.
- After submission, the UI shows a professional confirmation note.
- Added `/api/health` so you can quickly verify that Cloudflare Pages Functions are actually deployed.
- AirROI errors now distinguish a missing/deployed endpoint (404) from an upstream AirROI problem.

## Where leads are stored

The intended production flow is:

**Visitor → Nestopia calculator → `/api/lead` (Cloudflare Pages Function) → Google Apps Script Web App → Google Sheet (`Leads` tab).**

The Google Sheet is the lead register. It stores the visitor's contact details plus the selected brand/currency, strategy, property details, calculation outputs, AirROI summary values and report filename.

## Google Sheet setup

1. Create a Google Sheet, for example `Nestopia Property Leads`.
2. Open **Extensions → Apps Script**.
3. Paste `google-apps-script.gs`.
4. Save the project.
5. Select **Deploy → New deployment → Web app**.
6. Execute the web app as the Google account that owns the Sheet.
7. Set access so the web app can receive requests from your website.
8. Copy the deployed `/exec` URL.
9. In Cloudflare Pages, add that URL as the secret/environment variable:
   `LEAD_SHEET_WEBHOOK_URL`
10. Redeploy the site.

The script creates a `Leads` sheet automatically if it does not exist.

## Cloudflare Pages Functions placement

The repository root must contain:

```text
functions/
└── api/
    ├── airroi-estimate.js
    ├── health.js
    └── lead.js
```

These map to:

- `/api/airroi-estimate`
- `/api/health`
- `/api/lead`

Do not upload the `functions` folder inside `assets`, `js`, `public`, or the calculator page folder.

## Cloudflare secrets

Add these in the Pages project's environment variables/secrets for the environment you deploy to:

- `AIRROI_API_KEY` — your AirROI API key
- `LEAD_SHEET_WEBHOOK_URL` — the Google Apps Script `/exec` URL

Never put the AirROI API key in `investment-calculator.html` or any browser JavaScript.

## Quick deployment test

After a successful Pages deployment, open:

`https://YOUR-DOMAIN/api/health`

You should receive JSON similar to:

```json
{"ok":true,"service":"Nestopia Pages Functions","airroiConfigured":true,"leadStorageConfigured":true}
```

If `/api/health` returns **404**, the problem is Cloudflare Pages deployment/routing, not the AirROI API request. In that case, make sure the Git-connected Pages project is deploying the repository that contains the root-level `functions` folder.

## Important: Direct Upload vs Git deployment

Cloudflare Pages Functions are designed to deploy with the Pages project/Git workflow. If you use a static/direct upload method that only uploads site assets, the `functions` directory will not become an API route.

## Report generation

The PDF is generated in the visitor's browser. It does not send the report to a PDF server. The lead is submitted before the report is generated, and the report includes AirROI data if the visitor has successfully run the market search.

## Privacy

The calculator collects personal information. Keep the consent wording visible and publish the site's privacy information. If you later want marketing communications, use a separate optional marketing-consent checkbox rather than treating the report consent as marketing consent.
