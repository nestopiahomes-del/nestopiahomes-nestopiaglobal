# Nestopia Property Deal Calculator — lead capture + report

## 1. AirROI error fix
The old frontend assumed every `/api/airroi-estimate` response was JSON. If the route was missing or returned an empty/non-JSON response, the browser showed:
"Failed to execute 'json' on 'Response': Unexpected end of JSON input".

This version reads the response as text first and reports a clean HTTP/service error.

It also includes a proper Cloudflare Pages Function:
`functions/api/airroi-estimate.js`

Set the Cloudflare secret:
`AIRROI_API_KEY`

Cloudflare Pages Functions use file-based routes, so `functions/api/airroi-estimate.js` maps to `/api/airroi-estimate`.

## 2. Lead capture + PDF
The calculator now has a required lead form:
- Full name *
- Email *
- Contact number *
- I am a… * (Investor, Landlord, Tenant, Existing client, Property owner, Property professional, Other)
- Required consent *

After submission, the site generates a branded PDF report using the Nestopia template.

The report includes:
- Strategy
- Property location
- Bedrooms / bathrooms / guests
- ADR / occupancy / occupied nights
- Gross annual revenue
- Net annual profit
- Monthly revenue / profit
- Return
- Break-even occupancy
- Rent and operating costs
- Initial cash required

The report is generated in the visitor's browser; no calculator data needs to be sent to a PDF server.

## 3. Google Sheets lead storage
`google-apps-script.gs` is a ready-to-deploy Google Apps Script `doPost` endpoint.

Recommended architecture:
Browser -> Cloudflare Pages Function `/api/lead` -> Google Apps Script -> Google Sheet

This keeps the Google webhook URL out of the frontend and gives you one place to validate incoming leads.

Configure the Cloudflare secret:
`LEAD_SHEET_WEBHOOK_URL`

### Google Apps Script setup
1. Create a Google Sheet for Nestopia leads.
2. Open Extensions -> Apps Script.
3. Paste `google-apps-script.gs`.
4. Save.
5. Deploy -> New deployment -> Web app.
6. Execute as the account that owns the sheet.
7. Allow the web app to be accessible to your intended callers.
8. Copy the `/exec` URL.
9. Add it as the Cloudflare secret `LEAD_SHEET_WEBHOOK_URL`.

Google Apps Script web apps support `doPost` and can write to Sheets. The Apps Script `appendRow` method appends the captured lead to the sheet.

## Privacy
Because this collects personal information, keep the required consent/notice clear and publish Nestopia's privacy information. Consider adding an optional, separate marketing-consent checkbox if you intend to send marketing communications.

## Important deployment note
The current site is static/Cloudflare-hosted. Pages Functions need to be deployed through the Git/Pages build workflow; a direct static upload does not deploy the `/functions` directory.
