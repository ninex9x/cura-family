import type { Metadata, Viewport } from "next";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/material-symbols-outlined/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "CuraFamília — Gestão de Saúde",
  description: "Agenda e histórico de medicamentos para cuidar da rotina de toda a família.",
  applicationName: "CuraFamília",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CuraFamília",
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
