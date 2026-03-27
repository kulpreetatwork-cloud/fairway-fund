import { requireAnyUser } from "@/lib/auth";
import { getDashboardSnapshot, getSettings, listCharities } from "@/lib/data";
import { calculateSubscriptionContribution } from "@/lib/draw";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Badge,
  DrawNumberStrip,
  EmptyState,
  MetaRow,
  ScorePill,
  SectionIntro,
  Surface,
} from "@/components/ui";

function statusTone(status?: string) {
  if (status === "active") return "success";
  if (status === "past_due" || status === "lapsed") return "warning";
  if (status === "canceled") return "danger";
  return "neutral";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAnyUser();
  const params = await searchParams;
  const message = typeof params.message === "string" ? params.message : "";
  const [snapshot, settings, charities] = await Promise.all([
    getDashboardSnapshot(session.user.id),
    getSettings(),
    listCharities(),
  ]);
  const contribution = snapshot.subscription
    ? calculateSubscriptionContribution(settings, snapshot.subscription, snapshot.profile)
    : null;
  const hasActiveAccess = snapshot.subscription?.status === "active";
  const latestTicket = snapshot.scores.slice(0, 5).map((entry) => entry.score);

  return (
    <div className="page-section space-y-8 pb-20 pt-12">
      <SectionIntro
        eyebrow="Subscriber dashboard"
        title={`Welcome back, ${snapshot.profile.fullName.split(" ")[0]}.`}
        description="This workspace covers the full PRD dashboard scope: subscription health, score management, selected charity settings, participation summary, winnings, and proof upload."
      />
      {message ? (
        <Surface className="border-coral/30 bg-coral/10">
          <p className="text-sm text-coral-light">{decodeURIComponent(message)}</p>
        </Surface>
      ) : null}
      {!hasActiveAccess ? (
        <Surface className="border-amber-500/30 bg-amber-500/10">
          <p className="text-sm text-amber-100">
            Your subscription is currently {snapshot.subscription?.status ?? "inactive"}.
            You can still review your dashboard, but paid actions stay locked until you reactivate.
          </p>
        </Surface>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-4">
        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Subscription</p>
          <p className="mt-4 text-2xl font-semibold text-white">
            {snapshot.subscription?.plan ?? "No active plan"}
          </p>
          <div className="mt-4">
            <Badge tone={statusTone(snapshot.subscription?.status)}>
              {snapshot.subscription?.status ?? "inactive"}
            </Badge>
          </div>
        </Surface>
        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Renewal</p>
          <p className="mt-4 text-2xl font-semibold text-white">
            {snapshot.subscription ? formatDate(snapshot.subscription.renewalDate) : "Pending"}
          </p>
        </Surface>
        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Draws entered</p>
          <p className="mt-4 text-2xl font-semibold text-white">{snapshot.drawsEntered}</p>
        </Surface>
        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Total won</p>
          <p className="mt-4 text-2xl font-semibold text-white">
            {formatCurrency(snapshot.winnings.reduce((sum, winner) => sum + winner.amount, 0))}
          </p>
        </Surface>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Surface>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-coral">Score manager</p>
              <h2 className="mt-2 font-display text-3xl text-white">Latest five scores</h2>
            </div>
            <Badge tone={snapshot.scores.length >= 5 ? "success" : "warning"}>
              {snapshot.scores.length}/5 stored
            </Badge>
          </div>

          {snapshot.scores.length ? (
            <div className="mt-6 space-y-4">
              {snapshot.scores.slice(0, 5).map((entry) => (
                <form
                  key={entry.id}
                  action="/api/scores"
                  method="post"
                  className="grid gap-4 rounded-[1.5rem] bg-white/[0.04] p-4 md:grid-cols-[auto_1fr_1fr_auto]"
                >
                  <input type="hidden" name="intent" value="update" />
                  <input type="hidden" name="scoreId" value={entry.id} />
                  <div className="self-center">
                    <ScorePill score={entry.score} />
                  </div>
                  <input
                    className="input"
                    type="number"
                    name="score"
                    min={1}
                    max={45}
                    defaultValue={entry.score}
                    required
                  />
                  <input
                    className="input"
                    type="date"
                    name="playedAt"
                    defaultValue={entry.playedAt}
                    required
                  />
                  <button type="submit" className="button-secondary self-center" disabled={!hasActiveAccess}>
                    Save edit
                  </button>
                </form>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState title="No scores yet" body="Add your last five Stableford scores to unlock a complete monthly draw ticket." />
            </div>
          )}

          <form action="/api/scores" method="post" className="mt-8 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-sm text-white/72">Stableford score</label>
              <input className="input" type="number" name="score" min={1} max={45} required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/72">Played date</label>
              <input className="input" type="date" name="playedAt" required />
            </div>
            <div className="self-end">
              <button type="submit" className="button-primary w-full sm:w-auto" disabled={!hasActiveAccess}>
                Add score
              </button>
            </div>
          </form>
        </Surface>

        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-coral">Participation snapshot</p>
          <h2 className="mt-2 font-display text-3xl text-white">Your current ticket</h2>
          <div className="mt-6">
            {latestTicket.length === 5 ? (
              <DrawNumberStrip numbers={latestTicket} />
            ) : (
              <EmptyState title="Complete your ticket" body="Your latest five scores will appear here in reverse chronological order." />
            )}
          </div>
          <div className="mt-8">
            <MetaRow label="Next draw" value={formatDate(snapshot.nextDrawDate)} />
            <MetaRow label="Selected charity" value={snapshot.selectedCharity?.name ?? "None"} />
            <MetaRow label="Contribution rate" value={`${snapshot.profile.charityPercentage}%`} />
            <MetaRow
              label="Projected charity share"
              value={contribution ? formatCurrency(contribution.charityContribution) : "Pending"}
            />
          </div>
          <form action="/api/charity" method="post" className="mt-8 grid gap-4">
            <div>
              <label className="mb-2 block text-sm text-white/72">Selected charity</label>
              <select className="select" name="charityId" defaultValue={snapshot.selectedCharity?.id}>
                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/72">Contribution percentage</label>
              <input
                className="input"
                type="number"
                name="charityPercentage"
                min={settings.minimumCharityPercentage}
                defaultValue={snapshot.profile.charityPercentage}
                required
              />
            </div>
            <button type="submit" className="button-secondary">
              Update giving
            </button>
          </form>
          <form action="/api/subscription/cancel" method="post" className="mt-4">
            <button type="submit" className="button-secondary w-full">
              Cancel subscription
            </button>
          </form>
        </Surface>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-coral">Winnings</p>
          <h2 className="mt-2 font-display text-3xl text-white">Verification and payouts</h2>
          <div className="mt-6 space-y-4">
            {snapshot.winnings.length === 0 ? (
              <EmptyState title="No winning claims yet" body="Once you match 3, 4, or 5 slots in a published draw, your claim will appear here for verification." />
            ) : (
              snapshot.winnings.map((winner) => (
                <div key={winner.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-white">{winner.matchCount}-slot match</p>
                    <Badge tone={winner.payoutStatus === "paid" ? "success" : "warning"}>
                      {winner.payoutStatus}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-white/70">
                    Verification: {winner.verificationStatus}
                  </p>
                  {winner.proofUrl ? (
                    <a
                      href={winner.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-sm font-semibold text-coral-light"
                    >
                      View uploaded proof
                    </a>
                  ) : null}
                  <p className="mt-1 text-sm font-semibold text-mist">
                    {formatCurrency(winner.amount)}
                  </p>
                  <form action="/api/winners/proof" method="post" encType="multipart/form-data" className="mt-4 space-y-3">
                    <input type="hidden" name="drawId" value={winner.drawId} />
                    <input className="input" type="file" name="proof" />
                    <button type="submit" className="button-secondary w-full" disabled={!hasActiveAccess}>
                      Upload proof
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </Surface>

        <Surface>
          <p className="text-xs uppercase tracking-[0.3em] text-coral">Status detail</p>
          <h2 className="mt-2 font-display text-3xl text-white">Account summary</h2>
          <div className="mt-6">
            <MetaRow label="Email" value={snapshot.profile.email} />
            <MetaRow label="Country" value={snapshot.profile.country} />
            <MetaRow label="Plan" value={snapshot.subscription?.plan ?? "Not active"} />
            <MetaRow
              label="Prize contribution"
              value={contribution ? formatCurrency(contribution.prizeContribution) : "Pending"}
            />
            <MetaRow
              label="Proof uploads"
              value={String(snapshot.winnings.filter((winner) => winner.proofFilename).length)}
            />
          </div>
        </Surface>
      </div>
    </div>
  );
}
