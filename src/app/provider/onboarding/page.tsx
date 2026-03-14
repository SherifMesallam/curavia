"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import {
  step2ProviderTypeSchema,
  step3PersonalInfoSchema,
  step4ClinicInfoSchema,
  step5ProceduresSchema,
  step6PricingSchema,
  step7CredentialsSchema,
  step8FacilityImagesSchema,
  step9SubmissionSchema,
} from "@/lib/modules/provider-onboarding/validations";

const onboardingSchema = z.object({
  step2: step2ProviderTypeSchema.optional(),
  step3: step3PersonalInfoSchema.optional(),
  step4: step4ClinicInfoSchema.optional(),
  step5: step5ProceduresSchema.optional(),
  step6: step6PricingSchema.optional(),
  step7: step7CredentialsSchema.optional(),
  step8: step8FacilityImagesSchema.optional(),
  step9: step9SubmissionSchema.optional(),
}).partial();

type FormData = z.infer<typeof onboardingSchema>;

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(2);
  const [providerType, setProviderType] = useState<"DOCTOR" | "CLINIC">("DOCTOR");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [procedures, setProcedures] = useState<{ id: string; name: string; slug: string; specializationId: string }[]>([]);
  const [specializations, setSpecializations] = useState<{ id: string; name: string }[]>([]);

  const methods = useForm<FormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      step2: { providerType: "DOCTOR" },
      step3: {},
      step4: { country: "Egypt" },
      step5: { procedureIds: [] },
      step6: { priceRanges: [] },
      step7: { credentials: [] },
      step8: { images: [] },
      step9: { agreedToTerms: false },
    },
  });

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(({ user }) => {
        if (!user) {
          router.push("/provider/onboarding/register");
          return;
        }
        setLoading(false);
        return fetch("/api/onboarding/draft").then((r) => r.json());
      })
      .then((data) => {
        if (data?.draft) {
          const d = data.draft.stepData as Record<string, unknown>;
          methods.reset({
            step2: d.step2 as FormData["step2"],
            step3: d.step3 as FormData["step3"],
            step4: d.step4 as FormData["step4"],
            step5: d.step5 as FormData["step5"],
            step6: d.step6 as FormData["step6"],
            step7: d.step7 as FormData["step7"],
            step8: d.step8 as FormData["step8"],
            step9: d.step9 as FormData["step9"],
          });
          setCurrentStep(data.draft.currentStep ?? 2);
          setProviderType(((d.step2 as { providerType?: string })?.providerType ?? "DOCTOR") as "DOCTOR" | "CLINIC");
        }
      })
      .catch(() => setLoading(false));
  }, [router, methods]);

  useEffect(() => {
    fetch("/api/onboarding/procedures")
      .then((r) => r.json())
      .then(({ procedures: p, specializations: s }) => {
        setProcedures(p ?? []);
        setSpecializations(s ?? []);
      });
  }, []);

  const saveDraft = async (values: FormData) => {
    setSaving(true);
    try {
      await fetch("/api/onboarding/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerType,
          currentStep,
          stepData: values,
        }),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    const valid = await methods.trigger();
    if (!valid) return;
    const values = methods.getValues();
    await saveDraft(values);
    const next = providerType === "CLINIC" ? currentStep + 1 : currentStep === 3 ? 5 : currentStep + 1;
    setCurrentStep(Math.min(next, 9));
  };

  const handleBack = () => {
    const prev = providerType === "CLINIC" ? currentStep - 1 : currentStep === 5 ? 3 : currentStep - 1;
    setCurrentStep(Math.max(prev, 2));
  };

  const handleSubmit = async () => {
    const valid = await methods.trigger();
    if (!valid) return;
    setSaving(true);
    try {
      const values = methods.getValues();
      await saveDraft(values);
      const res = await fetch("/api/onboarding/submit", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      router.push("/provider/onboarding/success");
    } catch (err) {
      methods.setError("root" as never, { message: err instanceof Error ? err.message : "Submission failed" } as never);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="font-bold text-2xl mb-2">Provider Onboarding</h1>
      <p className="text-muted-foreground mb-6">
        Complete the steps below to register as a provider. You can save your progress at any time.
      </p>

      <OnboardingStepper currentStep={currentStep} providerType={providerType} />

      <FormProvider {...methods}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (currentStep === 9) handleSubmit();
            else handleNext();
          }}
          className="space-y-6"
        >
          {currentStep === 2 && <Step2ProviderType onSelect={setProviderType} />}
          {currentStep === 3 && <Step3PersonalInfo />}
          {currentStep === 4 && providerType === "CLINIC" && <Step4ClinicInfo />}
          {currentStep === 5 && <Step5Procedures procedures={procedures} specializations={specializations} />}
          {currentStep === 6 && <Step6Pricing procedures={procedures} />}
          {currentStep === 7 && <Step7Credentials />}
          {currentStep === 8 && <Step8FacilityImages />}
          {currentStep === 9 && <Step9Submission />}

          {currentStep === 4 && providerType === "DOCTOR" && (
            <p className="text-muted-foreground">Skipping clinic info for doctor registration.</p>
          )}

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 2}>
              Back
            </Button>
            {currentStep < 9 ? (
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save & Continue"}
              </Button>
            ) : (
              <Button type="submit" disabled={saving}>
                {saving ? "Submitting..." : "Submit for Review"}
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

function Step2ProviderType({ onSelect }: { onSelect: (t: "DOCTOR" | "CLINIC") => void }) {
  const { register, watch } = useFormContext<FormData>();
  const type = watch("step2.providerType");
  useEffect(() => {
    if (type) onSelect(type);
  }, [type, onSelect]);
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Provider type</h2>
      <div className="flex gap-4">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-4 has-[:checked]:border-primary">
          <input type="radio" value="DOCTOR" {...register("step2.providerType")} />
          Doctor
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-4 has-[:checked]:border-primary">
          <input type="radio" value="CLINIC" {...register("step2.providerType")} />
          Clinic
        </label>
      </div>
    </div>
  );
}

function Step3PersonalInfo() {
  const { register, formState: { errors } } = useFormContext<FormData>();
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Personal information</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>First name</Label>
          <Input {...register("step3.firstName")} />
          {errors.step3?.firstName && (
            <p className="text-sm text-destructive">{errors.step3.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Last name</Label>
          <Input {...register("step3.lastName")} />
          {errors.step3?.lastName && (
            <p className="text-sm text-destructive">{errors.step3.lastName.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input {...register("step3.phone")} />
      </div>
      <div className="space-y-2">
        <Label>Years of experience</Label>
        <Input type="number" min={0} {...register("step3.yearsExperience", { valueAsNumber: true })} />
      </div>
      <div className="space-y-2">
        <Label>Bio</Label>
        <textarea
          {...register("step3.bio")}
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}

function Step4ClinicInfo() {
  const { register, formState: { errors } } = useFormContext<FormData>();
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Clinic information</h2>
      <div className="space-y-2">
        <Label>Clinic name</Label>
        <Input {...register("step4.name")} />
        {errors.step4?.name && (
          <p className="text-sm text-destructive">{errors.step4.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Address</Label>
        <Input {...register("step4.address")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>City</Label>
          <Input {...register("step4.city")} />
          {errors.step4?.city && (
            <p className="text-sm text-destructive">{errors.step4.city.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Country</Label>
          <Input {...register("step4.country")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input {...register("step4.phone")} />
      </div>
      <div className="space-y-2">
        <Label>Website</Label>
        <Input type="url" {...register("step4.website")} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <textarea
          {...register("step4.description")}
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}

function Step5Procedures({
  procedures,
  specializations,
}: {
  procedures: { id: string; name: string; slug: string; specializationId: string }[];
  specializations: { id: string; name: string }[];
}) {
  const { register, watch, setValue } = useFormContext<FormData>();
  const selected = watch("step5.procedureIds") ?? [];
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Procedures offered</h2>
      <div className="space-y-2">
        <Label>Specialization (for doctor)</Label>
        <select
          {...register("step5.specializationId")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          {specializations.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Select procedures</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {procedures.map((p) => (
            <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded border p-3">
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, p.id]
                    : selected.filter((id: string) => id !== p.id);
                  setValue("step5.procedureIds", next);
                }}
              />
              {p.name}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step6Pricing({ procedures }: { procedures: { id: string; name: string }[] }) {
  const { watch, setValue } = useFormContext<FormData>();
  const procedureIds = (watch("step5.procedureIds") ?? []) as string[];
  const priceRanges = watch("step6.priceRanges") ?? [];
  const procs = procedures.filter((p) => procedureIds?.includes(p.id));
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Pricing ranges</h2>
      {procs.map((p) => {
        const existing = priceRanges?.find((r: { procedureId: string }) => r.procedureId === p.id);
        return (
          <div key={p.id} className="flex flex-wrap items-end gap-4 rounded border p-4">
            <span className="font-medium">{p.name}</span>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                placeholder="Min (USD)"
                defaultValue={existing?.minPrice}
                onChange={(e) => {
                  const ranges = [...(priceRanges ?? [])];
                  const idx = ranges.findIndex((r: { procedureId: string }) => r.procedureId === p.id);
                  const val = { procedureId: p.id, minPrice: Number(e.target.value), maxPrice: existing?.maxPrice ?? 0, currency: "USD" };
                  if (idx >= 0) ranges[idx] = { ...ranges[idx], ...val };
                  else ranges.push(val);
                  setValue("step6.priceRanges", ranges);
                }}
                className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={0}
                placeholder="Max (USD)"
                defaultValue={existing?.maxPrice}
                onChange={(e) => {
                  const ranges = [...(priceRanges ?? [])];
                  const idx = ranges.findIndex((r: { procedureId: string }) => r.procedureId === p.id);
                  const val = { procedureId: p.id, minPrice: existing?.minPrice ?? 0, maxPrice: Number(e.target.value), currency: "USD" };
                  if (idx >= 0) ranges[idx] = { ...ranges[idx], ...val };
                  else ranges.push(val);
                  setValue("step6.priceRanges", ranges);
                }}
                className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Step7Credentials() {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Credentials upload</h2>
      <p className="text-sm text-muted-foreground">
        Upload at least one credential (license, certification, etc.)
      </p>
      <CredentialsUploadField />
    </div>
  );
}

function CredentialsUploadField() {
  const { setValue, watch } = useFormContext<FormData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const value = watch("step7.credentials") as { type: string; fileKey: string; fileName: string }[] | undefined;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const { uploadFile } = await import("@/lib/modules/provider-onboarding/upload");
      const { key } = await uploadFile(file, "credentials", "onboarding");
      const existing = Array.isArray(value) ? value : [];
      const items = [
        ...existing.map((x) => ({ ...x, type: (x.type || "LICENSE") as "LICENSE" | "CERTIFICATION" | "DEGREE" | "INSURANCE" | "OTHER" })),
        { type: "LICENSE" as const, fileKey: key, fileName: file.name },
      ];
      setValue("step7.credentials", items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const remove = (idx: number) => {
    const items = Array.isArray(value) ? [...value] : [];
    items.splice(idx, 1);
    setValue("step7.credentials", items as { type: "LICENSE" | "CERTIFICATION" | "DEGREE" | "INSURANCE" | "OTHER"; fileKey: string; fileName: string }[]);
  };

  return (
    <div className="space-y-2">
      <Label>Credentials</Label>
      <div className="flex items-center gap-2">
        <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} disabled={loading} className="max-w-xs" />
        {loading && <span className="text-sm text-muted-foreground">Uploading...</span>}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {Array.isArray(value) && value.length > 0 && (
        <ul className="mt-2 space-y-1">
          {value.map((item, idx) => (
            <li key={item.fileKey} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              {item.fileName}
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)}>
                <span className="sr-only">Remove</span>×
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Step8FacilityImages() {
  const { setValue, watch } = useFormContext<FormData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const value = watch("step8.images") as { fileKey: string; fileName: string; sortOrder: number }[] | undefined;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const { uploadFile } = await import("@/lib/modules/provider-onboarding/upload");
      const { key } = await uploadFile(file, "facility", "onboarding");
      const items = Array.isArray(value) ? [...value] : [];
      items.push({ fileKey: key, fileName: file.name, sortOrder: items.length });
      setValue("step8.images", items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const remove = (idx: number) => {
    const items = Array.isArray(value) ? [...value] : [];
    items.splice(idx, 1);
    setValue("step8.images", items);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Facility images</h2>
      <p className="text-sm text-muted-foreground">
        Upload at least one image of your facility (required for clinics)
      </p>
      <div className="space-y-2">
        <Label>Images</Label>
        <div className="flex items-center gap-2">
          <Input type="file" accept="image/*" onChange={handleFile} disabled={loading} className="max-w-xs" />
          {loading && <span className="text-sm text-muted-foreground">Uploading...</span>}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {Array.isArray(value) && value.length > 0 && (
          <ul className="mt-2 space-y-1">
            {value.map((item, idx) => (
              <li key={item.fileKey} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                {item.fileName}
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)}>
                  <span className="sr-only">Remove</span>×
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Step9Submission() {
  const { register, formState: { errors } } = useFormContext<FormData>();
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Final submission</h2>
      <p className="text-muted-foreground">
        By submitting, you confirm that all information provided is accurate. Your application will be reviewed by our team. You will be notified once approved.
      </p>
      <label className="flex cursor-pointer items-center gap-2">
        <input type="checkbox" {...register("step9.agreedToTerms")} />
        I agree to the terms and confirm the information is accurate.
      </label>
      {errors.step9?.agreedToTerms && (
        <p className="text-sm text-destructive">{errors.step9.agreedToTerms.message}</p>
      )}
    </div>
  );
}
