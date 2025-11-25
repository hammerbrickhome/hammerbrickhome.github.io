/* ============================================================
   HAMMER BRICK & HOME — ESTIMATOR BOT v12.1 (HONEST AUTHORITY)
   - UPDATED: Ticker now shows real License, Offers, & Trends.
   - UPDATED: Availability Check is now honest but positive.
   - INCLUDES: Auto-Open, Outdoor Living, Copy Estimate.
=============================================================== */

(function() {
  // --- CONFIGURATION -----------------------------------------

  const WEBHOOK_URL = ""; // <- Plug in your Zapier/Make URL here
  const PHONE_NUMBER = "9295955300"; 
  const CRM_FORM_URL = ""; 
  const WALKTHROUGH_URL = "";

  const BOROUGH_MODS = {
    "Manhattan": 1.18, "Brooklyn": 1.08, "Queens": 1.05,
    "Bronx": 1.03, "Staten Island": 1.0, "New Jersey": 0.96
  };

  const DISCOUNTS = { "VIP10": 0.10, "REFERRAL5": 0.05 };
  const ADD_ON_PRICES = { "debrisRemoval": { low: 800, high: 1500 } };

  const SMART_ADDON_GROUP_LABELS = {
    luxury: "Luxury Upgrades", protection: "Protection & Safety",
    design: "Design Enhancements", speed: "Speed / Convenience",
    maintenance: "Maintenance Items"
  };

  // --- SMART ADD-ONS CONFIG ---
  const SMART_ADDONS_CONFIG = {
    masonry: {
      title: "Masonry · Pavers · Concrete",
      groups: {
        luxury: [
          { label: "Premium border band with contrasting pavers", low: 900, high: 2200 },
          { label: "Decorative inlays or medallion pattern", low: 850, high: 2600 },
          { label: "Raised seating wall or planter", low: 1800, high: 4800 },
          { label: "Outdoor kitchen prep pad (gas/electric ready)", low: 2200, high: 6800 }
        ],
        protection: [
          { label: "Full base compaction upgrade", low: 850, high: 2200 },
          { label: "Perimeter drain or channel drain", low: 950, high: 2600 },
          { label: "Concrete edge restraint / curb", low: 650, high: 1600 }
        ],
        design: [
          { label: "Color upgrade / multi-blend pavers", low: 650, high: 1900 },
          { label: "Large-format or European-style pavers", low: 1500, high: 5200 },
          { label: "Step face stone veneer upgrade", low: 1100, high: 3600 }
        ],
        speed: [
          { label: "Weekend or off-hours install", low: 850, high: 2600 },
          { label: "Phased work scheduling", low: 450, high: 1200 }
        ],
        maintenance: [
          { label: "Polymeric sand refill & joint tightening", low: 250, high: 650 },
          { label: "Clean & seal package", low: 450, high: 1800 }
        ]
      }
    },
    driveway: {
      title: "Driveway / Parking Area",
      groups: {
        luxury: [
          { label: "Decorative apron or entry pattern", low: 900, high: 2800 },
          { label: "Heated driveway rough-in", low: 2800, high: 7800 },
          { label: "Integrated lighting at edges", low: 950, high: 2600 }
        ],
        protection: [
          { label: "Thicker base / driveway reinforcement", low: 1200, high: 3500 },
          { label: "Drain basin or trench drain at garage", low: 950, high: 2600 }
        ],
        design: [
          { label: "Two-tone driveway with borders", low: 1500, high: 4200 },
          { label: "Stamped concrete pattern upgrade", low: 1800, high: 5200 }
        ],
        speed: [
          { label: "Temporary parking pad during work", low: 650, high: 1600 }
        ],
        maintenance: [
          { label: "Sealcoat package (asphalt)", low: 450, high: 900 }
        ]
      }
    },
    roofing: {
      title: "Roofing",
      groups: {
        luxury: [
          { label: "Architectural or designer shingle upgrade", low: 1800, high: 5200 },
          { label: "Decorative metal accent roofing", low: 2200, high: 7800 }
        ],
        protection: [
          { label: "Full ice & water shield upgrade", low: 1500, high: 4200 },
          { label: "High-performance synthetic underlayment", low: 650, high: 1900 },
          { label: "Premium flashing & chimney reflashing", low: 900, high: 2600 }
        ],
        design: [
          { label: "Color-matched drip edge & accessories", low: 450, high: 1200 },
          { label: "Decorative ridge cap upgrade", low: 650, high: 1600 }
        ],
        speed: [
          { label: "One-day tear-off & install", low: 1500, high: 4500 }
        ],
        maintenance: [
          { label: "Gutter cleaning added to roof project", low: 250, high: 650 }
        ]
      }
    },
    siding: {
      title: "Siding – Exterior",
      groups: {
        luxury: [
          { label: "Stone or brick accent wall", low: 3500, high: 9800 },
          { label: "Board-and-batten or mixed cladding look", low: 2200, high: 6800 }
        ],
        protection: [
          { label: "Full house wrap / moisture barrier upgrade", low: 950, high: 2800 },
          { label: "Flashing and sill pan upgrade at windows", low: 900, high: 2600 }
        ],
        design: [
          { label: "Premium color or insulated siding line", low: 2600, high: 7800 },
          { label: "Decorative trim and crown details", low: 1500, high: 4200 }
        ],
        maintenance: [
          { label: "Annual siding wash & inspection", low: 350, high: 900 }
        ]
      }
    },
    windows: {
      title: "Windows & Exterior Doors",
      groups: {
        luxury: [
          { label: "Black or color-exterior window upgrade", low: 2200, high: 6800 },
          { label: "Sliding or French patio door upgrade", low: 2800, high: 7800 }
        ],
        protection: [
          { label: "Impact-resistant / laminated glass", low: 2600, high: 7800 },
          { label: "Storm door package", low: 650, high: 1800 }
        ],
        design: [
          { label: "Grids / divided lite pattern upgrade", low: 450, high: 1600 },
          { label: "Interior casing & stool upgrade", low: 750, high: 2600 }
        ],
        speed: [
          { label: "Same-day glass removal & board-up", low: 450, high: 1200 }
        ]
      }
    },
    exterior_paint: {
      title: "Exterior Facade / Painting",
      groups: {
        luxury: [
          { label: "Multi-color accent scheme", low: 950, high: 2600 },
          { label: "Premium elastomeric or masonry coating", low: 1800, high: 5200 }
        ],
        protection: [
          { label: "Full scrape & prime upgrade", low: 1200, high: 3800 },
          { label: "Lead-safe exterior paint protocol", low: 1500, high: 4500 }
        ],
        design: [
          { label: "Color consult with sample boards", low: 450, high: 950 }
        ],
        speed: [
          { label: "Lift / boom access where allowed", low: 1800, high: 5200 }
        ]
      }
    },
    deck: {
      title: "Deck / Patio Build or Rebuild",
      groups: {
        luxury: [
          { label: "Composite decking upgrade", low: 2800, high: 9800 },
          { label: "Cable or glass railing system", low: 2600, high: 8800 },
          { label: "Built-in benches", low: 1500, high: 4200 }
        ],
        protection: [
          { label: "Hidden fastener upgrade", low: 950, high: 2600 },
          { label: "Joist protection tape", low: 450, high: 1200 }
        ],
        design: [
          { label: "Picture-frame decking border", low: 900, high: 2600 },
          { label: "Pergola or shade structure", low: 2800, high: 9800 }
        ],
        maintenance: [
          { label: "Clean & seal package (wood decks)", low: 550, high: 1600 }
        ]
      }
    },
    fence: {
      title: "Fence Install / Replacement",
      groups: {
        luxury: [
          { label: "Decorative aluminum or steel upgrade", low: 2200, high: 7800 },
          { label: "Automatic driveway gate prep", low: 2600, high: 8800 }
        ],
        protection: [
          { label: "Privacy height upgrade", low: 900, high: 2600 },
          { label: "Child / pet safety latch package", low: 350, high: 900 }
        ],
        design: [
          { label: "Decorative caps and trim boards", low: 450, high: 1200 },
          { label: "Lattice style upgrade", low: 1200, high: 3500 }
        ],
        speed: [
          { label: "Temporary safety fence", low: 450, high: 1200 }
        ]
      }
    },
    waterproofing: {
      title: "Waterproofing",
      groups: {
        luxury: [
          { label: "Battery backup sump system", low: 1800, high: 5200 }
        ],
        protection: [
          { label: "Interior drain tile system", low: 4800, high: 14800 },
          { label: "Full wall membrane upgrade", low: 2800, high: 9800 }
        ],
        design: [
          { label: "Finished wall panel system", low: 2600, high: 7800 }
        ]
      }
    },
    powerwash: {
      title: "Power Washing",
      groups: {
        luxury: [
          { label: "House + driveway + patio bundle", low: 450, high: 1600 }
        ],
        protection: [
          { label: "Soft-wash roof treatment", low: 650, high: 1900 }
        ],
        design: [
          { label: "Fence & rail cleaning upgrade", low: 250, high: 650 }
        ],
        maintenance: [
          { label: "Seasonal wash contract (2x per year)", low: 650, high: 1900 }
        ]
      }
    },
    sidewalk: {
      title: "Sidewalk / DOT",
      groups: {
        luxury: [
          { label: "Decorative broom or border finish", low: 650, high: 1900 }
        ],
        protection: [
          { label: "Extra thickness at tree/driveway", low: 900, high: 2600 },
          { label: "Root barrier installation", low: 1200, high: 3800 }
        ],
        design: [
          { label: "Scored control joint pattern", low: 450, high: 1200 }
        ],
        speed: [
          { label: "Phased pour scheduling", low: 450, high: 1200 }
        ]
      }
    },
    gutter: {
      title: "Gutters",
      groups: {
        luxury: [
          { label: "Seamless half-round or decorative profile", low: 1200, high: 3500 }
        ],
        protection: [
          { label: "Premium gutter guard system", low: 1500, high: 3800 },
          { label: "Additional downspouts", low: 450, high: 1200 }
        ],
        design: [
          { label: "Color-matched gutter & trim package", low: 450, high: 1200 }
        ],
        speed: [
          { label: "Same-day cleaning add-on", low: 250, high: 650 }
        ]
      }
    },
    painting: {
      title: "Interior Painting",
      groups: {
        luxury: [
          { label: "Accent wall feature paint or wallpaper", low: 450, high: 1600 },
          { label: "Fine finish trim & door spray", low: 900, high: 2600 }
        ],
        protection: [
          { label: "Full skim coat upgrade", low: 1800, high: 5800 },
          { label: "Zero-VOC paint line", low: 650, high: 1900 }
        ],
        design: [
          { label: "Color consult with samples", low: 350, high: 900 }
        ],
        speed: [
          { label: "Night or weekend painting", low: 650, high: 1900 }
        ]
      }
    },
    flooring: {
      title: "Flooring",
      groups: {
        luxury: [
          { label: "Wide-plank or herringbone layout", low: 2200, high: 7800 },
          { label: "Heated floor rough-in", low: 1800, high: 5200 }
        ],
        protection: [
          { label: "Moisture barrier upgrade", low: 650, high: 1900 },
          { label: "Subfloor repair allowance", low: 900, high: 2600 }
        ],
        design: [
          { label: "Stair treads & nosing upgrade", low: 1200, high: 3800 }
        ],
        speed: [
          { label: "Room-by-room phased install", low: 450, high: 1200 }
        ]
      }
    },
    drywall: {
      title: "Drywall",
      groups: {
        luxury: [
          { label: "Level 5 finish on key walls", low: 1800, high: 5200 }
        ],
        protection: [
          { label: "Sound-damping board upgrade", low: 1500, high: 4800 },
          { label: "Mold-resistant board", low: 900, high: 2600 }
        ],
        design: [
          { label: "Simple ceiling design (tray/beams)", low: 2200, high: 7800 }
        ],
        speed: [
          { label: "Dust-reduced sanding upgrade", low: 650, high: 1900 }
        ]
      }
    },
    bathroom: {
      title: "Bathroom Remodel",
      groups: {
        luxury: [
          { label: "Full glass shower enclosure", low: 1800, high: 4200 },
          { label: "Heated floor system", low: 1800, high: 3200 },
          { label: "Rain head + handheld combo", low: 950, high: 2600 },
          { label: "Floating vanity build", low: 1500, high: 3800 }
        ],
        protection: [
          { label: "Waterproofing membrane upgrade", low: 1200, high: 3800 },
          { label: "Linear drain upgrade", low: 900, high: 2600 }
        ],
        design: [
          { label: "Large-format / Italian tile", low: 1800, high: 5200 },
          { label: "LED niche lighting", low: 650, high: 1900 }
        ],
        speed: [
          { label: "Fast-track bathroom", low: 1500, high: 4500 }
        ]
      }
    },
    kitchen: {
      title: "Kitchen Remodel",
      groups: {
        luxury: [
          { label: "Full height backsplash", low: 1800, high: 5200 },
          { label: "Waterfall island edge", low: 2800, high: 9800 },
          { label: "Pro-style appliance prep", low: 2200, high: 7800 }
        ],
        protection: [
          { label: "Under-cabinet lighting upgrade", low: 900, high: 2600 },
          { label: "Water leak sensor kit", low: 450, high: 1200 }
        ],
        design: [
          { label: "Glass or accent cabinet doors", low: 950, high: 2600 },
          { label: "Custom hood treatment", low: 2200, high: 6800 }
        ],
        speed: [
          { label: "Temporary sink setup", low: 650, high: 1900 }
        ]
      }
    },
    handyman: {
      title: "Handyman",
      groups: {
        luxury: [
          { label: "Priority same-week booking", low: 150, high: 450 }
        ],
        protection: [
          { label: "Safety package (grab bars)", low: 250, high: 750 }
        ],
        design: [
          { label: "Decor hardware refresh", low: 350, high: 900 }
        ],
        speed: [
          { label: "Evening/weekend window", low: 250, high: 650 }
        ]
      }
    },
    // OUTDOOR LIVING (Added)
    outdoor_living: {
      title: "Outdoor Living & Kitchens",
      groups: {
        luxury: [
          { label: "Built-in Pizza Oven", low: 2500, high: 6500 },
          { label: "Granite/Stone Counter Upgrade", low: 1800, high: 4500 }
        ],
        protection: [
          { label: "Gas Line Safety Shut-off & Permit", low: 900, high: 2200 },
          { label: "Custom Canvas Cover", low: 450, high: 1200 }
        ],
        design: [
          { label: "Pergola / Shade Structure", low: 3500, high: 9500 },
          { label: "Under-counter LED lighting", low: 650, high: 1500 }
        ]
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
    // OUTDOOR LIVING (Added)
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
    phone: "",
    projectTiming: "",
    leadSource: "",
    projects: []
  };

  let els = {};
  let tickerInterval; // For live ticker

  // --- INIT ---------------------------------------------------

  function init() {
    console.log("HB Chat: Initializing v12.1...");
    createInterface();
    startTicker();
    
    // NEW: Smart Auto-Open (Opens once per session after 4 seconds)
    if (!sessionStorage.getItem("hb_has_opened_automatically")) {
        setTimeout(function() {
            // Only open if it's not already open
            if (!els.wrapper.classList.contains("hb-open")) {
                toggleChat();
                sessionStorage.setItem("hb_has_opened_automatically", "true");
            }
        }, 4000); // 4 seconds delay
    }

    setTimeout(stepOne_Disclaimer, 800);
  }

  function createInterface() {
    // 1. FAB (Sticky Button)
    const fab = document.createElement("div");
    fab.className = "hb-chat-fab";
    fab.setAttribute("aria-label", "Get Quote");
    fab.innerHTML = `<span class="hb-fab-icon">📷</span><span class="hb-fab-text">Get Quote</span>`;
    
    // Force visibility to fix any glitches
    fab.style.display = "flex"; 
    fab.style.zIndex = "2147483647";
    
    fab.onclick = toggleChat;
    document.body.appendChild(fab);

    // 2. Wrapper
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
      <div id="hb-ticker" style="background:#1c263b; color:#888; font-size:10px; padding:6px 16px; border-bottom:1px solid rgba(255,255,255,0.05); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        Initializing live updates...
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

    // 3. Photo Input
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
      addBotMessage(`📷 You selected ${photoInput.files.length} photo(s). Please attach these when you text or email us.`);
    });
  }

  // --- UPDATED: HONEST TRUST TICKER ---
  function startTicker() {
      if (!els.ticker) return;
      const msgs = [
          "🛡️ NYC Licensed & Insured: HIC #2131291 · EPA Lead-Safe Certified",
          "🧱 Specializing in: Masonry · Brownstones · Outdoor Living · Roofing",
          "🔥 Trending: Basement Waterproofing & Custom Outdoor Living",
          "❄️ Winter Prep: Ask about waterproofing & freeze-protection.",
          "💳 VIP Members get 15% off labor + priority emergency scheduling.",
          "📍 Serving Manhattan, Brooklyn, Queens, Bronx & New Jersey."
      ];
      let i = 0;
      els.ticker.innerText = msgs[0];
      setInterval(() => {
          i = (i + 1) % msgs.length;
          els.ticker.innerText = msgs[i];
      }, 5000); // Cycle every 5 seconds
  }

  function toggleChat() {
    const isOpen = els.wrapper.classList.toggle("hb-open");
    if (isOpen) {
      els.fab.style.display = "none";
      sessionStorage.setItem("hb_chat_active", "true");
      // Auto-focus
      if(els.input && !els.input.disabled) els.input.focus();
    } else {
      els.fab.style.display = "flex";
      sessionStorage.removeItem("hb_chat_active");
    }
  }

  function updateProgress(pct, label) {
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

  // --- HELPER: SEASONAL GREETING ---
  function getSeasonalGreeting() {
      const month = new Date().getMonth(); // 0-11
      // Nov (10) or Dec (11)
      if (month === 10 || month === 11) return "❄️ Winter is coming! Check our freeze-protection packages."; 
      // March (2) to May (4)
      if (month >= 2 && month <= 4) return "🌸 Spring Rush is starting! Secure your dates now.";
      // June (5) to August (7)
      if (month >= 5 && month <= 7) return "☀️ Summer is here! Perfect time for outdoor living.";
      // Default
      return "👋 Hi! Ready to upgrade your home?";
  }

  // --- FLOW: DISCLAIMER -> SERVICE -> SUB OPTIONS --------------------------

  function stepOne_Disclaimer() {
    updateProgress(5, "Step 1 of 8: Disclaimer");
    
    // NEW: Seasonal Greeting
    addBotMessage(getSeasonalGreeting());

    const disclaimerText = `
        Quick heads-up: this is a **ballpark estimate only**, not a contract. Final price comes after an in-person visit and written proposal. OK to continue?
    `;
    setTimeout(() => {
        addBotMessage(disclaimerText, true);
        addChoices([
            { label: "✅ I Agree to the Disclaimer", key: "agree" },
            { label: "❌ Close Chat", key: "exit" }
        ], function(choice) {
            if (choice.key === "agree") {
                addBotMessage("Great! What type of project are you planning?");
                presentServiceOptions();
            } else {
                toggleChat();
            }
        });
    }, 1200);
  }

  function presentServiceOptions() {
    updateProgress(10, "Step 2 of 8: Service Selection");
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
    updateProgress(30, "Step 3 of 8: Project Details");
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
      
      // Trigger Availability Check
      stepFive_AvailabilityCheck();
    });
  }

  // --- UPDATED: HONEST AVAILABILITY CHECK ---
  function stepFive_AvailabilityCheck() {
      addBotMessage(`Let me check our schedule for ${state.borough}...`);
      
      // 2-second "Thinking" Delay
      setTimeout(() => {
          addBotMessage(`🗓️ OK, yes! We have estimate slots available for next week.`);
          setTimeout(stepSix_PricingMode, 1000);
      }, 2000);
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
    addBotMessage("Any promo code today? If not, tap 'No Code'.");
    addChoices([
      { label: "No Code", code: "" },
      { label: "VIP10", code: "VIP10" },
      { label: "REFERRAL5", code: "REFERRAL5" }
    ], function(choice) {
      state.promoCode = choice.code || "";
      stepNine_DebrisRemoval();
    });
  }

  function stepNine_DebrisRemoval() {
    updateProgress(75, "Step 8 of 8: Debris Removal");
    const svc = SERVICES[state.serviceKey];
    const hasPrice = svc && svc.unit !== "consult" && state.serviceKey !== "other";

    if (hasPrice) {
        addBotMessage("Should we include debris removal & dumpster costs? (Typically +$800–$1,500)");
        addChoices(["Yes, include debris removal", "No, I'll handle debris"], function(ans) {
            state.debrisRemoval = !!(ans && ans.indexOf("Yes") !== -1);
            stepTen_SmartAddonsIntro();
        });
    } else {
        state.debrisRemoval = false;
        stepTen_SmartAddonsIntro();
    }
  }

  // --- SMART ADD-ONS ----------------

  function stepTen_SmartAddonsIntro() {
    updateProgress(80, "Step 8 of 8: Add-ons");
    const config = SMART_ADDONS_CONFIG[state.serviceKey];
    
    if (config && config.groups) {
      addBotMessage(`I found optional **Smart Add-ons** for ${config.title}. Would you like to view categories like Luxury Upgrades or Protection?`);
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
      label: `${item.label} (+$${item.low})`,
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
    const est = computeEstimateForCurrent();
    est.svcKey = state.serviceKey;
    state.projects.push(est); 
    showEstimateAndAskAnother(est);
  }

  // --- CALCULATION ENGINE ------------------------------------

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
    
    let addonLow = 0, addonHigh = 0;
    state.selectedAddons.forEach(addon => {
        addonLow += addon.low;
        addonHigh += addon.high;
    });

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
    if (projectRequiresDebris) {
        totalLow += ADD_ON_PRICES.debrisRemoval.low;
        totalHigh += ADD_ON_PRICES.debrisRemoval.high;
    }

    return { totalLow, totalHigh, projectRequiresDebris };
  }

  function buildEstimateHtml(est) {
    const svc = est.svc;
    const sub = est.sub || {};
    const hasPrice = !!(est.low && est.high);
    const fLow = hasPrice ? Math.round(est.low).toLocaleString() : null;
    const fHigh = hasPrice ? Math.round(est.high).toLocaleString() : null;

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

    return `
      <div class="hb-receipt">
        <h4>Estimator Summary</h4>
        <div class="hb-receipt-row"><span>Service:</span><span>${svc.label}</span></div>
        <div class="hb-receipt-row"><span>Type:</span><span>${sub.label || "Standard"}</span></div>
        <div class="hb-receipt-row"><span>Area:</span><span>${est.borough || "N/A"}</span></div>
        ${sizeRow}
        <div class="hb-receipt-row"><span>Pricing Mode:</span><span>${modeLabel}</span></div>
        ${rushLine}
        ${debrisLine}
        ${addonsHtml}
        ${discountLine}
        ${priceRow}
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
    addBotMessage("Before we finish, would you like to hear about **VIP Home Care Memberships** (15% off labor + priority booking)?");
    addChoices([
        { label: "💳 Tell me about memberships", key: "yes" },
        { label: "No thanks", key: "no" }
    ], function(choice) {
        if (choice.key === "yes") {
            addBotMessage("🏆 **VIP Members** get 15% off all labor, priority emergency booking, and annual maintenance checks. We'll include the brochure in your text/email.");
            state.interestedInMembership = true;
        }
        showCombinedReceiptAndLeadCapture();
    });
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
        debrisRow = `<div class="hb-receipt-row" style="color:#0a9; font-weight:700;"><span>Debris Removal:</span><span>$${Math.round(ADD_ON_PRICES.debrisRemoval.low).toLocaleString()} – $${Math.round(ADD_ON_PRICES.debrisRemoval.high).toLocaleString()}</span></div>`;
    }

    let totalRow = (totals.totalLow && totals.totalHigh) 
      ? `<div class="hb-receipt-total"><span>Combined Total Range:</span><span>$${Math.round(totals.totalLow).toLocaleString()} – $${Math.round(totals.totalHigh).toLocaleString()}</span></div>`
      : "";

    let leadScoreHtml = "";
    if (totals.totalHigh > 25000) {
        leadScoreHtml = `<div class="hb-receipt-footer" style="color:#e7bf63; font-weight:bold;">🌟 VIP Project Tier</div>`;
    }

    const html = `
      <div class="hb-receipt">
        <h4>Combined Estimate Summary</h4>
        ${rowsHtml}
        ${debrisRow}
        ${totalRow}
        ${leadScoreHtml}
        <div class="hb-receipt-footer">Ask about VIP Home Care memberships & referral rewards.</div>
      </div>`;

    addBotMessage('--- **Combined Estimate** ---<br>' + html, true);
    setTimeout(() => showLeadCapture("To lock in this estimate, I can text or email you the details."), 1200);
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
      askPhone();
    });

    function askPhone() {
        addBotMessage("And your mobile number?");
        enableInput(function(phone) {
            const cleanPhone = phone.replace(/\D/g, "");
            if (cleanPhone.length < 10 || cleanPhone.length > 15) {
                addBotMessage("⚠️ That number looks a bit short. Please enter a valid mobile number (10+ digits).");
                setTimeout(askPhone, 500); 
            } else {
                state.phone = phone;
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
        if (p.debrisRemoval) extras.push("Debris: Included");
        
        if (extras.length) lines.push("   [" + extras.join(" | ") + "]");

        if (p.selectedAddons && p.selectedAddons.length) {
             p.selectedAddons.forEach(addon => {
                 lines.push(`   + Add-on: ${addon.label}`);
             });
        }
      });

      const totals = computeGrandTotal();
      if (totals.projectRequiresDebris) {
          lines.push(`Add-on: Debris Removal (~$${Math.round(ADD_ON_PRICES.debrisRemoval.low).toLocaleString()})`);
      }
      
      let leadTier = getLeadScore(totals.totalHigh);

      if (totals.totalLow) {
          lines.push(`\nCOMBINED RANGE: $${Math.round(totals.totalLow).toLocaleString()} – $${Math.round(totals.totalHigh).toLocaleString()}`);
          lines.push(`Lead Tier: ${leadTier}`);
      }
    }

    lines.push(`Customer Name: ${state.name}`);
    lines.push(`Phone: ${state.phone}`);
    lines.push(`Timing: ${state.projectTiming}`); 
    lines.push(`Source: ${state.leadSource}`);  
    if (state.interestedInMembership) lines.push("** Interested in VIP Membership **");

    lines.push("Please reply to schedule a walkthrough.");

    sendLeadToWebhook(lines.join("\n"), state);

    const body = encodeURIComponent(lines.join("\n"));
    const smsLink = "sms:" + PHONE_NUMBER + "?&body=" + body;
    const emailLink = "mailto:hammerbrickhome@gmail.com?subject=" + encodeURIComponent("Estimate Request") + "&body=" + body;

    addBotMessage(`Thanks, ${state.name}! Choose how you’d like to contact us.`, false);
    addBotMessage(`📅 We usually reply same day during business hours.`, false); 
    
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
      
      const copyBtn = document.createElement("button");
      copyBtn.className = "hb-chip";
      copyBtn.style.display = "block";
      copyBtn.style.marginTop = "8px";
      copyBtn.textContent = "📋 Copy Estimate to Clipboard";
      copyBtn.onclick = function() {
          if (navigator.clipboard) {
              navigator.clipboard.writeText(lines.join("\n")).then(() => {
                  copyBtn.textContent = "✅ Copied!";
                  setTimeout(() => copyBtn.textContent = "📋 Copy Estimate to Clipboard", 2000);
              });
          } else {
             alert("Clipboard access not available in this context (try HTTPS).");
          }
      };
      els.body.appendChild(copyBtn);

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
      resetBtn.textContent = "🔁 Start Over";
      resetBtn.onclick = function() {
          location.reload(); 
      };
      els.body.appendChild(resetBtn);

      els.body.scrollTop = els.body.scrollHeight;
    }, 500);
  }

  function sendLeadToWebhook(fullText, stateData) {
      if (!WEBHOOK_URL) return;
      
      const totals = computeGrandTotal();
      const payload = {
          name: stateData.name,
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
      }).catch(e => console.error("Webhook failed", e));
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
