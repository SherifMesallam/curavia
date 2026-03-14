"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  admin: { firstName: string; lastName: string; email?: string };
}

interface AdminNotesProps {
  entityType: "Doctor" | "Clinic";
  entityId: string;
}

export function AdminNotes({ entityType, entityId }: AdminNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/notes?entityType=${entityType}&entityId=${entityId}`
      );
      const data = await res.json();
      setNotes(data.notes ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [entityType, entityId]);

  const handleAdd = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          content: newNote.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setNewNote("");
      await fetchNotes();
    } catch {
      alert("Failed to add note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border p-4">
      <h2 className="font-semibold mb-3">Admin notes</h2>
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Add a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={saving || !newNote.trim()}>
            {saving ? "Adding..." : "Add"}
          </Button>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li
                key={n.id}
                className="rounded border-l-2 border-muted bg-muted/30 px-3 py-2 text-sm"
              >
                <p className="whitespace-pre-wrap">{n.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {n.admin.firstName} {n.admin.lastName} •{" "}
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
