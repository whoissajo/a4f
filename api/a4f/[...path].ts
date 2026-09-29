import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";

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

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function getEndpoint(req: IncomingMessage) {
  const requestUrl = new URL(
    req.url || "/",
    `https://${req.headers.host || "localhost"}`,
  );
  const prefix = "/api/a4f/";
  return {
    requestUrl,
    endpoint: requestUrl.pathname.startsWith(prefix)
      ? requestUrl.pathname.slice(prefix.length).replace(/\/$/, "")
      : "",
  };
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const apiKey = process.env.A4F_API_KEY;

  if (!apiKey) {
    return sendJson(res, 503, {
      error: {
        message: "A4F_API_KEY is not configured on the server.",
        type: "a4f_proxy_error",
      },
    });
  }

  const { requestUrl, endpoint } = getEndpoint(req);

  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return sendJson(res, 404, {
      error: {
        message: "Unsupported A4F endpoint.",
        type: "a4f_proxy_error",
      },
    });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
  };

  const contentType = req.headers["content-type"];
  if (typeof contentType === "string") {
    headers["Content-Type"] = contentType;
  }

  for (const [name, value] of Object.entries(req.headers)) {
    const lower = name.toLowerCase();
    if (lower.startsWith("x-a4f-") && lower !== "x-a4f-api-key" && typeof value === "string") {
      headers[name] = value;
    }
  }

  const method = req.method || "GET";
  const hasBody = method !== "GET" && method !== "HEAD";

  try {
    const upstream = await fetch(`${A4F_BASE_URL}/${endpoint}${requestUrl.search}`, {
      method,
      headers,
      body: hasBody ? (Readable.toWeb(req as any) as any) : undefined,
      redirect: "manual",
      cache: "no-store",
      duplex: "half",
    } as RequestInit & { duplex: "half" });

    res.statusCode = upstream.status;

    for (const name of ["content-type", "cache-control", "x-request-id", "retry-after"]) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }

    const contentTypeHeader = upstream.headers.get("content-type") || "";
    if (contentTypeHeader.includes("text/event-stream")) {
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");
    }

    if (!upstream.body) {
      res.end();
      return;
    }

    Readable.fromWeb(upstream.body as any).pipe(res);
  } catch (error) {
    console.error("A4F upstream request failed:", error);
    if (!res.headersSent) {
      sendJson(res, 502, {
        error: {
          message: "Unable to reach the A4F API.",
          type: "a4f_proxy_error",
        },
      });
    } else {
      res.end();
    }
  }
}
