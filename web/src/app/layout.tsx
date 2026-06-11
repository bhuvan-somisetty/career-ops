import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/context/CurrencyContext";
import LegacyKeyMigration from "@/components/LegacyKeyMigration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Career Ops — AI Career Operating System",
  description: "Accelerate your job search. Evaluate offers, match resume, scan portals, and track applications in real time.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36' fill='none'%3E%3Cpath d='M12 24C8.68629 24 6 21.3137 6 18C6 14.6863 8.68629 12 12 12C14.7614 12 17.1 13.8 17.8 16.3' stroke='%2310b981' stroke-width='2.5' stroke-linecap='round'/%3E%3Ccircle cx='23' cy='18' r='6' stroke='%2310b981' stroke-width='2.5'/%3E%3Cpath d='M16 22L21 17L26 12M26 12H21M26 12V17' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#030303] text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-400">
        <div className="grid-bg fixed inset-0 pointer-events-none z-0 opacity-40" />
        <div className="w-full min-h-screen relative z-10 font-sans flex flex-col">
          <LegacyKeyMigration />
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </div>
      </body>
    </html>
  );
}
