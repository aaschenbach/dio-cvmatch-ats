import { containsTerm, normalizeText } from "./normalize";
import { parseResume } from "./resume";
import type { AnalysisResult } from "./score";

export interface Recommendation {
  title: string;
  detail: string;
}

const list = (labels: string[]) => labels.slice(0, 8).join(", ") + (labels.length > 8 ? "…" : "");

/** Recomendações derivadas exclusivamente do resultado da análise e da estrutura do currículo. */
export function buildRecommendations(result: AnalysisResult, resumeText: string): Recommendation[] {
  const recs: Recommendation[] = [];
  const parsed = parseResume(resumeText);
  const kinds = new Set(parsed.sections.map((s) => s.kind));

  if (result.requirements.length === 0) {
    recs.push({
      title: "Vaga sem requisitos identificáveis",
      detail:
        "Não foi possível identificar tecnologias, ferramentas ou qualificações na descrição. Cole a descrição completa, incluindo a seção de requisitos.",
    });
  }

  if (result.requirements.length > 0 && result.found.length === 0) {
    recs.push({
      title: "Nenhuma correspondência textual encontrada",
      detail:
        "Nenhum requisito da vaga aparece no texto do currículo. Confira se o currículo colado está completo e se a vaga é aderente ao seu perfil.",
    });
  }

  // Competências encontradas apenas em lista de competências, sem contexto nas experiências.
  const expText = normalizeText(
    parsed.sections.filter((s) => s.kind === "experiencia").flatMap((s) => s.lines).join("\n"),
  );
  if (kinds.has("experiencia")) {
    const noContext = result.found
      .filter((r) => !r.aliases.some((a) => containsTerm(expText, a)))
      .map((r) => r.label);
    if (noContext.length) {
      recs.push({
        title: "Torne mais explícitas competências já mencionadas",
        detail: `${list(noContext)} aparece(m) no currículo, mas não nas experiências profissionais. Se você utilizou essas competências em algum cargo, descreva onde e como.`,
      });
    }
  }

  const mandatoryMissing = result.missing.filter((r) => r.priority === "obrigatorio").map((r) => r.label);
  const otherMissing = result.missing.filter((r) => r.priority !== "obrigatorio").map((r) => r.label);
  if (mandatoryMissing.length) {
    recs.push({
      title: "Verifique requisitos obrigatórios não localizados",
      detail: `${list(mandatoryMissing)} não foi(ram) localizado(s) no texto. Se fizer(em) parte da sua experiência real, mencione explicitamente. Caso contrário, não inclua.`,
    });
  }
  if (otherMissing.length) {
    recs.push({
      title: "Confira outros termos da vaga",
      detail: `${list(otherMissing)} não aparece(m) no currículo. Inclua somente o que você realmente possui.`,
    });
  }

  const missingSections: string[] = [];
  if (!kinds.has("experiencia")) missingSections.push("Experiência Profissional");
  if (!kinds.has("formacao")) missingSections.push("Formação Acadêmica");
  if (!kinds.has("competencias")) missingSections.push("Competências");
  if (missingSections.length) {
    recs.push({
      title: "Use títulos de seção reconhecíveis",
      detail: `Não identificamos os títulos: ${missingSections.join(", ")}. Se o currículo possui esse conteúdo, use esses títulos para facilitar a leitura automática.`,
    });
  }

  if (parsed.unclassified.length) {
    recs.push({
      title: "Estrutura incomum",
      detail:
        "Parte do conteúdo não pôde ser classificada e foi mantida em uma seção para revisão no currículo ajustado.",
    });
  }

  const longLines = resumeText.split("\n").filter((l) => l.trim().length > 350).length;
  if (longLines) {
    recs.push({
      title: "Divida parágrafos longos",
      detail: `Há ${longLines} parágrafo(s) muito longo(s). Separar atividades em tópicos facilita a leitura.`,
    });
  }

  return recs;
}
