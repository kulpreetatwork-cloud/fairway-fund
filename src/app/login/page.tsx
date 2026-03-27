import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getCredentials } from "@/lib/data";
import { redirect } from "next/navigation";
import { SectionIntro, Surface } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();

  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/dashboard");
  }

  const params = await searchParams;
  const message = typeof params.message === "string" ? params.message : "";
  const redirectTo = typeof params.redirect === "string" ? params.redirect : "";
  const credentials = await getCredentials();

  return (
    <div className="page-section grid gap-8 pb-20 pt-12 lg:grid-cols-[0.8fr_1.2fr]">
      <Surface>
        <SectionIntro
          eyebrow="Welcome back"
          title="Log in to manage scores, draws, and charity impact."
          description="Demo credentials are pre-seeded so you can test both the subscriber and admin paths immediately."
        />
        <div className="mt-8 space-y-4 rounded-[1.75rem] bg-white/[0.04] p-5 text-sm text-white/72">
          <p>Subscriber: {credentials.subscriber.email} / {credentials.subscriber.password}</p>
          <p>Admin: {credentials.admin.email} / {credentials.admin.password}</p>
        </div>
      </Surface>

      <Surface>
        <p className="text-xs uppercase tracking-[0.3em] text-coral">Session access</p>
        <h2 className="mt-3 font-display text-3xl text-white">Sign in</h2>
        {message ? (
          <div className="mt-6 rounded-[1.4rem] border border-coral/30 bg-coral/10 p-4 text-sm text-coral-light">
            {decodeURIComponent(message)}
          </div>
        ) : null}
        <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div>
            <label className="mb-2 block text-sm text-white/72">Email</label>
            <input className="input" type="email" name="email" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/72">Password</label>
            <input className="input" type="password" name="password" placeholder="••••••••" required />
          </div>
          <button type="submit" className="button-primary w-full">
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-white/60">
          Need an account? <Link href="/signup" className="text-coral-light">Create one</Link>
        </p>
      </Surface>
    </div>
  );
}
