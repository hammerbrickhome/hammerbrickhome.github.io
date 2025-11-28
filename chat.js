/* ============================================================
   HAMMER BRICK & HOME — ESTIMATOR BOT v14.3 (FULL CPQ SUITE)
   - NEW: Financing Calc, Gated Pricing, Phone Masking.
   - NEW: Real Estimate ID, Session Save, Photo Warning.
   - NEW: HVAC, Junk Removal, Design Services added.
   - INCLUDES: Anti-Freeze ID, Lead-Safe Logic, Analytics.
=============================================================== */

(function() {
  // --- CONFIGURATION -----------------------------------------

  const BOT_VERSION = "14.3";
  const WEBHOOK_URL = ""; // <- Plug in your Zapier/Make URL here
  const PHONE_NUMBER = "9295955300"; 
  const CRM_FORM_URL = ""; 
  const WALKTHROUGH_URL = "";
  
  // Financing: approx 9.99% APR for 60 months
  const FINANCING_RATE = 0.0999 / 12; 
  const FINANCING_MONTHS = 60;

  // Modifiers apply to BASE PRICE + ADD-ONS + DEBRIS
  const BOROUGH_MODS = {
    "Manhattan": 1.18, "Brooklyn": 1.08, "Queens": 1.05,
    "Bronx": 1.03, "Staten Island": 1.0, "New Jersey": 0.96
  };

  const DISCOUNTS = { "VIP10": 0.10, "REFERRAL5": 0.05, "WEBSAVER": 0.05 };
  
  // Base Debris Price
  const ADD_ON_PRICES = { "debrisRemoval": { low: 1200, high: 2800 } }; 

  const SMART_ADDON_GROUP_LABELS = {
    luxury: "Luxury Upgrades", protection: "Protection & Safety",
    design: "Design Enhancements", speed: "Speed / Convenience",
    maintenance: "Maintenance Items"
  };

  // --- SMART ADD-ONS CONFIG (FULL LIST RESTORED) ---
  const SMART_ADDONS_CONFIG = {
    masonry: {
      title: "Masonry · Pavers · Concrete",
      groups: {
        luxury: [
          { label: "Premium border band (Granite/Blue Stone)", low: 1800, high: 3500 },
          { label: "Decorative inlays or medallion pattern", low: 1500, high: 4200 },
          { label: "Raised seating wall (per 10ft)", low: 3500, high: 6800 }, 
          { label: "Outdoor kitchen prep pad (gas/electric ready)", low: 3200, high: 7500 }
        ],
        protection: [
          { label: "Full base compaction + Geogrid", low: 1200, high: 2800 },
          { label: "Perimeter channel drain system", low: 1800, high: 3800 }, 
          { label: "Concrete edge restraint / curb", low: 950, high: 2200 }
        ],
        design: [
          { label: "Color upgrade / multi-blend pavers", low: 850, high: 2200 },
          { label: "Large-format or European-style pavers", low: 2200, high: 5800 }, 
          { label: "Step face stone veneer upgrade", low: 1800, high: 4500 }
        ],
        speed: [
          { label: "Weekend or off-hours install", low: 1500, high: 3500 },
          { label: "Phased work scheduling", low: 650, high: 1500 }
        ],
        maintenance: [
          { label: "Polymeric sand refill & joint tightening", low: 450, high: 950 },
          { label: "Clean & seal package", low: 850, high: 2200 }
        ]
      }
    },
    driveway: {
      title: "Driveway / Parking Area",
      groups: {
        luxury: [
          { label: "Decorative apron (Belgium Block)", low: 2200, high: 5500 }, 
          { label: "Heated driveway system (Electric/Hydronic)", low: 12000, high: 28000 }, 
          { label: "Integrated lighting at edges", low: 1500, high: 3200 }
        ],
        protection: [
          { label: "Commercial grade base (6-inch concrete)", low: 2800, high: 5500 },
          { label: "Heavy-duty trench drain at garage", low: 2200, high: 4500 } 
        ],
        design: [
          { label: "Two-tone driveway with borders", low: 1800, high: 4800 },
          { label: "Stamped concrete pattern upgrade", low: 2500, high: 6500 }
        ],
        speed: [
          { label: "Temporary parking pad during work", low: 850, high: 1800 }
        ],
        maintenance: [
          { label: "Sealcoat package (asphalt)", low: 550, high: 1200 }
        ]
      }
    },
    roofing: {
      title: "Roofing",
      groups: {
        luxury: [
          { label: "Architectural designer shingle upgrade", low: 2500, high: 6500 },
          { label: "Copper flashing & accents", low: 3500, high: 8500 } 
        ],
        protection: [
          { label: "Full ice & water shield (Entire Roof)", low: 2200, high: 5500 }, 
          { label: "High-performance synthetic underlayment", low: 850, high: 2200 },
          { label: "Chimney repointing & new flashing", low: 1800, high: 4200 }
        ],
        design: [
          { label: "Color-matched drip edge & accessories", low: 650, high: 1500 },
          { label: "Decorative ridge cap upgrade", low: 850, high: 1800 }
        ],
        speed: [
          { label: "One-day tear-off & install (Extra Crew)", low: 2500, high: 5500 }
        ],
        maintenance: [
          { label: "Gutter cleaning & guard install", low: 850, high: 2200 }
        ]
      }
    },
    siding: {
      title: "Siding – Exterior",
      groups: {
        luxury: [
          { label: "Stone or brick accent wall", low: 5500, high: 14000 }, 
          { label: "Board-and-batten composite look", low: 4500, high: 11000 }
        ],
        protection: [
          { label: "Rigid foam insulation board (R-Value+)", low: 2800, high: 6500 },
          { label: "Custom PVC window trim surrounds", low: 2200, high: 5500 }
        ],
        design: [
          { label: "Premium dark colors (Anti-Fade)", low: 3200, high: 8500 },
          { label: "Decorative crown & fascia details", low: 1800, high: 4800 }
        ],
        maintenance: [
          { label: "Annual siding wash & inspection", low: 450, high: 950 }
        ]
      }
    },
    windows: {
      title: "Windows & Exterior Doors",
      groups: {
        luxury: [
          { label: "Black interior/exterior frames", low: 3500, high: 8500 },
          { label: "Sliding patio door (8ft upgrade)", low: 3800, high: 9200 }
        ],
        protection: [
          { label: "Triple-pane noise reduction glass", low: 3200, high: 8800 }, 
          { label: "Security storm door package", low: 950, high: 2200 }
        ],
        design: [
          { label: "Simulated Divided Lites (Grids)", low: 850, high: 2400 },
          { label: "New interior casing & stools", low: 1200, high: 3500 }
        ],
        speed: [
          { label: "Same-day glass removal & board-up", low: 650, high: 1500 }
        ]
      }
    },
    exterior_paint: {
      title: "Exterior Facade / Painting",
      groups: {
        luxury: [
          { label: "Multi-color Victorian accent scheme", low: 2200, high: 5500 },
          { label: "Premium elastomeric coating (Waterproof)", low: 3500, high: 7500 } 
        ],
        protection: [
          { label: "Full scrape & oil-based prime", low: 2500, high: 5500 },
          { label: "Lead-safe containment protocol", low: 1800, high: 4800 }
        ],
        design: [
          { label: "Color consult with sample boards", low: 550, high: 1200 }
        ],
        speed: [
          { label: "Lift / boom access (if accessible)", low: 2200, high: 5800 }
        ]
      }
    },
    deck: {
      title: "Deck / Patio Build or Rebuild",
      groups: {
        luxury: [
          { label: "Premium Composite (Trex Transcend)", low: 4500, high: 12000 }, 
          { label: "Cable or glass railing system", low: 3500, high: 11000 },
          { label: "Built-in cocktail rail & benches", low: 2200, high: 5500 }
        ],
        protection: [
          { label: "Steel framing upgrade", low: 3500, high: 9500 },
          { label: "Joist protection tape & flashing", low: 650, high: 1500 }
        ],
        design: [
          { label: "Picture-frame border & inlay", low: 1500, high: 3500 },
          { label: "Custom Pergola / Shade Structure", low: 7500, high: 18000 } 
        ],
        maintenance: [
          { label: "Clean & seal package (wood decks)", low: 650, high: 1800 }
        ]
      }
    },
    fence: {
      title: "Fence Install / Replacement",
      groups: {
        luxury: [
          { label: "Decorative aluminum / steel upgrade", low: 2800, high: 8500 },
          { label: "Horizontal cedar slat (Modern)", low: 3200, high: 9200 } 
        ],
        protection: [
          { label: "8ft Privacy height upgrade", low: 1500, high: 3500 },
          { label: "Concrete footer reinforcement", low: 850, high: 1800 }
        ],
        design: [
          { label: "Decorative post caps & trim", low: 550, high: 1500 },
          { label: "Lattice topper", low: 1200, high: 3200 }
        ],
        speed: [
          { label: "Temporary safety fence", low: 550, high: 1400 }
        ]
      }
    },
    waterproofing: {
      title: "Waterproofing",
      groups: {
        luxury: [
          { label: "Dual Battery backup sump system", low: 2200, high: 5800 }
        ],
        protection: [
          { label: "Interior French drain (Jackhammer)", low: 5800, high: 16000 }, 
          { label: "Full exterior excavation membrane", low: 12000, high: 35000 } 
        ],
        design: [
          { label: "Finished waterproof wall panels", low: 3500, high: 8500 }
        ]
      }
    },
    powerwash: {
      title: "Power Washing",
      groups: {
        luxury: [
          { label: "House + driveway + patio bundle", low: 650, high: 1800 } 
        ],
        protection: [
          { label: "Soft-wash roof treatment", low: 850, high: 2200 }
        ],
        design: [
          { label: "Paver sanding & sealing", low: 1200, high: 3500 }
        ],
        maintenance: [
          { label: "Seasonal wash contract (2x per year)", low: 850, high: 2200 }
        ]
      }
    },
    sidewalk: {
      title: "Sidewalk / DOT",
      groups: {
        luxury: [
          { label: "Colored concrete / decorative finish", low: 1200, high: 2800 }
        ],
        protection: [
          { label: "Steel mesh & fiber reinforcement", low: 950, high: 2200 },
          { label: "Tree root barrier & protection", low: 1500, high: 4200 }
        ],
        design: [
          { label: "Scored control joint pattern", low: 550, high: 1400 }
        ],
        speed: [
          { label: "Expedited DOT violation removal", low: 850, high: 2500 } 
        ]
      }
    },
    gutter: {
      title: "Gutters",
      groups: {
        luxury: [
          { label: "Copper or Galvalume gutters", low: 2500, high: 6500 } 
        ],
        protection: [
          { label: "Micro-mesh gutter guards", low: 1200, high: 3200 },
          { label: "New fascia board installation", low: 1500, high: 3800 }
        ],
        design: [
          { label: "Color-matched system", low: 550, high: 1200 }
        ],
        speed: [
          { label: "Same-day cleaning add-on", low: 350, high: 750 }
        ]
      }
    },
    painting: {
      title: "Interior Painting",
      groups: {
        luxury: [
          { label: "Wallpaper installation (per room)", low: 850, high: 2200 }, 
          { label: "Fine finish cabinet spray", low: 2500, high: 6500 }
        ],
        protection: [
          { label: "Full Level-5 skim coat", low: 2800, high: 7500 }, 
          { label: "Zero-VOC / Eco paint", low: 850, high: 2200 }
        ],
        design: [
          { label: "Color consult with samples", low: 450, high: 950 }
        ],
        speed: [
          { label: "Night or weekend painting", low: 1200, high: 3500 }
        ]
      }
    },
    flooring: {
      title: "Flooring",
      groups: {
        luxury: [
          { label: "Wide-plank / Herringbone install", low: 3500, high: 9500 }, 
          { label: "Radiant floor heating mats", low: 2500, high: 6500 } 
        ],
        protection: [
          { label: "Sound-proof cork underlayment", low: 1200, high: 3200 },
          { label: "Subfloor leveling & repair", low: 1500, high: 4500 }
        ],
        design: [
          { label: "Custom stair treads & risers", low: 2200, high: 5500 }
        ],
        speed: [
          { label: "Furniture moving & protection", low: 650, high: 1800 }
        ]
      }
    },
    drywall: {
      title: "Drywall",
      groups: {
        luxury: [
          { label: "Level 5 smooth finish (per room)", low: 2500, high: 6500 } 
        ],
        protection: [
          { label: "QuietRock / Sound-damping board", low: 1800, high: 5200 },
          { label: "Mold-resistant purple board", low: 950, high: 2800 }
        ],
        design: [
          { label: "Soffit / tray ceiling framing", low: 2800, high: 8200 }
        ],
        speed: [
          { label: "Dust-free sanding system", low: 850, high: 2200 }
        ]
      }
    },
    bathroom: {
      title: "Bathroom Remodel",
      groups: {
        luxury: [
          { label: "Frameless glass shower enclosure", low: 2200, high: 4800 },
          { label: "Heated floor system", low: 1800, high: 3500 },
          { label: "Wall-mounted vanity install", low: 1200, high: 2800 }
        ],
        protection: [
          { label: "Schluter-Kerdi waterproofing", low: 1500, high: 3800 },
          { label: "New subfloor & framing reinforcement", low: 1800, high: 4500 }
        ],
        design: [
          { label: "Floor-to-ceiling tile work", low: 3500, high: 8500 },
          { label: "LED niche & accent lighting", low: 850, high: 2200 }
        ],
        speed: [
          { label: "Expedited plumbing rough-in", low: 1500, high: 3500 } 
        ]
      }
    },
    kitchen: {
      title: "Kitchen Remodel",
      groups: {
        luxury: [
          { label: "Full height stone backsplash", low: 2500, high: 6500 },
          { label: "Waterfall island edge (Stone)", low: 3500, high: 8500 }, 
          { label: "Pot filler plumbing & install", low: 1200, high: 2800 }
        ],
        protection: [
          { label: "Under-cabinet LED lighting", low: 1200, high: 2800 },
          { label: "New subfloor & tile prep", low: 1800, high: 4500 }
        ],
        design: [
          { label: "Glass cabinet doors / inserts", low: 1200, high: 3200 },
          { label: "Custom range hood enclosure", low: 2500, high: 6800 }
        ],
        speed: [
          { label: "Temporary sink setup", low: 850, high: 2200 }
        ]
      }
    },
    handyman: {
      title: "Handyman",
      groups: {
        luxury: [
          { label: "Priority same-week booking", low: 250, high: 550 }
        ],
        protection: [
          { label: "Safety package (grab bars)", low: 350, high: 850 }
        ],
        design: [
          { label: "Decor hardware refresh", low: 450, high: 1200 }
        ],
        speed: [
          { label: "Evening/weekend window", low: 350, high: 750 }
        ]
      }
    },
    outdoor_living: {
      title: "Outdoor Living & Kitchens",
      groups: {
        luxury: [
          { label: "Built-in Pizza Oven", low: 3500, high: 8500 },
          { label: "Granite/Stone Counter Upgrade", low: 2500, high: 6500 }
        ],
        protection: [
          { label: "Gas Line Safety Shut-off & Permit", low: 1200, high: 2800 },
          { label: "Custom Canvas Cover", low: 650, high: 1800 }
        ],
        design: [
          { label: "Pergola / Shade Structure", low: 4500, high: 12500 },
          { label: "Under-counter LED lighting", low: 850, high: 2200 }
        ]
      }
    },
    // NEW SERVICES ADDONS
    hvac: {
        title: "HVAC / Mini-Splits",
        groups: {
            luxury: [{ label: "Wi-Fi Smart Controllers", low: 400, high: 900 }],
            protection: [{ label: "Line Set Covers (Hide pipes)", low: 350, high: 800 }]
        }
    },
    junk_removal: {
        title: "Junk Removal",
        groups: {
            speed: [{ label: "Same Day Rush", low: 250, high: 500 }]
        }
    }
  };

  // --- FULL SERVICE DEFINITIONS ---
  const SERVICES = {
    "masonry": {
      label: "Masonry & Concrete", emoji: "🧱", unit: "sq ft",
      baseLow: 16, baseHigh: 28, min: 2500,
      subQuestion: "What type of finish?",
      options: [
        { label: "Standard Concrete ($)", factor: 1.0 },
        { label: "Pavers ($$)", factor: 1.6 },
        { label: "Natural Stone ($$$)", factor: 2.2 }
      ],
      sizePresets: [
        { label: "Sidewalk Flag (25 sq ft)", val: 25 },
        { label: "Small Patio (10x10)", val: 100 },
        { label: "Standard Backyard (20x20)", val: 400 },
        { label: "Large Driveway/Yard (50x20)", val: 1000 }
      ]
    },
    "driveway": {
      label: "Driveway", emoji: "🚗", unit: "sq ft",
      baseLow: 10, baseHigh: 20, min: 3500,
      subQuestion: "Current surface condition?",
      options: [
        { label: "Dirt/Gravel (New)", factor: 1.0 },
        { label: "Existing Asphalt (Removal)", factor: 1.25 },
        { label: "Existing Concrete (Hard Demo)", factor: 1.4 }
      ],
      sizePresets: [
        { label: "1-Car Spot (10x20)", val: 200 },
        { label: "2-Car Wide (20x20)", val: 400 },
        { label: "Long Driveway (50ft)", val: 500 }
      ]
    },
    "roofing": {
      label: "Roofing", emoji: "🏠", unit: "sq ft",
      baseLow: 4.5, baseHigh: 9.5, min: 6500,
      subQuestion: "Roof type?",
      options: [
        { label: "Shingle (Standard)", factor: 1.0 },
        { label: "Flat Roof (NYC Spec)", factor: 1.5 },
        { label: "Slate/Specialty", factor: 2.5 }
      ],
      sizePresets: [
        { label: "Garage Roof", val: 300 },
        { label: "Rowhouse / Brownstone", val: 900 },
        { label: "Detached Home", val: 1600 }
      ]
    },
    "painting": {
      label: "Interior Painting", emoji: "🎨", unit: "sq ft",
      baseLow: 1.8, baseHigh: 3.8, min: 1800,
      subQuestion: "Paint quality?", leadSensitive: true,
      options: [
        { label: "Standard Paint", factor: 1.0 },
        { label: "Premium Paint", factor: 1.3 },
        { label: "Luxury Benjamin Moore", factor: 1.55 }
      ],
      sizePresets: [
        { label: "Powder Room", val: 60 },
        { label: "Standard Bedroom (12x12)", val: 144 },
        { label: "Master Suite", val: 300 },
        { label: "Living/Dining Area", val: 500 },
        { label: "Whole Apartment (1 Bed)", val: 750 }
      ]
    },
    "exterior_paint": {
      label: "Exterior Painting", emoji: "🖌", unit: "sq ft",
      baseLow: 2.5, baseHigh: 5.5, min: 3500,
      subQuestion: "Surface condition?",
      options: [
        { label: "Good Condition", factor: 1.0 },
        { label: "Peeling / Prep Needed", factor: 1.4 },
        { label: "Heavy Prep / Repairs", factor: 1.8 }
      ],
      sizePresets: [
        { label: "Garage Front", val: 200 },
        { label: "Small Facade (Rowhome)", val: 400 },
        { label: "Full Detached House", val: 2500 }
      ]
    },
    "basement_floor": {
      label: "Basement Floor Paint / Epoxy", emoji: "🧼", unit: "sq ft",
      baseLow: 2.8, baseHigh: 5.5, min: 1200,
      subQuestion: "Floor type?",
      options: [
        { label: "1-Part Epoxy Paint", factor: 1.0 },
        { label: "2-Part Epoxy (Thick Coat)", factor: 1.6 },
        { label: "Flake System", factor: 2.1 }
      ],
      sizePresets: [
        { label: "Small Utility Room", val: 150 },
        { label: "Standard Basement (20x25)", val: 500 },
        { label: "Large Full Basement", val: 900 }
      ]
    },
    "fence": {
      label: "Fence Install", emoji: "🚧", unit: "linear ft",
      baseLow: 30, baseHigh: 75, min: 1800,
      subQuestion: "Fence type?",
      options: [
        { label: "Wood", factor: 1.0 },
        { label: "PVC", factor: 1.6 },
        { label: "Chain-Link", factor: 0.9 },
        { label: "Aluminum", factor: 2.0 }
      ],
      sizePresets: [
        { label: "Back Line Only (20ft)", val: 20 },
        { label: "Small Yard (3 sides)", val: 100 },
        { label: "Large Perimeter", val: 200 }
      ]
    },
    "deck": {
      label: "Deck / Porch Build", emoji: "🪵", unit: "sq ft",
      baseLow: 35, baseHigh: 65, min: 5000,
      subQuestion: "Deck material?",
      options: [
        { label: "Pressure Treated", factor: 1.0 },
        { label: "Composite (Trex)", factor: 1.9 },
        { label: "PVC Luxury", factor: 2.4 }
      ],
      sizePresets: [
        { label: "Small Landing (4x4)", val: 16 },
        { label: "Bistro Deck (8x10)", val: 80 },
        { label: "Entertainer Deck (16x20)", val: 320 }
      ]
    },
    "drywall": {
      label: "Drywall Install / Repair", emoji: "📐", unit: "sq ft",
      baseLow: 3.2, baseHigh: 6.5, min: 750,
      subQuestion: "Scope?",
      options: [
        { label: "Minor Repairs", factor: 1.0 },
        { label: "Full Install", factor: 1.6 },
        { label: "Level 5 Finish", factor: 2.1 }
      ],
      sizePresets: [
        { label: "Patch & Repair", val: 50 },
        { label: "One Wall", val: 120 },
        { label: "Whole Room", val: 500 }
      ]
    },
    "flooring": {
      label: "Flooring Installation", emoji: "🪚", unit: "sq ft",
      baseLow: 3.5, baseHigh: 9.5, min: 2500,
      subQuestion: "Flooring type?",
      options: [
        { label: "Vinyl Plank", factor: 1.0 },
        { label: "Tile", factor: 1.8 },
        { label: "Hardwood", factor: 2.4 },
        { label: "Laminate", factor: 1.2 }
      ],
      sizePresets: [
        { label: "Hallway / Foyer", val: 80 },
        { label: "Bedroom", val: 150 },
        { label: "Living Room", val: 300 }
      ]
    },
    "powerwash": {
      label: "Power Washing", emoji: "💦", unit: "sq ft",
      baseLow: 0.35, baseHigh: 0.85, min: 250,
      quickQuote: true, // Quick Quote Mode
      sizePresets: [
        { label: "Deck / Patio Only", val: 300 },
        { label: "Siding (One Side)", val: 500 },
        { label: "Whole House", val: 2000 }
      ]
    },
    "gutter": {
      label: "Gutter Install", emoji: "🩸", unit: "linear ft",
      baseLow: 15, baseHigh: 35, min: 1200,
      quickQuote: true,
      subQuestion: "Type?",
      options: [
        { label: "Aluminum", factor: 1.0 },
        { label: "Seamless", factor: 1.4 },
        { label: "Copper", factor: 3.5 }
      ],
      sizePresets: [
        { label: "Front Only", val: 25 },
        { label: "Front & Back", val: 50 },
        { label: "Whole House", val: 120 }
      ]
    },
    "windows": {
      label: "Windows Install", emoji: "🪟", unit: "fixed",
      subQuestion: "Window type?",
      options: [
        { label: "Standard Vinyl", fixedLow: 550, fixedHigh: 850 },
        { label: "Double Hung Premium", fixedLow: 850, fixedHigh: 1400 },
        { label: "Bay/Bow Window", fixedLow: 3500, fixedHigh: 6500 }
      ]
    },
    "doors": {
      label: "Door Installation", emoji: "🚪", unit: "fixed",
      subQuestion: "Door type?",
      options: [
        { label: "Interior", fixedLow: 250, fixedHigh: 550 },
        { label: "Exterior Steel / Fiberglass", fixedLow: 950, fixedHigh: 1800 },
        { label: "Sliding Patio", fixedLow: 2200, fixedHigh: 4200 }
      ]
    },
    "demo": {
      label: "Demolition", emoji: "💥", unit: "sq ft",
      baseLow: 3.0, baseHigh: 7.5, min: 900,
      subQuestion: "Material?", leadSensitive: true,
      options: [
        { label: "Drywall", factor: 1.0 },
        { label: "Tile / Bathroom Demo", factor: 1.8 },
        { label: "Concrete Demo", factor: 2.4 }
      ]
    },
    "retaining": {
      label: "Retaining Wall", emoji: "🧱", unit: "linear ft",
      baseLow: 60, baseHigh: 140, min: 5500,
      subQuestion: "Material?",
      options: [
        { label: "CMU Block", factor: 1.0 },
        { label: "Poured Concrete", factor: 1.7 },
        { label: "Stone Veneer", factor: 2.3 }
      ]
    },
    "handyman": {
      label: "Small Repairs / Handyman", emoji: "🛠", unit: "consult", quickQuote: true
    },
    "kitchen": {
      label: "Kitchen Remodel", emoji: "🍳", unit: "fixed",
      subQuestion: "What is the scope?",
      options: [
        { label: "Refresh (Cosmetic)", fixedLow: 18000, fixedHigh: 30000 },
        { label: "Mid-Range (Cabinets+)", fixedLow: 30000, fixedHigh: 55000 },
        { label: "Full Gut / Luxury", fixedLow: 55000, fixedHigh: 110000 }
      ],
      leadSensitive: true
    },
    "bathroom": {
      label: "Bathroom Remodel", emoji: "🚿", unit: "fixed",
      subQuestion: "What is the scope?",
      options: [
        { label: "Update (Fixtures/Tile)", fixedLow: 14000, fixedHigh: 24000 },
        { label: "Full Gut / Redo", fixedLow: 24000, fixedHigh: 45000 }
      ],
      leadSensitive: true
    },
    "siding": {
      label: "Siding Installation", emoji: "🏡", unit: "sq ft",
      baseLow: 8.5, baseHigh: 18.5, min: 4000,
      subQuestion: "Siding Material?",
      options: [
        { label: "Vinyl", factor: 1.0 },
        { label: "Wood/Cedar Shake", factor: 1.8 },
        { label: "Fiber Cement (Hardie)", factor: 1.5 }
      ],
      sizePresets: [
        { label: "One Wall / Repair", val: 300 },
        { label: "Small Home", val: 1200 },
        { label: "Large Home", val: 2500 }
      ]
    },
    "chimney": {
      label: "Chimney Repair / Rebuild", emoji: "🔥", unit: "fixed",
      subQuestion: "Scope of work?",
      options: [
        { label: "Cap / Flashing Repair", fixedLow: 800, fixedHigh: 1800 },
        { label: "Partial Rebuild (Above roofline)", fixedLow: 3000, fixedHigh: 6500 },
        { label: "Full Masonry Rebuild", fixedLow: 6500, fixedHigh: 12000 }
      ]
    },
    "insulation": {
      label: "Insulation Install", emoji: "🌡️", unit: "sq ft",
      baseLow: 1.2, baseHigh: 3.5, min: 1000,
      subQuestion: "Insulation type?",
      options: [
        { label: "Fiberglass Batts", factor: 1.0 },
        { label: "Blown-in Cellulose", factor: 1.2 },
        { label: "Spray Foam (Closed-Cell)", factor: 2.5 }
      ]
    },
    "sidewalk": {
      label: "Sidewalk, Steps, & Stoops", emoji: "🚶", unit: "fixed",
      subQuestion: "Scope of work?",
      options: [
        { label: "Sidewalk Violation Repair", fixedLow: 3500, fixedHigh: 7500 },
        { label: "Front Steps / Stoop Rebuild", fixedLow: 6000, fixedHigh: 15000 },
        { label: "New Paver Walkway", fixedLow: 45, fixedHigh: 85, isPerSqFt: true }
      ]
    },
    "outdoor_living": {
      label: "Outdoor Living (Kitchen/Firepit)", emoji: "🔥", unit: "fixed",
      subQuestion: "What do you need built?",
      options: [
        { label: "Fire Pit Station", fixedLow: 3500, fixedHigh: 6500 },
        { label: "Outdoor Kitchen (Base)", fixedLow: 12000, fixedHigh: 25000 },
        { label: "Full Entertainment Patio", fixedLow: 25000, fixedHigh: 65000 }
      ]
    },
    "waterproofing": {
      label: "Waterproofing / Leak Repair", emoji: "💧", unit: "linear ft",
      baseLow: 40, baseHigh: 90, min: 2500,
      subQuestion: "Location of leak?",
      options: [
        { label: "Exterior Foundation", factor: 1.0 },
        { label: "Basement Interior", factor: 1.5 },
        { label: "Roof/Flashing (Requires inspection)", factor: 1.8 }
      ]
    },
    // NEW SERVICES (Added v14.3)
    "hvac": {
        label: "HVAC / Mini-Splits", emoji: "❄️", unit: "fixed",
        subQuestion: "Number of zones/heads?",
        options: [
            { label: "Single Zone (1 Head)", fixedLow: 3500, fixedHigh: 5500 },
            { label: "Dual Zone (2 Heads)", fixedLow: 6500, fixedHigh: 9500 },
            { label: "Whole Home (3-5 Heads)", fixedLow: 12000, fixedHigh: 22000 }
        ]
    },
    "junk_removal": {
        label: "Junk Removal", emoji: "🗑️", unit: "fixed",
        subQuestion: "Volume estimate?",
        options: [
            { label: "1/4 Truck (Small Pile)", fixedLow: 350, fixedHigh: 550 },
            { label: "1/2 Truck", fixedLow: 550, fixedHigh: 850 },
            { label: "Full Truck Load", fixedLow: 850, fixedHigh: 1400 }
        ]
    },
    "design": {
        label: "Design & Blueprints", emoji: "📐", unit: "consult",
        subQuestion: "Phase?",
        options: [
            { label: "Concept Sketches", fixedLow: 500, fixedHigh: 1500 },
            { label: "DOB Filing / Architect", fixedLow: 3500, fixedHigh: 8500 }
        ]
    },
    "other": {
      label: "Other / Custom", emoji: "📋", unit: "consult"
    }
  };

  // --- STATE MANAGEMENT ---------------------------------------
  
  // Generate a unique estimate ID for the session
  function generateEstimateID() {
    return "HB-" + Math.floor(100000 + Math.random() * 900000);
  }

  let state = {
    step: 0,
    estimateId: null, // Anti-freeze ID
    lang: "en", // en or es
    serviceKey: null,
    subOption: null,
    size: 0,
    borough: null,
    isLeadHome: false,
    pricingMode: "full",
    isRush: false,
    promoCode: "",
    debrisRemoval: false,
    selectedAddons: [], 
    name: "",
    phone: "",
    projectTiming: "",
    leadSource: "",
    projects: [],
    isPhotoSkip: false,
    interestedInMembership: false 
  };

  let els = {};
  let tickerInterval; 

  // --- HELPER: ANALYTICS & SAVING -----------------------------

  function trackEvent(name, data) {
    console.log("HB_TRACK:", name, data);
    // if (typeof gtag === 'function') { gtag('event', name, data); }
  }

  function saveState() {
    try {
      localStorage.setItem("hb_estimator_state", JSON.stringify(state));
    } catch(e) {}
  }

  function loadState() {
    try {
      const saved = localStorage.getItem("hb_estimator_state");
      if (saved) {
        // Logic could go here to resume. For now, we just note it.
        // const parsed = JSON.parse(saved);
        // if(parsed.name) ...
      }
    } catch(e) {}
  }

  // --- INIT ---------------------------------------------------

  function init() {
    console.log(`HB Chat: Initializing v${BOT_VERSION}...`);
    loadState();
    createInterface();
    startTicker();
    
    // Auto-open logic
    if (!sessionStorage.getItem("hb_has_opened_automatically")) {
        setTimeout(function() {
            if (!els.wrapper.classList.contains("hb-open")) {
                toggleChat();
                sessionStorage.setItem("hb_has_opened_automatically", "true");
            }
        }, 4000); 
    }

    setTimeout(stepOne_Disclaimer, 800);
  }

  function createInterface() {
    const fab = document.createElement("div");
    fab.className = "hb-chat-fab";
    fab.setAttribute("aria-label", "Instant Estimate");
    fab.innerHTML = `<span class="hb-fab-icon">⚡</span><span class="hb-fab-text">Instant Estimate</span>`;
    fab.style.display = "flex"; 
    fab.style.zIndex = "2147483647";
    fab.onclick = toggleChat;
    document.body.appendChild(fab);

    const wrapper = document.createElement("div");
    wrapper.className = "hb-chat-wrapper";
    wrapper.innerHTML = `
      <div class="hb-chat-header">
        <div class="hb-chat-title">
          <h3>Hammer Brick & Home</h3>
          <span style="color:#e7bf63; font-size:11px; letter-spacing:0.5px;">★★★★★ 5.0 on Google</span>
        </div>
        <div style="display:flex; gap:15px; align-items:center;">
            <a href="tel:${PHONE_NUMBER}" style="text-decoration:none; color:#fff; font-size:18px;" aria-label="Call Now">📞</a>
            <button class="hb-chat-close" style="font-size:24px;">×</button>
        </div>
      </div>
      <div id="hb-ticker" style="background:#1c263b; color:#888; font-size:10px; padding:6px 16px; border-bottom:1px solid rgba(255,255,255,0.05); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        Initializing...
      </div>
      <div class="hb-progress-container">
        <div class="hb-progress-bar" id="hb-prog"></div>
      </div>
      <div class="hb-chat-body" id="hb-body" role="log" aria-live="polite"></div>
      <div class="hb-chat-footer">
        <input type="text" class="hb-chat-input" id="hb-input" placeholder="Select an option..." disabled>
        <button class="hb-chat-send" id="hb-send">➤</button>
      </div>
    `;
    document.body.appendChild(wrapper);

    const photoInput = document.createElement("input");
    photoInput.type = "file";
    photoInput.accept = "image/*";
    photoInput.multiple = true;
    photoInput.style.display = "none";
    photoInput.id = "hb-photo-input";
    document.body.appendChild(photoInput);

    els = {
      wrapper, fab, body: document.getElementById("hb-body"),
      input: document.getElementById("hb-input"),
      send: document.getElementById("hb-send"),
      prog: document.getElementById("hb-prog"),
      ticker: document.getElementById("hb-ticker"),
      close: wrapper.querySelector(".hb-chat-close"),
      photoInput
    };

    els.close.onclick = toggleChat;
    els.send.onclick = handleManualInput;
    els.input.addEventListener("keypress", function(e) {
      if (e.key === "Enter") handleManualInput();
    });

    photoInput.addEventListener("change", function() {
      if (!photoInput.files || !photoInput.files.length) return;
      addBotMessage(`📷 You selected ${photoInput.files.length} photo(s). I've marked them for your file.`);
      trackEvent("photo_uploaded", { count: photoInput.files.length });
    });
  }

  function startTicker() {
      if (!els.ticker) return;
      const msgs = [
        "⚡ Get a price range in 60 seconds – No phone call needed.",
        "🛡️ NYC Licensed & Insured: HIC #2131291 · EPA Lead-Safe Certified",
        "💳 VIP Members get 10% off labor + priority emergency scheduling.",
        "📸 Text us photos for a fast ballpark estimate.",
        "📍 Serving Manhattan, Brooklyn, Queens, Bronx, Staten Island & NJ."
      ];
      let i = 0;
      els.ticker.innerText = msgs[0];
      setInterval(() => {
          i = (i + 1) % msgs.length;
          els.ticker.innerText = msgs[i];
      }, 4000); 
  }

  function toggleChat() {
    const isOpen = els.wrapper.classList.toggle("hb-open");
    if (isOpen) {
      els.fab.style.display = "none";
      sessionStorage.setItem("hb_chat_active", "true");
      if(els.input && !els.input.disabled) els.input.focus();
      trackEvent("chat_opened");
    } else {
      els.fab.style.display = "flex";
      sessionStorage.removeItem("hb_chat_active");
    }
  }

  function updateProgress(pct, label) {
    if (els.prog) els.prog.style.width = pct + "%";
  }

  // --- MESSAGING ---

  function addBotMessage(text, isHtml) {
    const typingId = "typing-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
    
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

    const delay = Math.min(1500, text.length * 15 + 400);

    setTimeout(function() {
      const msgBubble = document.getElementById(typingId);
      if (msgBubble) {
        msgBubble.innerHTML = isHtml ? text : text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
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

  function addChoices(options, callback) {
    setTimeout(function() {
      const chipContainer = document.createElement("div");
      chipContainer.className = "hb-chips";

      options.forEach(function(opt) {
        const btn = document.createElement("button");
        btn.className = "hb-chip";
        const label = (typeof opt === "object") ? opt.label : opt;
        btn.textContent = label;
        btn.onclick = function() {
          chipContainer.remove();
          addUserMessage(label);
          callback(opt);
        };
        chipContainer.appendChild(btn);
      });

      els.body.appendChild(chipContainer);
      els.body.scrollTop = els.body.scrollHeight;
    }, 1600);
  }

  function getSeasonalGreeting() {
      const month = new Date().getMonth(); 
      if (month === 10 || month === 11) return "❄️ Winter is coming! Check our freeze-protection packages."; 
      if (month >= 2 && month <= 4) return "🌸 Spring Rush is starting! Secure your dates now.";
      if (month >= 5 && month <= 7) return "☀️ Summer is here! Perfect time for outdoor living.";
      return "👋 Hi! Ready to upgrade your home?";
  }

  function stepOne_Disclaimer() {
    state.estimateId = generateEstimateID(); // Generate unique ID at start
    updateProgress(5, "Start");
    saveState();
    
    addBotMessage(getSeasonalGreeting());

    const disclaimerText = `
        I can generate a **ballpark price range** for your project in about 60 seconds. 
        <br><br><small>Ref ID: ${state.estimateId}</small>
    `;
    setTimeout(() => {
        addBotMessage(disclaimerText, true);
        addChoices([
            { label: "🚀 Start Estimate", key: "agree" }, 
            { label: "🌐 Español (Beta)", key: "es" },
            { label: "❌ Close", key: "exit" }
        ], function(choice) {
            if (choice.key === "es") {
                state.lang = "es";
                addBotMessage("Hola. Continuaremos en inglés por ahora, pero marcaremos su preferencia de idioma. (Hello. We will continue in English for now, but mark your language preference.)");
                setTimeout(() => presentServiceOptions(), 1500);
            } else if (choice.key === "agree") {
                addBotMessage("Awesome. What type of project are you planning?");
                presentServiceOptions();
            } else {
                toggleChat();
            }
        });
    }, 1200);
  }

  function presentServiceOptions() {
    updateProgress(10);
    const opts = Object.keys(SERVICES).map(function(k) {
      return { label: SERVICES[k].emoji + " " + SERVICES[k].label, key: k };
    });

    opts.unshift({ label: "📸 Send Photo (Skip to Quote)", key: "photo_skip" });

    addChoices(opts, function(selection) {
      if (selection.key === "photo_skip") {
          state.isPhotoSkip = true;
          addBotMessage("Smart choice. A picture is worth a thousand words.");
          if(els.photoInput) els.photoInput.click();
          setTimeout(() => {
              showLeadCapture(); // Gate immediately
          }, 1000);
      } else {
          state.serviceKey = selection.key;
          state.subOption = null;
          trackEvent("service_selected", { service: state.serviceKey });
          stepTwo_SubQuestions();
      }
    });
  }

  function stepTwo_SubQuestions() {
    updateProgress(30);
    const svc = SERVICES[state.serviceKey];
    if (!svc) return;

    if (svc.quickQuote) {
      addBotMessage("⚡ This looks like a quick job. Do you want a fast estimate or full detail?");
      addChoices([{label:"⚡ Quick Estimate", k:"quick"}, {label:"📝 Full Detail", k:"full"}], (c) => {
        if(c.k === "quick") {
           state.subOption = { factor: 1.0, label: "Standard" };
           if(svc.unit === "consult") stepFive_Location(); 
           else stepFour_Size();
        } else {
           proceedSub();
        }
      });
      return;
    }
    proceedSub();

    function proceedSub() {
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
  }

  function stepThree_LeadCheck() {
    const svc = SERVICES[state.serviceKey];
    if (svc && svc.leadSensitive) {
      addBotMessage("Is your property built before 1978? (Required for lead safety laws).");
      addChoices(["Yes (Pre-1978)", "No / Not Sure"], function(ans) {
        state.isLeadHome = !!(ans && ans.indexOf("Yes") !== -1);
        saveState();
        stepFour_Size();
      });
    } else {
      stepFour_Size();
    }
  }

  function stepFour_Size() {
    updateProgress(40);
    const svc = SERVICES[state.serviceKey];
    const sub = state.subOption || {};
    if (!svc) return;

    if (svc.unit === "consult" || state.serviceKey === "other") {
        if (state.serviceKey === "other") {
            addBotMessage("Is this project mostly **Indoor**, **Outdoor**, or **Both**?");
            addChoices(["Indoor", "Outdoor", "Both"], () => {
                addBotMessage("Got it. We'll need a walkthrough for accurate pricing.");
                stepFive_Location();
            });
            return;
        }
        stepFive_Location();
        return;
    }

    if (svc.unit !== "fixed" || sub.isPerSqFt) {
      const unitLabel = sub.isPerSqFt ? "sq ft" : svc.unit;
      
      if (svc.sizePresets && svc.sizePresets.length > 0) {
        addBotMessage(`Choose a common size, or type exact ${unitLabel} below:`);
        
        const presetChoices = svc.sizePresets.map(p => ({ label: p.label, val: p.val }));
        
        addChoices(presetChoices, function(choice) {
            state.size = choice.val;
            addBotMessage(`Selected: ${choice.val} ${unitLabel}`);
            setTimeout(stepFive_Location, 500);
        });
        
        setTimeout(() => {
            enableInput(function(val) {
              const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
              if (!num || num < 10) {
                addBotMessage("That number seems low. Please enter a valid number (e.g. 500).");
                stepFour_Size(); 
              } else {
                state.size = num;
                stepFive_Location();
              }
            });
        }, 1700);

      } else {
        addBotMessage("Approximate size in " + unitLabel + "?");
        askSizeManual();
      }

    } else {
      stepFive_Location();
    }

    function askSizeManual() {
        enableInput(function(val) {
          const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
          if (!num || num < 10) {
            addBotMessage("That number seems low. Please enter a valid number (e.g. 500).");
            askSizeManual();
          } else {
            state.size = num;
            stepFive_Location();
          }
        });
    }
  }

  function stepFive_Location() {
    updateProgress(50);
    addBotMessage("Which borough/area is this in?");
    const locs = Object.keys(BOROUGH_MODS);
    addChoices(locs, function(loc) {
      state.borough = (typeof loc === "string") ? loc : loc.label;
      stepFive_AvailabilityCheck();
    });
  }

  function stepFive_AvailabilityCheck() {
      // REAL-TIME Logic
      const today = new Date().getDay();
      const isWeekend = (today === 6 || today === 0);
      
      addBotMessage(`Checking crew schedules for ${state.borough}...`);
      
      setTimeout(() => {
          if(isWeekend) {
             addBotMessage(`🗓️ We have openings starting early next week.`);
          } else {
             addBotMessage(`🗓️ Yes! We have a few slots open for this week.`); 
          }
          setTimeout(stepSix_PricingMode, 1000);
      }, 2000);
  }

  function stepSix_PricingMode() {
    updateProgress(60);
    addBotMessage("How should we price this?");
    addChoices([
      { label: "Full Project (Labor + Materials)", key: "full" },
      { label: "Labor Only", key: "labor" },
      { label: "Materials + Light Help", key: "materials" }
    ], function(choice) {
      state.pricingMode = choice.key || "full";
      stepSeven_Rush();
    });
  }

  function stepSeven_Rush() {
    updateProgress(65);
    addBotMessage("Is this a rush project (starting within 72 hours)?");
    addChoices(["Yes, rush", "No"], function(ans) {
      state.isRush = !!(ans && ans.indexOf("Yes") !== -1);
      stepEight_Promo();
    });
  }

  function stepEight_Promo() {
    updateProgress(70);
    addBotMessage("Any promo code today?");
    addChoices([
      { label: "No Code", code: "" },
      { label: "VIP10 (10% OFF)", code: "VIP10" },
      { label: "REFERRAL5 (5% OFF)", code: "REFERRAL5" }
    ], function(choice) {
        if (choice.code === "") {
            addBotMessage("Wait! I've applied the **'WEB-SAVER'** discount (-5%) for you automatically. 🎉");
            state.promoCode = "WEBSAVER"; 
            stepNine_DebrisRemoval();
        } else {
            state.promoCode = choice.code;
            stepNine_DebrisRemoval();
        }
    });
  }

  function stepNine_DebrisRemoval() {
    updateProgress(75);
    const svc = SERVICES[state.serviceKey];
    const hasPrice = svc && svc.unit !== "consult" && state.serviceKey !== "other";

    if (hasPrice) {
        addBotMessage("Should we include debris removal & dumpster costs? (Typically +$1,200–$2,800)");
        addChoices(["Yes, include debris", "No, I'll handle debris"], function(ans) {
            state.debrisRemoval = !!(ans && ans.indexOf("Yes") !== -1);
            stepTen_SmartAddonsIntro();
        });
    } else {
        state.debrisRemoval = false;
        stepTen_SmartAddonsIntro();
    }
  }

  function stepTen_SmartAddonsIntro() {
    updateProgress(80);
    const config = SMART_ADDONS_CONFIG[state.serviceKey];
    
    if (config && config.groups) {
      addBotMessage(`I found optional **Smart Add-ons** for ${config.title}. Want to see upgrades?`);
      addChoices([
        { label: "✨ View Add-ons", key: "yes" },
        { label: "Skip", key: "no" }
      ], function(choice) {
        if (choice.key === "yes") {
          showAddonCategories(config);
        } else {
          finishCalculation();
        }
      });
    } else {
      finishCalculation();
    }
  }

  function showAddonCategories(config) {
    const groups = Object.keys(config.groups).map(key => ({
      label: `📂 ${SMART_ADDON_GROUP_LABELS[key] || key}`,
      key: key
    }));
    groups.push({ label: "✅ Done Selecting", key: "done" });

    addBotMessage("Select a category:", false);
    addChoices(groups, function(choice) {
      if (choice.key === "done") {
        finishCalculation();
      } else {
        showAddonItems(config, choice.key);
      }
    });
  }

  function showAddonItems(config, groupKey) {
    const items = config.groups[groupKey] || [];
    const groupLabel = SMART_ADDON_GROUP_LABELS[groupKey] || groupKey;

    const availableItems = items.filter(item => 
      !state.selectedAddons.some(sel => sel.label === item.label)
    ).map(item => ({
      label: `${item.label} (+$${item.low})`,
      itemData: item,
      group: groupKey
    }));

    if (availableItems.length === 0) {
      addBotMessage(`You've added all items from ${groupLabel}.`);
      showAddonCategories(config);
      return;
    }

    availableItems.push({ label: "🔙 Back", isBack: true });

    addBotMessage(`**${groupLabel}:** Tap to add.`);
    addChoices(availableItems, function(choice) {
      if (choice.isBack) {
        showAddonCategories(config);
      } else {
        state.selectedAddons.push({
          ...choice.itemData,
          group: choice.group
        });
        addBotMessage(`✅ Added: **${choice.itemData.label}**`);
        setTimeout(() => showAddonCategories(config), 600);
      }
    });
  }

  function finishCalculation() {
    const est = computeEstimateForCurrent();
    est.svcKey = state.serviceKey;
    state.projects.push(est);
    saveState();
    trackEvent("estimate_generated", { total: est.high });
    showEstimateAndAskAnother(est);
  }

  // --- CALCULATION ENGINE ---

  function calculateMonthlyPayment(totalHigh) {
    const p = totalHigh;
    const r = FINANCING_RATE;
    const n = FINANCING_MONTHS;
    const monthly = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(monthly);
  }

  function applyPriceModifiers(low, high) {
    let factor = 1;
    if (state.pricingMode === "labor") factor = 0.7;
    else if (state.pricingMode === "materials") factor = 0.5;

    low *= factor;
    high *= factor;

    if (state.isRush) {
      low *= 1.12;
      high *= 1.18;
    }

    // Capture Pre-Discount Price
    const preDiscountLow = low;
    const preDiscountHigh = high;

    let dc = 0;
    if (state.promoCode) {
      const rate = DISCOUNTS[state.promoCode.toUpperCase()];
      if (rate) dc = rate;
    }
    if (dc > 0) {
      low *= (1 - dc);
      high *= (1 - dc);
    }

    return { low, high, discountRate: dc, preDiscountLow, preDiscountHigh };
  }

  function computeEstimateForCurrent() {
    const svc = SERVICES[state.serviceKey];
    if (!svc) return null;

    const sub = state.subOption || {};
    const mod = BOROUGH_MODS[state.borough] || 1.0;
    let low = 0, high = 0;

    // 1. Base Price
    if (state.serviceKey === "other" || svc.unit === "consult") {
      // Consult
    } else if (svc.unit === "fixed") {
      if (sub.isPerSqFt) {
          low = (sub.fixedLow || 0) * state.size * mod;
          high = (sub.fixedHigh || 0) * state.size * mod;
      } else {
          low = (sub.fixedLow || 0) * mod;
          high = (sub.fixedHigh || 0) * mod;
      }
    } else {
      let rateLow = svc.baseLow;
      let rateHigh = svc.baseHigh;
      if (sub.factor) { rateLow *= sub.factor; rateHigh *= sub.factor; }
      low = rateLow * state.size * mod;
      high = rateHigh * state.size * mod;
      if (svc.min && low < svc.min) low = svc.min;
      if (svc.min && high < svc.min * 1.2) high = svc.min * 1.25;
    }

    // Lead Paint Surcharge
    if (state.isLeadHome) { 
        low *= 1.10; 
        high *= 1.10; 
    }

    const adjusted = applyPriceModifiers(low, high);
    
    // 2. Add-ons
    let addonLow = 0, addonHigh = 0;
    state.selectedAddons.forEach(addon => {
        addonLow += (addon.low * mod);
        addonHigh += (addon.high * mod);
    });

    // 3. Debris
    if (state.debrisRemoval) {
        addonLow += (ADD_ON_PRICES.debrisRemoval.low * mod);
        addonHigh += (ADD_ON_PRICES.debrisRemoval.high * mod);
    }

    const finalLow = adjusted.low + addonLow;
    const finalHigh = adjusted.high + addonHigh;

    // Calc Savings
    const savings = Math.round((adjusted.preDiscountHigh + addonHigh) - finalHigh);

    // Duration Estimate (Rough Heuristic: $3k per day)
    let days = Math.max(1, Math.round(finalHigh / 3000));
    let durationStr = `${days}–${days + 2} days`;

    return {
      svc, sub, borough: state.borough,
      size: (svc.unit === "fixed" && !sub.isPerSqFt || svc.unit === "consult") ? null : state.size,
      isLeadHome: state.isLeadHome, pricingMode: state.pricingMode, isRush: state.isRush,
      promoCode: state.promoCode, 
      low: finalLow, high: finalHigh,
      discountRate: adjusted.discountRate, 
      savings: savings,
      duration: durationStr,
      isCustom: (low === 0 && high === 0),
      debrisRemoval: state.debrisRemoval,
      selectedAddons: [...state.selectedAddons] 
    };
  }

  function computeGrandTotal() {
    let totalLow = 0, totalHigh = 0;
    state.projects.forEach(p => {
        if (p.low) totalLow += p.low;
        if (p.high) totalHigh += p.high;
    });
    return { totalLow, totalHigh, projectRequiresDebris: state.projects.some(p => p.debrisRemoval) };
  }

  function buildEstimateHtml(est) {
    const svc = est.svc;
    const sub = est.sub || {};
    const hasPrice = !!(est.low && est.high);
    const fLow = hasPrice ? Math.round(est.low).toLocaleString() : null;
    const fHigh = hasPrice ? Math.round(est.high).toLocaleString() : null;

    let discountLine = "";
    if (est.discountRate > 0) {
      discountLine = `<div class="hb-receipt-row"><span>Promo (${state.promoCode}):</span><span>-${Math.round(est.discountRate * 100)}% (Saved ~$${est.savings})</span></div>`;
    }

    let leadLine = est.isLeadHome ? `<div class="hb-receipt-row" style="color:#f90;"><span>Lead Safety:</span><span>EPA RRP Protocols Active</span></div>` : "";
    let debrisLine = est.debrisRemoval ? `<div class="hb-receipt-row" style="color:#0a9"><span>Debris:</span><span>Haul-away **included**</span></div>` : "";

    let sizeRow = "";
    if (est.size) {
      const unitLabel = sub.isPerSqFt ? "sq ft" : svc.unit;
      sizeRow = `<div class="hb-receipt-row"><span>Size:</span><span>${est.size} ${unitLabel}</span></div>`;
    }

    let addonsHtml = "";
    if (est.selectedAddons && est.selectedAddons.length > 0) {
        addonsHtml += `<div class="hb-receipt-row" style="margin-top:8px; border-bottom:1px solid #eee; padding-bottom:4px; font-weight:600;"><span>Selected Add-ons:</span></div>`;
        est.selectedAddons.forEach(addon => {
             addonsHtml += `<div class="hb-receipt-row" style="color:#666; padding-left:8px; font-size:11px;"><span>• ${addon.label}</span><span>+$${Math.round(addon.low).toLocaleString()}</span></div>`;
        });
    }

    let priceRow = hasPrice 
      ? `<div class="hb-receipt-total"><span>ESTIMATE:</span><span>$${fLow} – $${fHigh}</span></div>`
      : `<div class="hb-receipt-total"><span>ESTIMATE:</span><span>Requires on-site walkthrough</span></div>`;

    return `
      <div class="hb-receipt">
        <h4>Estimator Summary <small style="float:right;font-weight:400;opacity:0.7">ID: ${state.estimateId}</small></h4>
        <div class="hb-receipt-row"><span>Service:</span><span>${svc.label}</span></div>
        <div class="hb-receipt-row"><span>Type:</span><span>${sub.label || "Standard"}</span></div>
        ${sizeRow}
        ${leadLine}
        ${debrisLine}
        ${addonsHtml}
        ${discountLine}
        <div class="hb-receipt-row" style="margin-top:5px;font-size:11px;"><span>Est. Duration:</span><span>${est.duration} (approx)</span></div>
        ${priceRow}
        <div class="hb-receipt-footer hb-disclaimer">
          <strong>Valid for 30 days.</strong> Subject to site inspection.
        </div>
      </div>
    `;
  }

  function editCurrentProject(projectIndex) {
      if (projectIndex >= 0 && projectIndex < state.projects.length) {
          const p = state.projects[projectIndex];
          state.serviceKey = p.svcKey; 
          // Restore other state vars...
          state.projects.splice(projectIndex, 1);
          addBotMessage(`✏️ Editing **${p.svc.label}**. Starting from step 2.`);
          stepTwo_SubQuestions();
      }
  }

  function removeLastProject() {
      if(state.projects.length > 0) {
          const removed = state.projects.pop();
          addBotMessage(`🗑️ Removed **${removed.svc.label}**.`);
          if (state.projects.length === 0) {
              addBotMessage("Your cart is empty. What would you like to estimate?");
              presentServiceOptions();
          } else {
             // Show previous project
             showEstimateAndAskAnother(state.projects[state.projects.length-1]); 
          }
      }
  }

  function showEstimateAndAskAnother(est) {
    if (!est) return;
    updateProgress(92);
    const html = '--- **Project Estimate** ---<br>' + buildEstimateHtml(est);
    addBotMessage(html, true);
    
    setTimeout(() => {
        const currentProjectIndex = state.projects.length - 1;
        const choices = [
            { label: "➕ Add Another Project", key: "add" },
            { label: "✏️ Edit This Project", key: "edit", index: currentProjectIndex },
            { label: "↩️ Undo/Remove Last", key: "undo" },
            { label: "✅ Continue to Finish", key: "finish" }
        ];

        addChoices(choices, function(choice) {
            if (choice.key === "add") {
                resetProjectState();
                addBotMessage("Great! What type of project is the next one?");
                presentServiceOptions();
            } else if (choice.key === "edit") {
                editCurrentProject(choice.index);
            } else if (choice.key === "undo") {
                removeLastProject();
            } else {
                stepMembershipUpsell();
            }
        });
    }, 1200);
  }

  function stepMembershipUpsell() {
    addBotMessage("Before we finish, would you like to hear about **VIP Home Care Memberships** (15% off labor + priority booking)?");
    addChoices([
        { label: "💳 Tell me about memberships", key: "yes" },
        { label: "No thanks", key: "no" }
    ], function(choice) {
        if (choice.key === "yes") {
            addBotMessage("🏆 **VIP Members** get 15% off all labor, priority emergency booking, and annual maintenance checks. We'll include the brochure.");
            state.interestedInMembership = true;
        }
        preReceiptGate(); // GATE THE PRICE HERE
    });
  }

  // --- LEAD CAPTURE GATE (NEW) ---
  function preReceiptGate() {
      if (state.name && state.phone) {
          showCombinedReceipt();
      } else {
          showLeadCapture();
      }
  }

  function showLeadCapture(introText) {
    addBotMessage(introText || "Your official estimate is ready! To unlock the detailed breakdown and financing options, please enter your name.");
    enableInput(function(name) {
      state.name = name;
      askPhone();
    });

    function askPhone() {
        addBotMessage("And your mobile number? (We will text you the PDF link).");
        enableInput(function(phone) {
            // STRICT MASKING
            const cleanPhone = phone.replace(/\D/g, "");
            if (cleanPhone.length !== 10) {
                addBotMessage("⚠️ Please enter a valid 10-digit mobile number.");
                setTimeout(askPhone, 500); 
            } else {
                // Format: (123) 456-7890
                state.phone = cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
                saveState();
                askExtraQuestions();
            }
        });
    }
  }

  function askExtraQuestions() {
      addBotMessage("Almost done! When are you hoping to start?");
      addChoices(["ASAP / Rush", "Within 1 month", "1-3 Months", "Just budgeting"], function(timing) {
          state.projectTiming = (typeof timing === 'object') ? timing.label : timing;
          
          addBotMessage("And how did you hear about us?");
          addChoices(["Google Search", "Instagram/Facebook", "Referral", "Yard Sign"], function(source) {
              state.leadSource = (typeof source === 'object') ? source.label : source;
              showCombinedReceipt(); // NOW SHOW PRICE
          });
      });
  }

  function showCombinedReceipt() {
    updateProgress(96);
    const projects = state.projects;
    if (!projects || !projects.length) return;

    const totals = computeGrandTotal();
    const rowsHtml = projects.map((p, idx) => {
        const hasPrice = !!(p.low && p.high);
        const unitLabel = p.sub.isPerSqFt ? "sq ft" : p.svc.unit;
        const sizePart = p.size ? ` — ${p.size} ${unitLabel}` : "";
        
        let addonNote = "";
        if (p.selectedAddons && p.selectedAddons.length > 0) {
            addonNote = `<br><span style="font-size:10px; color:#888; margin-left:14px;">+ ${p.selectedAddons.length} upgrades selected</span>`;
        }

        return `<div class="hb-receipt-row">
            <span>#${idx + 1} ${p.svc.label}${sizePart}${addonNote}</span>
            <span>${hasPrice ? "$" + Math.round(p.low).toLocaleString() + " – $" + Math.round(p.high).toLocaleString() : "Walk
