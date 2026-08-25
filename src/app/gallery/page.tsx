import "./gallery.css";

function Chrome({ num, kicker }: { num: string; kicker: string }) {
  return (
    <>
      <div className="grain absolute inset-0" />
      <div className="absolute top-12 left-16 kicker">{kicker}</div>
      <div className="pagenum">{num} / 05</div>
      <div className="wordmark">
        VERDICT<span className="dot">.</span>
      </div>
    </>
  );
}

/* 01 — THE PROBLEM */
function F1() {
  return (
    <div className="frame">
      <Chrome num="01" kicker="the cold email tax" />
      <div className="relative h-full flex flex-col justify-center px-32">
        <div className="display-xl" style={{ fontSize: 96 }}>
          9% of your cold email
          <br />
          just bounces<span style={{ color: "oklch(0.68 0.15 27)" }}>.</span>
        </div>
        <p
          className="mt-10"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 24,
            color: "oklch(0.62 0.008 85)",
            maxWidth: 700,
            lineHeight: 1.6,
          }}
        >
          every bounce teaches inbox providers to distrust your domain.
          nobody sends you the bill.
        </p>
        <div className="accent-rule mt-14" />
      </div>
    </div>
  );
}

/* 02 — THE CAUSE */
function F2() {
  const rows = [
    ["rsmets@thetacapital.com", "550 5.1.1 user unknown"],
    ["j@cyber.capital", "550 5.1.1 user unknown"],
    ["matthew@sixtant.io", "catch-all · untrusted"],
  ];
  return (
    <div className="frame">
      <Chrome num="02" kicker="nobody checks" />
      <div className="relative h-full flex flex-col justify-center px-32">
        <div className="display-xl" style={{ fontSize: 72 }}>
          dead mailboxes don&apos;t unsubscribe.
        </div>
        <p
          className="mt-6 mb-12"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 22,
            color: "oklch(0.62 0.008 85)",
          }}
        >
          they sit on your list, silently burning your sender reputation.
        </p>
        <div className="max-w-[900px]">
          {rows.map(([addr, why]) => (
            <div key={addr} className="frow">
              <span className="addr">{addr}</span>
              <span className="fill line" />
              <span
                className="font-mono text-[17px]"
                style={{ color: "oklch(0.68 0.15 27)" }}
              >
                {why}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* 03 — THE ENGINE */
function F3() {
  return (
    <div className="frame">
      <Chrome num="03" kicker="verdict" />
      <div className="relative h-full flex flex-col justify-center px-32">
        <div className="display-xl" style={{ fontSize: 76, marginBottom: 70 }}>
          nothing ships without a verdict<span style={{ color: "oklch(0.74 0.13 152)" }}>.</span>
        </div>
        {/* feed strip */}
        <div className="max-w-[980px]">
          <div className="frow"><span className="addr">pavel.stehno@sigilfund.com</span><span className="line" /><span className="chip c-live">LIVE</span></div>
          <div className="frow"><span className="addr">guilhem@flowdesk.co</span><span className="line" /><span className="chip c-live">LIVE</span></div>
          <div className="frow"><span className="addr">j@cyber.capital</span><span className="line" /><span className="chip c-dead">DEAD</span></div>
        </div>
        <p
          className="mt-12"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 19,
            color: "oklch(0.62 0.008 85)",
          }}
        >
          SMTP probe per mailbox · catch-all + gateway detection · suppression forever
        </p>
      </div>
    </div>
  );
}

/* 04 — THE PROOF */
function F4() {
  const stats = [
    { v: "72", l: "fund managers reached" },
    { v: "24", l: "dead mailboxes caught pre-send", c: "c-dead" },
    { v: "~2%", l: "bounce on shipped mail", c: "c-live" },
  ];
  return (
    <div className="frame">
      <Chrome num="04" kicker="real campaign · august 2026" />
      <div className="relative h-full flex flex-col justify-center px-32">
        <div className="grid grid-cols-3 gap-20 mb-20">
          {stats.map((s) => (
            <div key={s.l}>
              <div className={`display-xl ${s.c ?? ""}`} style={{ fontSize: 140 }}>
                {s.v}
              </div>
              <div
                className="mono-label mt-4"
                style={{ fontSize: 18, color: "oklch(0.62 0.008 85)", maxWidth: 260 }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
        <div className="accent-rule" />
        <p
          className="mt-8"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 22,
            color: "oklch(0.72 0.01 85)",
          }}
        >
          one gate. zero list management. every number above is real.
        </p>
      </div>
    </div>
  );
}

/* 05 — THE PROMISE */
function F5() {
  return (
    <div className="frame">
      <Chrome num="05" kicker="the promise" />
      <div className="relative h-full flex flex-col items-center justify-center text-center">
        <div className="accent-rule mb-16" style={{ margin: "0 auto 56px" }} />
        <div className="display-xl" style={{ fontSize: 110 }}>
          email that never bounces<span style={{ color: "oklch(0.74 0.13 152)" }}>.</span>
        </div>
        <div
          className="mono-label"
          style={{ fontSize: 20, color: "oklch(0.62 0.008 85)", marginTop: 48 }}
        >
          open source · MIT · self-hosted · $29/mo hosted
        </div>
        <div
          className="font-mono"
          style={{ fontSize: 18, color: "oklch(0.45 0.008 85)", marginTop: 28 }}
        >
          verdict-xi-olive.vercel.app
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const frames = [
    ["story-1-problem", F1],
    ["story-2-cause", F2],
    ["story-3-engine", F3],
    ["story-4-proof", F4],
    ["story-5-promise", F5],
  ] as const;
  return (
    <div className="bg-paper">
      {frames.map(([id, C]) => (
        <div key={id} id={id} className="mb-2">
          <C />
        </div>
      ))}
    </div>
  );
}