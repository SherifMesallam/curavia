"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError("root", { message: json.error ?? "Login failed" });
        return;
      }
      const role = json.user?.role;
      if (role === "ADMIN") {
        router.push("/admin/vetting");
      } else if (role === "PROVIDER") {
        router.push("/provider/consultations");
      } else if (role === "PATIENT") {
        router.push("/patient/dashboard");
      } else {
        router.push("/");
      }
    } catch {
      setError("root", { message: "Login failed" });
    }
  };

  return (
    <div className="container flex min-h-[60vh] max-w-md items-center justify-center py-10">
      <div className="w-full space-y-6">
        <div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
          <h1 className="mt-4 font-bold text-2xl">Log in</h1>
          <p className="mt-1 text-muted-foreground">
            Sign in to your account.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          {errors.root && (
            <p className="text-sm text-destructive">{errors.root.message}</p>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Provider?{" "}
          <Link href="/provider-signup" className="text-primary hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
