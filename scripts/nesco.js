// Load environment variables
require("dotenv").config();

const CONFIG = {
  BASE_URL: "https://customer.nesco.gov.bd",
  LOGIN_ENDPOINT: "/login",
  PANEL_ENDPOINT: "/pre/panel",

  CUSTOMER_NUMBER: process.env.NESCO_CUSTOMER_NUMBER || "",
  COOKIE: process.env.NESCO_COOKIE || "",
  CSRF_TOKEN:
    process.env.NESCO_CSRF_TOKEN || "Wp7NzYo20wDFBwgymW4RWkeSDjKbx525qScf1gnE",
};

async function fetchNESCOData(customerNumber, csrfToken) {
  console.log("=== Fetching NESCO Data ===\n");
  console.log(`Customer Number: ${customerNumber}`);
  console.log(`CSRF Token: ${csrfToken}\n`);

  const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.PANEL_ENDPOINT}`, {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      priority: "u=0, i",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      cookie: CONFIG.COOKIE,
      Referer: `${CONFIG.BASE_URL}${CONFIG.PANEL_ENDPOINT}`,
    },
    body: `_token=${csrfToken}&cust_no=${customerNumber}&submit=%E0%A6%B0%E0%A6%BF%E0%A6%9A%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%9C+%E0%A6%B9%E0%A6%BF%E0%A6%B8%E0%A7%8D%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A6%BF`,
    method: "POST",
  });

  console.log("Response Status:", response.status, response.statusText);
  console.log("Response Headers:");
  for (const [key, value] of response.headers.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  console.log("\n");

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const jsonData = await response.json();
    console.log("=== JSON Response ===");
    console.log(JSON.stringify(jsonData, null, 2));
    return jsonData;
  } else if (contentType?.includes("text/html")) {
    const htmlData = await response.text();
    console.log("=== HTML Response (First 2000 chars) ===");
    console.log(htmlData.substring(0, 2000));
    console.log("\n=== HTML Response Length ===");
    console.log(`Total Length: ${htmlData.length} characters`);

    const fs = require("fs");
    fs.writeFileSync("nesco_response.html", htmlData, "utf-8");
    console.log("\n✓ Full HTML saved to: nesco_response.html");

    analyzeHTML(htmlData);
    return htmlData;
  } else {
    const textData = await response.text();
    console.log("=== Text Response ===");
    console.log(textData);
    return textData;
  }
}

function extractAccountData(html) {
  const accountData = {
    accountId: "",
    customerNumber: "",
    customerName: "",
    provider: "NESCO",
    accountType: "Prepaid",
    balanceRemaining: "",
    connectionStatus: "",
    lastPaymentAmount: "",
    lastPaymentDate: "",
    balanceLatestDate: "",
    location: "",
    mobileNumber: "",
    minRecharge: null,
    rawData: {
      consumerNumber: "",
      meterNumber: "",
      email: "",
      rechargeHistory: [],
    },
  };

  // Helper function to format date from "20 October 2025 12:00:00 AM" to "2025-10-20"
  const formatDateToStandard = (dateString) => {
    try {
      const cleanDate = dateString.trim();
      const datePattern =
        /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)/i;
      const match = cleanDate.match(datePattern);

      if (match) {
        const [, day, month, year] = match;

        const monthMap = {
          january: "01",
          february: "02",
          march: "03",
          april: "04",
          may: "05",
          june: "06",
          july: "07",
          august: "08",
          september: "09",
          october: "10",
          november: "11",
          december: "12",
        };

        const monthNum =
          monthMap[month.toLowerCase()] ||
          new Date(`${month} 1, 2000`).getMonth() + 1;
        const paddedMonth =
          typeof monthNum === "string"
            ? monthNum
            : monthNum.toString().padStart(2, "0");
        const paddedDay = day.padStart(2, "0");

        return `${year}-${paddedMonth}-${paddedDay}`;
      }

      return cleanDate;
    } catch {
      return dateString;
    }
  };

  // Helper function to format payment date from "01-OCT-2025 2:01 PM" to "2025-10-01"
  const formatPaymentDateToStandard = (dateString) => {
    try {
      const cleanDate = dateString.trim();
      const datePattern =
        /(\d{1,2})-([A-Z]{3})-(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)/i;
      const match = cleanDate.match(datePattern);

      if (match) {
        const [, day, month, year] = match;

        const monthMap = {
          jan: "01",
          feb: "02",
          mar: "03",
          apr: "04",
          may: "05",
          jun: "06",
          jul: "07",
          aug: "08",
          sep: "09",
          oct: "10",
          nov: "11",
          dec: "12",
        };

        const monthNum = monthMap[month.toLowerCase()] || "01";
        const paddedDay = day.padStart(2, "0");

        return `${year}-${monthNum}-${paddedDay}`;
      }

      return cleanDate;
    } catch {
      return dateString;
    }
  };

  // Extract data by finding all disabled input fields and analyzing their values
  // This approach works regardless of language (English/Bangla)

  const allInputs = html.match(/<input[^>]*>/gi) || [];
  const disabledInputs = allInputs.filter(input => input.includes('disabled'));

  const extractedValues = [];
  disabledInputs.forEach(input => {
    const valueMatch = input.match(/value="([^"]*)"/i);
    if (valueMatch && valueMatch[1].trim()) {
      extractedValues.push(valueMatch[1].trim());
    }
  });

  // Filter out empty values and analyze patterns
  const cleanValues = extractedValues.filter(val => val && val.length > 0);

  // Extract customer name (typically the first text value that's not a number)
  const nameCandidate = cleanValues.find(val =>
    /^[A-Z\s]+$/.test(val) && val.length > 3 && !val.includes('PARA') && !val.includes('ROAD') && !val.includes('BAZAR')
  );
  if (nameCandidate) {
    accountData.customerName = nameCandidate;
  }

  // Extract address (look for location patterns)
  const addressCandidate = cleanValues.find(val =>
    /^[A-Z\s]+(PARA|ROAD|STREET|BAZAR|MARKET|WARD)/.test(val) ||
    (val.includes('SARDAR') && val.includes('PARA'))
  );
  if (addressCandidate) {
    accountData.location = addressCandidate;
  }

  // Extract mobile number (look for phone patterns)
  const mobileCandidate = cleanValues.find(val =>
    /^\+880\s*\d+\*+\d+$/.test(val) || /^\d{11}$/.test(val) || /^\+\d+\s*\d+\*+\d+$/.test(val)
  );
  if (mobileCandidate) {
    accountData.mobileNumber = mobileCandidate;
  }

  // Extract consumer number (should match the input customer number)
  const consumerCandidate = cleanValues.find(val =>
    val === CONFIG.CUSTOMER_NUMBER.trim() || val.replace(/\s/g, '') === CONFIG.CUSTOMER_NUMBER.replace(/\s/g, '')
  );
  if (consumerCandidate) {
    accountData.customerNumber = consumerCandidate;
    accountData.rawData.consumerNumber = consumerCandidate;
  }

  // Extract meter number (long numeric string, different from consumer number)
  const meterCandidate = cleanValues.find(val =>
    /^\d{10,}$/.test(val) && val !== accountData.customerNumber
  );
  if (meterCandidate) {
    accountData.accountId = meterCandidate;
    accountData.rawData.meterNumber = meterCandidate;
  }

  // Extract connection status
  const statusCandidate = cleanValues.find(val =>
    /^(Active|Inactive|Connected|Disconnected)$/i.test(val)
  );
  if (statusCandidate) {
    accountData.connectionStatus = statusCandidate;
  }

  // Extract numeric values for min recharge and balance
  const numericValues = cleanValues.filter(val => /^\d+\.?\d*$/.test(val)).map(val => parseFloat(val));

  // Min recharge is typically a smaller value (under 1000)
  const minRechargeCandidate = numericValues.find(val => val > 0 && val < 1000);
  if (minRechargeCandidate) {
    accountData.minRecharge = minRechargeCandidate.toString();
  }

  // Balance is typically a larger decimal value
  const balanceCandidate = numericValues.find(val => val > 0 && val.toString().includes('.'));
  if (balanceCandidate) {
    accountData.balanceRemaining = balanceCandidate.toString();
  }

  // Extract balance timestamp
  const balanceTimeMatch = html.match(/<span>\s*([\d\s\w:]+)\s*<\/span>\)/i);
  if (balanceTimeMatch) {
    const rawDate = balanceTimeMatch[1].trim();
    accountData.balanceLatestDate = formatDateToStandard(rawDate);
  }

  // Fallback for connection status
  if (!accountData.connectionStatus) {
    accountData.connectionStatus = accountData.balanceRemaining && parseFloat(accountData.balanceRemaining) > 0
      ? "Active"
      : "Unknown";
  }

  const tableMatch = html.match(
    /<tbody[^>]*class="[^"]*text-center[^"]*"[^>]*>([\s\S]*?)<\/tbody>/i
  );
  if (tableMatch) {
    const rowMatches = tableMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    if (rowMatches && rowMatches.length > 0) {
      for (let i = 0; i < rowMatches.length; i++) {
        const cellMatches = rowMatches[i].match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
        if (cellMatches && cellMatches.length >= 14) {
          const cleanCell = (cell) => cell.replace(/<[^>]*>/g, "").trim();

          const recharge = {
            serial: cleanCell(cellMatches[0]),
            seqNo: cleanCell(cellMatches[1]),
            tokenNumber: cleanCell(cellMatches[2]),
            meterRent: cleanCell(cellMatches[3]),
            demandCharge: cleanCell(cellMatches[4]),
            pfcCharge: cleanCell(cellMatches[5]),
            vat: cleanCell(cellMatches[6]),
            paidDebt: cleanCell(cellMatches[7]),
            rebate: cleanCell(cellMatches[8]),
            energyAmount: cleanCell(cellMatches[9]),
            rechargeAmount: cleanCell(cellMatches[10]),
            estimatedUnit: cleanCell(cellMatches[11]),
            rechargeMedia: cleanCell(cellMatches[12]),
            rechargeDate: cleanCell(cellMatches[13]),
            status: cellMatches[14] ? cleanCell(cellMatches[14]) : "",
          };

          if (recharge.rechargeDate && recharge.rechargeAmount) {
            accountData.rawData.rechargeHistory.push(recharge);
            if (i === 0) {
              accountData.lastPaymentDate = formatPaymentDateToStandard(
                recharge.rechargeDate
              );
              accountData.lastPaymentAmount = recharge.rechargeAmount;
            }
          }
        }
      }
    }
  }

  return accountData;
}

function analyzeHTML(html) {
  console.log("\n=== HTML Analysis ===");

  const accountData = extractAccountData(html);

  console.log("\n📊 EXTRACTED ACCOUNT DATA (ProviderAccountDetails Format):");
  console.log("━".repeat(80));
  console.log(`Account ID           : ${accountData.accountId || "N/A"}`);
  console.log(`Customer Number      : ${accountData.customerNumber || "N/A"}`);
  console.log(`Customer Name        : ${accountData.customerName || "N/A"}`);
  console.log(`Provider             : ${accountData.provider}`);
  console.log(`Account Type         : ${accountData.accountType}`);
  console.log(
    `💰 Balance Remaining : ${accountData.balanceRemaining || "N/A"} Tk`
  );
  console.log(
    `Connection Status    : ${accountData.connectionStatus || "N/A"}`
  );
  console.log(
    `Last Payment Amount  : ${accountData.lastPaymentAmount || "N/A"} Tk`
  );
  console.log(`Last Payment Date    : ${accountData.lastPaymentDate || "N/A"}`);
  console.log(
    `⏰ Balance Latest Date: ${accountData.balanceLatestDate || "N/A"}`
  );
  console.log(`Location             : ${accountData.location || "N/A"}`);
  console.log(`Mobile Number        : ${accountData.mobileNumber || "N/A"}`);
  console.log(`💵 Min Recharge      : ${accountData.minRecharge || "N/A"} Tk`);
  console.log("━".repeat(80));

  console.log("\n📋 Additional Info:");
  console.log(
    `Consumer Number (Raw): ${accountData.rawData.consumerNumber || "N/A"}`
  );
  console.log(
    `Meter Number (Raw)   : ${accountData.rawData.meterNumber || "N/A"}`
  );
  console.log(`Email                : ${accountData.rawData.email || "N/A"}`);
  console.log("━".repeat(80));

  if (accountData.rawData.rechargeHistory.length > 0) {
    console.log(
      `\n💳 RECHARGE HISTORY (${accountData.rawData.rechargeHistory.length} records):`
    );
    console.log("━".repeat(80));
    console.table(accountData.rawData.rechargeHistory);
  } else {
    console.log("\n⚠️  No recharge history found");
  }

  console.log("\n🔍 JSON Format (ProviderAccountDetails):");
  console.log("━".repeat(80));
  const providerAccountDetails = {
    accountId: accountData.accountId,
    customerNumber: accountData.customerNumber,
    customerName: accountData.customerName,
    provider: accountData.provider,
    accountType: accountData.accountType,
    balanceRemaining: accountData.balanceRemaining,
    connectionStatus: accountData.connectionStatus,
    lastPaymentAmount: accountData.lastPaymentAmount,
    lastPaymentDate: accountData.lastPaymentDate,
    balanceLatestDate: accountData.balanceLatestDate,
    location: accountData.location,
    mobileNumber: accountData.mobileNumber,
    minRecharge: accountData.minRecharge,
  };
  console.log(JSON.stringify(providerAccountDetails, null, 2));
  console.log("━".repeat(80));

  const tableMatches = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
  if (tableMatches) {
    console.log(`\n\nFound ${tableMatches.length} table(s) in HTML`);
  }

  const formMatches = html.match(/<form[^>]*>([\s\S]*?)<\/form>/gi);
  if (formMatches) {
    console.log(`Found ${formMatches.length} form(s) in HTML`);
  }



  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    console.log(`Page Title: ${titleMatch[1].trim()}`);
  }

  console.log("\n=== End of HTML Analysis ===\n");

  return accountData;
}

async function main() {
  try {
    console.log("\n" + "=".repeat(100));
    console.log("NESCO DATA FETCHER & ANALYZER");
    console.log("=".repeat(100) + "\n");

    const result = await fetchNESCOData(
      CONFIG.CUSTOMER_NUMBER,
      CONFIG.CSRF_TOKEN
    );

    console.log("\n" + "=".repeat(100));
    console.log("FETCH COMPLETE");
    console.log("=".repeat(100) + "\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

main();
