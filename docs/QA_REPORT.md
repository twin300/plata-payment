# QA report

Проверено после вшивания DOCX-документов:

- `unzip -t` обоих исходных DOCX — pass.
- `npm run lint` — pass.
- `npm run test` — pass, 3/3.
- `npm run build` — pass, Next.js 16 production build.
- Playwright Chromium smoke — pass: `/api/health`, главная страница, email/name/consent, mock checkout redirect на `/success`, `/admin?token=smoke-token`, страницы `/oferta-razrabotka` и `/politika-pd`, скачивание обоих DOCX.
- Визуально проверены screenshots: `/tmp/paymentshowcase-docs-home.png`, `/tmp/paymentshowcase-offer-page.png`, `/tmp/paymentshowcase-pd-page.png`.
- Публичная страница оплаты без блоков про хранение данных, SQLite, webhook, mock-режим, сервер или админку.
- Секреты и персональные данные в шаблон не добавлены; `.env.example` содержит placeholders.
