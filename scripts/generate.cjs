const fs = require("fs");
const path = require("path");
const locations = require("./locations.cjs");
const template = require("./template.cjs");

console.log("Locations loaded:", locations.length);
console.log("First location:", locations[0]);

const outputDir = path.join(
  __dirname,
  "../content/sub-domain/faridabad/flat-for-rent"
);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log("Output folder created:", outputDir);
}

locations.forEach((location, index) => {
  const slug = location
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/\s+/g, "-");

  const data = template(location);

  const filePath = path.join(outputDir, `${slug}.json`);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

  if (index === 0) {
    console.log("First file written at:", filePath);
  }
});

console.log(`✅ ${locations.length} JSON files generated successfully`);
