"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  finalizeEmergencyAttemptAction,
  startEmergencyAttemptAction,
  submitEmergencyStepAction
} from "@/features/emergencies/actions";
import { Button } from "@/components/ui/button";
import { EmergencyActionSelector } from "@/components/emergencies/emergency-action-selector";
import { EmergencyDebriefCard } from "@/components/emergencies/emergency-debrief-card";
import { EmergencyFeedbackPanel } from "@/components/emergencies/emergency-feedback-panel";
import { EmergencyStepView } from "@/components/emergencies/emergency-step-view";
import type { EmergencyScenarioStep } from "@/types/database";

interface ScenarioRunnerProps {
  steps: EmergencyScenarioStep[];
  scenario: {
    id: string;
    title: string;
  };
}

export function EmergencyScenarioRunner({ steps, scenario }: ScenarioRunnerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [confidenceBefore, setConfidenceBefore] = useState(3);
  const [confidenceAfter, setConfidenceAfter] = useState(3);
  const [readiness, setReadiness] = useState("ready_with_close_supervision");
  const [reflection, setReflection] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [feedbackByStep, setFeedbackByStep] = useState<Record<string, string>>({});
  const [resultSummary, setResultSummary] = useState<{ scorePercent: number; debriefSummary: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentStep = steps[currentIndex] ?? null;
  const currentOptions =
    ((currentStep?.payload_jsonb?.options as { key: string; label: string }[] | undefined) ?? []).map((option) => ({
      key: option.key,
      label: option.label
    }));
  const completedCount = Object.keys(feedbackByStep).length;
  const progressPercent = useMemo(
    () => (steps.length ? Math.round((completedCount / steps.length) * 100) : 0),
    [completedCount, steps.length]
  );

  const startScenario = () => {
    startTransition(async () => {
      const result = await startEmergencyAttemptAction({
        scenarioId: scenario.id,
        confidenceBefore
      });

      if (!result.ok) {
        setMessage(result.message ?? "Falha ao iniciar cenário.");
        return;
      }

      setAttemptId(result.attemptId ?? null);
      setMessage(result.message);
    });
  };

  const submitStep = (key: string) => {
    if (!attemptId || !currentStep) {
      return;
    }

    const optionLabel = currentOptions.find((option) => option.key === key)?.label;
    setSelectedKey(key);

    startTransition(async () => {
      const result = await submitEmergencyStepAction({
        attemptId,
        scenarioId: scenario.id,
        stepId: currentStep.id,
        selectedKey: key,
        optionLabel
      });

      if (!result.ok) {
        setMessage(result.message ?? "Falha ao registrar ação.");
        return;
      }

      setFeedbackByStep((prev) => ({
        ...prev,
        [currentStep.id]: result.feedback ?? "Conduta registrada."
      }));
      setMessage(result.feedback ?? "Conduta registrada.");
    });
  };

  const goNext = () => {
    if (currentIndex + 1 < steps.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedKey(null);
      setMessage(null);
    }
  };

  const finalizeScenario = () => {
    if (!attemptId) {
      return;
    }

    startTransition(async () => {
      const result = await finalizeEmergencyAttemptAction({
        attemptId,
        scenarioId: scenario.id,
        confidenceAfter,
        perceivedReadiness: readiness,
        reflectionText: reflection
      });

      if (!result.ok) {
        setMessage(result.message ?? "Falha ao finalizar cenário.");
        return;
      }

      setResultSummary({
        scorePercent: result.scorePercent ?? 0,
        debriefSummary: result.debriefSummary ?? "Debriefing concluído."
      });
      router.push(`/emergencies/result/${result.attemptId}`);
    });
  };

  const lastStepCompleted = steps.length > 0 && completedCount >= steps.length;

  return (
    <div className="space-y-6">
      {!attemptId ? (
        <section className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card/90 p-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Iniciar simulação</h2>
            <p className="text-sm text-muted-foreground">
              Registre sua confiança antes do cenário. A tentativa será vinculada ao trainee autenticado e usada no debriefing.
            </p>
          </div>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Confiança antes do cenário
            <input
              type="range"
              min="1"
              max="5"
              value={confidenceBefore}
              className="h-2 w-full accent-primary"
              onChange={(event) => setConfidenceBefore(Number(event.target.value))}
            />
          </label>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Nível atual: {confidenceBefore}/5</span>
            <Button onClick={startScenario} disabled={isPending}>
              {isPending ? "Iniciando..." : "Começar cenário"}
            </Button>
          </div>
        </section>
      ) : null}

      {attemptId && currentStep ? (
        <>
          <EmergencyStepView step={currentStep} />
          {currentOptions.length ? (
            <EmergencyActionSelector options={currentOptions} selectedKey={selectedKey ?? undefined} onSelect={submitStep} />
          ) : null}
          {message ? <EmergencyFeedbackPanel title="Feedback imediato" message={message} /> : null}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={goNext}
              disabled={isPending || !feedbackByStep[currentStep.id] || currentIndex + 1 >= steps.length}
            >
              Próxima etapa
            </Button>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Etapa {Math.min(currentIndex + 1, steps.length)}/{steps.length} · progresso {progressPercent}%
            </span>
          </div>
        </>
      ) : null}

      {attemptId && lastStepCompleted ? (
        <section className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card/90 p-6">
          <EmergencyDebriefCard
            score={resultSummary?.scorePercent ?? progressPercent}
            summary={resultSummary?.debriefSummary ?? "Finalize a autoavaliação para consolidar o debriefing do cenário."}
            recommend="Registre sua prontidão final e leve o resultado para discussão com o preceptor."
            onViewResult={finalizeScenario}
            ctaLabel={isPending ? "Salvando..." : "Salvar resultado e abrir debriefing"}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Confiança após o cenário
              <input
                type="range"
                min="1"
                max="5"
                value={confidenceAfter}
                className="h-2 w-full accent-primary"
                onChange={(event) => setConfidenceAfter(Number(event.target.value))}
              />
            </label>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Prontidão percebida
              <select
                value={readiness}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                onChange={(event) => setReadiness(event.target.value)}
              >
                <option value="not_ready">Ainda não pronto</option>
                <option value="ready_with_close_supervision">Pronto com supervisão próxima</option>
                <option value="ready_with_standard_supervision">Pronto com supervisão padrão</option>
                <option value="confident_under_indirect_supervision">Confiante com supervisão indireta</option>
              </select>
            </label>
          </div>
          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Reflexão final
            <textarea
              value={reflection}
              className="w-full rounded-2xl border border-border px-4 py-3 text-sm"
              placeholder="O que você faria igual, o que corrigiria e o que quer revisar com o preceptor?"
              onChange={(event) => setReflection(event.target.value)}
            />
          </label>
        </section>
      ) : null}
    </div>
  );
}
