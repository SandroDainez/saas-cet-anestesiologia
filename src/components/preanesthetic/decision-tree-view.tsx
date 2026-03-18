import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DecisionTreeViewProps {
  decisionTree: Record<string, unknown>;
}

export function DecisionTreeView({ decisionTree }: DecisionTreeViewProps) {
  const nodes = Array.isArray(decisionTree.nodes) ? decisionTree.nodes : [];

  return (
    <Card className="space-y-3">
      <CardHeader>
        <CardTitle>Árvore de decisão</CardTitle>
        <p className="text-xs text-muted-foreground">
          Seguem as etapas baseadas em protocolos revisados e aprovados.
        </p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {nodes.length ? (
          nodes.map((node, index) => (
            <div key={`${node.id}-${index}`} className="space-y-1">
              <p className="font-semibold">[{node.id}] {node.text}</p>
              <p className="text-xs text-muted-foreground">
                Continua para: {node.yes ?? node.no ?? "Revisar caso"}
              </p>
            </div>
          ))
        ) : (
          <p>Árvore em elaboração.</p>
        )}
      </CardContent>
    </Card>
  );
}
