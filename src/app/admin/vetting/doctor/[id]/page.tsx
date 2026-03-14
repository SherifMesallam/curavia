import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VettingActions } from "@/components/admin/VettingActions";
import { CredentialViewer } from "@/components/admin/CredentialViewer";
import { AdminNotes } from "@/components/admin/AdminNotes";

export default async function DoctorVettingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      provider: { include: { user: true } },
      clinic: true,
      specialization: true,
      procedures: { include: { procedure: true } },
      credentials: true,
    },
  });
  if (!doctor || !["PENDING", "REQUEST_INFO"].includes(doctor.status)) notFound();

  return (
    <div className="container max-w-2xl py-10">
      <Button variant="ghost" asChild>
        <Link href="/admin/vetting">← Back to queue</Link>
      </Button>

      <div className="mt-8 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-2xl">
              Dr. {doctor.firstName} {doctor.lastName}
            </h1>
            <Badge variant={doctor.status === "REQUEST_INFO" ? "secondary" : "outline"}>
              {doctor.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{doctor.provider.user.email}</p>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Profile</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Specialization</dt>
              <dd>{doctor.specialization?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Clinic</dt>
              <dd>{doctor.clinic?.name ?? "Solo practitioner"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Experience</dt>
              <dd>{doctor.yearsExperience ?? "—"} years</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">License</dt>
              <dd>{doctor.licenseNumber ?? "—"}</dd>
            </div>
            {doctor.bio && (
              <div>
                <dt className="text-muted-foreground">Bio</dt>
                <dd>{doctor.bio}</dd>
              </div>
            )}
          </dl>
        </div>

        {doctor.procedures.length > 0 && (
          <div className="rounded-lg border p-4">
            <h2 className="font-semibold mb-2">Procedures</h2>
            <ul className="list-disc pl-4 text-sm">
              {doctor.procedures.map((dp) => (
                <li key={dp.procedureId}>{dp.procedure.name}</li>
              ))}
            </ul>
          </div>
        )}

        <CredentialViewer
          credentials={doctor.credentials.map((c) => ({
            id: c.id,
            type: c.type,
            fileKey: c.fileKey,
            fileName: c.fileName,
          }))}
        />

        <AdminNotes entityType="Doctor" entityId={doctor.id} />

        <VettingActions entityType="doctor" entityId={doctor.id} />
      </div>
    </div>
  );
}
