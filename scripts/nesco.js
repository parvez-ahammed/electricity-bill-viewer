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

  const consumerNameMatch = html.match(
    /<label[^>]*>Consumer Name<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
  );
  if (consumerNameMatch) {
    accountData.customerName = consumerNameMatch[1].trim();
  }

  const consumerNumberMatch = html.match(
    /<label[^>]*>Consumer No\.<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
  );
  if (consumerNumberMatch) {
    accountData.customerNumber = consumerNumberMatch[1].trim();
    accountData.rawData.consumerNumber = consumerNumberMatch[1].trim();
  }

  const meterNumberMatch = html.match(
    /<label[^>]*>Meter No\.<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
  );
  if (meterNumberMatch) {
    accountData.accountId = meterNumberMatch[1].trim();
    accountData.rawData.meterNumber = meterNumberMatch[1].trim();
  }

  const addressMatch = html.match(
    /<label[^>]*>Address<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
  );
  if (addressMatch) {
    accountData.location = addressMatch[1].trim();
  }

  const mobileMatch = html.match(
    /<label[^>]*>Mobile<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
  );
  if (mobileMatch) {
    accountData.mobileNumber = mobileMatch[1].trim();
  }

  const emailMatch = html.match(
    /<label[^>]*>Email<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
  );
  if (emailMatch) {
    accountData.rawData.email = emailMatch[1].trim();
  }

  const minRechargeMatch = html.match(
    /<label[^>]*>Minimum Recharge Amount[\s\S]*?<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
  );
  if (minRechargeMatch) {
    accountData.minRecharge = minRechargeMatch[1].trim();
  }

  const balanceMatch = html.match(
    /<label[^>]*>Remaining Balance \(Tk\.\)[\s\S]*?<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
  );
  if (balanceMatch) {
    accountData.balanceRemaining = balanceMatch[1].trim();
  }

  const balanceTimeMatch = html.match(
    /<label[^>]*>Remaining Balance[\s\S]*?<span>([\s\S]*?)<\/span>/i
  );
  if (balanceTimeMatch) {
    const rawDate = balanceTimeMatch[1].trim();
    accountData.balanceLatestDate = formatDateToStandard(rawDate);
  }

  const connectionStatusMatch = html.match(
    /<label[^>]*>Connection Status<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
  );
  if (connectionStatusMatch) {
    accountData.connectionStatus = connectionStatusMatch[1].trim();
  } else {
    accountData.connectionStatus = accountData.balanceRemaining
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

  const csrfMatches = html.match(/name="_token"\s+value="([^"]+)"/);
  if (csrfMatches) {
    console.log(`✓ CSRF Token: ${csrfMatches[1]}`);
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
