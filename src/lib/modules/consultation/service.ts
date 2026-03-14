import { prisma } from "@/lib/db";

// ── Book a standalone consultation ──────────────────────────────────────────

export async function bookConsultation(
  patientProfileId: string,
  doctorId: string,
  notes?: string,
  inquiryCaseId?: string
) {
  const doctor = await prisma.doctor.findFirst({
    where: { id: doctorId, status: "APPROVED" },
  });
  if (!doctor) throw new Error("Doctor not found");

  return prisma.consultationRequest.create({
    data: {
      patientId: patientProfileId,
      doctorId,
      notes: notes ?? null,
      inquiryCaseId: inquiryCaseId ?? null,
      status: "REQUESTED",
    },
    include: {
      doctor: { include: { clinic: true, specialization: true } },
      patient: { include: { user: true } },
    },
  });
}

// ── Admin: propose a scheduled time ─────────────────────────────────────────

export async function proposeTime(
  consultationId: string,
  proposedAt: Date
) {
  const c = await prisma.consultationRequest.findUnique({ where: { id: consultationId } });
  if (!c) throw new Error("Consultation not found");
  return prisma.consultationRequest.update({
    where: { id: consultationId },
    data: { proposedAt, status: "PENDING_CONFIRMATION" },
    include: {
      doctor: { include: { clinic: true, specialization: true } },
      patient: { include: { user: true } },
    },
  });
}

// ── Patient: confirm the proposed time ──────────────────────────────────────

export async function confirmConsultation(
  consultationId: string,
  patientProfileId: string
) {
  const c = await prisma.consultationRequest.findFirst({
    where: { id: consultationId, patientId: patientProfileId },
  });
  if (!c) throw new Error("Consultation not found");
  if (c.status !== "PENDING_CONFIRMATION") throw new Error("No proposed time to confirm");

  return prisma.consultationRequest.update({
    where: { id: consultationId },
    data: { scheduledAt: c.proposedAt ?? undefined, status: "CONFIRMED" },
    include: { doctor: { include: { clinic: true } }, patient: { include: { user: true } } },
  });
}

// ── Admin: mark complete ─────────────────────────────────────────────────────

export async function completeConsultation(consultationId: string) {
  return prisma.consultationRequest.update({
    where: { id: consultationId },
    data: { status: "COMPLETED" },
    include: { doctor: true, patient: { include: { user: true } } },
  });
}

// ── Cancel ───────────────────────────────────────────────────────────────────

export async function cancelConsultation(
  consultationId: string,
  userId: string,
  role: string
) {
  const c = await prisma.consultationRequest.findUnique({
    where: { id: consultationId },
    include: {
      patient: true,
      doctor: { include: { provider: true } },
    },
  });
  if (!c) throw new Error("Consultation not found");

  const isPatient = role === "PATIENT" && c.patient.userId === userId;
  const isProvider = role === "PROVIDER" && c.doctor.provider.userId === userId;
  const isAdmin = role === "ADMIN";

  if (!isPatient && !isProvider && !isAdmin) throw new Error("Unauthorized");
  if (c.status === "CANCELLED") return { cancelled: false };

  await prisma.consultationRequest.update({
    where: { id: consultationId },
    data: { status: "CANCELLED" },
  });
  return { cancelled: true };
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

export async function getPatientConsultations(patientProfileId: string) {
  return prisma.consultationRequest.findMany({
    where: { patientId: patientProfileId },
    include: {
      doctor: { include: { clinic: true, specialization: true } },
      inquiryCase: { include: { procedure: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminConsultations() {
  return prisma.consultationRequest.findMany({
    include: {
      patient: { include: { user: true } },
      doctor: { include: { clinic: true, specialization: true } },
      inquiryCase: { include: { procedure: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
