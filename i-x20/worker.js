export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") return new Response(null, {headers: cors});
    if (request.method !== "POST") return new Response(JSON.stringify({error:"Method not allowed"}), {status:405, headers:{"Content-Type":"application/json", ...cors}});

    try {
      const body = await request.json();
      const allowed = ["address","bedrooms","baths","guests","currency","room_type"];
      const params = new URLSearchParams();
      for (const key of allowed) {
        if (body[key] !== undefined && body[key] !== null && body[key] !== "") params.set(key, body[key]);
      }

      const upstream = await fetch(`https://api.airroi.com/calculator/estimate?${params.toString()}`, {
        headers: {"X-API-KEY": env.AIRROI_API_KEY}
      });

      const text = await upstream.text();
      return new Response(text, {
        status: upstream.status,
        headers: {"Content-Type":"application/json", ...cors}
      });
    } catch (error) {
      return new Response(JSON.stringify({error: error.message || "Unable to process request"}), {
        status: 500,
        headers: {"Content-Type":"application/json", ...cors}
      });
    }
  }
};
