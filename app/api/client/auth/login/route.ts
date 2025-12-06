import { NextResponse } from "next/server";
import { getJwtTtlSeconds } from "../../../../../../lib/jwt-exp";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: Request) {
  const payload = await request.json();

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json(data ?? { message: "Invalid credentials" }, { status: res.status });
  }

  if (!data?.accessToken || data?.user?.role !== "client") {
    return NextResponse.json({ message: "not-client" }, { status: 403 });
  }

  const ttlSeconds = getJwtTtlSeconds(data.accessToken);

  const response = NextResponse.json(data);
  response.cookies.set("client_token", data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ttlSeconds,
  });

  return response;
}
