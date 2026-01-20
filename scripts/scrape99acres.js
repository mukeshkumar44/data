import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import fs from "fs";

// ================= CONFIG =================

// ✅ ONLY WRITE LOCATION NAMES HERE
const LOCATIONS = [
  // "Sector 92",
  // "Sector 37D",
  // "Sector 86",
  // "Sector 82",
  // "Sector 81",
  // "Sector 91",
  // "Sector 77",
  // "Sector 85",
  // "Sector 109",
  // "Sector 50",
  // "Sector 67",
  // "Sector 42",
  // "Sector 39",
  // "South City 1",
  // "Sector 110",
  // "Sector 114",
  // "Sector 56",
  // "Sector 57",
  // "Sector 53",
  // "Sector 55",
  // "Palam Vihar",
  // "Sector 105",
  // "Sector 63A",
  // "DLF Phase 1",
  // "Sector 23",
  // "Sector 41",
  // "Sector 8",
  // "Sector 65",
  // "Sushant Lok Phase 2",
  // "Ashok Vihar",
  // "Sector 102",
  // "Chandan Vihar",
  // "Sector 30",
  // "Sector 108",
  // "Sector 43",
  // "Sadar Bazar",
  // "Ashok Vihar Phase 2",
  // "Sector 33",
  // "Sector 63",
  // "Sector 7",
  // "Sector 14",
  // "Sector 3",
  // "Sector 99",
  // "Sector 111",
  // "Sector 112",
  // "Sector 88",
  // "DLF Phase 3",
  // "Sector 51",
  // "Sector 10A",
  // "Sector 76",
  // "Sector 95",
  // "DLF Phase 2",
  // "Manesar",
  // "Sector 80",
  // "Sector 25",
  // "Sector 68",
  // "Sector 103",
  // "DLF Phase 5",
  // "Sector 1",
  // "Sector 19",
  // "Sector 78",
  // "Sector 49",
  // "Sector 48",
  // "Sector 66",
  // "Sector 93",
  // "Sector 11",
  // "Sector 107",
  // "Sector 69",
  // "Golf Course Road",
  // "Udyog Vihar",
  // "Sector 58",
  // "Sector 28",
  // "Palam Vihar Extension",
  // "Palam Vihar Pocket H",
  // "Sector 61",
  // "Sector 67A",
  // "Sushant Lok Phase 1",
  // "New Palam Vihar",
  // "Rajendra Park",
  // "Sector 83",
  // "Sector 84",
  // "Sector 89",
  // "DLF Phase 4",
  // "Sector 90",
  // "Sector 2",
  // "Sector 59",
  // "Sector 60",
  // "Sector 26",
  // "Sector 45",
  // "South City 2",
  // "Sector 94",
  // "Sector 6",
  // "Sector 62",
  // "Sector 54",
  // "Sector 31",
  // "Sector 113",
  // "Sector 87",
  // "Sushant Lok Phase 3",
  // "Sector 38",
  // "Sector 106",
  // "New Gurgaon",
  // "MG Road",
  "Civil Lines",
  "Sohna Road",
  "Sector 47",
  "Sector 46",
  "Sector 3A"
];

// 🛑 MAX RESULTS PER LOCATION
const MAX_SAVE = 30;

// ================= HELPERS =================
function normalizeText(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify99acres(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// 🔗 AUTO URL GENERATOR
function make99acresUrl(location) {
  const slug = slugify99acres(location);
  return `https://www.99acres.com/2BHK-flats-for-sale-in-${slug}-gurgaon-ffid`;
}

function parsePrice(text) {
  if (!text) return 0;
  let t = String(text).replace(/,/g, "").toLowerCase();

  let m = t.match(/(\d+(\.\d+)?)\s*(cr|crore)/);
  if (m) return Math.round(parseFloat(m[1]) * 10000000);

  m = t.match(/(\d+(\.\d+)?)\s*(lakh|lakhs)/);
  if (m) return Math.round(parseFloat(m[1]) * 100000);

  const n = parseInt(t.replace(/\D/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseArea(text) {
  if (!text) return 0;
  const m = String(text).match(/(\d{3,5})/);
  return m ? parseInt(m[1]) : 0;
}

function parseIntSafe(v) {
  if (!v) return 0;
  const n = parseInt(String(v).replace(/\D/g, ""));
  return isNaN(n) ? 0 : n;
}

function extractBedroomsFromTitle(title) {
  const m = title.toLowerCase().match(/(\d+)\s*(bhk|bed)/);
  return m ? parseInt(m[1]) : 0;
}

function detectPropertyType(text) {
  const t = text.toLowerCase();
  if (t.includes("independent house") || t.includes("house")) return "House";
  if (t.includes("villa")) return "Villa";
  if (t.includes("builder floor")) return "Builder Floor";
  if (t.includes("plot") || t.includes("land")) return "Plot";
  if (t.includes("apartment") || t.includes("flat")) return "Apartment";
  return "Property";
}

function detectListingType(text) {
  const t = text.toLowerCase();
  if (t.includes("rent")) return "rent";
  if (t.includes("lease")) return "lease";
  return "sale";
}

function extractBathroomsSmart(text) {
  const m = text.toLowerCase().match(/(\d+)\s*(bath|bathroom|toilet|washroom|wc)/);
  return m ? parseInt(m[1]) : 0;
}

// ================= MAIN =================
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled"
    ],
    ignoreHTTPSErrors: true
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"
  );

  const OUTPUT_DIR = "./output";
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 🔁 LOOP LOCATIONS
  for (const location of LOCATIONS) {
    const URL = make99acresUrl(location);
    const TARGET_LOCATION = location;

    console.log("\n🌐 Opening:", TARGET_LOCATION);
    console.log("➡️ URL:", URL);

    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });

    try {
      await page.waitForSelector(".tupleNew__outerTupleWrap", { timeout: 60000 });
    } catch {
      console.log("❌ Cards not found for", TARGET_LOCATION, "(maybe blocked or no data)");
      continue;
    }

    // Scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 4000));

    const html = await page.content();
    const $ = cheerio.load(html);

    const cards = $(".tupleNew__outerTupleWrap");
    console.log("🧱 Cards found:", cards.length);

    const results = [];

    cards.each((i, card) => {
      if (results.length >= MAX_SAVE) return false;

      const title = $(card).find("h2").text().trim();
      if (!title) return;

      const cardText = $(card).text();
      const fullText = title + " " + cardText;
      

      if (!normalizeText(fullText).includes(normalizeText(TARGET_LOCATION))) return;

      const price = parsePrice($(card).find(".tupleNew__priceValWrap").text());
      const area = parseArea($(card).find(".tupleNew__areaWrap").text());

      const bedrooms = extractBedroomsFromTitle(title);
      const bathrooms = extractBathroomsSmart(fullText);

      // ✅ FIXED AMENITIES EXTRACTION
      const amenities = [];

      // New layout
      $(card).find(".tupleAmenity__item, .tupleAmenity__text").each((i, el) => {
        const t = $(el).text().trim();
        if (t) amenities.push(t);
      });

      // Fallback old layout
      $(card).find(".tupleNew__unitHighlightTxt").each((i, el) => {
        const t = $(el).text().trim();
        if (t) amenities.push(t);
        const detectedType = detectPropertyType(fullText);

// ❌ Agar plot / land nahi hai → skip
        if (detectedType !== "2") {
        return;
}

      });

      results.push({
        propertyCategory: "Residential",
        propertyType: detectPropertyType(fullText),
        listingType: detectListingType(fullText),
        title,
        description: "",
        state: "Haryana",
        city: "Gurgaon",
        locality: TARGET_LOCATION,
        pincode: "",
        bedrooms,
        bathrooms,
        furnishing: "",
        floor: "",
        area,
        areaUnit: "sqft",
        price,
        selectedAmenities: [...new Set(amenities)]
      });
    });

    if (results.length === 0) {
      console.log("⚠️ No data for", TARGET_LOCATION, "_ skipping save.");
      continue;
    }

    const file = `${OUTPUT_DIR}/${slugify99acres(TARGET_LOCATION)}.json`;
    fs.writeFileSync(file, JSON.stringify(results, null, 2));

    console.log("✅ Saved:", file, "Records:", results.length);
  }

  await browser.close();
  console.log("\n🎉 ALL DONE");
})();
