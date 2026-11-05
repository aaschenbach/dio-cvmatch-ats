import { normalizeText } from "./normalize";

export type SectionKind =
  | "resumo"
  | "experiencia"
  | "formacao"
  | "competencias"
  | "certificacoes"
  | "idiomas"
  | "outra";

const SECTION_PATTERNS: { kind: SectionKind; title: string; re: RegExp }[] = [
  { kind: "resumo", title: "RESUMO PROFISSIONAL", re: /^(resumo( profissional)?|perfil( profissional)?|sobre mim|apresentacao|summary)$/ },
  {
    kind: "experiencia",
    title: "EXPERIÊNCIA PROFISSIONAL",
    re: /^(experiencias?( profissional| profissionais)?|historico profissional|trajetoria profissional|experience)$/,
  },
  {
    kind: "formacao",
    title: "FORMAÇÃO ACADÊMICA",
    re: /^(formacao( academica)?|escolaridade|educacao|formacao escolar|education)$/,
  },
  {
    kind: "competencias",
    title: "COMPETÊNCIAS",
    re: /^(competencias( tecnicas)?|habilidades( tecnicas)?|conhecimentos( tecnicos)?|skills|hard skills|soft skills|ferramentas|tecnologias)$/,
  },
  { kind: "certificacoes", title: "CERTIFICAÇÕES", re: /^(certificacoes|certificados|certificacoes e cursos)$/ },
  { kind: "idiomas", title: "IDIOMAS", re: /^(idiomas?|linguas|languages)$/ },
  {
    kind: "outra",
    title: "",
    re: /^(objetivo( profissional)?|cursos( complementares)?|projetos|voluntariado|premios|publicacoes|informacoes adicionais|atividades complementares|contato|dados pessoais|referencias)$/,
  },
];

export interface ParsedSection {
  kind: SectionKind;
  title: string;
  lines: string[];
}

export interface ParsedResume {
  header: string[];
  sections: ParsedSection[];
  /** Conteúdo que não pôde ser classificado com segurança. */
  unclassified: string[];
}

/** Retorna a classificação se a linha for um título de seção reconhecido. */
export function detectHeading(line: string): { kind: SectionKind; title: string } | null {
  const raw = line.trim();
  if (!raw || raw.length > 45) return null;
  const norm = normalizeText(raw.replace(/[:\-–—]+\s*$/, ""));
  for (const p of SECTION_PATTERNS) {
    if (p.re.test(norm)) {
      return { kind: p.kind, title: p.title || raw.replace(/[:\-–—]+\s*$/, "").trim().toUpperCase() };
    }
  }
  return null;
}

/** Normaliza marcadores de lista sem alterar o conteúdo da linha. */
function cleanLine(line: string): string {
  return line.replace(/\s+$/, "").replace(/^(\s*)[•●▪◦*–—]\s*/, "$1- ");
}

export function parseResume(text: string): ParsedResume {
  const lines = text.replace(/\r\n?/g, "\n").split("\n").map(cleanLine);
  const header: string[] = [];
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (const line of lines) {
    const h = detectHeading(line);
    if (h) {
      current = { kind: h.kind, title: h.title, lines: [] };
      sections.push(current);
      continue;
    }
    if (current) current.lines.push(line);
    else header.push(line);
  }

  let unclassified: string[] = [];
  let finalHeader = header;
  if (sections.length === 0) {
    // Estrutura incomum: identificação = primeiro bloco; restante preservado para revisão.
    const trimmed = trimBlank(header);
    const firstBlank = trimmed.findIndex((l) => l.trim() === "");
    if (firstBlank === -1) {
      finalHeader = trimmed.slice(0, Math.min(trimmed.length, 4));
      unclassified = trimmed.slice(finalHeader.length);
    } else {
      finalHeader = trimmed.slice(0, firstBlank);
      unclassified = trimmed.slice(firstBlank + 1);
    }
  }

  return { header: trimBlank(finalHeader), sections, unclassified: trimBlank(unclassified) };
}

function trimBlank(lines: string[]): string[] {
  let s = 0;
  let e = lines.length;
  while (s < e && lines[s].trim() === "") s++;
  while (e > s && lines[e - 1].trim() === "") e--;
  // colapsa várias linhas em branco seguidas em uma
  return lines.slice(s, e).filter((l, i, arr) => !(l.trim() === "" && i > 0 && arr[i - 1].trim() === ""));
}

const ORDER: SectionKind[] = ["resumo", "experiencia", "formacao", "competencias", "certificacoes", "idiomas"];

/**
 * Gera o currículo reorganizado. Regras:
 * - nenhuma linha original é descartada nem reescrita (só marcadores de lista);
 * - registros dentro de cada seção mantêm a ordem original (cargo/empresa/período/atividades juntos);
 * - seções do mesmo tipo são unidas na ordem em que apareceram;
 * - seções vazias não são criadas.
 */
export function generateAtsResume(text: string): string {
  const parsed = parseResume(text);
  const blocks: string[] = [];

  if (parsed.header.length) blocks.push(parsed.header.join("\n"));

  for (const kind of ORDER) {
    const group = parsed.sections.filter((s) => s.kind === kind);
    const content = trimBlank(group.flatMap((s, i) => (i > 0 ? ["", ...s.lines] : s.lines)));
    if (content.some((l) => l.trim())) blocks.push(`${group[0].title}\n${content.join("\n")}`);
  }

  for (const s of parsed.sections.filter((x) => x.kind === "outra")) {
    const content = trimBlank(s.lines);
    if (content.some((l) => l.trim())) blocks.push(`${s.title}\n${content.join("\n")}`);
  }

  if (parsed.unclassified.length) {
    blocks.push(`CONTEÚDO ORIGINAL PARA REVISÃO\n${parsed.unclassified.join("\n")}`);
  }

  return blocks.join("\n\n").trim() + "\n";
}
