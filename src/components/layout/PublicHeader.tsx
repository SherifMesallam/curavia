"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

const DASHBOARD_BY_ROLE: Record<string, string> = {
  PATIENT: "/patient/dashboard",
  PROVIDER: "/provider/consultations",
  ADMIN: "/admin/vetting",
};

export function PublicHeader() {
  const [dashboardHref, setDashboardHref] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(({ user }) => {
        if (user?.role) setDashboardHref(DASHBOARD_BY_ROLE[user.role] ?? null);
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5">
          <Link href="/procedures" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Procedures
          </Link>
          <Link href="/doctors" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Doctors
          </Link>
          <Link href="/clinics" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Clinics
          </Link>
          {checked && (
            dashboardHref ? (
              <Button asChild>
                <Link href={dashboardHref}>My Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/procedures">Browse Procedures</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )
          )}
        </nav>
        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          {checked && (
            dashboardHref ? (
              <Button size="sm" asChild>
                <Link href={dashboardHref}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}
