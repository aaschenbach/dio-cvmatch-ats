import { createFileRoute } from "@tanstack/react-router";
import { CVMatchApp } from "@/components/cvmatch/CVMatchApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CVMatch ATS — Compare seu currículo com a vaga" },
      {
        name: "description",
        content: "Estime a compatibilidade do seu currículo com uma vaga e gere uma versão organizada para ATS, sem sair do navegador.",
      },
      { property: "og:title", content: "CVMatch ATS — Compare seu currículo com a vaga" },
      {
        property: "og:description",
        content: "Palavras-chave, recomendações e currículo ATS friendly em PDF, processados localmente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CVMatchApp,
});
