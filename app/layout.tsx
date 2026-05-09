import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asesor LLA — Asesor Jurídico & Político",
  description:
    "Asesor jurídico y político oficial de La Libertad Avanza. Consultas constitucionales, legislativas y de política pública desde una perspectiva liberal.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body
        className={`${inter.className} h-full min-h-screen`}
        style={{ background: "#000000", color: "#ffffff" }}
      >
        {children}
      </body>
    </html>
  );
}
