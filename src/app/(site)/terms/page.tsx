import { LegalPageView } from "@/components/LegalPageView";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("/terms", "Terms of Service", "The terms for using this website and buying original artworks from Archana's Art.");

export default function Page() {
  return <LegalPageView slug="terms" />;
}
