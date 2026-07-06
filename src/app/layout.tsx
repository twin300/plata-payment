import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Оплата разработки лендинга",
  description: "Страница оплаты разработки лендинга.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
