import Link from "next/link";
import { ArtworkImage } from "@/components/ArtworkCard";
import { formatINR, formatSize } from "@/lib/format";
import { FocusList, GrowInline, HorizontalGallery, Parallax, Reveal } from "@/components/Reveal";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { getArtworks, getFeaturedArtworks, getServices } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { site, whatsappLink } from "@/lib/site";

export const metadata = pageMeta("/", undefined, site.description);

const FACTS = [
  { value: "40+", label: "Years teaching and creating" },
  { value: "1 of 1", label: "Every painting is an original" },
  { value: "Worldwide", label: "Couriered in India and abroad" },
];

export default async function HomePage() {
  const [featured, all, services] = await Promise.all([getFeaturedArtworks(), getArtworks(), getServices()]);
  const gallery = all.slice(0, 8);
  const hero = featured[0];

  return (
    <>
      {/* Hero */}
      <section aria-labelledby="hero-title" className="shell grid items-center gap-12 pt-12 pb-20 md:grid-cols-[1.15fr_0.85fr] md:gap-16 md:pt-20 md:pb-28">
        <div>
          <p className="eyebrow rise">The studio of {site.artist} · Bengaluru</p>
          <h1 id="hero-title" className="rise rise-2 mt-6 text-[clamp(2.9rem,7.4vw,6.4rem)] leading-[1.02]">
            Art made <em className="text-oxblood">slowly</em>, by hand, for forty years.
          </h1>
          <p className="rise rise-3 mt-8 max-w-xl text-lg text-muted">
            Original paintings to live with, and classes, workshops and demos across art forms. All under one roof.
          </p>
          <div className="rise rise-4 mt-10 flex flex-wrap gap-4">
            <Link href="/shop" className="btn">
              Enter the marketplace
            </Link>
            <Link href="/services" className="btn btn-ghost">
              Classes &amp; workshops
            </Link>
          </div>
        </div>

        {hero ? (
          <figure className="unveil">
            <Link href={`/shop/${hero.slug}`} className="block border border-line bg-surface p-4 md:p-5">
              <div className="overflow-hidden">
                <Parallax amount={6}>
                  <ArtworkImage artwork={hero} priority sizes="(min-width: 768px) 40vw, 92vw" className="aspect-[4/5] scale-110" />
                </Parallax>
              </div>
            </Link>
            <figcaption className="mt-4 flex items-baseline justify-between gap-4 text-sm text-muted">
              <span className="font-display text-xl text-ink">{hero.title}</span>
              <span>{hero.medium}</span>
            </figcaption>
          </figure>
        ) : null}
      </section>

      {/* Facts */}
      <section aria-label="About the studio" className="border-y border-line">
        <Reveal as="ul" stagger className="shell grid gap-10 py-12 sm:grid-cols-3">
          {FACTS.map((f) => (
            <li key={f.label} className="flex flex-col gap-1">
              <span className="font-display text-5xl text-oxblood">{f.value}</span>
              <span className="text-sm uppercase tracking-[0.16em] text-muted">{f.label}</span>
            </li>
          ))}
        </Reveal>
      </section>

      {/* Featured works: pinned horizontal gallery */}
      <HorizontalGallery
        label="New in the studio"
        header={
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">From the marketplace</p>
              <h2 className="mt-4 text-5xl md:text-6xl">New in the studio</h2>
            </div>
            <Link href="/shop" className="link-line">
              View all works
            </Link>
          </div>
        }
      >
        {gallery.map((a) => (
          <li key={a._id} className="shrink-0">
            <Link href={`/shop/${a.slug}`} className="group block">
              <div className="border border-line bg-surface p-3 transition-colors duration-500 group-hover:border-brass">
                <ArtworkImage artwork={a} sizes="40vh" className="aspect-[4/5] h-[42vh]" />
              </div>
              <h3 className="mt-5 text-2xl transition-colors duration-300 group-hover:text-oxblood">{a.title}</h3>
              <p className="text-base text-muted">
                {a.medium} · {formatSize(a.widthIn, a.heightIn)}
              </p>
              <p className="mt-1 font-medium tabular-nums">
                {a.status === "sold" ? <span className="eyebrow">Sold</span> : formatINR(a.priceINR)}
              </p>
            </Link>
          </li>
        ))}
      </HorizontalGallery>

      {/* Services */}
      <section aria-labelledby="services-title" className="bg-surface">
        <div className="shell grid gap-14 py-24 md:grid-cols-[0.8fr_1.2fr] md:py-32">
          <Reveal className="md:sticky md:top-32 md:self-start">
            <p className="eyebrow">Learn &amp; commission</p>
            <h2 id="services-title" className="mt-4 text-5xl md:text-6xl">
              All art forms, under one roof
            </h2>
            <p className="mt-6 max-w-md text-muted">
              Learn at the studio or at the residence in Bengaluru, taught personally by {site.artist}.
            </p>
            <Link href="/services" className="link-line mt-8 inline-block">
              See all services
            </Link>
          </Reveal>
          <FocusList className="flex flex-col">
            {services.map((s) => (
              <li key={s._id} className="border-t border-line last:border-b">
                <Link href={`/services#${s.slug}`} className="group grid gap-2 py-7 md:grid-cols-[14rem_1fr] md:gap-8">
                  <h3 className="text-3xl transition-colors duration-300 group-hover:text-oxblood">{s.title}</h3>
                  <p className="text-muted">{s.summary}</p>
                </Link>
              </li>
            ))}
          </FocusList>
        </div>
      </section>

      {/* About teaser */}
      <section aria-labelledby="about-title" className="shell py-24 md:py-32">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">The artist</p>
          <h2 id="about-title" className="mt-6 text-4xl leading-[1.15] md:text-6xl">
            {site.artist} has spent more than forty years
            <GrowInline className="mx-[0.25em] inline-block h-[0.82em] w-[1.5em] overflow-hidden rounded-full align-baseline">
              <span className="art-a block h-full w-[1.5em]" />
            </GrowInline>
            teaching and creating art in every form she could learn.
          </h2>
          <Link href="/about" className="link-line mt-10 inline-block">
            Read her story
          </Link>
        </Reveal>
      </section>

      {/* Contact band */}
      <section aria-labelledby="cta-title" className="bg-oxblood text-ivory">
        <Reveal className="shell flex flex-wrap items-center justify-between gap-8 py-16 md:py-20">
          <div>
            <h2 id="cta-title" className="text-4xl md:text-5xl">
              Looking for a painting, or a class?
            </h2>
            <p className="mt-3 text-ivory/80">Send a message. Replies come from the studio, not a bot.</p>
          </div>
          <a
            href={whatsappLink("Hello, I would like to know more about Archana's Art.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn border-ivory bg-ivory text-oxblood hover:border-surface hover:bg-surface"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </Reveal>
      </section>
    </>
  );
}
