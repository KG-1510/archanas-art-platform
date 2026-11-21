import type { Metadata } from "next";
import type { ReactNode } from "react";

// The admin panel is private: keep it out of search engines.
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

// Every admin page waits for the sign-in check before showing anything, on purpose.
export const instant = false;

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="aa-admin flex min-h-screen flex-col bg-stone-50 text-[1rem]">{children}</div>;
}
