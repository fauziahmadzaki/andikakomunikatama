import type { Metadata } from "next";

import { PrototypeProvider } from "@/components/providers/PrototypeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "MuraNET - Internet rumah yang cepat, layanan dekat!",
  description: "Portal internal MuraNET.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <PrototypeProvider>{children}</PrototypeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
