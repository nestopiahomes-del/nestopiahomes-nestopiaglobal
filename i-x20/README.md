Nestopia Homes — Property Deal Calculator v2

Changes:
- Proper semantic head/body/footer structure.
- Responsive site-width layout (max 1180px) instead of a narrow/print-like presentation.
- Sticky results panel on desktop; normal flow on mobile.
- Clear, high-contrast form text and visible caret while typing.
- Explicit placeholder, focus and select styling.
- Address field is a proper search input with Maps action and AirROI link.
- Purchase / R2R / R2R2STR modes.
- Monthly landlord rent automatically calculates annual rent as monthly × 12, and annual rent can be edited to recalculate monthly.
- AirROI-ready secure backend endpoint via Cloudflare Worker.
- No API key in frontend code.

Deploy worker.js as a Cloudflare Worker and configure AIRROI_API_KEY as a Worker secret.
