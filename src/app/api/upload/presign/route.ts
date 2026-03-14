import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

const USE_S3 = Boolean(
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
);

async function getPresignedUrl(
  fileName: string,
  fileType: string,
  entityType: string,
  entityId: string
): Promise<{ url: string; key: string }> {
  const ext = fileName.split(".").pop() ?? "";
  const key = `uploads/${entityType}/${entityId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  if (!USE_S3) {
    return {
      url: "",
      key,
    };
  }

  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

  const BUCKET = process.env.S3_BUCKET ?? "curavia-uploads";
  const REGION = process.env.AWS_REGION ?? "us-east-1";
  const ENDPOINT = process.env.S3_ENDPOINT;

  const s3 = new S3Client({
    region: REGION,
    ...(ENDPOINT && { endpoint: ENDPOINT }),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: fileType,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return { url, key };
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { fileName, fileType, entityType, entityId } = body as {
      fileName: string;
      fileType: string;
      entityType?: string;
      entityId?: string;
    };
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "fileName and fileType required" },
        { status: 400 }
      );
    }
    if (entityType === "inquiry" && entityId) {
      const { prisma } = await import("@/lib/db");
      const case_ = await prisma.inquiryCase.findFirst({
        where: { id: entityId },
        include: { patient: true },
      });
      if (!case_ || case_.patient.userId !== session.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }
    const { url, key } = await getPresignedUrl(
      fileName,
      fileType,
      entityType ?? "onboarding",
      entityId ?? session.id
    );
    return NextResponse.json({ url, key });
  } catch (err) {
    console.error("Presign error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
