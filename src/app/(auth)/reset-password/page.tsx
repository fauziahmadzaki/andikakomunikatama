import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password · MURANET",
};

export default function ResetPasswordPage() {
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
              className="size-full object-contain"
            />
          </div>
          <div>
            <Link href="/" className="text-sm font-bold tracking-tight">
              <span className="text-brand-red-600">MURA</span>
              <span className="text-brand-blue-700">NET</span>
            </Link>
            <p className="text-xs text-muted-foreground">Portal Internal</p>
          </div>
        </div>

        <CardContent className="space-y-5 px-6 py-6">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Buat password baru
            </h1>
            <p className="text-sm text-muted-foreground">
              Gunakan password yang kuat dan belum pernah dipakai.
            </p>
          </div>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}
