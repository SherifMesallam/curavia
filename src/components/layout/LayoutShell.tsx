"use client";

import { usePathname } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

const HIDE_PUBLIC_LAYOUT_PREFIXES = [
  "/patient",
  "/admin",
  "/provider",
  "/login",
  "/register",
];

// These are public pages nested under otherwise-private prefixes
const PUBLIC_EXCEPTIONS = [
  "/provider-signup",
];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isException = PUBLIC_EXCEPTIONS.some((p) => pathname?.startsWith(p));
  const hidePublicLayout =
    !isException &&
    HIDE_PUBLIC_LAYOUT_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  if (hidePublicLayout) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
