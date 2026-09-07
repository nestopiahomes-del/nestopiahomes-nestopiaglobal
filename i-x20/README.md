# Nestopia Property Deal Calculator

This build supports:
- Property purchase analysis
- Rent-to-Rent (R2R)
- Rent-to-Rent-to-Short-Term-Rental (R2R2STR)
- Monthly landlord rent with automatic annual rent calculation (monthly × 12)
- STR ADR and occupancy assumptions
- AirROI estimate integration through a server-side Cloudflare Worker
- AirROI percentile outputs and comparable listing count
- Dynamic Google Maps link for the entered address
- Official AirROI Revenue Calculator link

## AirROI setup
The frontend calls `/api/airroi-estimate`.
Deploy `worker.js` as a Cloudflare Worker and set the secret:
`AIRROI_API_KEY`

Do not place the AirROI key in frontend JavaScript.

AirROI currently uses a pay-as-you-go API with a minimum $10 credit activation, so the integration remains optional until the key is configured.

## Important
The calculator uses AirROI market estimates where available, but Nestopia's own R2R/R2R2STR profit model controls landlord rent, operating costs, setup costs and cash ROI.
