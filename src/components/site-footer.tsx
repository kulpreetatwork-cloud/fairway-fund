import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 text-sm text-white/65 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="space-y-3">
          <p className="font-display text-2xl text-white">FairwayFund</p>
          <p className="max-w-xl">
            A modern golf subscription experience built around charity impact,
            recurring prize pools, and transparent admin controls.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-white/40">Explore</p>
            <Link href="/charities" className="block transition hover:text-white">
              Charity directory
            </Link>
            <Link href="/draws" className="block transition hover:text-white">
              Draw system
            </Link>
            <Link href="/subscribe" className="block transition hover:text-white">
              Subscription flow
            </Link>
          </div>
          <div className="space-y-2 break-words">
            <p className="text-xs uppercase tracking-[0.32em] text-white/40">Demo</p>
            <p>
              Subscriber:
              <span className="ml-1 font-medium text-white">
                rhea@fairwayfund.demo / Demo123!
              </span>
            </p>
            <p>
              Admin:
              <span className="ml-1 font-medium text-white">
                admin@fairwayfund.demo / Admin123!
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
