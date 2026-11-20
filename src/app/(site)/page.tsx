import Link from "next/link";
import { ArtworkCard, ArtworkImage } from "@/components/ArtworkCard";
import { ArtFormsWheel } from "@/components/ArtFormsWheel";
import { ArtistPortrait } from "@/components/ArtistPortrait";
import { BookFeature } from "@/components/BookFeature";
import ElasticDivider from "@/components/annnimate/elastic-divider";
import TextReveal from "@/components/annnimate/text-reveal";
import { Effect123 } from "@/components/mwg/Effect123";
import { ParadeMedia } from "@/components/mwg/ParadeMedia";
import { Lines, Parallax, Reveal } from "@/components/Reveal";
import { VelocityMarquee } from "@/components/VelocityMarquee";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { getArtworks, getBooks, getFeaturedArtworks, getServices, getTestimonials } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { site, whatsappLink } from "@/lib/site";

export const metadata = pageMeta("/", undefined, site.description);

const FACTS = [
  { value: "40+", label: "Years teaching and creating" },
  { value: "62 in 60", label: "Paintings in 60 minutes, a national record" },
  { value: "Originals", label: "And selected works as prints" },
  { value: "Worldwide", label: "Couriered in India and abroad" },
];

export default async function HomePage() {
  const [featured, all, services, testimonials, books] = await Promise.all([
    getFeaturedArtworks(),
    getArtworks(),
    getServices(),
    getTestimonials(),
    getBooks(),
  ]);
  // Sections that depend on paintings are left out until real paintings exist.
  const parade = all.filter((a) => a.imageUrl).slice(0, 6);
  const hero = featured.find((a) => a.imageUrl);
  const forms = services.map((s) => s.title);

  return (
    <>
      {/* Hero */}
        <section
          aria-labelledby="hero-title"
          className={`intro shell grid items-center gap-12 pt-12 pb-20 md:gap-16 md:pt-16 md:pb-24 ${hero ? "md:grid-cols-[1.2fr_0.8fr]" : ""}`}
        >
          <div>
            <p className="eyebrow rise">The studio of {site.artist} · Bengaluru</p>
            <h1 id="hero-title" className={`mega mt-6 ${hero ? "text-[clamp(2.52rem,6.38vw,6.22rem)]" : "text-[clamp(2.52rem,8.82vw,9.24rem)]"}`}>
              <span className="line" style={{ "--i": 0 } as React.CSSProperties}>
                <span>A lifetime of art,</span>
              </span>
              <span className="line" style={{ "--i": 1 } as React.CSSProperties}>
                <span>
                  <em className="text-oxblood">made</em> and <em className="text-oxblood">taught</em>
                </span>
              </span>
              <span className="line" style={{ "--i": 2 } as React.CSSProperties}>
                <span>by hand.</span>
              </span>
            </h1>
            <p className="rise rise-3 mt-8 max-w-xl text-lg text-muted md:text-xl">
              Original paintings and prints by {site.artist}, and classes, workshops and demos in every art form she practises. Forty years on, all under one roof in Bengaluru.
            </p>
            <div className="rise rise-4 mt-10 flex flex-wrap gap-4">
              <Link href="/shop" className="btn">
                See the paintings
              </Link>
              <Link href="/services" className="btn btn-ghost">
                Learn with her
              </Link>
            </div>
          </div>

          {hero ? (
            <figure className="unveil">
              <Link href={`/shop/${hero.slug}`} className="block overflow-hidden border border-line bg-surface p-4 md:p-5">
                <Parallax amount={5}>
                  <ArtworkImage artwork={hero} priority natural sizes="(min-width: 768px) 38vw, 92vw" className="aspect-[4/5]" />
                </Parallax>
              </Link>
              <figcaption className="mt-4 flex items-baseline justify-between gap-4 text-sm text-muted">
                <span className="font-display text-xl text-ink">{hero.title}</span>
                <span>{hero.medium}</span>
              </figcaption>
            </figure>
          ) : null}
        </section>

      {/* Art forms, moving with the scroll */}
      <VelocityMarquee items={forms} />

      {/* Facts */}
      <section aria-label="About the studio" className="border-b border-line">
        <Reveal as="ul" stagger className="shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((f) => (
            <li key={f.label} className="flex flex-col gap-1">
              <span className="font-display text-4xl text-oxblood md:text-5xl">{f.value}</span>
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
            <h2 id="featured-title" className="mega mt-4 text-4xl md:text-6xl">
              New in the studio
            </h2>
          </div>
          <Link href="/shop" className="link-line">
            View all works
          </Link>
        </Reveal>
        <Reveal stagger className="mt-14 art-columns">
          {featured.map((a) => (
            <ArtworkCard key={a._id} artwork={a} />
          ))}
        </Reveal>
      </section>
      ) : null}

      {/* The artist: her portrait, and one sentence on the Annnimate Text Reveal */}
      <section aria-label="The artist" className="shell grid items-center gap-12 py-24 md:grid-cols-[0.7fr_1.3fr] md:gap-20 md:py-36">
        <ArtistPortrait sizes="(min-width: 768px) 32vw, 92vw" />
        <div>
          <p className="eyebrow">The artist</p>
          <TextReveal className="aa-statement mt-8" type="words" start="top 78%" stagger={0.035} duration={0.9}>
            For more than forty years {site.artist} has done two things side by side: <strong>made her own work</strong>, and{" "}
            <strong>taught others to make theirs</strong>.
          </TextReveal>
          <Link href="/about" className="link-line mt-10 inline-block">
            Read her story
          </Link>
        </div>
      </section>

      {/* Also an author: shown once a book is added in Sanity */}
      {books.length ? (
        <section aria-label={`Books by ${site.artist}`} className="border-t border-line bg-surface">
          <div className="shell flex flex-wrap items-end justify-between gap-6 pt-20 md:pt-28">
            <div>
              <p className="eyebrow">Also an author</p>
              <p className="mega mt-4 text-4xl md:text-6xl">
                In her <em className="text-oxblood">own words</em>
              </p>
            </div>
            <Link href="/books" className="link-line">
              {books.length > 1 ? `All ${books.length} books` : "About the book"}
            </Link>
          </div>
          <BookFeature book={books[0]} />
        </section>
      ) : null}

      {/* What is taught and made: Annnimate Rotating Words */}
      {forms.length >= 4 ? <ArtFormsWheel words={forms} /> : null}

      {/* Services */}
      <section aria-labelledby="services-title" className="bg-surface">
        <div className="shell grid gap-14 py-24 md:grid-cols-[0.8fr_1.2fr] md:py-32">
          <Reveal className="md:sticky md:top-32 md:self-start">
            <p className="eyebrow">Learn &amp; commission</p>
            <h2 id="services-title" className="mega mt-4 text-4xl md:text-6xl">
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

      {/* With painting photos: Made With GSAP effect 123, parting letters parade. */}
      {parade.length >= 3 ? (
        <section aria-label="Paintings from the studio">
          <Effect123 lines={["Forty years of teaching", "and creating, by hand"]}>
            <ParadeMedia artworks={parade} />
          </Effect123>
        </section>
      ) : null}

      <div className="shell">
        <ElasticDivider className="aa-rule" color="#b08d57" />
      </div>

      {/* Testimonials: shown once some are added in Sanity */}
      {testimonials.length ? (
        <section aria-labelledby="testimonials-title" className="border-t border-line bg-surface">
          <div className="shell py-24 md:py-28">
            <Reveal>
              <p className="eyebrow">In their words</p>
              <h2 id="testimonials-title" className="mega mt-4 text-4xl md:text-6xl">
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
        <Reveal className="shell flex flex-wrap items-center justify-between gap-8 py-20 md:py-28">
          <div>
            <h2 id="cta-title" className="mega text-[clamp(2.18rem,5.46vw,5.46rem)]">
              <Lines>
              <span className="line">
                <span>Looking for a painting,</span>
              </span>
              <span className="line">
                <span>
                  or a <em className="text-brass">class</em>?
                </span>
              </span>
            </Lines>
            </h2>
            <p className="mt-6 text-lg text-ivory/80">Send a message. Replies come from the studio, not a bot.</p>
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
