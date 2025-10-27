# Telegram Bot Integration

## Overview

The Telegram bot integration allows you to receive electricity account balance reports directly in your Telegram chat. The bot can send formatted messages with balance information from all configured DPDC and NESCO accounts.

## Features

- ⚡ **Automated Balance Reports**: Get electricity account balances sent to Telegram
- ⏰ **Daily Scheduled Reports**: Automatically sends balance at 12:00 PM BST every day
- 📊 **Formatted Messages**: Beautiful HTML-formatted messages with emojis
- 🔵🟢 **Multi-Provider Support**: DPDC and NESCO accounts in one report
- 💰 **Balance Summary**: Total balance across all accounts
- 🤖 **Test Command**: Verify bot configuration

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

# Electricity Credentials (JSON array)
ELECTRICITY_CREDENTIALS='[{"provider":"DPDC","username":"01836430305","password":"YourPassword"},{"provider":"NESCO","username":"19900128","password":"YourPassword"}]'
```

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

### 2. Test Connection

**Endpoint:** `GET /api/v1/telegram/test`

**Description:** Sends a test message to verify bot configuration.

**Example:**

```bash
curl http://localhost:3000/api/v1/telegram/test
```

**Response:**

```json
{
    "status": "success",
    "message": "Test message sent to Telegram successfully",
    "data": {
        "sent": true
    }
}
```

## Message Format

The bot sends beautifully formatted HTML messages:

```
⚡ Electricity Account Balances ⚡
📅 Sunday, October 20, 2025 at 10:30 PM
━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔵 DPDC (2 accounts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. John Doe
📍 Location: Dhaka, Gulshan
🆔 Account: 12345678
💰 Balance: ৳1,250.50
📊 Type: Prepaid
🔌 Status: Active
📅 Updated: 2025-10-20
💳 Last Payment: ৳500 on 2025-10-15

2. Jane Smith
📍 Location: Dhaka, Banani
🆔 Account: 87654321
💰 Balance: ৳2,100.00
📊 Type: Prepaid
🔌 Status: Active
📅 Updated: 2025-10-20
💳 Last Payment: ৳1,000 on 2025-10-18

🟢 NESCO (1 account)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Bob Johnson
📍 Location: Rajshahi
🆔 Account: 19900128
💰 Balance: ৳850.00
📊 Type: Prepaid
🔌 Status: Active
📅 Updated: 2025-10-20
💳 Last Payment: ৳600 on 2025-10-16

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Summary
Total Accounts: 3
💵 Total Balance: ৳4,200.50
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

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
- `ELECTRICITY_CREDENTIALS`

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
import cron from 'node-cron';

// Send balance report every day at 9 AM
cron.schedule('0 9 * * *', async () => {
    try {
        const response = await fetch(
            'http://localhost:3000/api/v1/telegram/send-balances'
        );
        const data = await response.json();
        console.log('Scheduled balance report sent:', data);
    } catch (error) {
        console.error('Failed to send scheduled report:', error);
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

1. Verify `ELECTRICITY_CREDENTIALS` is valid JSON
2. Check DPDC/NESCO credentials are correct
3. Ensure cookies and tokens are fresh
4. Test individual credentials first

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
7. **HTTPS Only**: Telegram API requires HTTPS in production

## Advanced Usage

### Custom Formatting

Edit `TelegramService.formatAccountMessage()` to customize message format:

```typescript
formatAccountMessage(accounts: ProviderAccountDetails[]): string {
    // Your custom formatting logic
    return customMessage;
}
```

### Multiple Recipients

To send to multiple chats, create multiple bot instances or loop through chat IDs:

```typescript
const chatIds = ['123456789', '987654321'];

for (const chatId of chatIds) {
    // Send message to each chat
}
```

### Rich Media

Telegram supports images, buttons, and more:

```typescript
// Send photo with caption
await fetch(`${baseUrl}/bot${token}/sendPhoto`, {
    method: 'POST',
    body: JSON.stringify({
        chat_id: chatId,
        photo: 'https://example.com/chart.png',
        caption: 'Balance Chart',
    }),
});
```

## API Reference

### Telegram Bot API

Official Documentation: https://core.telegram.org/bots/api

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

2. **Test**

    ```bash
    curl http://localhost:3000/api/v1/telegram/test
    ```

3. **Send Report**

    ```bash
    curl http://localhost:3000/api/v1/telegram/send-balances
    ```

4. **Automate** (Optional)
    ```bash
    # Add cron job for daily reports
    0 9 * * * curl http://localhost:3000/api/v1/telegram/send-balances
    ```

## Credits

Powered by:

- [Telegram Bot API](https://core.telegram.org/bots/api)
- DPDC & NESCO APIs
- Node.js + TypeScript
