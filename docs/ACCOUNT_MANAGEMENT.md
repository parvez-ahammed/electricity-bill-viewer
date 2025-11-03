# Account Management System

## Overview

Bill Barta now uses a database-driven account management system instead of environment variables for storing electricity provider credentials. This provides better security through encryption and a user-friendly web interface for managing accounts.

## Features

- 🔐 **Encrypted Storage**: All credentials encrypted using AES encryption
- 🌐 **Web Interface**: Add, edit, and delete accounts through the UI
- 🔄 **Multi-Provider Support**: DPDC and NESCO accounts in one system
- 🛡️ **Corruption Handling**: Graceful handling of encryption key changes
- ✅ **Validation**: Zod schema validation for all account operations

## Database Schema

Accounts are stored in SQLite database with the following structure:

```typescript
interface Account {
    id: string;              // UUID primary key
    provider: 'DPDC' | 'NESCO';
    credentials: {
        // DPDC accounts
        username: string;
        password: string;      // Encrypted
        clientSecret: string;  // Encrypted
        
        // NESCO accounts  
        username: string;      // Customer number
    };
    createdAt: Date;
    updatedAt: Date;
}
```

## Adding Accounts

### Via Web Interface (Recommended)

1. Navigate to the **Account Management** page
2. Click **Add** button for your provider (DPDC/NESCO)
3. Fill in the required credentials:
   - **DPDC**: Username, Password, Client Secret
   - **NESCO**: Customer Number only
4. Click **Add** to save

### Via API

```bash
# Add DPDC account
curl -X POST http://localhost:3000/api/v1/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "DPDC",
    "credentials": {
      "username": "your_username",
      "password": "your_password", 
      "clientSecret": "your_client_secret"
    }
  }'

# Add NESCO account
curl -X POST http://localhost:3000/api/v1/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "NESCO",
    "credentials": {
      "username": "your_customer_number"
    }
  }'
```

## Managing Accounts

### Edit Account
1. Click the **Edit** (pencil) icon next to an account
2. Modify the credentials
3. Click the **Save** (checkmark) icon

### Delete Account
1. Click the **Delete** (trash) icon next to an account
2. Confirm deletion in the dialog

### View Accounts
- All accounts are listed by provider on the Account Management page
- Passwords and client secrets are masked for security
- Account count is shown for each provider

## Encryption

### How It Works
- All sensitive fields (passwords, client secrets) are encrypted using AES
- Encryption key is set via `ENCRYPTION_KEY` environment variable
- Each field is encrypted individually for granular security

### Encryption Key Management

**Development:**
```bash
# Use default key (not recommended)
ENCRYPTION_KEY=your-super-secret-encryption-key-change-this-in-production
```

**Production:**
```bash
# Generate secure key
openssl rand -base64 32

# Set in environment
ENCRYPTION_KEY=your_generated_secure_key
```

⚠️ **Important**: Never change the encryption key after storing accounts, or data will become corrupted.

## Corruption Handling

If the encryption key changes and accounts become corrupted:

### Symptoms
- Accounts show as "[CORRUPTED DATA]" in the UI
- Red "Corrupted" badge appears next to affected accounts
- Error messages about decryption failures

### Resolution
1. **Automatic Detection**: Corrupted accounts are automatically flagged
2. **Help Message**: UI shows instructions when corruption is detected
3. **Force Delete**: Use the delete button to remove corrupted accounts
4. **Re-add Accounts**: Add accounts again with correct credentials

### Prevention
- Never change `ENCRYPTION_KEY` after deployment
- Backup the encryption key securely
- Use consistent key across all environments

## Migration from Environment Variables

If upgrading from the old environment variable system:

### Old Method (.env files)
```bash
# Old way - no longer used
DPDC_USERNAME=username
DPDC_PASSWORD=password
DPDC_CLIENT_SECRET=secret
NESCO_CUSTOMER_NUMBER=number
```

### New Method (Database)
1. Remove old environment variables
2. Add accounts via web interface
3. Credentials are now stored in encrypted database

## API Endpoints

### Account Management
- `GET /api/v1/accounts` - List all accounts
- `POST /api/v1/accounts` - Create account
- `GET /api/v1/accounts/:id` - Get account by ID
- `PUT /api/v1/accounts/:id` - Update account
- `DELETE /api/v1/accounts/:id` - Delete account
- `DELETE /api/v1/accounts/:id/force` - Force delete corrupted account

### Provider-Specific
- `GET /api/v1/accounts/provider/DPDC` - Get DPDC accounts
- `GET /api/v1/accounts/provider/NESCO` - Get NESCO accounts

## Validation

All account operations use Zod schema validation:

### DPDC Account Validation
```typescript
{
  provider: "DPDC",
  credentials: {
    username: string (required),
    password: string (required), 
    clientSecret: string (required)
  }
}
```

### NESCO Account Validation
```typescript
{
  provider: "NESCO", 
  credentials: {
    username: string (required) // Customer number
  }
}
```

## Security Best Practices

1. **Encryption Key**: Use strong, randomly generated keys
2. **Environment Variables**: Never commit encryption keys to version control
3. **Access Control**: Limit access to account management interface
4. **Regular Rotation**: Consider rotating credentials periodically
5. **Backup Strategy**: Backup both database and encryption key

## Troubleshooting

### No Accounts Found
- Check that accounts are added via the web interface
- Verify database connection and file permissions
- Check server logs for initialization errors

### Decryption Errors
- Verify `ENCRYPTION_KEY` matches the key used to encrypt data
- Check for corrupted accounts in the UI
- Use force delete for corrupted accounts and re-add

### API Errors
- Ensure request body matches validation schema
- Check Content-Type header is `application/json`
- Verify all required fields are provided

## Database Location

- **Development**: `./data/accounts.db`
- **Docker**: `/app/data/accounts.db` (mounted volume)
- **Production**: Configured via Docker volume or host mount

The database is automatically created on first startup with proper permissions.