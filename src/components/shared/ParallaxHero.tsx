"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export function ParallaxHero({ children }: { children: React.ReactNode }) {
  const imgRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (isMobile) return; // no parallax on mobile — too janky with touch scroll
    const handleScroll = () => {
      if (!imgRef.current) return;
      imgRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  return (
    <section className="relative overflow-hidden min-h-[500px] md:min-h-[680px] flex flex-col">
      {/* Background image — parallax on desktop, static on mobile */}
      <div
        ref={imgRef}
        className="absolute inset-0 will-change-transform"
        style={isMobile ? undefined : { top: "-15%", bottom: "-15%", left: 0, right: 0 }}
      >
        <Image
          src="/images/hero.jpg"
          alt="Doctor consulting with patient, pyramids visible through window"
          fill
          // On mobile focus on the right side where the pyramids window is visible
          className="object-cover md:object-center object-right"
          priority
          sizes="100vw"
        />
      </div>

      {/* Stronger overlay on mobile for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 md:from-slate-900/80 md:via-slate-900/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />

      {children}
    </section>
  );
}
