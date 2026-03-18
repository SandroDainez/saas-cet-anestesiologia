import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CurriculumYearCardProps {
  title: string;
  description: string;
  link: Parameters<typeof Link>[0]["href"];
  topics?: string[];
}

export function CurriculumYearCard({ title, description, link, topics = [] }: CurriculumYearCardProps) {
  return (
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <ul className="mb-4 list-disc pl-5 text-sm text-muted-foreground">
          {topics.slice(0, 3).map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
        <Link href={link}>
          <Button size="sm">Ver tópicos</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
