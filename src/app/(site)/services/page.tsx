import { EnquiryForm } from "@/components/EnquiryForm";
import { JsonLd } from "@/components/JsonLd";
import { PageIntro } from "@/components/PageIntro";
import { Reveal } from "@/components/Reveal";
import { getServices } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { site } from "@/lib/site";

export const metadata = pageMeta(
  "/services",
  "Services",
  "Art classes, workshops, demos, mandala, Nippon art and commissioned paintings with Dr. Archana Gupta in Bengaluru.",
);

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageIntro eyebrow="Our services" title="Learn it, watch it made, or have it made for you">
        <p>Each of these is arranged personally, so the first step is always a conversation.</p>
      </PageIntro>

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

      <section aria-labelledby="enquire-title" className="bg-surface">
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
