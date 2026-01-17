import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import fs from "fs";

// ================= CONFIG =================
const URL = "https://housing.com/in/buy/faridabad/plot-sector_8_faridabad";
const TARGET_LOCATION = "Sector 8";
const MAX_SAVE = 30;

// ================= HELPERS =================
function normalizeText(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNumber(text) {
  if (!text) return 0;
  const n = parseInt(String(text).replace(/,/g, "").replace(/\D/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseArea(text) {
  if (!text) return 0;
  const m = String(text).replace(/,/g, "").match(/(\d{3,5})/);
  return m ? parseInt(m[1]) : 0;
}

function extractBedrooms(title) {
  const m = String(title).toLowerCase().match(/(\d+)\s*bhk/);
  return m ? parseInt(m[1]) : 0;
}

function detectPropertyType(text) {
  const t = text.toLowerCase();
  // if (t.includes("apartment") || t.includes("flat")) return "Flat";
  if (t.includes("plot") || t.includes("land")) return "Plot / Land";

  if (t.includes("builder floor")) return "Builder Floor";
  if (t.includes("independent house") || t.includes("house")) return "House";
  if (t.includes("villa")) return "Villa";
  return "Property";
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ================= MAIN =================
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: "./chrome-data",
    args: ["--start-maximized"]
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  );

  console.log("🌐 Opening list page...");
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 0 });

  // Scroll to load all cards
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(2000);
  }

  // ================= LIST PAGE (LIVE DOM) =================
  const basicList = await page.evaluate((MAX_SAVE, TARGET_LOCATION) => {
    const out = [];
    const cards = document.querySelectorAll("article");

    const target = TARGET_LOCATION.toLowerCase();

    for (const card of cards) {
      if (out.length >= MAX_SAVE) break;

      const cardText = (card.innerText || "").toLowerCase();

      // ================= STRICT FILTER 1: LOCATION =================
      if (!cardText.includes(target)) {
        continue;
      }

      // ================= STRICT FILTER 2: RENT =================
      if (!cardText.includes("plot") && !cardText.includes("land")) {
        continue;
      }

      const titleEl = card.querySelector("h2, h3");
      if (!titleEl) continue;
      const title = titleEl.innerText.trim();

      // link
      let link = null;
      card.querySelectorAll("a").forEach(a => {
        if (a.href && a.href.includes("/buy/")) link = a.href;
      });
      if (!link) continue;

      // price
      const priceEl = card.querySelector('[data-q="price"]');
      const price = priceEl ? parseInt(priceEl.innerText.replace(/\D/g, "")) : 0;

      // area
      const areaEl = card.querySelector('[data-q="builtup-area"]');
      const area = areaEl ? parseInt(areaEl.innerText.replace(/\D/g, "")) : 0;

      // bedrooms
      let bedrooms = 0;
      const m = title.toLowerCase().match(/(\d+)\s*bhk/);
      if (m) bedrooms = parseInt(m[1]);

      // furnishing
      let furnishing = "";
      if (cardText.includes("semi-furnished")) furnishing = "Semi-Furnished";
      else if (cardText.includes("furnished")) furnishing = "Furnished";
      else if (cardText.includes("unfurnished")) furnishing = "Unfurnished";

      // ✅ AMENITIES
      const amenities = [];
      const amenBox = card.querySelector('[data-q="project-Amenities"]');
      if (amenBox) {
        amenBox.querySelectorAll("*").forEach(el => {
          const t = el.innerText.trim();
          const low = t.toLowerCase();

          if (
            t.length > 2 &&
            t.length < 40 &&
            low !== "amenities" &&
            !low.includes("see") &&
            !low.includes("more")
          ) {
            amenities.push(t);
          }
        });
      }

      out.push({
        title,
        price,
        area,
        bedrooms,
        furnishing,
        link,
        amenities: [...new Set(amenities)]
      });
    }

    return out;
  }, MAX_SAVE, TARGET_LOCATION);

  console.log("📄 Basic list collected:", basicList.length);

  // ================= DETAIL PAGES =================
  const results = [];

  for (let i = 0; i < basicList.length; i++) {
    const item = basicList[i];
    console.log(`\n➡️ [${i + 1}/${basicList.length}] Opening:`, item.link);

    try {
      await page.goto(item.link, { waitUntil: "networkidle2", timeout: 0 });
      await sleep(4000);

      const detailHtml = await page.content();
      const $d = cheerio.load(detailHtml);
      const detailText = $d("body").text().toLowerCase();

      // ===== Bathrooms =====
      let bathrooms = 0;
      $d("tr").each((i, tr) => {
        const label = $d(tr).find("th").text().toLowerCase().trim();
        if (label === "bathrooms") {
          const val = $d(tr).find("td .T_valueStyle").text().trim();
          bathrooms = extractNumber(val);
        }
      });

      // ===== Floor =====
      let floor = 0;
      $d("tr").each((i, tr) => {
        const label = $d(tr).find("th").text().toLowerCase().trim();
        if (label === "floor number") {
          const val = $d(tr).find("td .T_valueStyle").text().trim();
          const m = val.match(/(\d+)/);
          if (m) floor = parseInt(m[1]);
        }
      });

      const propertyType = detectPropertyType(item.title + " " + detailText);
      const listingType = "sale";

      results.push({
        propertyCategory: "Residential",
        propertyType,
        listingType,
        title: item.title,
        description: "",
        state: "Haryana",
        city: "faridabad",
        locality: TARGET_LOCATION,
        pincode: "",
        bedrooms: item.bedrooms,
        bathrooms,
        furnishing: item.furnishing,
        floor,
        area: item.area,
        areaUnit: "sqft",
        price: item.price,
        selectedAmenities: item.amenities || [],
      });

      console.log(
        "✅ Saved:",
        item.title,
        "| Bath:",
        bathrooms,
        "| Floor:",
        floor,
        "| Amenities:",
        (item.amenities || []).length
      );

      await sleep(2500);
    } catch (err) {
      console.log("❌ Failed:", item.link, err.message);
    }
  }

  // ================= SAVE =================
  const OUTPUT_DIR = "./output2";
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const safeName = normalizeText(TARGET_LOCATION).replace(/\s+/g, "_");
  const outputFile = `${OUTPUT_DIR}/${safeName}.json`;

  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

  await browser.close();

  console.log("\n🏁 DONE");
  console.log("🏠 Total saved:", results.length);
  console.log("📄 File:", outputFile);
})();
