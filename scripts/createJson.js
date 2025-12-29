import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const x = "scripts/createJson.js"
// example usage
const data = [
  "Sector_70,_Neharpar",
  "Sector_86",
  "Ashoka_Enclave",
  "Sector_82",
  "Sector_21C",
  "Sector_83",
  "Sector_21A",
  "Sector_80",
  "Ashoka_Enclave_Part_1",
  "Sector_81",
  "Sector_75",
  "Neharpar,_Greater",
  "Sector_21D",
  "Sector_76",
  "Sector_78",
  "Sainik_Colony",
  "Sector_49",
  "Sector_77",
  "Sector_85",
  "Sector_88",
  "Mujesar",
  "Sector_72",
  "Sector_79",
  "Sector_9",
  "Nav_Durga_Vihar,_Dayal_Bagh_Colony",
  "Charmwood_Village",
  "Ashoka_Enclave_Part_3",
  "Sector_87",
  "Inder_Colony,_Sector_31",
  "Sector_84",
  "Sector_21B",
  "Sector_28",
  "New_Industrial_Township",
  "Dabua_Colony",
  "Greenfield_Colony",
  "Sector_11",
  "Sector_55",
  "Sector_3",
  "Sector_6",
  "Sector_37",
  "Jawahar_Colony",
  "Sector_45",
  "Sector_31",
  "Lakkarpur",
  "Sector_22",
  "Gurukul_Basti",
  "HBH_Colony,_Sector_28",
  "Sector_16",
  "Jalvayu_Vihar,_Atmadpur_Village",
  "Sector_44",
  "Sector_17",
  "Sector_38",
  "Sector_27",
  "Sector_10",
  "Sector_15",
  "NIT_2",
  "NIT_5",
  "NIT_1",
  "NIT_3",
  "Sector_29",
  "Sector_46",
  "Sector_5",
  "Sector_14",
  "Sector_7",
  "Sector_64",
  "Sector_2",
  "Sector_18",
  "Sector_19",
  "Sector_30",
  "Springfield_Colony",
  "Sector_4",
  "Sector_62",
  "Dayal_Bagh_Colony",
  "Sector_27D",
  "Sector_39",
  "Aitmadpur,_Sector_33",
  "Sector_74",
  "Sector_32",
  "Sector_8",
  "Green_Field_Colony",
  "Mewla_Maharajpur,_Sector_46"
];

;

const baseDir = path.join(
  __dirname,
  "../content/sub-domain/faridabad/shop-for-rent"
);

// ensure folder exists
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// create EMPTY json files
data.forEach((slug) => {
  const filePath = path.join(baseDir, `${slug}.json`);
  fs.writeFileSync(filePath, "{}", "utf-8");
});

console.log("✅ Empty JSON files created successfully");