import { listPublishedDraws, listRecentWinners } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge, DrawNumberStrip, EmptyState, SectionIntro, Surface } from "@/components/ui";

export default async function DrawsPage() {
  const [draws, winners] = await Promise.all([listPublishedDraws(), listRecentWinners()]);

  return (
    <div className="page-section space-y-12 pb-20 pt-12">
      <SectionIntro
        eyebrow="Monthly draw engine"
        title="Every published draw is snapshot-based, tier-split, and admin controlled."
        description="The admin panel supports random or algorithmic simulations before publish. Once published, each active subscriber’s five-slot ticket is frozen so later score edits cannot change historical outcomes."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-coral">Logic summary</p>
          <div className="mt-6 space-y-4 text-sm leading-7 text-white/72">
            <p>Subscribers enter Stableford scores from 1 to 45, each with a played date.</p>
            <p>Only the latest five scores are stored. Those five ordered slots become the monthly draw ticket.</p>
            <p>Matches are position-based, duplicates are allowed, and 5-match jackpots roll to the next month if unclaimed.</p>
            <p>Tier distribution is automatic: 40% for 5 matches, 35% for 4 matches, and 25% for 3 matches.</p>
          </div>
        </Surface>
        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-coral">Winner verification</p>
          <div className="mt-6 space-y-4 text-sm leading-7 text-white/72">
            <p>Winning subscribers upload proof from their golf platform screenshot.</p>
            <p>Admins review and approve or reject each proof before payment is marked as completed.</p>
            <p>Dashboard status cards show both verification state and payout progression.</p>
          </div>
        </Surface>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {draws.map((draw) => (
            <Surface key={draw.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-coral">{draw.monthLabel}</p>
                  <h2 className="mt-2 font-display text-3xl text-white">{draw.title}</h2>
                </div>
                <Badge tone="success">{draw.drawMode} publish</Badge>
              </div>
              <div className="mt-6">
                <DrawNumberStrip numbers={draw.numbers} />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.5rem] bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/42">Prize pool</p>
                  <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(draw.totalPrizePool)}</p>
                </div>
                <div className="rounded-[1.5rem] bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/42">Rollover</p>
                  <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(draw.rolloverAmount)}</p>
                </div>
                <div className="rounded-[1.5rem] bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/42">Scheduled</p>
                  <p className="mt-2 text-xl font-semibold text-white">{formatDate(draw.scheduledFor)}</p>
                </div>
              </div>
            </Surface>
          ))}
        </div>

        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-coral">Recent winners</p>
          <div className="mt-6 space-y-4">
            {winners.length === 0 ? (
              <EmptyState title="No winners yet" body="Publish the first draw to begin populating the public winners feed." />
            ) : (
              winners.map((winner) => (
                <div key={winner.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-white">{winner.matchCount}-slot match</p>
                    <Badge tone={winner.payoutStatus === "paid" ? "success" : "warning"}>
                      {winner.payoutStatus}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-white/70">
                    Verification: {winner.verificationStatus}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-mist">
                    {formatCurrency(winner.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Surface>
      </div>
    </div>
  );
}
