import { test, expect } from '@playwright/test';

test('payment showcase core path', async ({ page, request }) => {
  const consoleErrors: string[] = [];
  const badResponses: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', (res) => {
    if (res.status() >= 400) badResponses.push(`${res.status()} ${res.url()}`);
  });

  const health = await request.get('http://127.0.0.1:3107/api/health');
  expect(health.status()).toBe(200);
  expect(await health.text()).toBe('ok');

  const email = `student+${Date.now()}@example.com`;
  await page.goto('http://127.0.0.1:3107/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: /Оплата разработки лендинга/ }).first()).toBeVisible();
    await page.getByLabel(/Email/).fill(email);
  await page.getByLabel(/Имя клиента/).fill('Тест');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /Перейти к оплате/ }).click();
  await page.waitForURL(/\/success\?orderId=.*mock=1/, { timeout: 10000 });
  await expect(page.getByRole('heading', { name: /Платёж создан/ })).toBeVisible();



  await page.goto('http://127.0.0.1:3107/oferta-razrabotka', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Оферта на разработку лендинга' })).toBeVisible();
  await expect(page.getByText('Марков Матвей Михайлович').first()).toBeVisible();
  await expect(page.getByText('4 900').first()).toBeVisible();

  await page.goto('http://127.0.0.1:3107/politika-pd', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Политика обработки персональных данных' })).toBeVisible();
  await expect(page.getByText('761020292512').first()).toBeVisible();

  const offerDoc = await request.get('http://127.0.0.1:3107/docs/oferta-razrabotka-lendinga.docx');
  expect(offerDoc.status()).toBe(200);
  const pdDoc = await request.get('http://127.0.0.1:3107/docs/politika-personalnyh-dannyh.docx');
  expect(pdDoc.status()).toBe(200);

  await page.goto('http://127.0.0.1:3107/admin?token=smoke-token', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Платежи' })).toBeVisible();
  await expect(page.getByRole('cell', { name: email }).first()).toBeVisible();

  const filteredBad = badResponses.filter((entry) => !entry.includes('/admin?token='));
  expect(filteredBad).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
