import { ReviewDecisionPanel } from "@/components/content-management/review-decision-panel";
import { fetchContentTimeline } from "@/services/db/modules";

export default async function ContentReviewsPage({ params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  const timeline = await fetchContentTimeline(contentId);
  const reviews = timeline.flatMap((entry) => entry.reviews);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Revisões editoriais</h1>
        <p className="text-sm text-muted-foreground">
          Registro dos revisores, decisões e comentários. Conteúdo crítico exige aprovação manual em cada revisão.
        </p>
      </section>
      <section className="space-y-4">
        {reviews.length ? (
          reviews.map((review) => <ReviewDecisionPanel key={review.id} review={review} />)
        ) : (
          <div className="rounded-2xl border border-border/70 bg-card/80 p-6 text-sm text-muted-foreground">
            Nenhuma revisão registrada para este conteúdo.
          </div>
        )}
      </section>
    </div>
  );
}
