import { expect, it } from "vitest";
import { createExample } from "../domain/example";
import { createReport } from "./report";

it("gera relatório com os resultados e escapa conteúdo do usuário", () => {
  const project = createExample();
  project.circuits[0].name = "<script>alert(1)</script>";
  const html = createReport(project);
  expect(html).toContain("13,61 kVA");
  expect(html).toContain("audit-2");
  expect(html).toContain("&lt;script&gt;");
  expect(html).not.toContain("<script>");
});

it("não declara aprovação nem omite pendências no relatório", () => {
  const html = createReport(createExample());
  expect(html).not.toContain("ATENDE");
  expect(html).toContain("DIMENSIONAMENTO PENDENTE");
  expect(html).toContain("Condutor pendente");
  expect(html).toContain("25,00 A");
});
