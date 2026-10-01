export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    ok: true,
    service: "Nestopia AirROI endpoint",
    airroiConfigured: Boolean(context.env.AIRROI_API_KEY),
    method: "POST"
  }), {
    status: 200,
    headers: {"Content-Type":"application/json","Cache-Control":"no-store"}
  });
}

export async function onRequestPost(context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };

  try {
    if (!context.env.AIRROI_API_KEY) {
      return new Response(JSON.stringify({error:"AirROI API key is not configured on the server."}), {status:503, headers});
    }

    const body = await context.request.json();
    const params = new URLSearchParams();
    for (const key of ["address","bedrooms","baths","guests","currency","room_type"]) {
      if (body[key] !== undefined && body[key] !== null && body[key] !== "") {
        params.set(key, String(body[key]));
      }
    }

    const upstream = await fetch("https://api.airroi.com/calculator/estimate?" + params.toString(), {
      headers: {"X-API-KEY": context.env.AIRROI_API_KEY, "Accept":"application/json"}
    });

    const text = await upstream.text();
    const contentType = upstream.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response(JSON.stringify({
        error:`AirROI returned a non-JSON response (HTTP ${upstream.status}).`,
        upstreamStatus: upstream.status
      }), {status:502, headers});
    }

    return new Response(text, {status: upstream.status, headers});
  } catch (error) {
    return new Response(JSON.stringify({error:error?.message || "Unable to contact AirROI."}), {status:500, headers});
  }
}
