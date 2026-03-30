import type { NextRequest } from "next/server";

interface WebVitalsPayload {
  delta?: number;
  id?: string;
  name?: string;
  navigationType?: string;
  rating?: string;
  value?: number;
}

const isValidMetricPayload = (payload: WebVitalsPayload): boolean => {
  return (
    typeof payload.id === "string" &&
    typeof payload.name === "string" &&
    typeof payload.value === "number"
  );
};

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const payload = (await request.json()) as WebVitalsPayload;

    if (!isValidMetricPayload(payload)) {
      return new Response(null, { status: 204 });
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("[web-vitals]", payload);
    }

    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
}
