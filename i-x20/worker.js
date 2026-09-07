export default {
  async fetch(request, env) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") return new Response(null, {headers});
    if (request.method !== "POST") return new Response(JSON.stringify({error:"Method not allowed"}), {status:405, headers});

    try {
      if (!env.AIRROI_API_KEY) throw new Error("AIRROI_API_KEY is not configured.");

      const body = await request.json();
      const params = new URLSearchParams();
      for (const key of ["address","bedrooms","baths","guests","currency","room_type"]) {
        if (body[key] !== undefined && body[key] !== null && body[key] !== "") params.set(key, String(body[key]));
      }

      const upstream = await fetch("https://api.airroi.com/calculator/estimate?" + params.toString(), {
        headers: {"X-API-KEY": env.AIRROI_API_KEY}
      });

      const responseText = await upstream.text();
      return new Response(responseText, {status: upstream.status, headers});
    } catch (error) {
      return new Response(JSON.stringify({error: error.message || "AirROI request failed."}), {status:500, headers});
    }
  }
};
