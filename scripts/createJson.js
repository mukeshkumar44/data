import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const x = "scripts/createJson.js"
// example usage
const data = [
  "sector_86",
  "sector_92",
  "sector_37d",
  "sector_82",
  "sector_81",
  "sector_91",
  "sector_77",
  "sector_85",
  "sector_109",
  "sector_50",
  "sector_67",
  "sector_42",
  "sector_39",
  "south_city_1",
  "sector_110",
  "sector_114",
  "sector_56",
  "sector_57",
  "sector_53",
  "sector_55",
  "palam_vihar",
  "sector_105",
  "sector_63a",
  "dlf_phase_1",
  "sector_23",
  "sector_41",
  "sector_8",
  "sector_65",
  "sushant_lok_phase_2",
  "ashok_vihar",
  "sector_102",
  "chandan_vihar",
  "sector_30",
  "sector_108",
  "sector_43",
  "sadar_bazar",
  "ashok_vihar_phase_2",
  "sector_33",
  "sector_63",
  "sector_7",
  "sector_14",
  "sector_3",
  "sector_99",
  "sector_111",
  "sector_112",
  "sector_88",
  "dlf_phase_3",
  "sector_51",
  "sector_10a",
  "sector_76",
  "sector_95",
  "dlf_phase_2",
  "manesar",
  "sector_80",
  "sector_25",
  "sector_68",
  "sector_103",
  "dlf_phase_5",
  "sector_1",
  "sector_19",
  "sector_78",
  "sector_49",
  "sector_48",
  "sector_66",
  "sector_93",
  "sector_11",
  "sector_107",
  "sector_69",
  "golf_course_road",
  "udyog_vihar",
  "sector_58",
  "sector_28",
  "palam_vihar_extension",
  "palam_vihar_pocket_h",
  "sector_61",
  "sector_67a",
  "sushant_lok_phase_1",
  "new_palam_vihar",
  "rajendra_park",
  "sector_83",
  "sector_84",
  "sector_89",
  "dlf_phase_4",
  "sector_90",
  "sector_2",
  "sector_59",
  "sector_60",
  "sector_26",
  "sector_45",
  "south_city_2",
  "sector_94",
  "sector_6",
  "sector_62",
  "sector_54",
  "sector_31",
  "sector_113",
  "sector_87",
  "sushant_lok_phase_3",
  "sector_38",
  "sector_106",
  "new_gurugram",
  "mg_road",
  "civil_lines",
  "sohna_road",
  "sector_47",
  "sector_46",
  "sector_3a"
]


;

const baseDir = path.join(
  __dirname,
  "../content/sub-domain/gurugram/flat-for-rent"
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