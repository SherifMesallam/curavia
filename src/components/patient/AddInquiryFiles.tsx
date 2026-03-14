"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadInquiryFile } from "@/lib/modules/inquiry/upload";

interface AddInquiryFilesProps {
  inquiryCaseId: string;
}

export function AddInquiryFiles({ inquiryCaseId }: AddInquiryFilesProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { key } = await uploadInquiryFile(file, inquiryCaseId);
      await fetch(`/api/inquiries/${inquiryCaseId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey: key, fileName: file.name }),
      });
      router.refresh();
    } catch {
      alert("Upload failed");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="rounded-lg border p-4">
      <h2 className="font-semibold mb-2">Add medical files</h2>
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFile}
          disabled={loading}
          className="max-w-xs"
        />
        {loading && <span className="text-sm text-muted-foreground">Uploading...</span>}
      </div>
    </div>
  );
}
