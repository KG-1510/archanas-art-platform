import type { ReactNode } from "react";

/** Small line icons for contact and social links. Decorative: the link text carries the meaning. */
function Icon({ children, className = "h-[1.1em] w-[1.1em]" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}

type P = { className?: string };

export const PhoneIcon = (p: P) => (
  <Icon {...p}>
    <path d="M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2 4.5 1.5v3A2.5 2.5 0 0 1 18.5 20 15.5 15.5 0 0 1 4 5.5 2.5 2.5 0 0 1 6.5 3Z" />
  </Icon>
);

export const MapPinIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Icon>
);

export const InstagramIcon = (p: P) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="0.6" fill="currentColor" />
  </Icon>
);

export const YouTubeIcon = (p: P) => (
  <Icon {...p}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
    <path d="m10 9.3 5 2.7-5 2.7Z" fill="currentColor" />
  </Icon>
);

export const FacebookIcon = (p: P) => (
  <Icon {...p}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </Icon>
);

/** Amazon's "a" with the smile arrow beneath, for the buy button. */
export const AmazonIcon = ({ className = "h-[1.25em] w-[1.25em]" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 ${className}`}>
    <path d="M15 14.5V8.2c0-2-1.3-3.2-3.3-3.2-1.7 0-2.9.8-3.3 2.2" strokeWidth="2" />
    <path d="M15 9.8c-3.8 0-6.3.9-6.3 3.2 0 1.400 1 2.3 2.5 2.3 1.9 0 3.8-1.3 3.8-3.8" strokeWidth="2" />
    <path d="M15 14.5c0 .6.400 1 .9 1.2" strokeWidth="2" />
    <path d="M3.5 18.2c5.2 3 11.6 3 16.6.2" strokeWidth="1.7" />
    <path d="m18.2 17.3 2.3.8-1 2.2" strokeWidth="1.7" />
  </svg>
);
