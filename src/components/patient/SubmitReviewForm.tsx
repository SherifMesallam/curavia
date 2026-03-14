"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createReviewSchema, type CreateReviewData } from "@/lib/modules/review/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SubmitReviewFormProps {
  doctorId?: string;
  clinicId?: string;
  inquiryCaseId?: string;
  doctorName?: string;
  clinicName?: string;
}

export function SubmitReviewForm({
  doctorId,
  clinicId,
  inquiryCaseId,
  doctorName,
  clinicName,
}: SubmitReviewFormProps) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateReviewData>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      doctorId,
      clinicId,
      inquiryCaseId,
      professionalism: 5,
      communication: 5,
      cleanliness: 5,
      outcome: 5,
      overall: 5,
      comment: "",
    },
  });

  const onSubmit = async (data: CreateReviewData) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to submit review");
      setSuccess(true);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit review");
    }
  };

  if (success) {
    return (
      <p className="text-sm text-muted-foreground">
        Thank you! Your review has been submitted and is pending moderation.
      </p>
    );
  }

  const target = doctorName ?? clinicName ?? "this provider";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Rate your experience with {target}. Reviews are moderated before being published.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {(["professionalism", "communication", "cleanliness", "outcome", "overall"] as const).map((key) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="capitalize">
              {key.replace(/_/g, " ")} (1-5)
            </Label>
            <Input
              id={key}
              type="number"
              min={1}
              max={5}
              {...register(key, { valueAsNumber: true })}
            />
            {errors[key] && (
              <p className="text-sm text-destructive">{errors[key].message}</p>
            )}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment">Your feedback</Label>
        <textarea
          id="comment"
          {...register("comment")}
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Share your experience..."
        />
        {errors.comment && (
          <p className="text-sm text-destructive">{errors.comment.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}
