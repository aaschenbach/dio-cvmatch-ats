# CVMatch ATS

Aplicação web gratuita para comparar um currículo com uma vaga, identificar correspondências textuais e gerar uma versão do currículo com organização mais adequada à leitura por sistemas ATS.

> **Importante:** a pontuação é uma estimativa própria, não uma nota calculada por um ATS comercial nem uma probabilidade de contratação. A aplicação não inventa experiências, certificações ou competências.

## Problema e solução

Um currículo pode deixar de apresentar claramente as competências citadas em uma vaga. O CVMatch ATS facilita uma revisão inicial: identifica termos encontrados e não encontrados, explica a estimativa de compatibilidade e reorganiza as informações existentes em um currículo editável e exportável em PDF.

**Privacidade:** a análise ocorre no navegador, sem login, banco de dados ou serviço externo de IA para processar o currículo.

## Fluxo da aplicação

1. **Entrada:** o usuário cola a descrição da vaga e seu currículo; campos vazios ou insuficientes são validados.
2. **Análise:** o motor normaliza textos, extrai requisitos reconhecidos, identifica equivalências explícitas e calcula a compatibilidade ponderada.
3. **Sugestões:** apresenta palavras-chave encontradas e ausentes, com recomendações fundamentadas no resultado.
4. **Currículo ATS:** reorganiza seções do currículo sem criar fatos, permite edição, cópia, restauração e exportação em PDF A4 com texto selecionável.

Não é necessário criar uma conta.

## Como a compatibilidade é calculada

O motor é determinístico e funciona localmente em `src/lib/cvmatch/`:

- `dictionary.ts`: vocabulário e equivalências explícitas, incluindo TI, comercial, marketing, RH, finanças, administração e operações.
- `normalize.ts`: normalização de acentos/caixa, preservação de termos técnicos e correspondência por palavras inteiras.
- `extract.ts`: extração de requisitos do texto da vaga; restrição de siglas desconhecidas; classificação e remoção de sobreposições específicas.
- `score.ts`: correspondência com o currículo e cálculo ponderado.
- `recommendations.ts`: recomendações derivadas da análise.
- `resume.ts`: reorganização do currículo sem alterar o conteúdo factual.
- `pdf.ts`: exportação local em PDF.

**Pesos:** obrigatório = 3; desejável = 1; neutro = 2.

```text
Compatibilidade = arredondar(100 × soma dos pesos encontrados / soma de todos os pesos)
```

Com menos de três requisitos reconhecidos, o resultado é **inconclusivo**, não uma porcentagem arbitrária. Correspondência textual não comprova domínio da habilidade.

Para regras e limitações detalhadas, consulte [Critérios de análise](docs/criterios-analise.md).

## Mega prompt e evolução

O projeto foi gerado inicialmente no [Lovable](https://lovable.dev/), a partir de um mega prompt único em Markdown.

- **Prompt original:** [docs/mega-prompt.md](docs/mega-prompt.md). Descreve objetivo, telas, navegação, paleta, shadcn/ui, processamento local, integridade do currículo, PDF e testes.
- **Ajuste do plano antes da implementação:** reforço da extração de requisitos, preservação da relação entre cargo/empresa/período/atividades e adequação à estrutura técnica efetivamente gerada.
- **Primeira versão:** MVP com entrada, análise, sugestões, editor e exportação.
- **Auditoria técnica posterior:** identificou concentração do vocabulário em TI, risco de siglas indevidas e sobreposição de conceitos.
- **[PR #1](https://github.com/aaschenbach/dio-cvmatch-ats/pull/1):** ampliação do dicionário para outras áreas, restrição de siglas e tratamento da sobreposição Tailwind CSS/CSS, com testes de regressão.
- **[PR #2](https://github.com/aaschenbach/dio-cvmatch-ats/pull/2):** correção de itens de lista em maiúsculas (por exemplo, `- DRE`) que eram confundidos com títulos e não analisados.

As mudanças acima foram refinamentos da implementação; o mega prompt original permanece preservado para comparação. Não foi acrescentado backend, login ou IA externa.

## Tecnologias

React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Vitest e jsPDF. O projeto utiliza a estrutura gerada pelo Lovable com TanStack Router/Start.

## Execução local

Requer Node.js e npm compatíveis com as dependências do projeto.

```bash
git clone https://github.com/aaschenbach/dio-cvmatch-ats.git
cd dio-cvmatch-ats
npm install
npm run dev
```

### Verificações

```bash
npm run test
npm run build
npm run lint
```

Os testes automatizados estão no repositório, mas **a execução após os refinamentos ainda precisa ser confirmada**. Não é correto considerá-los aprovados apenas por existirem.

## Testes funcionais registrados

| Cenário | Resultado observado | Observação |
|---|---:|---|
| Financeiro: conciliação bancária, fluxo de caixa, DRE | 67% | Compatível com o esperado |
| Comercial: Excel, CRM e B2B, com siglas administrativas | 100% | Confirmar visualmente a ausência de siglas indevidas |
| Front-end: Tailwind CSS, Git e React | 75% | Divergência a investigar; esperado 100% |
| Regressão de TI: React, TypeScript, Git e Docker | 90% | Compatível com o esperado |

Esses resultados foram informados durante testes manuais e não equivalem à execução da suíte automatizada. Currículos e vagas usados nas demonstrações são fictícios.

## Limitações conhecidas

- O vocabulário é finito; conceitos não cadastrados podem não ser identificados.
- Equivalências são explícitas, não há interpretação semântica por IA.
- A extração depende, em parte, da estrutura textual da vaga.
- Negações contextuais podem ser interpretadas incorretamente.
- O currículo gerado deve ser revisado pelo usuário.
- A divergência do caso Tailwind CSS (75%) requer inspeção dos requisitos efetivamente detectados.

## Publicação e evidências

**Endereço da aplicação publicada:** _pendente de inserir após confirmação do link público no Lovable._

**Capturas de tela:** _pendentes de inclusão no repositório, preferencialmente em `docs/screenshots/`._

Para demonstrar a aplicação, registrar pelo menos a entrada da vaga/currículo, a tela de compatibilidade e a versão do currículo antes da exportação PDF. Não versionar currículos reais nem informações pessoais.

## Entrega DIO

Enviar o link **do repositório**, não o link isolado da aplicação:

https://github.com/aaschenbach/dio-cvmatch-ats

O desafio solicita publicação no Lovable, histórico do mega prompt e refinamentos, funcionamento demonstrável, repositório público e ausência de credenciais versionadas.
