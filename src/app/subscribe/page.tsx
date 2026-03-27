import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getSettings, listCharities } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { calculateSubscriptionContribution } from "@/lib/draw";
import { SectionIntro, Surface } from "@/components/ui";

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const message = typeof params.message === "string" ? params.message : "";
  const [charities, settings] = await Promise.all([listCharities(), getSettings()]);
  const activeContribution = session
    ? calculateSubscriptionContribution(settings, {
        id: "preview",
        userId: session.user.id,
        plan: "monthly",
        status: "active",
        renewalDate: "",
        startedAt: "",
      }, session.user)
    : null;

  return (
    <div className="page-section space-y-8 pb-20 pt-12">
      <SectionIntro
        eyebrow="Subscription checkout"
        title="Choose a plan, set your charity split, and activate your monthly draw access."
        description="Stripe test mode is wired for real credentials, but this build also supports a demo-mode fallback so the assignment stays functional without live keys."
      />
      {!session ? (
        <Surface>
          <p className="text-sm leading-7 text-white/72">
            Create an account or sign in first to activate a subscription and tie it to your dashboard.
          </p>
        </Surface>
      ) : null}
      {message ? (
        <Surface className="border-coral/30 bg-coral/10">
          <p className="text-sm text-coral-light">{decodeURIComponent(message)}</p>
        </Surface>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Surface>
          <h2 className="font-display text-3xl text-white">Activate subscription</h2>
          <form action="/api/stripe/checkout" method="post" className="mt-6 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="checkoutType" value="subscription" />
            <div>
              <label className="mb-2 block text-sm text-white/72">Plan</label>
              <select className="select" name="plan" defaultValue="monthly">
                <option value="monthly">Monthly - {formatCurrency(settings.monthlyPrice)}</option>
                <option value="yearly">Yearly - {formatCurrency(settings.yearlyPrice)}</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/72">Charity percentage</label>
              <input
                className="input"
                type="number"
                name="charityPercentage"
                min={settings.minimumCharityPercentage}
                defaultValue={session?.user.charityPercentage ?? settings.minimumCharityPercentage}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm text-white/72">Charity</label>
              <select className="select" name="charityId" defaultValue={session?.user.selectedCharityId}>
                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              {session ? (
                <button type="submit" className="button-primary w-full">
                  Start subscription
                </button>
              ) : (
                <Link
                  href="/login?redirect=/subscribe"
                  className="button-primary w-full"
                >
                  Login to subscribe
                </Link>
              )}
            </div>
          </form>
        </Surface>

        <Surface>
          <h2 className="font-display text-3xl text-white">Independent donation</h2>
          <form action="/api/stripe/checkout" method="post" className="mt-6 space-y-4">
            <input type="hidden" name="checkoutType" value="donation" />
            <div>
              <label className="mb-2 block text-sm text-white/72">Charity</label>
              <select className="select" name="charityId" defaultValue={charities[0]?.id}>
                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/72">Donation amount</label>
              <input className="input" type="number" name="amount" min={100} defaultValue={500} required />
            </div>
            <button type="submit" className="button-secondary w-full">
              Donate now
            </button>
          </form>
          {activeContribution ? (
            <div className="mt-8 rounded-[1.5rem] bg-white/[0.04] p-5 text-sm text-white/72">
              <p className="font-semibold text-white">Current monthly projection</p>
              <p className="mt-3">Prize pool contribution: {formatCurrency(activeContribution.prizeContribution)}</p>
              <p className="mt-1">Charity contribution: {formatCurrency(activeContribution.charityContribution)}</p>
            </div>
          ) : null}
        </Surface>
      </div>
    </div>
  );
}
