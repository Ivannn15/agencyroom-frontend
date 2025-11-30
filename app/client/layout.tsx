"use client";

import { ClientAuthProvider } from "../../components/client/ClientAuthProvider";

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  return <ClientAuthProvider>{children}</ClientAuthProvider>;
}
