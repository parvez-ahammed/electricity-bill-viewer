// Load environment variables
require("dotenv").config();
const cheerio = require("cheerio");

const CONFIG = {
  BASE_URL: "https://customer.nesco.gov.bd",
  PANEL_ENDPOINT: "/pre/panel",
  CUSTOMER_NUMBER: process.env.NESCO_CUSTOMER_NUMBER || "",
};

/**
 * Ultra-simple NESCO data extractor
 */
class SimpleNESCOExtractor {
  constructor() {
    this.agent = null;
  }

  async fetchData() {
    // Setup HTTPS agent
    const https = require("https");
    this.agent = new https.Agent({ rejectUnauthorized: false });

    // Get initial page for CSRF token
    const initResponse = await fetch(`${CONFIG.BASE_URL}${CONFIG.PANEL_ENDPOINT}`, {
      agent: this.agent,
      headers: this.getHeaders(),
    });

    // Extract cookies and CSRF token
    const cookies = this.extractCookies(initResponse);
    const csrfToken = this.extractCSRFToken(await initResponse.text());

    // Fetch account data
    const dataResponse = await fetch(`${CONFIG.BASE_URL}${CONFIG.PANEL_ENDPOINT}`, {
      agent: this.agent,
      method: "POST",
      headers: {
        ...this.getHeaders(),
        "content-type": "application/x-www-form-urlencoded",
        cookie: cookies,
        Referer: `${CONFIG.BASE_URL}${CONFIG.PANEL_ENDPOINT}`,
        Origin: CONFIG.BASE_URL,
      },
      body: `_token=${csrfToken}&cust_no=${CONFIG.CUSTOMER_NUMBER}&submit=রিচার্জ+হিস্ট্রি`,
    });

    return dataResponse.text();
  }

  extractCookies(response) {
    const setCookieHeaders = response.headers.getSetCookie?.() || [];
    const cookiePairs = [];

    setCookieHeaders.forEach(cookie => {
      if (cookie.startsWith("XSRF-TOKEN=")) {
        const token = cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
        if (token) cookiePairs.push(`XSRF-TOKEN=${token}`);
      } else if (cookie.startsWith("customer_service_portal_session=")) {
        const session = cookie.match(/customer_service_portal_session=([^;]+)/)?.[1];
        if (session) cookiePairs.push(`customer_service_portal_session=${session}`);
      }
    });

    return cookiePairs.join("; ");
  }

  extractCSRFToken(html) {
    const $ = cheerio.load(html);
    return $('input[name="_token"]').attr('value') ||
      $('meta[name="csrf-token"]').attr('content') || "";
  }

  parseAccountData(html) {
    const $ = cheerio.load(html);
    const data = {
      provider: "NESCO",
      accountType: "Prepaid",
      rawData: { inputValues: [], rechargeHistory: [] }
    };

    // Extract all disabled input values in order
    const inputValues = [];
    $('input[disabled]').each((_, el) => {
      const value = $(el).attr('value')?.trim();
      if (value) {
        inputValues.push(value);
      }
    });

    // Based on the HTML structure, map values by position
    // Position 0: Customer Name (IRIN PARVIN)
    // Position 1: Father/Husband Name (empty)
    // Position 2: Address (SARDAR PARA) 
    // Position 3: Mobile (+880 173*****35)
    // Position 4: Office (Rangpur S&D-4)
    // Position 5: Feeder (Co Bazar Feeder)
    // Position 6: Consumer Number (19900128)
    // Position 7: Meter Number (31041055913)
    // Position 8: Authorized Load (3)
    // Position 9: Tariff (LT-A)
    // Position 10: Meter Type (Single-Phase Meter)
    // Position 11: Meter Status (Active)
    // Position 12: Installation Date (20-Jan-2025 5:05 PM)
    // Position 13: Min Recharge (53.00)
    // Position 14: Balance (94.790)

    if (inputValues.length >= 14) {
      data.customerName = inputValues[0];
      data.location = inputValues[1];
      data.mobileNumber = inputValues[2];
      data.customerNumber = inputValues[5];
      data.accountId = inputValues[6];
      data.connectionStatus = inputValues[10];
      data.minRecharge = inputValues[12];
      data.balanceRemaining = inputValues[13];
    }

    // Extract balance date from the label text
    const balanceLabel = $('label:contains("অবশিষ্ট ব্যালেন্স")').text();
    const timeMatch = balanceLabel.match(/(\d{1,2}\s+\w+\s+\d{4}\s+\d{1,2}:\d{2}:\d{2}\s+(?:AM|PM))/i);
    if (timeMatch) {
      data.balanceLatestDate = this.formatDate(timeMatch[1]);
    }

    // Extract recharge history
    $('tbody.text-center tr').each((_, row) => {
      const $row = $(row);
      const cells = $row.find('td');

      if (cells.length >= 14) {
        const recharge = {
          serial: $(cells[0]).text().trim(),
          tokenNumber: $(cells[2]).text().trim(),
          amount: $(cells[10]).text().trim(),
          media: $(cells[12]).text().trim(),
          date: $(cells[13]).text().trim(),
          status: cells[14] ? $(cells[14]).text().trim() : "",
        };

        if (recharge.date && recharge.amount) {
          data.rawData.rechargeHistory.push(recharge);
        }
      }
    });

    // Set last payment info from first recharge record
    if (data.rawData.rechargeHistory.length > 0) {
      const firstRecharge = data.rawData.rechargeHistory[0];
      data.lastPaymentAmount = firstRecharge.amount;
      data.lastPaymentDate = this.formatPaymentDate(firstRecharge.date);
    }

    data.rawData.inputValues = inputValues;
    return data;
  }

  formatDate(dateString) {
    try {
      const match = dateString.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
      if (match) {
        const [, day, month, year] = match;
        const monthMap = {
          'January': '01', 'February': '02', 'March': '03', 'April': '04',
          'May': '05', 'June': '06', 'July': '07', 'August': '08',
          'September': '09', 'October': '10', 'November': '11', 'December': '12'
        };
        const monthNum = monthMap[month] || '01';
        return `${year}-${monthNum}-${day.padStart(2, '0')}`;
      }
    } catch (e) {
      console.warn('Date formatting failed:', e.message);
    }
    return dateString;
  }

  formatPaymentDate(dateString) {
    try {
      const match = dateString.match(/(\d{1,2})-([A-Z]{3})-(\d{4})/);
      if (match) {
        const [, day, month, year] = match;
        const monthMap = {
          'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
          'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
          'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
        };
        const monthNum = monthMap[month] || '01';
        return `${year}-${monthNum}-${day.padStart(2, '0')}`;
      }
    } catch (e) {
      console.warn('Payment date formatting failed:', e.message);
    }
    return dateString;
  }

  getHeaders() {
    return {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-GB,en;q=0.9",
      "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
    };
  }
}

async function main() {
  try {
    console.log("⚡ NESCO Ultra-Simple Extractor\n");

    const extractor = new SimpleNESCOExtractor();

    console.log("📡 Fetching data...");
    const html = await extractor.fetchData();
    console.log("✅ Data fetched\n");

    console.log("🔍 Parsing data...");
    const accountData = extractor.parseAccountData(html);
    console.log("✅ Data parsed\n");

    // Display results
    console.log("📋 ACCOUNT INFORMATION:");
    console.log("━".repeat(60));
    console.log(`Customer Name    : ${accountData.customerName || 'N/A'}`);
    console.log(`Account ID       : ${accountData.accountId || 'N/A'}`);
    console.log(`Customer Number  : ${accountData.customerNumber || 'N/A'}`);
    console.log(`Balance          : ${accountData.balanceRemaining || 'N/A'} Tk`);
    console.log(`Balance Date     : ${accountData.balanceLatestDate || 'N/A'}`);
    console.log(`Status           : ${accountData.connectionStatus || 'N/A'}`);
    console.log(`Location         : ${accountData.location || 'N/A'}`);
    console.log(`Mobile           : ${accountData.mobileNumber || 'N/A'}`);
    console.log(`Min Recharge     : ${accountData.minRecharge || 'N/A'} Tk`);
    console.log(`Last Payment     : ${accountData.lastPaymentAmount || 'N/A'} Tk`);
    console.log(`Last Payment Date: ${accountData.lastPaymentDate || 'N/A'}`);
    console.log(`Recharge Records : ${accountData.rawData.rechargeHistory.length}`);
    console.log("━".repeat(60));

    console.log("\n📄 CLEAN JSON:");
    const cleanOutput = {
      provider: accountData.provider,
      accountType: accountData.accountType,
      customerName: accountData.customerName,
      customerNumber: accountData.customerNumber,
      accountId: accountData.accountId,
      location: accountData.location,
      mobileNumber: accountData.mobileNumber,
      connectionStatus: accountData.connectionStatus,
      balanceRemaining: accountData.balanceRemaining,
      balanceLatestDate: accountData.balanceLatestDate,
      minRecharge: accountData.minRecharge,
      lastPaymentAmount: accountData.lastPaymentAmount,
      lastPaymentDate: accountData.lastPaymentDate,
      rechargeHistoryCount: accountData.rawData.rechargeHistory.length
    };
    console.log(JSON.stringify(cleanOutput, null, 2));

    console.log("\n🔍 DEBUG - All Input Values:");
    accountData.rawData.inputValues.forEach((value, index) => {
      console.log(`[${index}]: ${value}`);
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  }
}

if (require.main === module) {
  main();
}

module.exports = { SimpleNESCOExtractor };