import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ Direct API key (local use only)
const GEMINI_API_KEY = "AIzaSyDcOCtmwAPUYTGAQVg8t8SWV2Z6VFUloD4";
const DAILY_LIMIT = 20; // free tier safe
let generatedToday = 0;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
   model: "gemini-flash-latest"
});

// ✅ ONLY LOCATION ARRAY (yahin bas locations add karni hain)
const locations = [
 
  
  
  "Sector 105",
  "Sector 63A",
  "DLF Phase 1",
  "Sector 33",
  "Sector 41",
  "Sector 8",
  "Sector 65",
  "Sushant Lok Phase 3",
  "Ashok Vihar",
  "Sector 103",
  "Chandan Vihar",
  "Sector 30",
  "Sector 108",
  "Sadar Bazar",
  "Ashok Vihar Phase 3",
  "Sector 63",
  "Sector 7",
  "Sector 14",
  "Sector 3",
  "Sector 99",
  "Sector 111",
  "Sector 113",
  "Sector 88",
  "DLF Phase 3",
  "Sector 51",
  "Sector 10A",
  "Sector 76",
  "Sector 95",
  "Manesar",
  "Sector 80",
  "Sector 35",
  "Sector 68",
  "DLF Phase 5",
  "Sector 1",
  "Sector 19",
  "Sector 78",
  "Sector 49",
  "Sector 48",
  "Sector 66",
  "Sector 11",
  "Sector 107",
  "Sector 69",
  "Golf Course Road",
  "Udyog Vihar",
  "Sector 58",
  "Sector 38",
  "Palam Vihar Extension",
  "Palam Vihar Pocket H",
  "Sector 61",
  "Sector 67A",
  "Sushant Lok Phase 1",
  "New Palam Vihar",
  "Rajendra Park",
  "Sector 84",
  "Sector 89",
  "DLF Phase 4",
  "Sector 90",
  "Sector 59",
  "Sector 60",
  "Sector 36",
  "Sector 45",
  "South City 3",
  "Sector 94",
  "Sector 6",
  "Sector 54",
  "Sector 31",
  "Sector 87",
  "Sector 106",
  "New Gurgaon",
  "MG Road",
  "Civil Lines",
  "Sohna Road",
  "Sector 47",
  "Sector 46",
  "Sector 3A"
  
 
  
]

;
const limitedLocations = locations.slice(0, DAILY_LIMIT);


// output folder
const OUTPUT_DIR = "./output";
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 🔥 PROMPT (sirf location change hoti rahegi)
function buildPrompt(location) {
  return `
You are a professional real estate SEO copywriter.

Generate FULL webpage content in STRICT JSON ONLY.
No explanation. No markdown.

LOCATION: ${location}
PRIMARY KEYWORD: 2BHK Flat For Sale in ${location}

CONTENT RULES:
- Copywriting style
- Human written, user-focused
- 70% informational, 30% promotional
- SEO optimised, natural keyword placement
- Easy to read & problem solving
- Follow section wireframe strictly
- DO NOT use colon (:) anywhere in the output
- This applies to ALL fields including:
- title, heading, section titles, hero title, feature titles, FAQ questions
- Example of BAD text: "Discover Perfect Plot Sizes: Smart Investment Options"
- Example of GOOD text: "Perfect Plot Sizes for Residential Homes in Sector 77 Gurugram"
- When contextually appropriate, you may append "Gurugram" after the location name
- This is optional and should be used naturally for clarity and SEO
- Especially allowed in headings, hero title, section titles, and descriptive content
- Do NOT force "Gurugram" in every line or every field
- Example allowed usage
  "3 BHK Flat for Sale in Sector 19 Gurugram"
  "Residential Living Options in Dlf phase 3 Gurugram"

JSON STRUCTURE (must match exactly):

{
  "domain": "",
  "hero": {
    "title": "",
    "description": ["", ""],
    "buttons": [
      { "label": "", "path": "/" },
      { "label": "", "path": "/" }
    ],
    "images": []
  },
  "featuresSection": {
    "heading": "",
    "description": ["", ""],
    "features": [
      { "title": "4 Marla Plot", "description": "" },
      { "title": "6 Marla Plot", "description": "" },
      { "title": "8 Marla Plot", "description": "" },
      { "title": "10 Marla Plot", "description": "" },
      { "title": "12 Marla Plot", "description": "" },
      { "title": "14 Marla Plot", "description": "" }
    ]
  },
  "locationsSection": {
    "title": "",
    "description": ["", ""],
    "locations": []
  },
  "whyChoose": {
    "title": "",
    "description": ["", ""],
    "points": [
      { "title": "", "description": "" },
      { "title": "", "description": "" },
      { "title": "", "description": "" },
      { "title": "", "description": "" },
      { "title": "", "description": "" },
      { "title": "", "description": "" },
      { "title": "", "description": "" },
      { "title": "", "description": "" }
    ]
  },
  "faqSection": {
    "title": "",
    "description": "",
    "faqs": [
      { "question": "", "answer": "" },
      { "question": "", "answer": "" },
      { "question": "", "answer": "" },
      { "question": "", "answer": "" },
      { "question": "", "answer": "" },
      { "question": "", "answer": "" },
      { "question": "", "answer": "" },
      { "question": "", "answer": "" },
      { "question": "", "answer": "" },
      { "question": "", "answer": "" }
    ]
  },
  "contactSection": {
    "title": "",
    "description": ["", ""],
    "formFields": ["name", "phone", "email", "message"]
  }
}

IMPORTANT:
- Headings: 10–12 words
- Hero content: 100–200 words
- Section explanations: 200–300 words
- Each plot & whyChoose point: ~100 words
- FAQs must be long & user-solving
- OUTPUT ONLY VALID JSON
`;
}

async function run() {
  for (const location of limitedLocations) {
    let attempts = 0;
    let success = false;

    while (!success && attempts < 3) {
      try {
        attempts++;
        console.log(`Generating → ${location}`);

        const result = await model.generateContent(
          buildPrompt(location)
        );

        const text = result.response.text().trim();

        const fileName =
          location.toLowerCase().replace(/[^a-z0-9]+/g, "_") + ".json";

        fs.writeFileSync(
          path.join(OUTPUT_DIR, fileName),
          text
        );
        // ✅ count successful generation
generatedToday++;

if (generatedToday >= DAILY_LIMIT) {
  console.log("Daily limit reached. Stop script.");
  process.exit(0);
}

        success = true;
        await sleep(2000); // rate-limit safe
      } catch (err) {
        console.error("Retrying...", err.message);
        await sleep(25000);
      }
    }
  }
}

run();