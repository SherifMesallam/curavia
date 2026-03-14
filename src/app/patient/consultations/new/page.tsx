import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { BookConsultationForm } from "@/components/patient/BookConsultationForm";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ doctorId?: string }>;
}

export default async function BookConsultationPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") redirect("/login");

  const { doctorId: preselectedDoctorId } = await searchParams;

  const doctors = await prisma.doctor.findMany({
    where: { status: "APPROVED" },
    include: { specialization: true, clinic: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div className="container max-w-xl py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-1">
        Consultations
      </p>
      <h1 className="font-bold text-2xl mb-2">Book a consultation</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Book a one-on-one consultation with a doctor to discuss your case, get a second opinion, or plan your treatment.
      </p>
      <BookConsultationForm doctors={doctors} preselectedDoctorId={preselectedDoctorId ?? null} />
    </div>
  );
}
