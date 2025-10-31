# Telegram Bot Integration

## Overview

The Telegram bot integration allows you to receive electricity account balance reports directly in your Telegram chat. The bot can send formatted messages with balance information from all configured DPDC and NESCO accounts.

## Features

- ⚡ **Automated Balance Reports**: Get electricity account balances sent to Telegram
- ⏰ **Daily Scheduled Reports**: Automatically sends balance at 12:00 PM BST every day
- 🔵🟢 **Multi-Provider Support**: DPDC and NESCO accounts in one report
- 💰 **Balance Summary**: Total balance across all accounts

## Setup

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. You'll receive a **Bot Token** (e.g., `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Save this token securely

### 2. Get Your Chat ID

**Method 1: Using @userinfobot**

1. Search for [@userinfobot](https://t.me/userinfobot) in Telegram
2. Start a conversation
3. It will send you your Chat ID

**Method 2: Using API**

1. Send a message to your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Look for `"chat":{"id":123456789}` in the response

### 3. Configure Environment Variables

Add the following to your `.env` file:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

### 4. Restart the Server

```bash
cd server
npm run start:dev
```

## API Endpoints

### 1. Send Balance Report

**Endpoint:** `GET /api/v1/telegram/send-balances`

**Description:** Fetches all account balances and sends a formatted report to your Telegram chat.

**Example:**

```bash
curl http://localhost:3000/api/v1/telegram/send-balances
```

**Response:**

```json
{
  "status": "success",
  "message": "Account balances sent to Telegram successfully",
  "data": {
    "success": true,
    "message": "Account balances sent to Telegram successfully",
    "sentAccounts": 3
  }
}
```

## Message Format

The bot currently sends a simplified HTML message like this:

```text
⚡ Electricity Account Balances ⚡
📅 [timestamp]
━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔵 DPDC
━━━━━━━━━━━━━━━━━━━━━━━━━━━

John Doe
💰 Balance: ৳1250.50
📅 Updated: 2025-10-20

Jane Smith
💰 Balance: ৳2100.00
 Updated: 2025-10-20

🟢 NESCO
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bob Johnson
 Balance: ৳850.00
 Updated: 2025-10-20
```

Only the customer name, balance, and last updated date are included for each account. Other details (location, account number, type, status, last payment, summary) are not shown in the current message format.

## Automation

### Built-in Scheduler (Recommended)

The server automatically sends balance reports **every day at 12:00 PM BST (Bangladesh Standard Time)**.

**How it works:**

- Scheduler starts automatically when the server starts
- Runs at 12:00 PM Asia/Dhaka timezone
- Fetches fresh data (bypasses cache)
- Sends formatted message to your Telegram chat
- Logs success/failure in server logs

**No configuration needed!** Just ensure your `.env` has:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

**Check logs:**

```bash
# You'll see messages like:
⏰ Scheduled daily balance notifications at 12:00 PM BST (Asia/Dhaka timezone)
⏰ Running scheduled balance notification at 12:00 PM BST...
✅ Scheduled balance notification sent successfully. Accounts: 3
```

### Manual Trigger (Optional)

You can also manually trigger a balance report anytime:

```bash
curl http://localhost:3000/api/v1/telegram/send-balances
```

### Using Cron Jobs (Alternative - Not Needed)

Schedule automatic balance reports:

```bash
# Edit crontab
crontab -e

# Add this line to send reports daily at 9 AM
0 9 * * * curl http://localhost:3000/api/v1/telegram/send-balances

# Or every Monday at 10 AM
0 10 * * 1 curl http://localhost:3000/api/v1/telegram/send-balances
```

### Using Task Scheduler (Windows)

1. Open Task Scheduler
2. Create a new task
3. Set trigger (e.g., Daily at 9:00 AM)
4. Set action: `curl.exe http://localhost:3000/api/v1/telegram/send-balances`

### Using Node-Cron (In-App)

Add to your server code:

```typescript
import cron from "node-cron";

// Send balance report every day at 9 AM
cron.schedule("0 9 * * *", async () => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/v1/telegram/send-balances"
    );
    const data = await response.json();
    console.log("Scheduled balance report sent:", data);
  } catch (error) {
    console.error("Failed to send scheduled report:", error);
  }
});
```

## Troubleshooting

### Bot Token Invalid

**Error:** `Telegram service not configured`

**Solution:**

1. Verify `TELEGRAM_BOT_TOKEN` is set correctly
2. Ensure no extra spaces or quotes
3. Token format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### Chat ID Not Working

**Error:** `Chat not found`

**Solution:**

1. Send a message to your bot first
2. Use numerical Chat ID (not @username)
3. For groups: Use negative Chat ID (e.g., `-123456789`)

### No Account Data

**Error:** `No account data retrieved`

**Solution:**

1. Check DPDC/NESCO credentials are correct
2. Ensure cookies and tokens are fresh
3. Test individual credentials first

### Message Not Received

**Error:** Message sent successfully but not received

**Solution:**

1. Check if you blocked the bot
2. Verify bot has permission to send messages
3. For groups: Add bot as admin
4. Check Telegram app is updated

## Security Best Practices

⚠️ **Important:**

1. **Keep Bot Token Secret**: Never commit to Git or share publicly
2. **Restrict Chat ID**: Only your chat ID should be configured
3. **Use Environment Variables**: Never hardcode credentials
4. **Rotate Tokens**: Regenerate bot token periodically via @BotFather
5. **Monitor Access**: Check bot messages for unauthorized access
6. **Private Chats**: Use private chat, not public groups

## API Reference

### Telegram Bot API

Official Documentation: <https://core.telegram.org/bots/api>

### Available Methods

- `sendMessage` - Send text messages
- `sendPhoto` - Send images
- `sendDocument` - Send files
- `editMessageText` - Edit sent messages
- `deleteMessage` - Delete messages

## Support

For issues or questions:

- Check server logs for detailed error messages
- Verify all environment variables are set
- Test bot connection first with `/test` endpoint
- Ensure credentials are fresh (especially NESCO)
- Restart server after configuration changes

## Example Workflow

1. **Setup**

   ```bash
   # Create bot with @BotFather
   # Get chat ID from @userinfobot
   # Update .env file
   # Restart server
   ```

2. **Send Report**

   ```bash
   curl http://localhost:3000/api/v1/telegram/send-balances
   ```

3. **Automate** (Optional)

   ```bash
   # Add cron job for daily reports
   0 9 * * * curl http://localhost:3000/api/v1/telegram/send-balances
   ```

## Credits

Powered by:

- [Telegram Bot API](https://core.telegram.org/bots/api)
- DPDC & NESCO APIs
- Node.js + TypeScript
