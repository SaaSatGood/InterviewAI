import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "InterviewAI - Master Your Tech Interview",
  description: "AI-powered technical interview simulator. Practice with realistic FAANG-level questions, get real-time feedback, and improve your soft skills.",
  keywords: ["interview", "tech", "ai", "simulator", "practice", "coding", "soft skills", "faang"],
  authors: [{ name: "InterviewAI Team" }],
  openGraph: {
    title: "InterviewAI - Master Your Tech Interview",
    description: "Practice technical interviews with AI. Get hired at top tech companies.",
    url: "https://interviewai.com",
    siteName: "InterviewAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "InterviewAI Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterviewAI - Master Your Tech Interview",
    description: "Practice technical interviews with AI. Get hired at top tech companies.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-neutral-950 text-white selection:bg-white/30`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
