# API Reference

All API endpoints are versioned under `/api/v1`. Protected endpoints require a valid JWT token in the `Authorization: Bearer <token>` header.

## Authentication (`/api/v1/auth`)

> **Public routes** — no JWT required (except `/me`)

### `GET /google`
Initiates Google OAuth 2.0 flow. Redirects browser to Google's authentication page.

### `GET /google/callback`
Handles Google OAuth callback. Exchanges authorization code for user data, creates/finds user, generates JWT, and redirects to frontend.

| Query Param | Type | Description |
|-------------|------|-------------|
| `code` | string | Google authorization code |

**Redirect:** `${FRONTEND_URL}/auth/callback?token=<jwt>` on success, `${FRONTEND_URL}/login?error=google` on failure.

### `GET /me` 🔒
Returns the currently authenticated user's info.

**Response:**
```json
{
  "status": "success",
  "data": { "userId": "google-id", "email": "user@gmail.com" },
  "message": "User information retrieved successfully"
}
```

### `POST /logout`
Stateless logout endpoint. JWT invalidation is handled client-side.

---

## Electricity Data (`/api/v1/electricity`) 🔒

### `GET /usage`
Fetches electricity usage/balance data for all accounts belonging to the authenticated user.

| Header | Type | Description |
|--------|------|-------------|
| `x-skip-cache` | `"true"` | Optional. Bypass Redis cache for fresh data |

**Response:** Array of account data with balances from DPDC and NESCO providers.

---

## Account Management (`/api/v1/accounts`) 🔒

All account routes require JWT authentication. Zod validation is applied to request bodies and params.

### `GET /`
List all accounts for the authenticated user.

### `POST /`
Create a new electricity provider account.

**Request Body:**
```json
{
  "provider": "DPDC",
  "credentials": {
    "username": "your_username",
    "password": "your_password",
    "clientSecret": "your_client_secret"
  }
}
```

For NESCO accounts:
```json
{
  "provider": "NESCO",
  "credentials": {
    "username": "customer_number"
  }
}
```

### `GET /:id`
Get a single account by UUID.

### `PUT /:id`
Update account credentials.

**Request Body:**
```json
{
  "credentials": { "username": "...", "password": "...", "clientSecret": "..." }
}
```

### `DELETE /:id`
Delete an account.

### `DELETE /:id/force`
Force delete a corrupted account (bypasses decryption).

### `GET /provider/:provider`
Get all accounts for a specific provider (`DPDC` or `NESCO`).

### Nickname Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT` | `/:accountId/nickname` | Set/update account nickname |
| `GET` | `/:accountId/nickname` | Get account nickname |
| `DELETE` | `/:accountId/nickname` | Remove account nickname |

---

## Telegram (`/api/v1/telegram`) 🔒

### `GET /send-balances`
Fetches all account balances and sends a formatted report to the configured Telegram chat.

**Response:**
```json
{
  "status": "success",
  "data": {
    "success": true,
    "message": "Account balances sent to Telegram successfully",
    "sentAccounts": 3
  }
}
```

---

## Notification Settings (`/api/v1/notification-settings`) 🔒

Manage per-user Telegram notification configuration. The `chatId` is stored in the database (not in environment variables).

### `GET /telegram`
Get current Telegram notification settings for the authenticated user.

### `POST /telegram` | `PUT /telegram` | `PATCH /telegram`
Create or update Telegram notification settings (upsert).

**Request Body:**
```json
{
  "chatId": "123456789",
  "isActive": true
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `chatId` | string | required | Telegram chat ID to send notifications to |
| `isActive` | boolean | `true` | Enable/disable notifications |

### `DELETE /telegram`
Remove Telegram notification settings.

---

## Standard Response Format

All API responses follow a consistent format:

```json
{
  "status": "success" | "error",
  "data": { ... },
  "message": "Human-readable message"
}
```

## Error Codes

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `400` | Bad request / validation error |
| `401` | Unauthorized (missing/invalid JWT) |
| `404` | Resource not found |
| `500` | Internal server error |

🔒 = Requires `Authorization: Bearer <token>` header
