import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MSA Shop Console",
  description: "Internal data console for the MSA shopping-mall services",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <Providers>
          <Header />
          <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
