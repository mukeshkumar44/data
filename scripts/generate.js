const fs = require("fs");
const locations = require("./locations");
const template = require("./template");

if (!fs.existsSync("output")) {
  fs.mkdirSync("output");
}

locations.forEach(location => {
  const slug = location
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/\s+/g, "-");

  const data = template(location);

  fs.writeFileSync(
    `output/${slug}.json`,
    JSON.stringify(data, null, 2),
    "utf-8"
  );
});

console.log(`✅ ${locations.length} JSON files generated successfully`);
