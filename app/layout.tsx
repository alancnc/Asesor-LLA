import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

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
      <body className="h-full min-h-screen">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
