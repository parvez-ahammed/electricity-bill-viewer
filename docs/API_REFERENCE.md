# API Reference

All API endpoints are versioned under `/api/v1`. Protected endpoints require a valid JWT token in the `Authorization: Bearer <token>` header.

## Base URL

| Environment | Base URL                         |
| ----------- | -------------------------------- |
| Development | `http://localhost:3000/api/v1`   |
| Production  | `https://your-domain.com/api/v1` |

## Authentication

All protected endpoints require:

```http
Authorization: Bearer <jwt_token>
```

Tokens are obtained through the Google OAuth flow and have a configurable expiration (default: 7 days).

---

## Authentication Endpoints

### `GET /auth/google`

Initiates the Google OAuth 2.0 flow.

**Authentication:** None

**Response:** Redirects to Google's authentication page.

---

### `GET /auth/google/callback`

Handles the Google OAuth callback. Creates/finds user, generates JWT, and redirects to frontend.

**Authentication:** None

| Query Parameter | Type   | Description               |
| --------------- | ------ | ------------------------- |
| `code`          | string | Google authorization code |

**Success Redirect:** `${FRONTEND_URL}/auth/callback?token=<jwt>`

**Error Redirect:** `${FRONTEND_URL}/login?error=google`

---

### `GET /auth/me`

Returns the currently authenticated user's information.

**Authentication:** Required

**Response:**

```json
{
  "status": "success",
  "data": {
    "userId": "google-id-123456",
    "email": "user@gmail.com"
  },
  "message": "User information retrieved successfully"
}
```

---

### `POST /auth/logout`

Stateless logout endpoint. Actual token invalidation happens client-side.

**Authentication:** None

**Response:**

```json
{
  "status": "success",
  "data": {},
  "message": "Logged out successfully"
}
```

---

## Electricity Data Endpoints

### `GET /electricity/usage`

Fetches electricity usage and balance data for all accounts belonging to the authenticated user.

**Authentication:** Required

| Header         | Type     | Description                                 |
| -------------- | -------- | ------------------------------------------- |
| `x-skip-cache` | `"true"` | Optional. Bypass Redis cache for fresh data |

**Response:**

```json
{
  "status": "success",
  "data": {
    "success": true,
    "totalAccounts": 3,
    "successfulLogins": 3,
    "failedLogins": 0,
    "accounts": [
      {
        "accountId": "uuid-here",
        "customerNumber": "123456789",
        "customerName": "John Doe",
        "provider": "DPDC",
        "accountType": "Prepaid",
        "balanceRemaining": "1500.00",
        "connectionStatus": "Connected",
        "lastPaymentAmount": "500.00",
        "lastPaymentDate": "2026-03-01",
        "balanceLatestDate": "2026-03-09",
        "location": "Dhaka",
        "mobileNumber": "01700000000",
        "minRecharge": "100",
        "displayName": "Home"
      }
    ],
    "timestamp": "2026-03-09T10:00:00.000Z"
  },
  "message": "Usage data retrieved successfully"
}
```

**Error Response (partial failure):**

```json
{
  "status": "success",
  "data": {
    "success": true,
    "totalAccounts": 2,
    "successfulLogins": 1,
    "failedLogins": 1,
    "accounts": [...],
    "errors": [
      {
        "username": "failed_user",
        "provider": "DPDC",
        "error": "Invalid credentials",
        "attempts": 3
      }
    ],
    "timestamp": "2026-03-09T10:00:00.000Z"
  },
  "message": "Usage data retrieved successfully"
}
```

---

## Account Management Endpoints

All account routes require JWT authentication.

### `GET /accounts`

List all accounts for the authenticated user.

**Authentication:** Required

**Response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-here",
      "provider": "DPDC",
      "credentials": {
        "username": "myusername"
      },
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-03-01T00:00:00.000Z"
    }
  ],
  "message": "Accounts retrieved successfully"
}
```

> Note: Passwords and client secrets are **never** returned in API responses.

---

### `POST /accounts`

Create a new electricity provider account.

**Authentication:** Required

**Request Body (DPDC):**

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

**Request Body (NESCO):**

```json
{
  "provider": "NESCO",
  "credentials": {
    "username": "customer_number"
  }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "provider": "DPDC",
    "createdAt": "2026-03-09T10:00:00.000Z"
  },
  "message": "Account created successfully"
}
```

**Validation Errors:**

```json
{
  "error": "The given data was invalid."
}
```

---

### `GET /accounts/:id`

Get a single account by UUID.

**Authentication:** Required

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `id`      | UUID | Account ID  |

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "provider": "DPDC",
    "credentials": {
      "username": "myusername"
    },
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-03-01T00:00:00.000Z"
  },
  "message": "Account retrieved successfully"
}
```

---

### `PUT /accounts/:id`

Update account credentials.

**Authentication:** Required

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `id`      | UUID | Account ID  |

**Request Body:**

```json
{
  "credentials": {
    "username": "new_username",
    "password": "new_password",
    "clientSecret": "new_client_secret"
  }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "provider": "DPDC",
    "updatedAt": "2026-03-09T10:00:00.000Z"
  },
  "message": "Account updated successfully"
}
```

---

### `DELETE /accounts/:id`

Delete an account.

**Authentication:** Required

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `id`      | UUID | Account ID  |

**Response:**

```json
{
  "status": "success",
  "data": {},
  "message": "Account deleted successfully"
}
```

---

### `DELETE /accounts/:id/force`

Force delete a corrupted account that may have decryption issues.

**Authentication:** Required

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `id`      | UUID | Account ID  |

**Response:**

```json
{
  "status": "success",
  "data": {},
  "message": "Account force deleted successfully"
}
```

---

### `GET /accounts/provider/:provider`

Get all accounts for a specific provider.

**Authentication:** Required

| Parameter  | Type   | Values          |
| ---------- | ------ | --------------- |
| `provider` | string | `DPDC`, `NESCO` |

**Response:**

```json
{
  "status": "success",
  "data": [...],
  "message": "Accounts retrieved successfully"
}
```

---

## Nickname Management

### `PUT /accounts/:accountId/nickname`

Set or update an account nickname.

**Authentication:** Required

**Request Body:**

```json
{
  "nickname": "Home"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "accountId": "uuid-here",
    "nickname": "Home"
  },
  "message": "Nickname updated successfully"
}
```

---

### `GET /accounts/:accountId/nickname`

Get account nickname.

**Authentication:** Required

**Response:**

```json
{
  "status": "success",
  "data": {
    "accountId": "uuid-here",
    "nickname": "Home"
  },
  "message": "Nickname retrieved successfully"
}
```

---

### `DELETE /accounts/:accountId/nickname`

Remove account nickname.

**Authentication:** Required

**Response:**

```json
{
  "status": "success",
  "data": {},
  "message": "Nickname deleted successfully"
}
```

---

## Telegram Endpoints

### `GET /telegram/send-balances`

Fetches all account balances and sends a formatted report to the user's configured Telegram chat.

**Authentication:** Required

**Prerequisites:**

- `TELEGRAM_BOT_TOKEN` configured in server environment
- User has configured Telegram notification settings

**Response:**

```json
{
  "status": "success",
  "data": {
    "success": true,
    "message": "Account balances sent to Telegram successfully",
    "sentAccounts": 3
  },
  "message": "Telegram notification sent"
}
```

**Error (no chat configured):**

```json
{
  "status": "error",
  "data": {},
  "message": "Telegram notifications not configured. Please set up your chat ID."
}
```

---

## Notification Settings Endpoints

Manage per-user Telegram notification configuration.

### `GET /notification-settings/telegram`

Get current Telegram notification settings.

**Authentication:** Required

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "chatId": "123456789",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-03-01T00:00:00.000Z"
  },
  "message": "Settings retrieved successfully"
}
```

**Response (not configured):**

```json
{
  "status": "success",
  "data": null,
  "message": "No Telegram settings configured"
}
```

---

### `POST /notification-settings/telegram`

### `PUT /notification-settings/telegram`

### `PATCH /notification-settings/telegram`

Create or update Telegram notification settings (upsert).

**Authentication:** Required

**Request Body:**

```json
{
  "chatId": "123456789",
  "isActive": true
}
```

| Field      | Type    | Default  | Description                  |
| ---------- | ------- | -------- | ---------------------------- |
| `chatId`   | string  | required | Telegram chat ID             |
| `isActive` | boolean | `true`   | Enable/disable notifications |

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "chatId": "123456789",
    "isActive": true,
    "updatedAt": "2026-03-09T10:00:00.000Z"
  },
  "message": "Settings updated successfully"
}
```

---

### `DELETE /notification-settings/telegram`

Remove Telegram notification settings.

**Authentication:** Required

**Response:**

```json
{
  "status": "success",
  "data": {},
  "message": "Settings deleted successfully"
}
```

---

## Standard Response Format

All API responses follow this format:

```json
{
  "status": "success" | "error",
  "data": { ... } | null,
  "message": "Human-readable message"
}
```

## HTTP Status Codes

| Status | Meaning                               |
| ------ | ------------------------------------- |
| `200`  | Success                               |
| `201`  | Created                               |
| `400`  | Bad Request / Validation Error        |
| `401`  | Unauthorized (missing or invalid JWT) |
| `403`  | Forbidden                             |
| `404`  | Resource Not Found                    |
| `429`  | Rate Limited                          |
| `500`  | Internal Server Error                 |
| `502`  | External Service Error                |

## Rate Limiting

The API implements rate limiting to prevent abuse:

| Setting      | Default           |
| ------------ | ----------------- |
| Window       | 15 minutes        |
| Max Requests | 10,000 per window |

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9999
X-RateLimit-Reset: 1709985600
```

## Legend

| Symbol | Meaning                 |
| ------ | ----------------------- |
| 🔒     | Requires authentication |
| ✅     | Success response        |
| ❌     | Error response          |
