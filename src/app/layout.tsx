import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const fixture = localFont({
  src: [
    {
      path: "../../public/fonts/Fixture Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Fixture SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Fixture Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-fixture",
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

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
    <html lang="es" className={`${fixture.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
