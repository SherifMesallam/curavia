"use client";

import { User } from "lucide-react";

interface DoctorAvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-14 w-14",
  md: "h-20 w-20",
  lg: "h-24 w-24",
};

export function DoctorAvatar({ src, alt, size = "sm" }: DoctorAvatarProps) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full bg-muted ${sizeClasses[size]}`}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fallback = e.currentTarget.nextElementSibling;
          if (fallback) fallback.classList.remove("hidden");
        }}
      />
      <div className="hidden absolute inset-0 flex items-center justify-center">
        <User className="h-1/2 w-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}
