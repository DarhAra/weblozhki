# Первый деплой на VPS

Это инструкция для самого простого первого размещения:

- один VPS;
- Ubuntu;
- Node.js;
- PM2;
- nginx;
- SQLite;
- один домен.

Такой вариант хорошо подходит для текущего состояния проекта: один сервер, одна база `SQLite`, один процесс приложения.

## Что понадобится заранее

Подготовьте:

1. VPS с Ubuntu.
2. IP-адрес сервера.
3. Домен, который можно направить на этот IP.
4. Доступ к GitHub-репозиторию проекта.

Минимальные характеристики VPS:

- 1 vCPU
- 1–2 GB RAM
- 20+ GB диска

## Шаг 1. Подключиться к серверу

Подключение идёт по SSH. Это как удалённо открыть терминал другого компьютера.

Обычно команда выглядит так:

```bash
ssh root@YOUR_SERVER_IP
```

Если у провайдера другой пользователь, замените `root` на него.

## Шаг 2. Обновить сервер и установить базовые пакеты

На сервере выполните:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git nginx curl
```

## Шаг 3. Установить Node.js

Для первого деплоя лучше использовать актуальную LTS-версию Node.js.

Пример установки Node.js 22:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Проверьте:

```bash
node -v
npm -v
```

## Шаг 4. Установить PM2

PM2 нужен, чтобы приложение не умирало после закрытия терминала и само поднималось после падения или перезагрузки сервера.

Установка:

```bash
sudo npm install -g pm2
```

## Шаг 5. Загрузить проект на сервер

Перейдите в удобную папку и склонируйте проект:

```bash
cd /var/www
sudo git clone YOUR_GITHUB_REPO_URL resource-todo
cd resource-todo
```

Если проект приватный, сначала настройте доступ GitHub по SSH или token.

## Шаг 6. Создать production `.env`

В проекте уже есть шаблон:

```text
.env.production.example
```

Сделайте из него рабочий `.env`:

```bash
cp .env.production.example .env
```

Минимальное содержимое `.env` для первого VPS:

```env
PORT=3000
NODE_ENV=production
DATABASE_PATH=data/app.db
TRUST_PROXY=true
SESSION_COOKIE_NAME=rtodo_sid
CSRF_COOKIE_NAME=rtodo_csrf
SESSION_COOKIE_SAME_SITE=Lax
SESSION_COOKIE_SECURE=true
SESSION_TTL_DAYS=30
PASSWORD_RESET_TTL_MINUTES=30
DATA_ENCRYPTION_KEY=change-me-to-a-long-random-secret
RUNTIME_STATE_MAX_BYTES=262144
PRIVATE_STATE_MAX_BYTES=786432
OFFLINE_STATE_TTL_HOURS=168
AUTH_RATE_LIMIT_WINDOW_MINUTES=15
LOGIN_RATE_LIMIT_MAX_ATTEMPTS=10
REGISTER_RATE_LIMIT_MAX_ATTEMPTS=5
PASSWORD_RESET_RATE_LIMIT_MAX_ATTEMPTS=5
ALLOWED_ORIGIN=https://example.com
APP_BASE_URL=https://example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=account@example.com
SMTP_PASSWORD=change-me
SMTP_FROM_EMAIL=no-reply@example.com
SMTP_FROM_NAME=Мои ложки
```

## Шаг 7. Установить зависимости и собрать проект

В папке проекта выполните:

```bash
npm install
npm run build
```

## Шаг 8. Запустить приложение через PM2

В проект уже добавлен файл:

```text
ecosystem.config.cjs
```

Запуск:

```bash
pm2 start ecosystem.config.cjs --env production
```

Проверка:

```bash
pm2 status
pm2 logs resource-todo
```

Чтобы приложение поднималось после перезагрузки сервера:

```bash
pm2 startup
pm2 save
```

После `pm2 startup` PM2 покажет ещё одну команду. Её тоже нужно выполнить.

## Шаг 9. Настроить nginx

В проекте есть пример конфига:

```text
deploy/nginx.resource-todo.conf
```

Что нужно сделать:

1. Открыть этот файл.
2. Заменить:
   - `your-domain.ru`
   - `www.your-domain.ru`
   на свой домен.
3. Скопировать конфиг в nginx.

Пример:

```bash
sudo cp deploy/nginx.resource-todo.conf /etc/nginx/sites-available/resource-todo
```

Потом включить сайт:

```bash
sudo ln -s /etc/nginx/sites-available/resource-todo /etc/nginx/sites-enabled/resource-todo
```

Проверить конфиг:

```bash
sudo nginx -t
```

И перезапустить nginx:

```bash
sudo systemctl reload nginx
```

## Шаг 10. Привязать домен

У регистратора домена или в DNS-панели нужно создать записи, которые ведут домен на IP вашего VPS.

Обычно это:

- `A` запись для `your-domain.ru`
- `A` запись для `www`

Обе должны указывать на IP сервера.

## Шаг 11. Включить HTTPS

Для HTTPS удобно использовать Let’s Encrypt.

Установка certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Запуск:

```bash
sudo certbot --nginx -d your-domain.ru -d www.your-domain.ru
```

После этого certbot:

- выпустит сертификат;
- обновит nginx-конфиг;
- включит HTTPS.

## Шаг 12. Проверить, что всё реально работает

Проверьте:

1. Открывается ли сайт по домену.
2. Работает ли `https://`.
3. Можно ли зарегистрироваться.
4. Можно ли войти.
5. Сохраняются ли задачи после перезагрузки страницы.
6. Поднимается ли приложение после:
   - `pm2 restart resource-todo`
   - перезагрузки VPS

## Как обновлять проект после изменений

Когда вы в будущем внесёте изменения и отправите их на GitHub, на сервере обычно нужно сделать так:

```bash
cd /var/www/resource-todo
git pull
npm install
npm run build
pm2 restart resource-todo
```

Если зависимостей не менялось, `npm install` можно иногда пропустить, но для первого времени лучше оставлять.

## Что важно помнить

- `.env` не отправляется в GitHub.
- `data/app.db` не отправляется в GitHub.
- `DATA_ENCRYPTION_KEY` хранится только на сервере и не должен попадать в репозиторий.
- SQLite подходит для первого VPS, но это ещё не финальная архитектура для большого количества пользователей.
- Если сервер один, такой вариант вполне годится для первого публичного запуска.

## Бэкапы и hardening

- Делайте ежедневную копию `data/app.db`.
- Храните backup вне директории приложения и шифруйте его перед выгрузкой.
- Проверяйте восстановление backup на отдельной копии.
- После настройки SSH-ключей отключите вход по паролю и root-login по паролю.
- Оставьте снаружи только `80`, `443` и SSH.
- Добавьте `fail2ban` или аналог для защиты SSH.
- В Nginx включите `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` и базовый `Content-Security-Policy`.


## SMTP for Password Recovery

To make password recovery work on the VPS, fill real SMTP settings in `.env`:

```env
APP_BASE_URL=https://your-domain.ru
SMTP_HOST=smtp.your-domain.ru
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=no-reply@your-domain.ru
SMTP_PASSWORD=your-mail-password
SMTP_FROM_EMAIL=no-reply@your-domain.ru
SMTP_FROM_NAME=Мои ложки
```

Then restart the application:

```bash
npm run build
pm2 restart resource-todo
```

Check: open the "Forgot password?" form, send a test email to yourself, and verify that the link opens your domain.

## YooKassa for project support

Add these variables to `.env` on the server:

```env
YOOKASSA_SHOP_ID=your-shop-id
YOOKASSA_SECRET_KEY=your-secret-key
YOOKASSA_WEBHOOK_SECRET=random-long-secret
DONATION_ALLOWED_AMOUNTS=149,299,499
DONATION_MIN_AMOUNT=100
DONATION_MAX_AMOUNT=5000
DONATION_CURRENCY=RUB
```

Webhook URL for YooKassa:

```text
https://your-domain.ru/api/payments/yookassa/webhook?key=YOUR_YOOKASSA_WEBHOOK_SECRET
```

Important:

- payments work correctly only with `https://`;
- the application does not store card data;
- the final payment status is confirmed only by webhook.
