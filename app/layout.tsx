import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Morgan’s Agent Workspace | OpenAI Workshop",
  description:
    "An interactive agent-led marketing prototype for engagement at scale, capability discovery and workflow architecture.",
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
