/** Remove acentos (diacríticos) mantendo as letras base. */
export function removeAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Normaliza texto para comparação: minúsculas, sem acentos, pontuação
 * irrelevante convertida em espaço. Preserva caracteres de termos técnicos
 * (+ # . /) quando fazem parte de uma palavra (c++, c#, .net, node.js).
 */
export function normalizeText(text: string): string {
  return removeAccents(text.toLowerCase())
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .replace(/[./-](?=\s|$)/g, " ") // ponto/barra/hífen no fim de palavra
    .replace(/(^|\s)[/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Verifica se um termo (já normalizado) aparece como palavra/expressão inteira
 * no texto normalizado — evita casar fragmentos ("java" em "javascript").
 */
export function containsTerm(normalizedText: string, normalizedTerm: string): boolean {
  if (!normalizedTerm) return false;
  const re = new RegExp(`(?:^|[^a-z0-9+#])${escapeRegex(normalizedTerm)}(?=$|[^a-z0-9+#])`);
  return re.test(normalizedText);
}

export const STOPWORDS = new Set(
  (
    "a o as os um uma uns umas de do da dos das em no na nos nas por pelo pela pelos pelas para pra com sem sob " +
    "e ou que se como mais menos muito muita ja nao sim ser estar ter tem sao seu sua seus suas nosso nossa " +
    "este esta isso esse essa aquele aquela ao aos entre sobre ate apos cada todo toda todos todas outro outra " +
    "the and or of to in for with on at by an be is are"
  ).split(" "),
);
