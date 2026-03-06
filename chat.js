/* ============================================================
   HAMMER BRICK & HOME — ESTIMATOR BOT v17.10 (CORS FIX)
   - FEATURES: Smart Brain, Full Service List, Viral Loop, Value Stacking.
   - UPDATED: Added 'no-cors' mode to force data to Google Sheets.
   - STATUS: 100% Complete.
=============================================================== */

(function() {
  // --- CONFIGURATION -----------------------------------------

  // ✅ UPDATED: Your specific working Google Web App URL
  const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycby5B6HHpX5u4WzWOBaYXpqKcGOvszmdVezPXIijEgCeysA130AzqcJgAPNFrr1a5zh4/exec?source=chatbot"; 
  
  const PHONE_NUMBER = "9295955300"; 
  const CRM_FORM_URL = ""; 
  const WALKTHROUGH_URL = "";

  const BOROUGH_MODS = {
    "Manhattan": 1.18, "Brooklyn": 1.08, "Queens": 1.05,
    "Bronx": 1.03, "Staten Island": 1.0, "New Jersey": 0.96
  };

  const DISCOUNTS = { "VIP10": 0.10, "REFERRAL5": 0.05, "WEBSAVER": 0.05 };
  
  const ADD_ON_PRICES = { "debrisRemoval": { low: 1200, high: 2800 } }; 

  // --- 🧠 SMART BRAIN: KEYWORD MAPPING ---
  const KEYWORD_MAPPING = {
      "masonry": ["masonry", "brick", "stone", "paver", "concrete", "stoop", "cement", "block", "pointing", "sidewalk"],
      "driveway": ["driveway", "asphalt", "parking", "blacktop", "drive", "pave"],
      "roofing": ["roof", "shingle", "leak", "flat roof", "rubber", "flashing"],
      "siding": ["siding", "vinyl", "cedar", "shake", "cladding", "exterior wall"],
      "windows": ["window", "glass", "pane", "glazing"],
      "deck": ["deck", "porch", "trex", "composite", "wood floor", "outdoor floor"],
      "fence": ["fence", "fencing", "gate", "pvc", "chain"],
      "waterproofing": ["water", "leak", "basement leak", "french drain", "sump", "wet"],
      "powerwash": ["wash", "clean", "scrub", "pressure"],
      "painting": ["paint", "interior", "wall color", "painting"],
      "exterior_paint": ["exterior paint", "facade", "house paint"],
      "flooring": ["floor", "hardwood", "laminate", "tile", "carpet"],
      "kitchen": ["kitchen", "cabinet", "counter", "island", "cooking"],
      "bathroom": ["bath", "shower", "toilet", "tub", "vanity", "restroom"],
      "handyman": ["repair", "fix", "small job", "handyman", "broken"],
      "gutter": ["gutter", "leader", "downspout"]
  };

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
      },
      leadSensitive: true // Ensure leadSensitive is true for interior painting if needed
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
      },
      leadSensitive: true
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
      },
      leadSensitive: true
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
    }
  };

  // --- FULL SERVICE DEFINITIONS (RESTORED) ---
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
    // OUTDOOR LIVING
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
    "other": {
      label: "Other / Custom", emoji: "📋", unit: "consult"
    }
  };

  // --- STATE --------------------------------------------------
  const state = {
    step: 0,
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
    email: "", 
    phone: "",
    projectTiming: "",
    leadSource: "",
    projects: [],
    isPhotoSkip: false 
  };

  let els = {};
  let tickerInterval; 

  // --- INIT ---------------------------------------------------

  function init() {
    console.log("HB Chat: Initializing v17.10 Smart...");
    injectCustomStyles();
    createInterface();
    startTicker();
    
    // -- RESTORE SESSION IF EXISTS --
    loadState();

    if (!sessionStorage.getItem("hb_has_opened_automatically")) {
        setTimeout(function() {
            if (!els.wrapper.classList.contains("hb-open")) {
                toggleChat();
                sessionStorage.setItem("hb_has_opened_automatically", "true");
            }
        }, 4000); 
    }

    if(state.projects.length > 0) {
        addBotMessage(`👋 Welcome back, ${state.name || "Customer"}. I remember your previous details.`);
        showCombinedReceiptAndLeadCapture();
    } else {
        setTimeout(stepOne_Disclaimer, 800);
    }
  }

  function injectCustomStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      .hb-chat-wrapper { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important; border-radius: 12px; overflow: hidden; }
      .hb-chat-header { background: #111 !important; color: #e7bf63 !important; }
      .hb-msg-bot { background: #f0f0f0; color: #333; border-left: 3px solid #e7bf63; position: relative; }
      .hb-msg-user { background: #1c263b; color: #fff; }
      .hb-chip { background: #fff; border: 1px solid #e7bf63; color: #333; transition: all 0.2s; cursor: pointer; }
      .hb-chip:hover { background: #e7bf63; color: #000; }
      .hb-chip:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(100%); }
      .hb-primary-btn { background: #e7bf63 !important; color: #000 !important; font-weight: bold; }
      .hb-timestamp { font-size: 9px; opacity: 0.6; display: block; margin-top: 4px; text-align: right; }
      .hb-refresh-btn { background: none; border: none; color: #e7bf63; font-size: 18px; cursor: pointer; padding: 0 10px; }
      .hb-footer-license { font-size: 9px; color: #666; text-align: center; padding: 5px; background: #f9f9f9; border-top: 1px solid #eee; }
      /* Mobile Safe Area Fix */
      .hb-chat-footer { padding-bottom: env(safe-area-inset-bottom, 10px); }
      .hb-photo-thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; margin: 4px; border: 1px solid #ddd; }
      @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    `;
    document.head.appendChild(style);
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
          <span style="color:#e7bf63; font-size:11px; letter-spacing:0.5px;">NYC Licensed #2131291</span>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
            <button class="hb-refresh-btn" title="Restart Chat" id="hb-refresh" aria-label="Restart Chat">↻</button>
            <a href="tel:${PHONE_NUMBER}" style="text-decoration:none; color:#fff; font-size:18px;" aria-label="Call Now">📞</a>
            <button class="hb-chat-close" style="font-size:24px;" aria-label="Close Chat">×</button>
        </div>
      </div>
      <div id="hb-ticker" style="background:#1c263b; color:#888; font-size:10px; padding:6px 16px; border-bottom:1px solid rgba(255,255,255,0.05); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" aria-live="off">
        Initializing...
      </div>
      <div class="hb-progress-container">
        <div class="hb-progress-bar" id="hb-prog"></div>
      </div>
      <div class="hb-chat-body" id="hb-body" role="log" aria-live="polite"></div>
      <div class="hb-chat-footer">
        <input type="text" class="hb-chat-input" id="hb-input" placeholder="Select an option..." disabled aria-label="Chat Input">
        <button class="hb-chat-send" id="hb-send" aria-label="Send Message">➤</button>
      </div>
      <div class="hb-footer-license">NYC Licensed Contractor: HIC #2131291 · Insured</div>
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
      refresh: document.getElementById("hb-refresh"),
      photoInput
    };

    els.close.onclick = toggleChat;
    els.refresh.onclick = function() {
       if(confirm("Restart the estimate? (This clears current progress)")) {
           sessionStorage.removeItem("hb_estimator_state");
           location.reload();
       }
    };
    els.send.onclick = handleManualInput;
    els.input.addEventListener("keypress", function(e) {
      if (e.key === "Enter") handleManualInput();
    });

    photoInput.addEventListener("change", function() {
      if (!photoInput.files || !photoInput.files.length) return;
      // Image Preview Logic
      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.flexWrap = "wrap";
      
      Array.from(photoInput.files).forEach(file => {
          const img = document.createElement("img");
          img.src = URL.createObjectURL(file);
          img.className = "hb-photo-thumb";
          container.appendChild(img);
      });
      
      const msgDiv = document.createElement("div");
      msgDiv.className = "hb-msg hb-msg-user";
      msgDiv.appendChild(container);
      msgDiv.innerHTML += `<div style="font-size:11px; margin-top:4px;">Attached ${photoInput.files.length} photo(s)</div>`;
      els.body.appendChild(msgDiv);
      scrollToBottom();
      
      addBotMessage(`📷 Photos received! I'll attach these to your file.`);
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
    } else {
      els.fab.style.display = "flex";
      sessionStorage.removeItem("hb_chat_active");
    }
  }

  function updateProgress(pct, label) {
    if (els.prog) els.prog.style.width = pct + "%";
  }

  function saveState() {
      const safeState = {
          projects: state.projects,
          name: state.name,
          email: state.email,
          phone: state.phone,
          promoCode: state.promoCode
      };
      sessionStorage.setItem("hb_estimator_state", JSON.stringify(safeState));
  }

  function loadState() {
      const stored = sessionStorage.getItem("hb_estimator_state");
      if (stored) {
          try {
              const d = JSON.parse(stored);
              if (d.name) state.name = d.name;
              if (d.email) state.email = d.email;
              if (d.phone) state.phone = d.phone;
              if (d.projects) state.projects = d.projects;
              if (d.promoCode) state.promoCode = d.promoCode;
          } catch(e) { console.error("Load state fail", e); }
      }
  }

  function scrollToBottom() {
      requestAnimationFrame(() => {
          els.body.scrollTop = els.body.scrollHeight;
      });
  }

  // --- MESSAGING ---

  function getTimeStr() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

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
    scrollToBottom();

    const delay = Math.min(1500, text.length * 20 + 500);

    setTimeout(function() {
      const msgBubble = document.getElementById(typingId);
      if (msgBubble) {
        let content = isHtml ? text : text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        content += `<span class="hb-timestamp">${getTimeStr()}</span>`;
        msgBubble.innerHTML = content;
        scrollToBottom();
      }
    }, delay);
  }

  function addUserMessage(text) {
    const div = document.createElement("div");
    div.className = "hb-msg hb-msg-user";
    div.innerHTML = text + `<span class="hb-timestamp" style="color:#ccc">${getTimeStr()}</span>`;
    els.body.appendChild(div);
    scrollToBottom();
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
        // Anti-Duplicate Click Logic
        btn.onclick = function() {
          const allChips = chipContainer.querySelectorAll(".hb-chip");
          allChips.forEach(c => c.disabled = true); 
          chipContainer.remove(); 
          addUserMessage(label);
          callback(opt);
        };
        chipContainer.appendChild(btn);
      });

      els.body.appendChild(chipContainer);
      scrollToBottom();
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
    updateProgress(5, "Step 1 of 8: Start");
    state.step = 1; // Mark step 1
    
    addBotMessage(getSeasonalGreeting());

    // UPDATED DISCLAIMER (FRIENDLY & COMPETITIVE PITCH)
    const disclaimerText = `
        📝 **Just so you know:** This tool calculates **generic NYC/NJ market estimates** based on standard industry data.
        
        🚀 **Good News:** Hammer Brick & Home is often able to offer **more competitive pricing** than these averages! 
        
        (This is a ballpark range, not a final quote until a walkthrough.)
    `;
    
    setTimeout(() => {
        addBotMessage(disclaimerText, true);
        addChoices([
            { label: "✅ I Understand – Start Estimate", key: "agree" }, 
            { label: "❌ Close", key: "exit" }
        ], function(choice) {
            if (choice.key === "agree") {
                addBotMessage("Awesome. What type of project are you planning?");
                presentServiceOptions();
            } else {
                toggleChat();
            }
        });
    }, 1200);
  }

  // --- SMART INTENT DETECTION ---

  function detectIntent(text) {
      const lower = text.toLowerCase();
      let bestMatch = null;

      // Check keywords
      for (const [key, keywords] of Object.entries(KEYWORD_MAPPING)) {
          if (keywords.some(k => lower.includes(k))) {
              bestMatch = key;
              break; 
          }
      }
      return bestMatch;
  }

  function presentServiceOptions() {
    updateProgress(10, "Step 2 of 8: Service Selection");
    state.step = 2; // Mark that we are in selection mode
    
    // Enable input so user can type!
    enableInput(function(val) {
        handleServiceInput(val);
    });

    const opts = Object.keys(SERVICES).map(function(k) {
      return { label: SERVICES[k].emoji + " " + SERVICES[k].label, key: k };
    });

    opts.unshift({ label: "📸 Send Photo (Skip to Quote)", key: "photo_skip" });

    // Inform user they can type
    addBotMessage("👇 Select an option below OR **type what you need** (e.g., 'Bathroom remodel').", true);

    addChoices(opts, function(selection) {
      if (selection.key === "photo_skip") {
          state.isPhotoSkip = true;
          addBotMessage("Smart choice. A picture is worth a thousand words.");
          if(els.photoInput) els.photoInput.click();
          setTimeout(() => {
              showLeadCapture("After you attach your photo, I'll grab your contact info so we can text you the analysis.");
          }, 1000);
      } else {
          state.serviceKey = selection.key;
          state.subOption = null;
          stepTwo_SubQuestions();
      }
    });
  }

  function handleServiceInput(text) {
      // 1. Detect Intent
      const match = detectIntent(text);

      if (match && SERVICES[match]) {
          state.serviceKey = match;
          state.subOption = null;
          
          // Clear any existing chips to avoid confusion
          const chips = els.body.querySelector(".hb-chips");
          if(chips) chips.remove();

          addBotMessage(`💡 I see you're interested in **${SERVICES[match].label}**. Let's get started on that.`);
          setTimeout(stepTwo_SubQuestions, 800);
      } else {
          addBotMessage("🤔 I'm not 100% sure which category that fits. Please select the closest option from the buttons below.");
          // Re-present options
          const opts = Object.keys(SERVICES).map(k => ({ label: SERVICES[k].emoji + " " + SERVICES[k].label, key: k }));
          addChoices(opts, function(selection) {
              state.serviceKey = selection.key;
              state.subOption = null;
              stepTwo_SubQuestions();
          });
      }
  }

  function stepTwo_SubQuestions() {
    updateProgress(30, "Step 3 of 8: Project Details");
    state.step = 3; 

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
        stepFour_Size();
      });
    } else {
      stepFour_Size();
    }
  }

  function stepFour_Size() {
    updateProgress(40, "Step 4 of 8: Size Estimate");
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
    updateProgress(50, "Step 5 of 8: Location");
    addBotMessage("Which borough/area is this in?");
    const locs = Object.keys(BOROUGH_MODS);
    addChoices(locs, function(loc) {
      state.borough = (typeof loc === "string") ? loc : loc.label;
      stepFive_AvailabilityCheck();
    });
  }

  function stepFive_AvailabilityCheck() {
      // 🧠 UPDATED: HONEST + POSITIVE (No fake scarcity)
      addBotMessage(`Checking our schedule for ${state.borough}...`);
      setTimeout(() => {
          addBotMessage(`✅ Good news! We have estimate slots open in **${state.borough}** for this type of project.`);
          setTimeout(stepSix_PricingMode, 1500);
      }, 1500);
  }

  function stepSix_PricingMode() {
    updateProgress(60, "Step 6 of 8: Pricing Mode");
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
    updateProgress(65, "Step 7 of 8: Rush");
    addBotMessage("Is this a rush project (starting within 72 hours)?");
    addChoices(["Yes, rush", "No"], function(ans) {
      state.isRush = !!(ans && ans.indexOf("Yes") !== -1);
      stepEight_Promo();
    });
  }

  function stepEight_Promo() {
    updateProgress(70, "Step 7 of 8: Promo");
    addBotMessage("Any promo code today?");
    addChoices([
      { label: "No Code", code: "" },
      { label: "VIP10 (10% OFF)", code: "VIP10" },
      { label: "REFERRAL5 (5% OFF)", code: "REFERRAL5" }
    ], function(choice) {
        if (choice.code === "") {
            addBotMessage("Wait! Since you're booking online, I've applied the **'WEB-SAVER'** discount (-5%) for you automatically. 🎉");
            state.promoCode = "WEBSAVER"; 
            stepNine_DebrisRemoval();
        } else {
            state.promoCode = choice.code;
            stepNine_DebrisRemoval();
        }
    });
  }

  function stepNine_DebrisRemoval() {
    updateProgress(75, "Step 8 of 8: Debris Removal");
    const svc = SERVICES[state.serviceKey];
    const hasPrice = svc && svc.unit !== "consult" && state.serviceKey !== "other";

    if (hasPrice) {
        addBotMessage("Should we include debris removal & dumpster costs? (Typically +$1,200–$2,800)");
        addChoices(["Yes, include debris removal", "No, I'll handle debris"], function(ans) {
            state.debrisRemoval = !!(ans && ans.indexOf("Yes") !== -1);
            stepTen_SmartAddonsIntro();
        });
    } else {
        state.debrisRemoval = false;
        stepTen_SmartAddonsIntro();
    }
  }

  function stepTen_SmartAddonsIntro() {
    updateProgress(80, "Step 8 of 8: Add-ons");
    const config = SMART_ADDONS_CONFIG[state.serviceKey];
    
    if (config && config.groups) {
      // 🧠 UPDATED: HONEST INTRO (No fake neighbor stats)
      addBotMessage(`I found some optional upgrades for **${config.title}**. These items can improve the final look or durability.`);
      
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

    addBotMessage("Select a category to view upgrades:", false);
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
      label: `${item.label} ($${item.low} - $${item.high})`, 
      itemData: item,
      group: groupKey
    }));

    if (availableItems.length === 0) {
      addBotMessage(`You've added all items from ${groupLabel}.`);
      showAddonCategories(config);
      return;
    }

    availableItems.push({ label: "🔙 Back to Categories", isBack: true });

    addBotMessage(`**${groupLabel} Options:** Tap to add.`);
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
    addBotMessage("🧮 Calculating estimate...");
    setTimeout(() => {
        const est = computeEstimateForCurrent();
        est.svcKey = state.serviceKey;
        state.projects.push(est); 
        saveState(); 
        showEstimateAndAskAnother(est);
    }, 1500);
  }

  // --- CALCULATION ENGINE ---

  function getDurationEstimate(est) {
      if(est.isCustom) return "Consultation Needed";
      if(est.high < 2500) return "1 Day";
      if(est.high < 5000) return "1 - 2 Days";
      if(est.high < 15000) return "3 - 5 Days";
      if(est.high < 40000) return "1 - 2 Weeks";
      return "2 - 4 Weeks";
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

    let dc = 0;
    if (state.promoCode) {
      const rate = DISCOUNTS[state.promoCode.toUpperCase()];
      if (rate) dc = rate;
    }
    if (dc > 0) {
      low *= (1 - dc);
      high *= (1 - dc);
    }

    return { low, high, discountRate: dc };
  }

  function computeEstimateForCurrent() {
    const svc = SERVICES[state.serviceKey];
    if (!svc) return null;

    const sub = state.subOption || {};
    const mod = BOROUGH_MODS[state.borough] || 1.0;
    let low = 0, high = 0;

    // 1. Calculate Base Price
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

    if (state.isLeadHome) { low *= 1.10; high *= 1.10; }

    const adjusted = applyPriceModifiers(low, high);
    
    // 2. Calculate Add-ons (With Location Modifiers)
    let addonLow = 0, addonHigh = 0;
    state.selectedAddons.forEach(addon => {
        addonLow += (addon.low * mod);
        addonHigh += (addon.high * mod);
    });

    // 3. Debris Removal (With Location Modifier)
    if (state.debrisRemoval) {
        addonLow += (ADD_ON_PRICES.debrisRemoval.low * mod);
        addonHigh += (ADD_ON_PRICES.debrisRemoval.high * mod);
    }

    const finalLow = adjusted.low + addonLow;
    const finalHigh = adjusted.high + addonHigh;

    return {
      svc, sub, borough: state.borough,
      size: (svc.unit === "fixed" && !sub.isPerSqFt || svc.unit === "consult") ? null : state.size,
      isLeadHome: state.isLeadHome, pricingMode: state.pricingMode, isRush: state.isRush,
      promoCode: state.promoCode, 
      low: finalLow, high: finalHigh,
      discountRate: adjusted.discountRate, 
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

    const projectRequiresDebris = state.projects.some(p => p.debrisRemoval === true);

    return { totalLow, totalHigh, projectRequiresDebris };
  }

  function buildEstimateHtml(est) {
    const svc = est.svc;
    const sub = est.sub || {};
    const hasPrice = !!(est.low && est.high);
    const fLow = hasPrice ? Math.round(est.low).toLocaleString() : null;
    const fHigh = hasPrice ? Math.round(est.high).toLocaleString() : null;
    const duration = getDurationEstimate(est);

    let discountLine = "";
    if (est.discountRate > 0) {
      discountLine = `<div class="hb-receipt-row"><span>Promo:</span><span>-${Math.round(est.discountRate * 100)}% applied</span></div>`;
    }

    let rushLine = est.isRush ? `<div class="hb-receipt-row"><span>Rush:</span><span>Priority scheduling included</span></div>` : "";
    let debrisLine = est.debrisRemoval ? `<div class="hb-receipt-row" style="color:#0a9"><span>Debris:</span><span>Haul-away **included**</span></div>` : "";

    let modeLabel = "Full (Labor + Materials)";
    if (est.pricingMode === "labor") modeLabel = "Labor Only";
    if (est.pricingMode === "materials") modeLabel = "Materials + Light Help";

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

    // UPDATED: Friendly reminder about competitive pricing in the receipt itself
    let competitiveNote = hasPrice
      ? `<div style="background:#e6ffea; border:1px solid #b7ebc5; color:#2e7d32; font-size:10px; padding:6px; margin-top:8px; border-radius:4px; text-align:center;">
           <strong>Good News:</strong> We often beat these market averages!
         </div>` 
      : "";

    return `
      <div class="hb-receipt">
        <h4>Estimator Summary</h4>
        <div class="hb-receipt-row"><span>Service:</span><span>${svc.label}</span></div>
        <div class="hb-receipt-row"><span>Type:</span><span>${sub.label || "Standard"}</span></div>
        <div class="hb-receipt-row"><span>Area:</span><span>${est.borough || "N/A"}</span></div>
        ${sizeRow}
        <div class="hb-receipt-row"><span>Duration:</span><span>${duration} (approx)</span></div>
        <div class="hb-receipt-row"><span>Pricing Mode:</span><span>${modeLabel}</span></div>
        ${rushLine}
        ${debrisLine}
        ${addonsHtml}
        ${discountLine}
        ${priceRow}
        ${competitiveNote}
        <div class="hb-receipt-footer hb-disclaimer">
          <strong>Disclaimer:</strong> This tool provides an automated ballpark range only. Final pricing may change based on site conditions.
        </div>
      </div>
    `;
  }

  function editCurrentProject(projectIndex) {
      if (projectIndex >= 0 && projectIndex < state.projects.length) {
          const p = state.projects[projectIndex];
          state.serviceKey = p.svcKey; 
          state.subOption = p.sub;
          state.size = p.size || 0;
          state.borough = p.borough;
          state.isLeadHome = p.isLeadHome;
          state.pricingMode = p.pricingMode;
          state.isRush = p.isRush;
          state.promoCode = p.promoCode;
          state.debrisRemoval = p.debrisRemoval;
          state.selectedAddons = p.selectedAddons || [];
          
          state.projects.splice(projectIndex, 1);
          addBotMessage(`✏️ Editing **${p.svc.label}**. Starting from step 2 (Sub-Questions).`);
          stepTwo_SubQuestions();
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
            { label: "No, Continue to Finish", key: "finish" }
        ];

        addChoices(choices, function(choice) {
            if (choice.key === "add") {
                resetProjectState();
                addBotMessage("Great! What type of project is the next one?");
                presentServiceOptions();
            } else if (choice.key === "edit") {
                editCurrentProject(choice.index);
            } else {
                stepMembershipUpsell();
            }
        });
    }, 1200);
  }

  function stepMembershipUpsell() {
    // 🧠 HONEST PITCH FOR VIP
    addBotMessage("Before we finish, would you like to hear about our **VIP Home Care Program**?");
    addBotMessage("It includes 15% off all labor, priority booking, PLUS entry into our **Monthly Draw**.");
    
    addChoices([
        { label: "💳 Tell me more", key: "yes" },
        { label: "No thanks", key: "no" }
    ], function(choice) {
        if (choice.key === "yes") {
            addBotMessage("🏆 **VIP Members** get discounts, priority service, and auto-entry into our draw. I'll include the brochure link in your summary.");
            state.interestedInMembership = true;
        }
        showCombinedReceiptAndLeadCapture();
    });
  }

  // --- VIRAL LOOP STRATEGY (Report Sec 4.2) ---
  async function triggerShare() {
      const shareUrl = window.location.href;
      const shareData = {
          title: 'Hammer Brick & Home Calculator',
          text: `I just got a project estimate for ${state.borough || "my home"}. Check it out:`,
          url: shareUrl
      };

      // Tier 1: Native Share
      if (navigator.canShare && navigator.canShare(shareData)) {
          try {
              await navigator.share(shareData);
          } catch (err) {
              console.log('Share canceled/failed', err);
          }
      } else {
          // Tier 2: Clipboard Fallback
          try {
              await navigator.clipboard.writeText(shareUrl);
              alert("Link copied to clipboard! Share it with a friend.");
          } catch (err) {
              // Tier 3: Prompt Fallback
              prompt('Copy this link to share:', shareUrl);
          }
      }
  }

  function showCombinedReceiptAndLeadCapture() {
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
            <span>${hasPrice ? "$" + Math.round(p.low).toLocaleString() + " – $" + Math.round(p.high).toLocaleString() : "Walkthrough needed"}</span>
          </div>`;
    }).join("");

    let debrisRow = "";
    if (totals.projectRequiresDebris) {
        debrisRow = `<div class="hb-receipt-row" style="color:#0a9; font-weight:700;"><span>Debris Removal:</span><span>Included in estimates above</span></div>`;
    }

    let totalRow = (totals.totalLow && totals.totalHigh) 
      ? `<div class="hb-receipt-total"><span>Combined Total Range:</span><span>$${Math.round(totals.totalLow).toLocaleString()} – $${Math.round(totals.totalHigh).toLocaleString()}</span></div>`
      : "";
    
    let financingRow = "";
    if (totals.totalHigh > 5000) {
        financingRow = `<div class="hb-receipt-row" style="margin-top:5px; font-size:10px; color:#666; justify-content:center;"><em>0% Financing Available for qualified homeowners.</em></div>`;
    }

    let leadScoreHtml = "";
    if (totals.totalHigh > 25000) {
        leadScoreHtml = `<div class="hb-receipt-footer" style="color:#e7bf63; font-weight:bold;">🌟 VIP Project Tier</div>`;
    }

    // 🧠 DOUBLE VALUE STACK (SEPARATE GIFT + DRAW)
    let bonusHtml = `
    <div class="hb-receipt-row" style="background:#f0fdf4; color:#166534; font-weight:bold; margin-top:8px; border-radius:4px; padding:8px; text-align:center; display:block;">
        🎁 <strong>GIFT UNLOCKED:</strong><br>
        Free On-Site Expert Assessment ($250 Value) — Included with estimate!
    </div>
    <div class="hb-receipt-row" style="background:#fffbe6; color:#b58900; font-weight:bold; margin-top:4px; border-radius:4px; padding:8px; text-align:center; display:block;">
        🏆 <strong>${state.borough || "NYC"} MONTHLY DRAW:</strong><br>
        2 lucky subscribers win one service each from over 50 services free!
    </div>`;

    const html = `
      <div class="hb-receipt">
        <h4>Combined Estimate Summary</h4>
        ${rowsHtml}
        ${debrisRow}
        ${totalRow}
        ${financingRow}
        ${bonusHtml}
        ${leadScoreHtml}
        <div class="hb-receipt-footer">Ask about VIP Home Care memberships & referral rewards.</div>
      </div>`;

    addBotMessage('--- **Combined Estimate** ---<br>' + html, true);
    
    if(state.name && state.phone) {
        setTimeout(() => generateFinalLinks(), 1200);
    } else {
        setTimeout(() => showLeadCapture("To lock in this estimate, I can text or email you the details."), 1200);
    }
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
    state.debrisRemoval = false;
    state.selectedAddons = []; 
    state.interestedInMembership = false;
  }
  
  // --- LEAD CAPTURE & LINKS ----------------------------------

  function showLeadCapture(introText) {
    addBotMessage(introText);
    addBotMessage("What is your name?");
    enableInput(function(name) {
      state.name = name;
      saveState();
      askEmail();
    });

    function askEmail() {
        addBotMessage("What is your email address?");
        enableInput(function(email) {
            if (!/^\S+@\S+\.\S+$/.test(email)) {
                addBotMessage("⚠️ That doesn't look like a valid email. Please try again.");
                setTimeout(askEmail, 500);
                return;
            }
            state.email = email;
            saveState();
            askPhone();
        });
    }

    function askPhone() {
        addBotMessage("And your mobile number?");
        enableInput(function(phone) {
            const cleanPhone = phone.replace(/\D/g, "");
            if (cleanPhone.length < 10 || cleanPhone.length > 15) {
                addBotMessage("⚠️ That number looks a bit short. Please enter a valid mobile number (10+ digits).");
                setTimeout(askPhone, 500); 
            } else {
                state.phone = phone;
                saveState();
                askExtraQuestions();
            }
        });
    }
  }

  function askExtraQuestions() {
      addBotMessage("Almost done! When are you hoping to start this project?");
      addChoices(["ASAP / Rush", "Within 1 month", "1-3 Months", "Just budgeting"], function(timing) {
          state.projectTiming = (typeof timing === 'object') ? timing.label : timing;
          
          addBotMessage("And how did you hear about Hammer Brick & Home?");
          addChoices(["Google Search", "Instagram/Facebook", "Referral", "Yard Sign/Truck"], function(source) {
              state.leadSource = (typeof source === 'object') ? source.label : source;
              saveState();
              generateFinalLinks();
          });
      });
  }

  function getLeadScore(totalHigh) {
    if (totalHigh > 25000) return "VIP / High-Value";
    if (totalHigh < 5000) return "Small / Quick";
    return "Standard";
  }

  function generateFinalLinks() {
    updateProgress(100);

    let lines = [`Hello, I'm ${state.name}.`, "Projects:"];
    
    if (state.isPhotoSkip) {
        lines.push("User opted to SKIP ESTIMATE and send photos directly.");
    }

    if (state.projects && state.projects.length) {
      state.projects.forEach((p, idx) => {
        const unitLabel = p.sub.isPerSqFt ? "sq ft" : p.svc.unit;
        let line = `${idx + 1}. ${p.svc.label}` + (p.size ? ` — ${p.size} ${unitLabel}` : "") + (p.borough ? ` (${p.borough})` : "");
        
        if (p.low && p.high) {
          line += ` — ~$${Math.round(p.low).toLocaleString()}–$${Math.round(p.high).toLocaleString()}`;
        } else {
          line += " (walkthrough needed)";
        }
        lines.push(line);

        let extras = [];
        if (p.pricingMode !== "full") extras.push(p.pricingMode);
        if (p.isRush) extras.push("Rush");
        if (p.promoCode) extras.push(`Promo: ${p.promoCode}`);
        if (p.debrisRemoval) extras.push("Debris: Included in total");
        
        if (extras.length) lines.push("   [" + extras.join(" | ") + "]");

        if (p.selectedAddons && p.selectedAddons.length) {
             p.selectedAddons.forEach(addon => {
                 lines.push(`   + Add-on: ${addon.label}`);
             });
        }
      });

      const totals = computeGrandTotal();
      
      let leadTier = getLeadScore(totals.totalHigh);

      if (totals.totalLow) {
          lines.push(`\nCOMBINED RANGE: $${Math.round(totals.totalLow).toLocaleString()} – $${Math.round(totals.totalHigh).toLocaleString()}`);
          lines.push(`Lead Tier: ${leadTier}`);
      }
    }

    lines.push(`Customer Name: ${state.name}`);
    lines.push(`Email: ${state.email}`);
    lines.push(`Phone: ${state.phone}`);
    lines.push(`Timing: ${state.projectTiming}`); 
    lines.push(`Source: ${state.leadSource}`);  
    if (state.interestedInMembership) lines.push("** Interested in VIP Membership **");

    lines.push("Please reply to schedule a walkthrough.");

    sendLeadToWebhook(lines.join("\n"), state);

    // NEW: Show the final text summary in the chat so user sees what is being sent
    addBotMessage("Here is the final text summary of your estimate:<br><pre style='background:#fff; padding:10px; border:1px solid #ccc; white-space:pre-wrap; font-family:monospace; font-size:11px;'>" + lines.join("\n") + "</pre>", true);

    const body = encodeURIComponent(lines.join("\n"));
    const smsLink = "sms:" + PHONE_NUMBER + "?&body=" + body;
    const emailLink = "mailto:hammerbrickhome@gmail.com?subject=" + encodeURIComponent("Estimate Request") + "&body=" + body;

    addBotMessage(`Thanks, ${state.name}! Choose how you’d like to contact us.`, false);
    
    setTimeout(function() {
      const createBtn = (text, href, isPrimary, isCall) => {
          const btn = document.createElement("a");
          btn.className = isPrimary ? "hb-chip hb-primary-btn" : "hb-chip";
          btn.style.display = "block";
          btn.style.textAlign = "center";
          btn.style.textDecoration = "none";
          btn.style.marginTop = "8px";
          btn.textContent = text;
          btn.href = href;
          if(!isCall && !href.startsWith("sms:") && !href.startsWith("mailto:")) btn.target = "_blank";
          els.body.appendChild(btn);
      };

      createBtn("📲 Text Estimate to Hammer Brick & Home", smsLink, true, false);
      createBtn("✉️ Email Estimate to Hammer Brick & Home", emailLink, true, false);
      createBtn("📞 Call Hammer Brick & Home", "tel:" + PHONE_NUMBER, false, true);
      
      // NEW: SHARE BUTTON (VIRAL LOOP)
      const shareBtn = document.createElement("button");
      shareBtn.className = "hb-chip";
      shareBtn.style.display = "block";
      shareBtn.style.marginTop = "8px";
      shareBtn.textContent = "📢 Share Tool & Earn Referrals";
      shareBtn.onclick = triggerShare; // Uses the logic from tech report
      els.body.appendChild(shareBtn);

      if (CRM_FORM_URL) createBtn("📝 Complete Full Intake Form", CRM_FORM_URL, false, false);
      if (WALKTHROUGH_URL) createBtn("📅 Book a Walkthrough", WALKTHROUGH_URL, false, false);

      const photoBtn = document.createElement("button");
      photoBtn.className = "hb-chip";
      photoBtn.style.display = "block";
      photoBtn.style.marginTop = "8px";
      photoBtn.textContent = "📷 Add Photos";
      photoBtn.onclick = () => { if (els.photoInput) els.photoInput.click(); };
      els.body.appendChild(photoBtn);

      const resetBtn = document.createElement("button");
      resetBtn.className = "hb-chip";
      resetBtn.style.display = "block";
      resetBtn.style.marginTop = "20px";
      resetBtn.style.background = "#333"; 
      resetBtn.textContent = "🔁 Start Over (Clear Session)";
      resetBtn.onclick = function() {
          if(confirm("Clear all data and start over?")) {
              sessionStorage.removeItem("hb_estimator_state");
              location.reload(); 
          }
      };
      els.body.appendChild(resetBtn);

      scrollToBottom();
    }, 500);
  }

  function sendLeadToWebhook(fullText, stateData) {
      if (!WEBHOOK_URL) return;
      
      const totals = computeGrandTotal();
      const payload = {
          name: stateData.name,
          email: stateData.email,
          phone: stateData.phone,
          timing: stateData.projectTiming,
          source: stateData.leadSource,
          leadTier: getLeadScore(totals.totalHigh),
          totalLow: Math.round(totals.totalLow),
          totalHigh: Math.round(totals.totalHigh),
          projects: stateData.projects.map(p => ({
              service: p.svc.label,
              subType: p.sub?.label || "Standard",
              borough: p.borough,
              size: p.size,
              unit: p.svc.unit,
              low: Math.round(p.low),
              high: Math.round(p.high),
              pricingMode: p.pricingMode,
              isRush: p.isRush,
              promoCode: p.promoCode || null,
              debrisRemoval: p.debrisRemoval,
              addons: (p.selectedAddons || []).map(a => a.label)
          })),
          timestamp: new Date().toISOString()
      };

      fetch(WEBHOOK_URL, {
          method: "POST",
          mode: "no-cors", 
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload)
      }).then(() => {
          console.log("Webhook sent.");
      }).catch(e => {
          console.error("Webhook failed", e);
          addBotMessage("⚠️ (Note: Automatic server sync failed, but your estimate is safe here. Please use the Text or Email buttons below.)");
      });
  }

  function enableInput(callback) {
    els.input.disabled = false;
    els.input.placeholder = "Type your answer...";
    els.input.focus();
    const newSend = els.send.cloneNode(true);
    els.send.parentNode.replaceChild(newSend, els.send);
    els.send = newSend;
    els.send.onclick = function() {
      const val = els.input.value.trim();
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

  document.addEventListener("DOMContentLoaded", init);

})();
