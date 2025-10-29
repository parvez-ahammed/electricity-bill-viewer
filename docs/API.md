# API Reference

## Electricity Data

```text
GET /api/v1/electricity/usage-data
Headers: x-skip-cache: true (optional)
Response: Array of account data with balances
```

## Telegram Notifications

```text
GET /api/v1/telegram/send-balances
Response: { success: true, message: "..." }
```

See the main README for quick start. For more details on request/response formats, see the code or open an issue.
