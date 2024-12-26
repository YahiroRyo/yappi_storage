import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.scss";

const notoSansJP = Noto_Sans_JP({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ホーム | YappiStorage",
  description: "僕用のストレージサービスです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        onContextMenu={() => {
          return false;
        }}
        style={{ fontFamily: `${notoSansJP.style.fontFamily}` }}
        className={`${notoSansJP.className}`}
      >
        {children}
      </body>
    </html>
  );
}
