/* ============================================================
   HAMMER BRICK & HOME — ULTRA ADVANCED ESTIMATOR BOT v4.3
   (Chatbot Disappearing Bug Fixed)
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
      options: [
        { label: "Update (Fixtures/Tile)", fixedLow: 14000, fixedHigh: 24000 },
        { label: "Full Gut / Redo", fixedLow: 24000, fixedHigh: 45000 }
      ],
      leadSensitive: true
    },

    // NEW SERVICES (v4.0 & v4.1)
    "siding": {
      label: "Siding Installation",
      emoji: "🏡",
      unit: "sq ft",
      baseLow: 8.5, baseHigh: 18.5, min: 4000,
      subQuestion: "Siding Material?",
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
      // NOTE: This option uses the isPerSqFt flag, requiring a size input for a 'fixed' unit service
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


  /* -------------------------------------------------------------------
     HAMMER SMART ADD-ONS DATA (Copied from hammer-smart-addons-v1.js)
     ------------------------------------------------------------------- */
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

    exterior_paint: { // Used 'exterior_paint' key to match SERVICES config
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

    // Mapping other services found in SMART_ADDONS_CONFIG to existing SERVICES keys:
    kitchen: { // Kitchen Remodel
      title: "Kitchen Remodel",
      groups: {
        luxury: [
          { label: "Kitchen island or custom seating", low: 2200, high: 7800, note: "Adds a central, customized island with seating." },
          { label: "Pot filler faucet at stove", low: 650, high: 1900, note: "Plumbing installed above the stove for easy filling." },
          { label: "Under-cabinet & toe-kick lighting", low: 950, high: 2600, note: "Adds ambient lighting to counters and floor." }
        ],
        protection: [
          { label: "Whole-kitchen water shut-off valve", low: 450, high: 1200, note: "Single valve to shut off all kitchen water quickly." }
        ],
        design: [
          { label: "Designer appliance panel integration", low: 1800, high: 5200, note: "Cabinet panels integrated onto fridge or dishwasher." },
          { label: "Statement hood or vent-cover buildout", low: 1500, high: 4800, note: "Statement hood with tile or panel surround." }
        ],
        speed: [
          { label: "Temporary sink / counter setup", low: 650, high: 1900, note: "Helps keep basic kitchen function during remodel." }
        ],
        maintenance: [
          { label: "Cabinet care & touch-up kit", low: 250, high: 650, note: "Color-matched markers, cleaners, and instructions." }
        ]
      }
    },

    bathroom: { // Bathroom Remodel
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
          { label: "Niche or recessed shelf in shower", low: 650, high: 1600, note: "Built-in storage for soap and bottles." },
          { label: "Custom tile pattern (herringbone, mosaic)", low: 900, high: 2600, note: "Requires more cuts and planning than standard layout." }
        ],
        speed: [
          { label: "Temporary toilet/sink setup (if possible)", low: 450, high: 1200, note: "Helps keep bathroom usable during off-hours." }
        ],
        maintenance: [
          { label: "Grout sealing and stain protection", low: 350, high: 900, note: "Seals grout lines for easier cleaning and stain prevention." }
        ]
      }
    },
    // NOTE: Many other services in the file (landscaping, epoxy-garage, etc.) are omitted here
    // as they don't have matching keys in your existing SERVICES config.
  };

  /* Category labels for the dropdown titles */
  const SMART_ADDON_GROUP_LABELS = {
    luxury: "Luxury Upgrades",
    protection: "Protection & Safety",
    design: "Design Enhancements",
    speed: "Speed / Convenience",
    maintenance: "Maintenance Items"
  };

  /* -------------------------------------------------------------------
     END OF SMART ADD-ONS DATA
     ------------------------------------------------------------------- */


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
    selectedAddons: [],    // NEW: List of selected add-on keys
    financingNeeded: false, // NEW: Financing flag
    name: "",
    phone: "",
    projects: []           // list of estimate objects
  };

  let els = {};

  // --- INTERFACE AND EVENT HANDLERS -----------------------------

  function createInterface() {
    // Check if the interface already exists (prevents duplicate creation on re-run)
    if (document.getElementById("hb-chat-wrapper")) return;

    // Create main wrapper
    const wrapper = document.createElement("div");
    wrapper.id = "hb-chat-wrapper";
    wrapper.className = "hb-chat-wrapper hb-chat-closed";
    document.body.appendChild(wrapper);

    // Create FAB button
    const fab = document.createElement("button");
    fab.id = "hb-chat-fab";
    fab.className = "hb-chat-fab";
    fab.innerHTML = '<span class="fab-icon">💬</span> Get Quote';
    document.body.appendChild(fab);

    // Header
    const header = document.createElement("div");
    header.className = "hb-chat-header";
    header.innerHTML = '<div class="hb-chat-title">Hammer Estimator</div><button id="hb-chat-close" class="hb-chat-close">✕</button>';
    wrapper.appendChild(header);

    // Body (message container)
    const body = document.createElement("div");
    body.className = "hb-chat-body";
    wrapper.appendChild(body);

    // Footer (input/send)
    const footer = document.createElement("div");
    footer.className = "hb-chat-footer";
    footer.innerHTML = `
      <input type="text" id="hb-chat-input" class="hb-chat-input" placeholder="Type your answer..." disabled>
      <button id="hb-chat-send" class="hb-chat-send">➤</button>
      <input type="file" id="hb-photo-input" style="display:none;" accept="image/*,application/pdf">
      <div id="hb-chat-status" class="hb-chat-status"></div>
    `;
    wrapper.appendChild(footer);

    // Store elements for global access
    els = {
      wrapper: wrapper,
      fab: fab,
      body: body,
      input: document.getElementById("hb-chat-input"),
      send: document.getElementById("hb-chat-send"),
      close: document.getElementById("hb-chat-close"),
      status: document.getElementById("hb-chat-status"),
      photoInput: document.getElementById("hb-photo-input")
    };

    // Events
    els.fab.onclick = toggleChat;
    els.close.onclick = toggleChat;
    els.input.onkeypress = handleManualInput;
    // els.photoInput.onchange = handlePhotoUpload; // Placeholder if needed later

    // Update initial UI state
    updateInterface();
  }

  function toggleChat() {
    const isOpen = els.wrapper.classList.toggle("hb-chat-closed");

    if (isOpen) {
      els.fab.style.display = "block"; // Show the FAB when chat closes
      sessionStorage.setItem("hb_chat_active", "false");
    } else {
      els.fab.style.display = "none"; // Hide the FAB when chat opens
      sessionStorage.setItem("hb_chat_active", "true");
      els.body.scrollTop = els.body.scrollHeight; // Scroll to bottom when opening
    }
  }

  function updateInterface() {
    // This function can handle updating the overall look/feel based on state
    // For now, it's just a placeholder.
    // E.g., els.wrapper.style.backgroundColor = state.step > 5 ? 'red' : 'default';
  }

  function updateProgress(percent) {
    if (els.status) {
      els.status.style.width = percent + "%";
    }
  }

  // --- MESSAGING FUNCTIONS ----------------------------------

  function addBotMessage(text, isWaitingForInput = false) {
    const msg = document.createElement("div");
    msg.className = "hb-msg hb-msg-bot";
    // Sanitize input slightly to prevent accidental HTML injection from config data
    msg.innerHTML = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    els.body.appendChild(msg);
    els.body.scrollTop = els.body.scrollHeight;

    if (isWaitingForInput) {
      els.input.focus();
    }
  }

  function addUserMessage(text) {
    const msg = document.createElement("div");
    msg.className = "hb-msg hb-msg-user";
    msg.textContent = text;
    els.body.appendChild(msg);
    els.body.scrollTop = els.body.scrollHeight;
  }

  function addChoices(choices, callback) {
    disableInput();
    const choicesContainer = document.createElement("div");
    choicesContainer.className = "hb-choices-container";

    choices.forEach(choiceData => {
      const btn = document.createElement("button");
      btn.className = "hb-chip";
      btn.textContent = choiceData.label;

      btn.onclick = function() {
        // Disable all chips after selection
        choicesContainer.querySelectorAll(".hb-chip").forEach(chip => {
          chip.disabled = true;
        });

        // Add user response
        addUserMessage(choiceData.label);

        // Execute the next step in the flow
        callback(choiceData);
      };
      choicesContainer.appendChild(btn);
    });

    els.body.appendChild(choicesContainer);
    els.body.scrollTop = els.body.scrollHeight;
  }

  function disableInput() {
    els.input.disabled = true;
    els.input.placeholder = "Please choose an option above...";
    // Reset send button listener to prevent accidental clicks
    var newSend = els.send.cloneNode(true);
    els.send.parentNode.replaceChild(newSend, els.send);
    els.send = newSend;
    els.send.onclick = function() {};
  }


  // --- INIT ---------------------------------------------------

  function init() {
    console.log("HB Chat: Initializing v4.3...");
    createInterface();

    /* FIX START: The chatbot was disappearing on reload because 
      sessionStorage kept it in an 'open' state, which hid the FAB 
      button before the wrapper was visible. We comment this out to 
      always start closed and show the FAB. 
    */
    // if (sessionStorage.getItem("hb_chat_active") === "true") {
    //   toggleChat();
    // }
    /* FIX END */

    // Kick off conversation with the mandatory disclaimer step (FIXED)
    setTimeout(stepOne_Disclaimer, 800);
  }

  // --- STEPS (Flow changes here) --------------------------------
  
  function stepOne_Disclaimer() {
    updateProgress(10);
    addBotMessage("Hi there! I'm the Hammer Brick & Home estimator. I can give you an instant cost range for your project.");
    addBotMessage("<strong>Disclaimer:</strong> This is a preliminary estimate based on average costs. The final price requires an on-site walkthrough. Prices are for NYC (Staten Island base) and nearby areas.");

    addChoices(["I understand, let's proceed"], presentServiceOptions);
  }

  function presentServiceOptions(data) {
    updateProgress(20);
    addBotMessage("Great! What type of work are you looking to get an estimate for today? You can choose one or multiple projects.");

    const servicesList = Object.keys(SERVICES).map(key => ({
      label: `${SERVICES[key].emoji} ${SERVICES[key].label}`,
      key: key
    }));

    addChoices(servicesList, function(selection) {
      state.serviceKey = selection.key;
      // Reset state for the new project
      resetProjectState();
      state.serviceKey = selection.key; // Set it again after reset
      state.step = 2;
      stepTwo_SubQuestions();
    });
  }

  function stepTwo_SubQuestions() {
    const svc = SERVICES[state.serviceKey];
    updateProgress(30);

    // Skip to next step if no sub-options or if it's a 'consult' job
    if (!svc.options || svc.unit === "consult") {
      state.subOption = { label: "Standard Scope", factor: 1.0, fixedLow: svc.baseLow, fixedHigh: svc.baseHigh };
      return stepThree_Location();
    }

    addBotMessage(`You chose **${svc.label}**. Now, please tell us: **${svc.subQuestion}**`);

    const subOptionsList = svc.options.map((opt, index) => ({
      label: opt.label,
      key: index,
      optionData: opt
    }));

    addChoices(subOptionsList, function(selection) {
      state.subOption = selection.optionData;
      state.step = 3;
      stepThree_Location();
    });
  }

  function stepThree_Location() {
    updateProgress(40);
    addBotMessage("Which borough/area is the project located in?");

    const locations = Object.keys(BOROUGH_MODS).map(borough => ({
      label: `${borough} (Modifier: ${Math.round((BOROUGH_MODS[borough] - 1) * 100)}%)`,
      key: borough
    }));

    addChoices(locations, function(selection) {
      state.borough = selection.key;
      state.step = 4;
      stepFour_LeadCheck();
    });
  }

  function stepFour_LeadCheck() {
    const svc = SERVICES[state.serviceKey];
    updateProgress(50);

    // If it's a consult job, skip size input and go straight to Add-ons (the next step)
    if (svc.unit === "consult") {
      return stepFive_SizeInput();
    }

    if (svc.leadSensitive && state.borough === "Manhattan") {
      addBotMessage("Since this is a Lead-Sensitive project in Manhattan, is the building pre-1978?");
      addChoices(["Yes, Pre-1978", "No, Built Post-1978"], function(choice) {
        const val = (typeof choice === "string") ? choice : choice.label;
        state.isLeadHome = val.indexOf("Yes") !== -1;
        stepFive_SizeInput();
      });
    } else {
      stepFive_SizeInput();
    }
  }

  function stepFive_SizeInput() {
    updateProgress(60);
    const svc = SERVICES[state.serviceKey];
    let unit = svc.unit;
    let min = svc.min;
    let prompt = "";

    // Check if the current sub-option overrides the unit to sq ft (e.g., sidewalk pavers)
    if (state.subOption && state.subOption.isPerSqFt) {
      unit = "sq ft";
      min = null; // Don't enforce minimum on sub-options usually
    }

    if (unit === "fixed") {
      // Fixed price jobs (kitchen/bath/windows/doors) skip size/unit questions
      return stepSix_Addons(); // GO TO NEW ADD-ONS STEP
    } else {
      prompt = `About how many **${unit}** is the project area? (e.g., 500)`;
      if (min) prompt += `<br><span style="font-size:12px;color:#aaa;">*Minimum project size is typically around ${min} ${unit} for this type of work.</span>`;

      addBotMessage(prompt, true);
      enableInput(function(answer) {
        const size = parseFloat(answer.replace(/[^\d.]/g, ''));
        if (isNaN(size) || size <= 0) {
          addBotMessage("That doesn't look like a valid size. Please enter a number for the size in " + unit + ".");
          stepFive_SizeInput(); // Loop back
        } else {
          state.size = size;
          stepSix_Addons(); // GO TO NEW ADD-ONS STEP
        }
      });
    }
  }


  // --- NEW STEP: SMART ADD-ONS -----------------------------
  function stepSix_Addons() {
    updateProgress(70);
    const svcKey = state.serviceKey;
    const addonConfig = SMART_ADDONS_CONFIG[svcKey];

    if (!addonConfig) {
      // If no add-ons are configured for this service, skip this step
      addBotMessage("Understood. We'll stick to the base scope for this project.");
      return stepSeven_PricingMode();
    }

    addBotMessage(`We can now add some **Smart Add-ons** for your ${addonConfig.title} project. Are you interested in any upgrades?`);

    const choices = [];
    const groups = addonConfig.groups;
    
    // Pull 2 choices from Luxury and 2 from Protection for simple chip selection
    if (groups.luxury) {
      groups.luxury.slice(0, 2).forEach((item, index) => {
        const key = `luxury:${index}`;
        choices.push({
          label: `✨ ${item.label} (Luxury)`,
          key: key,
          fullItem: item
        });
      });
    }

    if (groups.protection) {
      groups.protection.slice(0, 2).forEach((item, index) => {
        const key = `protection:${index}`;
        choices.push({
          label: `🛡️ ${item.label} (Protection)`,
          key: key,
          fullItem: item
        });
      });
    }

    // Add a default debris removal option if it wasn't already in the list
    if (svcKey !== "demo" && svcKey !== "roofing") {
      choices.push({
        label: "🗑️ Debris Removal & Haul-Away",
        key: "fixed:debrisRemoval",
        fullItem: { label: "Debris Removal & Haul-Away", low: 800, high: 1500, note: "Standard cost for dumpster and haul-away." }
      });
    }

    choices.push({ label: "None, continue to next step", key: "none" });


    addChoices(choices, function(selection) {
      if (selection.key === "none") {
        state.selectedAddons = [];
      } else {
        // Store the full add-on object in the state
        const item = selection.fullItem;
        item.key = selection.key; // Store the unique key for lookup later
        // Note: For simplicity in the chat flow, we only allow one add-on selection here.
        state.selectedAddons = [item]; 
        addBotMessage(`✅ Adding **${item.label}** to your project estimate.`);
      }

      // Proceed to the next step (Pricing Mode)
      stepSeven_PricingMode();
    });
  }
  
  // --- END NEW STEP --------------------------------------------


  function stepSeven_PricingMode() {
    updateProgress(80);
    addBotMessage("How would you like the price estimated?");

    const choices = [
      { label: "Full Service (Labor + Materials)", key: "full" },
      { label: "Labor Only (I supply materials)", key: "labor" },
      { label: "Materials Only (I supply labor)", key: "materials" }
    ];

    addChoices(choices, function(selection) {
      state.pricingMode = selection.key;
      state.step = 8;
      stepEight_Rush();
    });
  }

  function stepEight_Rush() {
    addBotMessage("Is this a rush job requiring immediate start or guaranteed fast completion?");

    addChoices(["Yes, Rush Job", "No, Standard Scheduling"], function(selection) {
      state.isRush = selection.label.includes("Yes");
      state.step = 9;
      stepNine_Promo();
    });
  }

  function stepNine_Promo() {
    updateProgress(90);
    addBotMessage("Do you have a special promo code? (e.g., VIP10) If not, click 'No Promo'.");

    addChoices(["Enter Promo Code", "No Promo"], function(selection) {
      if (selection.label.includes("No Promo")) {
        state.promoCode = "";
        state.step = 10;
        showEstimateAndAskAnother();
      } else {
        addBotMessage("Please enter your promo code:", true);
        enableInput(function(code) {
          state.promoCode = code.toUpperCase();
          state.step = 10;
          showEstimateAndAskAnother();
        });
      }
    });
  }


  // --- ESTIMATE COMPUTATION ----------------------

  /* Helper to compute add-on total from the state */
  function computeSelectedAddonsTotal(addons, serviceKey) {
    let low = 0;
    let high = 0;

    addons.forEach(addon => {
      // Since we stored the fullItem, we just use its low/high.
      if (addon.low && addon.high) {
        low += addon.low;
        high += addon.high;
      }
    });

    return { low, high };
  }

  /* Helper to generate detailed HTML for selected add-ons */
  function computeSelectedAddonsBreakdown(addons) {
    let html = "";
    addons.forEach(item => {
      if (item.label && item.low && item.high) {
        html += `
          <div class="hb-receipt-row addon-detail" style="font-size:12px;color:#ccc;margin-left:15px;">
            <span>${item.label}:</span>
            <span style="font-weight:700;">${formatMoney(item.low)} – ${formatMoney(item.high)}</span>
          </div>
        `;
      }
    });
    return html;
  }

  function computeEstimateForCurrent() {
    var svc = SERVICES[state.serviceKey];
    if (!svc) return null;

    var sub = state.subOption || {};
    var mod = BOROUGH_MODS[state.borough] || 1.0;
    var low = 0;
    var high = 0;
    var addonCosts = { low: 0, high: 0 }; // Initialize addonCosts

    // Custom/consult jobs: no auto price
    if (state.serviceKey === "other" || svc.unit === "consult") {
      return {
        svc: svc, sub: sub, borough: state.borough, size: null, isLeadHome: state.isLeadHome,
        pricingMode: state.pricingMode, isRush: state.isRush, promoCode: state.promoCode,
        low: 0, high: 0, discountRate: 0,
        selectedAddons: state.selectedAddons, // Include add-ons even if no price
        addonCosts: addonCosts
      };
    }

    // 1. BASE PRICE CALCULATION
    if (svc.unit === "fixed") {
      // Fixed price (kitchen, bath, windows, doors)
      // Check for isPerSqFt override (e.g., sidewalk pavers)
      if (sub.isPerSqFt && state.size > 0) {
        low = sub.fixedLow * state.size;
        high = sub.fixedHigh * state.size;
      } else {
        low = sub.fixedLow;
        high = sub.fixedHigh;
      }
    } else {
      // Per Unit Price (sq ft, linear ft, etc.)
      low = (svc.baseLow * state.size * sub.factor);
      high = (svc.baseHigh * state.size * sub.factor);
    }

    // 2. LEAD SAFETY SURCHARGE
    if (state.isLeadHome) {
      // Surcharge for lead-safe work (e.g., 8-15% on base labor)
      low *= 1.08;
      high *= 1.15;
    }

    // 3. ADD SMART ADD-ONS COST (NEW INTEGRATION)
    if (state.selectedAddons && state.selectedAddons.length > 0) {
      addonCosts = computeSelectedAddonsTotal(state.selectedAddons, state.serviceKey);
      low += addonCosts.low;
      high += addonCosts.high;
    }

    // 4. BOROUGH MODIFIER (applies to total including addons for pricing simplicity)
    low *= mod;
    high *= mod;

    // 5. PRICING MODE ADJUSTMENT (Labor/Materials)
    var factor = 1.0;
    if (state.pricingMode === "labor") {
      factor = 0.7;
    } else if (state.pricingMode === "materials") {
      factor = 0.5;
    }
    low *= factor;
    high *= factor;

    // 6. RUSH SURCHARGE
    if (state.isRush) {
      low *= 1.12;
      high *= 1.18;
    }

    // 7. PROMO DISCOUNT
    var dc = 0;
    if (state.promoCode) {
      var rate = DISCOUNTS[state.promoCode.toUpperCase()];
      if (rate) dc = rate;
    }
    if (dc > 0) {
      low *= (1 - dc);
      high *= (1 - dc);
    }

    return {
      svc: svc, sub: sub, borough: state.borough, size: state.size,
      isLeadHome: state.isLeadHome, pricingMode: state.pricingMode,
      isRush: state.isRush, promoCode: state.promoCode,
      low: low, high: high, discountRate: dc,
      selectedAddons: state.selectedAddons, // Store the selected addons list
      addonCosts: addonCosts // Store the calculated addon cost
    };
  }

  function computeGrandTotal() {
    var totalLow = 0;
    var totalHigh = 0;
    state.projects.forEach(function(p) {
      if (p.low) totalLow += p.low;
      if (p.high) totalHigh += p.high;
    });

    return { totalLow, totalHigh };
  }


  // --- ESTIMATE DISPLAY --------------------------

  function buildEstimateHtml(est) {
    var svc = est.svc;
    var sub = est.sub || {};
    var hasPrice = !!(est.low && est.high);
    var fLow = hasPrice ? Math.round(est.low).toLocaleString() : null;
    var fHigh = hasPrice ? Math.round(est.high).toLocaleString() : null;

    var discountLine = "";
    if (est.discountRate && est.discountRate > 0) {
      discountLine = '<div class="hb-receipt-row"><span>Promo:</span><span>-' + Math.round(est.discountRate * 100) + '% applied</span></div>';
    }

    var rushLine = "";
    if (est.isRush) {
      rushLine = '<div class="hb-receipt-row"><span>Rush:</span><span>Priority Surcharge Applied</span></div>';
    }

    var pricingModeLine = '<div class="hb-receipt-row"><span>Pricing Mode:</span><span>' + (est.pricingMode.charAt(0).toUpperCase() + est.pricingMode.slice(1)) + '</span></div>';

    // NEW: Add-on Cost Summary
    var addonCostLine = "";
    var addonDetailsHtml = "";
    if (est.selectedAddons && est.selectedAddons.length > 0 && est.addonCosts.low > 0) {
      addonCostLine = `<div class="hb-receipt-row" style="margin-top:8px; border-top:1px dashed #333;">
        <span style="font-weight:700;">Smart Add-Ons Total:</span>
        <span style="font-weight:700;">+${formatMoney(est.addonCosts.low)} – ${formatMoney(est.addonCosts.high)}</span>
      </div>`;
      // Use the helper to list the selected add-ons
      addonDetailsHtml = computeSelectedAddonsBreakdown(est.selectedAddons);
    }

    var basePriceLine = "";
    if (svc.unit !== "fixed" || (sub.isPerSqFt && est.size > 0)) {
      basePriceLine = `<div class="hb-receipt-row"><span>Base Unit/Size:</span><span>${est.size.toLocaleString()} ${svc.unit}</span></div>`;
    }


    var html = '<div class="hb-receipt">' +
      '<h4 style="color:var(--hb-chat-gold);">' + svc.emoji + ' ' + svc.label + '</h4>' +
      '<div class="hb-receipt-row"><span>Service Type:</span><span>' + sub.label + '</span></div>' +
      basePriceLine +
      '<div class="hb-receipt-row"><span>Location:</span><span>' + est.borough + '</span></div>' +
      pricingModeLine +
      rushLine +
      discountLine +
      '<div style="border-top:1px solid #333; margin: 10px 0;"></div>' +
      addonCostLine +
      addonDetailsHtml + // Display the detailed list of add-ons
      '<div class="hb-receipt-total">' +
      "<span>Project Estimate:</span>" +
      (hasPrice ? "<span>" + fLow + " – " + fHigh + "</span>" : "<span>Consultation Required</span>") +
      "</div>" +
      '<div class="hb-receipt-disclaimer">' +
      (hasPrice ?
        'This estimate includes all your selections, including any selected add-ons.' :
        'No price is provided for this complex or consultation-only service. We will contact you.'
      ) +
      "</div>" +
      "</div>";

    return html;
  }

  function showEstimateAndAskAnother() {
    const est = computeEstimateForCurrent();
    if (est) {
      state.projects.push(est);
      const estimateHtml = buildEstimateHtml(est);
      
      updateProgress(100);
      addBotMessage("Here is your estimated cost range for Project #" + state.projects.length + ":<br>" + estimateHtml);

      // Reset state for a new potential project
      resetProjectState();

      // Ask for another project
      setTimeout(askAddAnother, 1500);
    } else {
      addBotMessage("I encountered an error calculating the estimate. Let's try to add the final project details.");
      setTimeout(askAddAnother, 1500);
    }
  }

  function askAddAnother() {
    if (state.projects.length >= 3) {
      addBotMessage("You've reached the limit of 3 projects for a single session. Let's wrap up.");
      showCombinedReceiptAndLeadCapture();
      return;
    }
    
    addBotMessage("Would you like to get an estimate for another project now, or are you ready to finalize your request?");
    
    addChoices(["Add Another Project", "Finalize Request"], function(selection) {
      if (selection.label.includes("Add Another")) {
        // Restart the flow for a new project
        presentServiceOptions(null);
      } else {
        // Proceed to lead capture
        showCombinedReceiptAndLeadCapture();
      }
    });
  }

  function showCombinedReceiptAndLeadCapture() {
    updateProgress(100);
    const totals = computeGrandTotal();
    const summaryText = buildSummaryText(state.projects, totals);

    let html = '<div class="hb-receipt-summary">';
    html += '<h4>✨ Grand Total Estimate ✨</h4>';
    if (totals.totalLow && totals.totalHigh) {
      html += '<div class="hb-receipt-grand-total">' + formatMoney(totals.totalLow) + ' – ' + formatMoney(totals.totalHigh) + '</div>';
    } else {
      html += '<div class="hb-receipt-grand-total">Consultation Required</div>';
    }
    html += '<p style="font-size:12px;color:#ccc;margin-top:10px;">This combines all ' + state.projects.length + ' projects you configured.</p>';
    html += '</div>';
    
    addBotMessage(html);

    addBotMessage("To receive your detailed, official quote and to schedule a free walkthrough, please provide your contact info. We will not share your data.");
    
    // Final Input for Name
    addBotMessage("What is your full name?", true);
    enableInput(function(name) {
      state.name = name;
      addUserMessage(name);
      
      // Input for Phone
      addBotMessage("What is your best phone number?", true);
      enableInput(function(phone) {
        state.phone = phone;
        addUserMessage(phone);
        
        // Input for Email
        addBotMessage("What is your email address?", true);
        enableInput(function(email) {
          state.email = email;
          addUserMessage(email);

          // Final question: Financing
          setTimeout(function() {
            addBotMessage("Are you interested in hearing about our **Financing Options** for your project?");
            addChoices(["Yes, I'd like financing info", "No, I'm paying cash"], function(selection) {
              state.financingNeeded = selection.label.includes("Yes");
              
              // Finalize and post data
              addBotMessage("Thank you! Your request is being submitted. We will contact you at " + state.phone + " or " + state.email + " shortly.");
              finalizeSubmission(summaryText);
            });
          }, 500);
        });
      });
    });
  }

  function finalizeSubmission(summaryText) {
    // Collect all data
    const finalData = {
      timestamp: new Date().toISOString(),
      name: state.name,
      phone: state.phone,
      email: state.email,
      financingNeeded: state.financingNeeded,
      borough: state.projects[0].borough, // Use the first project's borough for simplicity
      projects: state.projects,
      summary: summaryText
    };

    console.log("FINAL SUBMISSION DATA:", finalData);

    // If a CRM URL exists, this is where you would post the data via AJAX.
    if (CRM_FORM_URL) {
      // Example AJAX POST (requires jQuery or modern fetch)
      // fetch(CRM_FORM_URL, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(finalData)
      // }).then(response => {
      //   addBotMessage("✅ Your request has been successfully submitted to the team!");
      // }).catch(error => {
      //   console.error("Submission failed:", error);
      //   addBotMessage("❌ Submission failed. Please call us directly or use the contact form.");
      // });
    } else {
      // Fallback for non-live demo or missing CRM integration
      addBotMessage("✅ Submission complete (Data logged to console).");
    }

    // Add call-to-action buttons
    setTimeout(function() {
      addBotMessage("What happens next? We'll review your project details and confirm your free on-site walkthrough appointment.");

      // Contact button
      var contactBtn = document.createElement("a");
      contactBtn.className = "hb-chip";
      contactBtn.style.display = "block";
      contactBtn.style.marginTop = "8px";
      contactBtn.textContent = "📞 Call Hammer Brick & Home Now";
      contactBtn.href = "tel:718-555-HAMR"; // Replace with real number
      els.body.appendChild(contactBtn);

      // Walkthrough button
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

  function buildSummaryText(projects, totals) {
    var lines = [];
    lines.push("--- PROJECT SUMMARY ---");

    projects.forEach(function(p, i) {
      var svc = p.svc;
      var sub = p.sub || {};
      var fLow = Math.round(p.low).toLocaleString();
      var fHigh = Math.round(p.high).toLocaleString();
      var modeLabel = (p.pricingMode === "full") ? "Full Price" : (p.pricingMode.charAt(0).toUpperCase() + p.pricingMode.slice(1));
      var addonSummary = (p.selectedAddons && p.selectedAddons.length > 0) ? `+${p.selectedAddons.length} Add-on(s)` : "No Add-ons";

      lines.push("\n[Project #" + (i + 1) + "]: " + svc.label);
      lines.push("  - Scope: " + sub.label + " | Price: $" + fLow + " – $" + fHigh);

      var extras = [modeLabel, addonSummary]; // ADD ADD-ON SUMMARY

      if (p.isRush) extras.push("Rush");
      if (p.promoCode) {
        var dc_rate = DISCOUNTS[p.promoCode.toUpperCase()];
        var dc_text = dc_rate ? " (" + Math.round(dc_rate * 100) + "% off)" : "";
        extras.push("Promo: " + p.promoCode.toUpperCase() + dc_text);
      }
      if (p.isLeadHome) extras.push("Lead-safe");

      if (extras.length) {
        lines.push("  - Details: [" + extras.join(" | ") + "]");
      }
    });

    // Add combined add-ons and totals
    if (totals.totalLow && totals.totalHigh) {
      lines.push("\nCOMBINED TOTAL ESTIMATE:");
      lines.push("$" + Math.round(totals.totalLow).toLocaleString() + " – $" + Math.round(totals.totalHigh).toLocaleString());
    }

    // Add financing detail
    if (state.projects.some(p => p.financingNeeded)) {
      lines.push("\nFinancing: Customer requested options.");
    }

    return lines.join("\n");
  }


  function resetProjectState() {
    state.serviceKey = null;
    state.subOption = null;
    state.size = 0;
    state.borough = null; // Important: Do NOT reset borough if you want multi-project to use the same location
    state.isLeadHome = false;
    state.pricingMode = "full";
    state.isRush = false;
    state.promoCode = "";
    state.selectedAddons = []; // RESET NEW ADD-ONS
    state.financingNeeded = false;
  }

  // --- UTILS -------------------------------------------------

  function formatMoney(num) {
    return "$" + Math.round(num).toLocaleString("en-US");
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

  function handleManualInput(e) {
    // Listen for 'Enter' key press
    if (e.key === "Enter" && !els.input.disabled) {
      els.send.click();
    }
  }


  // --- STARTUP -----------------------------------------------

  // Run init once the entire page is loaded
  document.addEventListener("DOMContentLoaded", init);

})();
