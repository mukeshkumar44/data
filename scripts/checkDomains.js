import fs from "fs";
import https from "https";

// ✅ YAHAN SIRF JSON FILE KA PATH DO
const FILE_PATH = "D:/jsonfile/content/sub-domain/sub-domain.json"; 
// 👆 isko apni actual file ke path se replace karo

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.get("https://" + url, { timeout: 10000 }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        ok: res.statusCode >= 200 && res.statusCode < 400,
      });
      res.resume();
    });

    req.on("error", () => resolve({ url, status: "ERROR", ok: false }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ url, status: "TIMEOUT", ok: false });
    });
  });
}

async function main() {
  if (!fs.existsSync(FILE_PATH)) {
    console.error("❌ File not found:", FILE_PATH);
    return;
  }

  const raw = fs.readFileSync(FILE_PATH, "utf-8");
  const data = JSON.parse(raw);

  const domains = Object.keys(data);

  console.log("🌐 Total domains:", domains.length);

  let working = [];
  let notWorking = [];

  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i];
    process.stdout.write(`🔍 Checking ${i + 1}/${domains.length}: ${domain} ... `);

    const result = await checkUrl(domain);

    if (result.ok) {
      working.push(domain);
      console.log("✅ OK", result.status);
    } else {
      notWorking.push(domain);
      console.log("❌ FAIL", result.status);
    }
  }

  console.log("\n======================");
  console.log("✅ Working:", working.length);
  console.log("❌ Not working:", notWorking.length);

  // ❌ Down domains ko file me save bhi kar do
  fs.writeFileSync(
    "D:/jsonfile/not-working-domains.json",
    JSON.stringify(notWorking, null, 2)
  );

  console.log("\n💾 Not working domains saved to:");
  console.log("D:/jsonfile/not-working-domains.json");

  // 🖨️ Console me bhi dikha do
  console.log("\n❌ DOWN DOMAINS LIST:");
  console.log(notWorking);
}

main();
