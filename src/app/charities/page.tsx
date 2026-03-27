import Image from "next/image";
import Link from "next/link";
import { listCharities } from "@/lib/data";
import { SectionIntro, Surface } from "@/components/ui";

export default async function CharitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "all";
  const charities = await listCharities({ query, category });
  const allCharities = await listCharities();
  const categories = ["all", ...new Set(allCharities.map((charity) => charity.category.toLowerCase()))];

  return (
    <div className="page-section space-y-12 pb-20 pt-12">
      <SectionIntro
        eyebrow="Charity directory"
        title="Choose the cause that your subscription will fuel."
        description="Every subscriber selects a charity during signup, can increase their giving percentage later, and can also donate separately outside the monthly draw flow."
      />

      <Surface>
        <form className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
          <input
            className="input"
            type="search"
            name="q"
            placeholder="Search by name or mission"
            defaultValue={query}
          />
          <select className="select" name="category" defaultValue={category}>
            {categories.map((entry) => (
              <option key={entry} value={entry}>
                {entry === "all" ? "All categories" : entry}
              </option>
            ))}
          </select>
          <button type="submit" className="button-secondary">
            Apply filters
          </button>
        </form>
      </Surface>

      <div className="grid gap-6 lg:grid-cols-3">
        {charities.map((charity) => (
          <Surface key={charity.id} className="overflow-hidden p-0">
            <Image
              src={charity.image}
              alt={charity.name}
              width={1200}
              height={720}
              className="h-56 w-full object-cover"
            />
            <div className="space-y-4 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-coral">{charity.category}</p>
              <h2 className="font-display text-3xl text-white">{charity.name}</h2>
              <p className="text-sm leading-7 text-white/70">{charity.description}</p>
              <p className="text-sm font-semibold text-mist">{charity.impactMetric}</p>
              <Link href={`/charities/${charity.slug}`} className="button-secondary">
                Read profile
              </Link>
            </div>
          </Surface>
        ))}
      </div>
    </div>
  );
}
