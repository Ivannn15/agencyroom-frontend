import { NextResponse } from "next/server";
import { getJwtTtlSeconds } from "../../../../lib/jwt-exp";

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

  if (!data?.accessToken || data?.user?.role === "client") {
    return NextResponse.json({ message: "client-account" }, { status: 403 });
  }

  const response = NextResponse.json(data);
  const ttlSeconds = getJwtTtlSeconds(data.accessToken);
  response.cookies.set("admin_token", data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ttlSeconds,
  });

  return response;
}
