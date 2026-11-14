import Link from "next/link";
import { Effect121 } from "@/components/mwg/Effect121";
import { PageIntro } from "@/components/PageIntro";
import { Reveal } from "@/components/Reveal";
import { pageMeta } from "@/lib/meta";
import { site } from "@/lib/site";

export const metadata = pageMeta(
  "/about",
  "About",
  `${site.artist} has spent 40+ years teaching and creating art across forms. Archana's Art is her studio in Bengaluru.`,
);

// Photographs to be added: each `.img` block is a painted placeholder for now.
const placeholder = (variant: string, label: string) => <div role="img" aria-label={label} className={`img ${variant}`} />;

export default function AboutPage() {
  return (
    <>
      {/* Made With GSAP effect 121, clipped sections gallery */}
      <Effect121
        hero={
          <PageIntro eyebrow="About" title={`${site.artist}, artist and teacher`}>
            <p>More than forty years of teaching and creating, across every art form she could learn.</p>
          </PageIntro>
        }
        sections={[
          {
            title: "A life in the studio",
            text: (
              <p>
                Archana&rsquo;s Art is run by {site.artist}. For over four decades she has been doing two things side
                by side: making her own work, and teaching others to make theirs.
              </p>
            ),
            media: placeholder("art-e", "Dr. Archana Gupta in her studio (photograph to be added)"),
          },
          {
            title: "All art forms, one roof",
            text: (
              <p>
                The studio is not built around a single medium. Painting, mandala, Nippon art and more are taught and
                practised here, so a student can move between forms without changing teachers.
              </p>
            ),
            media: placeholder("art-d", "Students' work across art forms (photograph to be added)"),
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
            media: placeholder("art-a", "The art studio in Bengaluru (photograph to be added)"),
          },
        ]}
      />

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
