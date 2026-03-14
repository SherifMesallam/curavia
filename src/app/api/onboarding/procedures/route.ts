import { NextResponse } from "next/server";
import { getProceduresForOnboarding, getSpecializations } from "@/lib/modules/provider-onboarding/service";

export async function GET() {
  try {
    const [procedures, specializations] = await Promise.all([
      getProceduresForOnboarding(),
      getSpecializations(),
    ]);
    return NextResponse.json({ procedures, specializations });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
