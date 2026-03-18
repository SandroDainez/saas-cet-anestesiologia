export default function ContentDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-10">
        <div className="animate-pulse rounded-3xl border border-border/70 bg-card/80 p-10 text-center text-muted-foreground">
          Carregando detalhes editoriais...
        </div>
      </main>
    </div>
  );
}
