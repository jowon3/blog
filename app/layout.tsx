import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "100 900",
  display: "swap",
});
export const metadata: Metadata = { title: "진심을 담다 | 블로그 스튜디오", description: "당신의 생각을 콘텐츠로 완성하는 AI 블로그 스튜디오. 제목 추천부터 본문 작성, 사진 배치, 문장 검토와 저장까지." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="ko" className={pretendard.variable}><body>{children}</body></html>; }


