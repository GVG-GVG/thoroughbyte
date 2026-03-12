import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ThoroughByte \u2014 2024 OBS Results: Tier Performance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const tiers = [
  { name: "ELITE", earnings: 137780, color: "#22a822", pct: 100 },
  { name: "STRONG", earnings: 94871, color: "#7ad27a", pct: 69 },
  { name: "ABOVE AVG", earnings: 53312, color: "#b4b43c", pct: 39 },
  { name: "AVERAGE", earnings: 46631, color: "#a0a0a0", pct: 34 },
  { name: "BELOW AVG", earnings: 32987, color: "#d28c50", pct: 24 },
  { name: "WEAK", earnings: 16536, color: "#c83c3c", pct: 12 },
];

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#1a2332",
          padding: "36px 50px",
          fontFamily: "sans-serif",
          color: "#fff",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "24px", marginBottom: "8px" }}>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "#c8aa5a", letterSpacing: "2px" }}>
            2024 OBS RESULTS
          </span>
          <span style={{ fontSize: "18px", color: "#b4bec8" }}>
            1,474 horses &middot; $89M in earnings &middot; 18 months post-sale
          </span>
        </div>

        {/* Column headers */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "14px", color: "#b4bec8", letterSpacing: "2px" }}>TIER</span>
          <span style={{ fontSize: "14px", color: "#b4bec8", letterSpacing: "2px" }}>AVG EARNINGS</span>
        </div>

        {/* Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {tiers.map((t) => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", height: "42px" }}>
              <span
                style={{
                  width: "160px",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: t.color,
                  letterSpacing: "1px",
                  flexShrink: 0,
                }}
              >
                {t.name}
              </span>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  height: "36px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: `${t.pct}%`,
                    height: "36px",
                    backgroundColor: t.color,
                    borderRadius: "4px",
                  }}
                />
              </div>
              <span
                style={{
                  width: "140px",
                  textAlign: "right",
                  fontSize: "20px",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                ${t.earnings.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", borderTop: "2px solid #3c4b5f", margin: "16px 0 12px" }} />

        {/* Bottom stats panel */}
        <div
          style={{
            display: "flex",
            flex: 1,
            backgroundColor: "#141c28",
            borderRadius: "10px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Left stat */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={{ fontSize: "56px", fontWeight: 700, color: "#c8aa5a" }}>34</span>
              <span style={{ fontSize: "26px", color: "#b4bec8", marginLeft: "4px" }}>/47</span>
            </div>
            <span style={{ fontSize: "16px", color: "#b4bec8", textAlign: "center" }}>
              Graded Stakes Winners from top 2 tiers
            </span>
          </div>

          {/* Vertical divider */}
          <div style={{ display: "flex", width: "2px", height: "80px", backgroundColor: "#3c4b5f" }} />

          {/* Right stat */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <span style={{ fontSize: "56px", fontWeight: 700, color: "#c8aa5a" }}>1</span>
            <span style={{ fontSize: "16px", color: "#b4bec8", textAlign: "center" }}>
              Graded Stakes Winners from bottom 2 tiers
            </span>
          </div>
        </div>

        {/* Branding */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
          <span style={{ fontSize: "16px", color: "#64738b", fontWeight: 600 }}>ThoroughByte</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
