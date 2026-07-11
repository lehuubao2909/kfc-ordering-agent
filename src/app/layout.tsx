import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "KFC AI Ordering", template: "%s · KFC AI Ordering" },
  description: "Trợ lý AI đặt món KFC bằng tiếng Việt qua Messenger.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a href="#main-content" className="skip-link">Đi đến nội dung chính</a>
        {children}
      </body>
    </html>
  );
}
