import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CryptoBuddy - Crypto Tax Management",
  description: "Cryptocurrency portfolio tracking and tax calculation for Germany (§23 EStG, FIFO)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
