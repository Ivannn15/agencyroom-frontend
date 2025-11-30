import { ClientReportsResponse, ClientSummaryResponse, Report, User, Agency } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  token?: string;
};

async function apiRequest<T>(path: string, { method = "GET", headers = {}, body, token }: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 401) {
    throw new Error("unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: User;
  agency: Agency;
};

export async function loginRequest(data: LoginPayload) {
  return apiRequest<LoginResponse>("/auth/login", { method: "POST", body: data });
}

export type ReportsQuery = {
  fromPeriod?: string;
  toPeriod?: string;
  page?: number;
  pageSize?: number;
};

export async function fetchClientReports(token: string, params: ReportsQuery = {}) {
  const searchParams = new URLSearchParams();
  if (params.fromPeriod) searchParams.set("fromPeriod", params.fromPeriod);
  if (params.toPeriod) searchParams.set("toPeriod", params.toPeriod);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));

  const query = searchParams.toString();
  const path = `/client/reports${query ? `?${query}` : ""}`;
  return apiRequest<ClientReportsResponse>(path, { token });
}

export async function fetchClientReport(token: string, id: string) {
  return apiRequest<Report>(`/client/reports/${id}`, { token });
}

export async function fetchClientSummary(token: string, params: { fromPeriod?: string; toPeriod?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.fromPeriod) searchParams.set("fromPeriod", params.fromPeriod);
  if (params.toPeriod) searchParams.set("toPeriod", params.toPeriod);
  const query = searchParams.toString();
  const path = `/client/reports/summary${query ? `?${query}` : ""}`;
  return apiRequest<ClientSummaryResponse>(path, { token });
}
