"use client";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Account" },
  { id: 2, label: "Provider Type" },
  { id: 3, label: "Personal Info" },
  { id: 4, label: "Clinic Info" },
  { id: 5, label: "Procedures" },
  { id: 6, label: "Pricing" },
  { id: 7, label: "Credentials" },
  { id: 8, label: "Facility Images" },
  { id: 9, label: "Submit" },
];

interface OnboardingStepperProps {
  currentStep: number;
  providerType?: "DOCTOR" | "CLINIC";
}

export function OnboardingStepper({
  currentStep,
  providerType,
}: OnboardingStepperProps) {
  const steps = providerType === "CLINIC"
    ? STEPS
    : STEPS.filter((s) => s.id !== 4);

  return (
    <nav aria-label="Progress" className="mb-10">
      <ol className="flex flex-wrap gap-2">
        {steps.map((step, idx) => {
          const stepNum = step.id;
          const isComplete = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                isCurrent && "bg-primary text-primary-foreground",
                isComplete && "bg-muted text-muted-foreground",
                !isCurrent && !isComplete && "bg-muted/50"
              )}
            >
              {idx > 0 && (
                <span className="mr-2 text-muted-foreground">→</span>
              )}
              {step.label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
