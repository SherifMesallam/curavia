"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";

interface Credential {
  id: string;
  type: string;
  fileKey: string;
  fileName: string;
}

interface CredentialViewerProps {
  credentials: Credential[];
}

export function CredentialViewer({ credentials }: CredentialViewerProps) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handleView = async (cred: Credential) => {
    setLoadingKey(cred.id);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: cred.fileKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        alert(data.message ?? "Document not available. S3 may not be configured.");
      }
    } catch {
      alert("Failed to load document");
    } finally {
      setLoadingKey(null);
    }
  };

  if (credentials.length === 0) {
    return (
      <div className="rounded-lg border p-4">
        <h2 className="font-semibold mb-2">Credentials</h2>
        <p className="text-sm text-muted-foreground">No credentials uploaded.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <h2 className="font-semibold mb-3">Credential documents</h2>
      <ul className="space-y-2">
        {credentials.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded border px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{c.fileName}</span>
              <span className="text-xs text-muted-foreground">({c.type})</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleView(c)}
              disabled={loadingKey === c.id}
            >
              {loadingKey === c.id ? (
                "Loading..."
              ) : (
                <>
                  <ExternalLink className="mr-1 h-3 w-3" />
                  View
                </>
              )}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
