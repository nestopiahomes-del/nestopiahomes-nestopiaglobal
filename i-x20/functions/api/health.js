export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    ok: true,
    service: "Nestopia Pages Functions",
    airroiConfigured: Boolean(context.env.AIRROI_API_KEY),
    leadStorageConfigured: Boolean(context.env.LEAD_SHEET_WEBHOOK_URL)
  }), {
    status: 200,
    headers: {"Content-Type":"application/json","Cache-Control":"no-store"}
  });
}
