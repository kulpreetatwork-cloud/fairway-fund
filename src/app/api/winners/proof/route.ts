import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasActiveSubscriberAccess, submitWinnerProof } from "@/lib/data";
import { uploadWinnerProof } from "@/lib/integrations/cloudinary";

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
        `/subscribe?message=${encodeURIComponent("Your subscription must be active to submit winner proof.")}`,
        url.origin,
      ),
      303,
    );
  }

  const formData = await request.formData();
  const drawId = String(formData.get("drawId") ?? "");
  const file = formData.get("proof");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.redirect(
      new URL(
        `/dashboard?message=${encodeURIComponent("Please select a proof screenshot before uploading.")}`,
        url.origin,
      ),
      303,
    );
  }

  const upload = await uploadWinnerProof(file);
  await submitWinnerProof(session.user.id, drawId, {
    filename: file.name,
    url: upload?.url,
    publicId: upload?.publicId,
  });

  return NextResponse.redirect(
    new URL(
      `/dashboard?message=${encodeURIComponent(
        upload
          ? "Proof uploaded to Cloudinary and submitted for review."
          : "Proof submitted in local fallback mode. Add Cloudinary keys to store the image remotely.",
      )}`,
      url.origin,
    ),
    303,
  );
}
