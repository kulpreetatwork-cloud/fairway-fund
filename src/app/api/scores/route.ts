import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addScore, hasActiveSubscriberAccess, updateScore } from "@/lib/data";

export async function POST(request: Request) {
  const session = await getSession();
  const url = new URL(request.url);

  if (!session) {
    return NextResponse.redirect(new URL("/login", url.origin), 303);
  }

  const hasAccess = await hasActiveSubscriberAccess(session.user.id);

  if (!hasAccess) {
    return NextResponse.redirect(
      new URL(
        `/subscribe?message=${encodeURIComponent("Your subscription must be active to manage scores.")}`,
        url.origin,
      ),
      303,
    );
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "create");
  const score = Number(formData.get("score") ?? 0);
  const playedAt = String(formData.get("playedAt") ?? "");

  if (!Number.isFinite(score) || score < 1 || score > 45 || !playedAt) {
    return NextResponse.redirect(
      new URL(
        `/dashboard?message=${encodeURIComponent("Please enter a valid Stableford score between 1 and 45.")}`,
        url.origin,
      ),
      303,
    );
  }

  if (intent === "update") {
    await updateScore(String(formData.get("scoreId") ?? ""), score, playedAt);
  } else {
    await addScore(session.user.id, score, playedAt);
  }

  return NextResponse.redirect(
    new URL(
      `/dashboard?message=${encodeURIComponent(
        intent === "update"
          ? "Score updated successfully."
          : "Score saved. Only your latest five scores are retained.",
      )}`,
      url.origin,
    ),
    303,
  );
}
