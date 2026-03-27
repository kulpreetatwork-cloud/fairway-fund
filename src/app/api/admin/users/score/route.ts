import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addAdminScoreForUser, updateScore } from "@/lib/data";

export async function POST(request: Request) {
  const session = await getSession();
  const url = new URL(request.url);

  if (!session || session.role !== "admin") {
    return NextResponse.redirect(new URL("/login?redirect=/admin", url.origin), 303);
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "create");
  const userId = String(formData.get("userId") ?? "");
  const score = Number(formData.get("score") ?? 0);
  const playedAt = String(formData.get("playedAt") ?? "");

  if (!Number.isFinite(score) || score < 1 || score > 45 || !playedAt) {
    return NextResponse.redirect(
      new URL(
        `/admin?message=${encodeURIComponent("Admin score updates require a valid date and Stableford score.")}`,
        url.origin,
      ),
      303,
    );
  }

  if (intent === "update") {
    await updateScore(String(formData.get("scoreId") ?? ""), score, playedAt);
  } else {
    await addAdminScoreForUser(userId, score, playedAt);
  }

  return NextResponse.redirect(
    new URL(
      `/admin?message=${encodeURIComponent("User score updated.")}`,
      url.origin,
    ),
    303,
  );
}
