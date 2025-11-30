export type User = {
  id: string;
  email: string;
  name?: string;
  initials?: string;
  role: "owner" | "manager" | "viewer" | "client";
  agencyId?: string;
  clientId?: string | null;
};

export type Agency = {
  id: string;
  name: string;
  primaryEmail: string;
  timezone: string;
  currency: string;
};

export type Client = {
  id: string;
  name: string;
  company?: string;
  contactEmail: string;
  contactPhone?: string | null;
  createdAt: string;
};

export type Project = {
  id: string;
  clientId: string;
  name: string;
  status: "active" | "paused" | "completed";
  notes?: string | null;
};

export type ReportKpi = {
  spend?: number;
  revenue?: number;
  leads?: number;
  cpa?: number;
  roas?: number;
};

export type Report = {
  id: string;
  clientId?: string;
  projectId: string;
  period: string;
  summary: string;
  spend?: number | null;
  revenue?: number | null;
  leads?: number | null;
  cpa?: number | null;
  roas?: number | null;
  kpi?: ReportKpi;
  status?: "draft" | "published";
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  whatWasDone?: string[];
  nextPlan?: string[];
  project?: Project & { client?: Client };
};

export type ClientSummaryResponse = {
  totalSpend: number;
  totalRevenue: number;
  totalLeads: number;
  avgCpa: number | null;
  avgRoas: number | null;
  countReports: number;
};

export type ClientReportsResponse = {
  items: Report[];
  page: number;
  pageSize: number;
  total: number;
};
