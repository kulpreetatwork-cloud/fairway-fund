import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateCharitySelection } from "@/lib/data";

export async function POST(request: Request) {
  const session = await getSession();
  const url = new URL(request.url);

  if (!session) {
    return NextResponse.redirect(new URL("/login", url.origin), 303);
  }

  const formData = await request.formData();

  await updateCharitySelection(
    session.user.id,
    String(formData.get("charityId") ?? session.user.selectedCharityId),
    Number(formData.get("charityPercentage") ?? session.user.charityPercentage),
  );

  return NextResponse.redirect(
    new URL(
      `/dashboard?message=${encodeURIComponent("Charity preferences updated.")}`,
      url.origin,
    ),
    303,
  );
}
