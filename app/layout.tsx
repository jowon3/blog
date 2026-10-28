import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "100 900",
  display: "swap",
});
export const metadata: Metadata = { title: "BLOG STUDIO | 블로그 관리 프로그램", description: "고객별 블로그 원고 작성, 사진 관리, 수정 이력과 발행 준비를 위한 개인용 업무 프로그램." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="ko" className={pretendard.variable}><body>{children}</body></html>; }


