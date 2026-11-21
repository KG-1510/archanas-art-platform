import Link from "next/link";
import { ArtworkCard, ArtworkImage } from "@/components/ArtworkCard";
import { ArtistPortrait } from "@/components/ArtistPortrait";
import { BookCarousel } from "@/components/BookCarousel";
import { BookFeature } from "@/components/BookFeature";
import ElasticDivider from "@/components/annnimate/elastic-divider";
import TextReveal from "@/components/annnimate/text-reveal";
import { Lines, Parallax, Reveal } from "@/components/Reveal";
import { ServicesGallery } from "@/components/ServicesGallery";
import { StudentGallery } from "@/components/StudentGallery";
import { VelocityMarquee } from "@/components/VelocityMarquee";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { getArtworks, getBooks, getClassPhotos, getFeaturedArtworks, getServices, getTestimonials } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { site, whatsappLink } from "@/lib/site";

export const metadata = pageMeta("/", undefined, site.description);

const FACTS = [
  { value: "40+", label: "Years in fine art" },
  { value: "62 in 60", label: "Paintings in 60 minutes, a national record" },
  { value: "5,000+", label: "Students guided, and counting" },
  { value: "Worldwide", label: "Couriered in India and abroad" },
];

export default async function HomePage() {
  const [featured, all, services, testimonials, books, classPhotos] = await Promise.all([
    getFeaturedArtworks(),
    getArtworks(),
    getServices(),
    getTestimonials(),
    getBooks(),
    getClassPhotos(),
  ]);
  const hero = featured.find((a) => a.imageUrl);
  // Services that have a photo, for the diagonal gallery.
  const indexed = services.filter((sv) => sv.imageUrl);
  // The homepage shelf: books that can be bought on Amazon, or every book if none has a link yet.
  const onAmazon = books.filter((b) => b.amazonUrl);
  const shelf = (onAmazon.length ? onAmazon : books).slice(0, 5);
  // On phones the hero shows up to four paintings in a row to swipe.
  const heroRow = (featured.length ? featured : all).filter((a) => a.imageUrl).slice(0, 4);
  const forms = services.map((s) => s.title);

  return (
    <>
      {/* Hero. Wide screens: headline beside one framed painting. Phones: headline, then a row of paintings to swipe. */}
      <section
        aria-labelledby="hero-title"
        className={`intro shell grid items-center gap-10 pt-8 pb-14 md:gap-16 md:pt-16 md:pb-24 ${hero ? "md:grid-cols-[1.2fr_0.8fr]" : ""}`}
      >
        {/* min-w-0 lets the swipe row scroll inside the column instead of stretching it. */}
        <div className="min-w-0">
          <p className="eyebrow rise">
            <span className="md:hidden">{site.artist} · Bengaluru</span>
            <span className="hidden md:inline">The studio of {site.artist} · Bengaluru</span>
          </p>
          <h1 id="hero-title" className={`mega mt-5 text-[clamp(3.1rem,14.5vw,4.6rem)] md:mt-6 ${hero ? "md:text-[clamp(2.52rem,6.38vw,6.22rem)]" : "md:text-[clamp(2.52rem,8.82vw,9.24rem)]"}`}>
            <span className="line" style={{ "--i": 0 } as React.CSSProperties}>
              <span>Step into an</span>
            </span>
            <span className="line" style={{ "--i": 1 } as React.CSSProperties}>
              <span>
                <em className="text-oxblood">artistic</em> world.
              </span>
            </span>
          </h1>
          <p className="rise rise-3 mt-6 max-w-xl text-lg text-muted md:mt-8 md:text-xl">
            Buy original paintings and prints by {site.artist}, or learn all fine art forms under one roof.
          </p>

          {/* Phones: the paintings themselves, in a row to swipe through. */}
          {heroRow.length ? (
            <ul className="rise rise-3 -mx-[clamp(1.25rem,4vw,3.5rem)] mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1.25rem,4vw,3.5rem)] pb-2 md:hidden" aria-label="Paintings from the gallery">
              {heroRow.map((a, i) => (
                <li key={a._id} className="w-[78vw] shrink-0 snap-center">
                  <Link href={`/shop/${a.slug}`} className="block border border-line bg-surface p-3">
                    <ArtworkImage artwork={a} priority={i === 0} natural sizes="78vw" className="aspect-[4/5]" />
                  </Link>
                  <p className="mt-3 flex items-baseline justify-between gap-3 text-sm text-muted">
                    <span className="font-display text-lg text-ink">{a.title}</span>
                    <span className="shrink-0 tabular-nums">
                      {i + 1} / {heroRow.length}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="rise rise-4 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 md:mt-10">
            <Link href="/shop" className="btn">
              See the paintings
            </Link>
            <Link href="/services" className="btn btn-ghost">
              Join a class
            </Link>
          </div>
        </div>

        {hero ? (
          <figure className="unveil hidden md:block">
            <Link href={`/shop/${hero.slug}`} className="block overflow-hidden border border-line bg-surface p-4 md:p-5">
              <Parallax amount={5}>
                <ArtworkImage artwork={hero} priority natural sizes="38vw" className="aspect-[4/5]" />
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
            <p className="eyebrow">From the gallery</p>
            <h2 id="featured-title" className="mega mt-4 text-4xl md:text-6xl">
              Find the painting that feels like yours
            </h2>
          </div>
          <Link href="/shop" className="link-line">
            See the whole gallery
          </Link>
        </Reveal>
        {/* Six paintings on wide screens, in two rows read left to right; the first three on phones. */}
        <Reveal stagger className="mt-14 grid items-start gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 max-md:[&>*:nth-child(n+4)]:hidden">
          {featured.map((a) => (
            <ArtworkCard key={a._id} artwork={a} uniform />
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
            <strong>40+ years of art</strong>, <strong>5,000 students</strong> guided, <strong>five books</strong> written.
          </TextReveal>
          <Link href="/about" className="link-line mt-10 inline-block">
            Meet Dr. Archana Gupta
          </Link>
        </div>
      </section>

      {/* Her books: a carousel of the ones sold on Amazon (or of all of them, if none has a link yet) */}
      {shelf.length ? (
        <section aria-label={`Books by ${site.artist}`} className="border-t border-line bg-surface">
          <div className="shell flex flex-wrap items-end justify-between gap-6 pt-20 md:pt-28">
            <div>
              <p className="eyebrow">Also an author</p>
              <p className="mega mt-4 text-4xl md:text-6xl">
                From her studio to <em className="text-oxblood">your shelf</em>
              </p>
            </div>
            <Link href="/books" className="link-line">
              {books.length > 1 ? `See all ${books.length} books` : "About the book"}
            </Link>
          </div>
          <BookCarousel titles={shelf.map((b) => b.title)}>
            {shelf.map((b) => (
              <BookFeature key={b._id} book={b} />
            ))}
          </BookCarousel>
        </section>
      ) : null}


      {/* Services. With a photo for each (set in Sanity): the Annnimate Diagonal Gallery. Otherwise the plain list. */}
      {indexed.length >= 3 ? (
        <section aria-label="Classes and services">
          <ServicesGallery services={indexed} />
          <div className="bg-surface">
            <p className="shell pb-16 text-center md:pb-20">
              <Link href="/services" className="btn">
                See every class
              </Link>
            </p>
          </div>
        </section>
      ) : (
        <section aria-labelledby="services-title" className="bg-surface">
          <div className="shell grid gap-14 py-24 md:grid-cols-[0.8fr_1.2fr] md:py-32">
            <Reveal className="md:sticky md:top-32 md:self-start">
              <p className="eyebrow">Learn with Dr. Archana</p>
              <h2 id="services-title" className="mega mt-4 text-4xl md:text-6xl">
                From first brushstroke to finished piece
              </h2>
              <p className="mt-6 max-w-md text-muted">
                Classes, workshops and demonstrations at the studio and at the residence in Bengaluru, led personally by {site.artist}.
              </p>
              <Link href="/services" className="link-line mt-8 inline-block">
                See every class
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
      )}

      {/* Students and their work: shown once photos are added in Sanity */}
      {classPhotos.length ? (
      <section aria-labelledby="students-title" className="py-24 md:py-32">
        <Reveal className="shell flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">From the classes</p>
            <h2 id="students-title" className="mega mt-4 text-4xl md:text-6xl">
              Students, and what they <em className="text-oxblood">made</em>
            </h2>
          </div>
          <Link href="/services#students-title" className="link-line">
            See all the students&rsquo; work
          </Link>
        </Reveal>
        <div className="mt-12">
          <StudentGallery limit={5} />
        </div>
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
            <p className="mt-6 text-lg text-ivory/80">Feel free to reach out on WhatsApp to resolve any queries.</p>
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
