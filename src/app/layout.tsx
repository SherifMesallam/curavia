import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-display", weight: ["300", "400"] });

export const metadata: Metadata = {
  title: "Curavia | Medical Tourism in Egypt",
  description: "Connect with vetted Egyptian doctors and clinics for dental and LASIK procedures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSans.variable} ${inter.className}`}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
