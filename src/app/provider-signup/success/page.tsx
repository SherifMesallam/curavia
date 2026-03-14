import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OnboardingSuccessPage() {
  return (
    <div className="container flex min-h-[60vh] max-w-md flex-col items-center justify-center py-10 text-center">
      <h1 className="font-bold text-2xl">Submission received</h1>
      <p className="mt-4 text-muted-foreground">
        Your application has been submitted for review. Our team will review your
        profile and get back to you within 2-3 business days. You will receive
        an email once your account has been approved.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Return to home</Link>
      </Button>
    </div>
  );
}
