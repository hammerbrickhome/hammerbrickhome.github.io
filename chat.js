/* ============================================================
   HAMMER BRICK & HOME — ULTRA ADVANCED ESTIMATOR BOT v6.1
   (FIXED: Critical Syntax Error, FAB Restored, Smart Add-Ons Integrated)
=============================================================== */

(function() {
  // --- CONFIGURATION & DATA -----------------------------------

  // Borough modifiers
  const BOROUGH_MODS = {
    "Manhattan": 1.18,
    "Brooklyn": 1.08,
    "Queens": 1.05,
    "Bronx": 1.03,
    "Staten Island": 1.0,
    "New Jersey": 0.96
  };

  // Recognized promo codes (optional)
  const DISCOUNTS = {
    "VIP10": 0.10,       // 10% off
    "REFERRAL5": 0.05    // 5% off
  };

  // Fixed Add-On Prices
  const ADD_ON_PRICES = {
    "debrisRemoval": { low: 800, high: 1500 } // Cost of a dumpster and haul-away
  };

  // Optional external URLs (leave empty if not used)
  const CRM_FORM_URL = "";      // e.g. "https://forms.gle/your-form-id"
  const WALKTHROUGH_URL = "";   // e.g. "https://calendly.com/your-link"

  // Pricing Logic / Services
  const SERVICES = {
    "masonry": {
      label: "Masonry & Concrete",
      emoji: "🧱",
      unit: "sq ft",
      baseLow: 16, baseHigh: 28, min: 2500,
      subQuestion: "What type of finish?",
      context: "Masonry is typically priced by the square foot, often running **$16–$28 per sq ft** depending on the complexity and finish you choose.",
      options: [
        { label: "Standard Concrete ($)", factor: 1.0 },
        { label: "Pavers ($$)", factor: 1.6 },
        { label: "Natural Stone ($$$)", factor: 2.2 }
      ]
    },

    "driveway": {
      label: "Driveway",
      emoji: "🚗",
      unit: "sq ft",
      baseLow: 10, baseHigh: 20, min: 3500,
      subQuestion: "Current surface condition?",
      context: "Driveways are priced by the square foot. Factors like existing asphalt removal can add to the cost, which ranges from **$10–$20 per sq ft**.",
      options: [
        { label: "Dirt/Gravel (New)", factor: 1.0 },
        { label: "Existing Asphalt (Removal)", factor: 1.25 },
        { label: "Existing Concrete (Hard Demo)", factor: 1.4 }
      ]
    },

    "roofing": {
      label: "Roofing",
      emoji: "🏠",
      unit: "sq ft",
      baseLow: 4.5, baseHigh: 9.5, min: 6500,
      subQuestion: "Roof type?",
      context: "Roofing costs vary widely by material and accessibility. Typical pricing is **$4.50–$9.50 per sq ft**, with a minimum project size of around $6,500.",
      options: [
        { label: "Shingle (Standard)", factor: 1.0 },
        { label: "Flat Roof (NYC Spec)", factor: 1.5 },
        { label: "Slate/Specialty", factor: 2.5 }
      ]
    },

    "painting": {
      label: "Interior Painting",
      emoji: "🎨",
      unit: "sq ft",
      baseLow: 1.8, baseHigh: 3.8, min: 1800,
      subQuestion: "Paint quality?",
      context: "A standard interior paint job (walls/ceiling) runs about **$1.80–$3.80 per sq ft** of floor space, depending on the quality of paint selected.",
      leadSensitive: true,
      options: [
        { label: "Standard Paint", factor: 1.0 },
        { label: "Premium Paint", factor: 1.3 },
        { label: "Luxury Benjamin Moore", factor: 1.55 }
      ]
    },

    "exterior_paint": {
      label: "Exterior Painting",
      emoji: "🖌",
      unit: "sq ft",
      baseLow: 2.5, baseHigh: 5.5, min: 3500,
      subQuestion: "Surface condition?",
      context: "Exterior painting, including surface prep, typically ranges from **$2.50–$5.50 per sq ft** of surface area. Extensive prep work will increase the price.",
      options: [
        { label: "Good Condition", factor: 1.0 },
        { label: "Peeling / Prep Needed", factor: 1.4 },
        { label: "Heavy Prep / Repairs", factor: 1.8 }
      ]
    },

    "basement_floor": {
      label: "Basement Floor Paint / Epoxy",
      emoji: "🧼",
      unit: "sq ft",
      baseLow: 2.8, baseHigh: 5.5, min: 1200,
      subQuestion: "Floor type?",
      context: "Epoxy flooring ranges widely based on the system chosen, from a simple 1-part coat to a full flake system, usually **$2.80–$5.50 per sq ft**.",
      options: [
        { label: "1-Part Epoxy Paint", factor: 1.0 },
        { label: "2-Part Epoxy (Thick Coat)", factor: 1.6 },
        { label: "Flake System", factor: 2.1 }
      ]
    },

    "fence": {
      label: "Fence Install",
      emoji: "🚧",
      unit: "linear ft",
      baseLow: 30, baseHigh: 75, min: 1800,
      subQuestion: "Fence type?",
      context: "Fence installation is priced by the linear foot, ranging from **$30–$75 per linear foot** based on material (Wood is cheaper than Aluminum).",
      options: [
        { label: "Wood", factor: 1.0 },
        { label: "PVC", factor: 1.6 },
        { label: "Chain-Link", factor: 0.9 },
        { label: "Aluminum", factor: 2.0 }
      ]
    },

    "deck": {
  label: "Deck / Porch Build",
  emoji: "🪵",
  unit: "sq ft",
  baseLow: 35, 
  baseHigh: 65, 
  min: 5000,
  subQuestion: "Deck material?",
  context: "Deck building costs vary significantly based on material. Expect **$35–$65 per sq ft** for labor and materials, with Composite and PVC being the most expensive.",
  options: [
    { label: "Pressure Treated", factor: 1.0 },
    { label: "Composite (Trex)", factor: 1.9 },
    { label: "PVC Luxury", factor: 2.4 }
  ]
},


    "drywall": {
      label: "Drywall Install / Repair",
      emoji: "📐",
      unit: "sq ft",
      baseLow: 3.2, baseHigh: 6.5, min: 750,
      subQuestion: "Scope?",
      context: "Drywall projects often require a minimum size due to labor mobilization costs. We typically price **$3.20–$6.50 per sq ft** for install and finishing.",
      options: [
        { label: "Minor Repairs", factor: 1.0 },
        { label: "Full Install", factor: 1.6 },
        { label: "Level 5 Finish", factor: 2.1 }
      ]
    },

    "flooring": {
      label: "Flooring Installation",
      emoji: "🪚",
      unit: "sq ft",
      baseLow: 3.5, baseHigh: 9.5, min: 2500,
      subQuestion: "Flooring type?",
      context: "Flooring installation runs **$3.50–$9.50 per sq ft** for labor, with Tile and Hardwood being the highest due to complexity.",
      options: [
        { label: "Vinyl Plank", factor: 1.0 },
        { label: "Tile", factor: 1.8 },
        { label: "Hardwood", factor: 2.4 },
        { label: "Laminate", factor: 1.2 }
      ]
    },

    "powerwash": {
      label: "Power Washing",
      emoji: "💦",
      unit: "sq ft",
      baseLow: 0.35, baseHigh: 0.85, min: 250
    },

    "gutter": {
      label: "Gutter Install",
      emoji: "🩸",
      unit: "linear ft",
      baseLow: 15, baseHigh: 35, min: 1200,
      subQuestion: "Type?",
      context: "Gutter installation is priced by the linear foot, from **$15–$35 per linear foot**. Copper gutters are significantly more expensive than Aluminum.",
      options: [
        { label: "Aluminum", factor: 1.0 },
        { label: "Seamless", factor: 1.4 },
        { label: "Copper", factor: 3.5 }
      ]
    },

    "windows": {
      label: "Windows Install",
      emoji: "🪟",
      unit: "fixed",
      subQuestion: "Window type?",
      context: "Window replacements are fixed-price per unit, ranging from **$550–$1,400 per window** for standard sizes, not including Bay or specialty windows.",
      options: [
        { label: "Standard Vinyl", fixedLow: 550, fixedHigh: 850 },
        { label: "Double Hung Premium", fixedLow: 850, fixedHigh: 1400 },
        { label: "Bay/Bow Window", fixedLow: 3500, fixedHigh: 6500 }
      ]
    },

    "doors": {
      label: "Door Installation",
      emoji: "🚪",
      unit: "fixed",
      subQuestion: "Door type?",
      context: "New door installs range widely, from **$950–$4,500 per unit** including standard labor, depending on material, size, and type (Patio doors are higher).",
      options: [
        { label: "Standard Entry Door", fixedLow: 950, fixedHigh: 1800 },
        { label: "Storm Door", fixedLow: 550, fixedHigh: 950 },
        { label: "Sliding Patio Door", fixedLow: 2500, fixedHigh: 4500 }
      ]
    },

    "kitchen": {
      label: "Kitchen Remodel",
      emoji: "🍳",
      unit: "fixed",
      subQuestion: "Scope?",
      context: "A full kitchen remodel is a fixed-price project. Expect **$25,000–$65,000+** for labor and materials, depending on size and finish level.",
      options: [
        { label: "Cabinet Reface / Light Remodel", fixedLow: 8000, fixedHigh: 20000 },
        // --- FIX: The line below had an incomplete price value causing a syntax crash ---
        { label: "Mid-Range Remodel (Full)", fixedLow: 25000, fixedHigh: 45000 }, // CORRECTED
        // -------------------------------------------------------------------------------
        { label: "Luxury Custom Kitchen", fixedLow: 45000, fixedHigh: 65000 }
      ]
    },

    "bath": {
      label: "Bathroom Remodel",
      emoji: "🛁",
      unit: "fixed",
      subQuestion: "Scope?",
      context: "A bathroom remodel starts at **$8,500** for labor and materials, going up to **$20,000+** for a luxury finish with full tile and custom features.",
      options: [
        { label: "Half-Bath / Powder Room", fixedLow: 4500, fixedHigh: 9500 },
        { label: "Full Bath (Standard)", fixedLow: 8500, fixedHigh: 14000 },
        { label: "Luxury / Master Bath", fixedLow: 14000, fixedHigh: 20000 }
      ]
    },

    "sidewalk": {
      label: "Sidewalk / Paver Walkway",
      emoji: "🚶",
      unit: "sq ft",
      baseLow: 12, baseHigh: 22, min: 1500,
      subQuestion: "Material?",
      context: "Sidewalks and walkways are priced by the square foot, from **$12–$22 per sq ft**. Pavers are generally more expensive than poured concrete.",
      options: [
        { label: "Poured Concrete", factor: 1.0 },
        { label: "Pavers / Stone", factor: 1.8 }
      ]
    },

    "stoop": {
      label: "Stoop / Stairs",
      emoji: "🪜",
      unit: "fixed",
      subQuestion: "Scope?",
      context: "Stoop and step projects are fixed-price per unit, ranging from **$3,000–$12,000+** depending on whether it's a resurface or a full masonry rebuild.",
      options: [
        { label: "Resurface / Simple Repair", fixedLow: 3000, fixedHigh: 6500 },
        { label: "Full Masonry Rebuild", fixedLow: 6500, fixedHigh: 12000 }
      ]
    },

    "insulation": {
      label: "Insulation Install",
      emoji: "🌡️",
      unit: "sq ft",
      baseLow: 1.2, baseHigh: 3.5, min: 1000,
      subQuestion: "Insulation type?",
      context: "Insulation costs **$1.20–$3.50 per sq ft**. Spray Foam is the highest-priced but most efficient option.",
      options: [
        { label: "Fiberglass Batts", factor: 1.0 },
        { label: "Blown-in Cellulose", factor: 1.2 },
        { label: "Spray Foam (Closed-Cell)", factor: 2.5 }
      ]
    },

    "demo": {
      label: "Demolition & Haul-Off",
      emoji: "💥",
      unit: "sq ft",
      baseLow: 1.8, baseHigh: 4.5, min: 600,
      subQuestion: "What is being demo'd?",
      context: "General demolition is priced by the square foot, from **$1.80–$4.50 per sq ft**, depending on the material (e.g., concrete is harder than drywall).",
      options: [
        { label: "Drywall", factor: 1.0 },
        { label: "Tile / Bathroom Demo", factor: 1.8 },
        { label: "Concrete Demo", factor: 2.4 }
      ]
    },

    "retaining": {
      label: "Retaining Wall",
      emoji: "🧱",
      unit: "linear ft",
      baseLow: 60, baseHigh: 140, min: 5500,
      subQuestion: "Material?",
      context: "Retaining walls are priced by the linear foot, from **$60–$140 per linear foot**. Poured concrete and stone veneer are the highest-cost materials.",
      options: [
        { label: "CMU Block", factor: 1.0 },
        { label: "Stone Veneer", factor: 1.8 },
        { label: "Poured Concrete", factor: 1.6 }
      ]
    },

    "siding": {
      label: "Siding Install",
      emoji: "🏘",
      unit: "sq ft",
      baseLow: 6.5, baseHigh: 12.5, min: 6500,
      subQuestion: "Material?",
      context: "Siding replacement runs from **$6.50–$12.50 per sq ft** for labor and material. Vinyl is the cheapest, Fiber Cement (Hardie) is the most expensive.",
      options: [
        { label: "Vinyl (Standard)", factor: 1.0 },
        { label: "Vinyl (Insulated)", factor: 1.4 },
        { label: "Fiber Cement (Hardie)", factor: 1.8 }
      ]
    }
  };

  /* -----------------------------------
     SMART ADD-ONS CONFIGURATION (INTEGRATED FROM hammer-smart-addons-v1.js)
  ----------------------------------- */
  const SMART_ADDONS_CONFIG = {
    masonry: {
      title: "Masonry · Pavers · Concrete",
      groups: {
        luxury: [
          { label: "Premium border band with contrasting pavers", low: 900, high: 2200, note: "Adds a designer frame to walkways, patios, or driveways." },
          { label: "Decorative inlays or medallion pattern", low: 850, high: 2600, note: "Custom shapes, logos, or patterns for higher curb appeal." },
          { label: "Raised seating wall or planter", low: 1800, high: 4800, note: "Creates a built-in sitting or planting area along the patio or yard." },
          { label: "Outdoor kitchen prep pad (gas/electric ready)", low: 2200, high: 6800, note: "Reinforced pad and rough-in for a future outdoor kitchen or bar." }
        ],
        protection: [
          { label: "Full base compaction upgrade", low: 850, high: 2200, note: "Extra gravel, compaction, and geotextile for longer-lasting work." },
          { label: "Perimeter drain or channel drain", low: 950, high: 2600, note: "Helps move water away from the house, steps, or driveway." },
          { label: "Concrete edge restraint / curb", low: 650, high: 1600, note: "Keeps pavers locked in and reduces shifting or spreading." }
        ],
        design: [
          { label: "Color upgrade / multi-blend pavers", low: 650, high: 1900, note: "Premium color ranges and blends beyond standard stock options." },
          { label: "Large-format or European-style pavers", low: 1500, high: 5200, note: "Modern oversized pavers with tighter joints and clean lines." },
          { label: "Step face stone veneer upgrade", low: 1100, high: 3600, note: "Applies stone veneer to exposed step faces and risers." }
        ],
        speed: [
          { label: "Weekend or off-hours install (where allowed)", low: 850, high: 2600, note: "Adds extra crew or overtime to speed up completion." },
          { label: "Phased work scheduling", low: 450, high: 1200, note: "Plan project in phases so driveways and entries stay usable." }
        ],
        maintenance: [
          { label: "Polymeric sand refill & joint tightening", low: 250, high: 650, note: "Refreshes joints, reduces weeds, and tightens pavers." },
          { label: "Clean & seal package (pavers or concrete)", low: 450, high: 1800, note: "Helps protect color and surface from stains and salt." },
          { label: "Annual inspection & touch-up visit", low: 350, high: 900, note: "Check joints, sunken areas, and step safety once per year." }
        ]
      }
    },

    driveway: {
      title: "Driveway / Parking Area",
      groups: {
        luxury: [
          { label: "Decorative apron or entry pattern", low: 900, high: 2800, note: "Stamped or paver apron where driveway meets street or sidewalk." },
          { label: "Heated driveway rough-in (conduit only)", low: 2800, high: 7800, note: "Prep for a future heated driveway system where allowed." },
          { label: "Integrated lighting at edges", low: 950, high: 2600, note: "Low-voltage lighting along driveway edges or retaining walls." }
        ],
        protection: [
          { label: "Thicker base / driveway reinforcement", low: 1200, high: 3500, note: "Upgraded gravel and reinforcement for heavy vehicles." },
          { label: "Drain basin or trench drain at garage", low: 950, high: 2600, note: "Helps prevent water from entering garage or basement." }
        ],
        design: [
          { label: "Two-tone driveway with borders", low: 1500, high: 4200, note: "Main field color plus contrasting border or tire track bands." },
          { label: "Stamped concrete pattern upgrade", low: 1800, high: 5200, note: "Simulates stone, slate, or brick with colored stamp patterns." }
        ],
        speed: [
          { label: "Temporary parking pad during work", low: 650, high: 1600, note: "Gravel pad or temporary area while main driveway is closed." }
        ],
        maintenance: [
          { label: "Sealcoat package (asphalt)", low: 450, high: 900, note: "Protects asphalt finish and slows down wear." },
          { label: "First-year checkup & joint touch-up", low: 350, high: 900, note: "Inspect for settlement, cracking, and proper drainage after winter." }
        ]
      }
    },

    roofing: {
      title: "Roofing – Shingle / Flat",
      groups: {
        luxury: [
          { label: "Architectural or designer shingle upgrade", low: 1800, high: 5200, note: "Heavier, dimensional shingles with longer warranties." },
          { label: "Decorative metal accent roofing", low: 2200, high: 7800, note: "Metal panels at dormers, porches, or entry roofs." }
        ],
        protection: [
          { label: "Full ice & water shield upgrade", low: 1500, high: 4200, note: "Enhances leak protection in valleys and eave areas." },
          { label: "High-performance synthetic underlayment", low: 650, high: 1900, note: "Replaces standard felt for better water resistance." },
          { label: "Premium flashing & chimney reflashing", low: 900, high: 2600, note: "Extra attention around chimneys, skylights, and walls." }
        ],
        design: [
          { label: "Color-matched drip edge & accessories", low: 450, high: 1200, note: "Coordinates trims and vents with shingle color." },
          { label: "Decorative ridge cap upgrade", low: 650, high: 1600, note: "Thicker ridge caps with enhanced visual profile." }
        ],
        speed: [
          { label: "One-day tear-off & install (where feasible)", low: 1500, high: 4500, note: "Extra crew to try completing standard roof in one day." }
        ],
        maintenance: [
          { label: "Annual roof inspection & tune-up", low: 350, high: 900, note: "Check flashing, sealants, small nail pops, and ventilation." },
          { label: "Gutter cleaning added to roof project", low: 250, high: 650, note: "Clean gutters and downspouts while roof is being replaced." }
        ]
      }
    },

    painting: {
      title: "Interior Painting",
      groups: {
        luxury: [
          { label: "Feature wall with texture or wallpaper", low: 900, high: 2800, note: "Adds a focal wall with specialized paint technique or paper." },
          { label: "Enamel trim package (doors & baseboards)", low: 1200, high: 4800, note: "High-gloss or semi-gloss enamel on all trim for durability." }
        ],
        protection: [
          { label: "Full lead-safe containment & monitoring", low: 1500, high: 3500, note: "Dedicated safety crew and air monitoring (required for older homes)." },
          { label: "Minor spackle/crack repair allowance", low: 650, high: 1800, note: "Time set aside for pre-paint repairs beyond Level 4 finish." }
        ],
        design: [
          { label: "Designer color consultation", low: 350, high: 900, note: "Professional advice on color palettes and lighting compatibility." }
        ],
        speed: [
          { label: "Off-hours/weekend work allowance", low: 1200, high: 3500, note: "Adds crew or overtime to minimize household disruption." }
        ],
        maintenance: [
          { label: "Touch-up kit and color-matched paint storage", low: 250, high: 650, note: "Small cans of all colors labeled and stored for later use." }
        ]
      }
    },

    exterior_paint: {
      title: "Exterior Painting",
      groups: {
        luxury: [
          { label: "Premium stucco or masonry paint line", low: 1800, high: 5200, note: "Higher-end paints with better UV protection and durability." },
          { label: "Detailed trim work in contrasting color", low: 900, high: 2800, note: "Architectural trim details painted in a second, coordinating color." }
        ],
        protection: [
          { label: "Full power wash & mold/mildew treatment", low: 650, high: 1900, note: "Deep clean before painting, critical for long-lasting results." },
          { label: "Extended prep for peeling paint areas", low: 1500, high: 4200, note: "Extra scraping, sanding, and priming time for poor surfaces." }
        ],
        design: [
          { label: "Design rendering of color options", low: 450, high: 1200, note: "Computer-generated previews of chosen colors on your home." }
        ],
        speed: [
          { label: "Dedicated crew for rapid completion", low: 1800, high: 4800, note: "Extra team members to compress the schedule." }
        ],
        maintenance: [
          { label: "First-year inspection & touch-up visit", low: 350, high: 900, note: "Check for caulk cracks and adhesion after one season." }
        ]
      }
    },

    basement_floor: {
      title: "Basement Floor Paint / Epoxy",
      groups: {
        luxury: [
          { label: "Custom metallic or pearl finish", low: 1500, high: 4200, note: "High-end, multi-coat epoxy with a reflective, deep finish." },
          { label: "Integrated utility or logo decal", low: 450, high: 1200, note: "Embed a brand logo or pattern into the floor system." }
        ],
        protection: [
          { label: "Advanced moisture vapor barrier", low: 950, high: 2600, note: "Extra layer of protection for high-humidity or below-grade areas." },
          { label: "Urethane topcoat (high-wear areas)", low: 650, high: 1900, note: "Adds a durable clear coat for laundry rooms, storage areas, or steps." }
        ],
        design: [
          { label: "Full flake broadcast with custom colors", low: 650, high: 1900, note: "Heavy broadcast of flakes for texture and color depth." },
          { label: "Cove base (wall-to-floor sealant)", low: 850, high: 2200, note: "Seamlessly transitions floor up the wall for easier cleaning." }
        ],
        speed: [
          { label: "Accelerated cure system", low: 450, high: 1200, note: "Allows for faster walk-on and vehicle traffic return." }
        ],
        maintenance: [
          { label: "Clean & Wax package (first year)", low: 350, high: 900, note: "One professional cleaning and light top-coat application." }
        ]
      }
    },

    fence: {
      title: "Fence Install",
      groups: {
        luxury: [
          { label: "Custom design or architectural pickets", low: 900, high: 2800, note: "Higher-end design elements versus standard pickets." },
          { label: "Integrated lighting posts (low voltage)", low: 1200, high: 3500, note: "Adds lighting to fence posts for safety and aesthetics." }
        ],
        protection: [
          { label: "Metal post base upgrade (concrete set)", low: 650, high: 1900, note: "Ensures posts are set in concrete with metal bases for longevity." },
          { label: "Heavy-duty locking gate hardware", low: 450, high: 1200, note: "Upgraded hinges, latches, and locking mechanisms." }
        ],
        design: [
          { label: "Two-tone stain or paint finish", low: 650, high: 1900, note: "Pickets one color, posts/rails a contrasting color." }
        ],
        speed: [
          { label: "Temporary safety fence during project", low: 450, high: 1200, note: "Keeps pets and kids secure while old fence is removed." }
        ],
        maintenance: [
          { label: "First-year stain/sealant touch-up", low: 350, high: 900, note: "Re-apply sealant on any exposed joints or cuts after the first year." }
        ]
      }
    },

    deck: {
      title: "Deck / Patio Build or Rebuild",
      groups: {
        luxury: [
          { label: "Designer railing system (cable or glass)", low: 2500, high: 7800, note: "Modern, high-end railings that increase view and value." },
          { label: "Integrated deck lighting package", low: 1500, high: 4200, note: "LED lighting on steps, posts, and perimeter." },
          { label: "Custom-cut border or picture frame deck design", low: 1200, high: 3500, note: "Uses contrasting boards to frame the perimeter." }
        ],
        protection: [
          { label: "Below-deck drainage system", low: 1800, high: 5200, note: "Captures water under the deck to keep the patio below dry." },
          { label: "Joist and beam tape protection", low: 650, high: 1900, note: "Protects wood framing from water, increasing its lifespan." }
        ],
        design: [
          { label: "Dual-level or multi-zone design", low: 2800, high: 8500, note: "Creates separate areas for dining, lounging, and grilling." },
          { label: "Integrated planters or built-in seating", low: 1500, high: 4200, note: "Custom bench seating or built-in flower beds." }
        ],
        speed: [
          { label: "Dedicated demo/prep crew for rapid start", low: 900, high: 2600, note: "Speeds up the initial tear-down and foundation phase." }
        ],
        maintenance: [
          { label: "First-year cleaning & sealant application", low: 450, high: 1200, note: "Professional clean and re-seal for wood decks after first winter." }
        ]
      }
    },

    windows: {
      title: "Windows & Exterior Doors",
      groups: {
        luxury: [
          { label: "Premium hardware / custom locks", low: 450, high: 1200, note: "Upgraded handles, hinges, and multipoint locks." },
          { label: "Integrated window shades or blinds (conduit only)", low: 900, high: 2800, note: "Rough-in wiring for future smart shades." }
        ],
        protection: [
          { label: "Full sill pan and flashing system", low: 850, high: 2200, note: "Crucial for preventing water leaks and rot around the new frame." },
          { label: "Low-E glass upgrade (Energy Star Max)", low: 650, high: 1900, note: "Highest energy-efficiency glass coating for max savings." }
        ],
        design: [
          { label: "Interior trim/casing repair or refresh", low: 650, high: 1600, note: "Touch-up or replacement of interior window trims." },
          { label: "Factory color finish upgrade", low: 1100, high: 3600, note: "Custom exterior color from factory vs. standard white/tan." }
        ],
        speed: [
          { label: "Multi-crew simultaneous install", low: 900, high: 2600, note: "Multiple crews working at once to compress schedule." }
        ],
        maintenance: [
          { label: "Touch-up visit within 12 months", low: 350, high: 900, note: "Includes minor nicks, scuffs, and caulk cracks." }
        ]
      }
    },

    kitchen: {
      title: "Kitchen Remodel",
      groups: {
        luxury: [
          { label: "Pot filler faucet at stove", low: 950, high: 2600, note: "Dedicated cold water tap over the stove area." },
          { label: "Custom range hood and ventilation", low: 1800, high: 4800, note: "Statement hood with tile or panel surround." },
          { label: "Integrated LED cabinet lighting", low: 1200, high: 3500, note: "Under-cabinet and in-cabinet lighting systems." }
        ],
        protection: [
          { label: "Full water leak sensor system", low: 450, high: 1200, note: "Sensors under sink, dishwasher, and fridge with alerts." },
          { label: "Dedicated appliance circuits (new wiring)", low: 900, high: 2800, note: "Ensures heavy-draw appliances have proper wiring." }
        ],
        design: [
          { label: "Custom island build with seating", low: 2200, high: 6800, note: "Island tailored to the space with custom storage and seating." },
          { label: "Premium tile backsplash upgrade", low: 1500, high: 4200, note: "Complex pattern or high-end material like marble or glass." }
        ],
        speed: [
          { label: "Temporary sink / counter setup", low: 650, high: 1900, note: "Helps keep basic kitchen function during remodel." }
        ],
        maintenance: [
          { label: "First-year inspection & adjustment", low: 350, high: 900, note: "Check cabinet doors, drawers, and appliance fittings after settling." }
        ]
      }
    },

    bath: {
      title: "Bathroom Remodel",
      groups: {
        luxury: [
          { label: "Full glass shower enclosure upgrade", low: 1800, high: 4200, note: "Frameless or semi-frameless custom glass." },
          { label: "Heated floor system", low: 1200, high: 3500, note: "Electric radiant heating under the tile floor." },
          { label: "Built-in tile niche / storage shelf", low: 650, high: 1900, note: "Custom-sized shower niches for soap and products." }
        ],
        protection: [
          { label: "Dedicated moisture/ventilation upgrade", low: 900, high: 2600, note: "High-CFM fan and dedicated moisture-resistant drywall." },
          { label: "Full waterproofing membrane (Schluter or similar)", low: 1500, high: 4200, note: "Premium waterproofing system for shower/tub areas." }
        ],
        design: [
          { label: "Custom vanity / floating vanity install", low: 950, high: 2600, note: "High-end, custom-sized or wall-mounted vanity." },
          { label: "Premium hardware / custom lighting package", low: 650, high: 1900, note: "Upgraded faucets, shower heads, and designer fixtures." }
        ],
        speed: [
          { label: "Dedicated demo/prep crew for rapid start", low: 900, high: 2600, note: "Minimizes the time the bathroom is out of service." }
        ],
        maintenance: [
          { label: "Grout cleaning & sealing package (first year)", low: 350, high: 900, note: "Professional clean and seal of all tile grout lines." }
        ]
      }
    },

    siding: {
      title: "Siding – Exterior",
      groups: {
        luxury: [
          { label: "Stone or brick accent wall", low: 3500, high: 9800, note: "Upgrades one key wall or entry area with masonry veneer." },
          { label: "Board-and-batten or mixed cladding look", low: 2200, high: 6800, note: "Mixes textures for a custom exterior design." }
        ],
        protection: [
          { label: "Full house wrap / moisture barrier upgrade", low: 950, high: 2800, note: "Improves moisture protection behind siding." },
          { label: "Flashing and sill pan upgrade at windows", low: 900, high: 2600, note: "Reduces risk of water intrusion at openings." }
        ],
        design: [
          { label: "Premium color or insulated siding line", low: 2600, high: 7800, note: "Higher-end siding with richer colors or built-in insulation." },
          { label: "Decorative trim and crown details", low: 1500, high: 4200, note: "Custom trims around windows, doors, and corners." }
        ],
        speed: [
          { label: "Staged / phased install by elevation", low: 450, high: 1200, note: "Work in phases so parts of home stay less impacted." }
        ],
        maintenance: [
          { label: "Annual siding wash & inspection", low: 350, high: 900, note: "Light wash plus caulk and joint inspection once per year." }
        ]
      }
    }
  };

  const SMART_ADDON_GROUP_LABELS = {
    luxury: "Luxury Upgrades",
    protection: "Protection & Safety",
    design: "Design Enhancements",
    speed: "Speed / Convenience",
    maintenance: "Maintenance Items"
  };

  // --- GLOBAL STATE -------------------------------------------

  var state = {
    chatOpen: false,
    name: null,
    phone: null,
    email: null,
    isFirstProject: true,
    projects: [],
    serviceKey: null,
    borough: null,
    size: null,
    subOption: null,
    pricingMode: "full",
    isRush: false,
    isLeadHome: false,
    promoCode: "",
    hasDebrisRemoval: false,
    addons: []
  };

  // --- ELEMENTS -----------------------------------------------

  var els = {};

  function createInterface() {
    // FAB Button
    els.fab = document.createElement("button");
    els.fab.className = "hb-chat-fab";
    els.fab.innerHTML = '<span class="hb-icon">💬</span> <span class="hb-text">Estimate AI</span>';
    els.fab.onclick = toggleChat;
    document.body.appendChild(els.fab);

    // Chat Wrapper
    els.wrapper = document.createElement("div");
    els.wrapper.className = "hb-chat-wrapper";
    els.wrapper.style.display = "none";
    document.body.appendChild(els.wrapper);

    // Chat Header
    els.header = document.createElement("div");
    els.header.className = "hb-chat-header";
    els.header.innerHTML = `
      <div class="hb-header-info">
        <div class="hb-logo">🔨 Hammer Brick & Home AI</div>
        <div class="hb-status">Online</div>
      </div>
      <button class="hb-close">X</button>
    `;
    els.wrapper.appendChild(els.header);
    els.close = els.header.querySelector(".hb-close");
    els.close.onclick = toggleChat;

    // Chat Body
    els.body = document.createElement("div");
    els.body.className = "hb-chat-body";
    els.wrapper.appendChild(els.body);

    // Chat Progress Bar
    els.progress = document.createElement("div");
    els.progress.className = "hb-progress-bar";
    els.progress.style.width = "0%";
    els.header.appendChild(els.progress);

    // Chat Footer (Input Area)
    els.footer = document.createElement("div");
    els.footer.className = "hb-chat-footer";
    els.footer.innerHTML = `
      <input type="text" class="hb-chat-input" placeholder="Type your answer...">
      <button class="hb-chat-send">➤</button>
      <input type="file" id="hb-photo-input" accept="image/*" multiple style="display:none;">
    `;
    els.wrapper.appendChild(els.footer);
    els.input = els.footer.querySelector(".hb-chat-input");
    els.send = els.footer.querySelector(".hb-chat-send");
    els.photoInput = els.footer.querySelector("#hb-photo-input");

    // Event listener for Enter key in input
    els.input.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        els.send.click();
      }
    });

    // Handle photo selection (just tracks the count for now)
    els.photoInput.onchange = function(e) {
      const count = e.target.files.length;
      if (count > 0) {
        addUserMessage(`Uploaded ${count} photo(s).`, false);
      }
    };
  }


  // --- UTILS --------------------------------------------------

  function formatMoney(num) {
    if (isNaN(num)) return "$0";
    return "$" + Math.round(num).toLocaleString("en-US");
  }

  function addBotMessage(text, isTyping = true) {
    const msg = document.createElement("div");
    msg.className = "hb-msg hb-msg-bot";
    els.body.appendChild(msg);
    els.body.scrollTop = els.body.scrollHeight;

    if (isTyping) {
      // Typing effect
      let i = 0;
      msg.textContent = "";
      const interval = setInterval(() => {
        if (i < text.length) {
          msg.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(interval);
        }
        els.body.scrollTop = els.body.scrollHeight;
      }, 15);
    } else {
      msg.textContent = text;
    }
  }

  function addUserMessage(text) {
    const msg = document.createElement("div");
    msg.className = "hb-msg hb-msg-user";
    msg.textContent = text;
    els.body.appendChild(msg);
    els.body.scrollTop = els.body.scrollHeight;
  }

  function addChoices(options, callback) {
    els.input.disabled = true;
    els.input.placeholder = "Select an option...";

    const choiceContainer = document.createElement("div");
    choiceContainer.className = "hb-choice-container";

    options.forEach(option => {
      const chip = document.createElement("button");
      chip.className = "hb-chip";
      chip.textContent = option.label;
      chip.onclick = function() {
        // Clear all previous choices and the new container
        const chips = els.body.querySelectorAll(".hb-chip");
        chips.forEach(c => c.remove());
        choiceContainer.remove();

        addUserMessage(option.label);
        callback(option);
      };
      choiceContainer.appendChild(chip);
    });

    els.body.appendChild(choiceContainer);
    els.body.scrollTop = els.body.scrollHeight;
  }

  function enableInput(callback) {
    els.input.disabled = false;
    els.input.placeholder = "Type your answer...";
    els.input.focus();

    // Reset send button listener
    var newSend = els.send.cloneNode(true);
    els.send.parentNode.replaceChild(newSend, els.send);
    els.send = newSend;

    els.send.onclick = function() {
      var val = els.input.value.trim();
      if (!val) return;
      addUserMessage(val);
      els.input.value = "";
      els.input.disabled = true;
      els.input.placeholder = "Please wait...";
      callback(val);
    };
  }

  function handleManualInput(prompt, validationRegex, nextStep) {
    addBotMessage(prompt);
    enableInput(function(response) {
      if (validationRegex.test(response)) {
        nextStep(response);
      } else {
        addBotMessage("That doesn't look like a valid format. Please re-enter.");
        handleManualInput(prompt, validationRegex, nextStep); // Recursive call
      }
    });
  }

  function toggleChat() {
    state.chatOpen = !state.chatOpen;
    if (state.chatOpen) {
      els.wrapper.style.display = "flex";
      els.fab.style.display = "none";
      sessionStorage.setItem("hb_chat_active", "true");
      els.body.scrollTop = els.body.scrollHeight; // Scroll to bottom on open
    } else {
      els.wrapper.style.display = "none";
      els.fab.style.display = "flex";
      sessionStorage.setItem("hb_chat_active", "false");
    }
  }

  function updateProgress(percent) {
    els.progress.style.width = percent + "%";
  }

  // Helper to calculate add-on totals for a specific project
  function calculateAllSmartAddonsForProject(addons) {
    let totalLow = 0;
    let totalHigh = 0;
    addons.forEach(addon => {
        totalLow += addon.low || 0;
        totalHigh += addon.high || 0;
    });
    return { totalLow, totalHigh };
  }


  // --- ESTIMATE CALCULATION -----------------------------------

  /**
   * Calculates the low and high range for the current project step.
   * Includes the project cost, debris removal (if selected), and smart add-ons (if selected).
   * @returns {{low: number, high: number}}
   */
  function calculateEstimate() {
    var est = state.projects[state.projects.length - 1];
    var svc = SERVICES[est.serviceKey];
    var sub = est.subOption;

    // 1. Calculate Base Project Cost
    var low = 0;
    var high = 0;
    var mod = BOROUGH_MODS[est.borough] || 1.0;

    if (svc.unit === "fixed") {
      // Handles fixed price service
      low = (sub.fixedLow || 0) * mod;
      high = (sub.fixedHigh || 0) * mod;

      // Handle fixed services where size is used (e.g., windows count)
      if (est.size && est.size > 1) {
        low *= est.size;
        high *= est.size;
      }

    } else {
      // Logic for unit-based services (sq ft, linear ft)
      var rateLow = svc.baseLow;
      var rateHigh = svc.baseHigh;
      if (sub.factor) {
        rateLow *= sub.factor;
        rateHigh *= sub.factor;
      }
      low = est.size * rateLow * mod;
      high = est.size * rateHigh * mod;
    }

    // Apply minimum price if unit-based and calculated price is less than min
    if (svc.min && svc.unit !== "fixed" && low < svc.min) {
      low = svc.min;
      high = svc.min + (high - low); // Maintain the original spread
    }

    // 2. Add Debris Removal Cost
    if (est.hasDebrisRemoval) {
      low += ADD_ON_PRICES.debrisRemoval.low;
      high += ADD_ON_PRICES.debrisRemoval.high;
    }

    // 3. Add Smart Add-ons Cost
    if (est.addons && est.addons.length > 0) {
      const { totalLow: addonLow, totalHigh: addonHigh } = calculateAllSmartAddonsForProject(est.addons);
      low += addonLow;
      high += addonHigh;
    }


    // 4. Apply Rush/Promo Modifiers
    if (est.isRush) {
      low *= 1.15;
      high *= 1.15;
    }
    if (est.promoCode && DISCOUNTS[est.promoCode]) {
      var discount = DISCOUNTS[est.promoCode];
      low *= (1 - discount);
      high *= (1 - discount);
    }

    // Update the stored project
    est.low = low;
    est.high = high;

    return { low: low, high: high };
  }


  function computeGrandTotal() {
    let totalLow = 0;
    let totalHigh = 0;

    state.projects.forEach(function(p) {
      if (p.low && p.high) {
        totalLow += p.low;
        totalHigh += p.high;
      }
    });

    return { totalLow: totalLow, totalHigh: totalHigh };
  }

  // --- FLOW STEPS --------------------------------------------

  // Step 1: Mandatory Disclaimer
  function stepOne_Disclaimer() {
    updateProgress(10);
    addBotMessage("Hi there! I'm the Hammer Brick & Home AI. Before we begin, please note that the following is a **preliminary estimate** based on industry averages and the details you provide. A final, binding quote requires an on-site walkthrough.", false);
    setTimeout(function() {
      addChoices([{ label: "✅ I understand, continue", value: true }], function() {
        stepTwo_Name();
      });
    }, 1500);
  }

  // Step 2: Name
  function stepTwo_Name() {
    updateProgress(20);
    handleManualInput("First, what is your name?", /^[a-zA-Z\s]{2,}$/, function(name) {
      state.name = name;
      stepThree_Service();
    });
  }

  // Step 3: Service Selection
  function stepThree_Service() {
    updateProgress(30);

    const message = state.isFirstProject
      ? "Great, " + state.name + "! What kind of project are you looking to estimate today?"
      : "Okay, what is the next project we should add to your list?";

    addBotMessage(message);

    const serviceOptions = Object.keys(SERVICES).map(key => ({
      label: SERVICES[key].emoji + " " + SERVICES[key].label,
      value: key
    }));

    addChoices(serviceOptions, function(choice) {
      state.serviceKey = choice.value;
      // Initialize new project object
      state.projects.push({
        serviceKey: state.serviceKey,
        low: 0,
        high: 0,
        isRush: false,
        promoCode: "",
        hasDebrisRemoval: false,
        addons: []
      });
      stepFour_SubOption();
    });
  }

  // Step 4: Sub-Option/Finish
  function stepFour_SubOption() {
    updateProgress(45);
    const svc = SERVICES[state.serviceKey];

    if (!svc.options) {
      // Skip sub-option if not available (e.g., Power Washing)
      state.subOption = { label: "N/A", factor: 1.0 };
      stepFive_Size();
      return;
    }

    addBotMessage(`Your ${svc.label} project context: ${svc.context}`, false);
    setTimeout(function() {
      addBotMessage(`${svc.subQuestion}`);
      const options = svc.options.map(opt => ({
        label: opt.label,
        value: opt
      }));
      addChoices(options, function(choice) {
        state.projects[state.projects.length - 1].subOption = choice.value;
        state.subOption = choice.value;

        // Check for Lead-Safe requirement
        if (svc.leadSensitive) {
          stepFive_LeadSafe();
        } else {
          stepSix_Size();
        }
      });
    }, 1000);
  }

  // Step 5: Lead Safe Check (only for applicable projects)
  function stepFive_LeadSafe() {
    updateProgress(50);
    addBotMessage("Your project is for interior paint. Is this home built before 1978 (requiring EPA Lead-Safe Certification)?");
    const opts = [
      { label: "✅ Yes (Before 1978)", value: true },
      { label: "❌ No (After 1978)", value: false }
    ];
    addChoices(opts, function(choice) {
      state.projects[state.projects.length - 1].isLeadHome = choice.value;
      state.isLeadHome = choice.value;
      stepSix_Size();
    });
  }


  // Step 6: Size/Quantity
  function stepSix_Size() {
    updateProgress(65);
    const svc = SERVICES[state.serviceKey];

    if (svc.unit === "fixed") {
      // For fixed-price services (Kitchen, Bath, Doors)
      if (svc.label.includes("Window") || svc.label.includes("Door")) {
        // Special case: Windows/Doors need a count
        handleManualInput(`How many ${svc.label.toLowerCase()} units are we installing? (e.g., 5)`, /^\d+$/, function(size) {
          state.projects[state.projects.length - 1].size = parseInt(size);
          state.size = parseInt(size);
          stepSeven_Borough();
        });
      } else {
        // For standard fixed projects (Kitchen/Bath), size is 1
        state.projects[state.projects.length - 1].size = 1;
        state.size = 1;
        stepSeven_Borough();
      }
    } else {
      // For unit-based services (sq ft, linear ft)
      handleManualInput(`What is the estimated size of the area in ${svc.unit} (e.g., 850)? Enter a number only.`, /^\d+$/, function(size) {
        state.projects[state.projects.length - 1].size = parseInt(size);
        state.size = parseInt(size);
        stepSeven_Borough();
      });
    }
  }

  // Step 7: Borough Selection
  function stepSeven_Borough() {
    updateProgress(75);
    addBotMessage("Which borough or area is the project located in? This helps factor in local logistics and permit costs.");
    const options = Object.keys(BOROUGH_MODS).map(key => ({
      label: key,
      value: key
    }));
    addChoices(options, function(choice) {
      state.projects[state.projects.length - 1].borough = choice.value;
      state.borough = choice.value;
      stepEight_Rush();
    });
  }

  // Step 8: Rush Service
  function stepEight_Rush() {
    updateProgress(80);
    addBotMessage("Do you need this project completed on a **rush schedule** (within 4 weeks), which may include a premium of up to 15%?");
    const opts = [
      { label: "⚡ Yes, I need a rush job", value: true },
      { label: "🗓 No, standard timing is fine", value: false }
    ];
    addChoices(opts, function(choice) {
      state.projects[state.projects.length - 1].isRush = choice.value;
      state.isRush = choice.value;
      stepNine_Promo();
    });
  }

  // Step 9: Promo Code
  function stepNine_Promo() {
    updateProgress(85);
    addBotMessage("Do you have a special promo code or discount you'd like to apply? (Type the code, or type 'No')");
    enableInput(function(response) {
      const code = response.toUpperCase().trim();
      const project = state.projects[state.projects.length - 1];

      if (code in DISCOUNTS) {
        project.promoCode = code;
        state.promoCode = code;
        addBotMessage(`Successfully applied promo code **${code}**! (${DISCOUNTS[code] * 100}% off)`);
      } else if (code === 'NO' || code === '') {
        project.promoCode = "";
        state.promoCode = "";
        addBotMessage("No problem. No code applied.");
      } else {
        project.promoCode = "";
        state.promoCode = "";
        addBotMessage(`Code **${code}** is not recognized. Continuing without discount.`);
      }
      setTimeout(stepTen_DebrisRemoval, 800);
    });
  }

  // Step 10: Debris Removal Add-On (Old Step 9, now Step 10)
  function stepTen_DebrisRemoval() {
    updateProgress(88);
    const svc = SERVICES[state.serviceKey];
    if (svc && svc.unit) {
      const message = "We need to factor in debris removal and haul-off (e.g., dumpster rental, labor). Should we include an allowance of " + formatMoney(ADD_ON_PRICES.debrisRemoval.low) + " – " + formatMoney(ADD_ON_PRICES.debrisRemoval.high) + " for this?";
      addBotMessage(message);
      const opts = [
        { label: "✅ Yes, include removal", value: true },
        { label: "❌ No, I'll handle debris", value: false }
      ];

      addChoices(opts, function(choice) {
        state.projects[state.projects.length - 1].hasDebrisRemoval = choice.value;
        stepEleven_SmartAddons();
      });
    } else {
      state.projects[state.projects.length - 1].hasDebrisRemoval = false;
      stepEleven_SmartAddons();
    }
  }

  // Step 11: Smart Add-Ons (New Step 11)
  function stepEleven_SmartAddons() {
    updateProgress(90);
    const svcKey = state.serviceKey;
    const config = SMART_ADDONS_CONFIG[svcKey];

    if (!config) {
      addBotMessage("No optional upgrades are available for " + SERVICES[svcKey].label + " at this time.", false);
      setTimeout(stepTwelve_Finalize, 800);
      return;
    }

    const currentProject = state.projects[state.projects.length - 1];
    currentProject.addons = [];

    addBotMessage("We've generated the base estimate. Now, here are some **optional Smart Add-Ons** for your " + config.title + " project. Select any that you are interested in:", false);

    setTimeout(function() {
      const chipContainer = document.createElement("div");
      chipContainer.className = "hb-smart-addons-container";
      chipContainer.innerHTML = `
        <div class="hb-sa-intro">Check the options you'd like to include in your final estimate range:</div>
      `;

      for (const groupKey in config.groups) {
        const groupLabel = SMART_ADDON_GROUP_LABELS[groupKey] || groupKey.toUpperCase();
        const addons = config.groups[groupKey];

        if (addons.length > 0) {
          let groupHtml = `<div class="hb-sa-group"><h4>${groupLabel}</h4><div class="hb-sa-list">`;
          addons.forEach((addon, idx) => {
            const range = `${formatMoney(addon.low)} – ${formatMoney(addon.high)}`;
            const checkboxId = `sa-${svcKey}-${groupKey}-${idx}`;
            groupHtml += `
              <div class="hb-sa-item">
                <input type="checkbox" id="${checkboxId}" data-low="${addon.low}" data-high="${addon.high}" data-label="${addon.label}">
                <label for="${checkboxId}">
                  <span class="sa-label">${addon.label}</span>
                  <span class="sa-note">${addon.note}</span>
                  <span class="sa-price">${range}</span>
                </label>
              </div>
            `;
          });
          groupHtml += `</div></div>`;
          chipContainer.innerHTML += groupHtml;
        }
      }

      const actionChip = document.createElement("button");
      actionChip.className = "hb-chip hb-chip-continue";
      actionChip.textContent = "✅ Continue to Final Estimate";
      actionChip.onclick = function() {
        const selectedCheckboxes = chipContainer.querySelectorAll('input[type="checkbox"]:checked');
        const selectedAddons = Array.from(selectedCheckboxes).map(cb => ({
          label: cb.dataset.label,
          low: parseFloat(cb.dataset.low),
          high: parseFloat(cb.dataset.high),
          isAddon: true
        }));

        currentProject.addons = selectedAddons;
        chipContainer.remove();
        actionChip.remove();
        addUserMessage(`Added ${selectedAddons.length} Smart Add-Ons.`);
        calculateEstimate();
        stepTwelve_Finalize();
      };

      els.body.appendChild(chipContainer);
      els.body.appendChild(actionChip);
      els.body.scrollTop = els.body.scrollHeight;
    }, 1200);
  }

  // Step 12: Finalize Estimate (Old Step 10, now Step 12)
  function stepTwelve_Finalize() {
    updateProgress(95);

    const project = state.projects[state.projects.length - 1];
    const { low, high } = project;
    const isFixed = SERVICES[project.serviceKey].unit === "fixed";
    const rangeText = low === high ? formatMoney(low) : `${formatMoney(low)} – ${formatMoney(high)}`;

    // Build the receipt card
    const receiptHtml = generateReceiptHtml(project);

    addBotMessage("Here is your estimated cost for the **" + SERVICES[project.serviceKey].label + "** project.", false);

    setTimeout(function() {
      const resultCard = document.createElement("div");
      resultCard.className = "hb-result-card";
      resultCard.innerHTML = `
        <div class="hb-result-range">
          ${isFixed ? 'Fixed Price Estimate' : 'Project Range Estimate'}
          <span class="hb-price-range">${rangeText}</span>
        </div>
        <div class="hb-result-details">
          ${receiptHtml}
        </div>
      `;
      els.body.appendChild(resultCard);
      els.body.scrollTop = els.body.scrollHeight;

      // Ask if they want to add another project
      addBotMessage("Your current estimate is complete. Would you like to add another project to your list?", false);
      const opts = [
        { label: "➕ Yes, add another project", next: stepThree_Service, clear: true },
        { label: "🏁 No, show final total", next: stepThirteen_Contact, clear: false }
      ];

      addChoices(opts, function(choice) {
        if (choice.clear) {
          state.isFirstProject = false;
          // Clear state variables for the next project
          state.serviceKey = null;
          state.size = null;
          state.subOption = null;
          choice.next(); // Calls stepThree_Service
        } else {
          choice.next(); // Calls stepThirteen_Contact
        }
      });
    }, 1000);
  }

  // Step 13: Contact Info (Old Step 11, now Step 13)
  function stepThirteen_Contact() {
    updateProgress(98);
    addBotMessage("To finalize your Grand Total and receive your personalized estimate breakdown, please provide your best email address.");
    handleManualInput("Enter your email:", /^[^\s@]+@[^\s@]+\.[^\s@]+$/, function(email) {
      state.email = email;
      stepFourteen_Phone();
    });
  }

  // Step 14: Phone Number (New Step 14)
  function stepFourteen_Phone() {
    addBotMessage("What is your phone number (for SMS summary and scheduling)?");
    // Simple 10-digit number validation
    handleManualInput("Enter your phone number (digits only, e.g., 9295955300):", /^\d{10}$/, function(phone) {
      state.phone = phone;
      setTimeout(stepFifteen_FinalSummary, 800);
    });
  }

  // Step 15: Final Summary
  function stepFifteen_FinalSummary() {
    updateProgress(100);

    const { totalLow, totalHigh } = computeGrandTotal();
    const rangeText = totalLow === totalHigh ? formatMoney(totalLow) : `${formatMoney(totalLow)} – ${formatMoney(totalHigh)}`;

    addBotMessage("✅ Done! Your Grand Total Estimate is in the range of **" + rangeText + "** for all " + state.projects.length + " project(s).", false);

    setTimeout(function() {
      const summaryCard = document.createElement("div");
      summaryCard.className = "hb-result-card hb-final-summary";
      summaryCard.innerHTML = `
        <div class="hb-result-range">
          Grand Total Estimate
          <span class="hb-price-range">${rangeText}</span>
        </div>
        <div class="hb-final-contact-info">
            <p>We've sent the complete breakdown to **${state.email}** and a summary via SMS to **${state.phone}**.</p>
            <p style="font-size:12px;color:#999;margin-top:10px;">A final, binding quote requires an on-site walkthrough.</p>
        </div>
      `;
      els.body.appendChild(summaryCard);

      // Generate the final output text for CRM/Email
      const finalLinks = generateFinalLinks();
      addBotMessage(finalLinks, false);

      // Final Action Buttons
      if (CRM_FORM_URL) {
        var crmBtn = document.createElement("a");
        crmBtn.className = "hb-chip hb-chip-continue";
        crmBtn.style.display = "block";
        crmBtn.textContent = "✍️ Submit Details to CRM";
        crmBtn.href = CRM_FORM_URL;
        crmBtn.target = "_blank";
        els.body.appendChild(crmBtn);
      }

      if (WALKTHROUGH_URL) {
        var walkBtn = document.createElement("a");
        walkBtn.className = "hb-chip";
        walkBtn.style.display = "block";
        walkBtn.style.marginTop = "8px";
        walkBtn.textContent = "📅 Book a Walkthrough";
        walkBtn.href = WALKTHROUGH_URL;
        walkBtn.target = "_blank";
        els.body.appendChild(walkBtn);
      }

      // Photo button (triggers hidden input)
      var photoBtn = document.createElement("button");
      photoBtn.className = "hb-chip";
      photoBtn.style.display = "block";
      photoBtn.style.marginTop = "8px";
      photoBtn.textContent = "📷 Add Photos";
      photoBtn.onclick = function() {
        if (els.photoInput) els.photoInput.click();
      };
      els.body.appendChild(photoBtn);

      els.body.scrollTop = els.body.scrollHeight;
    }, 500);
  }

  // --- RECEIPT & LINKS ----------------------------------------

  /**
   * Generates the HTML receipt card for a single project
   */
  function generateReceiptHtml(est) {
    var svc = SERVICES[est.serviceKey];
    var sub = est.subOption;

    // Base Project Row
    var sizeRow = "";
    if (est.size) {
        const unit = svc.unit === "fixed" && !svc.unit.includes("ft") ? "unit(s)" : svc.unit;
        sizeRow = `
            <div class="hb-receipt-row">
                <span>Base Size/Quantity:</span>
                <span>${est.size.toLocaleString("en-US")} ${unit}</span>
            </div>
        `;
    }

    // Finish Option Row
    var finishRow = `
        <div class="hb-receipt-row">
            <span>Option/Finish:</span>
            <span>${sub.label}</span>
        </div>
    `;

    // Lead Home Row
    var leadRow = "";
    if (est.isLeadHome) {
        leadRow = `
            <div class="hb-receipt-row">
                <span style="color:#d9534f;font-weight:600;">Lead-Safe Protocol:</span>
                <span style="color:#d9534f;font-weight:600;">Included</span>
            </div>
        `;
    }

    // Project Type Row
    var modeRow = `
        <div class="hb-receipt-row">
            <span>Location:</span>
            <span>${est.borough} (${(BOROUGH_MODS[est.borough] - 1) * 100}% logistics mod)</span>
        </div>
    `;

    // Rush Row
    var rushRow = "";
    if (est.isRush) {
        rushRow = `
            <div class="hb-receipt-row">
                <span style="color:#f0ad4e;font-weight:600;">Rush Service:</span>
                <span style="color:#f0ad4e;font-weight:600;">+15% Premium</span>
            </div>
        `;
    }

    // Promo Row
    var promoRow = "";
    if (est.promoCode && DISCOUNTS[est.promoCode]) {
        promoRow = `
            <div class="hb-receipt-row">
                <span style="color:#5cb85c;font-weight:600;">Promo Code (${est.promoCode}):</span>
                <span style="color:#5cb85c;font-weight:600;">-${DISCOUNTS[est.promoCode] * 100}% Discount</span>
            </div>
        `;
    }

    // Debris Row
    var debrisRow = "";
    if (est.hasDebrisRemoval) {
      debrisRow = `
        <div class="hb-receipt-section">
          <h5>🚛 Fixed Add-Ons</h5>
          <div class="hb-receipt-row">
            <span>+ Debris Removal Allowance:</span>
            <span>${formatMoney(ADD_ON_PRICES.debrisRemoval.low)} – ${formatMoney(ADD_ON_PRICES.debrisRemoval.high)}</span>
          </div>
        </div>
      `;
    }

    // NEW: Smart Add-on Breakdown
    var addonHtml = "";
    if (est.addons && est.addons.length > 0) {
      const addonTotals = calculateAllSmartAddonsForProject(est.addons);
      const itemsHtml = est.addons.map(a => `
        <div class="hb-receipt-addon-item">
          <span style="flex:1;">+ ${a.label}</span>
          <span>${formatMoney(a.low)} – ${formatMoney(a.high)}</span>
        </div>
      `).join('');

      addonHtml = `
        <div class="hb-receipt-section">
          <h5>⚡ Optional Smart Add-Ons</h5>
          ${itemsHtml}
          <div class="hb-receipt-row hb-receipt-subtotal">
            <span>Add-On Subtotal:</span>
            <span style="font-weight:700;">${formatMoney(addonTotals.totalLow)} – ${formatMoney(addonTotals.totalHigh)}</span>
          </div>
        </div>
      `;
    }


    // Final receipt structure
    return `
      <div class="hb-receipt-card">
        <h3>${svc.emoji} ${svc.label} Estimate</h3>
        ${sizeRow}
        ${finishRow}
        ${leadRow}
        ${modeRow}
        ${rushRow}
        ${promoRow}
        ${debrisRow}
        ${addonHtml}
        <div class="hb-receipt-final">
          <span>Project Subtotal:</span>
          <span style="font-weight:700;">${formatMoney(est.low)} – ${formatMoney(est.high)}</span>
        </div>
      </div>
    `;
  }

  function generateFinalLinks() {
    updateProgress(100);
    var lines = [];
    lines.push("--- ESTIMATE SUMMARY ---");
    lines.push("Client: " + state.name);
    lines.push("Email: " + state.email);
    lines.push("Phone: " + state.phone);
    lines.push("");
    lines.push("Projects:");

    if (state.projects && state.projects.length) {
      state.projects.forEach(function(p, idx) {
        var svc = SERVICES[p.serviceKey];
        var sub = p.subOption;

        var unitLabel = "";
        if (svc.unit === "fixed" && !svc.unit.includes("ft")) {
            unitLabel = p.size > 1 ? "units" : "unit";
        } else if (svc.unit !== "fixed") {
          unitLabel = svc.unit;
        }

        var sizePart = p.size ? " (" + p.size.toLocaleString("en-US") + " " + unitLabel + ")" : " (Fixed Unit)";
        var areaPart = " in " + p.borough + " with " + p.subOption.label + " finish/option.";
        var addonParts = [];

        // Add Smart Add-ons to the text
        if (p.addons && p.addons.length > 0) {
            addonParts = p.addons.map(a => `\n- SMART ADD-ON: ${a.label} (${formatMoney(a.low)}-${formatMoney(a.high)})`);
        }

        var line = (idx + 1) + ". " + svc.label + sizePart + areaPart;
        if (p.low && p.high) {
          line += " — Range: " + formatMoney(p.low) + "-" + formatMoney(p.high);
        } else {
          line += " — CUSTOM QUOTE REQUIRED";
        }

        if (p.hasDebrisRemoval) {
            line += "\n- FIXED ADD-ON: Debris Removal Included";
        }
        line += addonParts.join('');

        lines.push(line);
      });
    }

    const { totalLow, totalHigh } = computeGrandTotal();
    lines.push("");
    lines.push("GRAND TOTAL ESTIMATE: " + formatMoney(totalLow) + " - " + formatMoney(totalHigh));
    lines.push("---------------------");
    lines.push("Disclaimer: Final quote requires walkthrough. Estimate includes all selected options (Rush, Add-Ons, etc.).");

    return lines.join('\n');
  }

  // --- INIT ---------------------------------------------------

  function init() {
    console.log("HB Chat: Initializing v6.1 (Syntax Fixed)...");
    createInterface();
    if (sessionStorage.getItem("hb_chat_active") === "true") {
      toggleChat();
    }
    // Kick off conversation with the mandatory disclaimer step
    setTimeout(stepOne_Disclaimer, 800);
  }

  // CRITICAL: Call init to start the script and create the FAB
  init();

})();

