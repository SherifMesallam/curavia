import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
import { VettingTable, type PendingProvider } from "@/components/admin/VettingTable";

export default async function AdminVettingPage() {
  const [pendingDoctors, pendingClinics] = await Promise.all([
    prisma.doctor.findMany({
      where: { status: { in: ["PENDING", "REQUEST_INFO"] } },
      include: {
        provider: { include: { user: true } },
        clinic: true,
        specialization: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clinic.findMany({
      where: { status: { in: ["PENDING", "REQUEST_INFO"] } },
      include: {
        provider: { include: { user: true } },
        _count: { select: { doctors: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const providers: PendingProvider[] = [
    ...pendingDoctors.map((d) => ({
      id: d.id,
      type: "doctor" as const,
      status: d.status,
      name: `Dr. ${d.firstName} ${d.lastName}`,
      email: d.provider.user.email,
      specialization: d.specialization?.name ?? null,
      clinic: d.clinic?.name ?? null,
      createdAt: d.createdAt,
    })),
    ...pendingClinics.map((c) => ({
      id: c.id,
      type: "clinic" as const,
      status: c.status,
      name: c.name,
      email: c.provider.user.email,
      city: c.city,
      country: c.country,
      doctorCount: c._count.doctors,
      createdAt: c.createdAt,
    })),
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="container py-10">
      <h1 className="font-bold text-2xl mb-2">Vetting queue</h1>
      <p className="text-muted-foreground mb-8">
        Review and approve or reject provider applications. Approved providers
        become visible in the public marketplace.
      </p>

      <VettingTable providers={providers} />
    </div>
  );
}
