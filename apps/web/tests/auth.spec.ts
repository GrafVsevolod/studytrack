import { test, expect } from "@playwright/test";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

test.describe("Auth flow", () => {
  test("register -> login -> logout", async ({ page }) => {
    const email = `pw_${uid()}@example.com`;
    const password = "password123";
    const name = "Playwright User";

    // ===== Register =====
    await page.goto("/register");

    await page.getByLabel("Имя").fill(name);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Пароль (мин. 6 символов)").fill(password);

    await page.getByRole("button", { name: "Зарегистрироваться" }).click();

    // Должны оказаться на today
    await expect(page).toHaveURL(/\/today/);

    // ===== Logout =====
    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login/);

    // ===== Login =====
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Пароль").fill(password);
    await page.getByRole("button", { name: "Войти" }).click();

    await expect(page).toHaveURL(/\/today/);
  });
});
