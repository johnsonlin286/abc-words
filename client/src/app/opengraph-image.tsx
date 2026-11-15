import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";

/**
 * Link preview (WhatsApp, social media). The illustration is drawn on the right of
 * src/assets/og-background.png; the logo and the words are set here in Fredoka, the same as the
 * hero, so the text can change without redrawing the picture. Rendered once at build time and
 * re-encoded as JPEG: WhatsApp skips previews much over 300 KB, and the PNG is larger than that.
 */
export const alt = "Main ABC Lima Dasar Online! Hitung jari, dapat huruf, adu kata.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

const INK = "#1d2b5c";

const asDataUrl = (png: Buffer) => `data:image/png;base64,${png.toString("base64")}`;

export default async function OpengraphImage() {
  return new Response(await renderJpeg(), { headers: { "Content-Type": contentType } });
}

/** Cached so the image is drawn once (at build) instead of on every crawler request. */
async function renderJpeg(): Promise<Uint8Array<ArrayBuffer>> {
  "use cache";
  const [background, logo, bold, semibold] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/og-background.png")).then(asDataUrl),
    readFile(join(process.cwd(), "public/logo.png")).then(asDataUrl),
    readFile(join(process.cwd(), "node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff")),
    readFile(join(process.cwd(), "node_modules/@fontsource/fredoka/files/fredoka-latin-600-normal.woff")),
  ]);

  const png = new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", fontFamily: "Fredoka", color: INK }}>
        <img src={background} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 14,
            paddingLeft: 104,
            width: 640,
            height: "100%",
          }}
        >
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1 }}>Main</div>
          <img src={logo} alt="ABC Lima Dasar" width={500} height={103} />
          <div style={{ display: "flex", position: "relative", alignSelf: "flex-start", fontSize: 92, fontWeight: 700, lineHeight: 1 }}>
            {/* Highlighter swash, as in the hero */}
            <div
              style={{
                position: "absolute",
                left: -10,
                right: -12,
                top: 38,
                bottom: -6,
                background: "#ffe34d",
                borderRadius: "34px 16px 40px 20px",
                transform: "rotate(-1deg)",
              }}
            />
            <span style={{ position: "relative" }}>Online!</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              padding: "8px 18px",
              background: "#fff4b0",
              borderRadius: 6,
              transform: "rotate(-1deg)",
              fontSize: 28,
              fontWeight: 600,
              whiteSpace: "nowrap",
              alignSelf: "flex-start",
            }}
          >
            Hitung jari, dapat huruf, adu kata!
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fredoka", data: bold, weight: 700, style: "normal" },
        { name: "Fredoka", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  return new Uint8Array(jpeg);
}
