NESTOPIA CLOUDFLARE WORKER CONVERSION

Upload these 3 files to the ROOT of the GitHub repository:
- worker.js
- wrangler.jsonc
- .assetsignore

This changes the deployment from static-assets-only to a Worker with static assets + /api routes.

After Cloudflare redeploys, add these Worker secrets:
- AIRROI_API_KEY
- LEAD_SHEET_WEBHOOK_URL

Then test:
https://YOUR-DOMAIN/api/health

Expected:
{"ok":true,"service":"Nestopia Worker API","airroiConfigured":true,"leadStorageConfigured":true}
