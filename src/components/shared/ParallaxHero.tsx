"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export function ParallaxHero({ children }: { children: React.ReactNode }) {
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!imgRef.current) return;
      // Skip parallax on touch/mobile — matchMedia checked on every scroll tick
      if (window.matchMedia("(max-width: 767px)").matches) return;
      imgRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative overflow-hidden min-h-[500px] md:min-h-[680px] flex flex-col">
      {/* Image is intentionally 30% taller than the section to give the parallax room to travel */}
      <div
        ref={imgRef}
        className="absolute will-change-transform"
        style={{ top: "-15%", bottom: "-15%", left: 0, right: 0 }}
      >
        <Image
          src="/images/hero.jpg"
          alt="Doctor consulting with patient, pyramids visible through window"
          fill
          className="object-cover md:object-center object-right"
          priority
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 md:from-slate-900/80 md:via-slate-900/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />

      {children}
    </section>
  );
}
