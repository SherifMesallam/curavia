import { prisma } from "@/lib/db";
import type { InquiryFormData } from "./validations";

export async function createInquiry(
  patientProfileId: string,
  userId: string,
  data: InquiryFormData
) {
  const inquiry = await prisma.inquiryCase.create({
    data: {
      patientId: patientProfileId,
      procedureId: data.procedureId,
      specializationId: data.specializationId,
      caseDescription: data.caseDescription,
      patientCountry: data.patientCountry,
      preferredCity: data.preferredCity ?? null,
      age: data.age,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      travelDateStart: new Date(data.travelDateStart),
      travelDateEnd: new Date(data.travelDateEnd),
      consentAgreed: data.consentAgreed,
      preferredDoctorId: data.preferredDoctorId ?? null,
      contactPhone: data.contactPhone ?? null,
      contactEmail: data.contactEmail,
      preferredContactMethods: JSON.stringify(data.preferredContactMethods),
      contactWhatsapp: data.contactWhatsapp ?? null,
      contactTelegram: data.contactTelegram ?? null,
      contactOther: data.contactOther ?? null,
      status: "SUBMITTED",
    },
    include: {
      procedure: true,
      specialization: true,
    },
  });

  for (const file of data.medicalFiles) {
    await prisma.medicalFile.create({
      data: {
        inquiryCaseId: inquiry.id,
        fileKey: file.fileKey,
        fileName: file.fileName,
        uploadedById: userId,
      },
    });
  }

  return inquiry;
}

export async function addMedicalFileToInquiry(
  inquiryCaseId: string,
  userId: string,
  fileKey: string,
  fileName: string
) {
  const inquiry = await prisma.inquiryCase.findFirst({
    where: { id: inquiryCaseId },
    include: { patient: true },
  });
  if (!inquiry || inquiry.patient.userId !== userId) {
    throw new Error("Unauthorized");
  }
  return prisma.medicalFile.create({
    data: {
      inquiryCaseId,
      fileKey,
      fileName,
      uploadedById: userId,
    },
  });
}

export async function getPatientInquiries(patientId: string) {
  return prisma.inquiryCase.findMany({
    where: { patientId },
    include: {
      procedure: true,
      specialization: true,
      medicalFiles: true,
      _count: { select: { matchRecommendations: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInquiryById(id: string, patientId: string) {
  const inquiry = await prisma.inquiryCase.findFirst({
    where: { id, patientId },
    include: {
      procedure: true,
      specialization: true,
      medicalFiles: true,
      matchRecommendations: { include: { doctor: { include: { clinic: true, specialization: true } } } },
      consultationRequests: { include: { doctor: { include: { clinic: true } } } },
    },
  });
  return inquiry;
}
