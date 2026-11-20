import Link from "next/link";
import { ArtistPortrait } from "@/components/ArtistPortrait";
import { BookFeature } from "@/components/BookFeature";
import { JsonLd } from "@/components/JsonLd";
import { VelocityMarquee } from "@/components/VelocityMarquee";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { getBooks } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { site, whatsappLink } from "@/lib/site";

export const metadata = pageMeta("/books", "Books", `Books written by ${site.artist}, artist, teacher and author. Available on Amazon.`);

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <>
      <header className="intro shell grid items-center gap-12 pt-16 pb-16 md:grid-cols-[1.25fr_0.75fr] md:gap-20 md:pt-24 md:pb-24">
        <div>
          <p className="eyebrow rise">Books</p>
          <h1 className="mega mt-6 text-[clamp(2.4rem,5.6vw,5.6rem)]">
            <span className="line" style={{ "--i": 0 } as React.CSSProperties}>
              <span>{site.artist},</span>
            </span>
            <span className="line" style={{ "--i": 1 } as React.CSSProperties}>
              <span>
                <em className="text-oxblood">author</em>
              </span>
            </span>
          </h1>
          <p className="rise rise-3 mt-8 max-w-xl text-lg text-muted md:text-xl">
            {books.length
              ? `Forty years of teaching, set down on the page. ${books.length} books, in her own words and paintings.`
              : "Forty years of teaching, set down on the page."}
          </p>
        </div>
        <ArtistPortrait priority sizes="(min-width: 768px) 34vw, 92vw" className="unveil" />
      </header>

      {books.length ? (
        <>
          <VelocityMarquee items={books.map((b) => b.title)} />
          {books.map((b, i) => (
            <div key={b._id} className={i % 2 ? "bg-surface" : ""}>
              <BookFeature book={b} flip={i % 2 === 1} />
            </div>
          ))}
        </>
      ) : (
        <section className="shell pb-28">
          <div className="border-y border-line py-20 text-center">
            <h2 className="text-3xl md:text-4xl">Her books are being added.</h2>
            <p className="mx-auto mt-4 max-w-lg text-muted">Ask about them in the meantime.</p>
            <a href={whatsappLink("Hello, I would like to know about Dr. Archana Gupta's books.")} target="_blank" rel="noopener noreferrer" className="btn mt-8">
              <WhatsAppIcon className="h-4 w-4" />
              Ask on WhatsApp
            </a>
          </div>
        </section>
      )}

      <section className="shell flex flex-wrap justify-center gap-4 py-20">
        <Link href="/about" className="btn btn-ghost">
          About the author
        </Link>
        <Link href="/shop" className="btn">
          See her paintings
        </Link>
      </section>

      {books.length ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Books by ${site.artist}`,
            itemListElement: books.map((b, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Book",
                name: b.title,
                description: b.description || undefined,
                image: b.coverUrl,
                author: { "@type": "Person", name: site.artist },
                datePublished: b.year ? String(b.year) : undefined,
                sameAs: b.amazonUrl || undefined,
              },
            })),
          }}
        />
      ) : null}
    </>
  );
}
