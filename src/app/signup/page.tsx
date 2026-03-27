import { listCharities } from "@/lib/data";
import { SectionIntro, Surface } from "@/components/ui";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const message = typeof params.message === "string" ? params.message : "";
  const charities = await listCharities();

  return (
    <div className="page-section grid gap-8 pb-20 pt-12 lg:grid-cols-[0.8fr_1.2fr]">
      <Surface>
        <SectionIntro
          eyebrow="Subscriber onboarding"
          title="Create your account and choose the charity you want your subscription to back."
          description="The signup flow captures the core assignment requirements: profile creation, charity selection, and a minimum charity percentage before entering the paid subscription flow."
        />
      </Surface>

      <Surface>
        <p className="text-xs uppercase tracking-[0.3em] text-coral">Account setup</p>
        <h2 className="mt-3 font-display text-3xl text-white">Join FairwayFund</h2>
        {message ? (
          <div className="mt-6 rounded-[1.4rem] border border-coral/30 bg-coral/10 p-4 text-sm text-coral-light">
            {decodeURIComponent(message)}
          </div>
        ) : null}
        <form action="/api/auth/signup" method="post" className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm text-white/72">Full name</label>
            <input className="input" type="text" name="fullName" required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/72">Email</label>
            <input className="input" type="email" name="email" required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/72">Country</label>
            <input className="input" type="text" name="country" defaultValue="India" required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/72">Password</label>
            <input className="input" type="password" name="password" required minLength={8} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/72">Charity percentage</label>
            <input className="input" type="number" name="charityPercentage" min={10} defaultValue={10} required />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm text-white/72">Choose charity</label>
            <select className="select" name="charityId" defaultValue={charities[0]?.id}>
              {charities.map((charity) => (
                <option key={charity.id} value={charity.id}>
                  {charity.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="button-primary w-full">
              Create account
            </button>
          </div>
        </form>
      </Surface>
    </div>
  );
}
