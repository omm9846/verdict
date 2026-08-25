"use client";

import { useEffect, useState } from "react";

type Verdict = "LIVE" | "DEAD" | "RISKY" | "CATCHALL";

const FEED: { email: string; verdict: Verdict }[] = [
  { email: "pavel.stehno@sigilfund.com", verdict: "LIVE" },
  { email: "rsmets@thetacapital.com", verdict: "DEAD" },
  { email: "charlie@wistoncapital.com", verdict: "LIVE" },
  { email: "mnoble@skybridge.com", verdict: "RISKY" },
  { email: "joey.krug@panteracapital.com", verdict: "DEAD" },
  { email: "guilhem@flowdesk.co", verdict: "LIVE" },
  { email: "michael.potter@bitdeer.com", verdict: "LIVE" },
  { email: "j@cyber.capital", verdict: "DEAD" },
  { email: "ruby@polychain.capital", verdict: "RISKY" },
  { email: "darcy@hivedigitaltech.com", verdict: "LIVE" },
  { email: "matthew@sixtant.io", verdict: "CATCHALL" },
  { email: "sam@bit-digital.com", verdict: "LIVE" },
];

const STAMP_STYLE: Record<Verdict, string> = {
  LIVE: "text-stamp-live",
  DEAD: "text-stamp-dead",
  RISKY: "text-stamp-risky",
  CATCHALL: "text-stamp-check",
};

export function VerdictFeed({ rows = 6 }: { rows?: number }) {
  const [window_, setWindow] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setWindow((w) => (w + 1) % (FEED.length - rows + 1 > 0 ? FEED.length - rows + 1 : 1));
    }, 1800);
    return () => clearInterval(id);
  }, [rows]);

  const visible = FEED.slice(window_, window_ + rows);

  return (
    <div className="font-mono text-sm">
      <div className="flex items-baseline justify-between border-b-2 border-ink pb-2 mb-1">
        <span className="text-[11px] tracking-[0.2em] uppercase text-ink-faint">
          mailbox
        </span>
        <span className="text-[11px] tracking-[0.2em] uppercase text-ink-faint">
          verdict
        </span>
      </div>
      {visible.map((row, i) => (
        <div
          key={row.email}
          className="feed-row flex items-baseline py-1.5"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <span className="text-ink truncate max-w-[16rem]">{row.email}</span>
          <span className="leader" />
          <span className={`stamp stamp-slam ${STAMP_STYLE[row.verdict]}`}>
            {row.verdict}
          </span>
        </div>
      ))}
      <div className="mt-3 text-[11px] text-ink-faint flex justify-between">
        <span>probe: RCPT TO over MX</span>
        <span>catch-all + gateway aware</span>
      </div>
    </div>
  );
}