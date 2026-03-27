import Link from "next/link";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/charities", label: "Charities" },
  { href: "/draws", label: "Draws" },
  { href: "/subscribe", label: "Subscribe" },
];

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-coral text-base font-semibold text-ink">
            FF
          </span>
          <div>
            <p className="font-display text-xl text-white">FairwayFund</p>
            <p className="text-xs uppercase tracking-[0.32em] text-white/55">
              Golf for good
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-white/70 transition hover:text-white"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href={session.role === "admin" ? "/admin" : "/dashboard"}
                className={cn(
                  "rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition",
                  "hover:border-white/35 hover:bg-white/6",
                )}
              >
                {session.role === "admin" ? "Admin Panel" : "Dashboard"}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-coral"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-white/35"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-ink transition hover:bg-coral-light"
              >
                Join now
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
