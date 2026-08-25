export default function BrandPage() {
  return (
    <div className="bg-paper">
      {/* ── Favicon mark: 500x500, dark bg, just V. ── */}
      <div className="p-8 mb-4">
        <h2 className="font-mono text-sm text-gray-500 mb-4">Favicon Mark (500×500)</h2>
        <div
          id="logo-favicon"
          style={{
            width: 500,
            height: 500,
            backgroundColor: "#0d0d1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontWeight: 900,
              fontSize: 260,
              color: "#f0ede6",
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            V<span style={{ color: "#ff6b5e" }}>.</span>
          </span>
        </div>
      </div>

      {/* ── Light variant: paper bg, ink V. ── */}
      <div className="p-8 mb-4">
        <h2 className="font-mono text-sm text-gray-500 mb-4">Light Variant</h2>
        <div
          id="logo-light"
          style={{
            width: 500,
            height: 500,
            backgroundColor: "#f7f3ec",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontWeight: 900,
              fontSize: 260,
              color: "#1a1a2e",
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            V<span style={{ color: "#c0392b" }}>.</span>
          </span>
        </div>
      </div>

      {/* ── Full logo with wordmark (for OG images etc) ── */}
      <div className="p-8 mb-4">
        <h2 className="font-mono text-sm text-gray-500 mb-4">Full Logo (500×500)</h2>
        <div
          id="logo-full"
          style={{
            width: 500,
            height: 500,
            backgroundColor: "#0d0d1a",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontWeight: 900,
              fontSize: 200,
              color: "#f0ede6",
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            V<span style={{ color: "#ff6b5e" }}>.</span>
          </span>
          <span
            style={{
              fontFamily: "var(--font-plex-mono), monospace",
              fontWeight: 600,
              fontSize: 36,
              color: "#f0ede6",
              marginTop: 24,
              letterSpacing: "0.35em",
            }}
          >
            VERDICT
          </span>
        </div>
      </div>

      <p style={{ padding: 20, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
        Right-click → Inspect each element to verify dimensions before screenshotting.
      </p>
    </div>
  );
}