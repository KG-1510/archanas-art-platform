import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import ElasticDivider from "@/components/annnimate/elastic-divider";
import TextReveal from "@/components/annnimate/text-reveal";
import { Effect121 } from "@/components/mwg/Effect121";
import { VelocityMarquee } from "@/components/VelocityMarquee";
import { ArtistPortrait } from "@/components/ArtistPortrait";
import { ClipReveal, Reveal } from "@/components/Reveal";
import { getAboutPhotos } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { site } from "@/lib/site";

export const metadata = pageMeta(
  "/about",
  "About",
  `${site.artist} is an artist, teacher and author with 40+ years of teaching and creating art across forms. Archana's Art is her studio in Bengaluru.`,
);

const CHAPTERS: { title: string; text: ReactNode }[] = [
  {
    title: "A life in the studio",
    text: (
      <p>
        Archana&rsquo;s Art is run by {site.artist}. For over four decades she has been doing two things side by side:
        making her own work, and teaching others to make theirs.
      </p>
    ),
  },
  {
    title: "All art forms, one roof",
    text: (
      <p>
        The studio is not built around a single medium. Painting, mandala, Nippon art and more are taught and
        practised here, so a student can move between forms without changing teachers.
      </p>
    ),
  },
  {
    title: "Where to find her",
    text: (
      <>
        <p>
          Classes run at the art studio at {site.studio.line1}, {site.studio.line2}, {site.studio.city}, and at her
          residence at {site.address.line1}, {site.address.line2}, {site.address.city}.
        </p>
        <p className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          <a href={site.maps.studio} target="_blank" rel="noopener noreferrer" className="link-line">
            Studio map
          </a>
          <a href={site.maps.residence} target="_blank" rel="noopener noreferrer" className="link-line">
            Residence map
          </a>
        </p>
      </>
    ),
  },
];

export default async function AboutPage() {
  const photos = await getAboutPhotos();
  const intro = (
    <header className="intro shell grid items-center gap-12 pt-16 pb-16 md:grid-cols-[1.25fr_0.75fr] md:gap-20 md:pt-24 md:pb-24">
      <div>
        <p className="eyebrow rise">About</p>
        <h1 className="mega mt-6 text-[clamp(2.4rem,5.6vw,5.6rem)]">
          <span className="line" style={{ "--i": 0 } as React.CSSProperties}>
            <span>{site.artist},</span>
          </span>
          <span className="line" style={{ "--i": 1 } as React.CSSProperties}>
            <span>
              <em className="text-oxblood">artist</em>, <em className="text-oxblood">teacher</em>, <em className="text-oxblood">author</em>
            </span>
          </span>
        </h1>
        <p className="rise rise-3 mt-8 max-w-xl text-lg text-muted md:text-xl">
          More than forty years of teaching and creating, across every art form she could learn.
        </p>
      </div>
      <ArtistPortrait priority sizes="(min-width: 768px) 34vw, 92vw" className="unveil" />
    </header>
  );

  return (
    <>
      {photos.length >= CHAPTERS.length ? (
        // Made With GSAP effect 121, clipped sections gallery. Needs one photo per chapter
        // (Sanity → Site settings → About page photos).
        <Effect121
          hero={intro}
          sections={CHAPTERS.map((c, i) => ({
            ...c,
            // eslint-disable-next-line @next/next/no-img-element
            media: <img src={`${photos[i].url}?w=1400&auto=format`} alt={photos[i].alt || ""} loading="lazy" decoding="async" />,
          }))}
        />
      ) : (
        <>
          {intro}
          <VelocityMarquee items={["Forty years", "Artist", "Teacher", "All art forms", "One roof", "Bengaluru"]} />
          <section aria-label="In short" className="shell py-24 md:py-32">
            <TextReveal className="aa-statement max-w-6xl" type="words" start="top 80%" stagger={0.035} duration={0.9}>
              The studio is not built around a single medium. <strong>Painting, mandala, Nippon art</strong> and more are taught
              and practised here, so a student can move between forms <strong>without changing teachers</strong>.
            </TextReveal>
          </section>
          <section className="shell pb-10">
            {CHAPTERS.map((c) => (
              <Reveal key={c.title}>
                <article className="grid gap-6 border-t border-line py-12 md:grid-cols-[0.8fr_1.2fr] md:gap-14 md:py-16">
                  <h2 className="mega text-3xl md:text-5xl">{c.title}</h2>
                  <div className="max-w-xl text-lg text-muted">{c.text}</div>
                </article>
              </Reveal>
            ))}
          </section>
        </>
      )}

      {/* National record */}
      <section aria-labelledby="record-title" className="bg-oxblood text-ivory">
        <div className="shell grid items-center gap-12 py-24 md:grid-cols-[0.75fr_1.25fr] md:gap-20 md:py-32">
          <figure>
            <ClipReveal className="overflow-hidden border border-ivory/25 p-3 md:p-4">
              <div className="relative aspect-[2/3] overflow-hidden">
                <Image
                  src="/ace-national-record.jpg"
                  alt={`${site.artist} holding her framed Ace Book of Records National Record certificate`}
                  fill
                  sizes="(min-width: 768px) 34vw, 92vw"
                  className="object-cover object-top"
                />
              </div>
            </ClipReveal>
            <figcaption className="mt-4 text-sm text-ivory/75">With the certificate, September 2025</figcaption>
          </figure>
          <div>
            <Reveal>
              <p className="eyebrow !text-brass">National record · Ace Book of Records</p>
              <h2 id="record-title" className="mega mt-5 text-[clamp(3.2rem,8vw,8rem)]">
                62 <em className="text-brass">in</em> 60
              </h2>
            </Reveal>
            <TextReveal className="aa-statement on-dark mt-10" type="words" start="top 82%" stagger={0.03} duration={0.9}>
              On her 62nd birthday, 16 September 2025, {site.artist} painted{" "}
              <strong>62 watercolour paintings in 60 minutes</strong>. The Ace Book of Records lists it as a{" "}
              <strong>National Record</strong>.
            </TextReveal>
            <p className="mt-8 text-ivory/75">
              Record: 62 watercolour paintings at the age of 62 in 60 minutes, Bengaluru, Karnataka. Certificate issued 17
              September 2025.
            </p>
          </div>
        </div>
      </section>

      <section className="shell pt-10 pb-24 md:pb-32">
        <ElasticDivider className="aa-rule" color="#b08d57" />
        <Reveal className="flex flex-wrap justify-center gap-4 pt-14">
          <Link href="/books" className="btn btn-ghost">
            Read her books
          </Link>
          <Link href="/shop" className="btn">
            See her paintings
          </Link>
          <Link href="/services" className="btn btn-ghost">
            Learn with her
          </Link>
        </Reveal>
      </section>
    </>
  );
}
