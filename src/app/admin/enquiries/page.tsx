import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnquiryStatusSelect } from "@/components/admin/EnquiryStatusSelect";
import Link from "next/link";
import {
  Mail, Phone, MessageCircle, Send, HelpCircle,
  Calendar, MapPin, DollarSign, User, Stethoscope, FileText, Package,
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

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SUBMITTED: "secondary",
  UNDER_REVIEW: "default",
  MATCHED: "default",
  CONSULTATION_REQUESTED: "default",
  PACKAGE_PREPARED: "default",
  CLOSED: "outline",
};

const CONTACT_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="h-3.5 w-3.5" />,
  phone: <Phone className="h-3.5 w-3.5" />,
  whatsapp: <MessageCircle className="h-3.5 w-3.5" />,
  telegram: <Send className="h-3.5 w-3.5" />,
  other: <HelpCircle className="h-3.5 w-3.5" />,
};

export default async function AdminEnquiriesPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const cases = await prisma.inquiryCase.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      patient: { include: { user: true } },
      procedure: true,
      specialization: true,
      preferredDoctor: true,
      medicalFiles: true,
      travelPackages: true,
    },
  });

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-bold text-2xl">Enquiries</h1>
          <p className="text-muted-foreground mt-1">
            All patient enquiry cases — {cases.length} total
          </p>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="rounded-lg border p-16 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No enquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => {
            const patientName = `${c.patient.user.firstName} ${c.patient.user.lastName}`;
            const contactMethods: string[] = c.preferredContactMethods
              ? JSON.parse(c.preferredContactMethods)
              : [];

            return (
              <div key={c.id} className="rounded-lg border bg-card p-5">
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{patientName}</span>
                      <span className="text-muted-foreground text-sm">{c.patient.user.email}</span>
                      <Badge variant={STATUS_VARIANTS[c.status] ?? "outline"}>
                        {STATUS_LABELS[c.status] ?? c.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted {new Date(c.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/enquiries/${c.id}`}>
                      <Button size="sm" variant={c.travelPackages.length > 0 ? "default" : "outline"} className="gap-1.5">
                        <Package className="h-3.5 w-3.5" />
                        {c.travelPackages.length > 0 ? "View Package" : "Build Package"}
                      </Button>
                    </Link>
                    <EnquiryStatusSelect caseId={c.id} currentStatus={c.status} />
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm mb-4">
                  {c.specialization && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Stethoscope className="h-4 w-4 shrink-0" />
                      <span>{c.specialization.name}</span>
                    </div>
                  )}
                  {c.procedure && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4 shrink-0" />
                      <span>{c.procedure.name}</span>
                    </div>
                  )}
                  {c.preferredDoctor && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4 shrink-0" />
                      <span>Preferred: Dr. {c.preferredDoctor.firstName} {c.preferredDoctor.lastName}</span>
                    </div>
                  )}
                  {c.patientCountry && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>From {c.patientCountry}{c.preferredCity ? ` · ${c.preferredCity}` : ""}</span>
                    </div>
                  )}
                  {(c.budgetMin != null || c.budgetMax != null) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4 shrink-0" />
                      <span>${Number(c.budgetMin ?? 0).toLocaleString()} – ${Number(c.budgetMax ?? 0).toLocaleString()}</span>
                    </div>
                  )}
                  {c.travelDateStart && c.travelDateEnd && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>
                        {new Date(c.travelDateStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" → "}
                        {new Date(c.travelDateEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Contact methods */}
                {contactMethods.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Contact via</p>
                    <div className="flex flex-wrap gap-2">
                      {contactMethods.map((method) => {
                        const detail =
                          method === "email" ? c.contactEmail :
                          method === "phone" ? c.contactPhone :
                          method === "whatsapp" ? c.contactWhatsapp :
                          method === "telegram" ? c.contactTelegram :
                          c.contactOther;
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
                {c.caseDescription && (
                  <div className="rounded-md bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1 text-xs uppercase tracking-wider">Case description</p>
                    <p className="leading-relaxed whitespace-pre-wrap">{c.caseDescription}</p>
                  </div>
                )}

                {/* Attached files */}
                {c.medicalFiles.length > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    {c.medicalFiles.length} attached file{c.medicalFiles.length > 1 ? "s" : ""}:&nbsp;
                    {c.medicalFiles.map((f) => f.fileName).join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
