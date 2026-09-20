import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Priority Use Cases | OpenAI × Adobe × Code and Theory",
  description: "Interactive workshop for prioritizing enterprise marketing use cases and outcomes."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
