import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Calendar,
  PlusCircle,
  Clock,
  CheckCircle2,
  Search,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  MATCHED: "Matched",
  CONSULTATION_REQUESTED: "Consultation requested",
  PACKAGE_PREPARED: "Package prepared",
  CLOSED: "Closed",
};

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  MATCHED: "bg-teal-50 text-teal-700 border-teal-200",
  CONSULTATION_REQUESTED: "bg-purple-50 text-purple-700 border-purple-200",
  PACKAGE_PREPARED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-gray-50 text-gray-600 border-gray-200",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  SUBMITTED: <Clock className="h-3.5 w-3.5" />,
  UNDER_REVIEW: <Search className="h-3.5 w-3.5" />,
  MATCHED: <CheckCircle2 className="h-3.5 w-3.5" />,
  CONSULTATION_REQUESTED: <MessageSquare className="h-3.5 w-3.5" />,
  PACKAGE_PREPARED: <CheckCircle2 className="h-3.5 w-3.5" />,
  CLOSED: <CheckCircle2 className="h-3.5 w-3.5" />,
};

export default async function PatientDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: session.id },
  });

  if (!patientProfile) {
    return (
      <div className="container py-10">
        <p className="text-muted-foreground">Patient profile not found.</p>
      </div>
    );
  }

  const [inquiries, consultations] = await Promise.all([
    prisma.inquiryCase.findMany({
      where: { patientId: patientProfile.id },
      include: {
        procedure: true,
        specialization: true,
        _count: { select: { medicalFiles: true, consultationRequests: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.consultationRequest.findMany({
      where: {
        inquiryCase: { patientId: patientProfile.id },
        status: { in: ["CONFIRMED", "PENDING_CONFIRMATION"] },
      },
      include: {
        doctor: { include: { clinic: true } },
        inquiryCase: { include: { procedure: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const activeCount = inquiries.filter((i) => i.status !== "CLOSED").length;
  const closedCount = inquiries.filter((i) => i.status === "CLOSED").length;
  const fileCount = inquiries.reduce((sum, i) => sum + i._count.medicalFiles, 0);

  const firstName = user?.firstName ?? "there";

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero strip */}
      <div className="bg-gradient-to-r from-teal-900 to-teal-700 px-6 py-10 text-white">
        <div className="container">
          <p className="text-teal-200 text-sm mb-1">Welcome back</p>
          <h1 className="font-bold text-3xl">{firstName}</h1>
          <p className="text-teal-100/80 mt-1 text-sm">
            Here&apos;s an overview of your care journey.
          </p>
        </div>
      </div>

      <div className="container py-8 space-y-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active cases", value: activeCount, icon: <FileText className="h-5 w-5 text-teal-600" /> },
            { label: "Consultations", value: consultations.length, icon: <Calendar className="h-5 w-5 text-purple-600" /> },
            { label: "Closed cases", value: closedCount, icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" /> },
            { label: "Files uploaded", value: fileCount, icon: <FileText className="h-5 w-5 text-blue-600" /> },
          ].map((stat) => (
            <Card key={stat.label} className="border bg-background shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-muted p-2">{stat.icon}</div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* Cases list — 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">My cases</h2>
              <Button size="sm" asChild>
                <Link href="/patient/inquiries/new">
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  New inquiry
                </Link>
              </Button>
            </div>

            {inquiries.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="font-medium">No inquiries yet</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-6">
                    Submit your first case and we&apos;ll match you with the right specialist.
                  </p>
                  <Button asChild>
                    <Link href="/patient/inquiries/new">Submit a case</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inquiry) => (
                  <Link key={inquiry.id} href={`/patient/inquiries/${inquiry.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">
                              {inquiry.procedure?.name ?? inquiry.specialization?.name ?? "Medical inquiry"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Submitted {new Date(inquiry.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                              {inquiry._count.medicalFiles > 0 && ` · ${inquiry._count.medicalFiles} file${inquiry._count.medicalFiles !== 1 ? "s" : ""}`}
                              {inquiry._count.consultationRequests > 0 && ` · ${inquiry._count.consultationRequests} consultation${inquiry._count.consultationRequests !== 1 ? "s" : ""}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[inquiry.status] ?? "bg-gray-50 text-gray-600"}`}>
                              {STATUS_ICONS[inquiry.status]}
                              {STATUS_LABELS[inquiry.status] ?? inquiry.status}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar — 1/3 width */}
          <div className="space-y-6">

            {/* Upcoming consultations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-lg">Upcoming</h2>
                <Link href="/patient/consultations" className="text-xs text-teal-600 hover:underline">
                  View all
                </Link>
              </div>
              {consultations.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No upcoming consultations</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {consultations.map((c) => (
                    <Card key={c.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <p className="font-medium text-sm">
                          Dr. {c.doctor.firstName} {c.doctor.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {c.doctor.clinic?.name ?? "Clinic"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {c.inquiryCase.procedure?.name ?? "Consultation"}
                        </p>
                        <span className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                          c.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {c.status === "CONFIRMED" ? "Confirmed" : "Awaiting confirmation"}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div>
              <h2 className="font-semibold text-lg mb-3">Quick actions</h2>
              <div className="space-y-2">
                {[
                  { label: "Submit new inquiry", href: "/patient/inquiries/new", icon: <PlusCircle className="h-4 w-4" /> },
                  { label: "View consultations", href: "/patient/consultations", icon: <Calendar className="h-4 w-4" /> },
                  { label: "Browse doctors", href: "/doctors", icon: <Search className="h-4 w-4" /> },
                  { label: "Edit profile", href: "/patient/profile", icon: <FileText className="h-4 w-4" /> },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-teal-600">{action.icon}</span>
                    {action.label}
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
