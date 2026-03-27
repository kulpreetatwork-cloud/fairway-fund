import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { publishAdminDraw } from "@/lib/data";

export async function POST(request: Request) {
  const session = await getSession();
  const url = new URL(request.url);

  if (!session || session.role !== "admin") {
    return NextResponse.redirect(new URL("/login?redirect=/admin", url.origin), 303);
  }

  const formData = await request.formData();
  const mode = String(formData.get("mode") ?? "random") as "random" | "algorithmic";
  const bias = String(formData.get("bias") ?? "frequent") as "frequent" | "rare";

  await publishAdminDraw(mode, bias);

  return NextResponse.redirect(
    new URL(
      `/admin?message=${encodeURIComponent("Official draw published and winners notified.")}`,
      url.origin,
    ),
    303,
  );
}
