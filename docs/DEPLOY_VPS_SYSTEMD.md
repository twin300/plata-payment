# Деплой на VPS через systemd + nginx

```bash
cd /var/www/paymentshowcase
cp .env.example .env.local
nano .env.local
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

После запуска проверь:

```bash
systemctl daemon-reload
systemctl enable --now paymentshowcase
curl -I https://your-domain.ru
curl https://your-domain.ru/api/health
```
