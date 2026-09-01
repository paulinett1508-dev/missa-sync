import { expect, test } from "@playwright/test";
const approvedPackage = { formatVersion: 1, day: { date: "2026-08-30", timezone: "America/Sao_Paulo" }, status: "APPROVED", packageVersion: "1", generatedAt: "2026-08-30T12:00:00-03:00", checksum: "hash", sourceEvidence: [{ sourceId: "fixture", contentHash: "hash", collectedAt: "2026-08-30T12:00:00-03:00", parserVersion: "1", decisionRule: "fixture" }], celebration: { title: "Celebração de teste", sections: [{ id: "introductory-rites", title: "Ritos iniciais", blocks: ["Conteúdo offline de teste"] }] } };
test("logs in, syncs an approved package and resumes it offline", async ({ page, context }) => {
  await page.route("**/v1/auth/session", (route) => route.fulfill({ status: 204 }));
  await page.route("**/v1/packages/daily/2026-08-30?timezone=America%2FSao_Paulo", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify(approvedPackage) }));
  await page.goto("/");
  await page.getByLabel("Data").fill("2026-08-30");
  await page.getByLabel("Fuso").fill("America/Sao_Paulo");
  await page.getByLabel("Senha").fill("segredo");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.getByRole("button", { name: "Atualizar" }).click();
  await expect(page.getByText("Material atualizado.")).toBeVisible();
  await expect(page.getByText("Conteúdo offline de teste")).toBeVisible();
  await context.setOffline(true);
  await page.getByLabel("Data").fill("2026-08-31");
  await page.getByLabel("Data").fill("2026-08-30");
  await expect(page.getByText("Conteúdo offline de teste")).toBeVisible();
});
