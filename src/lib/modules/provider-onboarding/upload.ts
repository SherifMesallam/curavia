export async function uploadFile(
  file: File,
  entityType: string,
  entityId: string
): Promise<{ key: string }> {
  const res = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      entityType,
      entityId,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to get upload URL");
  }
  const { url, key } = await res.json();
  if (url) {
    const putRes = await fetch(url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!putRes.ok) throw new Error("Upload failed");
  }
  return { key };
}
