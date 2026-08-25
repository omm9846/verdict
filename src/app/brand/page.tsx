export default function BrandPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      {/* The 500x500 mark */}
      <div
        id="logo-canvas"
        style={{ width: 500, height: 500 }}
        className="relative flex items-center justify-center"
      >
        {/* stamp frame */}
        <div
          className="absolute inset-6 border-[10px] border-stamp-live rounded-xl"
          style={{ transform: "rotate(-2deg)", opacity: 0.9 }}
        />
        <div
          className="absolute inset-10 border-2 border-ink rounded-lg"
          style={{ transform: "rotate(-2deg)" }}
        />

        {/* wordmark */}
        <div className="text-center" style={{ transform: "rotate(-2deg)" }}>
          <div
            className="font-display font-black text-ink leading-none"
            style={{ fontSize: 190 }}
          >
            V
            <span className="text-stamp-dead">.</span>
          </div>
          <div
            className="font-mono font-semibold tracking-[0.45em] text-ink mt-4 ml-3"
            style={{ fontSize: 40 }}
          >
            VERDICT
          </div>
        </div>

        {/* corner stamps */}
        <span className="stamp absolute top-14 left-12 text-stamp-live" style={{ fontSize: 15 }}>
          LIVE
        </span>
        <span className="stamp absolute bottom-16 right-12 text-stamp-dead" style={{ fontSize: 15 }}>
          DEAD
        </span>
      </div>
    </div>
  );
}