# Telegram Bot Integration

## Overview

The Telegram bot integration sends electricity account balance reports directly to your Telegram chat. The system supports automated daily reports, manual triggers, and **database-driven notification settings** configurable per user through the web interface or API.

## Features

- ⚡ **Balance Reports**: Formatted electricity account balance summaries
- ⏰ **Daily Scheduled Reports**: Automatic notifications at 12:00 PM BST every day
- 🔵🟢 **Multi-Provider**: DPDC and NESCO accounts in one report
- 💰 **Balance Summary**: Total balance across all accounts
- 🛢️ **Database-Driven Settings**: Chat ID stored in database, not environment variables
- 🔒 **Per-User Configuration**: Each authenticated user manages their own notification settings

## Setup

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. Save the **Bot Token** (e.g., `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Get Your Chat ID

**Method 1: Using @userinfobot**
1. Search for [@userinfobot](https://t.me/userinfobot) in Telegram
2. Start a conversation — it will send you your Chat ID

**Method 2: Using API**
1. Send a message to your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Look for `"chat":{"id":123456789}` in the response

### 3. Configure Bot Token

Add the bot token to your `server/.env` file:

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 4. Configure Chat ID (via Web UI or API)

The Telegram Chat ID is now managed through the **database-driven notification settings**, not environment variables.

**Via Web UI:**
- Log in to the application
- Navigate to notification settings
- Enter your Telegram Chat ID and enable notifications

**Via API:**
```bash
# Set chat ID and enable notifications
curl -X PUT http://localhost:3000/api/v1/notification-settings/telegram \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{ "chatId": "123456789", "isActive": true }'
```

### 5. Restart the Server

```bash
cd server
npm run start:dev
```

## Notification Settings API

All endpoints require JWT authentication (`Authorization: Bearer <token>`).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/notification-settings/telegram` | Get current settings |
| `POST` / `PUT` / `PATCH` | `/api/v1/notification-settings/telegram` | Create/update settings |
| `DELETE` | `/api/v1/notification-settings/telegram` | Remove settings |

**Request Body (POST/PUT/PATCH):**
```json
{
  "chatId": "123456789",
  "isActive": true
}
```

### Database Schema

```typescript
@Entity('telegram_notification_settings')
class TelegramNotificationSettings {
    id: string;              // UUID
    chatId: string | null;   // Telegram chat ID
    userId: string;          // References User.id (Google ID)
    isActive: boolean;       // Enable/disable (default: true)
    createdAt: Date;
    updatedAt: Date;
}
```

## Sending Reports

### Manual Trigger

Send a balance report at any time (requires authentication):

```bash
curl http://localhost:3000/api/v1/telegram/send-balances \
  -H "Authorization: Bearer <your_jwt_token>"
```

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

### Automated Daily Reports

The `SchedulerService` automatically sends balance reports **every day at 12:00 PM BST (Bangladesh Standard Time)**.

- Starts automatically when the server starts
- Uses cron expression `0 12 * * *` with `Asia/Dhaka` timezone
- Always fetches fresh data (bypasses cache)
- Sends to the configured Telegram chat (from database settings)
- Logs success/failure in server logs

**Example log output:**
```
⏰ Scheduled daily balance notifications at 12:00 PM BST (Asia/Dhaka timezone)
⏰ Running scheduled balance notification at 12:00 PM BST...
✅ Scheduled balance notification sent successfully. Accounts: 3
```

## Message Format

```text
⚡ Electricity Account Balances ⚡
📅 [timestamp]
━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔵 DPDC
━━━━━━━━━━━━━━━━━━━━━━━━━━━

John Doe
💰 Balance: ৳1250.50
📅 Updated: 2025-10-20

🟢 NESCO
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bob Johnson
💰 Balance: ৳850.00
📅 Updated: 2025-10-20
```

## Troubleshooting

### Bot Token Invalid
**Error:** `Telegram service not configured`
- Verify `TELEGRAM_BOT_TOKEN` is set correctly in `server/.env`
- Ensure no extra spaces or quotes
- Token format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### Chat ID Not Working
**Error:** `Chat not found`
- Ensure the chat ID is configured via the API or web UI (not env var)
- Verify it's a numerical ID, not a @username
- Send a message to your bot first
- For groups: use negative Chat ID (e.g., `-123456789`)

### No Account Data
**Error:** `No account data retrieved`
- Check DPDC/NESCO credentials are correct
- Ensure accounts are added via the Account Management page

### Notifications Disabled
- Check that `isActive` is `true` in notification settings
- Use `GET /api/v1/notification-settings/telegram` to verify

## Security Best Practices

1. **Keep Bot Token Secret**: Never commit to Git or share publicly
2. **Use Environment Variables**: Bot token in `.env`, chat ID in database
3. **Rotate Tokens**: Regenerate bot token periodically via @BotFather
4. **Private Chats**: Use private chat, not public groups
5. **Authentication**: All notification settings endpoints require JWT auth
