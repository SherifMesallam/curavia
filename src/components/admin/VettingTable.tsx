"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type PendingProvider =
  | {
      id: string;
      type: "doctor";
      status?: string;
      name: string;
      email: string;
      specialization: string | null;
      clinic: string | null;
      city?: string;
      country?: string;
      createdAt: Date;
    }
  | {
      id: string;
      type: "clinic";
      status?: string;
      name: string;
      email: string;
      city: string;
      country: string;
      doctorCount: number;
      createdAt: Date;
    };

interface VettingTableProps {
  providers: PendingProvider[];
}

export function VettingTable({ providers }: VettingTableProps) {
  const columns: ColumnDef<PendingProvider>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.type === "doctor" ? "Doctor" : "Clinic"}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge variant={s === "REQUEST_INFO" ? "secondary" : "outline"}>
            {s ?? "PENDING"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      id: "details",
      header: "Details",
      cell: ({ row }) => {
        const p = row.original;
        if (p.type === "doctor") {
          return (
            <span className="text-sm text-muted-foreground">
              {p.specialization ?? "—"} • {p.clinic ?? "Solo"}
            </span>
          );
        }
        return (
          <span className="text-sm text-muted-foreground">
            {p.city}, {p.country} • {p.doctorCount} doctor{p.doctorCount !== 1 ? "s" : ""}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Submitted",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const p = row.original;
        const href =
          p.type === "doctor"
            ? `/admin/vetting/doctor/${p.id}`
            : `/admin/vetting/clinic/${p.id}`;
        return (
          <Button size="sm" asChild>
            <Link href={href}>Review</Link>
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: providers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (providers.length === 0) {
    return (
      <div className="rounded-lg border p-12 text-center text-muted-foreground">
        No pending providers.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
