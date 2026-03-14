import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ParallaxHero } from "@/components/shared/ParallaxHero";
import { DoctorCard } from "@/components/marketplace/DoctorCard";
import { ProcedureCard } from "@/components/marketplace/ProcedureCard";
import { getProcedures, getDoctors } from "@/lib/data/marketplace";
import { getSession } from "@/lib/auth/session";
import { ArrowRight, CheckCircle, Star } from "lucide-react";

const DASHBOARD_BY_ROLE: Record<string, string> = {
  PATIENT: "/patient/inquiries/new",
  PROVIDER: "/provider/consultations",
  ADMIN: "/admin/vetting",
};

export default async function HomePage() {
  const [procedures, doctors, session] = await Promise.all([
    getProcedures(),
    getDoctors(),
    getSession(),
  ]);

  const getStartedHref = session
    ? (DASHBOARD_BY_ROLE[session.role] ?? "/patient/inquiries/new")
    : "/register";

  const featuredProcedures = procedures.slice(0, 4);
  const featuredDoctors = doctors.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <ParallaxHero>
        {/* Content */}
        <div className="container relative z-10 flex flex-1 items-center py-16 md:py-28">
          <div className="max-w-2xl w-full">
            {/* Headline — single clean line on mobile, natural break on desktop */}
            <h1 className="font-display font-bold text-[2rem] leading-[1.15] sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight drop-shadow">
              Premium Dental &amp;&nbsp;LASIK
              <br className="hidden sm:block" />{" "}
              Care in Egypt
            </h1>

            <p className="mt-4 text-base sm:text-lg font-semibold text-teal-300 whitespace-nowrap">
              Save up to 80% vs US &amp; Europe
            </p>

            <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed max-w-lg">
              Consult vetted Egyptian specialists and receive full travel coordination for your treatment and recovery.
            </p>

            {/* CTAs — stack on mobile, side by side on sm+ */}
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-500 font-semibold px-7 shadow-lg w-full sm:w-auto" asChild>
                <Link href={getStartedHref}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/50 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm px-7 font-semibold w-full sm:w-auto" asChild>
                <Link href="/doctors">Browse Doctors</Link>
              </Button>
            </div>

            {/* Trust badges — single column on mobile, 2-col on sm+ */}
            <div className="mt-7 flex flex-col sm:grid sm:grid-cols-2 gap-y-2 gap-x-8 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />
                Verified Clinics
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />
                English-speaking Doctors
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />
                Transparent Pricing
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 shrink-0 fill-amber-400" />
                4.9 patient satisfaction
              </div>
            </div>
          </div>
        </div>

        {/* Social proof bar */}
        <div className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-sm py-3">
          <p className="container text-center text-sm font-medium text-white/80 tracking-wide">
            Trusted by patients from <strong className="text-white">UK</strong> &nbsp;•&nbsp;
            <strong className="text-white">Germany</strong> &nbsp;•&nbsp;
            <strong className="text-white">UAE</strong> &nbsp;•&nbsp;
            <strong className="text-white">Canada</strong>
          </p>
        </div>
      </ParallaxHero>

      {/* Featured Doctors */}
      {/* Concierge Experience */}
      <section className="border-t py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-2">The Curavia Experience</p>
            <h2 className="font-bold text-3xl md:text-4xl">Your end-to-end care journey</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              From your first inquiry to your last follow-up, we handle every detail.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative rounded-2xl border bg-background p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div className="absolute top-8 right-8 text-4xl font-black text-teal-200 select-none">01</div>
              <h3 className="mt-5 font-bold text-lg">Your Dedicated Care Navigator</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                A personal coordinator guides you from inquiry to treatment — scheduling, translating, and supporting you every step of the way.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border bg-background p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
              </div>
              <div className="absolute top-8 right-8 text-4xl font-black text-teal-200 select-none">02</div>
              <h3 className="mt-5 font-bold text-lg">Board-Certified Specialists</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Every doctor on Curavia is individually vetted — verified credentials, international training, and a track record of excellence in dental and vision care.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border bg-background p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                </svg>
              </div>
              <div className="absolute top-8 right-8 text-4xl font-black text-teal-200 select-none">03</div>
              <h3 className="mt-5 font-bold text-lg">Seamless Travel &amp; Logistics</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                We arrange your complete itinerary — clinic appointments, airport transfers, accommodation, and local support — so you can focus on your recovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t py-16">
        <div className="container">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-semibold text-2xl">Featured Doctors</h2>
              <p className="mt-1 text-muted-foreground">
                Vetted specialists ready to help
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/doctors">View all</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDoctors.map((d) => (
              <DoctorCard key={d.id} doctor={d} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Procedures */}
      <section className="border-t py-16">
        <div className="container">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-semibold text-2xl">Popular Procedures</h2>
              <p className="mt-1 text-muted-foreground">
                Explore our most sought-after treatments
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/procedures">View all</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProcedures.map((p) => (
              <ProcedureCard key={p.id} procedure={p} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary/5 py-16">
        <div className="container text-center">
          <h2 className="font-semibold text-2xl">Ready to get started?</h2>
          <p className="mt-2 text-muted-foreground">
            Submit an inquiry and we&apos;ll match you with the right doctor
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/register">Request a Consultation</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
