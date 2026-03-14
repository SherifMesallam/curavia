"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export function ParallaxHero({ children }: { children: React.ReactNode }) {
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!imgRef.current) return;
      // Move the image up at half the scroll speed for a natural depth feel
      imgRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative overflow-hidden min-h-[600px] md:min-h-[680px] flex flex-col">
      {/* Parallax image layer — intentionally taller than the section */}
      <div
        ref={imgRef}
        className="absolute inset-0 will-change-transform"
        style={{ top: "-15%", bottom: "-15%", left: 0, right: 0 }}
      >
        <Image
          src="/images/hero.jpg"
          alt="Doctor consulting with patient"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

      {/* Page content passed as children */}
      {children}
    </section>
  );
}
