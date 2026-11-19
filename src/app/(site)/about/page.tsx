import Link from "next/link";
import type { ReactNode } from "react";
import { Effect121 } from "@/components/mwg/Effect121";
import { PageIntro } from "@/components/PageIntro";
import { Reveal } from "@/components/Reveal";
import { getAboutPhotos } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { site } from "@/lib/site";

export const metadata = pageMeta(
  "/about",
  "About",
  `${site.artist} has spent 40+ years teaching and creating art across forms. Archana's Art is her studio in Bengaluru.`,
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
          Classes run at the art studio and at her residence at {site.address.line1}, {site.address.line2},{" "}
          {site.address.city}.
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
    <PageIntro eyebrow="About" title={`${site.artist}, artist and teacher`}>
      <p>More than forty years of teaching and creating, across every art form she could learn.</p>
    </PageIntro>
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
          <section className="shell pb-10">
            {CHAPTERS.map((c) => (
              <Reveal key={c.title}>
                <article className="grid gap-6 border-t border-line py-12 md:grid-cols-[0.8fr_1.2fr] md:gap-14 md:py-16">
                  <h2 className="text-4xl md:text-5xl">{c.title}</h2>
                  <div className="max-w-xl text-lg text-muted">{c.text}</div>
                </article>
              </Reveal>
            ))}
          </section>
        </>
      )}

      <section className="shell pt-10 pb-24 md:pb-32">
        <Reveal className="flex flex-wrap justify-center gap-4 border-t border-line pt-14">
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
