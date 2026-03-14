import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VettingActions } from "@/components/admin/VettingActions";
import { CredentialViewer } from "@/components/admin/CredentialViewer";
import { AdminNotes } from "@/components/admin/AdminNotes";

export default async function ClinicVettingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clinic = await prisma.clinic.findUnique({
    where: { id },
    include: {
      provider: { include: { user: true } },
      doctors: true,
      facilityImages: true,
      credentials: true,
    },
  });
  if (!clinic || !["PENDING", "REQUEST_INFO"].includes(clinic.status)) notFound();

  return (
    <div className="container max-w-2xl py-10">
      <Button variant="ghost" asChild>
        <Link href="/admin/vetting">← Back to queue</Link>
      </Button>

      <div className="mt-8 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-2xl">{clinic.name}</h1>
            <Badge variant={clinic.status === "REQUEST_INFO" ? "secondary" : "outline"}>
              {clinic.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{clinic.provider.user.email}</p>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Clinic details</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Address</dt>
              <dd>{clinic.address ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">City</dt>
              <dd>{clinic.city}, {clinic.country}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{clinic.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Website</dt>
              <dd>{clinic.website ? <a href={clinic.website} className="text-primary hover:underline">{clinic.website}</a> : "—"}</dd>
            </div>
            {clinic.description && (
              <div>
                <dt className="text-muted-foreground">Description</dt>
                <dd>{clinic.description}</dd>
              </div>
            )}
          </dl>
        </div>

        {clinic.doctors.length > 0 && (
          <div className="rounded-lg border p-4">
            <h2 className="font-semibold mb-2">Doctors</h2>
            <ul className="list-disc pl-4 text-sm">
              {clinic.doctors.map((d) => (
                <li key={d.id}>Dr. {d.firstName} {d.lastName}</li>
              ))}
            </ul>
          </div>
        )}

        <CredentialViewer
          credentials={clinic.credentials.map((c) => ({
            id: c.id,
            type: c.type,
            fileKey: c.fileKey,
            fileName: c.fileName,
          }))}
        />

        <AdminNotes entityType="Clinic" entityId={clinic.id} />

        <VettingActions entityType="clinic" entityId={clinic.id} />
      </div>
    </div>
  );
}
