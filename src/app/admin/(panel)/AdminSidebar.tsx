"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const icon = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, className: "h-5 w-5 shrink-0" };

const LINKS = [
  { href: "/admin", label: "Dashboard", svg: <svg {...icon}><rect x="3.5" y="3.5" width="7" height="9" /><rect x="13.5" y="3.5" width="7" height="5" /><rect x="13.5" y="11.5" width="7" height="9" /><rect x="3.5" y="15.5" width="7" height="5" /></svg> },
  { href: "/admin/orders", label: "Orders", svg: <svg {...icon}><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5Z" /><path d="M4 7.5 12 12l8-4.5M12 12v9" /></svg> },
  { href: "/admin/inventory", label: "Inventory", svg: <svg {...icon}><rect x="3.5" y="4.5" width="17" height="15" /><path d="m3.5 16 5-5 4 4 3-3 5 5" /><circle cx="15.5" cy="9" r="1.5" /></svg> },
];
const OUTSIDE = [
  { href: "/studio", label: "Studio (content)", svg: <svg {...icon}><path d="M4 20h4L19 9l-4-4L4 16Z" /><path d="m13.5 6.5 4 4" /></svg> },
  { href: "/", label: "View website", svg: <svg {...icon}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.300 3.800 5.100 3.800 8.5s-1.300 6.200-3.800 8.5c-2.5-2.300-3.800-5.100-3.800-8.5S9.5 5.800 12 3.5Z" /></svg> },
];

/**
 * The admin panel's left sidebar. It folds down to icons with the button at its
 * top and remembers that choice on this device. On a phone it is a bar across
 * the top with a Menu button.
 */
export function AdminSidebar({ footer }: { footer: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false); // phone menu

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a saved preference after the first paint
      if (localStorage.getItem("aa-admin-collapsed") === "1") setCollapsed(true);
    } catch {}
  }, []);

  const toggle = () => {
    setCollapsed((v) => {
      try {
        localStorage.setItem("aa-admin-collapsed", v ? "0" : "1");
      } catch {}
      return !v;
    });
  };

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const item = (l: (typeof LINKS)[number], active: boolean) => (
    <li key={l.href}>
      <Link
        href={l.href}
        onClick={() => setOpen(false)}
        aria-current={active ? "page" : undefined}
        title={collapsed ? l.label : undefined}
        className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${active ? "bg-ink text-ivory" : "hover:bg-white"} ${collapsed ? "md:justify-center md:px-0" : ""}`}
      >
        {l.svg}
        <span className={collapsed ? "md:sr-only" : ""}>{l.label}</span>
      </Link>
    </li>
  );

  return (
    <aside className={`shrink-0 border-b border-line bg-stone-100 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r md:transition-[width] md:duration-300 ${collapsed ? "md:w-[4.25rem]" : "md:w-64"}`}>
      <div className="flex h-full flex-col">
        <div className={`flex items-center justify-between gap-3 px-4 py-4 ${collapsed ? "md:justify-center md:px-0" : ""}`}>
          <Link href="/admin" className={`font-display text-xl leading-tight ${collapsed ? "md:hidden" : ""}`}>
            Archana&rsquo;s Art <span className="block text-sm text-muted">Admin</span>
          </Link>
          {/* Desktop: fold the sidebar. */}
          <button type="button" onClick={toggle} aria-expanded={!collapsed} aria-label={collapsed ? "Open the sidebar" : "Fold the sidebar"} className="hidden p-2 hover:bg-ivory md:block">
            <svg {...icon}>
              <rect x="3.5" y="4.5" width="17" height="15" />
              <path d="M9.5 4.5v15" />
              <path d={collapsed ? "m13.5 10 2 2-2 2" : "m15.5 10-2 2 2 2"} />
            </svg>
          </button>
          {/* Phone: show or hide the menu. */}
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="admin-nav" className="text-[0.8rem] font-medium uppercase tracking-[0.2em] md:hidden">
            {open ? "Close" : "Menu"}
          </button>
        </div>

        <nav id="admin-nav" aria-label="Admin" className={`flex-1 flex-col justify-between gap-6 px-3 pb-4 md:flex ${open ? "flex" : "hidden"}`}>
          <div>
            <ul className="flex flex-col gap-1">{LINKS.map((l) => item(l, isActive(l.href)))}</ul>
            <ul className="mt-5 flex flex-col gap-1 border-t border-line pt-5 text-muted">{OUTSIDE.map((l) => item(l, false))}</ul>
          </div>
          <div className={`border-t border-line pt-4 ${collapsed ? "md:hidden" : ""}`}>{footer}</div>
        </nav>
      </div>
    </aside>
  );
}
