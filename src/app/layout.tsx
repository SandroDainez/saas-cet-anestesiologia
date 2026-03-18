import type { Metadata } from "next";
import { type Session } from "@supabase/supabase-js";

import "@/app/globals.css";

import { AppProviders } from "@/components/providers/app-providers";

export const metadata: Metadata = {
  title: "SaaS CET Anestesiologia",
  description: "Base multi-institucional para treinamento e avaliacao em anestesiologia."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSession: Session | null = null;

  return (
    <html lang="pt-BR">
      <body>
        <AppProviders initialSession={initialSession}>{children}</AppProviders>
      </body>
    </html>
  );
}
