# YooKassa setup

This project uses hosted YooKassa checkout for one-time support payments.

## Important rules

- Card data is never entered into the application.
- The application stores only technical payment metadata.
- A payment becomes successful only after the server receives and verifies a webhook.
- Redirecting the user back to the site does not confirm payment by itself.

## Required `.env` values

```env
APP_BASE_URL=https://your-domain.ru
YOOKASSA_SHOP_ID=your-shop-id
YOOKASSA_SECRET_KEY=your-secret-key
YOOKASSA_WEBHOOK_SECRET=random-long-secret
DONATION_ALLOWED_AMOUNTS=149,299,499
DONATION_MIN_AMOUNT=100
DONATION_MAX_AMOUNT=5000
DONATION_CURRENCY=RUB
```

## Webhook URL

Register the webhook in YooKassa with the same domain that serves the app:

```text
https://your-domain.ru/api/payments/yookassa/webhook?key=YOUR_YOOKASSA_WEBHOOK_SECRET
```

## Deployment checklist

1. Make sure the site works over `https://`.
2. Fill YooKassa variables in `.env` on the server.
3. Restart the app:

```bash
npm run build
pm2 restart resource-todo
```

4. Create a test payment from the account modal.
5. Verify that the user returns to the site and the final success state appears only after the webhook.
