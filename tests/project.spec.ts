import { expect, test } from "@playwright/test";

test("percorre as oito etapas, edita e restaura um projeto exportado", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Carregar exemplo" }).click();
  await page.getByRole("button", { name: "2 Cômodos" }).click();
  await expect(page.getByText("Área:").first()).toContainText("Área:");
  await page.getByLabel("Nome", { exact: true }).first().fill("Sala editada");
  await page.getByRole("button", { name: "Próxima" }).click();
  await expect(
    page.getByRole("heading", { name: "Iluminação", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Próxima" }).click();
  await expect(
    page.getByRole("heading", { name: "Tomadas de uso geral" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Próxima" }).click();
  await expect(
    page.getByRole("heading", { name: "Equipamentos / TUE" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Próxima" }).click();
  await expect(
    page.getByRole("heading", { name: "C2 - TUG Sala editada" }),
  ).toBeVisible();
  await expect(page.getByLabel("Potência (VA)")).toHaveCount(0);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar JSON" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  await page.reload();
  await page.getByLabel("Importar JSON").setInputFiles(path!);
  await page.getByRole("button", { name: "6 Circuitos" }).click();
  await expect(
    page.getByRole("heading", { name: "C2 - TUG Sala editada" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Próxima" }).click();
  await expect(page.getByText("13,61 kVA")).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "25,00 A", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("ATENDE", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Próxima" }).click();
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Gerar relatório HTML" }).click();
  const popup = await popupPromise;
  await expect(
    popup.getByRole("heading", {
      name: "Relatório preliminar — DimensionaLar",
    }),
  ).toBeVisible();
  await popup.close();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Limpar projeto" }).click();
  await expect(
    page.getByRole("heading", { name: "Dados da instalação" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("adiciona e remove dados e rejeita importação inválida sem perder o projeto", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "2 Cômodos" }).click();
  await page
    .getByRole("button", { name: "+ Adicionar cômodo", exact: true })
    .click();
  await page.getByLabel("Comprimento (m)").fill("4");
  await page.getByLabel("Largura (m)").fill("3");
  await expect(page.getByText("12,00 m²")).toBeVisible();
  await page.getByRole("button", { name: "5 Equipamentos" }).click();
  await page
    .getByRole("button", { name: "+ Adicionar equipamento", exact: true })
    .click();
  await expect(page.getByLabel("Potência elétrica de entrada (W)")).toHaveValue(
    "5500",
  );
  await page.getByRole("button", { name: "Remover", exact: true }).click();
  await expect(page.getByLabel("Potência elétrica de entrada (W)")).toHaveCount(
    0,
  );
  await page.getByLabel("Importar JSON").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"rooms":null}'),
  });
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "2 Cômodos" }).click();
  await expect(page.getByLabel("Comprimento (m)")).toHaveValue("4");
  await page.getByRole("button", { name: "Remover", exact: true }).click();
  await expect(page.getByText("Cadastre os cômodos primeiro.")).toBeVisible();
});
