import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard · MURANET",
};

export default async function DashboardSectionPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const title = slug.map((part) => part.replace(/-/g, " ")).join(" / ");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-1">
      <h1 className="text-2xl font-bold tracking-tight capitalize">{title}</h1>
      <p className="text-sm text-muted-foreground">
        Halaman ini belum tersedia.
      </p>
    </div>
  );
}
