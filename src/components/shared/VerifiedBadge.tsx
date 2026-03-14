import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="success" className={cn("gap-1", className)}>
      <ShieldCheck className="h-3 w-3" />
      Verified
    </Badge>
  );
}
