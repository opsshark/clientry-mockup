import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acme Corp — Client Portal",
  description: "Powered by Clientry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ backgroundColor: '#0f0f13', color: '#e2e8f0' }}>
        {children}
      </body>
    </html>
  );
}
