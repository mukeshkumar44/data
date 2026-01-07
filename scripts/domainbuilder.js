import fs from "fs";
import path from "path";

// 🔧 CONFIG
const BASE_DOMAIN = "https://dealacres.com";
const CATEGORY_SLUG = "commercial-property-for-sale";
const TARGET_FOLDER = "./data/commercialproperty";

// 🔤 Slug generator
function makeSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 📊 Counters
let totalFiles = 0;
let updatedFiles = 0;
let skippedFiles = 0;
let errorFiles = 0;

console.log("🚀 Starting domain update script...\n");

// 📂 Read files
const files = fs.readdirSync(TARGET_FOLDER);

// 🔁 Loop all JSON files
files.forEach((file) => {
  if (!file.endsWith(".json")) return;

  totalFiles++;

  const filePath = path.join(TARGET_FOLDER, file);

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    // 🏷️ Location name find logic
    let locationName =
      data.location ||
      data.area ||
      data.place ||
      data.title ||
      file.replace(".json", "");

    if (!locationName || locationName.length < 2) {
      console.log("⚠️ Skipped (no location found):", file);
      skippedFiles++;
      return;
    }

    const locationSlug = makeSlug(locationName);

    // 🌐 Build full URL
    const fullDomainUrl = `${BASE_DOMAIN}/${CATEGORY_SLUG}/${locationSlug}`;

    // ✅ Update domain
    data.domain = fullDomainUrl;

    // 💾 Save
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log("✅ Updated:", file, "→", fullDomainUrl);
    updatedFiles++;
  } catch (err) {
    console.log("❌ Error in file:", file, err.message);
    errorFiles++;
  }
});

// 📊 Final Report
console.log("\n================= 📊 FINAL REPORT =================");
console.log("📁 Total JSON files found:", totalFiles);
console.log("✅ Successfully updated:", updatedFiles);
console.log("⚠️ Skipped files:", skippedFiles);
console.log("❌ Error files:", errorFiles);
console.log("===================================================");
console.log("🎉 Script finished!\n");
