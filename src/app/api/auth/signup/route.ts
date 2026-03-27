import { NextResponse } from "next/server";
import { createProfile } from "@/lib/data";
import { sessionCookies } from "@/lib/auth";
import { signSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  const formData = await request.formData();
  const url = new URL(request.url);

  try {
    const user = await createProfile({
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      country: String(formData.get("country") ?? ""),
      charityId: String(formData.get("charityId") ?? ""),
      charityPercentage: Number(formData.get("charityPercentage") ?? 10),
    });

    const response = NextResponse.redirect(
      new URL(
        `/subscribe?message=${encodeURIComponent("Account created. Complete your subscription to unlock the dashboard.")}`,
        url.origin,
      ),
      303,
    );

    response.cookies.set(sessionCookies.session, await signSessionToken({
      userId: user.id,
      role: user.role,
    }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create account.";
    return NextResponse.redirect(
      new URL(`/signup?message=${encodeURIComponent(message)}`, url.origin),
      303,
    );
  }
}
