import { NextResponse } from "next/server";
import { sessionCookies } from "@/lib/auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete(sessionCookies.session);
  return response;
}
