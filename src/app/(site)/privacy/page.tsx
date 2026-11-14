import { LegalPageView } from "@/components/LegalPageView";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("/privacy", "Privacy Policy", "How Archana's Art collects, uses and protects your personal details.");

export default function Page() {
  return <LegalPageView slug="privacy" />;
}
