import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { saveOnboardingDraft, getOnboardingDraft } from "@/lib/modules/provider-onboarding/service";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const draft = await getOnboardingDraft(session.id);
  return NextResponse.json({ draft });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const draft = await saveOnboardingDraft(session.id, {
      providerType: body.providerType,
      currentStep: body.currentStep,
      stepData: body.stepData ?? body,
    });
    return NextResponse.json({ draft });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save draft";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
