# CVMatch ATS — Plano de implementação (MVP)

Aplicação em português, 100% local no navegador (sem servidor, banco, login ou IA externa), seguindo o mega prompt enviado.

## Fluxo (página única em `/`, com indicador de 4 etapas)
0. **Início**: título, subtítulo, funcionalidades, aviso de integridade, aviso de privacidade, botão "Começar análise".
1. **Inserir informações**: dois campos grandes (vaga e currículo), contagem de caracteres, botão limpar, validação (vazio / mínimo de caracteres), botão "Analisar meu currículo".
2. **Compatibilidade**: percentual + barra, encontrados/não encontrados, fórmula explicada, aviso de estimativa; estado "inconclusivo" se houver poucos requisitos.
3. **Sugestões**: badges de palavras encontradas (verde) e não encontradas (vermelho, com texto neutro), recomendações derivadas do resultado, botão "Gerar currículo ajustado".
4. **Currículo e exportação**: editor de texto com versão gerada, Copiar, Restaurar, Exportar PDF (jsPDF, A4, texto selecionável, múltiplas páginas), aviso para revisar. Botões voltar / nova análise em todas as etapas.

## Visual
Paleta do prompt (azul #1D465A, laranja #E08E58, fundo #F5F7F9, texto #24333D, verde #27866C, vermelho #C45C54) convertida para tokens oklch; fonte Manrope; componentes shadcn (card, button, textarea, badge, progress, tabs, sonner); animações mínimas.

## Motor de análise (funções puras)
- Normalização: minúsculas, remoção de acentos, pontuação, stopwords PT, limites de palavra (sem casar fragmentos).
- Extração: dicionário de termos técnicos/metodologias/certificações (incluindo compostos como "power bi", "machine learning") + termos de linhas de requisitos; equivalências seguras (JS↔JavaScript, TS↔TypeScript etc.).
- Classificação por seção/linha: obrigatório (3), desejável/diferencial (1), neutro (2).
- Pontuação = pesos encontrados / pesos totais × 100, arredondado; inconclusivo abaixo de 3 requisitos.

## Gerador do currículo
Detecta títulos de seções (experiência, formação, competências, idiomas, certificações, resumo...), normaliza títulos em maiúsculas, ordena seções padrão, preserva o texto original de cada linha; cabeçalho = linhas antes da primeira seção; conteúdo não classificado vai para "Outras informações" — nada é inventado nem descartado.

## Detalhes técnicos
- `src/lib/cvmatch/` : `normalize.ts`, `extract.ts`, `score.ts`, `recommendations.ts`, `resume.ts`, `pdf.ts`, `dictionary.ts`.
- `src/components/cvmatch/` : Stepper, InputStep, ResultsStep, SuggestionsStep, ResumeStep, Notices.
- Instalar `jspdf`; Manrope via `<link>` no `__root`; head() com título/descrição próprios.
- Testes Vitest para normalização, extração, pontuação e preservação de conteúdo no gerador; executados antes de concluir.
- `docs/mega-prompt.md` (texto enviado) e `docs/criterios-analise.md`.
