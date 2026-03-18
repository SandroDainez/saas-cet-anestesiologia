import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopicReferenceListProps {
  references: string[];
}

export function TopicReferenceList({ references }: TopicReferenceListProps) {
  return (
    <Card className="space-y-3">
      <CardHeader>
        <CardTitle>Referências</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {references.length ? (
          references.map((reference, index) => <p key={index}>{reference}</p>)
        ) : (
          <p>Referências em revisão e aguardando validação editorial.</p>
        )}
      </CardContent>
    </Card>
  );
}
