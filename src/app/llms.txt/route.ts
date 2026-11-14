import { llmsTxt } from "@/lib/markdown";

export async function GET() {
  return new Response((await llmsTxt()) + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
