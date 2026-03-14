import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { UserMenu } from "@/components/shared/UserMenu";

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const displayName = user ? `${user.firstName} ${user.lastName}` : session.email;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container flex h-20 items-center justify-between">
          <Logo href="/provider/consultations" width={120} height={30} />
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/provider/consultations" className="text-muted-foreground hover:text-foreground">
              Consultations
            </Link>
            <Link href="/provider/onboarding" className="text-muted-foreground hover:text-foreground">
              Onboarding
            </Link>
            <UserMenu
              name={displayName}
              email={session.email}
              profileHref="/provider/consultations"
            />
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
