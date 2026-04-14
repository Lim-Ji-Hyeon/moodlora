import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moodlora",
  description: "감정을 공유하고 공감받는 익명 소셜 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1 w-full min-w-[375px] px-4 py-6 md:max-w-2xl md:mx-auto">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
