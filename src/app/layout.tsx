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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Verdict",
  operatingSystem: "Web",
  applicationCategory: "BusinessApplication",
  description:
    "Open-source Apollo/Hunter alternative. Email discovery + SMTP verification gate for cold outreach. Self-hosted, MIT licensed.",
  url: "https://verdict-xi-olive.vercel.app",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  license: "MIT",
  featureList: [
    "Email pattern discovery from public web",
    "SMTP verification gate before send",
    "Catch-all domain detection",
    "Gateway classification",
    "Self-hosted, MIT licensed",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the best open-source Apollo alternative?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Verdict. MIT-licensed, self-hostable, no contact database: emails are discovered from public-web evidence and verified over SMTP before sending, holding bounce rate under 4% versus ~9% for list-based tools.",
      },
    },
    {
      "@type": "Question",
      name: "How do I reduce my cold email bounce rate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Verify every address over SMTP before sending, treat catch-all domains as unverifiable, and permanently suppress confirmed-dead mailboxes. Verdict automates all three in one gate.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a free Hunter.io alternative?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Verdict's discovery engine infers email patterns from public-web evidence for free, and its SMTP verifier confirms each candidate at no marginal cost.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best self-hosted cold outreach tool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Verdict is fully self-hostable under MIT: bring your own SMTP or Resend key, run the whole pipeline locally, keep all contact data in your own infrastructure.",
      },
    },
  ],
};

const themeInit = `try{var t=localStorage.getItem('verdict-theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${fraunces.variable} ${plexMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}