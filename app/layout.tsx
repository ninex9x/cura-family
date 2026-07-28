import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuidar — Medicamentos da família",
  description: "Agenda e histórico de medicamentos para cuidar da rotina de toda a família.",
  applicationName: "Cuidar",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cuidar",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f1ea",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
