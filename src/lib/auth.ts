import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProfileById, hasActiveSubscriberAccess } from "@/lib/data";
import { Role } from "@/lib/types";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifySessionToken(token);
    const user = await getProfileById(payload.userId);

    if (!user) {
      return null;
    }

    return { user, role: payload.role as Role };
  } catch {
    return null;
  }
}

export async function requireRole(role: Role) {
  const session = await getSession();

  if (!session || session.role !== role) {
    redirect(role === "admin" ? "/login?redirect=/admin" : "/login?redirect=/dashboard");
  }

  return session;
}

export async function requireAnyUser() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireActiveSubscriber() {
  const session = await requireAnyUser();

  if (session.role !== "subscriber") {
    redirect("/login?message=Subscriber%20access%20required.");
  }

  const hasAccess = await hasActiveSubscriberAccess(session.user.id);

  if (!hasAccess) {
    redirect(
      "/subscribe?message=Your%20subscription%20is%20inactive.%20Activate%20or%20renew%20to%20use%20subscriber%20features.",
    );
  }

  return session;
}

export const sessionCookies = {
  session: SESSION_COOKIE,
};
