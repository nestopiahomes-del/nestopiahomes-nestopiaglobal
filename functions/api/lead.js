export async function onRequestPost(context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };

  try {
    if (!context.env.LEAD_SHEET_WEBHOOK_URL) {
      return new Response(JSON.stringify({error:"Lead storage is not configured yet."}), {status:503, headers});
    }

    const body = await context.request.json();

    const required = ["name","email","phone","role"];
    for (const key of required) {
      if (!body[key] || String(body[key]).trim() === "") {
        return new Response(JSON.stringify({error:`Missing required field: ${key}`}), {status:400, headers});
      }
    }

    if (!body.consent) {
      return new Response(JSON.stringify({error:"Required consent was not provided."}), {status:400, headers});
    }

    const upstream = await fetch(context.env.LEAD_SHEET_WEBHOOK_URL, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body)
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({error:"Lead storage service returned an error."}), {status:502, headers});
    }

    return new Response(JSON.stringify({ok:true}), {status:200, headers});
  } catch (error) {
    return new Response(JSON.stringify({error:error?.message || "Unable to save lead."}), {status:500, headers});
  }
}
