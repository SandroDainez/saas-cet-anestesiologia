import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GuideReferenceList({ references }: { references: string[] }) {
  return (
    <Card className="space-y-3">
      <CardHeader>
        <CardTitle>Referências científicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        {references.length ? (
          references.map((reference) => <p key={reference}>{reference}</p>)
        ) : (
          <p>Referências em validação editorial.</p>
        )}
      </CardContent>
    </Card>
  );
}
