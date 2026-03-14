import { NextResponse } from "next/server";
import { createAccount } from "@/lib/modules/provider-onboarding/service";
import { step1AccountSchema } from "@/lib/modules/provider-onboarding/validations";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = step1AccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const user = await createAccount({
      email: parsed.data.email,
      password: parsed.data.password,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
    });
    await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return NextResponse.json({ success: true, userId: user.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
