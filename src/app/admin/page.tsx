import { requireRole } from "@/lib/auth";
import {
  getAdminSnapshot,
  getCharityTotals,
  getDashboardSnapshot,
  getLatestSimulationResult,
  getPublicStats,
} from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Badge,
  DrawNumberStrip,
  EmptyState,
  MetaRow,
  SectionIntro,
  Surface,
} from "@/components/ui";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("admin");
  const params = await searchParams;
  const message = typeof params.message === "string" ? params.message : "";
  const [stats, charityTotals, admin, simulation] = await Promise.all([
    getPublicStats(),
    getCharityTotals(),
    getAdminSnapshot(),
    getLatestSimulationResult(),
  ]);
  const subscriberSnapshots = await Promise.all(
    admin.users
      .filter((user) => user.role === "subscriber")
      .map(async (user) => ({
        user,
        snapshot: await getDashboardSnapshot(user.id),
      })),
  );

  return (
    <div className="page-section space-y-8 pb-20 pt-12">
      <SectionIntro
        eyebrow="Admin control center"
        title="Manage subscribers, charities, draws, winners, and reporting from one place."
        description="This dashboard maps directly to the PRD: user management, draw configuration, charity management, winner verification, payouts, and high-level analytics."
      />
      {message ? (
        <Surface className="border-coral/30 bg-coral/10">
          <p className="text-sm text-coral-light">{decodeURIComponent(message)}</p>
        </Surface>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-4">
        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Total users</p>
          <p className="mt-4 text-2xl font-semibold text-white">{admin.users.length}</p>
        </Surface>
        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Prize pool</p>
          <p className="mt-4 text-2xl font-semibold text-white">{formatCurrency(stats.totalPrizePool)}</p>
        </Surface>
        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Charity raised</p>
          <p className="mt-4 text-2xl font-semibold text-white">{formatCurrency(stats.charityRaised)}</p>
        </Surface>
        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Draws published</p>
          <p className="mt-4 text-2xl font-semibold text-white">{admin.draws.length}</p>
        </Surface>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Surface>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-coral">Draw management</p>
              <h2 className="mt-2 font-display text-3xl text-white">Simulate and publish</h2>
            </div>
            <Badge tone="warning">Admin only</Badge>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <form action="/api/draws/simulate" method="post" className="space-y-4 rounded-[1.5rem] bg-white/[0.03] p-4">
              <p className="font-semibold text-white">Run simulation</p>
              <select className="select" name="mode" defaultValue="algorithmic">
                <option value="random">Random</option>
                <option value="algorithmic">Algorithmic</option>
              </select>
              <select className="select" name="bias" defaultValue="frequent">
                <option value="frequent">Frequent bias</option>
                <option value="rare">Rare bias</option>
              </select>
              <button type="submit" className="button-secondary w-full">
                Save simulation
              </button>
            </form>
            <form action="/api/draws/publish" method="post" className="space-y-4 rounded-[1.5rem] bg-white/[0.03] p-4">
              <p className="font-semibold text-white">Publish draw</p>
              <select className="select" name="mode" defaultValue="random">
                <option value="random">Random</option>
                <option value="algorithmic">Algorithmic</option>
              </select>
              <select className="select" name="bias" defaultValue="frequent">
                <option value="frequent">Frequent bias</option>
                <option value="rare">Rare bias</option>
              </select>
              <button type="submit" className="button-primary w-full">
                Publish official result
              </button>
            </form>
          </div>
          <div className="mt-8">
            {simulation ? (
              <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm font-semibold text-white">Latest simulation snapshot</p>
                <DrawNumberStrip numbers={simulation.numbers} />
                <MetaRow label="Eligible subscribers" value={simulation.eligibleSubscribers} />
                <MetaRow label="Projected pool" value={formatCurrency(simulation.totalPrizePool)} />
                <MetaRow label="Next rollover" value={formatCurrency(simulation.rolloverAmount)} />
              </div>
            ) : (
              <EmptyState title="No saved simulation yet" body="Run a simulation to review candidate numbers and pool splits before publishing the official draw." />
            )}
          </div>
        </Surface>

        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-coral">Charity management</p>
          <h2 className="mt-2 font-display text-3xl text-white">Directory and funding totals</h2>
          <form action="/api/admin/charities" method="post" className="mt-6 space-y-4 rounded-[1.5rem] bg-white/[0.03] p-4">
            <input type="hidden" name="intent" value="create" />
            <input className="input" type="text" name="name" placeholder="Charity name" required />
            <input className="input" type="text" name="category" placeholder="Category" required />
            <input className="input" type="text" name="shortDescription" placeholder="Short description" required />
            <input className="input" type="text" name="image" placeholder="Image URL" />
            <input className="input" type="text" name="impactMetric" placeholder="Impact metric" />
            <textarea className="textarea" name="description" placeholder="Full description" required />
            <button type="submit" className="button-secondary w-full">
              Add charity
            </button>
          </form>
          <div className="mt-6 space-y-4">
            {charityTotals.map(({ charity, total }) => (
              <div key={charity.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{charity.name}</p>
                    <p className="text-sm text-white/65">{formatCurrency(total)}</p>
                  </div>
                  <div className="flex gap-2">
                    <form action="/api/admin/charities" method="post">
                      <input type="hidden" name="intent" value="feature" />
                      <input type="hidden" name="charityId" value={charity.id} />
                      <button type="submit" className="button-secondary">
                        {charity.featured ? "Unfeature" : "Feature"}
                      </button>
                    </form>
                    <form action="/api/admin/charities" method="post">
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="charityId" value={charity.id} />
                      <button type="submit" className="button-secondary">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
                <form action="/api/admin/charities" method="post" className="mt-4 grid gap-3">
                  <input type="hidden" name="intent" value="update" />
                  <input type="hidden" name="charityId" value={charity.id} />
                  <input className="input" type="text" name="name" defaultValue={charity.name} required />
                  <input className="input" type="text" name="category" defaultValue={charity.category} required />
                  <input
                    className="input"
                    type="text"
                    name="shortDescription"
                    defaultValue={charity.shortDescription}
                    required
                  />
                  <input className="input" type="text" name="image" defaultValue={charity.image} required />
                  <input
                    className="input"
                    type="text"
                    name="impactMetric"
                    defaultValue={charity.impactMetric}
                    required
                  />
                  <textarea className="textarea" name="description" defaultValue={charity.description} required />
                  <button type="submit" className="button-secondary w-full">
                    Save charity content
                  </button>
                </form>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-coral">User management</p>
          <h2 className="mt-2 font-display text-3xl text-white">Profiles, scores, and subscription states</h2>
          <div className="mt-6 space-y-4">
            {subscriberSnapshots.map(({ user, snapshot }) => (
              <div key={user.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{user.fullName}</p>
                    <p className="text-sm text-white/65">{user.email}</p>
                  </div>
                  <Badge tone="neutral">{user.country}</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {snapshot.scores.slice(0, 5).map((scoreEntry) => (
                    <form
                      key={scoreEntry.id}
                      action="/api/admin/users/score"
                      method="post"
                      className="grid gap-3 rounded-[1.25rem] bg-white/[0.04] p-4 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <input type="hidden" name="intent" value="update" />
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="scoreId" value={scoreEntry.id} />
                      <input
                        className="input"
                        type="number"
                        name="score"
                        min={1}
                        max={45}
                        defaultValue={scoreEntry.score}
                        required
                      />
                      <input
                        className="input"
                        type="date"
                        name="playedAt"
                        defaultValue={scoreEntry.playedAt}
                        required
                      />
                      <button type="submit" className="button-secondary">
                        Save score
                      </button>
                    </form>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <form action="/api/admin/users/score" method="post" className="space-y-3 rounded-[1.25rem] bg-white/[0.04] p-4">
                    <input type="hidden" name="userId" value={user.id} />
                    <input className="input" type="number" name="score" min={1} max={45} placeholder="New score" required />
                    <input className="input" type="date" name="playedAt" required />
                    <button type="submit" className="button-secondary w-full">
                      Add score
                    </button>
                  </form>
                  <form action="/api/admin/subscriptions" method="post" className="space-y-3 rounded-[1.25rem] bg-white/[0.04] p-4">
                    <input type="hidden" name="userId" value={user.id} />
                    <select className="select" name="status" defaultValue="active">
                      <option value="active">active</option>
                      <option value="past_due">past_due</option>
                      <option value="canceled">canceled</option>
                      <option value="lapsed">lapsed</option>
                      <option value="incomplete">incomplete</option>
                    </select>
                    <button type="submit" className="button-secondary w-full">
                      Update subscription
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-coral">Winners management</p>
          <h2 className="mt-2 font-display text-3xl text-white">Verification and payout controls</h2>
          <div className="mt-6 space-y-4">
            {admin.winners.length === 0 ? (
              <EmptyState title="No winners to review" body="Publish a draw with winners to begin the proof verification flow." />
            ) : (
              admin.winners.map((winner) => (
                <div key={winner.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{winner.matchCount}-slot winner</p>
                      <p className="text-sm text-white/65">
                        Proof: {winner.proofFilename ?? "Awaiting upload"}
                      </p>
                    </div>
                    <Badge tone={winner.payoutStatus === "paid" ? "success" : "warning"}>
                      {winner.payoutStatus}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-white/68">
                    Amount: {formatCurrency(winner.amount)} • Uploaded:{" "}
                    {winner.proofUploadedAt ? formatDate(winner.proofUploadedAt) : "Not yet"}
                  </p>
                  <form action="/api/admin/winners" method="post" className="mt-4 grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="winnerId" value={winner.id} />
                    <select className="select" name="verificationStatus" defaultValue={winner.verificationStatus}>
                      <option value="pending">pending</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                    </select>
                    <select className="select" name="payoutStatus" defaultValue={winner.payoutStatus}>
                      <option value="pending">pending</option>
                      <option value="paid">paid</option>
                    </select>
                    <div className="md:col-span-2">
                      <button type="submit" className="button-primary w-full">
                        Save winner status
                      </button>
                    </div>
                  </form>
                </div>
              ))
            )}
          </div>
        </Surface>
      </div>

      <Surface>
        <p className="text-xs uppercase tracking-[0.3em] text-coral">Analytics and activity</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {admin.notifications.slice(0, 6).map((notification) => (
            <div key={notification.id} className="rounded-[1.5rem] bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-white/42">{formatDate(notification.createdAt)}</p>
              <p className="mt-3 font-semibold text-white">{notification.subject}</p>
              <p className="mt-2 text-sm leading-7 text-white/68">{notification.message}</p>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
