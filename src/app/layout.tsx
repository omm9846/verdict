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
  title: "Verdict — verify your Apollo, Hunter & Instantly contacts before you send",
  description:
    "Verdict is the truth layer for your cold outreach stack. Run an SMTP verification gate over the lists Apollo, Hunter, Instantly or Clay give you, hold bounce rate under 4%, and never let a dead address ship. Open source and self-hosted.",
  keywords: [
    "verify apollo contacts", "apollo bounce rate fix", "hunter io email verification",
    "instantly ai verification", "cold email verification", "smtp verification",
    "bounce rate reducer", "email finder verification", "free email verifier",
    "self-hosted cold outreach",
  ],
  openGraph: {
    title: "Verdict — every email gets a verdict before it ships",
    description:
      "Open-source cold-outreach engine. Discovers emails from public-web evidence, verifies over SMTP, refuses what will bounce.",
    url: "https://tryverdict.org",
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
    "SMTP verification gate for cold outreach. Run the lists Apollo, Hunter, Instantly or Clay give you through Verdict to confirm every address is live before you send. Self-hosted, MIT licensed.",
  url: "https://tryverdict.org",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  license: "MIT",
  featureList: [
    "SMTP verification gate before send",
    "Verify lists from Apollo, Hunter, Instantly & Clay",
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