import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

// One brand layout for every OG image: mono label, large title, hairline with the accent dot.
export function renderOg({ label, title }: { label: string; title: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#111113",
          color: "#F4F4F5",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A1A1AA" }}>{label}</div>
        <div style={{ display: "flex", fontSize: title.length > 40 ? 72 : 96, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em" }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", height: 1, flex: 1, background: "#2A2A2E" }} />
          <div style={{ display: "flex", width: 16, height: 16, borderRadius: 8, background: "#EAB308" }} />
        </div>
      </div>
    ),
    ogSize,
  );
}
