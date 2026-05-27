import type { Metadata } from "next";
import { APP_NAME } from "@/lib/branding";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "커뮤니케이션채널 관련 최신 뉴스 (전일·당일)",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={notoSans.variable}>
      <body>{children}</body>
    </html>
  );
}
