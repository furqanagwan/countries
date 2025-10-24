import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Countries of the World",
  description: "Explore all countries of the world with detailed information",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}