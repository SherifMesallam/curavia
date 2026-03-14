"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  country: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function PatientProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    fetch("/api/patient/profile")
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) router.push("/login");
          throw new Error("Failed to load profile");
        }
        return res.json();
      })
      .then((data) => {
        reset({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          phone: data.phone ?? "",
          bio: data.bio ?? "",
          country: data.country ?? "",
        });
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [reset, router]);

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/patient/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        bio: data.bio || null,
        country: data.country || null,
      }),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error ?? "Failed to update");
    }
    reset(data);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="container py-10">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Profile & settings</CardTitle>
          <CardDescription>
            Update your personal information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="e.g. United States" {...register("country")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <textarea
                id="bio"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell us a bit about yourself..."
                {...register("bio")}
              />
            </div>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
