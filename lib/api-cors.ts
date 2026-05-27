import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function jsonWithCors(
  body: unknown,
  init?: ResponseInit
): NextResponse {
  const res = NextResponse.json(body, init);
  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    res.headers.set(k, v);
  }
  return res;
}

export function optionsCors(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
