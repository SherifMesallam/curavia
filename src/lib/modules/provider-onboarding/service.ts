import { prisma } from "@/lib/db";
import * as bcrypt from "bcryptjs";
import type { OnboardingDraftData } from "./validations";

const SALT_ROUNDS = 10;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createAccount(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    throw new Error("Email already registered");
  }
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      role: "PROVIDER",
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    },
  });
  await prisma.providerProfile.create({
    data: {
      userId: user.id,
      status: "PENDING",
    },
  });
  return user;
}

export async function saveOnboardingDraft(
  userId: string,
  data: Partial<OnboardingDraftData> & { stepData?: Record<string, unknown> }
) {
  const existing = await prisma.providerOnboardingDraft.findUnique({
    where: { userId },
  });
  const incomingStepData = data.stepData ?? data;
  const stepData = {
    ...(existing ? (existing.stepData as object) : {}),
    ...(typeof incomingStepData === "object" && !Array.isArray(incomingStepData) ? incomingStepData : {}),
  };
  const draft = await prisma.providerOnboardingDraft.upsert({
    where: { userId },
    create: {
      userId,
      providerType: (data.providerType as "DOCTOR" | "CLINIC") ?? "DOCTOR",
      currentStep: data.currentStep ?? 1,
      stepData: stepData as object,
    },
    update: {
      providerType: (data.providerType as "DOCTOR" | "CLINIC") ?? undefined,
      currentStep: data.currentStep,
      stepData: stepData as object,
    },
  });
  return draft;
}

export async function getOnboardingDraft(userId: string) {
  return prisma.providerOnboardingDraft.findUnique({
    where: { userId },
  });
}

export async function submitOnboarding(userId: string) {
  const draft = await prisma.providerOnboardingDraft.findUnique({
    where: { userId },
  });
  if (!draft) throw new Error("No draft found");
  const data = draft.stepData as Record<string, unknown>;
  const providerType = draft.providerType as "DOCTOR" | "CLINIC";

  const providerProfile = await prisma.providerProfile.findUnique({
    where: { userId },
    include: { user: true },
  });
  if (!providerProfile) throw new Error("Provider profile not found");

  if (providerType === "CLINIC") {
    const step4 = data.step4 as { name: string; city: string; country?: string; address?: string; phone?: string; website?: string; description?: string };
    const slug = `${slugify(step4.name)}-${Date.now().toString(36)}`;
    await prisma.clinic.create({
      data: {
        providerId: providerProfile.id,
        name: step4.name,
        slug,
        address: step4.address,
        city: step4.city,
        country: step4.country ?? "Egypt",
        phone: step4.phone,
        website: step4.website || undefined,
        description: step4.description,
        status: "PENDING",
      },
    });
  }

  const clinic = providerType === "CLINIC"
    ? await prisma.clinic.findFirst({ where: { providerId: providerProfile.id } })
    : null;

  const step3 = data.step3 as { firstName: string; lastName: string; bio?: string; yearsExperience?: number };
  const step5 = data.step5 as { procedureIds: string[]; specializationId?: string };
  const step6 = data.step6 as { priceRanges: { procedureId: string; minPrice: number; maxPrice: number; currency: string }[] };
  const step7 = data.step7 as { credentials: { type: string; fileKey: string; fileName: string }[] };
  const step8 = data.step8 as { images: { fileKey: string; fileName: string; sortOrder: number }[] } | undefined;

  const specializationId = step5?.specializationId ?? null;
  const procedures = step5?.procedureIds ?? [];
  const doctorSlug = `dr-${slugify(step3.firstName)}-${slugify(step3.lastName)}-${Date.now().toString(36)}`;

  const doctor = await prisma.doctor.create({
    data: {
      providerId: providerProfile.id,
      clinicId: clinic?.id,
      specializationId,
      firstName: step3.firstName,
      lastName: step3.lastName,
      slug: doctorSlug,
      bio: step3.bio,
      yearsExperience: (step3 as { yearsExperience?: number }).yearsExperience,
      status: "PENDING",
    },
  });

  for (const procId of procedures) {
    await prisma.doctorProcedure.create({
      data: { doctorId: doctor.id, procedureId: procId },
    });
  }

  for (const cred of step7?.credentials ?? []) {
    await prisma.credentialDocument.create({
      data: {
        doctorId: doctor.id,
        clinicId: clinic?.id,
        type: cred.type as "LICENSE" | "CERTIFICATION" | "DEGREE" | "INSURANCE" | "OTHER",
        fileKey: cred.fileKey,
        fileName: cred.fileName,
      },
    });
  }

  if (clinic && step8?.images?.length) {
    for (let i = 0; i < step8.images.length; i++) {
      const img = step8.images[i];
      await prisma.facilityImage.create({
        data: {
          clinicId: clinic.id,
          fileKey: img.fileKey,
          fileName: img.fileName,
          sortOrder: img.sortOrder ?? i,
        },
      });
    }
  }

  await prisma.providerOnboardingDraft.update({
    where: { userId },
    data: { submittedAt: new Date() },
  });

  return { success: true, doctorId: doctor.id, clinicId: clinic?.id };
}

export async function getProceduresForOnboarding() {
  return prisma.procedure.findMany({
    include: { specialization: true },
    orderBy: [{ specialization: { name: "asc" } }, { name: "asc" }],
  });
}

export async function getSpecializations() {
  return prisma.specialization.findMany({
    orderBy: { name: "asc" },
  });
}
