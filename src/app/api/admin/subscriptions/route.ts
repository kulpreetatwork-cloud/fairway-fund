import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateSubscriptionStatus } from "@/lib/data";

export async function POST(request: Request) {
  const session = await getSession();
  const url = new URL(request.url);

  if (!session || session.role !== "admin") {
    return NextResponse.redirect(new URL("/login?redirect=/admin", url.origin), 303);
  }

  const formData = await request.formData();

  await updateSubscriptionStatus(
    String(formData.get("userId") ?? ""),
    String(formData.get("status") ?? "active") as
      | "active"
      | "past_due"
      | "canceled"
      | "lapsed"
      | "incomplete",
  );

  return NextResponse.redirect(
    new URL(
      `/admin?message=${encodeURIComponent("Subscription status updated.")}`,
      url.origin,
    ),
    303,
  );
}
