import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon for phones: the same serif "A" as the favicon.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#6E1F28" }}>
        <svg width="150" height="150" viewBox="0 0 64 64">
          <path
            fill="#FAF7F2"
            d="M30.6 11h3.2l13.4 36.2c.6 1.6 1.5 2.3 3.3 2.5V52H36.800v-2.300c2.300-.2 2.900-.9 2.300-2.700L36.600 40H24.300l-2.200 6.600c-.7 2.100.1 2.900 2.800 3.100V52H13.500v-2.300c2-.3 3-1.100 3.800-3.200L30.600 11Zm-.1 9.800L25.400 36.800h10.100L30.500 20.800Z"
          />
        </svg>
      </div>
    ),
    size,
  );
}
