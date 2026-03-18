import Link from "next/link";

interface ContentManagementLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    contentId: string;
  }>;
}

export default async function ContentManagementLayout({ children, params }: ContentManagementLayoutProps) {
  const { contentId } = await params;
  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-6 py-10">
        <section className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          <Link
            href={`/content-management/${contentId}`}
            className="rounded-full border border-border px-4 py-1"
          >
            Detalhe
          </Link>
          <Link
            href={`/content-management/${contentId}/versions`}
            className="rounded-full border border-border px-4 py-1"
          >
            Versões
          </Link>
          <Link
            href={`/content-management/${contentId}/reviews`}
            className="rounded-full border border-border px-4 py-1"
          >
            Revisões
          </Link>
          <Link
            href={`/content-management/${contentId}/references`}
            className="rounded-full border border-border px-4 py-1"
          >
            Referências
          </Link>
        </section>
        {children}
      </main>
    </div>
  );
}
