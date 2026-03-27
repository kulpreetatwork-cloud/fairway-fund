import { v2 as cloudinary } from "cloudinary";
import { hasCloudinaryConfig, env } from "@/lib/env";

let configured = false;

function ensureConfig() {
  if (!hasCloudinaryConfig()) {
    return false;
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: env.cloudinaryCloudName,
      api_key: env.cloudinaryApiKey,
      api_secret: env.cloudinaryApiSecret,
    });
    configured = true;
  }

  return true;
}

export async function uploadWinnerProof(file: File) {
  if (!ensureConfig()) {
    return null;
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUri = `data:${file.type || "application/octet-stream"};base64,${base64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "fairwayfund/winner-proofs",
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}
