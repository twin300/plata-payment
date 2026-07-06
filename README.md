# Payment Showcase — handoff-шаблон оплаты

Это чистый шаблон для ученика/агента: публичная страница показывает только оплату, email/имя и чекбокс согласия с офертой + политикой ПД. Вся техника — T-Касса, webhook, SQLite, админка — спрятана в коде и описана здесь.

## Что внутри

- Next.js App Router.
- Светлая страница оплаты `/` без технических объяснений на клиентском экране.
- `/oferta-razrabotka` — страница оферты на разработку лендинга + скачивание DOCX.
- `/politika-pd` — страница политики/согласий по ПД + скачивание DOCX.
- `/offer` и `/privacy` оставлены как короткие redirect-алиасы на новые slugs.
- `/api/checkout` — создаёт заказ, сохраняет email/статус в SQLite и отдаёт ссылку оплаты.
- `/api/tbank/webhook` — принимает webhook T-Кассы, проверяет Token и обновляет статус.
- `/admin?token=...` — скрытая простая админка последних платежей.
- `PAYMENT_PROVIDER=mock` — безопасный режим без реальных списаний.

## Инструкция агенту: развернуть под нового человека

1. Скопируй проект на сервер/в репозиторий.
2. Создай env:

```bash
cp .env.example .env.local
```

3. Замени в `.env.local`:

```bash
NEXT_PUBLIC_BRAND_NAME="Название студии"
PRODUCT_NAME="Оплата разработки лендинга"
PRODUCT_DESCRIPTION="Оплата разработки лендинга по публичной оферте."
PRODUCT_AMOUNT_RUB=4900
ADMIN_TOKEN="длинный-случайный-токен"
APP_URL="https://your-domain.ru"
```

4. Замени оферту и ПД, если нужны свои документы:
   - страницы: `src/app/oferta-razrabotka/page.tsx`, `src/app/politika-pd/page.tsx`
   - тексты на страницах: `src/content/legal-documents.ts`
   - оригиналы DOCX: `public/docs/oferta-razrabotka-lendinga.docx`, `public/docs/politika-personalnyh-dannyh.docx`

5. Для теста оставь:

```bash
PAYMENT_PROVIDER=mock
```

6. Для боевой оплаты включи T-Кассу:

```bash
PAYMENT_PROVIDER=tbank
TBANK_TERMINAL_KEY="реальный terminal key"
TBANK_PASSWORD="реальный password"
TBANK_NOTIFICATION_URL="https://your-domain.ru/api/tbank/webhook"
TBANK_RECEIPT_TAXATION="usn_income"
TBANK_RECEIPT_TAX="none"
```

7. Установи и проверь:

```bash
npm install
npm run lint
npm run test
npm run build
npm run dev
```

8. Smoke-проверка перед отдачей:
   - открыть `/`;
   - ввести email;
   - поставить чекбокс оферта/ПД;
   - нажать оплату;
   - в mock-режиме попасть на `/success`;
   - открыть `/admin?token=...` и увидеть платеж.

## Документы в сайте

Документы уже вшиты в архив:

- Оферта: `/oferta-razrabotka`, скачать DOCX: `/docs/oferta-razrabotka-lendinga.docx`.
- Политика ПД: `/politika-pd`, скачать DOCX: `/docs/politika-personalnyh-dannyh.docx`.

Ссылки в чекбоксе оплаты по умолчанию ведут именно на эти slugs. Если агент меняет slugs, нужно обновить `NEXT_PUBLIC_OFFER_URL` и `NEXT_PUBLIC_PRIVACY_URL` в `.env.local`.

## Деплой на VPS через systemd

```bash
cd /var/www/paymentshowcase
npm ci
npm run build
```

`/etc/systemd/system/paymentshowcase.service`:

```ini
[Unit]
Description=Payment Showcase Next.js
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/paymentshowcase
Environment=NODE_ENV=production
EnvironmentFile=/var/www/paymentshowcase/.env.local
ExecStart=/usr/bin/npm run start -- --hostname 127.0.0.1 --port 3010
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Nginx:

```nginx
server {
  server_name your-domain.ru;

  location / {
    proxy_pass http://127.0.0.1:3010;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

Запуск:

```bash
systemctl daemon-reload
systemctl enable --now paymentshowcase
curl -I https://your-domain.ru
curl https://your-domain.ru/api/health
```

## Команды проверки

```bash
npm run lint
npm run test
npm run build

# если сервер уже запущен на 3107
npm run smoke
```

Важно: в архиве нет ключей, нет персональных данных, нет реальных оплат. `data/payments.db` создаётся только на сервере после первых платежей и не должен попадать в git/архив.
