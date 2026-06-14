import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ConnectUs — Where Students Meet Their Future",
    template: "%s | ConnectUs",
  },
  description:
    "ConnectUs bridges the gap between current students and successful alumni. Verified profiles, direct messaging, exclusive events — all in one beautifully simple platform.",
  metadataBase: new URL("https://connectus.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://connectus.vercel.app",
    siteName: "ConnectUs",
    title: "ConnectUs — Where Students Meet Their Future",
    description:
      "A verified alumni–student network with real-time messaging, events, and mentorship.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConnectUs — Where Students Meet Their Future",
    description:
      "A verified alumni–student network with real-time messaging, events, and mentorship.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${fraunces.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
