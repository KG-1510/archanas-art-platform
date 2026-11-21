import type { Book } from "@/lib/types";
import { whatsappLink } from "@/lib/site";
import { Book3D } from "./Book3D";
import { AmazonIcon } from "./Icons";
import { Lines, Reveal } from "./Reveal";
import { WhatsAppIcon } from "./WhatsAppButton";

/**
 * One book, presented like a launch: the 3D book on one side, and the title,
 * what is inside and the Amazon link on the other. `flip` puts the book on the left.
 */
export function BookFeature({ book, flip = false, headingLevel = "h2" }: { book: Book; flip?: boolean; headingLevel?: "h1" | "h2" }) {
  const Heading = headingLevel;
  return (
    <article className="shell grid items-center gap-14 py-20 md:grid-cols-2 md:gap-20 md:py-28">
      <div className={flip ? "md:order-2" : ""}>
        <p className="eyebrow">{[book.subtitle || "Book", book.year].filter(Boolean).join(" · ")}</p>
        <Heading className="mega mt-5 text-[clamp(2.3rem,5.2vw,5.2rem)]">
          <Lines>
            <span className="line">
              <span>{book.title}</span>
            </span>
          </Lines>
        </Heading>
        <Reveal>
          {book.description ? <p className="mt-7 max-w-xl whitespace-pre-line text-lg text-muted">{book.description}</p> : null}
          {book.highlights.length ? (
            <>
              <p className="eyebrow mt-9">Inside</p>
              <ul className="mt-4 grid max-w-xl gap-x-8 gap-y-3 sm:grid-cols-2">
                {book.highlights.map((h) => (
                  <li key={h} className="flex gap-3">
                    <span aria-hidden="true" className="mt-[0.8em] h-px w-5 shrink-0 bg-brass" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {book.amazonUrl ? null : (
            <p className="mt-8 max-w-xl text-muted">Interested in this one? Send the studio a message and we will tell you how to get a copy.</p>
          )}
          {book.amazonUrl ? (
            <a href={book.amazonUrl} target="_blank" rel="noopener noreferrer" className="btn relative mt-10">
              <AmazonIcon className="h-5 w-5" />
              Buy on Amazon
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7" />
                <path d="M8 7h9v9" />
              </svg>
              <span className="sr-only">(opens Amazon in a new tab)</span>
            </a>
          ) : (
            <a
              href={whatsappLink(`Hello, I am interested in the book "${book.title}"${book.subtitle ? ` (${book.subtitle})` : ""} by Dr. Archana Gupta. How can I order a copy?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-6"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Order a copy on WhatsApp
            </a>
          )}
        </Reveal>
      </div>
      <div className={flip ? "md:order-1" : ""}>
        <Book3D title={book.title} coverUrl={book.coverUrl} backCoverUrl={book.backCoverUrl} aspect={book.coverAspect} lean={flip ? "right" : "left"} />
      </div>
    </article>
  );
}
