import Link from "next/link";
import { ArtworkCard, ArtworkImage } from "@/components/ArtworkCard";
import { Effect123 } from "@/components/mwg/Effect123";
import { ParadeMedia } from "@/components/mwg/ParadeMedia";
import { Parallax, Reveal } from "@/components/Reveal";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { getArtworks, getFeaturedArtworks, getServices, getTestimonials } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { site, whatsappLink } from "@/lib/site";

export const metadata = pageMeta("/", undefined, site.description);

const FACTS = [
  { value: "40+", label: "Years teaching and creating" },
  { value: "Originals", label: "And selected works as prints" },
  { value: "Worldwide", label: "Couriered in India and abroad" },
];

export default async function HomePage() {
  const [featured, all, services, testimonials] = await Promise.all([
    getFeaturedArtworks(),
    getArtworks(),
    getServices(),
    getTestimonials(),
  ]);
  // Sections that depend on paintings are left out until real paintings exist.
  const parade = all.filter((a) => a.imageUrl).slice(0, 6);
  const hero = featured.find((a) => a.imageUrl);

  return (
    <>
      {/* Hero */}
      <section
        aria-labelledby="hero-title"
        className={`shell grid items-center gap-12 pt-12 pb-20 md:gap-16 md:pt-20 md:pb-28 ${hero ? "md:grid-cols-[1.15fr_0.85fr]" : ""}`}
      >
        <div>
          <p className="eyebrow rise">The studio of {site.artist} · Bengaluru</p>
          <h1 id="hero-title" className="rise rise-2 mt-6 text-[clamp(2.9rem,7.4vw,6.4rem)] leading-[1.02]">
            Art made <em className="text-oxblood">slowly</em>, by hand, for forty years.
          </h1>
          <p className="rise rise-3 mt-8 max-w-xl text-lg text-muted">
            Paintings to live with, as originals and prints, and classes, workshops and demos across art forms. All under one roof.
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

      {/* Featured works: shown once there are paintings in Sanity */}
      {featured.length ? (
      <section aria-labelledby="featured-title" className="shell py-24 md:py-32">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">From the marketplace</p>
            <h2 id="featured-title" className="mt-4 text-5xl md:text-6xl">
              New in the studio
            </h2>
          </div>
          <Link href="/shop" className="link-line">
            View all works
          </Link>
        </Reveal>
        <Reveal stagger className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((a) => (
            <ArtworkCard key={a._id} artwork={a} />
          ))}
        </Reveal>
      </section>
      ) : null}

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
          <Reveal as="ul" stagger className="flex flex-col">
            {services.map((s) => (
              <li key={s._id} className="border-t border-line last:border-b">
                <Link href={`/services#${s.slug}`} className="group grid gap-2 py-7 md:grid-cols-[14rem_1fr] md:gap-8">
                  <h3 className="text-3xl transition-colors duration-300 group-hover:text-oxblood">{s.title}</h3>
                  <p className="text-muted">{s.summary}</p>
                </Link>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* About teaser. With painting photos: Made With GSAP effect 123, parting letters parade. */}
      <section aria-label="The artist">
        {parade.length >= 3 ? (
          <Effect123 lines={["Forty years of teaching", "and creating, by hand"]}>
            <ParadeMedia artworks={parade} />
          </Effect123>
        ) : (
          <Reveal className="shell pt-24 text-center md:pt-32">
            <p className="eyebrow">The artist</p>
            <h2 className="mx-auto mt-6 max-w-4xl text-4xl leading-[1.15] md:text-6xl">Forty years of teaching and creating, by hand</h2>
          </Reveal>
        )}
        <div className="shell flex flex-col items-center gap-6 pt-8 pb-24 text-center">
          <p className="max-w-2xl text-lg text-muted">
            {site.artist} has spent more than forty years teaching and creating art in every form she could learn.
          </p>
          <Link href="/about" className="link-line">
            Read her story
          </Link>
        </div>
      </section>

      {/* Testimonials: shown once some are added in Sanity */}
      {testimonials.length ? (
        <section aria-labelledby="testimonials-title" className="border-t border-line bg-surface">
          <div className="shell py-24 md:py-28">
            <Reveal>
              <p className="eyebrow">In their words</p>
              <h2 id="testimonials-title" className="mt-4 text-5xl md:text-6xl">
                From students and collectors
              </h2>
            </Reveal>
            <Reveal as="ul" stagger className="mt-14 grid gap-10 md:grid-cols-3">
              {testimonials.map((t) => (
                <li key={t._id}>
                  <figure className="flex h-full flex-col justify-between gap-8 border-t border-brass pt-8">
                    <blockquote className="font-display text-2xl leading-snug">&ldquo;{t.quote}&rdquo;</blockquote>
                    <figcaption>
                      <span className="block font-medium">{t.name}</span>
                      {t.context ? <span className="block text-sm text-muted">{t.context}</span> : null}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </Reveal>
          </div>
        </section>
      ) : null}

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
