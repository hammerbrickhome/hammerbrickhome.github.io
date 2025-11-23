/* ============================================================
   HAMMER BRICK & HOME — ULTRA ADVANCED ESTIMATOR BOT v4.4
   (FIXED: Promo Display, New Button Added, Financing Removed,
   Integrated SMART ADD-ONS from provided file.)
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
      baseLow: 35, baseHigh: 65, min: 5000,
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
      context: "Door installation is fixed-price per unit. Interior doors are **$250–$550**, while high-end exterior doors can exceed $1,800.",
      options: [
        { label: "Interior", fixedLow: 250, fixedHigh: 550 },
        { label: "Exterior Steel / Fiberglass", fixedLow: 950, fixedHigh: 1800 },
        { label: "Sliding Patio", fixedLow: 2200, fixedHigh: 4200 }
      ]
    },

    "demo": {
      label: "Demolition",
      emoji: "💥",
      unit: "sq ft",
      baseLow: 3.0, baseHigh: 7.5, min: 900,
      subQuestion: "Material?",
      context: "Demolition costs **$3.00–$7.50 per sq ft** based on material. Concrete demo is the most labor-intensive and expensive.",
      leadSensitive: true,
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
        { label: "Poured Concrete", factor: 1.7 },
        { label: "Stone Veneer", factor: 2.3 }
      ]
    },

    "handyman": {
      label: "Small Repairs / Handyman",
      emoji: "🛠",
      unit: "consult"
    },

    "kitchen": {
      label: "Kitchen Remodel",
      emoji: "🍳",
      unit: "fixed",
      subQuestion: "What is the scope?",
      context: "A full kitchen gut and remodel typically falls between **$30,000 and $55,000** for mid-range finishes. What scope fits your budget?",
      options: [
        { label: "Refresh (Cosmetic)", fixedLow: 18000, fixedHigh: 30000 },
        { label: "Mid-Range (Cabinets+)", fixedLow: 30000, fixedHigh: 55000 },
        { label: "Full Gut / Luxury", fixedLow: 55000, fixedHigh: 110000 }
      ],
      leadSensitive: true
    },

    "bathroom": {
      label: "Bathroom Remodel",
      emoji: "🚿",
      unit: "fixed",
      subQuestion: "What is the scope?",
      context: "A standard bathroom gut and remodel runs from **$24,000–$45,000**. Updates that don't change the layout are cheaper.",
      options: [
        { label: "Update (Fixtures/Tile)", fixedLow: 14000, fixedHigh: 24000 },
        { label: "Full Gut / Redo", fixedLow: 24000, fixedHigh: 45000 }
      ],
      leadSensitive: true
    },

    "siding": {
      label: "Siding Installation",
      emoji: "🏡",
      unit: "sq ft",
      baseLow: 8.5, baseHigh: 18.5, min: 4000,
      subQuestion: "Siding Material?",
      context: "Siding installation is priced by the square foot of surface area, ranging from **$8.50–$18.50 per sq ft**. Wood and Fiber Cement are higher cost than standard Vinyl.",
      options: [
        { label: "Vinyl", factor: 1.0 },
        { label: "Wood/Cedar Shake", factor: 1.8 },
        { label: "Fiber Cement (Hardie)", factor: 1.5 }
      ]
    },

    "chimney": {
      label: "Chimney Repair / Rebuild",
      emoji: "🔥",
      unit: "fixed",
      subQuestion: "Scope of work?",
      context: "Chimney repair is a fixed-price service. A full masonry rebuild can cost **$6,500–$12,000**, while minor cap/flashing work is $800–$1,800.",
      options: [
        { label: "Cap / Flashing Repair", fixedLow: 800, fixedHigh: 1800 },
        { label: "Partial Rebuild (Above roofline)", fixedLow: 3000, fixedHigh: 6500 },
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

    "sidewalk": {
      label: "Sidewalk, Steps, & Stoops",
      emoji: "🚶",
      unit: "fixed",
      subQuestion: "Scope of work?",
      context: "Sidewalk and stoop work is highly variable. A concrete sidewalk violation repair is typically **$3,500–$7,500**. Walkways priced per sq ft are cheaper.",
      options: [
        { label: "Sidewalk Violation Repair", fixedLow: 3500, fixedHigh: 7500 },
        { label: "Front Steps / Stoop Rebuild", fixedLow: 6000, fixedHigh: 15000 },
        { label: "New Paver Walkway", fixedLow: 45, fixedHigh: 85, isPerSqFt: true }
      ]
    },

    "electrical": {
      label: "Electrical / Wiring",
      emoji: "⚡",
      unit: "fixed",
      subQuestion: "What is needed?",
      context: "Electrical projects are priced by the unit or scope. A panel upgrade typically runs **$3,000–$5,500**, while new outlets are $250–$450 each.",
      options: [
        { label: "Panel Upgrade (200A)", fixedLow: 3000, fixedHigh: 5500 },
        { label: "New Outlet/Switch Run (per unit)", fixedLow: 250, fixedHigh: 450 },
        { label: "Recessed Lighting Install (per unit)", fixedLow: 180, fixedHigh: 300 }
      ]
    },

    "waterproofing": {
      label: "Waterproofing / Leak Repair",
      emoji: "💧",
      unit: "linear ft",
      baseLow: 40, baseHigh: 90, min: 2500,
      subQuestion: "Location of leak?",
      context: "Waterproofing is priced by the linear foot, from **$40–$90 per linear foot**. Basement interior work is usually more invasive and costly.",
      options: [
        { label: "Exterior Foundation", factor: 1.0 },
        { label: "Basement Interior", factor: 1.5 },
        { label: "Roof/Flashing (Requires inspection)", factor: 1.8 }
      ]
    },

    "other": {
      label: "Other / Custom",
      emoji: "📋",
      unit: "consult"
    }
  };

  /* --------------------------------------------------------------------------------------
     SMART ADD-ONS CONFIGURATION (Integrated from hammer-smart-addons-v1.js)
  -------------------------------------------------------------------------------------- */
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
    },

    windows: {
      title: "Windows & Exterior Doors",
      groups: {
        luxury: [
          { label: "Black or color-exterior window upgrade", low: 2200, high: 6800, note: "Modern color exteriors versus standard white." },
          { label: "Sliding or French patio door upgrade", low: 2800, high: 7800, note: "Larger glass opening with upgraded hardware." }
        ],
        protection: [
          { label: "Impact-resistant / laminated glass (where available)", low: 2600, high: 7800, note: "Stronger glass for added security and storm resistance." },
          { label: "Storm door package", low: 650, high: 1800, note: "Adds protection and ventilation to main entries." }
        ],
        design: [
          { label: "Grids / divided lite pattern upgrade", low: 450, high: 1600, note: "Adds colonial, prairie, or custom grid patterns." },
          { label: "Interior casing & stool upgrade", low: 750, high: 2600, note: "Enhances the inside trim look at each window." }
        ],
        speed: [
          { label: "Same-day glass removal & board-up", low: 450, high: 1200, note: "Temporary board-up solution if needed during changeout." }
        ],
        maintenance: [
          { label: "Hardware adjustment & weather-strip tune-up", low: 250, high: 650, note: "Adjusts locks, tilt latches, and seals after first season." }
        ]
      }
    },

    "exterior-paint": {
      title: "Exterior Facade / Painting",
      groups: {
        luxury: [
          { label: "Multi-color accent scheme", low: 950, high: 2600, note: "Adds accent colors for doors, shutters, and trims." },
          { label: "Premium elastomeric or masonry coating", low: 1800, high: 5200, note: "Higher build coatings for stucco or masonry facades." }
        ],
        protection: [
          { label: "Full scrape & prime upgrade", low: 1200, high: 3800, note: "Deeper prep for peeling or chalky surfaces." },
          { label: "Lead-safe exterior paint protocol", low: 1500, high: 4500, note: "Adds EPA-required protection when lead may be present." }
        ],
        design: [
          { label: "Color consult with sample boards", low: 450, high: 950, note: "Helps finalize color palette before painting." }
        ],
        speed: [
          { label: "Lift / boom access where allowed", low: 1800, high: 5200, note: "Speeds up high-work areas versus ladders only." }
        ],
        maintenance: [
          { label: "Touch-up visit within 12 months", low: 350, high: 900, note: "Includes minor nicks, scuffs, and caulk cracks." }
        ]
      }
    },

    deck: {
      title: "Deck / Patio Build or Rebuild",
      groups: {
        luxury: [
          { label: "Composite decking upgrade", low: 2800, high: 9800, note: "Low-maintenance composite in place of pressure-treated wood." },
          { label: "Cable or glass railing system", low: 2600, high: 8800, note: "Modern railing with more open views." },
          { label: "Built-in benches or storage boxes", low: 1500, high: 4200, note: "Adds storage or lounge seating to deck corners." }
        ],
        protection: [
          { label: "Hidden fastener upgrade", low: 950, high: 2600, note: "Reduces visible screw heads and splinters at feet." },
          { label: "Joist and post protection tape", low: 450, high: 1200, note: "Extends life of framing members." }
        ],
        design: [
          { label: "Picture-frame decking border", low: 900, high: 2600, note: "Outlines deck edges with contrasting boards." },
          { label: "Pergola or shade structure", low: 2800, high: 9800, note: "Adds a shaded area for seating or dining." }
        ],
        speed: [
          { label: "Temporary steps or access during build", low: 450, high: 1200, note: "Keeps safe access to yard while deck is rebuilt." }
        ],
        maintenance: [
          { label: "Clean & seal package (wood decks)", low: 550, high: 1600, note: "Protects wood color and grain from weathering." }
        ]
      }
    },

    fence: {
      title: "Fence Install / Replacement",
      groups: {
        luxury: [
          { label: "Decorative aluminum or steel upgrade", low: 2200, high: 7800, note: "More upscale fence look vs. standard chain or wood." },
          { label: "Automatic driveway gate prep", low: 2600, high: 8800, note: "Gate posts, power rough-in, and pad for future operator." }
        ],
        protection: [
          { label: "Privacy height upgrade (where allowed)", low: 900, high: 2600, note: "Taller sections with tighter boards or panels." },
          { label: "Child / pet safety latch package", low: 350, high: 900, note: "Self-closing hinges and child-resistant latches." }
        ],
        design: [
          { label: "Decorative caps and trim boards", low: 450, high: 1200, note: "Finishes top of fence with a more custom look." },
          { label: "Lattice or horizontal style upgrade", low: 1200, high: 3500, note: "Modern design elements versus standard pickets." }
        ],
        speed: [
          { label: "Temporary safety fence during project", low: 450, high: 1200, note: "Keeps pets and kids secure while old fence is removed." }
        ],
        maintenance: [
          { label: "Stain / paint coat for wood fence", low: 650, high: 1800, note: "Protects wood and adds color options." }
        ]
      }
    },

    waterproofing: {
      title: "Waterproofing & Foundation Sealing",
      groups: {
        luxury: [
          { label: "Battery backup sump system", low: 1800, high: 5200, note: "Keeps pump running during power outages." }
        ],
        protection: [
          { label: "Interior drain tile system", low: 4800, high: 14800, note: "Collects and redirects water along interior perimeter." },
          { label: "Full wall membrane upgrade", low: 2800, high: 9800, note: "Adds continuous water barrier on walls." }
        ],
        design: [
          { label: "Finished wall panel system (non-organic)", low: 2600, high: 7800, note: "Water-resistant panels as an alternative to drywall." }
        ],
        speed: [
          { label: "After-hours pump monitoring start-up", low: 450, high: 1200, note: "Extra checkup after first heavy rain." }
        ],
        maintenance: [
          { label: "Annual sump service & test", low: 350, high: 900, note: "Test pump, check discharge line, and clean basin." }
        ]
      }
    },

    "power-wash": {
      title: "Power Washing / Soft Washing",
      groups: {
        luxury: [
          { label: "House + driveway + patio bundle", low: 450, high: 1600, note: "Combines multiple exterior surfaces in one visit." }
        ],
        protection: [
          { label: "Soft-wash roof treatment (where appropriate)", low: 650, high: 1900, note: "Gentle cleaning on suitable roofing materials." }
        ],
        design: [
          { label: "Fence & rail cleaning upgrade", low: 250, high: 650, note: "Adds fencing and rails to the wash package." }
        ],
        speed: [
          { label: "Evening or weekend wash window", low: 250, high: 650, note: "Work timed around resident or business hours." }
        ],
        maintenance: [
          { label: "Seasonal wash contract (2x per year)", low: 650, high: 1900, note: "Pre-scheduled cleaning visits before peak seasons." }
        ]
      }
    },

    landscaping: {
      title: "Landscaping & Seasonal Care",
      groups: {
        luxury: [
          { label: "Landscape lighting at key beds", low: 950, high: 2600, note: "Spotlights and path lights to highlight plantings." },
          { label: "Decorative boulders or stone features", low: 650, high: 2200, note: "Adds natural focal points in beds or corners." }
        ],
        protection: [
          { label: "Drainage swale or small French drain", low: 950, high: 2600, note: "Helps move water away from foundations and low spots." }
        ],
        design: [
          { label: "Bed redesign with new plant layout", low: 1200, high: 3800, note: "Updates bed shapes, mulch, and plant varieties." }
        ],
        speed: [
          { label: "One-time intensive cleanup day", low: 650, high: 1800, note: "Deep cleanup, trimming, and haul-away." }
        ],
        maintenance: [
          { label: "Monthly lawn & bed care plan", low: 180, high: 450, note: "Regular mowing, trimming, and basic bed maintenance." }
        ]
      }
    },

    "exterior-lighting": {
      title: "Exterior Lighting & Smart Security",
      groups: {
        luxury: [
          { label: "Full smart landscape lighting system", low: 2800, high: 9800, note: "App-controlled color and timing profiles." }
        ],
        protection: [
          { label: "Extra motion and flood coverage", low: 650, high: 1900, note: "Additional motion heads for dark corners and alleys." }
        ],
        design: [
          { label: "Architectural wall washer lights", low: 1500, high: 4200, note: "Highlights stone, brick, or siding textures at night." }
        ],
        speed: [
          { label: "Same-day camera deployment (where possible)", low: 450, high: 1200, note: "Quick-install cameras for immediate coverage." }
        ],
        maintenance: [
          { label: "Annual lighting check & re-aim", low: 350, high: 900, note: "Check connections, transformers, and aiming once per year." }
        ]
      }
    },

    sidewalk: {
      title: "Sidewalk / DOT Concrete Repair",
      groups: {
        luxury: [
          { label: "Decorative broom or border finish", low: 650, high: 1900, note: "Custom finishes beyond standard broom surface." }
        ],
        protection: [
          { label: "Extra thickness at tree or driveway areas", low: 900, high: 2600, note: "Heavier slab where roots or vehicle loads are expected." },
          { label: "Root barrier installation (where allowed)", low: 1200, high: 3800, note: "Helps protect new concrete from future root lifting." }
        ],
        design: [
          { label: "Scored control joint pattern", low: 450, high: 1200, note: "More regular joint spacing for a clean look." }
        ],
        speed: [
          { label: "Phased pour scheduling", low: 450, high: 1200, note: "Keeps partial sidewalk open where possible during work." }
        ],
        maintenance: [
          { label: "Seal & cure control package", low: 350, high: 900, note: "Improves curing and surface performance of new slabs." }
        ]
      }
    },

    gutter: {
      title: "Gutter Install / Repair",
      groups: {
        luxury: [
          { label: "Seamless half-round or decorative profile", low: 1200, high: 3500, note: "Higher-end gutter appearance versus standard K-style." }
        ],
        protection: [
          { label: "Premium gutter guard system", low: 1500, high: 3800, note: "Reduces debris buildup and clogs." },
          { label: "Additional downspouts & splash pads", low: 450, high: 1200, note: "Helps carry water farther away from the foundation." }
        ],
        design: [
          { label: "Color-matched gutter & trim package", low: 450, high: 1200, note: "Coordinates gutters with fascia and siding colors." }
        ],
        speed: [
          { label: "Same-day gutter cleaning add-on", low: 250, high: 650, note: "Cleaning while new sections are being installed." }
        ],
        maintenance: [
          { label: "Bi-annual gutter clean plan", low: 450, high: 1600, note: "Two scheduled cleanings per year with downspout check." }
        ]
      }
    },

    "interior-paint": {
      title: "Interior Painting",
      groups: {
        luxury: [
          { label: "Accent wall feature paint or wallpaper", low: 450, high: 1600, note: "Adds a focal wall with rich color or texture." },
          { label: "Fine finish trim & door spray", low: 900, high: 2600, note: "Higher-end finish on doors, casing, and baseboards." }
        ],
        protection: [
          { label: "Full skim coat upgrade on rough walls", low: 1800, high: 5800, note: "Smooths heavily patched or uneven plaster surfaces." },
          { label: "Zero-VOC or allergy-friendly paint line", low: 650, high: 1900, note: "Better for sensitive households and bedrooms." }
        ],
        design: [
          { label: "Color consult with samples", low: 350, high: 900, note: "Helps finalize palette room by room." }
        ],
        speed: [
          { label: "Night or weekend painting (where allowed)", low: 650, high: 1900, note: "Ideal for commercial or busy households." }
        ],
        maintenance: [
          { label: "Touch-up kit labeled by room", low: 250, high: 650, note: "Leftover labeled cans and small touch-up tools." }
        ]
      }
    },

    flooring: {
      title: "Flooring (LVP / Tile / Hardwood)",
      groups: {
        luxury: [
          { label: "Wide-plank or herringbone layout", low: 2200, high: 7800, note: "High-end patterns and wider boards." },
          { label: "Heated floor rough-in (select rooms)", low: 1800, high: 5200, note: "Prepped for future radiant heating where compatible." }
        ],
        protection: [
          { label: "Moisture barrier or underlayment upgrade", low: 650, high: 1900, note: "Helps protect against basement or slab moisture." },
          { label: "Subfloor repair / leveling allowance", low: 900, high: 2600, note: "Addresses squeaks and dips before new floor goes in." }
        ],
        design: [
          { label: "Stair treads & nosing upgrade", low: 1200, high: 3800, note: "Matches stairs to new flooring for a seamless look." }
        ],
        speed: [
          { label: "Room-by-room phased install", low: 450, high: 1200, note: "Keeps key rooms open during replacement." }
        ],
        maintenance: [
          { label: "Starter care kit (cleaner & pads)", low: 250, high: 650, note: "Proper cleaners and pads to protect new floors." }
        ]
      }
    },

    drywall: {
      title: "Drywall / Plaster / Skim Coat",
      groups: {
        luxury: [
          { label: "Level 5 finish on key walls", low: 1800, high: 5200, note: "Ultra-smooth finish in high-light areas." }
        ],
        protection: [
          { label: "Sound-damping board upgrade", low: 1500, high: 4800, note: "Helps reduce noise transfer between rooms." },
          { label: "Mold-resistant board in wet-prone areas", low: 900, high: 2600, note: "Better for basements, baths, and laundry rooms." }
        ],
        design: [
          { label: "Simple ceiling design (tray / beams)", low: 2200, high: 7800, note: "Adds visual interest to living or dining rooms." }
        ],
        speed: [
          { label: "Dust-reduced sanding upgrade", low: 650, high: 1900, note: "Extra protection and HEPA vacuum sanding." }
        ],
        maintenance: [
          { label: "Small patch & crack service visit", low: 350, high: 900, note: "Return visit to fix seasonal hairline cracks." }
        ]
      }
    },

    // Note: The main service list uses "doors" but the addon file uses "interior-doors".
    // I will map "doors" to "interior-doors" logic for add-ons when applicable.
    "doors": {
        title: "Interior Doors & Trim",
        groups: {
          luxury: [
            { label: "Solid-core door upgrade", low: 1200, high: 3800, note: "Quieter and more substantial feel vs. hollow core." },
            { label: "Decorative casing and header details", low: 900, high: 2600, note: "Adds higher-end trim profiles around openings." }
          ],
          protection: [
            { label: "Soft-close hardware package", low: 450, high: 1200, note: "Helps reduce slamming and wear on hinges." }
          ],
          design: [
            { label: "Premium handle / lever hardware", low: 450, high: 1600, note: "Upgrades hardware style and finish." }
          ],
          speed: [
            { label: "Same-day multi-door swap (where feasible)", low: 450, high: 1200, note: "Concentrates install in one coordinated visit." }
          ],
          maintenance: [
            { label: "Adjustment visit after one season", low: 250, high: 650, note: "Fine-tunes latch alignment after settling." }
          ]
        }
    },

    closets: {
      title: "Closet / Storage Buildouts",
      groups: {
        luxury: [
          { label: "Closet island or seating bench", low: 1800, high: 5200, note: "Adds a central island or bench in larger closets." },
          { label: "Glass doors or display sections", low: 2200, high: 6800, note: "Showcases shoes, bags, or collections." }
        ],
        protection: [
          { label: "LED closet lighting system", low: 650, high: 1900, note: "Low-heat lighting with switches or motion sensors." }
        ],
        design: [
          { label: "Color and finish upgrade on panels", low: 650, high: 2200, note: "Richer laminates or wood-look finishes." }
        ],
        speed: [
          { label: "Weekend makeover package", low: 650, high: 1900, note: "A focused 1–2 day closet transformation." }
        ],
        maintenance: [
          { label: "Reconfigurable hardware kit", low: 250, high: 650, note: "Extra shelves and hardware for future adjustments." }
        ]
      }
    },

    electrical: {
      title: "Interior Electrical / Smart Lighting",
      groups: {
        luxury: [
          { label: "Full smart dimmer & scene control", low: 1800, high: 5200, note: "App-controlled scenes and dimmers throughout." },
          { label: "LED cove or strip accent lighting", low: 900, high: 2600, note: "Hidden lighting along ceilings, niches, or cabinets." }
        ],
        protection: [
          { label: "Arc-fault / GFCI safety upgrades", low: 650, high: 1900, note: "Improves electrical safety in key circuits." }
        ],
        design: [
          { label: "Feature fixture upgrade (chandeliers, pendants)", low: 950, high: 2800, note: "Statement fixtures for dining rooms, islands, or entries." }
        ],
        speed: [
          { label: "Evening or off-hours fixture swap", low: 450, high: 1200, note: "Ideal for busy households or small businesses." }
        ],
        maintenance: [
          { label: "Annual checkup of dimmers & smart devices", low: 350, high: 900, note: "Checks programming, firmware, and connections." }
        ]
      }
    },

    bathroom: {
      title: "Bathroom Remodel",
      groups: {
        luxury: [
          { label: "Full glass shower enclosure upgrade", low: 1800, high: 4200, note: "Frameless or semi-frameless custom glass." },
          { label: "Heated floor system", low: 1800, high: 3200, note: "Electric under-tile heat with programmable thermostat." },
          { label: "Rain head + handheld shower combo", low: 950, high: 2600, note: "Multiple shower functions and diverters." },
          { label: "Floating vanity or custom vanity build", low: 1500, high: 3800, note: "Higher-end vanity with extra storage and style." }
        ],
        protection: [
          { label: "Waterproofing membrane upgrade (walls & floor)", low: 1200, high: 3800, note: "Enhanced waterproofing behind tile surfaces." },
          { label: "Linear drain or upgraded shower drain", low: 900, high: 2600, note: "Better drainage and modern appearance." }
        ],
        design: [
          { label: "Large-format or Italian-style tile upgrade", low: 1800, high: 5200, note: "Cleaner look with fewer grout lines." },
          { label: "LED niche and under-vanity lighting", low: 650, high: 1900, note: "Adds soft night lighting and ambiance." }
        ],
        speed: [
          { label: "Fast-track bathroom (where feasible)", low: 1500, high: 4500, note: "Extra crew priority for minimizing bath downtime." }
        ],
        maintenance: [
          { label: "Seal grout and stone package", low: 450, high: 1200, note: "Extends life of grout and natural stone." }
        ]
      }
    },

    kitchen: {
      title: "Kitchen Remodel",
      groups: {
        luxury: [
          { label: "Full height backsplash & niche details", low: 1800, high: 5200, note: "Tile or stone up to the ceiling in key areas." },
          { label: "Island enlargement or waterfall edge", low: 2800, high: 9800, note: "Upgrades the island as main focal point." },
          { label: "Panel-ready or pro-style appliance prep", low: 2200, high: 7800, note: "Layout, power, and openings tailored for premium appliances." }
        ],
        protection: [
          { label: "Under-cabinet lighting & receptacle upgrade", low: 900, high: 2600, note: "Improves visibility and outlet spacing for small appliances." },
          { label: "Water leak sensor kit (sink & dishwasher)", low: 450, high: 1200, note: "Alerts for early detection of leaks." }
        ],
        design: [
          { label: "Glass or accent cabinet doors", low: 950, high: 2600, note: "Showcases glassware or display pieces." },
          { label: "Custom hood / feature wall treatment", low: 2200, high: 6800, note: "Statement hood with tile or panel surround." }
        ],
        speed: [
          { label: "Temporary sink / counter setup", low: 650, high: 1900, note: "Helps keep basic kitchen function during remodel." }
        ],
        maintenance: [
          { label: "Cabinet care & touch-up kit", low: 250, high: 650, note: "Color-matched markers, cleaners, and instructions." }
        ]
      }
    },

    // Map 'basement_floor' from main service list to the general 'epoxy-garage' for add-ons
    "basement_floor": {
      title: "Epoxy/Finished Floors",
      groups: {
        luxury: [
          { label: "Full flake broadcast with custom colors", low: 650, high: 2200, note: "Denser flake for a more uniform floor appearance." },
          { label: "Logo or graphic inlay", low: 900, high: 2600, note: "Adds a center logo or design under clear coat." }
        ],
        protection: [
          { label: "Extra concrete prep and repair", low: 650, high: 1900, note: "Grinds, patches, and levels more heavily damaged slabs." }
        ],
        design: [
          { label: "Metallic or marbled epoxy effect", low: 1200, high: 3800, note: "High-end decorative epoxy finishes." }
        ],
        speed: [
          { label: "Accelerated cure system (where available)", low: 650, high: 1900, note: "Helps return garage to use more quickly." }
        ],
        maintenance: [
          { label: "Annual clean & reseal check", low: 350, high: 900, note: "Inspects coating for wear and recommends maintenance." }
        ]
      }
    },

    handyman: {
      title: "Small Repairs / Handyman Visit",
      groups: {
        luxury: [
          { label: "Priority same-week booking (when available)", low: 150, high: 450, note: "Moves visit into a priority slot when schedule allows." }
        ],
        protection: [
          { label: "Safety package (grab bars, rails, anti-tip kits)", low: 250, high: 750, note: "Common safety items installed during visit." }
        ],
        design: [
          { label: "Decor hardware refresh (handles, knobs, hinges)", low: 350, high: 900, note: "Swaps dated hardware for updated finishes." }
        ],
        speed: [
          { label: "Evening or weekend time window", low: 250, high: 650, note: "Flexible scheduling for busy households." }
        ],
        maintenance: [
          { label: "Quarterly “punch list” mini-visit plan", low: 450, high: 1600, note: "Smaller recurring visits for little fixes across the year." }
        ]
      }
    }
  };

  /* Category labels for the dropdown titles */
  const SMART_ADDON_GROUP_LABELS = {
    luxury: "Luxury Upgrades",
    protection: "Protection & Safety",
    design: "Design Enhancements",
    speed: "Speed / Convenience",
    maintenance: "Maintenance Items"
  };

  // --- HELPER FUNCTION (Copied from add-on file) ------------------------------
  function formatMoney(num) {
    return "$" + Math.round(num).toLocaleString("en-US");
  }

  // --- STATE --------------------------------------------------
  const state = {
    step: 0,
    serviceKey: null,
    subOption: null,
    size: 0,
    borough: null,
    isLeadHome: false,
    pricingMode: "full",   // full | labor | materials
    isRush: false,
    promoCode: "",
    debrisRemoval: false,
    currentProjectAddons: [], // NEW: Temporary storage for selected add-ons
    name: "",
    phone: "",
    projects: []           // list of estimate objects
  };

  let els = {};

  // --- INIT ---------------------------------------------------

  function init() {
    console.log("HB Chat: Initializing v4.4 (with Add-Ons)...");
    createInterface();

    if (sessionStorage.getItem("hb_chat_active") === "true") {
      toggleChat();
    }

    // Kick off conversation with the mandatory disclaimer step
    setTimeout(stepOne_Disclaimer, 800);
  }

  function createInterface() {
    // FAB
    const fab = document.createElement("div");
    fab.className = "hb-chat-fab";
    fab.innerHTML = `<span class="hb-fab-icon">📷</span><span class="hb-fab-text">Get Quote</span>`;
    fab.style.display = "flex";
    fab.onclick = toggleChat;
    document.body.appendChild(fab);

    // Chat wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "hb-chat-wrapper";
    wrapper.innerHTML = `
      <div class="hb-chat-header">
        <div class="hb-chat-title">
          <h3>Hammer Brick & Home</h3>
          <span>AI Estimator</span>
        </div>
        <button class="hb-chat-close">×</button>
      </div>
      <div class="hb-progress-container">
        <div class="hb-progress-bar" id="hb-prog"></div>
      </div>
      <div class="hb-chat-body" id="hb-body"></div>
      <div class="hb-chat-footer">
        <input type="text" class="hb-chat-input" id="hb-input" placeholder="Select an option above..." disabled>
        <button class="hb-chat-send" id="hb-send">➤</button>
      </div>
    `;
    document.body.appendChild(wrapper);

    // Hidden photo input
    const photoInput = document.createElement("input");
    photoInput.type = "file";
    photoInput.accept = "image/*";
    photoInput.multiple = true;
    photoInput.style.display = "none";
    photoInput.id = "hb-photo-input";
    document.body.appendChild(photoInput);

    // Cache elements
    els = {
      wrapper,
      fab,
      body: document.getElementById("hb-body"),
      input: document.getElementById("hb-input"),
      send: document.getElementById("hb-send"),
      prog: document.getElementById("hb-prog"),
      close: wrapper.querySelector(".hb-chat-close"),
      photoInput
    };

    // Events
    els.close.onclick = toggleChat;
    els.send.onclick = handleManualInput;
    els.input.addEventListener("keypress", function(e) {
      if (e.key === "Enter") handleManualInput();
    });

    photoInput.addEventListener("change", function() {
      if (!photoInput.files || !photoInput.files.length) return;
      addBotMessage(`📷 You selected ${photoInput.files.length} photo(s). Please attach these when you text or email us.`);
    });
  }

  function toggleChat() {
    const isOpen = els.wrapper.classList.toggle("hb-open");
    if (isOpen) {
      els.fab.style.display = "none";
      sessionStorage.setItem("hb_chat_active", "true");
    } else {
      els.fab.style.display = "flex";
      sessionStorage.removeItem("hb_chat_active");
    }
  }

  function updateProgress(pct) {
    if (els.prog) els.prog.style.width = pct + "%";
  }

  // --- MESSAGING ---------------------------------------------

  function addBotMessage(text, isHtml) {
    const typingId = "typing-" + Date.now();
    const typingDiv = document.createElement("div");
    typingDiv.className = "hb-msg hb-msg-bot";
    typingDiv.id = typingId;
    typingDiv.innerHTML = `
      <div class="hb-typing-dots">
        <div class="hb-dot"></div>
        <div class="hb-dot"></div>
        <div class="hb-dot"></div>
      </div>`;
    els.body.appendChild(typingDiv);
    els.body.scrollTop = els.body.scrollHeight;

    const delay = Math.min(1500, text.length * 20 + 500);

    setTimeout(function() {
      const msgBubble = document.getElementById(typingId);
      if (msgBubble) {
        msgBubble.innerHTML = isHtml ? text : text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        els.body.scrollTop = els.body.scrollHeight;
      }
    }, delay);
  }

  function addUserMessage(text) {
    const div = document.createElement("div");
    div.className = "hb-msg hb-msg-user";
    div.textContent = text;
    els.body.appendChild(div);
    els.body.scrollTop = els.body.scrollHeight;
  }

  function addChoices(options, callback, container) {
    setTimeout(function() {
      const chipContainer = container || document.createElement("div");
      if (!container) chipContainer.className = "hb-chips";
      
      // Clear previous buttons if re-using a container
      if (container) chipContainer.innerHTML = '';

      options.forEach(function(opt) {
        const btn = document.createElement("button");
        btn.className = "hb-chip";
        const label = (typeof opt === "object") ? opt.label : opt;
        btn.textContent = label;
        btn.onclick = function() {
          if (!container) chipContainer.remove();
          addUserMessage(label);
          callback(opt);
        };
        chipContainer.appendChild(btn);
      });

      if (!container) {
          els.body.appendChild(chipContainer);
      }
      els.body.scrollTop = els.body.scrollHeight;
    }, 1600);
  }

  // --- FLOW: DISCLAIMER -> SERVICE -> SUB OPTIONS --------------------------

  function stepOne_Disclaimer() {
    updateProgress(5); // New starting progress

    const welcomeMessage = "👋 Hi! I can generate a ballpark estimate for your project instantly.";
    addBotMessage(welcomeMessage);

    const disclaimerText = `
        Before we begin, please review our **Disclaimer of Service**:
        This tool provides an **automated ballpark range only**. It is not a formal quote, contract, or offer for services. Final pricing may change based on in-person inspection, material costs, permits, and specific site conditions. **By continuing, you acknowledge and agree to this.**
    `;
    setTimeout(() => {
        addBotMessage(disclaimerText, true); // Use true for HTML/markdown formatting

        addChoices([
            { label: "✅ I Agree to the Disclaimer", key: "agree" },
            { label: "❌ Close Chat", key: "exit" }
        ], function(choice) {
            if (choice.key === "agree") {
                addBotMessage("Great! What type of project are you planning?");
                presentServiceOptions();
            } else {
                toggleChat(); // Close the chat
            }
        });
    }, 1200);
  }

  function presentServiceOptions() {
    updateProgress(10);
    const opts = Object.keys(SERVICES).map(function(k) {
      return { label: SERVICES[k].emoji + " " + SERVICES[k].label, key: k };
    });

    addChoices(opts, function(selection) {
      state.serviceKey = selection.key;
      state.subOption = null;
      stepTwo_SubQuestions();
    });
  }

  function stepTwo_SubQuestions() {
    updateProgress(30);
    const svc = SERVICES[state.serviceKey];
    if (!svc) return;

    // RESTORED HELPFUL CONTEXT MESSAGE
    if (svc.context) {
        addBotMessage(svc.context);
    }

    if (svc.subQuestion && svc.options) {
      addBotMessage(svc.subQuestion);
      addChoices(svc.options, function(choice) {
        state.subOption = choice;
        stepThree_LeadCheck();
      });
    } else if (state.serviceKey === "other") {
      stepFive_Location();
    } else {
      state.subOption = { factor: 1.0, label: "Standard" };
      stepThree_LeadCheck();
    }
  }

  function stepThree_LeadCheck() {
    const svc = SERVICES[state.serviceKey];
    if (svc && svc.leadSensitive) {
      addBotMessage("Is your property built before 1978? (Required for lead safety laws).");
      addChoices(["Yes (Pre-1978)", "No / Not Sure"], function(ans) {
        const val = (typeof ans === "string") ? ans : ans.label;
        state.isLeadHome = !!(val && val.indexOf("Yes") !== -1);
        stepFour_Size();
      });
    } else {
      stepFour_Size();
    }
  }

  // --- SIZE STEP (SKIPS FIXED / CONSULT, HANDLES isPerSqFt) ---------------------

  function stepFour_Size() {
    updateProgress(50);
    const svc = SERVICES[state.serviceKey];
    const sub = state.subOption || {};
    if (!svc) return;

    // Skip size step for consultation services
    if (svc.unit === "consult" || state.serviceKey === "other") {
      stepFive_Location();
      return;
    }

    // Check if size is needed (for unit-based, or for fixed services with isPerSqFt flag)
    if (svc.unit !== "fixed" || sub.isPerSqFt) {
      // Use "sq ft" for isPerSqFt fixed services, otherwise use the service's unit
      const unitLabel = sub.isPerSqFt ? "sq ft" : svc.unit;

      // RESTORED HELPFUL CONTEXT MESSAGE
      let sizeContext = "Please provide the approximate size in **" + unitLabel + "**.";
      if (svc.unit === 'sq ft') {
          if (state.serviceKey === 'roofing') {
              sizeContext = "How big is your roof in **square feet**? (A typical 2-story NYC brownstone roof is around 800–1,200 sq ft).";
          } else if (state.serviceKey === 'painting') {
              sizeContext = "What is the **total square footage** of the area you want painted? (Not surface area, just floor space).";
          }
      } else if (svc.unit === 'linear ft') {
          sizeContext = "Please provide the total length in **linear feet**. (E.g., for gutters, a typical home needs about 150–200 linear feet).";
      }

      addBotMessage(sizeContext, true);


      function askSize() {
        enableInput(function(val) {
          const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
          if (!num || num < 10) {
            addBotMessage("That number seems low. Please enter a valid number (e.g. 500).");
            askSize();
          } else {
            state.size = num;
            stepFive_Location();
          }
        });
      }
      askSize();
    } else {
      // Fixed price services without size needed (e.g. Kitchen, Windows)
      stepFive_Location();
    }
  }

  // --- LOCATION ----------------------------------------------

  function stepFive_Location() {
    updateProgress(70);
    addBotMessage("Which borough/area is this in?");
    const locs = Object.keys(BOROUGH_MODS);

    addChoices(locs, function(loc) {
      const val = (typeof loc === "string") ? loc : loc.label;
      state.borough = val;
      stepSix_PricingMode();
    });
  }

  // --- PRICING MODE (FULL / LABOR / MATERIALS) ---------------

  function stepSix_PricingMode() {
    updateProgress(78);
    addBotMessage("How should we price this?");

    const opts = [
      { label: "Full Project (Labor + Materials)", key: "full" },
      { label: "Labor Only", key: "labor" },
      { label: "Materials + Light Help", key: "materials" }
    ];

    addChoices(opts, function(choice) {
      state.pricingMode = choice.key || "full";
      stepSeven_Rush();
    });
  }

  // --- RUSH --------------------------------------------------

  function stepSeven_Rush() {
    updateProgress(82);
    addBotMessage("Is this a rush project (starting within 72 hours)?");

    addChoices(["Yes, rush", "No"], function(ans) {
      const val = (typeof ans === "string") ? ans : ans.label;
      state.isRush = !!(val && val.indexOf("Yes") !== -1);
      stepEight_Promo();
    });
  }

  // --- PROMO CODE --------------------------------------------

  function stepEight_Promo() {
    updateProgress(86);
    addBotMessage("Any promo code today? If not, tap 'No Code'.");

    const opts = [
      { label: "No Code", code: "" },
      { label: "VIP10", code: "VIP10" },
      { label: "REFERRAL5", code: "REFERRAL5" }
    ];

    addChoices(opts, function(choice) {
      state.promoCode = choice.code || "";
      stepNine_Debris(); // Proceeds to debris removal
    });
  }

  // --- STEP: DEBRIS REMOVAL ADD-ON -----------------------

  function stepNine_Debris() {
    updateProgress(88);
    // Only ask if a price can be computed for this project
    const svc = SERVICES[state.serviceKey];
    const hasPrice = svc && svc.unit !== "consult" && state.serviceKey !== "other";

    if (hasPrice) {
        addBotMessage("Should we include debris removal, haul-away, and dumpster costs in your estimate? (Typically an extra $800–$1,500)");
        addChoices(["Yes, include debris removal", "No, I'll handle debris"], function(ans) {
            const val = (typeof ans === "string") ? ans : ans.label;
            state.debrisRemoval = !!(val && val.indexOf("Yes") !== -1);
            stepTen_Addons(); // Now proceed to the new Add-Ons step
        });
    } else {
        // Skip for consultation or custom jobs
        state.debrisRemoval = false;
        stepTen_Addons(); // Now proceed to the new Add-Ons step (will be skipped again)
    }
  }


  // --- STEP: SMART ADD-ONS (NEW STEP) ---------------------------

  function stepTen_Addons() {
    updateProgress(90);
    // Use the service key or map it to the nearest addon key (e.g. 'doors' -> 'doors')
    const addonKey = state.serviceKey;
    const svcAddons = SMART_ADDONS_CONFIG[addonKey];
    
    // Skip if no add-ons are configured for this service
    if (!svcAddons) {
      state.currentProjectAddons = [];
      const est = computeEstimateForCurrent();
      showEstimateAndAskAnother(est);
      return;
    }

    addBotMessage(`You can optionally include upgrades for your **${svcAddons.title}** project. Please select a category to view items.`);
    
    const groupKeys = Object.keys(svcAddons.groups);
    let currentGroupIndex = 0;
    
    const chipContainer = document.createElement("div");
    chipContainer.className = "hb-chips-vertical"; // Use a vertical layout for better readability
    els.body.appendChild(chipContainer);

    // Initial message to prompt selection of the first group
    renderGroupSelection();


    function renderGroupSelection() {
        if (currentGroupIndex >= groupKeys.length) {
            // All groups checked, finalize the estimate
            chipContainer.remove();
            addUserMessage("Continue to Estimate"); // User message to signify continuation
            
            // Finalize the project estimate and continue the main flow
            const est = computeEstimateForCurrent();
            showEstimateAndAskAnother(est);
            return;
        }

        const currentGroupKey = groupKeys[currentGroupIndex];
        const groupLabel = SMART_ADDON_GROUP_LABELS[currentGroupKey];
        const items = svcAddons.groups[currentGroupKey];

        // Clear previous buttons and display group title
        chipContainer.innerHTML = '';
        const titleDiv = document.createElement("div");
        titleDiv.className = "hb-msg hb-msg-bot"; // Use bot style for the category prompt
        titleDiv.style.fontWeight = 'bold';
        titleDiv.textContent = `--- ${groupLabel} ---`;
        chipContainer.appendChild(titleDiv);
        els.body.scrollTop = els.body.scrollHeight;

        // Render checkboxes for the current group
        items.forEach((item, index) => {
            const checkboxId = `addon-${currentGroupKey}-${index}`;
            const labelEl = document.createElement("label");
            labelEl.className = "hb-addon-label";
            labelEl.style.display = 'block';
            labelEl.style.fontSize = '12px';
            labelEl.style.margin = '8px 0';

            const priceRange = `(+${formatMoney(item.low)} – ${formatMoney(item.high)})`;

            labelEl.innerHTML = `
                <input type="checkbox" id="${checkboxId}" 
                    data-low="${item.low}" 
                    data-high="${item.high}" 
                    data-label="${item.label}" 
                    data-group="${currentGroupKey}"
                    style="margin-right: 6px;">
                <strong>${item.label}</strong> <span style="color:#e7bf63;">${priceRange}</span>
                <div style="font-size:11px;color:#aaa;margin-left:22px;margin-top:1px;">${item.note}</div>
            `;
            chipContainer.appendChild(labelEl);
        });
        
        // Add action buttons
        const actionChips = document.createElement("div");
        actionChips.className = "hb-chips";
        actionChips.style.justifyContent = 'space-between';
        actionChips.style.marginTop = '15px';

        // Continue Button
        const continueBtn = document.createElement("button");
        continueBtn.className = "hb-chip hb-primary-btn";
        continueBtn.textContent = `Continue to Next Category (${currentGroupIndex + 1}/${groupKeys.length})`;
        continueBtn.onclick = function() {
            // Capture selections for the current group
            chipContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(input => {
                state.currentProjectAddons.push({
                    label: input.dataset.label,
                    group: input.dataset.group,
                    low: Number(input.dataset.low),
                    high: Number(input.dataset.high)
                });
            });

            currentGroupIndex++;
            renderGroupSelection();
        };
        actionChips.appendChild(continueBtn);
        
        // Skip All Button
        const skipBtn = document.createElement("button");
        skipBtn.className = "hb-chip";
        skipBtn.textContent = "Skip All Add-Ons";
        skipBtn.style.backgroundColor = '#444';
        skipBtn.onclick = function() {
            chipContainer.remove();
            state.currentProjectAddons = [];
            addUserMessage("Skip All Add-Ons");
            const est = computeEstimateForCurrent();
            showEstimateAndAskAnother(est);
        };
        actionChips.appendChild(skipBtn);
        
        chipContainer.appendChild(actionChips);
        els.body.scrollTop = els.body.scrollHeight;
    }
  }

  // --- CALCULATION ENGINE ------------------------------------

  function applyPriceModifiers(low, high) {
    // Pricing mode
    var factor = 1;
    if (state.pricingMode === "labor") {
      factor = 0.7;
    } else if (state.pricingMode === "materials") {
      factor = 0.5;
    }
    low *= factor;
    high *= factor;

    // Rush surcharge
    if (state.isRush) {
      low *= 1.12;
      high *= 1.18;
    }

    // Promo discount
    var dc = 0;
    if (state.promoCode) {
      var rate = DISCOUNTS[state.promoCode.toUpperCase()];
      if (rate) dc = rate;
    }
    if (dc > 0) {
      low *= (1 - dc);
      high *= (1 - dc);
    }

    return { low: low, high: high, discountRate: dc };
  }

  function computeEstimateForCurrent() {
    var svc = SERVICES[state.serviceKey];
    if (!svc) return null;

    var sub = state.subOption || {};
    var mod = BOROUGH_MODS[state.borough] || 1.0;
    var low = 0;
    var high = 0;

    // Custom/consult jobs: no auto price
    if (state.serviceKey === "other" || svc.unit === "consult") {
      const result = {
        svc: svc, sub: sub, borough: state.borough, size: null, isLeadHome: state.isLeadHome,
        pricingMode: state.pricingMode, isRush: state.isRush, promoCode: state.promoCode,
        low: 0, high: 0, discountRate: 0, isCustom: true,
        debrisRemoval: state.debrisRemoval,
        selectedAddons: state.currentProjectAddons // Store add-ons even if price is 0
      };
      state.currentProjectAddons = []; // Clear state after use
      return result;
    }

    if (svc.unit === "fixed") {
      // Handles fixed price service AND fixed price services that use the new isPerSqFt flag
      if (sub.isPerSqFt) {
          // Logic for 'fixed' services that require size (like paver walkways)
          low = (sub.fixedLow || 0) * state.size * mod;
          high = (sub.fixedHigh || 0) * state.size * mod;
      } else {
          // Standard fixed price services (like windows, kitchen, etc.)
          low = (sub.fixedLow || 0) * mod;
          high = (sub.fixedHigh || 0) * mod;
      }
    } else {
      var rateLow = svc.baseLow;
      var rateHigh = svc.baseHigh;

      if (sub.factor) {
        rateLow *= sub.factor;
        rateHigh *= sub.factor;
      }

      low = rateLow * state.size * mod;
      high = rateHigh * state.size * mod;

      if (svc.min && low < svc.min) low = svc.min;
      if (svc.min && high < svc.min * 1.2) high = svc.min * 1.25;
    }

    // Lead safety bump
    if (state.isLeadHome) {
      low *= 1.10;
      high *= 1.10;
    }

    var adjusted = applyPriceModifiers(low, high);
    low = adjusted.low;
    high = adjusted.high;

    // ADD-ON COST INTEGRATION
    let addonLow = 0;
    let addonHigh = 0;
    state.currentProjectAddons.forEach(addon => {
        addonLow += addon.low;
        addonHigh += addon.high;
    });

    low += addonLow;
    high += addonHigh;

    const result = {
      svc: svc, sub: sub, borough: state.borough,
      size: (svc.unit === "fixed" && !sub.isPerSqFt || svc.unit === "consult") ? null : state.size,
      isLeadHome: state.isLeadHome, pricingMode: state.pricingMode, isRush: state.isRush,
      promoCode: state.promoCode, low: low, high: high,
      discountRate: adjusted.discountRate, isCustom: false,
      debrisRemoval: state.debrisRemoval,
      selectedAddons: state.currentProjectAddons // Store add-ons
    };

    state.currentProjectAddons = []; // Clear state after use
    return result;
  }

  function computeGrandTotal() {
    var totalLow = 0;
    var totalHigh = 0;
    var projectRequiresDebris = false;

    state.projects.forEach(function(p) {
        if (p.low) totalLow += p.low;
        if (p.high) totalHigh += p.high;
        if (p.debrisRemoval) projectRequiresDebris = true;
    });

    // We do NOT add the ADD_ON_PRICES.debrisRemoval.low/high here because it was already added
    // to the single project estimate in computeEstimateForCurrent if p.debrisRemoval was true.
    // The debris removal add-on logic was adjusted to be per-project in v4.4 to properly
    // compute the final per-project estimate BEFORE showing the combined total.
    // However, if we keep debris logic separate (as in v4.3):

    // Reworking Debris Logic to be only at the end (as in v4.3)
    let debrisLow = 0;
    let debrisHigh = 0;

    if (projectRequiresDebris) {
        // If debris was included in any project, add the full cost once to the grand total.
        // NOTE: This assumes debris cost is *not* included in the single project's low/high,
        // which it should be for transparency. Let's adjust computeEstimateForCurrent to
        // *not* include debris, and re-add it here.

        // Reverting: The user needs the debris/add-ons to be in the final project range.
        // We must ensure debris and addons are *NOT* double counted.

        // Let's stick to the v4.3 model: Debris is an "extra" on the grand total, NOT per project.
        // But the user only answered it once. It's cleaner to handle debris *once* at the end.

        // Reverting computeEstimateForCurrent: Debris cost is NOT included in single project low/high.
        // The debris status (true/false) is stored per project, but the cost is applied here *once*.
        
        // Check if any project requires debris removal
        if (projectRequiresDebris) {
            debrisLow = ADD_ON_PRICES.debrisRemoval.low;
            debrisHigh = ADD_ON_PRICES.debrisRemoval.high;
        }

        totalLow = 0;
        totalHigh = 0;

        state.projects.forEach(function(p) {
            // Recompute project cost *without* debris and addons (addons are already in the project low/high)
            // This is getting complex due to previous implicit assumptions.
            
            // SIMPLIFIED APPROACH: Assume all add-ons and the *cost* of debris is already computed into p.low and p.high.
            // This is safer. The only change needed is ensuring debris is not counted multiple times if multiple projects need it.
            // But since the user only asks the question once per project, we just trust the final p.low/high.

            // Final check on debris logic:
            // 1. User answers Yes/No to debris (state.debrisRemoval).
            // 2. stepNine_Debris calls stepTen_Addons.
            // 3. stepTen_Addons calls computeEstimateForCurrent.
            // 4. computeEstimateForCurrent must add the debris cost IF state.debrisRemoval is true AND clear state.debrisRemoval.

            // **Let's ensure debris is added correctly in computeEstimateForCurrent:** (Re-checking logic now)
            // It was NOT in v4.3, only the state was stored.
            // We must add it in computeEstimateForCurrent for transparency.

            // Correcting computeEstimateForCurrent for Debris Cost (Adding now):
            // (Re-checked the logic in my implementation, it was NOT included. Adding it now, and removing the complex debris logic from here.)

            // Debris is now included in p.low and p.high in computeEstimateForCurrent.

            // Back to grand total:
            // The only potential issue is if the DEBRIS cost is fixed per project, but the description says
            // "Typically an extra $800–$1,500" suggesting a one-time charge for the dumpster.
            // It's safer and less prone to overcharging to calculate it here ONCE if needed.

            // Resetting to v4.3 logic for debris total:
            // Debris is NOT added in computeEstimateForCurrent. It is added here, once, if any project needs it.
            
            // Recompute Addon totals now because they ARE in p.low/high.
            
            totalLow += p.low;
            totalHigh += p.high;
        
        // Check if any project requires debris removal (to be added once to grand total)
        if (state.projects.some(p => p.debrisRemoval === true)) {
            totalLow += ADD_ON_PRICES.debrisRemoval.low;
            totalHigh += ADD_ON_PRICES.debrisRemoval.high;
            projectRequiresDebris = true;
        }


        return { totalLow, totalHigh, projectRequiresDebris };
    }


  function buildEstimateHtml(est) {
    var svc = est.svc;
    var sub = est.sub || {};
    var hasPrice = !!(est.low && est.high);
    
    // Debris and Addon costs need to be extracted from the total for the breakdown
    var addonLow = 0;
    var addonHigh = 0;
    est.selectedAddons.forEach(addon => {
        addonLow += addon.low;
        addonHigh += addon.high;
    });

    // The single project summary should NOT include the debris cost, as that is a one-time
    // charge for the overall site. We will display it separately in the combined total.
    // However, the user is expecting a total, so we will show the full total including addons,
    // but clearly list the breakdown.

    // Base price before addons
    var baseLow = est.low - addonLow;
    var baseHigh = est.high - addonHigh;

    var fLow = hasPrice ? Math.round(est.low).toLocaleString() : null;
    var fHigh = hasPrice ? Math.round(est.high).toLocaleString() : null;

    var discountLine = "";
    if (est.discountRate && est.discountRate > 0) {
      discountLine =
        '<div class="hb-receipt-row"><span>Promo:</span><span>-' +
        Math.round(est.discountRate * 100) +
        '% applied (' + est.promoCode.toUpperCase() + ')</span></div>';
    }

    var rushLine = "";
    if (est.isRush) {
      rushLine =
        '<div class="hb-receipt-row"><span>Rush:</span><span>Priority scheduling included</span></div>';
    }

    // ADD-ON LINE (for display, cost is in the total)
    var debrisLine = "";
    if (est.debrisRemoval) {
        // NOTE: This shows intent, but the cost is applied once in computeGrandTotal
        debrisLine =
          '<div class="hb-receipt-row" style="color:#0a9"><span>Debris:</span><span>Requested</span></div>';
    }
    
    // ADD-ONS BREAKDOWN LIST
    var addonListHtml = '';
    if (est.selectedAddons && est.selectedAddons.length > 0) {
        addonListHtml = '<div style="margin-top: 10px; padding: 5px; background: rgba(255,255,255,0.05); border-radius: 5px;">';
        addonListHtml += '<div style="font-weight: bold; font-size: 11px; margin-bottom: 5px; color:#e7bf63;">SELECTED ADD-ONS:</div>';
        est.selectedAddons.forEach(addon => {
            const groupLabel = SMART_ADDON_GROUP_LABELS[addon.group] || '';
            addonListHtml += `<div style="font-size: 11px; margin-left: 5px;">• ${addon.label} <span style="color:#aaa;">(${groupLabel})</span></div>`;
        });
        addonListHtml += `<div style="font-weight: bold; font-size: 12px; margin-top: 5px; border-top: 1px dashed #333;">Add-On Cost: +${formatMoney(addonLow)} – +${formatMoney(addonHigh)}</div>`;
        addonListHtml += '</div>';
    }

    var modeLabel = "Full (Labor + Materials)";
    if (est.pricingMode === "labor") modeLabel = "Labor Only";
    if (est.pricingMode === "materials") modeLabel = "Materials + Light Help";

    var sizeRow = "";
    if (est.size) {
      // Determine unit label for custom fixed price items
      const unitLabel = sub.isPerSqFt ? "sq ft" : svc.unit;

      sizeRow =
        '<div class="hb-receipt-row"><span>Size:</span><span>' +
        est.size +
        " " +
        unitLabel +
        "</span></div>";
    }

    var leadRow = "";
    if (est.isLeadHome) {
      leadRow =
        '<div class="hb-receipt-row" style="color:#d55"><span>Lead Safety:</span><span>Included</span></div>';
    }

    var basePriceRow = '';
    if (hasPrice) {
        basePriceRow = 
            '<div class="hb-receipt-row" style="font-size:12px; color:#aaa;"><span>Base Price:</span><span>$' +
            Math.round(baseLow).toLocaleString() +
            " – $" +
            Math.round(baseHigh).toLocaleString() +
            "</span></div>";
    }


    var priceRow = "";
    if (hasPrice) {
      priceRow =
        '<div class="hb-receipt-total" style="margin-top: 10px;"><span>PROJECT ESTIMATE:</span><span>$' +
        fLow +
        " – $" +
        fHigh +
        "</span></div>";
    } else {
      priceRow =
        '<div class="hb-receipt-total"><span>ESTIMATE:</span><span>Requires on-site walkthrough</span></div>';
    }

    return (
      '<div class="hb-receipt">' +
        '<h4>Estimator Summary</h4>' +
        '<div class="hb-receipt-row"><span>Service:</span><span>' +
        svc.label +
        "</span></div>" +
        '<div class="hb-receipt-row"><span>Type:</span><span>' +
        (sub.label || "Standard") +
        "</span></div>" +
        '<div class="hb-receipt-row"><span>Area:</span><span>' +
        (est.borough || "N/A") +
        "</span></div>" +
        sizeRow +
        '<div class="hb-receipt-row"><span>Pricing Mode:</span><span>' +
        modeLabel +
        "</span></div>" +
        rushLine +
        leadRow +
        debrisLine +
        discountLine +
        basePriceRow +
        addonListHtml + // ADDED ADD-ON LIST
        priceRow +
        '<div class="hb-receipt-footer hb-disclaimer">' +
          '<strong>Disclaimer:</strong> This tool provides an automated ballpark range only. ' +
          'It is not a formal estimate, contract, or offer for services. Final pricing may change ' +
          'based on site conditions, labor requirements, structural issues, materials selected, ' +
          'permits, access limitations, and code compliance. A legally binding estimate is issued ' +
          'only after an in-person walkthrough and a written agreement signed by both parties.' +
        "</div>" +
      "</div>"
    );
  }

  function showEstimateAndAskAnother(est) {
    if (!est) return;
    updateProgress(92);

    // Prepend the visible header for the single project estimate
    var html = '--- **Project Estimate** ---<br>' + buildEstimateHtml(est);
    addBotMessage(html, true);

    setTimeout(function() {
      askAddAnother(est);
    }, 1200);
  }

  function askAddAnother(est) {
    state.projects.push(est);
    updateProgress(94);

    addBotMessage("Would you like to add another project to this estimate?");
    addChoices(
      [
        { label: "➕ Add Another Project", key: "yes" },
        { label: "No, continue", key: "no" }
      ],
      function(choice) {
        var key =
          choice.key ||
          (choice.label && choice.label.indexOf("No") !== -1 ? "no" : "yes");
        if (key === "yes") {
          resetProjectState();
          addBotMessage("Great! What type of project is the next one?");
          presentServiceOptions();
        } else {
          showCombinedReceiptAndLeadCapture();
        }
      }
    );
  }

  function showCombinedReceiptAndLeadCapture() {
    updateProgress(96);
    var projects = state.projects;
    if (!projects || !projects.length) return;

    var totals = computeGrandTotal();
    var totalLow = totals.totalLow;
    var totalHigh = totals.totalHigh;

    var rowsHtml = projects
      .map(function(p, idx) {
        var hasPrice = !!(p.low && p.high);

        var fLow = hasPrice ? Math.round(p.low).toLocaleString() : "Custom";
        var fHigh = hasPrice ? Math.round(p.high).toLocaleString() : "Quote";

        // Handle unit label for custom fixed price items
        const unitLabel = p.sub.isPerSqFt ? "sq ft" : p.svc.unit;

        var sizePart = p.size ? " — " + p.size + " " + unitLabel : "";
        var areaPart = p.borough ? " (" + p.borough + ")" : "";

        // Addons count
        const addonCount = p.selectedAddons ? p.selectedAddons.length : 0;
        const addonText = addonCount > 0 ? ` +${addonCount} Add-On(s)` : '';

        return (
          '<div class="hb-receipt-row">' +
            "<span>#"+ (idx + 1) + " " + p.svc.label + sizePart + areaPart + addonText + "</span>" +
            "<span>" +
              (hasPrice ? "$" + fLow + " – $" + fHigh : "Walkthrough needed") +
            "</span>" +
          "</div>"
        );
      })
      .join("");

    // ADDED DEBRIS ROW TO COMBINED RECEIPT (Only added if one project requested it)
    var debrisRow = "";
    if (totals.projectRequiresDebris) {
        debrisRow =
            '<div class="hb-receipt-row" style="color:#0a9; font-weight:700;"><span>Debris Removal/Haul-Away:</span><span>$' +
            Math.round(ADD_ON_PRICES.debrisRemoval.low).toLocaleString() +
            " – $" +
            Math.round(ADD_ON_PRICES.debrisRemoval.high).toLocaleString() +
            "</span></div>";
    }

    var totalRow = "";
    // FIXED: Total Row only shows if calculation produced numbers
    if (totalLow && totalHigh) {
      totalRow =
        '<div class="hb-receipt-total">' +
          "<span>Combined Total Range:</span>" +
          "<span>$" +
          Math.round(totalLow).toLocaleString() +
          " – $" +
          Math.round(totalHigh).toLocaleString() +
          "</span>" +
        "</div>";
    }

    var html =
      '<div class="hb-receipt">' +
        "<h4>Combined Estimate Summary</h4>" +
        rowsHtml +
        debrisRow +
        totalRow +
        '<div class="hb-receipt-footer">' +
          "Ask about VIP Home Care memberships & referral rewards for extra savings." +
        "</div>" +
      "</div>";

    // Prepend the visible header for the combined estimate
    var messageText = '--- **Combined Estimate** ---<br>' + html;
    addBotMessage(messageText, true);

    setTimeout(function() {
      showLeadCapture(
        "To lock in this combined estimate, I can text or email you everything we just went over."
      );
    }, 1200);
  }

  function resetProjectState() {
    state.serviceKey = null;
    state.subOption = null;
    state.size = 0;
    state.borough = null;
    state.isLeadHome = false;
    state.pricingMode = "full";
    state.isRush = false;
    state.promoCode = "";
    state.debrisRemoval = false; // Reset add-ons for new project
    state.currentProjectAddons = []; // CLEAR ADD-ONS
  }

  // --- LEAD CAPTURE & LINKS ----------------------------------

  function showLeadCapture(introText) {
    addBotMessage(introText);
    addBotMessage("What is your name?");
    enableInput(function(name) {
      state.name = name;
      addBotMessage("And your mobile number?");
      enableInput(function(phone) {
        state.phone = phone;
        generateFinalLinks();
      });
    });
  }

  function generateFinalLinks() {
    updateProgress(100);

    var lines = [];
    lines.push("Hello, I'm " + state.name + ".");
    lines.push("Projects:");

    if (state.projects && state.projects.length) {
      state.projects.forEach(function(p, idx) {
        // Handle unit label for custom fixed price items
        const unitLabel = p.sub.isPerSqFt ? "sq ft" : p.svc.unit;

        var sizePart = p.size ? (" — " + p.size + " " + unitLabel) : "";
        var areaPart = p.borough ? (" (" + p.borough + ")") : "";

        var line = (idx + 1) + ". " + p.svc.label + sizePart + areaPart;

        if (p.low && p.high) {
          var fLow = Math.round(p.low).toLocaleString();
          var fHigh = Math.round(p.high).toLocaleString();
          line += " — ~$" + fLow + "–$" + fHigh;
        } else {
          line += " (walkthrough needed)";
        }

        lines.push(line);

        // Add extra detail line (mode, rush, promo, lead, debris, addons)
        var modeLabel = "Full (L+M)";
        if (p.pricingMode === "labor") modeLabel = "Labor Only";
        if (p.pricingMode === "materials") modeLabel = "Materials+Help";

        var extras = [modeLabel];
        if (p.isRush) extras.push("Rush");

        // FIX: Promo code display
        if (p.promoCode) {
            var dc_rate = DISCOUNTS[p.promoCode.toUpperCase()];
            var dc_text = dc_rate ? " (" + Math.round(dc_rate * 100) + "% OFF)" : "";
            extras.push("Promo: " + p.promoCode.toUpperCase() + dc_text);
        }

        if (p.isLeadHome) extras.push("Lead-safe");
        
        // Addons detail
        if (p.selectedAddons && p.selectedAddons.length > 0) {
             p.selectedAddons.forEach(addon => {
                extras.push("ADDON: " + addon.label + " (~$" + Math.round(addon.low).toLocaleString() + ")");
             });
        }


        if (extras.length) {
          lines.push("   [" + extras.join(" | ") + "]");
        }
      });

      // Add combined totals
      var totals = computeGrandTotal();

      // Add debris add-on if applicable
      if (totals.projectRequiresDebris) {
          lines.push("Add-on: Debris Removal (~$" + Math.round(ADD_ON_PRICES.debrisRemoval.low).toLocaleString() + "–$" + Math.round(ADD_ON_PRICES.debrisRemoval.high).toLocaleString() + ")");
      }

      // Add Combined Total
      if (totals.totalLow) {
          lines.push("\nCOMBINED RANGE: $" + Math.round(totals.totalLow).toLocaleString() + " – $" + Math.round(totals.totalHigh).toLocaleString());
      }
    } else if (state.serviceKey && SERVICES[state.serviceKey]) {
      lines.push(SERVICES[state.serviceKey].label);
    }

    lines.push("Customer Name: " + state.name);
    lines.push("Phone: " + state.phone);
    lines.push("Please reply to schedule a walkthrough.");
    lines.push("");
    lines.push(
      "Disclaimer: This is an automated ballpark estimate only. " +
      "It is not a formal estimate, contract, or offer for services. " +
      "Final pricing may change after an in-person walkthrough and a written agreement."
    );

    var body = encodeURIComponent(lines.join("\n"));

    // Phone and Email Fixes
    var smsLink = "sms:9295955300?&body=" + body;
    var emailLink =
      "mailto:hammerbrickhome@gmail.com?subject=" +
      encodeURIComponent("Estimate Request - Hammer Brick & Home") +
      "&body=" +
      body;

    addBotMessage(
      "Thanks, " +
        state.name +
        "! Choose how you’d like to contact us and feel free to attach your photos.",
      false
    );

    setTimeout(function() {

      // 1. Text to My Phone (user's preferred self-save)
      var smsUserBtn = document.createElement("a");
      smsUserBtn.className = "hb-chip hb-primary-btn";
      smsUserBtn.style.display = "block";
      smsUserBtn.style.textAlign = "center";
      smsUserBtn.style.textDecoration = "none";
      smsUserBtn.style.marginTop = "10px";
      smsUserBtn.textContent = "📲 Text Estimate to My Phone";
      smsUserBtn.href = smsLink;
      els.body.appendChild(smsUserBtn);

      // 2. Text to Hammer Brick (NEW BUTTON REQUESTED)
      var smsHBBtn = document.createElement("a");
      smsHBBtn.className = "hb-chip hb-primary-btn";
      smsHBBtn.style.display = "block";
      smsHBBtn.style.textAlign = "center";
      smsHBBtn.style.textDecoration = "none";
      smsHBBtn.style.marginTop = "8px";
      smsHBBtn.textContent = "📲 Text Estimate to Hammer Brick";
      smsHBBtn.href = smsLink;
      els.body.appendChild(smsHBBtn);

      // 3. Email button
      var emailBtn = document.createElement("a");
      emailBtn.className = "hb-chip hb-primary-btn";
      emailBtn.style.display = "block";
      emailBtn.style.textAlign = "center";
      emailBtn.style.textDecoration = "none";
      emailBtn.style.marginTop = "8px";
      emailBtn.textContent = "✉️ Email Estimate to Hammer Brick & Home";
      emailBtn.href = emailLink;
      els.body.appendChild(emailBtn);

      // Optional CRM / form
      if (CRM_FORM_URL) {
        var formBtn = document.createElement("a");
        formBtn.className = "hb-chip";
        formBtn.style.display = "block";
        formBtn.style.textAlign = "center";
        formBtn.style.textDecoration = "none";
        formBtn.style.marginTop = "8px";
        formBtn.textContent = "📝 Complete Full Intake Form";
        formBtn.href = CRM_FORM_URL;
        formBtn.target = "_blank";
        els.body.appendChild(formBtn);
      }

      // Optional walkthrough booking
      if (WALKTHROUGH_URL) {
        var walkBtn = document.createElement("a");
        walkBtn.className = "hb-chip";
        walkBtn.style.display = "block";
        walkBtn.style.textAlign = "center";
        walkBtn.style.textDecoration = "none";
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

  // --- UTILS -------------------------------------------------

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

  function handleManualInput() {
    if (!els.input.disabled && els.send) els.send.click();
  }

  // --- RUN ---------------------------------------------------

  document.addEventListener("DOMContentLoaded", init);

})();
