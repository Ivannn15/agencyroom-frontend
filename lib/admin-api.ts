import { Report } from "./types";
import { loginRequest, ReportsQuery } from "./client-api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function apiRequest<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.json();
}

export async function publishReport(token: string, id: string) {
  return apiRequest<Report>(`/reports/${id}/publish`, token, { method: "POST" });
}

export async function unpublishReport(token: string, id: string) {
  return apiRequest<Report>(`/reports/${id}/unpublish`, token, { method: "POST" });
}

export async function exportReport(token: string, id: string, format: "pdf" | "docx" = "pdf") {
  return apiRequest<{ reportId: string; format: string; status: string; message: string }>(
    `/reports/${id}/export?format=${format}`,
    token,
    { method: "GET" }
  );
}
