/**
 * Dicionário de termos técnicos reconhecidos. Cada entrada tem um rótulo de
 * exibição e aliases equivalentes (equivalências explícitas e seguras).
 * Os aliases são escritos já normalizados (minúsculas, sem acento).
 */
export interface DictTerm {
  label: string;
  aliases: string[];
}

const t = (label: string, ...aliases: string[]): DictTerm => ({
  label,
  aliases: aliases.length ? aliases : [label.toLowerCase()],
});

export const DICTIONARY: DictTerm[] = [
  // Linguagens
  t("JavaScript", "javascript", "js"),
  t("TypeScript", "typescript", "ts"),
  t("Python", "python"),
  t("Java", "java"),
  t("C#", "c#", "csharp"),
  t("C++", "c++", "cpp"),
  t("Go", "golang"),
  t("PHP", "php"),
  t("Ruby", "ruby"),
  t("Kotlin", "kotlin"),
  t("Swift", "swift"),
  t("R", "linguagem r"),
  t("SQL", "sql"),
  t("HTML", "html", "html5"),
  t("CSS", "css", "css3"),
  t("Dart", "dart"),
  t("Scala", "scala"),
  t("Rust", "rust"),
  t("VBA", "vba"),
  // Frameworks / libs
  t("React", "react", "react.js", "reactjs"),
  t("React Native", "react native"),
  t("Angular", "angular"),
  t("Vue.js", "vue", "vue.js", "vuejs"),
  t("Next.js", "next.js", "nextjs"),
  t("Node.js", "node.js", "nodejs", "node"),
  t("Express", "express", "express.js"),
  t("NestJS", "nestjs", "nest.js"),
  t("Django", "django"),
  t("Flask", "flask"),
  t("FastAPI", "fastapi"),
  t("Spring", "spring", "spring boot"),
  t(".NET", ".net", "dotnet", "asp.net"),
  t("Laravel", "laravel"),
  t("Flutter", "flutter"),
  t("Tailwind CSS", "tailwind", "tailwind css"),
  t("Bootstrap", "bootstrap"),
  t("jQuery", "jquery"),
  t("Redux", "redux"),
  t("Pandas", "pandas"),
  t("NumPy", "numpy"),
  t("TensorFlow", "tensorflow"),
  t("PyTorch", "pytorch"),
  t("Scikit-learn", "scikit-learn", "sklearn"),
  // Dados / BD
  t("PostgreSQL", "postgresql", "postgres"),
  t("MySQL", "mysql"),
  t("SQL Server", "sql server"),
  t("Oracle", "oracle"),
  t("MongoDB", "mongodb", "mongo"),
  t("Redis", "redis"),
  t("Elasticsearch", "elasticsearch"),
  t("Power BI", "power bi", "powerbi"),
  t("Tableau", "tableau"),
  t("Excel", "excel"),
  t("Looker", "looker"),
  t("ETL", "etl"),
  t("Data Warehouse", "data warehouse"),
  t("Spark", "spark", "apache spark"),
  t("Hadoop", "hadoop"),
  t("Machine Learning", "machine learning", "aprendizado de maquina"),
  t("Inteligência Artificial", "inteligencia artificial"),
  t("Ciência de Dados", "ciencia de dados", "data science"),
  t("Estatística", "estatistica"),
  // Cloud / DevOps
  t("AWS", "aws", "amazon web services"),
  t("Azure", "azure", "microsoft azure"),
  t("Google Cloud", "google cloud", "gcp"),
  t("Docker", "docker"),
  t("Kubernetes", "kubernetes", "k8s"),
  t("Terraform", "terraform"),
  t("CI/CD", "ci/cd", "integracao continua"),
  t("Jenkins", "jenkins"),
  t("GitHub Actions", "github actions"),
  t("Git", "git"),
  t("GitHub", "github"),
  t("GitLab", "gitlab"),
  t("Linux", "linux"),
  t("DevOps", "devops"),
  t("Microsserviços", "microsservicos", "microservicos", "microservices"),
  t("API REST", "api rest", "apis rest", "rest api", "restful"),
  t("GraphQL", "graphql"),
  t("Testes automatizados", "testes automatizados", "automacao de testes"),
  t("Testes unitários", "testes unitarios", "unit tests"),
  t("Jest", "jest"),
  t("Cypress", "cypress"),
  t("Selenium", "selenium"),
  // Metodologias / gestão
  t("Scrum", "scrum"),
  t("Kanban", "kanban"),
  t("Metodologias ágeis", "metodologias ageis", "metodologia agil", "agile", "agil"),
  t("Lean", "lean"),
  t("Six Sigma", "six sigma"),
  t("ITIL", "itil"),
  t("PMBOK", "pmbok"),
  t("Gestão de projetos", "gestao de projetos", "gerenciamento de projetos"),
  t("Jira", "jira"),
  t("Confluence", "confluence"),
  t("Trello", "trello"),
  t("UX", "ux", "user experience"),
  t("UI", "ui"),
  t("Figma", "figma"),
  t("SEO", "seo"),
  t("Google Analytics", "google analytics"),
  t("Marketing digital", "marketing digital"),
  t("CRM", "crm"),
  t("Salesforce", "salesforce"),
  t("SAP", "sap"),
  t("ERP", "erp"),
  t("Totvs", "totvs"),
  t("LGPD", "lgpd"),
  t("Segurança da informação", "seguranca da informacao"),
  // Certificações
  t("PMP", "pmp"),
  t("CSM", "csm"),
  t("PSM", "psm"),
  t("AWS Certified", "aws certified"),
  t("CPA-10", "cpa-10", "cpa 10"),
  t("CPA-20", "cpa-20", "cpa 20"),
  t("CNH", "cnh"),
  // Idiomas
  t("Inglês", "ingles", "english"),
  t("Espanhol", "espanhol", "spanish"),
  t("Francês", "frances"),
  t("Alemão", "alemao"),
];

/**
 * Termos genéricos que não devem ser tratados como requisito mesmo quando
 * aparecem em letras maiúsculas ou destacados (evita falsos positivos).
 */
export const GENERIC_TERMS = new Set(
  (
    "vaga vagas empresa requisitos requisito desejavel desejaveis obrigatorio obrigatorios diferencial diferenciais " +
    "responsabilidades atividades beneficios local salario contratacao clt pj modelo hibrido remoto presencial " +
    "experiencia conhecimento conhecimentos habilidade habilidades boa bom otima otimo capacidade perfil " +
    "sobre nos nossa equipe time area cargo funcao trabalho brasil sp rj vr va vt ti rh ltda sa eu"
  ).split(" "),
);
