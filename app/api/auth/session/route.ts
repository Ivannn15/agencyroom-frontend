import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function GET() {
  const store = await cookies();
  const token = store.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.ok) {
    const data = await res.json();
    return NextResponse.json({
      accessToken: token,
      ...data,
    });
  }

  const response = NextResponse.json({ message: "unauthorized" }, { status: 401 });
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
