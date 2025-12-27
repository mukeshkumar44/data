module.exports = (location) => ({
  domain: "house-for-rent.com",

  hero: {
    title: `Comfortable and Well Connected Houses for Rent in ${location}`,
    description: [
      `${location} Faridabad is a well-developed residential locality offering strong connectivity, daily conveniences, and peaceful surroundings. Tenants looking for a house for rent in ${location} Faridabad prefer this area for its balanced lifestyle and organised infrastructure.`,
      `Houses for rent in ${location} include independent houses and builder floors with functional layouts, good ventilation, and long-term rental suitability.`
    ],
    buttons: [
      { label: "Browse Rental Houses", path: "/" },
      { label: "Talk to Rental Experts", path: "/" }
    ],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c"
    ]
  },

  featuresSection: {
    heading: `Plot Size Options for Houses for Rent in ${location}`,
    description: [
      `Choosing the right plot size is important when renting a house in ${location} Faridabad.`,
      "Multiple plot size options help tenants balance space and budget."
    ],
    features: [4, 6, 8, 10, 12, 14].map(size => ({
      title: `${size} Marla Houses for Rent in ${location}`,
      description: `${size} Marla houses offer comfortable layouts suitable for different family needs and budgets.`
    }))
  },

  locationsSection: {
    title: `Explore Rental and Sale Properties in ${location}`,
    description: [
      "Tenants often explore nearby locations before finalising a rental house.",
      "These links help compare rental and sale options easily."
    ],
    locations: [
      { title: `House for Rent in ${location} Faridabad`, path: "/", icon: "Home" },
      { title: `House for Sale in ${location} Faridabad`, path: "/", icon: "Building" },
      { title: "Independent Houses for Rent in Faridabad", path: "/", icon: "Key" }
    ]
  },

  whyChoose: {
    title: "Why Deal Acres Is the Preferred Choice for Rental Homes",
    description: [
      "Verified listings and transparent communication build trust.",
      "Deal Acres simplifies the rental journey for tenants."
    ],
    points: [
      "Verified Listings",
      "Transparent Pricing",
      "Local Expertise",
      "Easy Search",
      "Tenant Support",
      "Agreement Help",
      "Time Saving",
      "Trusted Brand"
    ].map(point => ({
      title: point,
      description: `Deal Acres provides ${point.toLowerCase()} for a smooth rental experience.`
    }))
  },

  faqSection: {
    title: `Frequently Asked Questions About Houses for Rent in ${location}`,
    description: "Detailed answers to common tenant questions.",
    faqs: [
      {
        question: `Is ${location} a good area for renting a house?`,
        answer: "Yes, it offers connectivity, amenities, and a family-friendly environment."
      }
    ]
  },

  contactSection: {
    title: `Get Expert Help Finding Houses for Rent in ${location}`,
    description: [
      "Expert assistance makes renting easy and safe.",
      "Share your details to receive verified options."
    ],
    formFields: ["name", "phone", "email", "message"]
  }
});
