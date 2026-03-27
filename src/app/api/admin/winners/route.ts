import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateWinnerStatus } from "@/lib/data";

export async function POST(request: Request) {
  const session = await getSession();
  const url = new URL(request.url);

  if (!session || session.role !== "admin") {
    return NextResponse.redirect(new URL("/login?redirect=/admin", url.origin), 303);
  }

  const formData = await request.formData();

  await updateWinnerStatus(
    String(formData.get("winnerId") ?? ""),
    String(formData.get("verificationStatus") ?? "pending") as
      | "pending"
      | "approved"
      | "rejected",
    String(formData.get("payoutStatus") ?? "pending") as "pending" | "paid",
  );

  return NextResponse.redirect(
    new URL(
      `/admin?message=${encodeURIComponent("Winner status saved.")}`,
      url.origin,
    ),
    303,
  );
}
