import Image from "next/image";
import { notFound } from "next/navigation";
import { getCharityBySlug } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { LabelValue, SectionIntro, Surface } from "@/components/ui";

export default async function CharityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const charity = await getCharityBySlug(slug);

  if (!charity) {
    notFound();
  }

  return (
    <div className="page-section space-y-12 pb-20 pt-12">
      <Surface className="overflow-hidden p-0">
        <Image
          src={charity.image}
          alt={charity.name}
          width={1400}
          height={900}
          className="h-72 w-full object-cover sm:h-96"
        />
        <div className="grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionIntro
            eyebrow={charity.category}
            title={charity.name}
            description={charity.description}
          />
          <Surface className="bg-white/[0.03]">
            <LabelValue label="Impact highlight" value={charity.impactMetric} />
            <div className="mt-6 space-y-3">
              <p className="text-xs uppercase tracking-[0.28em] text-white/42">Upcoming events</p>
              {charity.events.map((event) => (
                <div key={event.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="mt-2 text-sm text-white/70">
                    {formatDate(event.date)} at {event.venue}
                  </p>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </Surface>
    </div>
  );
}
