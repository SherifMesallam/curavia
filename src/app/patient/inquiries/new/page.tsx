"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  step1Schema, step2Schema, step3Schema, step4Schema, step5Schema,
  CONTACT_METHODS,
  type Step1Data, type Step2Data, type Step3Data, type Step4Data, type Step5Data,
  type ContactMethod,
} from "@/lib/modules/inquiry/validations";
import { uploadInquiryFile } from "@/lib/modules/inquiry/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, ChevronRight, ChevronLeft, UserCheck } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type Specialization = { id: string; name: string; slug: string };
type Procedure = { id: string; name: string; specializationId: string };

const METHOD_LABELS: Record<ContactMethod, string> = {
  email: "Email",
  phone: "Phone call",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  other: "Other",
};

const STEPS = [
  { number: 1, label: "Treatment" },
  { number: 2, label: "About you" },
  { number: 3, label: "Travel" },
  { number: 4, label: "Your case" },
  { number: 5, label: "Contact" },
  { number: 6, label: "Review" },
];

// ── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((s) => (
          <div key={s.number} className="flex flex-col items-center flex-1">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              step > s.number
                ? "bg-teal-600 border-teal-600 text-white"
                : step === s.number
                ? "border-teal-600 text-teal-700 bg-teal-50"
                : "border-muted text-muted-foreground bg-background"
            }`}>
              {step > s.number ? "✓" : s.number}
            </div>
            <span className={`mt-1 text-[10px] font-medium hidden sm:block ${
              step >= s.number ? "text-teal-700" : "text-muted-foreground"
            }`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-teal-600 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ── Shell ────────────────────────────────────────────────────────────────────

function StepShell({
  title, subtitle, children, step,
  onBack, onNext, nextLabel = "Continue", nextDisabled = false,
}: {
  title: string; subtitle?: string; children: React.ReactNode; step: number;
  onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean;
}) {
  return (
    <div>
      <ProgressBar step={step} />
      <div className="mb-6">
        <h2 className="font-bold text-xl">{title}</h2>
        {subtitle && <p className="mt-1 text-muted-foreground text-sm">{subtitle}</p>}
      </div>
      <div className="space-y-5">{children}</div>
      <div className="mt-8 flex gap-3">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        )}
        {onNext && (
          <Button type="button" className="flex-1" onClick={onNext} disabled={nextDisabled}>
            {nextLabel} <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Main wizard ──────────────────────────────────────────────────────────────

export default function NewInquiryPage() {
  const searchParams = useSearchParams();
  const preDoctor = searchParams.get("doctorId")
    ? {
        id: searchParams.get("doctorId")!,
        name: searchParams.get("doctorName") ?? "Selected doctor",
      }
    : null;
  const preSpecializationId = searchParams.get("specializationId") ?? "";
  const preProcedureId = searchParams.get("procedureId") ?? "";

  const [step, setStep] = useState(1);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  // Collected data across steps — pre-seed Step 1 from URL params if present
  const [data1, setData1] = useState<Step1Data | null>(
    preSpecializationId ? { specializationId: preSpecializationId, procedureId: preProcedureId } : null
  );
  const [data2, setData2] = useState<Step2Data | null>(null);
  const [data3, setData3] = useState<Step3Data | null>(null);
  const [data4, setData4] = useState<Step4Data | null>(null);
  const [data5, setData5] = useState<Step5Data | null>(null);

  useEffect(() => {
    fetch("/api/onboarding/procedures")
      .then((r) => r.json())
      .then(({ procedures: p, specializations: s }) => {
        setSpecializations(s ?? []);
        setProcedures(p ?? []);
      });
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(({ user }) => { if (user?.email) setUserEmail(user.email); })
      .catch(() => {});
  }, []);

  const specName = specializations.find((s) => s.id === data1?.specializationId)?.name;
  const procName = procedures.find((p) => p.id === data1?.procedureId)?.name;

  // ── Submit ──
  const handleSubmit = async () => {
    if (!data1 || !data2 || !data3 || !data4 || !data5) return;
    setSubmitting(true);
    try {
      const payload = {
        ...data1, ...data2, ...data3, ...data4, ...data5,
        consentAgreed: true,
        medicalFiles: [],
        ...(preDoctor ? { preferredDoctorId: preDoctor.id } : {}),
      };
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Submission failed");
      const caseId = json.inquiry?.id;
      if (caseId && pendingFiles.length > 0) {
        for (const file of pendingFiles) {
          const { key } = await uploadInquiryFile(file, caseId);
          await fetch(`/api/inquiries/${caseId}/files`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileKey: key, fileName: file.name }),
          });
        }
      }
      setSubmitted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──
  if (submitted) {
    return (
      <div className="container max-w-lg py-24 text-center">
        <CheckCircle className="h-16 w-16 text-teal-600 mx-auto mb-6" />
        <h1 className="font-bold text-2xl mb-3">Inquiry submitted!</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          A member of our team will contact you as soon as possible via your preferred method
          {data5 && ` (${data5.preferredContactMethods.map((m) => METHOD_LABELS[m]).join(", ")})`}.
        </p>
        <div className="mt-8">
          <Button asChild>
            <a href="/patient/dashboard">Go to dashboard</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-xl py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-1">New inquiry</p>
      <h1 className="font-bold text-2xl mb-4">Tell us about your case</h1>

      {/* Doctor context banner */}
      {preDoctor && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3">
          <UserCheck className="h-5 w-5 shrink-0 text-teal-600" />
          <div>
            <p className="text-sm font-medium text-teal-800">Enquiring about {preDoctor.name}</p>
            <p className="text-xs text-teal-600">Specialization and procedure pre-selected. You can adjust below.</p>
          </div>
        </div>
      )}

      {/* ── Step 1: Treatment ── */}
      {step === 1 && (
        <Step1
          specializations={specializations}
          procedures={procedures}
          initial={data1}
          onNext={(d) => { setData1(d); setStep(2); }}
        />
      )}

      {/* ── Step 2: About you ── */}
      {step === 2 && (
        <Step2
          initial={data2}
          onBack={() => setStep(1)}
          onNext={(d) => { setData2(d); setStep(3); }}
        />
      )}

      {/* ── Step 3: Travel ── */}
      {step === 3 && (
        <Step3
          initial={data3}
          onBack={() => setStep(2)}
          onNext={(d) => { setData3(d); setStep(4); }}
        />
      )}

      {/* ── Step 4: Case description & files ── */}
      {step === 4 && (
        <Step4
          initial={data4}
          pendingFiles={pendingFiles}
          onFilesChange={setPendingFiles}
          onBack={() => setStep(3)}
          onNext={(d) => { setData4(d); setStep(5); }}
        />
      )}

      {/* ── Step 5: Contact ── */}
      {step === 5 && (
        <Step5
          initial={data5}
          userEmail={userEmail}
          onBack={() => setStep(4)}
          onNext={(d) => { setData5(d); setStep(6); }}
        />
      )}

      {/* ── Step 6: Review & submit ── */}
      {step === 6 && data1 && data2 && data3 && data4 && data5 && (
        <ReviewStep
          step={step}
          data1={data1} data2={data2} data3={data3} data4={data4} data5={data5}
          specName={specName} procName={procName}
          preferredDoctorName={preDoctor?.name}
          pendingFiles={pendingFiles}
          submitting={submitting}
          onBack={() => setStep(5)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

// ── Step 1 ───────────────────────────────────────────────────────────────────

function Step1({ specializations, procedures, initial, onNext }: {
  specializations: Specialization[]; procedures: Procedure[];
  initial: Step1Data | null; onNext: (d: Step1Data) => void;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: initial ?? {},
  });

  const selectedSpecId = watch("specializationId");
  const filtered = selectedSpecId
    ? procedures.filter((p) => p.specializationId === selectedSpecId)
    : procedures;

  // Re-apply pre-filled values once the async options arrive.
  // react-hook-form's defaultValues apply on mount, but the <select> options
  // don't exist yet at that point, so the browser shows the placeholder.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (initial?.specializationId && specializations.length > 0) {
      setValue("specializationId", initial.specializationId, { shouldValidate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specializations.length]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (initial?.procedureId && procedures.length > 0) {
      setValue("procedureId", initial.procedureId, { shouldValidate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [procedures.length]);

  // Reset procedureId when the user actively changes specialization.
  // Track the previous value so we only reset on real user changes,
  // not on the initial load or programmatic setValue calls.
  const prevSpecIdRef = useRef<string>("");
  useEffect(() => {
    const prev = prevSpecIdRef.current;
    prevSpecIdRef.current = selectedSpecId ?? "";
    if (prev && prev !== selectedSpecId) {
      setValue("procedureId", "");
    }
  }, [selectedSpecId, setValue]);

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <StepShell title="What treatment are you looking for?" step={1}>
        <div className="space-y-2">
          <Label>Specialization</Label>
          <select {...register("specializationId")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Select a specialization</option>
            {specializations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {errors.specializationId && <p className="text-sm text-destructive">{errors.specializationId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Procedure</Label>
          <select {...register("procedureId")}
            disabled={!selectedSpecId}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50">
            <option value="">{selectedSpecId ? "Select a procedure" : "Select a specialization first"}</option>
            {filtered.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {errors.procedureId && <p className="text-sm text-destructive">{errors.procedureId.message}</p>}
        </div>
        <div className="mt-8 flex">
          <Button type="submit" className="flex-1">
            Continue <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </StepShell>
    </form>
  );
}

// ── Step 2 ───────────────────────────────────────────────────────────────────

function Step2({ initial, onBack, onNext }: {
  initial: Step2Data | null; onBack: () => void; onNext: (d: Step2Data) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: initial ?? {},
  });
  return (
    <form onSubmit={handleSubmit(onNext)}>
      <StepShell title="Tell us about yourself" subtitle="This helps us match you with the right specialist." step={2}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Country you&apos;re travelling from</Label>
            <Input {...register("patientCountry")} placeholder="e.g. United Kingdom" />
            {errors.patientCountry && <p className="text-sm text-destructive">{errors.patientCountry.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Your age</Label>
            <Input type="number" min={1} max={120} {...register("age", { valueAsNumber: true })} />
            {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Budget range (USD)</Label>
          <div className="flex gap-3 items-center">
            <Input type="number" min={0} placeholder="Min" {...register("budgetMin", { valueAsNumber: true })} />
            <span className="text-muted-foreground text-sm">to</span>
            <Input type="number" min={0} placeholder="Max" {...register("budgetMax", { valueAsNumber: true })} />
          </div>
          {errors.budgetMax && <p className="text-sm text-destructive">{errors.budgetMax.message}</p>}
        </div>
        <div className="mt-8 flex gap-3">
          <Button type="button" variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
          <Button type="submit" className="flex-1">Continue <ChevronRight className="h-4 w-4 ml-1" /></Button>
        </div>
      </StepShell>
    </form>
  );
}

// ── Step 3 ───────────────────────────────────────────────────────────────────

function Step3({ initial, onBack, onNext }: {
  initial: Step3Data | null; onBack: () => void; onNext: (d: Step3Data) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: initial ?? {},
  });
  return (
    <form onSubmit={handleSubmit(onNext)}>
      <StepShell title="When are you planning to travel?" subtitle="Approximate dates are fine." step={3}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>From</Label>
            <Input type="date" {...register("travelDateStart")} />
            {errors.travelDateStart && <p className="text-sm text-destructive">{errors.travelDateStart.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <Input type="date" {...register("travelDateEnd")} />
            {errors.travelDateEnd && <p className="text-sm text-destructive">{errors.travelDateEnd.message}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Preferred city in Egypt <span className="text-muted-foreground">(optional)</span></Label>
          <Input {...register("preferredCity")} placeholder="e.g. Cairo, Alexandria" />
        </div>
        <div className="mt-8 flex gap-3">
          <Button type="button" variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
          <Button type="submit" className="flex-1">Continue <ChevronRight className="h-4 w-4 ml-1" /></Button>
        </div>
      </StepShell>
    </form>
  );
}

// ── Step 4 ───────────────────────────────────────────────────────────────────

function Step4({ initial, pendingFiles, onFilesChange, onBack, onNext }: {
  initial: Step4Data | null; pendingFiles: File[];
  onFilesChange: (f: File[]) => void; onBack: () => void; onNext: (d: Step4Data) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: initial ?? {},
  });
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFilesChange([...pendingFiles, file]);
    e.target.value = "";
  };
  return (
    <form onSubmit={handleSubmit(onNext)}>
      <StepShell title="Describe your case" subtitle="The more detail you provide, the better we can match you." step={4}>
        <div className="space-y-2">
          <Label>Case description</Label>
          <textarea
            {...register("caseDescription")}
            rows={6}
            placeholder="Describe your condition, any previous treatments, and what you're hoping to achieve..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.caseDescription && <p className="text-sm text-destructive">{errors.caseDescription.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Attach medical files <span className="text-muted-foreground">(optional)</span></Label>
          <p className="text-xs text-muted-foreground">X-rays, reports, previous prescriptions — PDF, JPG, PNG.</p>
          <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="max-w-xs" />
          {pendingFiles.length > 0 && (
            <ul className="space-y-1 mt-2">
              {pendingFiles.map((f, i) => (
                <li key={i} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                  {f.name}
                  <button type="button" onClick={() => onFilesChange(pendingFiles.filter((_, j) => j !== i))}
                    className="text-destructive text-xs hover:underline">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-8 flex gap-3">
          <Button type="button" variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
          <Button type="submit" className="flex-1">Continue <ChevronRight className="h-4 w-4 ml-1" /></Button>
        </div>
      </StepShell>
    </form>
  );
}

// ── Step 5 ───────────────────────────────────────────────────────────────────

function Step5({ initial, userEmail, onBack, onNext }: {
  initial: Step5Data | null; userEmail?: string; onBack: () => void; onNext: (d: Step5Data) => void;
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: initial ?? { preferredContactMethods: [], contactEmail: userEmail ?? "" },
  });

  // If userEmail arrives after first render (async fetch), set it as the default
  useEffect(() => {
    if (userEmail && !initial?.contactEmail) {
      setValue("contactEmail", userEmail);
    }
  }, [userEmail, initial, setValue]);
  const selected = watch("preferredContactMethods") ?? [];
  const toggle = (m: ContactMethod) => {
    setValue(
      "preferredContactMethods",
      selected.includes(m) ? selected.filter((x) => x !== m) : [...selected, m],
      { shouldValidate: true }
    );
  };
  return (
    <form onSubmit={handleSubmit(onNext)}>
      <StepShell title="How should we contact you?" subtitle="Select all methods that work for you." step={5}>
        {/* Method toggles */}
        <div className="space-y-2">
          <Label>Preferred contact method</Label>
          <div className="flex flex-wrap gap-2 pt-1">
            {CONTACT_METHODS.map((m) => (
              <button key={m} type="button" onClick={() => toggle(m)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  selected.includes(m)
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-input text-muted-foreground hover:border-teal-400"
                }`}>
                {METHOD_LABELS[m]}
              </button>
            ))}
          </div>
          {errors.preferredContactMethods && (
            <p className="text-sm text-destructive">{errors.preferredContactMethods.message}</p>
          )}
        </div>

        {/* Always show email */}
        <div className="space-y-2">
          <Label>Email address</Label>
          <Input type="email" {...register("contactEmail")} placeholder="your@email.com" />
          {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
        </div>

        {selected.includes("phone") && (
          <div className="space-y-2">
            <Label>Phone number</Label>
            <Input {...register("contactPhone")} placeholder="+1 234 567 8900" />
            {errors.contactPhone && <p className="text-sm text-destructive">{errors.contactPhone.message}</p>}
          </div>
        )}
        {selected.includes("whatsapp") && (
          <div className="space-y-2">
            <Label>WhatsApp number</Label>
            <Input {...register("contactWhatsapp")} placeholder="+1 234 567 8900" />
            {errors.contactWhatsapp && <p className="text-sm text-destructive">{errors.contactWhatsapp.message}</p>}
          </div>
        )}
        {selected.includes("telegram") && (
          <div className="space-y-2">
            <Label>Telegram username or number</Label>
            <Input {...register("contactTelegram")} placeholder="@username or +1 234 567 8900" />
            {errors.contactTelegram && <p className="text-sm text-destructive">{errors.contactTelegram.message}</p>}
          </div>
        )}
        {selected.includes("other") && (
          <div className="space-y-2">
            <Label>Please specify</Label>
            <Input {...register("contactOther")} placeholder="e.g. Signal, Viber..." />
            {errors.contactOther && <p className="text-sm text-destructive">{errors.contactOther.message}</p>}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <Button type="button" variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
          <Button type="submit" className="flex-1">Review <ChevronRight className="h-4 w-4 ml-1" /></Button>
        </div>
      </StepShell>
    </form>
  );
}

// ── Step 6: Review ───────────────────────────────────────────────────────────

function ReviewStep({ step, data1, data2, data3, data4, data5, specName, procName, preferredDoctorName, pendingFiles, submitting, onBack, onSubmit }: {
  step: number;
  data1: Step1Data; data2: Step2Data; data3: Step3Data; data4: Step4Data; data5: Step5Data;
  specName?: string; procName?: string; preferredDoctorName?: string; pendingFiles: File[];
  submitting: boolean; onBack: () => void; onSubmit: () => void;
}) {
  const [agreed, setAgreed] = useState(false);

  const rows: [string, string][] = [
    ...(preferredDoctorName ? [["Preferred doctor", preferredDoctorName] as [string, string]] : []),
    ["Specialization", specName ?? "—"],
    ["Procedure", procName ?? "—"],
    ["Country", data2.patientCountry],
    ["Age", String(data2.age)],
    ["Budget", `$${data2.budgetMin} – $${data2.budgetMax}`],
    ["Travel dates", `${data3.travelDateStart} → ${data3.travelDateEnd}`],
    ...(data3.preferredCity ? [["Preferred city", data3.preferredCity] as [string, string]] : []),
    ["Contact via", data5.preferredContactMethods.map((m) => METHOD_LABELS[m]).join(", ")],
    ["Email", data5.contactEmail],
    ...(data5.contactPhone ? [["Phone", data5.contactPhone] as [string, string]] : []),
    ...(data5.contactWhatsapp ? [["WhatsApp", data5.contactWhatsapp] as [string, string]] : []),
    ...(data5.contactTelegram ? [["Telegram", data5.contactTelegram] as [string, string]] : []),
    ...(data5.contactOther ? [["Other", data5.contactOther] as [string, string]] : []),
  ];

  return (
    <div>
      <ProgressBar step={step} />
      <h2 className="font-bold text-xl mb-1">Review your inquiry</h2>
      <p className="text-sm text-muted-foreground mb-6">Everything look right? Submit when ready.</p>

      {/* Summary table */}
      <div className="rounded-xl border divide-y text-sm mb-6">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between px-4 py-3">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-right max-w-[60%]">{value}</span>
          </div>
        ))}
        {data4.caseDescription && (
          <div className="px-4 py-3">
            <p className="text-muted-foreground mb-1">Case description</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{data4.caseDescription}</p>
          </div>
        )}
        {pendingFiles.length > 0 && (
          <div className="px-4 py-3">
            <p className="text-muted-foreground mb-1">Attached files</p>
            <ul className="space-y-0.5">
              {pendingFiles.map((f, i) => <li key={i} className="text-sm">{f.name}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Consent */}
      <label className="flex items-start gap-3 cursor-pointer rounded-lg border p-4 mb-6">
        <input type="checkbox" className="mt-0.5" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span className="text-sm text-muted-foreground leading-relaxed">
          I agree to share my medical information with Curavia and matched providers for the purpose of coordinating my care.
        </span>
      </label>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button className="flex-1" disabled={!agreed || submitting} onClick={onSubmit}>
          {submitting ? "Submitting..." : "Submit inquiry"}
        </Button>
      </div>
    </div>
  );
}
