export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({
        ok: true,
        service: "Nestopia Worker API",
        airroiConfigured: Boolean(env.AIRROI_API_KEY),
        leadStorageConfigured: Boolean(env.LEAD_SHEET_WEBHOOK_URL),
      });
    }

    if (url.pathname === "/api/airroi-estimate") {
      if (request.method === "GET") {
        return json({
          ok: true,
          service: "Nestopia AirROI endpoint",
          airroiConfigured: Boolean(env.AIRROI_API_KEY),
          method: "POST",
        });
      }

      if (request.method === "POST") {
        return handleAirROI(request, env);
      }
    }

    if (url.pathname === "/api/lead" && request.method === "POST") {
      return handleLead(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleAirROI(request, env) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };

  try {
    if (!env.AIRROI_API_KEY) {
      return new Response(JSON.stringify({
        error: "AirROI API key is not configured on the server."
      }), { status: 503, headers });
    }

    const body = await request.json();
    const params = new URLSearchParams();

    for (const key of ["address", "bedrooms", "baths", "guests", "currency", "room_type"]) {
      if (body[key] !== undefined && body[key] !== null && body[key] !== "") {
        params.set(key, String(body[key]));
      }
    }

    const upstream = await fetch(
      "https://api.airroi.com/calculator/estimate?" + params.toString(),
      {
        headers: {
          "X-API-KEY": env.AIRROI_API_KEY,
          "Accept": "application/json",
        },
      }
    );

    const text = await upstream.text();
    const contentType = upstream.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return new Response(JSON.stringify({
        error: `AirROI returned a non-JSON response (HTTP ${upstream.status}).`,
        upstreamStatus: upstream.status,
      }), { status: 502, headers });
    }

    return new Response(text, { status: upstream.status, headers });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error?.message || "Unable to contact AirROI."
    }), { status: 500, headers });
  }
}

async function handleLead(request, env) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };

  try {
    if (!env.LEAD_SHEET_WEBHOOK_URL) {
      return new Response(JSON.stringify({
        error: "Lead storage is not configured yet."
      }), { status: 503, headers });
    }

    const body = await request.json();

    for (const key of ["name", "email", "phone", "role"]) {
      if (!body[key] || String(body[key]).trim() === "") {
        return new Response(JSON.stringify({
          error: `Missing required field: ${key}`
        }), { status: 400, headers });
      }
    }

    if (!body.consent) {
      return new Response(JSON.stringify({
        error: "Required consent was not provided."
      }), { status: 400, headers });
    }

    const upstream = await fetch(env.LEAD_SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({
        error: "Lead storage service returned an error."
      }), { status: 502, headers });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers,
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error?.message || "Unable to save lead."
    }), { status: 500, headers });
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
