import { jsPDF } from "jspdf";

const isHeading = (line: string) =>
  line.trim().length > 2 && line.trim().length <= 45 && line.trim() === line.trim().toUpperCase() && /[A-ZÀ-Ú]/.test(line);

/** Gera um PDF A4 com texto real (selecionável), múltiplas páginas e acentos. */
export function exportResumePdf(text: string, filename = "curriculo-cvmatch.pdf"): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 20;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - margin * 2;
  const lineH = 5.2;
  let y = margin;

  const ensure = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (raw.trim() === "") {
      y += lineH * 0.6;
      continue;
    }
    const heading = isHeading(raw);
    doc.setFont("helvetica", heading ? "bold" : "normal");
    doc.setFontSize(heading ? 11.5 : 10.5);
    if (heading) y += 1.5;
    const wrapped: string[] = doc.splitTextToSize(raw, maxW);
    for (const w of wrapped) {
      ensure(lineH);
      doc.text(w, margin, y);
      y += lineH;
    }
  }

  doc.save(filename);
}
