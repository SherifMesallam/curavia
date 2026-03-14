import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { submitOnboarding } from "@/lib/modules/provider-onboarding/service";

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await submitOnboarding(session.id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Submission failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
