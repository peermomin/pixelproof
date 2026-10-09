import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixelproof — Visual QA for your next release",
  description: "A calmer way to review responsive interfaces. Compare, annotate, and ship with confidence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
