# CVMatch ATS — Mega Prompt v1.0

## 1. Objetivo

Crie uma aplicação web chamada **CVMatch ATS**, funcional, responsiva e em português brasileiro.

A aplicação deve comparar o conteúdo de um currículo com a descrição de uma vaga, calcular uma estimativa de compatibilidade, identificar palavras-chave relevantes, apresentar recomendações e gerar uma versão reorganizada do currículo, adequada à leitura por sistemas ATS.

**Regra obrigatória:** a aplicação nunca pode inventar experiências profissionais, competências, certificações, formações, datas, resultados ou qualquer informação não comprovada no currículo original.

Entregue um MVP realmente funcional, sem botões fictícios, dados simulados na análise ou telas apenas demonstrativas.

## 2. Stack tecnológica

Utilize:

- React com TypeScript.
- Vite.
- Tailwind CSS.
- shadcn/ui.
- Lucide React para ícones.
- Biblioteca confiável para exportação em PDF, preferencialmente jsPDF.
- Processamento local no navegador.

Não implementar backend, banco de dados, autenticação, pagamentos ou integrações externas nesta versão.

Não exigir chaves de API.

Organizar o código em componentes e funções reutilizáveis, separando interface, lógica de análise, geração do currículo e exportação.

## 3. Identidade visual

Criar interface profissional, limpa, moderna e acessível.

Paleta:

- Azul principal: `#1D465A`.
- Laranja de destaque: `#E08E58`.
- Branco: `#FFFFFF`.
- Fundo claro: `#F5F7F9`.
- Texto principal: `#24333D`.
- Verde de sucesso: `#27866C`.
- Vermelho de alerta: `#C45C54`.

Utilizar fontes Inter ou Manrope.

Aplicar shadcn/ui em formulários, botões, cards, abas, badges, indicadores e notificações.

Layout responsivo para desktop, tablet e celular.

Evitar excesso de animações e efeitos visuais.

Não incluir logotipos de empresas de recrutamento ou alegações de certificação por sistemas ATS.

## 4. Estrutura da aplicação

Criar uma aplicação com quatro etapas visíveis:

1. Inserir informações.
2. Analisar compatibilidade.
3. Revisar sugestões.
4. Gerar e exportar currículo.

Utilizar uma navegação simples, com indicador de progresso.

### Tela inicial

Exibir:

**CVMatch ATS**

Subtítulo:

"Compare seu currículo com uma vaga, descubra oportunidades de melhoria e gere uma versão mais clara para processos seletivos."

Apresentar resumidamente as funcionalidades.

Incluir aviso permanente:

"O CVMatch ATS organiza e melhora a apresentação das informações existentes no currículo. Não cria experiências ou qualificações que você não possui."

Incluir botão "Começar análise".

### Tela de entrada

Apresentar dois campos grandes de texto:

**Descrição da vaga**

Placeholder:

"Cole aqui a descrição completa da vaga, incluindo requisitos, responsabilidades e qualificações."

**Meu currículo**

Placeholder:

"Cole aqui o texto do seu currículo, incluindo resumo, experiências, formação e competências."

Funcionalidades:

- Permitir colar ou digitar livremente.
- Preservar quebras de linha.
- Exibir contagem de caracteres.
- Oferecer botão para limpar os campos.
- Impedir análise quando algum campo estiver vazio ou contiver texto insuficiente.
- Exibir mensagens claras de validação.
- Processar o conteúdo somente no navegador.

Botão principal:

"Analisar meu currículo".

Não exigir cadastro.

## 5. Motor de análise

Implementar um algoritmo local, determinístico e documentado.

Não gerar pontuações aleatórias ou utilizar resultados fixos.

### Normalização

Antes da comparação:

- Converter textos para minúsculas.
- Normalizar acentuação para comparação.
- Remover pontuação irrelevante.
- Preservar termos técnicos significativos.
- Ignorar palavras comuns em português (stopwords).
- Reconhecer palavras-chave compostas.
- Eliminar duplicações.
- Considerar equivalências técnicas explícitas e seguras, como "JavaScript" e "JS", sem supor competências adicionais.
- Evitar correspondências incorretas por fragmentos de palavras.

### Extração de requisitos

Identificar termos relevantes da vaga, priorizando:

- Tecnologias e ferramentas.
- Competências técnicas.
- Metodologias.
- Certificações.
- Formação explicitamente exigida.
- Conhecimentos específicos da função.

Diferenciar, quando possível, requisitos obrigatórios e desejáveis por expressões como "obrigatório", "necessário", "desejável" e "diferencial".

Quando a estrutura da vaga não permitir essa identificação com segurança, utilizar uma classificação neutra.

Não inventar requisitos.

### Correspondência

Comparar requisitos identificados com o currículo fornecido.

Classificar cada requisito em:

- **Encontrado:** existe correspondência textual ou equivalência reconhecida no currículo.
- **Não encontrado:** o requisito foi identificado na vaga, mas não foi localizado no currículo.

Não transformar correspondência textual em comprovação automática de domínio ou experiência profissional.

### Pontuação

Calcular uma estimativa transparente de compatibilidade de 0 a 100%.

Fórmula sugerida:

`Compatibilidade = (soma dos pesos dos requisitos encontrados / soma dos pesos de todos os requisitos identificados) × 100`

Pesos:

- Requisito obrigatório claramente identificado: 3.
- Requisito desejável claramente identificado: 1.
- Requisito sem classificação segura: 2.

Arredondar para o inteiro mais próximo.

Se não houver requisitos confiáveis suficientes, informar que a análise foi inconclusiva em vez de apresentar uma porcentagem artificial.

Exibir a fórmula resumidamente na interface.

Não afirmar que a pontuação representa um ATS específico ou probabilidade de contratação.

## 6. Tela de resultados

Exibir:

### Indicador de compatibilidade

- Pontuação percentual calculada.
- Indicador visual de progresso.
- Quantidade de requisitos encontrados.
- Quantidade de requisitos não encontrados.
- Explicação de como a pontuação foi calculada.

Título:

"Compatibilidade estimada".

Incluir aviso:

"Esta é uma estimativa baseada em correspondências textuais. Sistemas ATS reais podem utilizar critérios diferentes."

### Palavras-chave encontradas

Exibir badges com os requisitos identificados na vaga que também aparecem no currículo.

### Palavras-chave não encontradas

Exibir requisitos da vaga sem correspondência identificada no currículo.

Não dizer que o candidato não possui determinada competência apenas porque ela não aparece no texto.

### Recomendações

Gerar recomendações relacionadas aos resultados efetivos da análise.

Exemplos:

- Tornar mais explícita uma competência já mencionada.
- Melhorar a organização das experiências profissionais.
- Utilizar títulos de seções reconhecíveis por sistemas ATS.
- Revisar descrições excessivamente vagas.
- Verificar se uma competência ausente no texto realmente faz parte da experiência do candidato.

Não recomendar incluir uma competência ausente como se ela estivesse comprovada.

Não produzir recomendações genéricas desconectadas da análise.

Incluir botão "Gerar currículo ajustado".

## 7. Geração de currículo ATS friendly

Esta funcionalidade é obrigatória e deve funcionar.

Utilizar o texto original do usuário para gerar um currículo reorganizado e mais fácil de interpretar por sistemas ATS.

O processamento deverá ocorrer localmente, por meio de regras de estruturação e formatação.

### Estrutura sugerida

Identificação e contato, quando fornecidos.

Resumo profissional, quando houver conteúdo suficiente para aproveitamento.

Experiência profissional.

Formação acadêmica.

Competências.

Certificações.

Idiomas.

Outras seções presentes no currículo original.

Não criar seções preenchidas com informações inexistentes.

### Regras obrigatórias

- Preservar nomes, empresas, cargos, datas e períodos.
- Preservar o significado das experiências.
- Não inventar resultados ou métricas.
- Não aumentar tempo de experiência.
- Não alterar níveis de idioma.
- Não inserir certificações ou diplomas ausentes.
- Não incluir palavras-chave não encontradas como habilidades comprovadas.
- Não criar resumo profissional com alegações não presentes no original.
- Não remover informações relevantes apenas para aumentar a pontuação.
- Caso alguma parte não possa ser interpretada com segurança, preservá-la em uma seção de conteúdo original para revisão, sem descartá-la silenciosamente.

A geração deve reorganizar seções, normalizar títulos e melhorar a apresentação textual apenas quando isso puder ser feito preservando integralmente o conteúdo factual.

Não simular uma reescrita generativa. Se não houver condições de reformular um trecho com segurança, manter a redação original.

### Revisão pelo usuário

Apresentar um editor de texto com o currículo ajustado.

Permitir:

- Visualizar o resultado.
- Editar manualmente.
- Copiar o currículo.
- Restaurar a versão gerada.
- Exportar para PDF.

Destacar que o usuário precisa revisar os dados antes de enviar o documento.

## 8. Exportação em PDF

Implementar a exportação de forma real e funcional.

O botão "Exportar PDF" deverá gerar um arquivo com o conteúdo atual do editor.

Requisitos:

- Formato A4.
- Margens adequadas.
- Texto selecionável.
- Suporte a múltiplas páginas.
- Preservação de acentos.
- Quebras de linha corretas.
- Sem cortes ou sobreposição de texto.
- Layout simples e compatível com leitura automatizada.
- Sem tabelas complexas, colunas múltiplas ou elementos decorativos desnecessários.

Nome sugerido:

`curriculo-cvmatch.pdf`

Não utilizar uma captura de tela como PDF.

## 9. Tratamento de erros

Implementar tratamento para:

- Campos vazios.
- Textos excessivamente curtos.
- Vaga sem requisitos identificáveis.
- Currículo com estrutura incomum.
- Análise com zero correspondências.
- Falha na geração do PDF.

Fornecer mensagens compreensíveis, sem erros técnicos expostos ao usuário.

Nenhum botão deve ser apenas visual.

## 10. Privacidade

Não transmitir currículo ou descrição da vaga para serviços externos.

Não armazenar os dados em banco de dados.

Não exigir login.

Incluir aviso:

"Seus textos são processados localmente no navegador e não são enviados a um servidor para análise."

Exibir esse aviso somente se a implementação realmente cumprir essa condição.

Não incluir ferramentas de analytics que capturem os textos dos usuários.

## 11. Usabilidade

Garantir:

- Layout responsivo.
- Navegação por teclado.
- Contraste adequado.
- Estados de carregamento quando necessários.
- Mensagens de confirmação.
- Botões desabilitados quando uma ação não for possível.
- Feedback visual após análise, cópia e exportação.
- Navegação para retornar às entradas e executar outra análise.

Evitar modais desnecessários.

## 12. Testes e critérios de aceitação

A aplicação estará pronta quando:

1. O usuário conseguir inserir vaga e currículo.
2. Campos inválidos forem tratados corretamente.
3. A análise identificar termos realmente presentes.
4. A análise apontar termos ausentes.
5. A pontuação depender dos dados fornecidos.
6. A pontuação for reproduzível para entradas idênticas.
7. Recomendações dependerem do resultado.
8. O currículo ajustado preservar todas as informações factuais.
9. O usuário conseguir editar o currículo ajustado.
10. O PDF contiver o texto final corretamente.
11. A interface funcionar em desktop e dispositivos móveis.
12. Não existirem botões inoperantes.
13. O projeto compilar sem erros.

Criar testes automatizados para as funções puras de normalização, extração e pontuação, quando viável, usando Vitest.

Não apresentar testes como aprovados sem executá-los.

## 13. Organização para o GitHub e a DIO

Manter o projeto preparado para versionamento no GitHub.

Criar ou preservar uma estrutura de código organizada.

Não incluir senhas, tokens ou chaves no código-fonte.

Não incluir dados pessoais reais como exemplos no repositório.

Criar uma pasta `docs` contendo:

- `mega-prompt.md`, com o texto deste mega prompt, quando disponível no contexto.
- `criterios-analise.md`, explicando normalização, correspondências, pesos, limitações e cálculo de compatibilidade.

Não criar histórico fictício de alterações nem capturas de tela inexistentes.

As evidências de execução, os refinamentos realizados e a documentação final serão adicionados posteriormente.

## 14. Restrições de escopo

Não implementar nesta primeira versão:

- Login.
- Dashboard administrativo.
- Histórico de análises.
- Banco de dados.
- Upload de arquivos.
- Integrações com LinkedIn.
- Envio de currículos para empresas.
- API externa de IA.
- Exportação DOCX.

Priorizar as funcionalidades obrigatórias.

Não aumentar a complexidade sem necessidade.

## 15. Entrega esperada

Construir o CVMatch ATS completo e utilizável.

Prioridades de implementação:

1. Entrada e validação dos textos.
2. Motor real de análise e cálculo.
3. Resultados e recomendações.
4. Geração estruturada do currículo.
5. Edição e exportação em PDF.
6. Refinamento visual e responsividade.

Não substituir funcionalidades por dados simulados.

Se alguma funcionalidade apresentar dificuldade técnica, explicar a limitação e implementar uma alternativa funcional, preservando as regras de segurança e integridade do currículo.

O objetivo é um MVP simples, verificável, bem implementado e adequado a uma entrega pública de portfólio.