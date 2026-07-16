import { expect, test } from '@playwright/test'

const operatorToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvcGVyYWRvciIsIm5hbWUiOiJPbGl2aWEgT3BlcmFkb3IiLCJ1c2VybmFtZSI6Im9wZXJhZG9yIiwiUm9sZSI6Ik9wZXJhZG9yIiwiaWF0IjoxNzg0MTYwMDAwLCJleHAiOjE4OTM0NTYwMDB9.U80cQm-4z_Ww9UuM-a2KwMgFy880hv8axM40M_kGX3c'
const supervisorToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdXBlcnZpc29yIiwibmFtZSI6IlNhcmEgU3VwZXJ2aXNvciIsInVzZXJuYW1lIjoic3VwZXJ2aXNvciIsIlJvbGUiOiJTdXBlcnZpc29yIiwiaWF0IjoxNzg0MTYwMDAwLCJleHAiOjE4OTM0NTYwMDB9.mocksignature'

test.beforeEach(async ({ page }) => {
  // Mock login
  await page.route('**/api/auth/login', async (route) => {
    const postData = route.request().postDataJSON()
    if (postData.username === 'operador' && postData.password === 'Operador123') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: operatorToken }),
      })
    } else if (postData.username === 'supervisor' && postData.password === 'Supervisor123') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: supervisorToken }),
      })
    } else {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Credenciales incorrectas' }),
      })
    }
  })

  // Mock sales
  await page.route('**/api/sales', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'APPROVED',
        amount: 1500.5,
        customerName: 'Juan Pérez',
        approvalNumber: '123456',
        financialReference: '98765432',
        maskedCard: '4111********1111',
      }),
    })
  })

  // Mock transactions
  await page.route('**/api/transactions', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'TX-001',
            approvalNumber: '123456',
            financialReference: '98765432',
            maskedCard: '4111********1111',
            customerName: 'Juan Pérez',
            amount: 1500.5,
            date: '2026-07-16T14:30:00Z',
            status: 'APPROVED',
          },
          {
            id: 'TX-002',
            approvalNumber: '654321',
            financialReference: '12345678',
            maskedCard: '5112********9999',
            customerName: 'María Gómez',
            amount: 3200,
            date: '2026-07-16T15:45:00Z',
            status: 'APPROVED',
          },
        ],
        total: 2,
      }),
    })
  })

  // Mock cancellation
  await page.route('**/api/transactions/cancellation', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        approvalNumber: '777888',
        financialReference: '98765432',
        maskedCard: '4111********1111',
        status: 'CANCELLED',
      }),
    })
  })

  // Mock refund
  await page.route('**/api/transactions/refund', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        approvalNumber: '999000',
        financialReference: '12345678',
        maskedCard: '5112********9999',
        status: 'REFUNDED',
      }),
    })
  })
})

test('full login and flows E2E', async ({ page }) => {
  // 1. Render login page
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible()

  // 2. Login as operator
  await page.fill('#username', 'operador')
  await page.fill('#password', 'Operador123')
  await page.click('button[type="submit"]')

  // 3. Confirm redirected to Operator Dashboard
  await expect(page.getByRole('heading', { name: 'Panel del Operador' })).toBeVisible()

  // 4. Navigate to Nueva Venta
  await page.click('text=Nueva venta')
  await expect(page.getByRole('heading', { name: 'Nueva Venta' })).toBeVisible()

  // 5. Fill and submit sale form
  await page.fill('#amount', '1500.5')
  await page.fill('#customerName', 'Juan Pérez')
  await page.fill('#cardNumber', '4111 1111 1111 1111')
  await page.fill('#expirationDate', '12/30')
  await page.fill('#cvv', '123')
  
  // Submit sale
  await page.click('button[type="submit"]')

  // 6. Verify Comprobante (Voucher) is shown
  await expect(page.getByRole('heading', { name: 'Comprobante de Venta' })).toBeVisible()
  await expect(page.locator('text=123456')).toBeVisible()
  await expect(page.locator('text=98765432')).toBeVisible()

  // 7. Click Register Another
  await page.click('text=Registrar otra venta')
  await expect(page.locator('#amount')).toBeVisible()

  // 8. Go to Consulta de Transacciones
  await page.click('text=Transacciones')
  await expect(page.getByRole('heading', { name: 'Consulta de Transacciones' })).toBeVisible()
  await expect(page.locator('text=Juan Pérez').first()).toBeVisible()
  await expect(page.locator('text=María Gómez').first()).toBeVisible()

  // 9. Logout operator
  await page.click('text=Cerrar sesión')
  await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible()

  // 10. Login as supervisor
  await page.fill('#username', 'supervisor')
  await page.fill('#password', 'Supervisor123')
  await page.click('button[type="submit"]')
  await expect(page.getByRole('heading', { name: 'Panel del Supervisor' })).toBeVisible()

  // 11. Go to Cancelaciones
  await page.click('text=Cancelaciones')
  await expect(page.getByRole('heading', { name: 'Cancelaciones' })).toBeVisible()
  
  // Fill Cancellation details
  await page.fill('#financialReference', '98765432')
  await page.fill('#cardNumber', '4111 1111 1111 1111')
  await page.click('button[type="submit"]')

  // Confirm cancel dialog
  await expect(page.getByRole('heading', { name: 'Confirmar Cancelación' })).toBeVisible()
  await page.click('button:has-text("Confirmar")')

  // Verify cancel voucher
  await expect(page.getByRole('heading', { name: 'Comprobante de Cancelación' })).toBeVisible()
  await expect(page.locator('text=777888')).toBeVisible()

  // 12. Go to Devoluciones
  await page.click('text=Devoluciones')
  await expect(page.getByRole('heading', { name: 'Devoluciones' })).toBeVisible()

  // Fill Refund details
  await page.fill('#financialReference', '12345678')
  await page.fill('#cardNumber', '4111 1111 1111 1111')
  await page.click('button[type="submit"]')

  // Confirm refund dialog
  await expect(page.getByRole('heading', { name: 'Confirmar Devolución' })).toBeVisible()
  await page.click('button:has-text("Confirmar")')

  // Verify refund voucher
  await expect(page.getByRole('heading', { name: 'Comprobante de Devolución' })).toBeVisible()
  await expect(page.locator('text=999000')).toBeVisible()

  // 13. Logout supervisor
  await page.click('text=Cerrar sesión')
  await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible()
})