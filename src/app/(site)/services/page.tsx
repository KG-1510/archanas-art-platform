import { EnquiryForm } from "@/components/EnquiryForm";
import { JsonLd } from "@/components/JsonLd";
import { PageIntro } from "@/components/PageIntro";
import { Reveal } from "@/components/Reveal";
import { Effect122 } from "@/components/mwg/Effect122";
import { ParadeMedia } from "@/components/mwg/ParadeMedia";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { getArtworks, getServices, getUpcomingWorkshops } from "@/lib/content";
import { formatDate, formatINR } from "@/lib/format";
import { pageMeta } from "@/lib/meta";
import { site, whatsappLink } from "@/lib/site";

export const metadata = pageMeta(
  "/services",
  "Services",
  "Art classes, workshops, demos, mandala, Nippon art and commissioned paintings with Dr. Archana Gupta in Bengaluru.",
);

export default async function ServicesPage() {
  const [services, artworks, workshops] = await Promise.all([getServices(), getArtworks(), getUpcomingWorkshops()]);
  const parade = artworks.filter((a) => a.imageUrl).slice(0, 8);

  return (
    <>
      <PageIntro eyebrow="Our services" title="Learn it, watch it made, or have it made for you">
        <p>Each of these is arranged personally, so the first step is always a conversation.</p>
      </PageIntro>

      {/* Upcoming workshops and class batches: shown once some are added in Sanity */}
      {workshops.length ? (
        <section aria-labelledby="upcoming-title" className="shell pb-20">
          <Reveal>
            <p className="eyebrow">Dates to book</p>
            <h2 id="upcoming-title" className="mt-4 text-5xl md:text-6xl">
              Upcoming workshops and classes
            </h2>
          </Reveal>
          <Reveal as="ul" stagger className="mt-12 flex flex-col">
            {workshops.map((w) => (
              <li key={w._id} className="grid gap-5 border-t border-line py-8 last:border-b md:grid-cols-[14rem_1fr_auto] md:items-start md:gap-10">
                <div>
                  <p className="font-display text-2xl text-oxblood">
                    <time dateTime={w.startDate}>{formatDate(w.startDate)}</time>
                  </p>
                  {w.endDate && w.endDate !== w.startDate ? (
                    <p className="text-sm text-muted">
                      to <time dateTime={w.endDate}>{formatDate(w.endDate)}</time>
                    </p>
                  ) : null}
                  {w.schedule ? <p className="mt-1 text-sm text-muted">{w.schedule}</p> : null}
                </div>
                <div>
                  <p className="eyebrow">{w.kind}</p>
                  <h3 className="mt-2 text-3xl">{w.title}</h3>
                  {w.description ? <p className="mt-3 max-w-xl whitespace-pre-line text-muted">{w.description}</p> : null}
                  <p className="mt-3 text-sm text-muted">
                    {w.location}
                    {w.seats ? ` · ${w.seats} seats` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-4 md:items-end">
                  <p className="text-xl font-medium tabular-nums">{typeof w.feeINR === "number" ? formatINR(w.feeINR) : "Fee on request"}</p>
                  <a
                    href={whatsappLink(`Hello, I would like to book "${w.title}" starting ${formatDate(w.startDate)}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Book on WhatsApp
                  </a>
                </div>
              </li>
            ))}
          </Reveal>
        </section>
      ) : null}

      <section aria-label="Services" className="shell pb-24">
        {services.map((s) => (
          <Reveal key={s._id}>
            <article id={s.slug} className="grid scroll-mt-28 gap-6 border-t border-line py-12 md:grid-cols-[0.8fr_1.2fr] md:gap-14 md:py-16">
              <h2 className="text-5xl md:text-6xl">{s.title}</h2>
              <div>
                <p className="text-lg">{s.summary}</p>
                {s.details.length ? (
                  <ul className="mt-6 flex flex-col gap-3 text-muted">
                    {s.details.map((d) => (
                      <li key={d} className="flex gap-4">
                        <span aria-hidden="true" className="mt-[0.8em] h-px w-6 shrink-0 bg-brass" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      {/* Made With GSAP effect 122, scaling image parade. Shown once there are painting photos. */}
      {parade.length >= 4 ? (
        <Effect122>
          <ParadeMedia artworks={parade} />
        </Effect122>
      ) : null}

      <section aria-labelledby="enquire-title" className="border-t border-line bg-surface">
        <div className="shell grid gap-12 py-24 md:grid-cols-2 md:py-28">
          <Reveal>
            <p className="eyebrow">Enquire</p>
            <h2 id="enquire-title" className="mt-4 text-5xl">
              Ask about batches, dates and fees
            </h2>
            <p className="mt-6 max-w-md text-muted">
              Tell us what you would like to learn or commission. The message goes to {site.artist}&rsquo;s WhatsApp at{" "}
              {site.phoneDisplay}.
            </p>
          </Reveal>
          <Reveal>
            <EnquiryForm topics={services.map((s) => s.title)} />
          </Reveal>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Services at Archana's Art",
          itemListElement: services.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              name: s.title,
              description: s.summary,
              url: `${site.url}/services#${s.slug}`,
              provider: { "@id": `${site.url}/#studio` },
              areaServed: "Bengaluru",
            },
          })),
        }}
      />
    </>
  );
}
