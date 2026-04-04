import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const EXPO_PUSH_API = "https://exp.host/--/api/v2/push/send";

serve(async (req) => {
  try {
    const { pushToken, title, body, data } = await req.json();

    const message = {
      to: pushToken,
      sound: "default",
      title,
      body,
      data,
    };

    const response = await fetch(EXPO_PUSH_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
