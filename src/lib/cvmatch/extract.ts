import { DICTIONARY, GENERIC_TERMS } from "./dictionary";
import { containsTerm, normalizeText, removeAccents, STOPWORDS } from "./normalize";

export type Priority = "obrigatorio" | "desejavel" | "neutro";

export interface Requirement {
  /** Rótulo exibido. */
  label: string;
  /** Formas normalizadas aceitas como correspondência. */
  aliases: string[];
  priority: Priority;
  /** Origem: dicionário técnico ou destaque explícito na vaga. */
  source: "dicionario" | "vaga";
}

export const PRIORITY_WEIGHT: Record<Priority, number> = {
  obrigatorio: 3,
  desejavel: 1,
  neutro: 2,
};

const RANK: Record<Priority, number> = { neutro: 0, desejavel: 1, obrigatorio: 2 };

const MANDATORY_RE = /obrigat|necessari|exigid|imprescindi|indispensave|requisitos?\b|requeri|essencia/;
const DESIRABLE_RE = /desejave|diferencia|\bplus\b|sera um|nice to have|\bdesejado/;
const IGNORE_SECTION_RE = /^(beneficios|o que oferecemos|oferecemos|remuneracao|sobre (a empresa|nos)|quem somos|local)/;
const NEUTRAL_SECTION_RE = /^(responsabilidades|atividades|atribuicoes|descricao|o que voce vai fazer)/;

/** Detecta se uma linha é um título de seção da vaga (curta, sem frase completa). */
function isHeadingLine(raw: string): boolean {
  const s = raw.trim();
  return s.length > 0 && s.length <= 60 && (/:$/.test(s) || /^[A-ZÀ-Ú0-9 /&-]{4,}$/.test(s));
}

/**
 * Siglas e termos técnicos destacados explicitamente na vaga que não estão no
 * dicionário (ex.: "SAP MM", "NR-10", "ABAP"). Critério conservador:
 * apenas tokens com 2–8 caracteres em MAIÚSCULAS ou com dígitos/símbolos técnicos,
 * excluindo termos genéricos e palavras comuns.
 */
// Somente códigos técnicos reconhecidos; siglas desconhecidas não são competências confiáveis.
// Ampliar esta lista requer um caso real e um teste de regressão.
const APPROVED_EXTRA_CODES = new Set(["ABAP", "COBIT", "ITSM", "NR-10", "NR-35"]);

function explicitTokens(rawLine: string): string[] {
  const tokens = rawLine.match(/[A-Za-zÀ-ú0-9+#.\\/-]+/g) ?? [];
  return tokens
    .map((tok) => tok.replace(/^[.\\/-]+|[.\\/-]+$/g, ""))
    .filter((tok) => APPROVED_EXTRA_CODES.has(tok.toUpperCase()))
    .filter((tok) => !GENERIC_TERMS.has(normalizeText(tok)) && !STOPWORDS.has(normalizeText(tok)));
}

/** Classificação de uma linha: palavras na própria linha têm precedência sobre a seção. */
function linePriority(normLine: string, sectionPriority: Priority): Priority {
  if (DESIRABLE_RE.test(normLine)) return "desejavel";
  if (MANDATORY_RE.test(normLine) && !/^requisitos? desejave/.test(normLine)) return "obrigatorio";
  return sectionPriority;
}

/**
 * Extrai requisitos da descrição da vaga combinando:
 * 1. termos do dicionário técnico encontrados no texto;
 * 2. siglas/termos técnicos destacados explicitamente.
 * Não inventa requisitos: tudo vem literalmente do texto da vaga.
 */
export function extractRequirements(jobText: string): Requirement[] {
  const map = new Map<string, Requirement>();
  let section: Priority = "neutro";
  let ignoring = false;

  const upsert = (key: string, req: Requirement) => {
    const prev = map.get(key);
    if (!prev) map.set(key, req);
    else if (RANK[req.priority] > RANK[prev.priority]) prev.priority = req.priority;
  };

  for (const rawLine of jobText.split(/\r?\n/)) {
    const norm = normalizeText(rawLine);
    if (!norm) continue;

    if (isHeadingLine(rawLine)) {
      const h = norm.replace(/:$/, "");
      if (IGNORE_SECTION_RE.test(h)) {
        ignoring = true;
        continue;
      }
      ignoring = false;
      if (DESIRABLE_RE.test(h)) section = "desejavel";
      else if (MANDATORY_RE.test(h) || /qualifica/.test(h)) section = "obrigatorio";
      else if (NEUTRAL_SECTION_RE.test(h)) section = "neutro";
      else section = "neutro";
      continue;
    }
    if (ignoring) continue;

    const priority = linePriority(norm, section);

    for (const term of DICTIONARY) {
      if (term.aliases.some((a) => containsTerm(norm, a))) {
        upsert(term.label, { label: term.label, aliases: term.aliases, priority, source: "dicionario" });
      }
    }

    for (const tok of explicitTokens(rawLine)) {
      const n = normalizeText(tok);
      const alreadyInDict = DICTIONARY.some((d) => d.aliases.includes(n));
      if (alreadyInDict) continue;
      upsert(tok.toUpperCase(), { label: tok, aliases: [n], priority, source: "vaga" });
    }
  }

  // Resolve sobreposição: se "React Native" foi encontrado, "React" só conta
  // se aparecer também isoladamente.
  const normJob = normalizeText(jobText);
  if (map.has("React Native") && map.has("React")) {
    const stripped = normJob.replace(/react native/g, " ");
    if (!containsTerm(stripped, "react") && !containsTerm(stripped, "reactjs")) map.delete("React");
  }
  if (map.has("SQL Server") && map.has("SQL")) {
    const stripped = normJob.replace(/sql server/g, " ");
    if (!containsTerm(stripped, "sql")) map.delete("SQL");
  }

  // Não pontuar CSS separadamente quando só aparece dentro de "Tailwind CSS".
  if (map.has("Tailwind CSS") && map.has("CSS")) {
    const stripped = normJob.replace(/tailwind css/g, " ");
    if (!containsTerm(stripped, "css") && !containsTerm(stripped, "css3")) map.delete("CSS");
  }

  return [...map.values()].sort((a, b) =>
    RANK[b.priority] - RANK[a.priority] || removeAccents(a.label).localeCompare(removeAccents(b.label)),
  );
}
