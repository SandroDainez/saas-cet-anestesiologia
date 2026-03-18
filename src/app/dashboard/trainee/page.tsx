import { Badge } from "@/components/ui/badge";
import { HighlightCard } from "@/features/dashboard/components/highlight-card";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { getDashboardContent } from "@/features/dashboard/data/dashboard-content";
import { requireDashboardProfile } from "@/services/auth/require-dashboard-profile";
import { fetchModuleCounts } from "@/services/db/modules";

export default async function TraineeDashboardPage() {
  const profile = await requireDashboardProfile("trainee");
  const moduleCounts = await fetchModuleCounts(profile.institution_id);
  const content = getDashboardContent("trainee", profile, moduleCounts ?? undefined);

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Badge>Trainee</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">{content.heading}</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{content.intro}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {content.stats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {content.highlights.map((item) => (
          <HighlightCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}
