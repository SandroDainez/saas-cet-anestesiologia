import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickReferencePanelProps {
  quickReference: Record<string, unknown>;
}

export function QuickReferencePanel({ quickReference }: QuickReferencePanelProps) {
  const bullets = Array.isArray(quickReference.bullets) ? quickReference.bullets : [];
  const table = Array.isArray(quickReference.table) ? quickReference.table : [];

  return (
    <Card className="space-y-3">
      <CardHeader>
        <CardTitle>Consulta rápida</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {bullets.length ? (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {bullets.map((bullet, index) => (
              <li key={index}>• {bullet}</li>
            ))}
          </ul>
        ) : null}
        {table.length ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            {table.map((row, index) => (
              <p key={index}>
                {row.medication ?? row.label}: {row.guidance ?? row.description}
              </p>
            ))}
          </div>
        ) : null}
        {!bullets.length && !table.length ? (
          <p className="text-xs text-muted-foreground">Nenhuma consulta rápida disponibilizada ainda.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
