import Link from "next/link";
import {
  getCharityTotals,
  getCredentials,
  getPublicStats,
  listCharities,
  listPublishedDraws,
} from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { DrawNumberStrip, SectionIntro, StatCard, Surface } from "@/components/ui";

export default async function Home() {
  const [stats, charities, latestDraws, totals, credentials] = await Promise.all([
    getPublicStats(),
    listCharities(),
    listPublishedDraws(),
    getCharityTotals(),
    getCredentials(),
  ]);
  const featured = charities.find((charity) => charity.featured) ?? charities[0];
  const latestDraw =
    latestDraws[0] ??
    ({
      id: "pending",
      title: "Upcoming draw",
      monthLabel: "Pending publish",
      scheduledFor: new Date().toISOString(),
      drawMode: "random",
      status: "simulation",
      numbers: [0, 0, 0, 0, 0],
      totalPrizePool: stats.totalPrizePool,
      rolloverAmount: 0,
    } as const);

  return (
    <div className="space-y-24 pb-20 pt-8 sm:pt-12">
      <section className="page-section">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="reveal space-y-8">
            <SectionIntro
              eyebrow="Golf x Giving"
              title="Subscription golf, monthly draws, and charity impact in one modern platform."
              description="FairwayFund turns every subscription into a live charity commitment, a rolling performance-based draw ticket, and a sharply designed dashboard for both players and admins."
            />
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/subscribe" className="button-primary">
                Start subscription
              </Link>
              <Link href="/draws" className="button-secondary">
                Explore draw engine
              </Link>
            </div>
            <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Demo user</p>
                <p className="mt-2 font-semibold text-white">{credentials.subscriber.email}</p>
                <p className="text-white/70">{credentials.subscriber.password}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Demo admin</p>
                <p className="mt-2 font-semibold text-white">{credentials.admin.email}</p>
                <p className="text-white/70">{credentials.admin.password}</p>
              </div>
            </div>
          </div>

          <Surface className="gradient-border overflow-hidden bg-[radial-gradient(circle_at_top,#23344d,transparent_55%),rgba(8,14,24,0.8)]">
            <p className="text-xs uppercase tracking-[0.32em] text-coral">Featured charity</p>
            <h3 className="mt-4 font-display text-4xl text-white">{featured.name}</h3>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
              {featured.description}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <StatCard
                label="Prize pool"
                value={formatCurrency(stats.totalPrizePool)}
                helper="Live total from active subscriptions before tier splits."
              />
              <StatCard
                label="Charity raised"
                value={formatCurrency(stats.charityRaised)}
                helper="Subscription-linked giving plus standalone donations."
              />
            </div>
          </Surface>
        </div>
      </section>

      <section className="page-section grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active subscribers" value={String(stats.activeSubscribers)} helper="Subscribers with active access and prize eligibility." />
        <StatCard label="Supported charities" value={String(stats.charitiesSupported)} helper="Public charity directory with spotlight support." />
        <StatCard label="Latest draw" value={latestDraw.monthLabel} helper="Admin-published monthly result with snapshot tickets." />
        <StatCard label="Featured impact" value={totals[0] ? formatCurrency(totals[0].total) : formatCurrency(0)} helper="Highest current charity total in the demo seed." />
      </section>

      <section className="page-section grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Surface>
          <p className="text-xs uppercase tracking-[0.32em] text-coral">How it works</p>
          <div className="mt-6 space-y-6">
            {[
              "Pick a monthly or yearly subscription and select a charity at signup.",
              "Enter your latest five Stableford scores. The system keeps only the most recent five.",
              "Each month your five score slots become your draw ticket. Admins can simulate before publishing.",
              "Prize tiers pay on 5, 4, or 3 slot matches, while unclaimed 5-match jackpots roll forward.",
            ].map((item, index) => (
              <div key={item} className="flex gap-4">
                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-coral text-sm font-semibold text-ink">
                  {index + 1}
                </span>
                <p className="text-sm leading-7 text-white/74">{item}</p>
              </div>
            ))}
          </div>
        </Surface>
        <Surface>
          <p className="text-xs uppercase tracking-[0.32em] text-coral">Published numbers</p>
          <h3 className="mt-4 font-display text-3xl text-white">{latestDraw.title}</h3>
          <p className="mt-3 text-sm leading-7 text-white/68">
            The current demo result shows how published numbers, tier pools, and verified winners are surfaced publicly.
          </p>
          <div className="mt-6">
            <DrawNumberStrip numbers={latestDraw.numbers} />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Surface className="bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/42">5 match</p>
              <p className="mt-3 text-2xl font-semibold text-white">40%</p>
            </Surface>
            <Surface className="bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/42">4 match</p>
              <p className="mt-3 text-2xl font-semibold text-white">35%</p>
            </Surface>
            <Surface className="bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/42">3 match</p>
              <p className="mt-3 text-2xl font-semibold text-white">25%</p>
            </Surface>
          </div>
        </Surface>
      </section>

      <section className="page-section">
        <Surface>
          <SectionIntro
            eyebrow="Charity directory"
            title="Causes are front and center, not buried behind the sport."
            description="Every charity profile includes storytelling, impact highlights, and upcoming fundraising events so the product feels purpose-led before it feels game-led."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {charities.map((charity) => (
              <div key={charity.id} className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-coral">{charity.category}</p>
                <h3 className="mt-3 font-display text-2xl text-white">{charity.name}</h3>
                <p className="mt-3 text-sm leading-7 text-white/70">{charity.shortDescription}</p>
                <p className="mt-5 text-sm font-semibold text-mist">{charity.impactMetric}</p>
                <Link href={`/charities/${charity.slug}`} className="mt-6 inline-flex text-sm font-semibold text-coral-light">
                  View profile
                </Link>
              </div>
            ))}
          </div>
        </Surface>
      </section>
    </div>
  );
}
