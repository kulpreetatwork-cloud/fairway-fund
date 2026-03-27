import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";

const secret = new TextEncoder().encode(env.authSecret);
export const SESSION_COOKIE = "dh_session";

export async function signSessionToken(payload: { userId: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  const verified = await jwtVerify(token, secret);
  return verified.payload as { userId: string; role: string };
}
