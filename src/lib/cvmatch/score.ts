import { extractRequirements, PRIORITY_WEIGHT, type Requirement } from "./extract";
import { containsTerm, normalizeText } from "./normalize";

export const MIN_REQUIREMENTS = 3;

export interface MatchedRequirement extends Requirement {
  found: boolean;
  weight: number;
}

export interface AnalysisResult {
  requirements: MatchedRequirement[];
  found: MatchedRequirement[];
  missing: MatchedRequirement[];
  foundWeight: number;
  totalWeight: number;
  /** null quando a análise é inconclusiva. */
  score: number | null;
  inconclusive: boolean;
}

/** Compara requisitos com o currículo. "Encontrado" = menção textual, não comprovação. */
export function matchRequirements(requirements: Requirement[], resumeText: string): MatchedRequirement[] {
  const norm = normalizeText(resumeText);
  return requirements.map((r) => ({
    ...r,
    weight: PRIORITY_WEIGHT[r.priority],
    found: r.aliases.some((a) => containsTerm(norm, a)),
  }));
}

/** Compatibilidade = soma pesos encontrados / soma pesos totais × 100 (arredondado). */
export function computeScore(matched: MatchedRequirement[]): {
  score: number | null;
  foundWeight: number;
  totalWeight: number;
} {
  const totalWeight = matched.reduce((s, r) => s + r.weight, 0);
  const foundWeight = matched.filter((r) => r.found).reduce((s, r) => s + r.weight, 0);
  if (matched.length < MIN_REQUIREMENTS || totalWeight === 0) return { score: null, foundWeight, totalWeight };
  return { score: Math.round((foundWeight / totalWeight) * 100), foundWeight, totalWeight };
}

export function analyze(jobText: string, resumeText: string): AnalysisResult {
  const requirements = matchRequirements(extractRequirements(jobText), resumeText);
  const { score, foundWeight, totalWeight } = computeScore(requirements);
  return {
    requirements,
    found: requirements.filter((r) => r.found),
    missing: requirements.filter((r) => !r.found),
    foundWeight,
    totalWeight,
    score,
    inconclusive: score === null,
  };
}
