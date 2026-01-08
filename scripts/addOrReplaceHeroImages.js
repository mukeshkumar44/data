import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ✅ FIX FOR __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIG =====
const GRAND_PARENT_FOLDER = path.join(
  __dirname,
  "../content/sub-domain/gurugram/rent-house"
);

const HERO_IMAGES = [
  "https://plus.unsplash.com/premium_photo-1661954372617-15780178eb2e?w=500&auto=format&fit=crop&q=60",
  "https://plus.unsplash.com/premium_photo-1661883982941-50af7720a6ff?w=800&auto=format&fit=crop&q=60"
];
// ==================

let totalFiles = 0;
let updatedFiles = 0;
let skippedFiles = 0;

// 🔁 recursive walk
function walk(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      walk(fullPath);
    }

    if (item.isFile() && item.name.endsWith(".json")) {
      processJson(fullPath);
    }
  }
}

function processJson(filePath) {
  totalFiles++;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw);

    // ⏭️ skip if hero not present
    if (!json.hero || typeof json.hero !== "object") {
      skippedFiles++;
      return;
    }

    // ✅ add OR replace images
    json.hero.images = HERO_IMAGES;

    fs.writeFileSync(
      filePath,
      JSON.stringify(json, null, 2),
      "utf-8"
    );

    updatedFiles++;
    console.log("✅ Hero images updated:", filePath);
  } catch (err) {
    console.error("❌ Error:", filePath, err.message);
  }
}

// ▶️ RUN
console.log("🚀 Updating hero images...");
walk(GRAND_PARENT_FOLDER);
console.log("🎉 Done!");
console.log("📄 Total JSON files scanned:", totalFiles);
console.log("✅ Updated files:", updatedFiles);
console.log("⏭️ Skipped (no hero section):", skippedFiles);
