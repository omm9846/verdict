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
  title: "Verdict — every email gets a verdict before it ships",
  description:
    "Open-source cold-outreach engine. Verdict probes every mailbox, classifies every domain, and refuses to send what will bounce.",
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