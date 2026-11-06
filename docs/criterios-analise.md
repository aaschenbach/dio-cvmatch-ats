# Critérios de análise — CVMatch ATS

Todo o processamento ocorre no navegador (`src/lib/cvmatch`). Nenhum texto é enviado a servidores.

## Normalização (`normalize.ts`)
- Minúsculas e remoção de acentos (NFD).
- Pontuação irrelevante vira espaço; `+ # . /` são preservados dentro de palavras (C++, C#, .NET, Node.js, CI/CD).
- Correspondência por palavra/expressão inteira: "java" não casa com "javascript".
- Stopwords em português são ignoradas na extração de siglas.

## Extração de requisitos (`extract.ts`)
Duas fontes, sempre a partir do texto literal da vaga:
1. **Dicionário técnico** (`dictionary.ts`): linguagens, frameworks, bancos, cloud, metodologias, certificações e idiomas, com equivalências explícitas (JS ↔ JavaScript, TS ↔ TypeScript, K8s ↔ Kubernetes…).
2. **Siglas destacadas** na vaga (2–8 caracteres em maiúsculas, ex.: ABAP, NR-10), excluindo termos genéricos (VR, CLT, PJ, TI…).

Seções de benefícios/sobre a empresa são ignoradas. Termos compostos sobrepostos são resolvidos (React Native não conta como React isolado).

## Classificação e pesos
| Classificação | Gatilhos | Peso |
|---|---|---|
| Obrigatório | "obrigatório", "necessário", "requisitos", "exigido", "imprescindível", seção de qualificações | 3 |
| Desejável | "desejável", "diferencial", "plus" | 1 |
| Sem classificação segura | demais casos (ex.: responsabilidades) | 2 |

Palavras na própria linha têm precedência sobre o título da seção. Se o termo aparece várias vezes, vale a classificação mais forte.

## Correspondência e pontuação (`score.ts`)
- **Encontrado**: algum alias aparece no currículo. Indica apenas menção textual, não comprovação de domínio.
- **Não encontrado**: não aparece no texto — não significa que o candidato não tenha a competência.
- `Compatibilidade = round(soma pesos encontrados / soma pesos totais × 100)`.
- Com menos de 3 requisitos identificados, a análise é **inconclusiva** (sem porcentagem).
- Determinística: entradas idênticas produzem o mesmo resultado.

## Currículo ATS (`resume.ts`)
- Detecta títulos de seção conhecidos e os padroniza (EXPERIÊNCIA PROFISSIONAL, FORMAÇÃO ACADÊMICA…).
- Ordem: identificação, resumo, experiência, formação, competências, certificações, idiomas, outras seções.
- O conteúdo de cada seção é mantido literalmente e na ordem original (cargo, empresa, período e atividades permanecem juntos). Só marcadores de lista são uniformizados para "- ".
- Sem títulos reconhecíveis, o texto é preservado em "CONTEÚDO ORIGINAL PARA REVISÃO". Nada é descartado nem inventado.

## Limitações
- Termos fora do dicionário e que não sejam siglas não são reconhecidos.
- Não há interpretação semântica (sinônimos não listados não casam).
- A pontuação não representa nenhum ATS específico nem probabilidade de contratação.
