import type { ReactNode } from "react";
import AdminAppShell from "../../components/admin/AdminAppShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AdminAppShell>{children}</AdminAppShell>;
}
