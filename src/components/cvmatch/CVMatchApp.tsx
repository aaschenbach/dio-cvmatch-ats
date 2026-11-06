import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCopy,
  FileDown,
  FileSearch,
  Lightbulb,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { analyze, type AnalysisResult, type MatchedRequirement } from "@/lib/cvmatch/score";
import { buildRecommendations } from "@/lib/cvmatch/recommendations";
import { generateAtsResume } from "@/lib/cvmatch/resume";
import { exportResumePdf } from "@/lib/cvmatch/pdf";
import { cn } from "@/lib/utils";

export const MIN_CHARS = 150;
const STEPS = ["Inserir informações", "Analisar compatibilidade", "Revisar sugestões", "Gerar e exportar"];
const PRIORITY_LABEL = { obrigatorio: "obrigatório", desejavel: "desejável", neutro: "sem classificação" };

function IntegrityNotice() {
  return (
    <p className="flex items-start gap-2 rounded-md border border-accent/40 bg-accent/10 p-3 text-sm">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" aria-hidden />
      O CVMatch ATS organiza e melhora a apresentação das informações existentes no currículo. Não cria
      experiências ou qualificações que você não possui.
    </p>
  );
}

function PrivacyNotice() {
  return (
    <p className="flex items-center gap-2 text-xs text-muted-foreground">
      <Lock className="h-3.5 w-3.5" aria-hidden />
      Seus textos são processados localmente no navegador e não são enviados a um servidor para análise.
    </p>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Progresso">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "current" : "todo";
        return (
          <li key={label} className="flex flex-col gap-1.5" aria-current={state === "current" ? "step" : undefined}>
            <span
              className={cn(
                "h-1.5 rounded-full",
                state === "todo" ? "bg-border" : state === "current" ? "bg-accent" : "bg-primary",
              )}
            />
            <span
              className={cn(
                "text-xs font-medium",
                state === "todo" ? "text-muted-foreground" : "text-foreground",
              )}
            >
              <span className="hidden sm:inline">{n}. {label}</span>
              <span className="sm:hidden">{n}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Field(props: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string | undefined;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={props.id} className="text-base font-semibold">
          {props.label}
        </Label>
        <span className="text-xs text-muted-foreground">{props.value.length.toLocaleString("pt-BR")} caracteres</span>
      </div>
      <Textarea
        id={props.id}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        className="min-h-[320px] resize-y bg-card font-sans text-sm leading-relaxed"
        aria-invalid={!!props.error}
        aria-describedby={props.error ? `${props.id}-err` : undefined}
      />
      {props.error && (
        <p id={`${props.id}-err`} className="text-sm text-destructive">
          {props.error}
        </p>
      )}
    </div>
  );
}

function validate(text: string, what: string): string | undefined {
  const t = text.trim();
  if (!t) return `Preencha ${what}.`;
  if (t.length < MIN_CHARS) return `Texto muito curto: informe pelo menos ${MIN_CHARS} caracteres em ${what}.`;
  return undefined;
}

function KeywordList({ items, variant }: { items: MatchedRequirement[]; variant: "success" | "missing" }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">Nenhum termo nesta categoria.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((r) => (
        <Badge key={r.label} variant={variant} className="gap-1 py-1 text-sm font-medium">
          {r.label}
          <span className="text-[10px] font-normal opacity-80">· {PRIORITY_LABEL[r.priority]}</span>
        </Badge>
      ))}
    </div>
  );
}

export function CVMatchApp() {
  const [step, setStep] = useState(0);
  const [job, setJob] = useState("");
  const [cv, setCv] = useState("");
  const [errors, setErrors] = useState<{ job?: string | undefined; cv?: string | undefined }>({});
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [generated, setGenerated] = useState("");
  const [edited, setEdited] = useState("");
  const [exporting, setExporting] = useState(false);

  const recommendations = useMemo(() => (result ? buildRecommendations(result, cv) : []), [result, cv]);

  const runAnalysis = () => {
    const e = { job: validate(job, "a descrição da vaga"), cv: validate(cv, "o currículo") };
    setErrors(e);
    if (e.job || e.cv) return;
    const r = analyze(job, cv);
    setResult(r);
    setStep(2);
    if (r.requirements.length === 0) toast.warning("Não identificamos requisitos na vaga.");
    else toast.success("Análise concluída.");
  };

  const generate = () => {
    const out = generateAtsResume(cv);
    setGenerated(out);
    setEdited(out);
    setStep(4);
    toast.success("Currículo ajustado gerado. Revise antes de enviar.");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(edited);
      toast.success("Currículo copiado.");
    } catch {
      toast.error("Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.");
    }
  };

  const exportPdf = () => {
    if (!edited.trim()) return;
    setExporting(true);
    try {
      exportResumePdf(edited);
      toast.success("PDF gerado: curriculo-cvmatch.pdf");
    } catch {
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setExporting(false);
    }
  };

  const newAnalysis = () => {
    setResult(null);
    setGenerated("");
    setEdited("");
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <button
            onClick={() => setStep(0)}
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-primary"
          >
            <FileSearch className="h-5 w-5 text-accent" aria-hidden /> CVMatch ATS
          </button>
          {step > 0 && (
            <Button variant="ghost" size="sm" onClick={newAnalysis}>
              <RotateCcw /> Nova análise
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        {step > 0 && <Stepper step={step} />}

        {step === 0 && (
          <section className="mx-auto flex max-w-3xl flex-col gap-6 py-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">CVMatch ATS</h1>
            <p className="text-lg text-muted-foreground">
              Compare seu currículo com uma vaga, descubra oportunidades de melhoria e gere uma versão mais clara para
              processos seletivos.
            </p>
            <div className="grid gap-3 text-left sm:grid-cols-3">
              {[
                ["Compatibilidade", "Estimativa transparente baseada nos requisitos da vaga."],
                ["Sugestões", "Palavras-chave encontradas, ausentes e recomendações."],
                ["Currículo ATS", "Versão reorganizada, editável e exportável em PDF."],
              ].map(([t, d]) => (
                <Card key={t}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{t}</CardTitle>
                    <CardDescription>{d}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <IntegrityNotice />
            <div className="flex flex-col items-center gap-3">
              <Button size="lg" onClick={() => setStep(1)}>
                Começar análise
              </Button>
              <PrivacyNotice />
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Field
                id="job"
                label="Descrição da vaga"
                value={job}
                onChange={setJob}
                error={errors.job}
                placeholder="Cole aqui a descrição completa da vaga, incluindo requisitos, responsabilidades e qualificações."
              />
              <Field
                id="cv"
                label="Meu currículo"
                value={cv}
                onChange={setCv}
                error={errors.cv}
                placeholder="Cole aqui o texto do seu currículo, incluindo resumo, experiências, formação e competências."
              />
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <PrivacyNotice />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!job && !cv}
                  onClick={() => {
                    setJob("");
                    setCv("");
                    setErrors({});
                    toast("Campos limpos.");
                  }}
                >
                  <Trash2 /> Limpar campos
                </Button>
                <Button onClick={runAnalysis} disabled={!job.trim() || !cv.trim()}>
                  Analisar meu currículo
                </Button>
              </div>
            </div>
          </section>
        )}

        {step === 2 && result && (
          <section className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Compatibilidade estimada</CardTitle>
                <CardDescription>
                  Esta é uma estimativa baseada em correspondências textuais. Sistemas ATS reais podem utilizar
                  critérios diferentes.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {result.inconclusive ? (
                  <p className="rounded-md bg-muted p-4 text-sm">
                    <strong>Análise inconclusiva.</strong> Foram identificados apenas {result.requirements.length}{" "}
                    requisito(s) na vaga — o mínimo é 3 para calcular uma porcentagem confiável. Cole a descrição
                    completa da vaga, incluindo requisitos e qualificações.
                  </p>
                ) : (
                  <>
                    <div className="flex items-end gap-3">
                      <span className="text-6xl font-extrabold text-primary">{result.score}%</span>
                    </div>
                    <Progress value={result.score ?? 0} aria-label="Compatibilidade estimada" />
                  </>
                )}
                <div className="flex flex-wrap gap-6 text-sm">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {result.found.length} encontrado(s)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-destructive" /> {result.missing.length} não encontrado(s)
                  </span>
                </div>
                <div className="rounded-md border p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Como calculamos</p>
                  <p>
                    Compatibilidade = (soma dos pesos encontrados ÷ soma de todos os pesos) × 100. Pesos: obrigatório
                    = 3, sem classificação = 2, desejável = 1.
                  </p>
                  <p className="mt-1">
                    Nesta análise: {result.foundWeight} ÷ {result.totalWeight}.
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft /> Editar textos
              </Button>
              <Button onClick={() => setStep(3)}>Ver sugestões</Button>
            </div>
          </section>
        )}

        {step === 3 && result && (
          <section className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Palavras-chave encontradas</CardTitle>
                  <CardDescription>Termos da vaga que aparecem no texto do currículo.</CardDescription>
                </CardHeader>
                <CardContent>
                  <KeywordList items={result.found} variant="success" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Palavras-chave não encontradas</CardTitle>
                  <CardDescription>
                    Não localizadas no texto. Isso não significa que você não possua a competência.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <KeywordList items={result.missing} variant="missing" />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" /> Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recommendations.length ? (
                  <ul className="flex flex-col gap-4">
                    {recommendations.map((r) => (
                      <li key={r.title}>
                        <p className="font-semibold">{r.title}</p>
                        <p className="text-sm text-muted-foreground">{r.detail}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Não há recomendações específicas para esta análise: todos os requisitos identificados aparecem no
                    currículo e as seções principais foram reconhecidas.
                  </p>
                )}
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft /> Voltar
              </Button>
              <Button onClick={generate}>
                <Sparkles /> Gerar currículo ajustado
              </Button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="flex flex-col gap-4">
            <IntegrityNotice />
            <p className="text-sm font-medium text-destructive">
              Revise todos os dados antes de enviar o documento. Seções foram reorganizadas e os títulos padronizados;
              o conteúdo original foi mantido.
            </p>
            <Label htmlFor="editor" className="text-base font-semibold">
              Currículo ajustado (editável)
            </Label>
            <Textarea
              id="editor"
              value={edited}
              onChange={(e) => setEdited(e.target.value)}
              className="min-h-[520px] bg-card font-mono text-sm leading-relaxed"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft /> Voltar
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={edited === generated}
                  onClick={() => {
                    setEdited(generated);
                    toast("Versão gerada restaurada.");
                  }}
                >
                  <RotateCcw /> Restaurar versão gerada
                </Button>
                <Button variant="outline" onClick={copy} disabled={!edited.trim()}>
                  <ClipboardCopy /> Copiar
                </Button>
                <Button onClick={exportPdf} disabled={!edited.trim() || exporting}>
                  <FileDown /> {exporting ? "Gerando…" : "Exportar PDF"}
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
