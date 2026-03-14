import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Seeding database...");

  // ============ SPECIALIZATIONS ============
  const dental = await prisma.specialization.upsert({
    where: { slug: "dental" },
    update: {},
    create: {
      name: "Dental",
      slug: "dental",
    },
  });

  const lasik = await prisma.specialization.upsert({
    where: { slug: "lasik" },
    update: {},
    create: {
      name: "LASIK",
      slug: "lasik",
    },
  });

  console.log("Created specializations: Dental, LASIK");

  // ============ PROCEDURES ============
  const dentalProcedures = [
    { name: "Dental Implants", slug: "dental-implants", description: "Full tooth replacement with titanium implants" },
    { name: "Veneers", slug: "veneers", description: "Thin porcelain shells for cosmetic teeth improvement" },
    { name: "Teeth Whitening", slug: "teeth-whitening", description: "Professional teeth whitening treatment" },
    { name: "Root Canal", slug: "root-canal", description: "Treatment for infected tooth pulp" },
    { name: "All-on-4 Dental Implants", slug: "all-on-4-implants", description: "Full arch restoration with four implants" },
  ];

  const lasikProcedures = [
    { name: "LASIK Surgery", slug: "lasik-surgery", description: "Laser vision correction for nearsightedness, farsightedness, and astigmatism" },
    { name: "PRK", slug: "prk", description: "Photorefractive keratectomy - surface laser vision correction" },
    { name: "SMILE", slug: "smile", description: "Minimally invasive laser vision correction" },
  ];

  for (const p of dentalProcedures) {
    await prisma.procedure.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...p,
        specializationId: dental.id,
      },
    });
  }

  for (const p of lasikProcedures) {
    await prisma.procedure.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...p,
        specializationId: lasik.id,
      },
    });
  }

  console.log("Created procedures");

  // ============ USERS ============
  const adminPassword = await hashPassword("admin123");
  const providerPassword = await hashPassword("provider123");
  const patientPassword = await hashPassword("patient123");

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@curavia.com" },
    update: {},
    create: {
      email: "admin@curavia.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      firstName: "Admin",
      lastName: "User",
      phone: "+201000000001",
    },
  });

  const providerUser1 = await prisma.user.upsert({
    where: { email: "clinic1@curavia.com" },
    update: {},
    create: {
      email: "clinic1@curavia.com",
      passwordHash: providerPassword,
      role: "PROVIDER",
      firstName: "Ahmed",
      lastName: "Hassan",
      phone: "+201000000002",
    },
  });

  const providerUser2 = await prisma.user.upsert({
    where: { email: "clinic2@curavia.com" },
    update: {},
    create: {
      email: "clinic2@curavia.com",
      passwordHash: providerPassword,
      role: "PROVIDER",
      firstName: "Sara",
      lastName: "Mohamed",
      phone: "+201000000003",
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: "patient@curavia.com" },
    update: {},
    create: {
      email: "patient@curavia.com",
      passwordHash: patientPassword,
      role: "PATIENT",
      firstName: "John",
      lastName: "Smith",
      phone: "+1234567890",
    },
  });

  console.log("Created users");

  // ============ PROVIDER PROFILES & CLINICS ============
  const providerProfile1 = await prisma.providerProfile.upsert({
    where: { userId: providerUser1.id },
    update: {},
    create: {
      userId: providerUser1.id,
      status: "APPROVED",
    },
  });

  const providerProfile2 = await prisma.providerProfile.upsert({
    where: { userId: providerUser2.id },
    update: {},
    create: {
      userId: providerUser2.id,
      status: "APPROVED",
    },
  });

  const clinic1 = await prisma.clinic.upsert({
    where: { slug: "cairo-dental-center" },
    update: {},
    create: {
      providerId: providerProfile1.id,
      name: "Cairo Dental Center",
      slug: "cairo-dental-center",
      address: "123 Nile Street, Downtown",
      city: "Cairo",
      country: "Egypt",
      phone: "+20212345678",
      website: "https://cairodental.example.com",
      description: "Premium dental clinic specializing in implants and cosmetic dentistry. Serving international patients for over 15 years.",
      status: "APPROVED",
      approvedAt: new Date(),
      approvedById: adminUser.id,
    },
  });

  const clinic2 = await prisma.clinic.upsert({
    where: { slug: "vision-care-egypt" },
    update: {},
    create: {
      providerId: providerProfile2.id,
      name: "Vision Care Egypt",
      slug: "vision-care-egypt",
      address: "45 Heliopolis Square",
      city: "Cairo",
      country: "Egypt",
      phone: "+20223456789",
      website: "https://visioncare-egypt.example.com",
      description: "Leading LASIK and refractive surgery center with state-of-the-art technology. FDA-approved equipment.",
      status: "APPROVED",
      approvedAt: new Date(),
      approvedById: adminUser.id,
    },
  });

  console.log("Created clinics");

  // ============ DOCTORS ============
  const procedures = await prisma.procedure.findMany();
  const dentalImplantProc = procedures.find((p) => p.slug === "dental-implants")!;
  const veneersProc = procedures.find((p) => p.slug === "veneers")!;
  const lasikProc = procedures.find((p) => p.slug === "lasik-surgery")!;
  const smileProc = procedures.find((p) => p.slug === "smile")!;

  const doctor1 = await prisma.doctor.upsert({
    where: { slug: "dr-omar-elsayed" },
    update: {},
    create: {
      providerId: providerProfile1.id,
      clinicId: clinic1.id,
      specializationId: dental.id,
      firstName: "Omar",
      lastName: "Elsayed",
      slug: "dr-omar-elsayed",
      bio: "Board-certified dentist with 12 years of experience in dental implants and cosmetic dentistry. Trained in Germany.",
      yearsExperience: 12,
      licenseNumber: "EG-DENT-001",
      status: "APPROVED",
      approvedAt: new Date(),
      approvedById: adminUser.id,
    },
  });

  const doctor2 = await prisma.doctor.upsert({
    where: { slug: "dr-nour-ibrahim" },
    update: {},
    create: {
      providerId: providerProfile1.id,
      clinicId: clinic1.id,
      specializationId: dental.id,
      firstName: "Nour",
      lastName: "Ibrahim",
      slug: "dr-nour-ibrahim",
      bio: "Specialist in veneers and smile design. Member of the Egyptian Dental Association.",
      yearsExperience: 8,
      licenseNumber: "EG-DENT-002",
      status: "APPROVED",
      approvedAt: new Date(),
      approvedById: adminUser.id,
    },
  });

  const doctor3 = await prisma.doctor.upsert({
    where: { slug: "dr-wail-mesallam" },
    update: {},
    create: {
      providerId: providerProfile2.id,
      clinicId: clinic2.id,
      specializationId: lasik.id,
      firstName: "Wail",
      lastName: "Mesallam",
      slug: "dr-wail-mesallam",
      bio: "Ophthalmologist specializing in refractive surgery. Performed over 5,000 LASIK procedures. Trained in the USA.",
      yearsExperience: 15,
      licenseNumber: "EG-OPH-001",
      status: "APPROVED",
      approvedAt: new Date(),
      approvedById: adminUser.id,
    },
  });

  // Link doctors to procedures
  await prisma.doctorProcedure.upsert({
    where: {
      doctorId_procedureId: { doctorId: doctor1.id, procedureId: dentalImplantProc.id },
    },
    update: {},
    create: { doctorId: doctor1.id, procedureId: dentalImplantProc.id },
  });
  await prisma.doctorProcedure.upsert({
    where: {
      doctorId_procedureId: { doctorId: doctor1.id, procedureId: veneersProc.id },
    },
    update: {},
    create: { doctorId: doctor1.id, procedureId: veneersProc.id },
  });
  await prisma.doctorProcedure.upsert({
    where: {
      doctorId_procedureId: { doctorId: doctor2.id, procedureId: veneersProc.id },
    },
    update: {},
    create: { doctorId: doctor2.id, procedureId: veneersProc.id },
  });
  await prisma.doctorProcedure.upsert({
    where: {
      doctorId_procedureId: { doctorId: doctor3.id, procedureId: lasikProc.id },
    },
    update: {},
    create: { doctorId: doctor3.id, procedureId: lasikProc.id },
  });
  await prisma.doctorProcedure.upsert({
    where: {
      doctorId_procedureId: { doctorId: doctor3.id, procedureId: smileProc.id },
    },
    update: {},
    create: { doctorId: doctor3.id, procedureId: smileProc.id },
  });

  console.log("Created doctors and procedure links");

  // ============ PATIENT PROFILE ============
  const patientProfile = await prisma.patientProfile.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      bio: "Medical tourist from the US seeking dental care.",
      country: "United States",
    },
  });

  // ============ INQUIRY CASE (for reviews) ============
  const inquiryCase = await prisma.inquiryCase.create({
    data: {
      patientId: patientProfile.id,
      procedureId: dentalImplantProc.id,
      message: "Interested in dental implants, looking for a consultation.",
      status: "CLOSED",
    },
  });

  // ============ REVIEWS ============
  await prisma.review.create({
    data: {
      patientId: patientProfile.id,
      doctorId: doctor1.id,
      inquiryCaseId: inquiryCase.id,
      overall: 5,
      professionalism: 5,
      communication: 5,
      cleanliness: 5,
      outcome: 5,
      comment: "Excellent experience! Dr. Omar was professional and the clinic was top-notch. Highly recommend for dental implants.",
      verifiedPatient: true,
      status: "APPROVED",
    },
  });

  await prisma.review.create({
    data: {
      patientId: patientProfile.id,
      clinicId: clinic1.id,
      inquiryCaseId: inquiryCase.id,
      overall: 5,
      professionalism: 5,
      communication: 5,
      cleanliness: 5,
      outcome: 5,
      comment: "Cairo Dental Center exceeded my expectations. Clean facilities and friendly staff.",
      verifiedPatient: true,
      status: "APPROVED",
    },
  });

  await prisma.review.create({
    data: {
      patientId: patientProfile.id,
      doctorId: doctor3.id,
      overall: 4,
      professionalism: 4,
      communication: 5,
      cleanliness: 5,
      outcome: 4,
      comment: "Great LASIK results. Vision improved significantly. Would recommend Vision Care Egypt.",
      verifiedPatient: false,
      status: "APPROVED",
    },
  });

  console.log("Created reviews");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
