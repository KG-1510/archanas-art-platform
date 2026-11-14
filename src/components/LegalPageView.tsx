import { getLegalPage } from "@/lib/content";
import type { LegalPage } from "@/lib/types";

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export async function LegalPageView({ slug }: { slug: LegalPage["slug"] }) {
  const page = await getLegalPage(slug);

  return (
    <article className="shell max-w-3xl pt-16 pb-24 md:pt-24 md:pb-32">
      <p className="eyebrow">Policies</p>
      <h1 className="mt-5 text-5xl md:text-6xl">{page.title}</h1>
      <p className="mt-5 text-sm text-muted">
        Last updated <time dateTime={page.updated}>{dateFormat.format(new Date(`${page.updated}T00:00:00Z`))}</time>
      </p>
      {page.intro ? <p className="mt-8 border-l border-brass pl-5 text-muted">{page.intro}</p> : null}

      <div className="mt-12 flex flex-col gap-10">
        {page.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-3xl">{s.heading}</h2>
            <p className="mt-3 whitespace-pre-line text-muted">{s.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
