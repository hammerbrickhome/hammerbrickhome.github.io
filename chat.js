/* ============================================================
   HAMMER BRICK & HOME — ULTRA ADVANCED ESTIMATOR BOT v4.3
   (Smart Add-ons v1 Fully Integrated & Flow Updated)
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

  // --- INIT ---------------------------------------------------

  function init() {
    console.log("HB Chat: Initializing v4.3...");
    createInterface();

    if (sessionStorage.getItem("hb_chat_active") === "true") {
      toggleChat();
    }

    // Kick off conversation with the mandatory disclaimer step (FIXED)
    setTimeout(stepOne_Disclaimer, 800);
  }

  // (createInterface, toggleChat, updateProgress, addBotMessage, addUserMessage, addChoices, handleManualInput,
  // handleYesNo, stepOne_Disclaimer, presentServiceOptions, stepTwo_SubQuestions, stepThree_LeadCheck remain the same)

  // --- STEPS (Flow changes here) --------------------------------
  
  // stepThree_LeadCheck -> calls stepFour_SizeInput or stepFive_Location (now stepFour_Addons)
  function stepThree_LeadCheck() {
    const svc = SERVICES[state.serviceKey];
    updateProgress(50);

    // If it's a consult job, skip size input and go straight to Add-ons (the next step)
    if (svc.unit === "consult") {
      return stepFour_Addons();
    }

    if (svc.leadSensitive && state.borough === "Manhattan") {
      addBotMessage("Since this is a Lead-Sensitive project in Manhattan, is the building pre-1978?");
      addChoices(["Yes, Pre-1978", "No, Built Post-1978"], function(choice) {
        const val = (typeof choice === "string") ? choice : choice.label;
        state.isLeadHome = val.indexOf("Yes") !== -1;
        stepFour_SizeInput();
      });
    } else {
      stepFour_SizeInput();
    }
  }

  // stepFour_SizeInput -> calls stepFour_Addons (NEW)
  function stepFour_SizeInput() {
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
      return stepFour_Addons(); // GO TO NEW ADD-ONS STEP
    } else {
      prompt = `About how many **${unit}** is the project area? (e.g., 500)`;
      if (min) prompt += `<br><span style="font-size:12px;color:#aaa;">*Minimum project size is typically around ${min} ${unit} for this type of work.</span>`;

      addBotMessage(prompt, true);
      enableInput(function(answer) {
        const size = parseFloat(answer.replace(/[^\d.]/g, ''));
        if (isNaN(size) || size <= 0) {
          addBotMessage("That doesn't look like a valid size. Please enter a number for the size in " + unit + ".");
          stepFour_SizeInput(); // Loop back
        } else {
          state.size = size;
          stepFour_Addons(); // GO TO NEW ADD-ONS STEP
        }
      });
    }
  }


  // --- NEW STEP: SMART ADD-ONS -----------------------------
  function stepFour_Addons() {
    updateProgress(70);
    const svcKey = state.serviceKey;
    const addonConfig = SMART_ADDONS_CONFIG[svcKey];

    if (!addonConfig) {
      // If no add-ons are configured for this service, skip this step
      addBotMessage("Understood. We'll stick to the base scope for this project.");
      return stepFive_Location();
    }

    addBotMessage(`We can now add some **Smart Add-ons** for your ${addonConfig.title} project. Are you interested in any upgrades?`);

    const choices = [];
    const groups = addonConfig.groups;
    let count = 0;

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


    choices.push({ label: "None, continue to final estimate", key: "none" });


    addChoices(choices, function(selection) {
      if (selection.key === "none") {
        state.selectedAddons = [];
      } else {
        // Store the full add-on object in the state
        const item = selection.fullItem;
        item.key = selection.key; // Store the unique key for lookup later
        state.selectedAddons = [item]; // Only supporting one selection for chat simplicity
        addBotMessage(`✅ Adding **${item.label}** to your project estimate.`);
      }

      // Proceed to the next step (Location)
      stepFive_Location();
    });
  }


  // stepFive_Location -> stepSix_PricingMode (no change)
  // stepSix_PricingMode -> stepSeven_Rush (no change)
  // stepSeven_Rush -> stepEight_Promo (no change)
  // stepEight_Promo -> stepNine_Estimate (no change)

  // --- ESTIMATE COMPUTATION (UPDATED) ----------------------

  /* Helper to compute add-on total from the state */
  function computeSelectedAddonsTotal(addons, serviceKey) {
    let low = 0;
    let high = 0;

    // Check if the service exists in the config to correctly look up costs
    const cfg = SMART_ADDONS_CONFIG[serviceKey];

    addons.forEach(addon => {
      // For fixed items added in stepFour_Addons (like the debris removal fallback)
      if (addon.low && addon.high) {
        low += addon.low;
        high += addon.high;
        return;
      }

      // Logic to find the addon price if selected from the config (unlikely in this simple flow)
      // Since we stored the fullItem, we just use its low/high.
      if (addon.fullItem && addon.fullItem.low && addon.fullItem.high) {
        low += addon.fullItem.low;
        high += addon.fullItem.high;
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

    // NOTE: The previous debrisRemoval add-on logic is now handled per-project
    // via the new state.selectedAddons array, so this grand total logic is clean.

    return { totalLow, totalHigh };
  }

  // --- ESTIMATE DISPLAY (UPDATED) --------------------------

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

  // (The rest of the display functions (showEstimateAndAskAnother, askAddAnother,
  // showCombinedReceiptAndLeadCapture) remain the same except for the summary text update.)

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
    state.borough = null;
    state.isLeadHome = false;
    state.pricingMode = "full";
    state.isRush = false;
    state.promoCode = "";
    state.selectedAddons = []; // RESET NEW ADD-ONS
    state.financingNeeded = false;
  }

  // --- UTILS (Added SMART ADD-ON Helpers) --------------------

  function formatMoney(num) {
    return "$" + Math.round(num).toLocaleString("en-US");
  }

  // (The rest of the utility functions (enableInput, handleManualInput,
  // addUserMessage, updateInterface) remain the same)


  // --- STARTUP -----------------------------------------------

  // Run init once the entire page is loaded
  init();

})();
