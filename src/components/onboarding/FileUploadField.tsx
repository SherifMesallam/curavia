"use client";

import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { uploadFile } from "@/lib/modules/provider-onboarding/upload";

interface FileUploadFieldProps {
  name: string;
  label: string;
  accept?: string;
  entityType: string;
  entityId: string;
  onUploaded?: (key: string, fileName: string) => void;
}

export function FileUploadField({
  name,
  label,
  accept = "image/*,.pdf",
  entityType,
  entityId,
  onUploaded,
}: FileUploadFieldProps) {
  const { setValue, watch } = useFormContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const value = watch(name) as { fileKey: string; fileName: string }[] | undefined;

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setLoading(true);
      setError(null);
      try {
        const { key } = await uploadFile(file, entityType, entityId);
        const items = Array.isArray(value) ? [...value] : [];
        items.push({ fileKey: key, fileName: file.name });
        setValue(name, items);
        onUploaded?.(key, file.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setLoading(false);
        e.target.value = "";
      }
    },
    [entityType, entityId, name, onUploaded, setValue, value]
  );

  const remove = (idx: number) => {
    const items = Array.isArray(value) ? [...value] : [];
    items.splice(idx, 1);
    setValue(name, items);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept={accept}
          onChange={handleFile}
          disabled={loading}
          className="max-w-xs"
        />
        {loading && <span className="text-sm text-muted-foreground">Uploading...</span>}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {Array.isArray(value) && value.length > 0 && (
        <ul className="mt-2 space-y-1">
          {value.map((item, idx) => (
            <li
              key={item.fileKey}
              className="flex items-center justify-between rounded border px-3 py-2 text-sm"
            >
              {item.fileName}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(idx)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
