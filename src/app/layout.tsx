import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prediccion Mundial",
  description: "Predicciones por grupos para el Mundial",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
