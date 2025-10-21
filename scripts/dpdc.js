// ========================================
// CONFIGURATION - Edit these values
// ========================================

// Load environment variables
require("dotenv").config();

const CONFIG = {
  // API Endpoints
  BASE_URL: "https://amiapp.dpdc.org.bd",
  BEARER_ENDPOINT: "/auth/login/generate-bearer",
  LOGIN_ENDPOINT: "/auth/login",

  // Authentication - Load from environment variables
  CLIENT_ID: "auth-ui",
  CLIENT_SECRET: process.env.DPDC_CLIENT_SECRET || "",
  TENANT_CODE: "DPDC",

  // Multiple credentials array - Load from environment or use empty array
  CREDENTIALS:
    process.env.DPDC_USERNAME && process.env.DPDC_PASSWORD
      ? [
          {
            username: process.env.DPDC_USERNAME,
            password: process.env.DPDC_PASSWORD,
          },
        ]
      : [],

  // Retry Configuration
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 2000, // 2 seconds between retries

  // Headers
  ACCEPT_LANGUAGE: "en-GB,en;q=0.9",
  COOKIE:
    process.env.DPDC_COOKIE ||
    "rzp_unified_session_id=RViLbC9A00WRBA; i18next=en",
  USER_AGENT: {
    "sec-ch-ua":
      '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
  },
};

// ========================================
// API SERVICE - Data Fetching Layer
// ========================================

/**
 * Sleep/delay utility function
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random Rzp cookie string of length 14 and format it
 * @param {number} length - Length of the random string
 * @returns {string} Random Rzp cookie string
 */
function genRzpCookieString(length = 14) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let id = "";
  for (let i = 0; i < length; i++) id += chars[bytes[i] % chars.length];
  return `rzp_unified_session_id=${id}; i18next=en`;
}

/**
 * Generate bearer token from the API
 * @returns {Promise<string>} Access token
 */
async function generateBearerToken() {
  console.log("=== Generating Bearer Token ===\n");

  const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.BEARER_ENDPOINT}`, {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": CONFIG.ACCEPT_LANGUAGE,
      clientid: CONFIG.CLIENT_ID,
      clientsecret: CONFIG.CLIENT_SECRET,
      "content-type": "application/json;charset=UTF-8",
      ...CONFIG.USER_AGENT,
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      tenantcode: CONFIG.TENANT_CODE,
      cookie: genRzpCookieString(),
      Referer: `${CONFIG.BASE_URL}/login/`,
    },
    body: "{}",
    method: "POST",
  });

  console.log(
    "Bearer Generation Status:",
    response.status,
    response.statusText
  );

  const data = await response.json();
  const accessToken = data.access_token;

  if (!accessToken) {
    throw new Error("No access_token found in bearer response");
  }

  console.log("✓ Access Token generated successfully\n");
  return accessToken;
}

/**
 * Login and fetch account data using access token
 * @param {string} accessToken - Bearer token
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} Login response data
 */
async function fetchAccountData(accessToken, username, password) {
  console.log("=== Fetching Account Data ===\n");

  const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.LOGIN_ENDPOINT}`, {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": CONFIG.ACCEPT_LANGUAGE,
      accesstoken: accessToken,
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json;charset=UTF-8",
      ...CONFIG.USER_AGENT,
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      tenantcode: CONFIG.TENANT_CODE,
      cookie: CONFIG.COOKIE,
      Referer: `${CONFIG.BASE_URL}/login/`,
    },
    body: JSON.stringify({ userName: username, password: password }),
    method: "POST",
  });

  console.log("Login Status:", response.status, response.statusText);

  const data = await response.json();

  if (!data || Object.keys(data).length === 0) {
    throw new Error("Empty response received. Login failed.");
  }

  console.log("✓ Account data fetched successfully\n");
  return data;
}

// ========================================
// DATA PARSER - Data Transformation Layer
// ========================================

/**
 * Extract mobile number from person details
 * @param {Object} personDetails - Person contact information
 * @returns {string} Mobile number
 */
function extractMobileNumber(personDetails) {
  if (!personDetails?.personContactDetail) {
    return "";
  }

  const tenantMobile = personDetails.personContactDetail.find(
    (contact) => contact.personContactType === "TENANT-MOBILENO"
  );

  return tenantMobile?.contactDetailValue || "";
}

/**
 * Parse a single account into PostBalanceDetails format
 * @param {Object} accountDetails - Raw account data
 * @param {Object} personDetails - Person information
 * @param {string} provider - Provider name
 * @returns {Object} Formatted account details
 */
function parseSingleAccount(accountDetails, personDetails, provider) {
  const saDetails = accountDetails?.accountSaList?.[0];
  const prepaidDetails = saDetails?.prepaidSaDetail;
  const premiseDetails =
    accountDetails?.accountPersonDetail?.accountPremiseDetailList;

  return {
    accountId: accountDetails?.accountId || "",
    customerNumber: accountDetails?.customerNumber || "",
    customerName: accountDetails?.customerName || "",
    customerClass: accountDetails?.customerClassDesc || "",
    mobileNumber: extractMobileNumber(personDetails),
    emailId: "", // Not available in API response
    accountType: saDetails?.saTypeDesc || "",
    balanceRemaining:
      prepaidDetails?.prepaidBalance || accountDetails?.currentBalance || "",
    connectionStatus:
      saDetails?.saStatus === "20" ? "Active" : saDetails?.saStatus || "",
    customerType: accountDetails?.customerClassCd || null,
    minRecharge: accountDetails?.minAmtTopay || null,
    balanceLatestDate: saDetails?.balanceLatestDate || "",
    lastPayAmtOnSa:
      prepaidDetails?.lastPayAmtOnSa || accountDetails?.lastPaymentAmount || "",
    lastPayDateOnSa:
      prepaidDetails?.lastPayDateOnSa || accountDetails?.lastPaymentDate || "",
    flatNameOrLocation:
      premiseDetails?.address1 || accountDetails?.mailingAddress || "",
    provider: provider,
  };
}

/**
 * Parse raw login data into structured account list
 * @param {Object} rawData - Raw API response
 * @returns {Array<Object>} Array of parsed account details
 */
function parseAccountList(rawData) {
  const personAccountList =
    rawData?.accountDetails?.accountSummary?.personAcccountDetail
      ?.personAccountList;
  const personDetails =
    rawData?.accountDetails?.accountSummary?.personDetailList?.["C1-Person"];

  if (!personAccountList || !Array.isArray(personAccountList)) {
    return [];
  }

  return personAccountList.map((account) =>
    parseSingleAccount(account, personDetails, CONFIG.TENANT_CODE)
  );
}

// ========================================
// TABLE FORMATTER - Data Formatting Layer
// ========================================

/**
 * Format account data for summary table display
 * @param {Array<Object>} accountList - List of account details
 * @returns {Array<Object>} Formatted data for console.table
 */
function formatForSummaryTable(accountList) {
  return accountList.map((data, index) => ({
    "#": index + 1,
    "Account ID": data.accountId || "-",
    "Customer #": data.customerNumber || "-",
    "Customer Name": data.customerName || "-",
    "Customer Class": data.customerClass || "-",
    "Mobile Number": data.mobileNumber || "-",
    "Account Type": data.accountType || "-",
    Balance: data.balanceRemaining || "-",
    Status: data.connectionStatus || "-",
    "Min Recharge": data.minRecharge || "-",
    "Last Payment": data.lastPayAmtOnSa || "-",
    "Payment Date": data.lastPayDateOnSa || "-",
    Location: (data.flatNameOrLocation || "-").substring(0, 40),
  }));
}

/**
 * Format account data for detailed view
 * @param {Object} data - Single account details
 * @returns {Object} Formatted account data
 */
function formatForDetailedView(data) {
  return {
    "Account ID": data.accountId || "-",
    "Customer Number": data.customerNumber || "-",
    "Customer Name": data.customerName || "-",
    "Customer Class": data.customerClass || "-",
    "Mobile Number": data.mobileNumber || "-",
    "Email ID": data.emailId || "-",
    "Account Type": data.accountType || "-",
    "Balance Remaining": data.balanceRemaining || "-",
    "Connection Status": data.connectionStatus || "-",
    "Customer Type": data.customerType || "-",
    "Min Recharge": data.minRecharge || "-",
    "Balance Latest Date": data.balanceLatestDate || "-",
    "Last Payment Amount": data.lastPayAmtOnSa || "-",
    "Last Payment Date": data.lastPayDateOnSa || "-",
    "Flat Name / Location": data.flatNameOrLocation || "-",
    Provider: data.provider || "-",
  };
}

// ========================================
// TABLE GENERATOR - Display Layer
// ========================================

/**
 * Generate and display summary table
 * @param {Array<Object>} accountList - List of account details
 */
function generateSummaryTable(accountList) {
  if (!accountList || accountList.length === 0) {
    console.log("\n⚠️  No account data to display.");
    return;
  }

  console.log("\n" + "=".repeat(100));
  console.log(
    `ACCOUNT BALANCE SUMMARY - Total Accounts: ${accountList.length}`
  );
  console.log("=".repeat(100) + "\n");

  const formattedData = formatForSummaryTable(accountList);
  console.table(formattedData);
}

/**
 * Generate and display detailed view for all accounts
 * @param {Array<Object>} accountList - List of account details
 */
function generateDetailedTable(accountList) {
  if (!accountList || accountList.length === 0) {
    return;
  }

  console.log("\n" + "=".repeat(100));
  console.log("DETAILED ACCOUNT INFORMATION");
  console.log("=".repeat(100));

  accountList.forEach((account, index) => {
    console.log(`\n[${index + 1}] ACCOUNT DETAILS:`);
    console.log("-".repeat(100));

    const formattedAccount = formatForDetailedView(account);
    Object.entries(formattedAccount).forEach(([key, value]) => {
      console.log(`${key.padEnd(25)} : ${value}`);
    });

    console.log("-".repeat(100));
  });

  console.log("\n" + "=".repeat(100) + "\n");
}

/**
 * Generate and display all tables (summary + detailed)
 * @param {Array<Object>} accountList - List of account details
 */
function generateTables(accountList) {
  generateSummaryTable(accountList);
  generateDetailedTable(accountList);
}

// ========================================
// MAIN ORCHESTRATOR
// ========================================

// ========================================
// MAIN ORCHESTRATOR
// ========================================

/**
 * Main function to get and display DPDC bill information for a single user
 * Orchestrates: Data Fetching → Parsing → Formatting → Display
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @param {number} retryCount - Current retry attempt (internal use)
 * @returns {Promise<Object>} Result object with success status and data
 */
async function getDPDCBillInfo(
  username = CONFIG.USERNAME,
  password = CONFIG.PASSWORD,
  retryCount = 0
) {
  const attemptNumber = retryCount + 1;
  const maxAttempts = CONFIG.MAX_RETRY_ATTEMPTS;

  try {
    console.log(`\n${"=".repeat(100)}`);
    console.log(
      `Processing account: ${username} (Attempt ${attemptNumber}/${maxAttempts})`
    );
    console.log("=".repeat(100));

    // Step 1: Generate bearer token (Data Fetching)
    const accessToken = await generateBearerToken();

    // Step 2: Fetch account data (Data Fetching)
    const rawData = await fetchAccountData(accessToken, username, password);

    // Step 3: Parse raw data into structured format (Data Parsing)
    const accountList = parseAccountList(rawData);

    // Check if we got valid data
    if (accountList.length === 0) {
      throw new Error("No account information found in response");
    }

    // Step 4: Display results
    console.log(`✓ Found ${accountList.length} account(s) for ${username}\n`);

    // Show customer numbers
    const customerNumbers = accountList
      .map((acc) => acc.customerNumber)
      .filter(Boolean);
    if (customerNumbers.length > 0) {
      console.log(`Customer Numbers: ${customerNumbers.join(", ")}\n`);
    }

    return {
      success: true,
      accounts: accountList,
      rawData,
      username,
      attempts: attemptNumber,
    };
  } catch (error) {
    console.error(
      `\n❌ Error for ${username} (Attempt ${attemptNumber}/${maxAttempts}):`,
      error.message
    );

    // Retry logic
    if (retryCount < maxAttempts - 1) {
      const retryDelay = CONFIG.RETRY_DELAY_MS;
      console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...\n`);
      await sleep(retryDelay);

      // Recursive retry
      return getDPDCBillInfo(username, password, retryCount + 1);
    } else {
      console.error(`\n✗ All ${maxAttempts} attempts failed for ${username}\n`);
      return {
        success: false,
        error: error.message,
        username,
        accounts: [],
        attempts: maxAttempts,
      };
    }
  }
}

/**
 * Process multiple credentials and collect all account data
 * @param {Array<Object>} credentials - Array of {username, password} objects
 * @returns {Promise<Object>} Combined results
 */
async function getDPDCBillInfoMultiple(credentials = CONFIG.CREDENTIALS) {
  console.log("\n" + "╔".repeat(100));
  console.log(`PROCESSING ${credentials.length} CREDENTIAL(S)`);
  console.log("╚".repeat(100));

  const allAccounts = [];
  const results = [];
  const failedLogins = [];

  // Process each credential
  for (let i = 0; i < credentials.length; i++) {
    const { username, password } = credentials[i];
    console.log(`\n[${i + 1}/${credentials.length}] Processing: ${username}`);

    const result = await getDPDCBillInfo(username, password);
    results.push(result);

    if (result.success) {
      // Add all accounts from this login
      allAccounts.push(...result.accounts);
      console.log(
        `✓ Successfully processed ${username} - ${result.accounts.length} account(s) added (${result.attempts} attempt(s))`
      );
    } else {
      // Track failed login
      failedLogins.push({
        username,
        error: result.error,
        attempts: result.attempts,
      });
      console.log(
        `✗ Failed to process ${username} after ${result.attempts} attempt(s)`
      );
    }

    // Add a small delay between requests to avoid rate limiting
    if (i < credentials.length - 1) {
      console.log("\nWaiting 2 seconds before next request...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Display summary
  console.log("\n" + "=".repeat(100));
  console.log("PROCESSING SUMMARY");
  console.log("=".repeat(100));
  console.log(`Total credentials processed: ${credentials.length}`);
  console.log(`Successful logins: ${credentials.length - failedLogins.length}`);
  console.log(`Failed logins: ${failedLogins.length}`);
  console.log(`Total accounts found: ${allAccounts.length}`);

  if (failedLogins.length > 0) {
    console.log("\n⚠️  FAILED LOGINS:");
    failedLogins.forEach((failed, index) => {
      console.log(`  ${index + 1}. Username: ${failed.username}`);
      console.log(`     Error: ${failed.error}`);
      console.log(
        `     Attempts: ${failed.attempts}/${CONFIG.MAX_RETRY_ATTEMPTS}`
      );
    });
  }

  // Display all accounts in tables
  if (allAccounts.length > 0) {
    console.log("\n" + "=".repeat(100));
    console.log("GENERATING COMBINED TABLES FOR ALL ACCOUNTS");
    console.log("=".repeat(100));
    generateTables(allAccounts);
  } else {
    console.log("\n⚠️  No accounts to display.");
  }

  return {
    totalCredentials: credentials.length,
    successfulLogins: credentials.length - failedLogins.length,
    failedLogins,
    totalAccounts: allAccounts.length,
    accounts: allAccounts,
    results,
  };
}

// ========================================
// EXECUTE
// ========================================

// Option 1: Process multiple credentials from CONFIG.CREDENTIALS
getDPDCBillInfoMultiple();
