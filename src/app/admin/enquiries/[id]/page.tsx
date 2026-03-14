import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PackageBuilder } from "@/components/admin/PackageBuilder";
import { InquiryChat } from "@/components/shared/InquiryChat";
import {
  MapPin, Calendar, DollarSign, User, Stethoscope,
  Mail, Phone, MessageCircle, Send, HelpCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  MATCHED: "Matched",
  CONSULTATION_REQUESTED: "Consultation requested",
  PACKAGE_PREPARED: "Package prepared",
  CLOSED: "Closed",
};

const CONTACT_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="h-3.5 w-3.5" />,
  phone: <Phone className="h-3.5 w-3.5" />,
  whatsapp: <MessageCircle className="h-3.5 w-3.5" />,
  telegram: <Send className="h-3.5 w-3.5" />,
  other: <HelpCircle className="h-3.5 w-3.5" />,
};

export default async function AdminEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const { id } = await params;

  const enquiry = await prisma.inquiryCase.findUnique({
    where: { id },
    include: {
      patient: { include: { user: true } },
      procedure: true,
      specialization: true,
      preferredDoctor: true,
      medicalFiles: true,
      travelPackages: true,
    },
  });

  if (!enquiry) notFound();

  const patientName = `${enquiry.patient.user.firstName} ${enquiry.patient.user.lastName}`;
  const contactMethods: string[] = enquiry.preferredContactMethods
    ? JSON.parse(enquiry.preferredContactMethods)
    : [];
  const existingPackage = enquiry.travelPackages[0] ?? null;

  return (
    <div className="container max-w-4xl py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/admin/enquiries">← Back to enquiries</Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left — enquiry summary */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-bold text-xl">{patientName}</h1>
              <Badge>{STATUS_LABELS[enquiry.status] ?? enquiry.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{enquiry.patient.user.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submitted {new Date(enquiry.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>

          {/* Treatment */}
          <div className="rounded-lg border p-4 space-y-2 text-sm">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Treatment</h2>
            {enquiry.specialization && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Stethoscope className="h-4 w-4 shrink-0" />
                <span>{enquiry.specialization.name}</span>
              </div>
            )}
            {enquiry.procedure && (
              <div className="flex items-center gap-2">
                <span className="font-medium">{enquiry.procedure.name}</span>
              </div>
            )}
            {enquiry.preferredDoctor && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                <span>Preferred: Dr. {enquiry.preferredDoctor.firstName} {enquiry.preferredDoctor.lastName}</span>
              </div>
            )}
          </div>

          {/* Travel & budget */}
          <div className="rounded-lg border p-4 space-y-2 text-sm">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Travel & Budget</h2>
            {enquiry.patientCountry && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>From {enquiry.patientCountry}{enquiry.preferredCity ? ` · ${enquiry.preferredCity}` : ""}</span>
              </div>
            )}
            {enquiry.travelDateStart && enquiry.travelDateEnd && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>
                  {new Date(enquiry.travelDateStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {" → "}
                  {new Date(enquiry.travelDateEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            )}
            {(enquiry.budgetMin != null || enquiry.budgetMax != null) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4 shrink-0" />
                <span>${Number(enquiry.budgetMin ?? 0).toLocaleString()} – ${Number(enquiry.budgetMax ?? 0).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Contact */}
          {contactMethods.length > 0 && (
            <div className="rounded-lg border p-4 text-sm">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Contact</h2>
              <div className="flex flex-wrap gap-2">
                {contactMethods.map((method) => {
                  const detail =
                    method === "email" ? enquiry.contactEmail :
                    method === "phone" ? enquiry.contactPhone :
                    method === "whatsapp" ? enquiry.contactWhatsapp :
                    method === "telegram" ? enquiry.contactTelegram :
                    enquiry.contactOther;
                  return (
                    <span key={method} className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium">
                      {CONTACT_ICONS[method]}
                      {detail ?? method}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Case description */}
          {enquiry.caseDescription && (
            <div className="rounded-lg border p-4 text-sm">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Case Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{enquiry.caseDescription}</p>
            </div>
          )}
        </div>

        {/* Right — package builder + chat */}
        <div className="space-y-6">
          <PackageBuilder
            enquiryId={id}
            existing={existingPackage}
            specializationId={enquiry.specializationId}
            preselectedDoctorId={enquiry.preferredDoctorId}
          />
          <InquiryChat inquiryId={id} currentUserIsAdmin={true} />
        </div>
      </div>
    </div>
  );
}
