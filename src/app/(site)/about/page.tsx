import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { Reveal } from "@/components/Reveal";
import { pageMeta } from "@/lib/meta";
import { site } from "@/lib/site";

export const metadata = pageMeta(
  "/about",
  "About",
  `${site.artist} has spent 40+ years teaching and creating art across forms. Archana's Art is her studio in Bengaluru.`,
);

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="About" title={`${site.artist}, artist and teacher`}>
        <p>More than forty years of teaching and creating, across every art form she could learn.</p>
      </PageIntro>

      <section className="shell grid gap-14 pb-24 md:grid-cols-[0.9fr_1.1fr] md:pb-32">
        <Reveal>
          <div className="border border-line bg-surface p-4">
            <div role="img" aria-label="Portrait of Dr. Archana Gupta (photograph to be added)" className="art-e aspect-[4/5]" />
          </div>
        </Reveal>

        <Reveal stagger className="flex flex-col gap-10">
          <div>
            <h2 className="text-4xl">A life in the studio</h2>
            <p className="mt-4 text-muted">
              Archana&rsquo;s Art is run by {site.artist}. For over four decades she has been doing two things side by
              side: making her own work, and teaching others to make theirs.
            </p>
          </div>
          <div>
            <h2 className="text-4xl">All art forms, one roof</h2>
            <p className="mt-4 text-muted">
              The studio is not built around a single medium. Painting, mandala, Nippon art and more are taught and
              practised here, so a student can move between forms without changing teachers.
            </p>
          </div>
          <div>
            <h2 className="text-4xl">Where to find her</h2>
            <p className="mt-4 text-muted">
              Classes run at the art studio and at her residence at {site.address.line1}, {site.address.line2},{" "}
              {site.address.city}.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
              <a href={site.maps.studio} target="_blank" rel="noopener noreferrer" className="link-line">
                Art studio map
              </a>
              <a href={site.maps.residence} target="_blank" rel="noopener noreferrer" className="link-line">
                Residence map
              </a>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 border-t border-line pt-10">
            <Link href="/shop" className="btn">
              See her paintings
            </Link>
            <Link href="/services" className="btn btn-ghost">
              Learn with her
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
