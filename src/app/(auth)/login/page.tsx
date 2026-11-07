import type { Metadata } from "next";
import Image from "next/image";

import { LoginForm } from "@/features/auth/components/login-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Masuk · MURANET",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-sm gap-0 py-0 shadow-sm">
        <div className="flex items-center gap-3 border-b px-6 py-5">
          <div className="flex size-10 items-center justify-center rounded-lg border bg-white p-1.5">
            <Image
              src="/assets/logo.png"
              alt="Logo MuraNET"
              width={446}
              height={446}
              priority
              className="size-full object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">
              <span className="text-brand-red-600">MURA</span>
              <span className="text-brand-blue-700">NET</span>
            </p>
            <span aria-hidden="true" className="mt-1 flex h-[3px] w-7 overflow-hidden rounded-full">
              <span className="h-full w-1/2 bg-brand-red-500" />
              <span className="h-full w-1/2 bg-brand-blue-600" />
            </span>
          </div>
        </div>

        <CardContent className="space-y-6 px-6 py-6">
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold tracking-tight">Masuk</h1>
            <p className="text-sm text-muted-foreground">
              Gunakan akun karyawan untuk melanjutkan.
            </p>
          </div>
          <LoginForm />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">© 2026 MuraNET</p>
    </main>
  );
}
