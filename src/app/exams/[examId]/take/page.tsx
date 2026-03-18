import { notFound } from "next/navigation";

import { ExamSession } from "@/components/exams/exam-session";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchExamById, fetchExamQuestionLinks, fetchQuestionById, fetchQuestionOptions } from "@/services/db/modules";

export const metadata = {
  title: "Realizar prova"
};

interface ExamTakePageProps {
  params: Promise<{
    examId: string;
  }>;
}

export default async function ExamTakePage({ params }: ExamTakePageProps) {
  const profile = await requireModuleAccess("exam-take", { onDenied: "notFound" });
  const { examId } = await params;
  const exam = await fetchExamById(examId, profile.institution_id);
  if (!exam) {
    notFound();
  }

  const questionLinks = await fetchExamQuestionLinks(exam.id);

  const questions = await Promise.all(
    questionLinks.map(async (link) => {
      const detail = await fetchQuestionById(link.question_id, profile.institution_id);
      const options = await fetchQuestionOptions(link.question_id);
      return {
        question:
          detail ?? {
            id: link.question_id,
            institution_id: exam.institution_id,
            curriculum_year_id: exam.curriculum_year_id ?? null,
            curriculum_topic_id: null,
            curriculum_subtopic_id: null,
            title: null,
            stem: "Enunciado indisponível",
            rationale: null,
            difficulty: "medium",
            question_type: "single_choice",
            clinical_context_jsonb: {},
            educational_goal: null,
            status: "draft",
            source_generation_type: "human",
            active: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
        options
      };
    })
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <section className="rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
          <CardHeader className="space-y-3 p-0">
            <CardTitle className="text-2xl font-semibold">{exam.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{exam.description}</p>
          </CardHeader>
          <CardContent className="space-y-3 p-0">
            <p className="text-sm text-muted-foreground">
              Cronômetro de {exam.duration_minutes ?? 30} minutos e {questions.length} questões.
            </p>
            <p className="text-xs text-muted-foreground">
              Resolva com calma, finalize a prova e acompanhe o resultado completo logo após o envio.
            </p>
          </CardContent>
        </section>

        {questions.length === 0 ? (
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
            Nenhuma questão vinculada a esta prova.
          </div>
        ) : (
          <ExamSession exam={exam} questions={questions} />
        )}
      </main>
    </div>
  );
}
