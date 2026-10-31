import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import ThemeProvider from "@/components/Common/ThemeProvider";
import LiveTracker from "@/components/Common/LiveTracker";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.drapelo.shop";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// bold condensed heading font (racing look)
const display = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Drapelo | Racing-inspired F1 Jackets in Bangladesh",
    template: "%s | Drapelo",
  },
  description:
    "Premium racing-inspired F1 jackets with full embroidery. Ferrari and Red Bull style jackets. Cash on delivery all over Bangladesh.",
  openGraph: {
    type: "website",
    siteName: "Drapelo",
    url: SITE,
    
    images: ["/logodrapelo.png"],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LiveTracker />
          <LayoutWrapper>{children}</LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}