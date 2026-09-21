import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Enterprise Marketing Workshop | OpenAI × Adobe × Code and Theory",
  description:
    "Facilitated workshop for priorities, current capabilities, operating architecture and content at scale.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
