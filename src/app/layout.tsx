import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Verdict — open-source Apollo alternative | verify every cold email before it ships",
  description:
    "Verdict is an open-source cold-outreach engine and Apollo/Hunter alternative. Email pattern discovery + SMTP verification gate holds bounce rate under 4%. Self-hosted or hosted.",
  keywords: [
    "apollo alternative", "hunter.io alternative", "instantly ai alternative",
    "cold email verification", "email finder open source", "self-hosted cold outreach",
    "smtp verification", "bounce rate reducer", "b2b lead generation", "clay alternative",
  ],
  openGraph: {
    title: "Verdict — every email gets a verdict before it ships",
    description:
      "Open-source cold-outreach engine. Discovers emails from public-web evidence, verifies over SMTP, refuses what will bounce.",
    url: "https://verdict-xi-olive.vercel.app",
    siteName: "Verdict",
    type: "website",
    images: [{ url: "/logo-500.png", width: 500, height: 500 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verdict — every email gets a verdict before it ships",
    description: "Open-source Apollo alternative. Verify before send. Sub-4% bounce.",
  },
};

const themeInit = `try{var t=localStorage.getItem('verdict-theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${fraunces.variable} ${plexMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}