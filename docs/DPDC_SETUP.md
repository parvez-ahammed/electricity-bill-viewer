# DPDC Account Setup Guide

## Overview

DPDC (Dhaka Power Distribution Company) accounts require three pieces of information:
- **Username**: Your DPDC account username
- **Password**: Your DPDC account password  
- **Client Secret**: A special authentication key required for API access

## Finding Your DPDC Client Secret

The DPDC client secret is embedded in the authentication requests made by the official DPDC website. Here's how to find it:

### Method 1: Browser Developer Tools (Recommended)

1. **Open DPDC Website**
   - Navigate to [https://amiapp.dpdc.org.bd](https://amiapp.dpdc.org.bd)
   - Go to the login page

2. **Open Developer Tools**
   - Press `F12` or right-click and select "Inspect"
   - Go to the **Network** tab
   - Check "Preserve log" to keep requests after navigation

3. **Attempt Login**
   - Enter any username/password (doesn't need to be correct)
   - Click the login button
   - Watch the network requests

4. **Find the Bearer Token Request**
   - Look for a request to `/auth/login/generate-bearer`
   - Click on this request to view details

5. **Extract Client Secret**
   - Go to the **Request Headers** section
   - Find the `clientsecret` header
   - Copy the value (it will look like a long alphanumeric string)

### Method 2: Using Browser Console

1. **Open Console**
   - Press `F12` and go to **Console** tab

2. **Run Inspection Script**
   ```javascript
   // Monitor network requests for client secret
   const observer = new PerformanceObserver((list) => {
     for (const entry of list.getEntries()) {
       if (entry.name.includes('generate-bearer')) {
         console.log('Found bearer request:', entry.name);
         // Check the request in Network tab
       }
     }
   });
   observer.observe({entryTypes: ['resource']});
   ```

3. **Trigger Login**
   - Attempt to login and check console output

### What the Client Secret Looks Like

The client secret is typically:
- A long alphanumeric string (20-40 characters)
- Contains both letters and numbers
- Example format: `0yFsAl4nN9jX1GGkgOrvpUxDarf2DT40`

## DPDC Authentication Flow

Understanding how DPDC authentication works helps with troubleshooting:

### Step 1: Generate Bearer Token
```http
POST /auth/login/generate-bearer
Headers:
  clientid: auth-ui
  clientsecret: [YOUR_CLIENT_SECRET]
  tenantcode: DPDC
```

### Step 2: Login with Credentials  
```http
POST /auth/login
Headers:
  accesstoken: [BEARER_TOKEN_FROM_STEP_1]
  authorization: Bearer [BEARER_TOKEN_FROM_STEP_1]
Body:
  {
    "username": "your_username",
    "password": "your_password"
  }
```

### Step 3: Fetch Account Data
```http
GET /customer/account-details
Headers:
  accesstoken: [BEARER_TOKEN]
  authorization: Bearer [BEARER_TOKEN]
```

## Adding DPDC Account to Bill Barta

Once you have all three pieces of information:

### Via Web Interface
1. Go to **Account Management** page
2. Click **Add** button in the DPDC section
3. Fill in the form:
   - **Username**: Your DPDC username
   - **Password**: Your DPDC password
   - **Client Secret**: The secret you found above
4. Click **Add** to save

### Via API
```bash
curl -X POST http://localhost:3000/api/v1/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "DPDC",
    "credentials": {
      "username": "your_dpdc_username",
      "password": "your_dpdc_password",
      "clientSecret": "0yFsAl4nN9jX1GGkgOrvpUxDarf2DT40"
    }
  }'
```

## Troubleshooting DPDC Issues

### Common Error Messages

#### "Client Secret is required for DPDC"
- **Cause**: Missing or empty client secret
- **Solution**: Ensure client secret is provided and not empty

#### "Failed to generate bearer token"
- **Cause**: Invalid client secret or DPDC API changes
- **Solution**: Re-extract client secret from browser, check for DPDC website updates

#### "Invalid credentials"
- **Cause**: Wrong username/password combination
- **Solution**: Verify credentials by logging into DPDC website manually

#### "Network timeout" or "Connection refused"
- **Cause**: DPDC servers are down or blocking requests
- **Solution**: Wait and retry, check DPDC website availability

### Debugging Steps

1. **Verify Client Secret**
   ```bash
   # Test bearer token generation
   curl -X POST https://amiapp.dpdc.org.bd/auth/login/generate-bearer \
     -H "clientid: auth-ui" \
     -H "clientsecret: YOUR_CLIENT_SECRET" \
     -H "tenantcode: DPDC" \
     -d "{}"
   ```

2. **Check Account Status**
   - Verify account is active on DPDC website
   - Ensure no pending payments or issues

3. **Monitor Server Logs**
   ```bash
   # Check Bill Barta server logs
   docker logs bill-barta-server
   ```

## Client Secret Updates

The DPDC client secret may change when:
- DPDC updates their website/API
- Security patches are applied
- Authentication system is upgraded

### Signs of Outdated Client Secret
- Sudden authentication failures
- "Invalid client" error messages
- Bearer token generation fails

### Updating Client Secret
1. Extract new client secret using the methods above
2. Update the account in Bill Barta:
   - Via web interface: Edit the account and update client secret
   - Via API: Use PUT request to update credentials

## Security Considerations

### Client Secret Security
- **Never share** your client secret publicly
- **Don't commit** client secrets to version control
- **Rotate regularly** if you suspect compromise

### Account Security  
- Use strong, unique passwords for DPDC accounts
- Enable two-factor authentication if available
- Monitor account activity regularly

## Alternative Methods

If the browser method doesn't work:

### Mobile App Inspection
- Use tools like Charles Proxy or Wireshark
- Monitor DPDC mobile app network traffic
- Extract client secret from app requests

### Community Resources
- Check Bill Barta GitHub issues for updated client secrets
- Community may share working client secrets
- Join developer forums for DPDC integration

## API Reference

### DPDC Constants
Based on the codebase, DPDC uses these constants:

```typescript
const DPDC = {
    BASE_URL: 'https://amiapp.dpdc.org.bd',
    BEARER_ENDPOINT: '/auth/login/generate-bearer',
    LOGIN_ENDPOINT: '/auth/login',
    CLIENT_ID: 'auth-ui',
    TENANT_CODE: 'DPDC',
    ACCEPT_LANGUAGE: 'en-GB,en;q=0.9'
};
```

### Required Headers
```typescript
const headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-GB,en;q=0.9',
    'content-type': 'application/json;charset=UTF-8',
    'clientid': 'auth-ui',
    'clientsecret': '[YOUR_CLIENT_SECRET]',
    'tenantcode': 'DPDC'
};
```

This information should help you successfully set up DPDC accounts in Bill Barta. If you encounter issues, check the server logs and ensure your client secret is current.