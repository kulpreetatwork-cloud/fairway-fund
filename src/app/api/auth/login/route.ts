import { NextResponse } from "next/server";
import { authenticate } from "@/lib/data";
import { sessionCookies } from "@/lib/auth";
import { signSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "");
  const user = await authenticate(email, password);
  const url = new URL(request.url);

  if (!user) {
    return NextResponse.redirect(
      new URL(
        `/login?message=${encodeURIComponent("Invalid demo credentials.")}`,
        url.origin,
      ),
      303,
    );
  }

  const response = NextResponse.redirect(
    new URL(redirectTo || (user.role === "admin" ? "/admin" : "/dashboard"), url.origin),
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
}
