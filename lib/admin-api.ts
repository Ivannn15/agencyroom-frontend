import { Client, Project, Report } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiRequestOptions = {
  method?: string;
  body?: any;
  token: string;
};

type PublicReportLink = {
  id: string;
  reportId: string;
  publicId: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type ReportsQuery = {
  projectId?: string;
  clientId?: string;
  publishedOnly?: boolean;
  fromPeriod?: string;
  toPeriod?: string;
  page?: number;
  pageSize?: number;
};

export type ReportWithRelations = Report & {
  project?: (Project & { client?: Client }) | null;
  publicLink?: PublicReportLink | null;
};

export type ProjectWithClient = Project & { client?: Client | null };

async function apiRequest<T>(path: string, { method = "GET", body, token }: ApiRequestOptions): Promise<T> {
  if (!token) {
    throw new Error("Missing admin token");
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const text = await res.text();
    const message = text || res.statusText || "Request failed";
    const error = new Error(message);
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
}

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

// Clients
export function fetchClients(token: string) {
  return apiRequest<Client[]>("/clients", { token });
}

export function fetchClient(token: string, id: string) {
  return apiRequest<Client & { projects?: Project[] }>("/clients/" + id, { token });
}

export function createClient(token: string, payload: { name: string; company?: string | null; contactEmail: string; contactPhone?: string | null }) {
  return apiRequest<Client>("/clients", { method: "POST", body: payload, token });
}

export function updateClient(token: string, id: string, payload: Partial<{ name: string; company?: string | null; contactEmail: string; contactPhone?: string | null }>) {
  return apiRequest<Client>("/clients/" + id, { method: "PATCH", body: payload, token });
}

export function deleteClient(token: string, id: string) {
  return apiRequest<Client>("/clients/" + id, { method: "DELETE", token });
}

// Projects
export function fetchProjects(token: string, params: { clientId?: string } = {}) {
  const query = toQuery({ clientId: params.clientId });
  return apiRequest<ProjectWithClient[]>(`/projects${query}`, { token });
}

export function fetchProject(token: string, id: string) {
  return apiRequest<ProjectWithClient & { reports?: Report[] }>(`/projects/${id}`, { token });
}

export function createProject(token: string, payload: { clientId: string; name: string; status?: Project["status"]; notes?: string | null }) {
  return apiRequest<Project>("/projects", { method: "POST", body: payload, token });
}

export function updateProject(token: string, id: string, payload: Partial<{ name: string; clientId?: string; status?: Project["status"]; notes?: string | null }>) {
  return apiRequest<Project>("/projects/" + id, { method: "PATCH", body: payload, token });
}

export function deleteProject(token: string, id: string) {
  return apiRequest<Project>("/projects/" + id, { method: "DELETE", token });
}

// Reports
export function fetchReports(token: string, params: ReportsQuery = {}) {
  const query = toQuery({
    projectId: params.projectId,
    clientId: params.clientId,
    publishedOnly: params.publishedOnly,
    fromPeriod: params.fromPeriod,
    toPeriod: params.toPeriod,
    page: params.page,
    pageSize: params.pageSize
  });
  return apiRequest<PaginatedResponse<ReportWithRelations>>(`/reports${query}`, { token });
}

export function fetchReport(token: string, id: string) {
  return apiRequest<ReportWithRelations>(`/reports/${id}`, { token });
}

export function createReport(
  token: string,
  payload: {
    projectId: string;
    period: string;
    summary: string;
    spend?: number | null;
    revenue?: number | null;
    leads?: number | null;
    cpa?: number | null;
    roas?: number | null;
    whatWasDone?: string[] | null;
    nextPlan?: string[] | null;
  }
) {
  return apiRequest<Report>("/reports", { method: "POST", body: payload, token });
}

export function updateReport(
  token: string,
  id: string,
  payload: {
    period: string;
    summary: string;
    spend?: number | null;
    revenue?: number | null;
    leads?: number | null;
    cpa?: number | null;
    roas?: number | null;
    whatWasDone?: string[] | null;
    nextPlan?: string[] | null;
  }
) {
  return apiRequest<Report>(`/reports/${id}`, { method: "PATCH", body: payload, token });
}

export function deleteReport(token: string, id: string) {
  return apiRequest<Report>(`/reports/${id}`, { method: "DELETE", token });
}

export function publishReport(token: string, id: string) {
  return apiRequest<Report>(`/reports/${id}/publish`, { method: "POST", token });
}

export function unpublishReport(token: string, id: string) {
  return apiRequest<Report>(`/reports/${id}/unpublish`, { method: "POST", token });
}

export function enablePublicLink(token: string, id: string) {
  return apiRequest<PublicReportLink>(`/reports/${id}/public-link`, { method: "POST", token });
}

export function disablePublicLink(token: string, id: string) {
  return apiRequest<{ count: number }>(`/reports/${id}/public-link`, { method: "DELETE", token });
}

export function exportReport(token: string, id: string, format: "pdf" | "docx" = "pdf") {
  return apiRequest<{ reportId: string; format: string; status: string; message: string }>(
    `/reports/${id}/export?format=${format}`,
    { method: "GET", token }
  );
}
