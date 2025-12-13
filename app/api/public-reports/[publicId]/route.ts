import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function GET(_req: Request, { params }: { params: { publicId: string } }) {
  const { publicId } = params;
  const res = await fetch(`${API_URL}/public/reports/${publicId}`, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ message: "not found" }, { status: res.status });
  }
  const data = await res.json();
  return NextResponse.json(data);
}
