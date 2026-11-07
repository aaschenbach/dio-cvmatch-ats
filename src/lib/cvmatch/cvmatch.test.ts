import { describe, expect, it } from "vitest";
import { containsTerm, normalizeText } from "./normalize";
import { extractRequirements } from "./extract";
import { analyze, computeScore } from "./score";
import { generateAtsResume } from "./resume";

const JOB = `Desenvolvedor Front-end
Requisitos obrigatórios:
- Experiência com React e TypeScript
- Conhecimento em Git
Diferenciais:
- Docker
Benefícios:
- Vale refeição, VR, plano de saúde AWS`;

const CV = `Maria Exemplo
maria@exemplo.com

RESUMO
Desenvolvedora front-end.

COMPETÊNCIAS
JS, TS, Git

Experiência Profissional
Desenvolvedora - Empresa A (2020 - 2023)
- Criei telas em React.
Estagiária - Empresa B (2019 - 2020)
- Suporte interno.

Formação
Bacharel em Sistemas - Universidade X (2019)`;

describe("normalização", () => {
  it("remove acentos e caixa", () => {
    expect(normalizeText("Gestão ÁGIL.")).toBe("gestao agil");
  });
  it("não casa fragmentos de palavras", () => {
    expect(containsTerm(normalizeText("JavaScript avançado"), "java")).toBe(false);
    expect(containsTerm(normalizeText("Java e C#"), "c#")).toBe(true);
  });
});

describe("extração", () => {
  const reqs = extractRequirements(JOB);
  const by = (l: string) => reqs.find((r) => r.label === l);
  it("classifica obrigatórios e desejáveis", () => {
    expect(by("React")?.priority).toBe("obrigatorio");
    expect(by("Git")?.priority).toBe("obrigatorio");
    expect(by("Docker")?.priority).toBe("desejavel");
  });
  it("ignora a seção de benefícios e termos genéricos", () => {
    expect(by("AWS")).toBeUndefined();
    expect(reqs.some((r) => r.label === "VR")).toBe(false);
  });
});

describe("pontuação", () => {
  it("usa equivalências seguras e pesos 3/1", () => {
    const r = analyze(JOB, CV);
    // React(3)+TS(3)+Git(3) encontrados, Docker(1) ausente => 9/10
    expect(r.score).toBe(90);
    expect(r.missing.map((m) => m.label)).toEqual(["Docker"]);
  });
  it("é reproduzível", () => {
    expect(analyze(JOB, CV)).toEqual(analyze(JOB, CV));
  });
  it("é inconclusiva com menos de 3 requisitos", () => {
    expect(analyze("Requisitos: Python", "Python").score).toBeNull();
    expect(computeScore([]).score).toBeNull();
  });
});

describe("cobertura multiprofissional e falsos positivos", () => {
  it("identifica requisitos financeiros descritivos", () => {
    const result = analyze(
      "Requisitos obrigatórios:\n- Conciliação bancária\n- Fluxo de caixa\n- DRE",
      "Atuação em conciliação bancária e fluxo de caixa.",
    );
    expect(result.inconclusive).toBe(false);
    expect(result.score).toBe(67);
    expect(result.missing.map((r) => r.label)).toContain("DRE");
  });
  it("não transforma siglas administrativas ou códigos de vaga em competências", () => {
    const reqs = extractRequirements(
      "Requisitos obrigatórios:\n- Excel e CRM\n- Atendimento B2B\n- VAGA-01, LATAM, PCD, PME, EUA",
    );
    for (const tok of ["VAGA-01", "LATAM", "PCD", "PME", "EUA"]) {
      expect(reqs.some((r) => r.label === tok)).toBe(false);
    }
    expect(reqs.some((r) => r.label === "B2B")).toBe(true);
  });
  it("não pontua CSS duas vezes quando exigido apenas Tailwind CSS", () => {
    const reqs = extractRequirements("Requisitos obrigatórios:\n- Tailwind CSS\n- Git\n- React");
    expect(reqs.some((r) => r.label === "Tailwind CSS")).toBe(true);
    expect(reqs.some((r) => r.label === "CSS")).toBe(false);
  });
});

describe("currículo ATS", () => {
  const out = generateAtsResume(CV);
  it("preserva todas as linhas originais de conteúdo", () => {
    for (const line of CV.split("\n").map((l) => l.trim()).filter(Boolean)) {
      const isHeading = ["RESUMO", "COMPETÊNCIAS", "Experiência Profissional", "Formação"].includes(line);
      if (!isHeading) expect(out).toContain(line.replace(/^[•*]\s*/, "- "));
    }
  });
  it("reordena seções sem alterar a ordem interna das experiências", () => {
    expect(out.indexOf("EXPERIÊNCIA PROFISSIONAL")).toBeLessThan(out.indexOf("COMPETÊNCIAS"));
    const a = out.indexOf("Empresa A");
    expect(a).toBeLessThan(out.indexOf("Criei telas em React."));
    expect(out.indexOf("Criei telas em React.")).toBeLessThan(out.indexOf("Empresa B"));
  });
  it("não perde conteúdo de currículo sem seções", () => {
    const raw = "João Teste\njoao@x.com\n\nTrabalhei na Empresa Z de 2018 a 2022.";
    const o = generateAtsResume(raw);
    expect(o).toContain("Trabalhei na Empresa Z de 2018 a 2022.");
    expect(o).toContain("CONTEÚDO ORIGINAL PARA REVISÃO");
  });
});
