import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GuideSectionCardProps {
  title: string;
  subtitle?: string;
  content?: string | null;
  list?: string[];
  children?: React.ReactNode;
}

export function GuideSectionCard({ title, subtitle, content, list, children }: GuideSectionCardProps) {
  return (
    <Card className="space-y-3">
      <CardHeader className="space-y-1">
        <CardTitle>{title}</CardTitle>
        {subtitle ? (
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {content ? <p className="whitespace-pre-line">{content}</p> : null}
        {list && list.length ? (
          <ul className="space-y-2">
            {list.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-primary-foreground">•</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
}
