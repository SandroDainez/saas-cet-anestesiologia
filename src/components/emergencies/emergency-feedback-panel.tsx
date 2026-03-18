import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmergencyFeedbackPanelProps {
  title: string;
  message: string;
}

export function EmergencyFeedbackPanel({ title, message }: EmergencyFeedbackPanelProps) {
  return (
    <Card className="space-y-3">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}
