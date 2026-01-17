import puppeteer from "puppeteer";
import fs from "fs";

// ================= CONFIG =================
const STATE = "Haryana";
const CITY = "faridabad";

const locations = [
  "Sector 70 Neharpar",
  "Sector 86",
  "Ashoka Enclave",
  "Sector 82",
  "Sector 21C",
  "Sector 83",
  "Sector 21A",
  "Sector 80",
  "Ashoka Enclave Part 1",
  "Sector 81",
  "Sector 75",
  "Neharpar Greater Faridabad",
  "Sector 21D",
  "Sector 76",
  "Sector 78",
  "Sainik Colony",
  "Sector 49",
  "Sector 77",
  "Sector 85",
  "Sector 88",
  "Mujesar",
  "Sector 72",
  "Sector 79",
  "Sector 9",
  "Nav Durga Vihar, Dayal Bagh Colony",
  "Charmwood Village",
  "Ashoka Enclave Part 3",
  "Sector 87",
  "Inder Colony, Sector 31",
  "Sector 84",
  "Sector 21B",
  "Sector 28",
  "New Industrial Township",
  "Dabua Colony",
  "Greenfield Colony",
  "Sector 11",
  "Sector 55",
  "Sector 3",
  "Sector 6",
  "Sector 37",
  "Jawahar Colony",
  "Sector 45",
  "Sector 31",
  "Lakkarpur",
  "Sector 22",
  "Gurukul Basti",
  "HBH Colony, Sector 28",
  "Sector 16",
  "Jalvayu Vihar, Atmadpur Village",
  "Sector 44",
  "Sector 17",
  "Sector 38",
  "Sector 27",
  "Sector 10",
  "Sector 15",
  "NIT 2",
  "NIT 5",
  "NIT 1",
  "NIT 3",
  "Sector 29",
  "Sector 46",
  "Sector 5",
  "Sector 14",
  "Sector 7",
  "Sector 64",
  "Sector 2",
  "Sector 18",
  "Sector 19",
  "Sector 30",
  "Springfield Colony",
  "Sector 4",
  "Sector 62",
  "Dayal Bagh Colony",
  "Sector 27D",
  "Sector 39",
  "Aitmadpur, Sector 33",
  "Sector 74",
  "Sector 32",
  "Sector 8",
  "Green Field Colony",
  "Mewla Maharajpur, Sector 46"
];

// ================= HELPERS =================
function makeSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ================= SCRAPE ONE LOCATION =================
async function scrapeLocation(page, location) {
  const slug = makeSlug(location);
  const searchQuery = `flat for rent in ${location} ${CITY}`;

  console.log("🔍 Searching:", searchQuery);

  // Open housing
  await page.goto("https://housing.com", { waitUntil: "domcontentloaded" });

  // Search box
  await page.waitForSelector("input");
  await page.click("input", { clickCount: 3 });
  await page.keyboard.type(searchQuery, { delay: 50 });
  await page.keyboard.press("Enter");

  // Wait for cards
  try {
    await page.waitForSelector('article[data-testid="card-container"]', { timeout: 20000 });
  } catch {
    console.log(`⚠️ No cards found for ${location}`);
    return;
  }

  // Auto scroll to load more
  await page.evaluate(async () => {
    for (let i = 0; i < 8; i++) {
      window.scrollBy(0, window.innerHeight);
      await new Promise(r => setTimeout(r, 1500));
    }
  });

  // ================= SCRAPE CARDS =================
  const cards = await page.evaluate((CITY) => {
    const results = [];

    // Strict city check
    if (!document.body.innerText.toLowerCase().includes(CITY.toLowerCase())) {
      return [];
    }

    const cardNodes = document.querySelectorAll('article[data-testid="card-container"]');

    cardNodes.forEach(card => {
      const text = card.innerText || "";

      // -------- TITLE --------
      const title = text.split("\n")[0]?.trim() || "";

      // -------- PRICE --------
      const priceMatch = text.match(/₹\s?[\d,]+/);
      const price = priceMatch ? parseInt(priceMatch[0].replace(/[^\d]/g, "")) : 0;

      // -------- BHK --------
      const bhkMatch = text.match(/(\d+)\s*BHK/i);
      const bedrooms = bhkMatch ? parseInt(bhkMatch[1]) : 0;

      // -------- AREA --------
      const areaMatch = text.match(/([\d,]+)\s*(sq\.?ft|sqft)/i);
      const area = areaMatch ? parseInt(areaMatch[1].replace(/[^\d]/g, "")) : 0;

      if (!title || price <= 0 || bedrooms <= 0) return;

      results.push({
        propertyCategory: "Residential",
        propertyType: "Flat",
        listingType: "rent",
        title,
        description: "",
        state: "Haryana",
        city: "faridabad",
        locality: "",
        pincode: "",
        bedrooms,
        bathrooms: 0,
        furnishing: "",
        floor: 0,
        area,
        areaUnit: "sqft",
        price,
        selectedAmenities: [],
      });
    });

    return results;
  }, CITY);

  // ================= SAVE ONLY IF DATA EXISTS =================
  if (cards.length === 0) {
    console.log(`⚠️ No valid cards for ${location} → FILE SKIPPED`);
    return;
  }

  fs.mkdirSync("./data", { recursive: true });
  fs.writeFileSync(`./data/${slug}.json`, JSON.stringify(cards, null, 2));

  console.log(`✅ Saved ${cards.length} properties for ${location}`);
}

// ================= MAIN =================
async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  for (const location of locations) {
    try {
      await scrapeLocation(page, location);
    } catch (e) {
      console.log("❌ Error in", location, e.message);
    }
  }

  await browser.close();
  console.log("🏁 All Done!");
}

main();
