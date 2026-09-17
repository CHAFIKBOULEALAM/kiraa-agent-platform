import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kiraa - Assistant Location Déterministe",
  description: "Agent IA avec moteur Python métier 100% déterministe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full antialiased dark">
      <body className={`${inter.className} h-full overflow-hidden bg-slate-950`}>
        {children}
      </body>
    </html>
  );
}
