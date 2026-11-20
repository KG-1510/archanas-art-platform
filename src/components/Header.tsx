"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-ivory/90 backdrop-blur-md transition-[border-color,box-shadow] duration-500 border-b ${
        scrolled ? "border-line" : "border-transparent"
      }`}
    >
      <div className="shell flex items-center justify-between gap-6 py-3">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image src="/logo.jpg" alt="" width={52} height={52} priority className="h-12 w-12 mix-blend-multiply" />
          <span className="font-display text-[1.45rem] font-medium leading-none">{site.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-9">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`text-[0.8rem] font-medium uppercase tracking-[0.2em] transition-colors duration-300 hover:text-oxblood ${
                      active ? "text-oxblood" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          className="md:hidden text-[0.8rem] font-medium uppercase tracking-[0.2em]"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <nav id="mobile-nav" aria-label="Main" hidden={!open} className="md:hidden border-t border-line">
        <ul className="shell flex flex-col py-4">
          {nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block py-3 font-display text-3xl" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
