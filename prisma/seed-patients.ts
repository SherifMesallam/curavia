/**
 * Seed additional patients and reviews.
 * Run: npx tsx prisma/seed-patients.ts
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PATIENTS = [
  { firstName: "Emma", lastName: "Thompson", email: "emma.thompson@example.com", country: "United Kingdom", phone: "+447700900001", bio: "Looking for affordable dental care while travelling." },
  { firstName: "Liam", lastName: "Johnson", email: "liam.johnson@example.com", country: "United States", phone: "+12025550001", bio: "Interested in LASIK after years of wearing glasses." },
  { firstName: "Sophie", lastName: "Martin", email: "sophie.martin@example.com", country: "France", phone: "+33612345601", bio: "Seeking porcelain veneers for my wedding." },
  { firstName: "Carlos", lastName: "García", email: "carlos.garcia@example.com", country: "Spain", phone: "+34612345601", bio: "Considering dental implants recommended by my dentist." },
  { firstName: "Amira", lastName: "Al-Sayed", email: "amira.alsayed@example.com", country: "Saudi Arabia", phone: "+966501234561", bio: "Exploring dental tourism options in Egypt." },
  { firstName: "James", lastName: "Wilson", email: "james.wilson@example.com", country: "Australia", phone: "+61412345601", bio: "Budgeting for All-on-4 implants." },
  { firstName: "Natalie", lastName: "Dubois", email: "natalie.dubois@example.com", country: "Canada", phone: "+14165550001", bio: "Had PRK years ago, considering SMILE now." },
  { firstName: "Yusuf", lastName: "Ahmed", email: "yusuf.ahmed@example.com", country: "UAE", phone: "+971501234561", bio: "Looking for a reputable LASIK surgeon." },
  { firstName: "Ingrid", lastName: "Hansen", email: "ingrid.hansen@example.com", country: "Norway", phone: "+4791234561", bio: "Root canal treatment needed urgently." },
  { firstName: "Priya", lastName: "Sharma", email: "priya.sharma@example.com", country: "India", phone: "+919812345601", bio: "Teeth whitening and veneers consultation." },
  { firstName: "Michael", lastName: "Brown", email: "michael.brown@example.com", country: "United States", phone: "+12025550002", bio: "Looking for a second opinion on dental implants." },
  { firstName: "Fatima", lastName: "Zahra", email: "fatima.zahra@example.com", country: "Morocco", phone: "+212612345601", bio: "Family dental tourism trip to Egypt." },
  { firstName: "Alessandro", lastName: "Rossi", email: "alessandro.rossi@example.com", country: "Italy", phone: "+39312345601", bio: "Smile makeover before a major event." },
  { firstName: "Hana", lastName: "Kim", email: "hana.kim@example.com", country: "South Korea", phone: "+821012345601", bio: "Interested in combining tourism and dental treatment." },
  { firstName: "Oliver", lastName: "Müller", email: "oliver.muller@example.com", country: "Germany", phone: "+4915912345601", bio: "Evaluating LASIK versus PRK options." },
  { firstName: "Leila", lastName: "Mansouri", email: "leila.mansouri@example.com", country: "Iran", phone: "+989121234561", bio: "Dental implants after an accident." },
  { firstName: "Chloe", lastName: "Patel", email: "chloe.patel@example.com", country: "United Kingdom", phone: "+447700900002", bio: "Looking for orthodontic and cosmetic work." },
  { firstName: "Diego", lastName: "Hernandez", email: "diego.hernandez@example.com", country: "Mexico", phone: "+525512345601", bio: "LASIK consultation after myopia worsened." },
  { firstName: "Aisha", lastName: "Bello", email: "aisha.bello@example.com", country: "Nigeria", phone: "+2348012345601", bio: "Seeking quality dental care at reasonable prices." },
  { firstName: "Tariq", lastName: "Hassan", email: "tariq.hassan@example.com", country: "Jordan", phone: "+962791234561", bio: "Considering full mouth reconstruction." },
];

const DOCTOR_REVIEWS: {
  doctorSlug: string;
  reviews: Array<{
    patientIdx: number;
    overall: number;
    professionalism: number;
    communication: number;
    cleanliness: number;
    outcome: number;
    comment: string;
    verified: boolean;
  }>;
}[] = [
  {
    doctorSlug: "dr-omar-elsayed",
    reviews: [
      { patientIdx: 0, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "Dr. Omar was exceptional — my implants feel completely natural. The whole team made me feel at ease throughout the process.", verified: true },
      { patientIdx: 1, overall: 5, professionalism: 5, communication: 4, cleanliness: 5, outcome: 5, comment: "Outstanding results. Flying from the US was absolutely worth it. Dr. Elsayed answered all my questions patiently.", verified: true },
      { patientIdx: 2, overall: 4, professionalism: 5, communication: 4, cleanliness: 4, outcome: 4, comment: "Very professional clinic. My veneers look beautiful and the price was a fraction of what I'd pay back home.", verified: true },
      { patientIdx: 3, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "The best dental experience I've ever had. Dr. Omar explained each step clearly and the results exceeded my expectations.", verified: false },
      { patientIdx: 5, overall: 4, professionalism: 4, communication: 5, cleanliness: 5, outcome: 4, comment: "Happy with my All-on-4 result. The procedure took two visits but Dr. Omar kept me informed every step of the way.", verified: true },
      { patientIdx: 6, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "Incredible skill and warm bedside manner. I had a lot of anxiety about implants but he made it completely comfortable.", verified: true },
      { patientIdx: 8, overall: 3, professionalism: 4, communication: 3, cleanliness: 5, outcome: 3, comment: "Good overall, waiting times could be improved. The root canal was painless though.", verified: false },
      { patientIdx: 10, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "Second to none. I compared prices across five countries and Egypt with Dr. Omar gave me the best value by far.", verified: true },
      { patientIdx: 12, overall: 4, professionalism: 4, communication: 4, cleanliness: 4, outcome: 5, comment: "Excellent smile makeover! My friends can't believe the transformation. Would recommend without hesitation.", verified: true },
      { patientIdx: 15, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "Post-accident reconstruction was handled perfectly. Dr. Omar restored my confidence along with my smile.", verified: true },
      { patientIdx: 17, overall: 4, professionalism: 5, communication: 4, cleanliness: 5, outcome: 4, comment: "Professional and efficient. Clinic is spotlessly clean. Very good value.", verified: false },
      { patientIdx: 19, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "Full mouth reconstruction was done beautifully. Worth every penny.", verified: true },
    ],
  },
  {
    doctorSlug: "dr-nour-ibrahim",
    reviews: [
      { patientIdx: 2, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "Dr. Nour has an artistic eye. My veneers for the wedding were perfect — everyone commented on my smile.", verified: true },
      { patientIdx: 4, overall: 5, professionalism: 5, communication: 5, cleanliness: 4, outcome: 5, comment: "Wonderful doctor, very gentle and precise. My smile design consultation was thorough and she listened to exactly what I wanted.", verified: true },
      { patientIdx: 9, overall: 4, professionalism: 4, communication: 5, cleanliness: 4, outcome: 4, comment: "Happy with the teeth whitening results. Dr. Nour gave great aftercare advice.", verified: false },
      { patientIdx: 11, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "We came as a family and Dr. Nour treated everyone with such care. Highly recommend for cosmetic work.", verified: true },
      { patientIdx: 13, overall: 4, professionalism: 4, communication: 4, cleanliness: 5, outcome: 5, comment: "Good experience. The clinic is modern and the results are natural-looking.", verified: true },
      { patientIdx: 16, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "Dr. Nour transformed my smile completely. I feel so much more confident. The process was smooth from start to finish.", verified: true },
      { patientIdx: 18, overall: 4, professionalism: 4, communication: 4, cleanliness: 4, outcome: 4, comment: "Solid work, good communication. Would visit again for future cosmetic treatments.", verified: false },
      { patientIdx: 0, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "Second visit with Dr. Nour and she remembered everything about my case. Truly personalised care.", verified: true },
      { patientIdx: 3, overall: 3, professionalism: 3, communication: 4, cleanliness: 5, outcome: 3, comment: "Decent results but had to wait a bit longer than expected. Clinic itself is immaculate.", verified: false },
    ],
  },
  {
    doctorSlug: "dr-wail-mesallam",
    reviews: [
      { patientIdx: 1, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "My LASIK was life-changing. Dr. Karim explained every step and the procedure itself was over in minutes. 20/20 vision now!", verified: true },
      { patientIdx: 6, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "After 20 years of glasses, I can finally see clearly. Dr. Fathy's expertise is evident from the first consultation.", verified: true },
      { patientIdx: 7, overall: 4, professionalism: 5, communication: 4, cleanliness: 5, outcome: 4, comment: "Very experienced surgeon. Some minor dry-eye symptoms post-op but Dr. Karim followed up and managed it well.", verified: true },
      { patientIdx: 14, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "Evaluated LASIK vs PRK thoroughly — ended up with PRK and am thrilled with the outcome. Transparent doctor.", verified: false },
      { patientIdx: 5, overall: 4, professionalism: 4, communication: 4, cleanliness: 5, outcome: 5, comment: "SMILE procedure was smooth and recovery was quick. Clinic has top-of-the-line equipment.", verified: true },
      { patientIdx: 9, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "Amazing experience. Saved over £3,000 compared to UK prices and got world-class care. Dr. Karim is a true professional.", verified: true },
      { patientIdx: 17, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "Had LASIK two years ago with Dr. Karim — still perfect vision. Highly recommend Vision Care Egypt.", verified: true },
      { patientIdx: 4, overall: 3, professionalism: 3, communication: 3, cleanliness: 5, outcome: 4, comment: "Outcomes were good but communication could be improved. Results are satisfying though.", verified: false },
      { patientIdx: 11, overall: 4, professionalism: 5, communication: 4, cleanliness: 4, outcome: 4, comment: "Smooth process, professional team. Minor improvements needed in post-op communication but overall a great experience.", verified: true },
      { patientIdx: 13, overall: 5, professionalism: 5, communication: 5, cleanliness: 5, outcome: 5, comment: "Flew from Korea specifically for this procedure. Dr. Karim and his team accommodated my schedule perfectly.", verified: true },
    ],
  },
];

async function main() {
  console.log("Seeding patients and reviews...");

  const passwordHash = await bcrypt.hash("patient123", 10);

  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminUser) throw new Error("No admin user found — run the main seed first.");

  // Create patient users & profiles
  const patientProfiles: { id: string }[] = [];

  for (const p of PATIENTS) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        passwordHash,
        role: "PATIENT",
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone,
      },
    });

    const profile = await prisma.patientProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: p.bio,
        country: p.country,
      },
    });

    patientProfiles.push({ id: profile.id });
  }

  console.log(`Created ${PATIENTS.length} patients`);

  // Fetch doctors
  const doctors = await prisma.doctor.findMany({ select: { id: true, slug: true } });
  const doctorsBySlug = Object.fromEntries(doctors.map((d) => [d.slug, d.id]));

  // Fetch procedures for inquiry creation
  const procedures = await prisma.procedure.findMany({ select: { id: true, slug: true } });
  const dentalImplantsId = procedures.find((p) => p.slug === "dental-implants")!.id;
  const lasikId = procedures.find((p) => p.slug === "lasik-surgery")!.id;
  const veneersId = procedures.find((p) => p.slug === "veneers")!.id;

  const procedureByPatientIdx: Record<number, string> = {
    0: veneersId, 1: lasikId, 2: veneersId, 3: dentalImplantsId, 4: dentalImplantsId,
    5: dentalImplantsId, 6: lasikId, 7: lasikId, 8: dentalImplantsId, 9: veneersId,
    10: dentalImplantsId, 11: dentalImplantsId, 12: veneersId, 13: veneersId,
    14: lasikId, 15: dentalImplantsId, 16: veneersId, 17: lasikId,
    18: dentalImplantsId, 19: dentalImplantsId,
  };

  // Create one closed inquiry per patient (needed as FK for reviews)
  const inquiryByPatientIdx: Record<number, string> = {};
  for (let i = 0; i < patientProfiles.length; i++) {
    const inquiry = await prisma.inquiryCase.create({
      data: {
        patientId: patientProfiles[i].id,
        procedureId: procedureByPatientIdx[i] ?? dentalImplantsId,
        message: "Inquiry created by seed.",
        status: "CLOSED",
        consentAgreed: true,
      },
    });
    inquiryByPatientIdx[i] = inquiry.id;
  }

  console.log("Created inquiry cases for each patient");

  // Create reviews
  let reviewCount = 0;
  for (const { doctorSlug, reviews } of DOCTOR_REVIEWS) {
    const doctorId = doctorsBySlug[doctorSlug];
    if (!doctorId) {
      console.warn(`Doctor not found: ${doctorSlug}`);
      continue;
    }

    for (const r of reviews) {
      const profile = patientProfiles[r.patientIdx];
      if (!profile) continue;

      // Check duplicate
      const existing = await prisma.review.findFirst({
        where: { patientId: profile.id, doctorId },
      });
      if (existing) continue;

      await prisma.review.create({
        data: {
          patientId: profile.id,
          doctorId,
          inquiryCaseId: inquiryByPatientIdx[r.patientIdx],
          overall: r.overall,
          professionalism: r.professionalism,
          communication: r.communication,
          cleanliness: r.cleanliness,
          outcome: r.outcome,
          comment: r.comment,
          verifiedPatient: r.verified,
          status: "APPROVED",
        },
      });
      reviewCount++;
    }
  }

  console.log(`Created ${reviewCount} reviews`);
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
