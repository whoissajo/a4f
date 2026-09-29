import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const A4F_BASE_URL = (process.env.A4F_BASE_URL || "https://api.a4f.co/v1").replace(/\/$/, "");

const ALLOWED_ENDPOINTS = new Set([
  "chat/completions",
  "responses",
  "images/generations",
  "images/edits",
  "embeddings",
  "audio/speech",
  "audio/transcriptions",
  "video/generations",
  "models",
  "usage",
]);

function jsonError(status: number, message: string) {
  return NextResponse.json(
    {
      error: {
        message,
        type: "a4f_proxy_error",
      },
    },
    { status },
  );
}

async function proxy(request: Request, context: { params: { path: string[] } }) {
  const apiKey = process.env.A4F_API_KEY;

  if (!apiKey) {
    return jsonError(503, "A4F_API_KEY is not configured on the server.");
  }

  const endpoint = (context.params.path || []).join("/");

  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return jsonError(404, "Unsupported A4F endpoint.");
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`${A4F_BASE_URL}/${endpoint}`);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${apiKey}`);

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  // Preserve only documented/extension-style A4F request headers.
  for (const [name, value] of request.headers.entries()) {
    const lower = name.toLowerCase();
    if (lower.startsWith("x-a4f-") && !["x-a4f-api-key"].includes(lower)) {
      headers.set(name, value);
    }
  }

  const body = request.method === "GET" || request.method === "HEAD"
    ? undefined
    : await request.arrayBuffer();

  let upstream: Response;

  try {
    upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });
  } catch (error) {
    console.error("A4F upstream request failed:", error);
    return jsonError(502, "Unable to reach the A4F API.");
  }

  const responseHeaders = new Headers();

  for (const name of [
    "content-type",
    "cache-control",
    "x-request-id",
    "retry-after",
  ]) {
    const value = upstream.headers.get(name);
    if (value) {
      responseHeaders.set(name, value);
    }
  }

  if ((responseHeaders.get("content-type") || "").includes("text/event-stream")) {
    responseHeaders.set("cache-control", "no-cache, no-transform");
    responseHeaders.set("x-accel-buffering", "no");
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export async function GET(request: Request, context: { params: { path: string[] } }) {
  return proxy(request, context);
}

export async function POST(request: Request, context: { params: { path: string[] } }) {
  return proxy(request, context);
}
