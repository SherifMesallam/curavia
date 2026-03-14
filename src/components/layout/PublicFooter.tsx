import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export function PublicFooter() {
  return (
    <footer className="border-t">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Logo width={120} height={30} />
            <p className="mt-2 text-sm text-muted-foreground">
              Medical tourism in Egypt. Dental and LASIK procedures.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Explore</h4>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/procedures" className="hover:text-foreground">
                  Procedures
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-foreground">
                  Doctors
                </Link>
              </li>
              <li>
                <Link href="/clinics" className="hover:text-foreground">
                  Clinics
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium">Support</h4>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium">Legal</h4>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/provider-signup" className="hover:text-foreground">
                  Provider signup
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Curavia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
