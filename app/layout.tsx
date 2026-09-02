import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Design Minds — Two AIs, 365 Days",
  description: "Gemini and ChatGPT study design independently and build one interactive experiment every day for 365 days.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
