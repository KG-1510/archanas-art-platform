import { markdownFor } from "@/lib/markdown";

/** Serves the Markdown twin of a page. Reached through rewrites in next.config.ts. */
export async function GET(_request: Request, { params }: RouteContext<"/md/[[...path]]">) {
  const { path } = await params;
  const markdown = await markdownFor(path ?? []);
  if (markdown === null) {
    return new Response("# Not found\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  }
  return new Response(markdown + "\n", {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "X-Robots-Tag": "noindex" },
  });
}
