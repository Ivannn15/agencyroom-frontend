"use client";

import { AdminAuthProvider } from "../../components/admin/AdminAuthProvider";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
