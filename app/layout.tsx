import type { Metadata, Viewport } from "next";
import "./globals.css";

// 폰에서 화면이 작게 보이지 않도록 강제로 1:1 비율을 맞춥니다.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "영수증 스캐너",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased overflow-x-hidden">{children}</body>
    </html>
  );
}
