import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

/**
 * Returns a signed URL for viewing a credential document.
 * POST body: { key: string }
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const key = body?.key as string | undefined;
    if (!key) {
      return NextResponse.json({ error: "key required" }, { status: 400 });
    }

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const BUCKET = process.env.S3_BUCKET ?? "curavia-uploads";
      const REGION = process.env.AWS_REGION ?? "us-east-1";
      const s3 = new S3Client({
        region: REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      return NextResponse.json({ url });
    }

    return NextResponse.json({
      url: null,
      message: "S3 not configured. Document key: " + key,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
