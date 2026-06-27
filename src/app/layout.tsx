import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "mynotes",
  description: "Fast, simple notes with text and file attachments.",
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
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-3xl items-center px-4">
            <Link href="/" className="flex items-center gap-2.5 font-semibold">
              <Image
                src="/mynotes.png"
                alt="mynotes logo"
                width={44}
                height={44}
                className="h-11 w-11"
                priority
              />
              <span className="text-xl tracking-tight">mynotes</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
