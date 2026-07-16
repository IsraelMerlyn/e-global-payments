import { expect, test } from '@playwright/test'

test('renders the login page', async ({ page }) => {
    await page.goto('/')

    await expect(
        page.getByRole('heading', {
            name: 'Inicia sesión',
        }),
    ).toBeVisible()

    await expect(
        page.getByRole('button', {
            name: 'Continuar',
        }),
    ).toBeVisible()
})