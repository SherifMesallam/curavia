import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { Procedure } from "@/types/marketplace";

interface ProcedureCardProps {
  procedure: Procedure;
}

export function ProcedureCard({ procedure }: ProcedureCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="flex-1 p-6">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="font-semibold text-lg">{procedure.name}</h3>
          <Badge variant="secondary">{procedure.specialization.name}</Badge>
        </div>

        {procedure.description && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {procedure.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {procedure.doctorCount != null && (
            <span className="text-muted-foreground">
              {procedure.doctorCount} doctor{procedure.doctorCount !== 1 ? "s" : ""} available
            </span>
          )}
          {procedure.priceFrom != null && (
            <span className="font-medium">
              From {formatPrice(procedure.priceFrom)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <Button asChild className="w-full">
          <Link href={`/procedures/${procedure.slug}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
