import fs from "fs";
import path from "path";
import fetch from "node-fetch";




// 🔐 OpenRouter API
const OPENROUTER_API_KEY = ""

// 🟢 free tier safe
const DAILY_LIMIT = 58;
let generatedToday = 0;

// ✅ ONLY LOCATION ARRAY
const locations = [
  "Prem Nagar",
  "Jagadhri Gate",
  "Sarsehri",
  "Vijay Nagar",
  "NH 22",
  "Durga Nagar",
  "Sector 1",
  "Tagore Garden",
  "Sector 7",
  "Inder Nagar",
  "Saha",
  "Jandli",
  "Kala Amb",
  "Defence Colony",
  "New Pratap Nagar",
  "Lohgarh",
  "Baldev Nagar",
  "Mullana",
  "Police Line",
  "Ambala Cantt",
  "Ambala Sadar",
  "Jaggi Garden",
  "Geeta Colony",
  "Hira Nagar",
  "Sector 34",
  "Mithapur",
  "Parshuram Nagar",
  "Barnala Road",
  "Dhulkot",
  "Kesari Village",
  "Patti Mehar",
  "Ambala Chandigarh Expressway",
  "Manav Chowk",
  "Jasmeet Nagar",
  "Ram Nagar",
  "Sherpur Village",
  "Ram Bagh",
  "Circular Road",
  "Old Town",
  "Devi Nagar",
  "Sector 10",
  "Jaggi Colony",
  "Babyal",
  "Balana",
  "Mahavir Nagar",
  "Narain Garh",
  "Ghel",
  "Aliyaspur",
  "Kallerheri",
  "Model Town",
  "Preet Nagar",
  "Sector 8",
  "Rana Bagh",
  "Alipur Village",
  "Jalbera Road",
  "Sector 9",
  "RK Puram",
  "Laxmi Nagar"
];

const limitedLocations = locations.slice(0, DAILY_LIMIT);

// 📁 output folder
const OUTPUT_DIR = "./output";
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// ⏳ sleep helper
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 🔥 FULL PROMPT (same rules, nothing cut)
function buildPrompt(location) {
  return `
You are a professional real estate SEO copywriter.

Generate FULL webpage content in STRICT JSON ONLY.
No explanation. No markdown.

LOCATION: ${location}
PRIMARY KEYWORD: Shop For Rent in ${location}

CONTENT RULES:
- Copywriting style
- Human written, user-focused
- 70% informational, 30% promotional
- SEO optimised, natural keyword placement
- Easy to read & problem solving
- Follow section wireframe strictly
- Do NOT use colon in headings, titles, section names, or FAQ text
- JSON syntax colons are allowed and required
- This applies to ALL fields including:
- title, heading, section titles, hero title, feature titles, FAQ questions
- Example of BAD text: "Discover Perfect Plot Sizes: Smart Investment Options"
- Example of GOOD text: "Perfect Plot Sizes for Residential Homes in Sector 9 Ambala"
- When contextually appropriate, you may append "Ambala" after the location name
- This is optional and should be used naturally for clarity and SEO
- Especially allowed in headings, hero title, section titles, and descriptive content
- Do NOT force "Ambala" in every line or every field
- Example allowed usage
  "3 BHK Flat for Sale in Sector 8 Ambala"
  "Residential Living Options in Ambala Cantt Ambala"

 

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
- Headings: 10–18 words
- Hero content: 100–300 words
- Section explanations: 200–400 words
- Each plot & whyChoose point: ~100 words
- FAQs must be long & user-solving
- 

- locationsSection.locations must be selected dynamically from the provided locations list
- Choose only locations that are realistically close or commonly associated with the main LOCATION
- Do NOT include locations that are far or unrelated even if they are in the same district
- Do NOT guess distance if unsure exclude the location
- Prefer residential colonies markets sectors or areas that a local person would consider nearby
- locations array must contain 6 to 10 locations
- Do not repeat the main LOCATION inside locationsSection
- Do not leave locations array empty



`;
}

// 🔗 OpenRouter call
async function callOpenRouter(prompt) {
  const res = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "SEO Page Generator"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        temperature: 0.7,
        max_tokens: 3500,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    }
  );

  const data = await res.json();

  if (!data.choices) {
    throw new Error(JSON.stringify(data));
  }

  return data.choices[0].message.content;
}

// 🚀 main runner
async function run() {
  for (const location of limitedLocations) {
    let attempts = 0;
    let success = false;

    while (!success && attempts < 3) {
      try {
        attempts++;
        console.log(`Generating → ${location}`);

        const text = await callOpenRouter(
          buildPrompt(location)
        );

        const fileName =
          location
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_") + ".json";

        fs.writeFileSync(
          path.join(OUTPUT_DIR, fileName),
          text
        );

        generatedToday++;
        if (generatedToday >= DAILY_LIMIT) {
          console.log("Daily limit reached. Stop script.");
          process.exit(0);
        }

        success = true;
        await sleep(2000);
      } catch (err) {
        console.error("Retrying...", err.message);
        await sleep(20000);
      }
    }
  }
}

run();
