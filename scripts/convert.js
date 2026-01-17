import puppeteer from "puppeteer";
import fs from "fs";

// ================== INPUT ==================
const LOCATIONS = [
  "Ashoka Enclave",
  "Sector 82",
  "Sector 21C",
  "Sector 81",
  "Dayal Bagh Colony",
  "Sector 75",
  "Sector 86",
];

const CITY = "Faridabad";
const STATE = "Haryana";

const MAX_SAVE = 30;
const OUTPUT_DIR = "./output";
const DELAY = 5000;

// ================== HELPERS ==================
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function normalizeText(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeSafeName(name) {
  return normalizeText(name).replace(/\s+/g, "-");
}

function makeHousingUrl(locality) {
  const safeLoc = makeSafeName(locality);
  const safeCity = makeSafeName(CITY);
  return `https://housing.com/rent/flats-for-rent-in-${safeLoc}-${safeCity}`;
}

function parsePrice(v) {
  if (!v) return 0;
  const n = parseInt(String(v).replace(/[^0-9]/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseArea(v) {
  if (!v) return 0;
  const n = parseInt(String(v).replace(/[^0-9]/g, ""));
  return isNaN(n) ? 0 : n;
}

// ================== MAIN ==================
(async () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  for (let i = 0; i < LOCATIONS.length; i++) {
    const locality = LOCATIONS[i];
    const url = makeHousingUrl(locality);
    const fileName = makeSafeName(locality) + ".json";
    const outputFile = `${OUTPUT_DIR}/${fileName}`;

    console.log("\n📍 Scraping:", locality);
    console.log("🌐 URL:", url);

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      await sleep(3000);

      // 🔥 Get __NEXT_DATA__ JSON
      const nextData = await page.evaluate(() => {
        const el = document.querySelector("#__NEXT_DATA__");
        return el ? el.textContent : null;
      });

      if (!nextData) {
        console.log("❌ __NEXT_DATA__ not found for:", locality);
        continue;
      }

      const json = JSON.parse(nextData);

      // 🧠 Dig into Housing.com data structure
      const resultsRaw =
        json?.props?.pageProps?.initialState?.search?.results || [];

      console.log("🧱 Raw results found:", resultsRaw.length);

      const results = [];

      for (const item of resultsRaw) {
        if (results.length >= MAX_SAVE) break;

        const title = item?.title || item?.property?.title || "Property";

        const price = parsePrice(item?.price || item?.rent);
        const area = parseArea(item?.area || item?.builtUpArea);

        const bedrooms = parseInt(item?.bedrooms || 0);
        const bathrooms = parseInt(item?.bathrooms || 0);

        results.push({
          propertyCategory: "Residential",
          propertyType: "Flat",
          listingType: "rent",
          title,
          description: "",
          state: STATE,
          city: CITY.toLowerCase(),
          locality: locality,
          pincode: "",
          bedrooms,
          bathrooms,
          furnishing: item?.furnishing || "",
          floor: item?.floor || 0,
          area,
          areaUnit: "sqft",
          price,
          selectedAmenities: item?.amenities || []
        });
      }

      if (results.length > 0) {
        fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
        console.log("✅ Saved:", results.length, "→", outputFile);
      } else {
        console.log("⚠️ No data for:", locality, "→ File NOT created");
      }

    } catch (err) {
      console.log("❌ Error for", locality, err.message);
    }

    if (i < LOCATIONS.length - 1) {
      console.log("⏳ Waiting...");
      await sleep(DELAY);
    }
  }

  await browser.close();
  console.log("\n🎉 DONE ALL LOCATIONS!");
})();
