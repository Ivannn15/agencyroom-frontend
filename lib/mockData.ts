export type MockClient = {
  id: string;
  name: string;
  company?: string;
  contactEmail: string;
  createdAt: string;
};

export type MockProject = {
  id: string;
  clientId: string;
  name: string;
  status: "active" | "paused" | "completed";
};

export type MockReport = {
  id: string;
  clientId: string;
  projectId?: string;
  projectName: string;
  clientName: string;
  period: string;
  summary: string;
  roas?: number;
  spend?: number;
  revenue?: number;
};

export const mockClients: MockClient[] = [
  {
    id: "c1",
    name: "Анна",
    company: "Acme Store",
    contactEmail: "anna@acme-store.com",
    createdAt: "2024-09-10",
  },
  {
    id: "c2",
    name: "Игорь",
    company: "LeadGen Pro",
    contactEmail: "igor@leadgen.pro",
    createdAt: "2024-10-02",
  },
  {
    id: "c3",
    name: "Мария",
    company: "Local Cafe",
    contactEmail: "maria@localcafe.ru",
    createdAt: "2024-11-15",
  },
];

export const mockProjects: MockProject[] = [
  { id: "p1", clientId: "c1", name: "Google Ads · Acme", status: "active" },
  { id: "p2", clientId: "c2", name: "Yandex Direct · Leads", status: "active" },
  { id: "p3", clientId: "c3", name: "VK Ads · Awareness", status: "paused" },
];

export const mockReports: MockReport[] = [
  {
    id: "r1",
    clientId: "c1",
    projectId: "p1",
    projectName: "Google Ads · Acme",
    clientName: "Acme Store",
    period: "Январь 2025",
    summary: "ROAS 4.2, +38% к лидам vs прошлый месяц",
    roas: 4.2,
    spend: 120000,
    revenue: 504000,
  },
  {
    id: "r2",
    clientId: "c2",
    projectId: "p2",
    projectName: "Yandex Direct · Leads",
    clientName: "LeadGen Pro",
    period: "Январь 2025",
    summary: "CPA -22%, рост заявок на 27%",
    roas: 3.1,
    spend: 80000,
    revenue: 248000,
  },
  {
    id: "r3",
    clientId: "c3",
    projectId: "p3",
    projectName: "VK Ads · Awareness",
    clientName: "Local Cafe",
    period: "Декабрь 2024",
    summary: "Охват +54%, стабильный CTR",
    roas: 2.4,
    spend: 50000,
    revenue: 120000,
  },
];
