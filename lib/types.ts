export type User = {
  id: string;
  email: string;
  name?: string;
  initials?: string;
  role: "owner" | "manager" | "viewer";
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
  createdAt: string;
};

export type Project = {
  id: string;
  clientId: string;
  name: string;
  status: "active" | "paused" | "completed";
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
  clientId: string;
  projectId?: string;
  period: string;
  summary: string;
  kpi: ReportKpi;
  createdAt: string;
  whatWasDone?: string[];
  nextPlan?: string[];
  publicId?: string;
};
