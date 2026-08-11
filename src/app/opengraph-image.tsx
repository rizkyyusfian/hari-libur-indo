import { ImageResponse } from "next/og";

export const alt =
  "Hari Libur Indo — Kalender Hari Libur Indonesia dan Papua Barat Daya";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#fdf0d5",
          color: "#003049",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 84px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 740,
          }}
        >
          <div
            style={{
              color: "#c1121f",
              display: "flex",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 1,
              marginBottom: 30,
            }}
          >
            HARI LIBUR INDO
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.06,
            }}
          >
            Kalender Hari Libur Indonesia
          </div>
          <div
            style={{
              color: "#669bbc",
              display: "flex",
              fontSize: 31,
              fontWeight: 600,
              marginTop: 28,
            }}
          >
            Nasional · Cuti Bersama · Papua Barat Daya
          </div>
        </div>

        <div
          style={{
            alignItems: "center",
            background: "#ffffff",
            border: "8px solid #003049",
            borderRadius: 36,
            boxShadow: "18px 18px 0 #669bbc",
            display: "flex",
            flexDirection: "column",
            height: 330,
            justifyContent: "center",
            overflow: "hidden",
            width: 280,
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "#c1121f",
              color: "white",
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              height: 88,
              justifyContent: "center",
              width: "100%",
            }}
          >
            INDONESIA
          </div>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", fontSize: 104, fontWeight: 800 }}>
              17
            </div>
            <div style={{ display: "flex", fontSize: 25, fontWeight: 700 }}>
              AGUSTUS
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
