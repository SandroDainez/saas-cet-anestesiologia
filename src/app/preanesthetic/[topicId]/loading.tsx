export default function PreanestheticTopicLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-10">
        <div className="space-y-4">
          <div className="h-6 w-1/3 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-muted" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-[1.5rem] bg-border/30" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
