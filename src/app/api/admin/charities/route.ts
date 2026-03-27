import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  addCharity,
  deleteCharity,
  toggleFeaturedCharity,
  updateCharity,
} from "@/lib/data";

export async function POST(request: Request) {
  const session = await getSession();
  const url = new URL(request.url);

  if (!session || session.role !== "admin") {
    return NextResponse.redirect(new URL("/login?redirect=/admin", url.origin), 303);
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "create");

  if (intent === "create") {
    await addCharity({
      name: String(formData.get("name") ?? ""),
      category: String(formData.get("category") ?? ""),
      shortDescription: String(formData.get("shortDescription") ?? ""),
      description: String(formData.get("description") ?? ""),
      image: String(formData.get("image") ?? ""),
      impactMetric: String(formData.get("impactMetric") ?? ""),
    });
  } else if (intent === "update") {
    await updateCharity({
      charityId: String(formData.get("charityId") ?? ""),
      name: String(formData.get("name") ?? ""),
      category: String(formData.get("category") ?? ""),
      shortDescription: String(formData.get("shortDescription") ?? ""),
      description: String(formData.get("description") ?? ""),
      image: String(formData.get("image") ?? ""),
      impactMetric: String(formData.get("impactMetric") ?? ""),
    });
  } else if (intent === "feature") {
    await toggleFeaturedCharity(String(formData.get("charityId") ?? ""));
  } else if (intent === "delete") {
    await deleteCharity(String(formData.get("charityId") ?? ""));
  }

  return NextResponse.redirect(
    new URL(
      `/admin?message=${encodeURIComponent("Charity directory updated.")}`,
      url.origin,
    ),
    303,
  );
}
