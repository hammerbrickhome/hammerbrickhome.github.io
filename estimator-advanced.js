// Hammer Brick & Home LLC — Estimator Super v4
// Combines:
//  - Original estimator logic
//  - National vs NYC averages
//  - Cost breakdown + complexity score
//  - Confidence meter + sample monthly
//  - Basic / Premium / Luxury bands
//  - Pro Tips per project
//  - PDF-style printable view
//  - Scope of Work + Upsells + Terms in PDF + Email
//  - Smart Add-Ons panel per service (OPTION C)

document.addEventListener("DOMContentLoaded", () => {
  const form        = document.getElementById("est-form");
  if (!form) return;

  // Inject extra styles for advanced UI bits (averages, breakdown, chips, bands, etc.)
  injectEstimatorExtraStyles();

  const serviceEl   = document.getElementById("est-service");
  const boroughEl   = document.getElementById("est-borough");
  const buildingEl  = document.getElementById("est-building");
  const sizeRow     = document.getElementById("est-size-row");
  const sizeLabel   = document.getElementById("est-size-label");
  const sizeInput   = document.getElementById("est-size");
  const scopeRow    = document.getElementById("est-scope-row");
  const scopeSelect = document.getElementById("est-scope");
  const finishEl    = document.getElementById("est-finish");
  const urgencyEl   = document.getElementById("est-urgency");
  const leadRow     = document.getElementById("lead-row");
  const leadEl      = document.getElementById("est-lead");
  const dumpsterEl  = document.getElementById("est-dumpster");
  const demoEl      = document.getElementById("est-demo");
  const permitEl    = document.getElementById("est-permit");
  const resultBox   = document.getElementById("est-result");
  const permitBox   = document.getElementById("permit-helper");
  const regionNoteEl= document.getElementById("region-note");

  // ⭐ SMART ADD-ON CONFIG (OPTION C: dedicated panel that changes by service) ⭐
  const ADDON_CONFIG = {
    "masonry": {
      title: "Popular Masonry / Paver Add-Ons",
      subnote: "Optional upgrades many NYC homeowners add to masonry and paver projects.",
      items: [
        { id:"polymeric-sand", label:"Polymeric sand + joint lock upgrade", low:350, high:850 },
        { id:"paver-seal", label:"Paver sealing (up to ~800 sq ft)", low:450, high:1200 },
        { id:"drainage", label:"Channel drain / extra drainage work", low:900, high:2200 },
        { id:"step-safety", label:"Front steps safety / repair upgrade", low:1800, high:4200 }
      ]
    },
    "driveway": {
      title: "Driveway Add-Ons",
      subnote: "Extras that improve drainage, edging, and long-term performance.",
      items: [
        { id:"edging", label:"Decorative border / soldier course", low:750, high:2500 },
        { id:"extra-drainage", label:"Extra drainage or trench drain at garage", low:1200, high:3200 },
        { id:"heated", label:"Snow-melt / heat prep (where feasible)", low:2500, high:6500 }
      ]
    },
    "roofing": {
      title: "Roofing Protection Add-Ons",
      subnote: "Common upgrades for better protection and ventilation.",
      items: [
        { id:"ice-water", label:"Full ice & water shield upgrade", low:900, high:2600 },
        { id:"ridge-vent", label:"Ridge vent / attic ventilation upgrade", low:750, high:2200 },
        { id:"gutter-upgrade", label:"New gutters / downspouts with roof", low:1500, high:3800 }
      ]
    },
    "bathroom": {
      title: "Bathroom Comfort Add-Ons",
      subnote: "Small upgrades that make the bathroom feel more custom.",
      items: [
        { id:"niches", label:"1–2 built-in shampoo niches", low:450, high:1200 },
        { id:"glass-door", label:"Frameless glass door upgrade", low:1800, high:3200 },
        { id:"heated-floor", label:"Heated floor mat (where feasible)", low:2200, high:4200 },
        { id:"fan-upgrade", label:"Quiet exhaust fan with timer", low:650, high:1400 }
      ]
    },
    "kitchen": {
      title: "Kitchen Add-Ons",
      subnote: "Popular kitchen extras many NYC clients add.",
      items: [
        { id:"under-cabinet", label:"Under-cabinet lighting package", low:950, high:2200 },
        { id:"backsplash", label:"Full-height backsplash upgrade", low:1500, high:4200 },
        { id:"island-electric", label:"Extra island outlets / pendants", low:900, high:2600 }
      ]
    },
    "basement": {
      title: "Basement Finishing Add-Ons",
      subnote: "Extras that improve comfort and moisture control.",
      items: [
        { id:"dehumid", label:"Dedicated dehumidifier with drain", low:950, high:2200 },
        { id:"soundproof-ceiling", label:"Sound-damped ceiling over main area", low:2200, high:5200 },
        { id:"egress", label:"Egress window rough budget (where allowed)", low:4500, high:9500 }
      ]
    },
    "interior-paint": {
      title: "Interior Painting Add-Ons",
      subnote: "Detail work and premium finish options.",
      items: [
        { id:"trim-upgrade", label:"Trim / doors enamel upgrade", low:850, high:2200 },
        { id:"accent-walls", label:"Multiple accent walls / feature color", low:450, high:1200 },
        { id:"ceiling-paint", label:"Ceiling repaint package", low:650, high:1800 }
      ]
    },
    "flooring": {
      title: "Flooring Add-Ons",
      subnote: "Prep and finishing options that affect look and lifespan.",
      items: [
        { id:"demo-disposal", label:"Old flooring demo & disposal", low:1200, high:3200 },
        { id:"stair-upgrade", label:"Stair treads & railing detail work", low:1800, high:4500 }
      ]
    },
    "windows": {
      title: "Window / Door Add-Ons",
      subnote: "Comfort and finish upgrades.",
      items: [
        { id:"interior-trim", label:"New interior casing / trim package", low:1200, high:3200 },
        { id:"laminated-glass", label:"Noise-reducing / laminated glass upgrade", low:1800, high:4200 }
      ]
    },
    "fence": {
      title: "Fence Add-Ons",
      subnote: "Privacy and access upgrades.",
      items: [
        { id:"gates", label:"Extra gate(s) or wider gate upgrade", low:750, high:2200 },
        { id:"privacy-screens", label:"Privacy screens / lattice sections", low:900, high:2600 }
      ]
    },
    "deck": {
      title: "Deck / Patio Add-Ons",
      subnote: "Comfort and safety upgrades.",
      items: [
        { id:"lighting", label:"Stair & railing lighting package", low:900, high:2600 },
        { id:"privacy-wall", label:"Privacy wall / divider", low:2200, high:5200 }
      ]
    },
    "power-wash": {
      title: "Power Washing Add-Ons",
      subnote: "Deep cleaning and protection upgrades.",
      items: [
        { id:"softwash", label:"Soft-wash solution upgrade (roof/siding)", low:450, high:1200 },
        { id:"sealant", label:"Sealer on cleaned concrete/pavers", low:650, high:1800 }
      ]
    },
    "gutters": {
      title: "Gutter Add-Ons",
      subnote: "Common gutter extras.",
      items: [
        { id:"guards", label:"Gutter guards on main runs", low:1200, high:2800 },
        { id:"heat-cables", label:"Heat cables at trouble spots", low:900, high:2600 }
      ]
    },
    "landscaping": {
      title: "Landscaping Add-Ons",
      subnote: "Curb-appeal boosters.",
      items: [
        { id:"mulch-refresh", label:"Mulch / stone bed refresh", low:450, high:1200 },
        { id:"planting", label:"Seasonal planting package", low:650, high:2200 }
      ]
    },
    "smart-home": {
      title: "Smart Home & Lighting Add-Ons",
      subnote: "Extra zones and devices.",
      items: [
        { id:"extra-cameras", label:"Extra camera locations", low:750, high:2200 },
        { id:"smart-dimmers", label:"Smart dimmers in key rooms", low:850, high:2600 }
      ]
    },
    "handyman": {
      title: "Handyman Visit Add-Ons",
      subnote: "Common small extras during a visit.",
      items: [
        { id:"small-paint", label:"Small paint touchups (1–2 rooms)", low:250, high:550 },
        { id:"caulking", label:"Caulk & weatherstrip package", low:220, high:480 }
      ]
    }
  };

  // Add-on panel DOM
  const addonsPanel = document.getElementById("est-addons-panel");
  let extraAddonsValue = 0; // running total from selected smart add-ons (average of low/high)

  // Brand elements
  const brandRow    = document.getElementById("brand-row");
  const brandSelect = document.getElementById("est-brand");
  const brandLabel  = document.getElementById("est-brand-label");

  // Advanced groups
  const advMasonry  = document.getElementById("adv-masonry");
  const advRoof     = document.getElementById("adv-roof");
  const advSiding   = document.getElementById("adv-siding");
  const advWindows  = document.getElementById("adv-windows");
  const advStyle    = document.getElementById("adv-style");

  const masonryFocusEl  = document.getElementById("masonry-focus");
  const driveExistingEl = document.getElementById("drive-existing");
  const driveRemoveEl   = document.getElementById("drive-remove");
  const driveAccessEl   = document.getElementById("drive-access");

  const roofTearoffEl = document.getElementById("roof-tearoff");
  const roofPitchEl   = document.getElementById("roof-pitch");
  const roofHeightEl  = document.getElementById("roof-height");

  const sidingRemoveEl  = document.getElementById("siding-remove");
  const sidingStoriesEl = document.getElementById("siding-stories");

  const windowCountEl  = document.getElementById("window-count");
  const doorCountEl    = document.getElementById("door-count");

  const designStyleEl  = document.getElementById("design-style");

  // ==========================
  // CORE CONFIG (SERVICES)
  // ==========================
  const SERVICE_CONFIG = {
    "masonry": {
      mode: "area",
      label: "Approx. masonry / paver area (sq. ft.)",
      minArea: 80,
      maxArea: 4000,
      perSqLow: 16,
      perSqHigh: 28,
      minLow: 2500,
      minHigh: 6500,
      leadSensitive: false,
      permit: "maybe"
    },
    "driveway": {
      mode: "area",
      label: "Driveway / parking area (sq. ft.)",
      minArea: 250,
      maxArea: 5000,
      perSqLow: 8,
      perSqHigh: 20,
      minLow: 3500,
      minHigh: 15000,
      leadSensitive: false,
      permit: "maybe"
    },
    "roofing": {
      mode: "area",
      label: "Roof area (sq. ft. of deck)",
      minArea: 700,
      maxArea: 5000,
      perSqLow: 3.75,
      perSqHigh: 9.5,
      minLow: 6500,
      minHigh: 22000,
      leadSensitive: false,
      permit: "likely"
    },
    "siding": {
      mode: "area",
      label: "Wall area to side (sq. ft.)",
      minArea: 600,
      maxArea: 4500,
      perSqLow: 5,
      perSqHigh: 12,
      minLow: 6500,
      minHigh: 28000,
      leadSensitive: true,
      permit: "likely"
    },
    "windows": {
      mode: "area",
      label: "Total openings (windows + doors count)",
      minArea: 3,
      maxArea: 40,
      perSqLow: 750,
      perSqHigh: 1600,
      minLow: 5000,
      minHigh: 45000,
      leadSensitive: true,
      permit: "maybe"
    },
    "exterior-paint": {
      mode: "area",
      label: "Approx. exterior wall area (sq. ft.)",
      minArea: 400,
      maxArea: 5000,
      perSqLow: 2.5,
      perSqHigh: 6.5,
      minLow: 2800,
      minHigh: 10000,
      leadSensitive: true,
      permit: "maybe"
    },
    "deck": {
      mode: "area",
      label: "Approx. deck / patio area (sq. ft.)",
      minArea: 120,
      maxArea: 1500,
      perSqLow: 28,
      perSqHigh: 60,
      minLow: 6000,
      minHigh: 26000,
      leadSensitive: false,
      permit: "likely"
    },
    "fence": {
      mode: "scope",
      leadSensitive: false,
      permit: "maybe",
      scopes: {
        "yard": {
          label: "Standard run (approx. 50–120 ft)",
          low: 3000,
          high: 6500
        },
        "corner": {
          label: "Corner / larger yard (120–220 ft)",
          low: 6500,
          high: 12000
        },
        "premium": {
          label: "Premium/custom fence or multiple gates",
          low: 12000,
          high: 20000
        }
      }
    },
    "waterproofing": {
      mode: "area",
      label: "Approx. basement / wall area (sq. ft.)",
      minArea: 200,
      maxArea: 2000,
      perSqLow: 18,
      perSqHigh: 40,
      minLow: 3800,
      minHigh: 22000,
      leadSensitive: true,
      permit: "likely"
    },
    "power-wash": {
      mode: "area",
      label: "Approx. area to wash (sq. ft.)",
      minArea: 400,
      maxArea: 6000,
      perSqLow: 0.5,
      perSqHigh: 1.6,
      minLow: 300,
      minHigh: 2500,
      leadSensitive: false,
      permit: "none"
    },
    "landscaping": {
      mode: "scope",
      leadSensitive: false,
      permit: "none",
      scopes: {
        "basic": {
          label: "Basic monthly care (lawn, trim, light cleanup)",
          low: 180,
          high: 450
        },
        "seasonal": {
          label: "Spring / Fall cleanup bundle",
          low: 650,
          high: 1800
        },
        "upgrade": {
          label: "Landscape upgrade (beds, plants, small hardscape)",
          low: 2500,
          high: 9000
        }
      }
    },
    "exterior-lighting": {
      mode: "scope",
      leadSensitive: false,
      permit: "maybe",
      scopes: {
        "basic": {
          label: "Basic package (3–6 fixtures, simple controls)",
          low: 1500,
          high: 3500
        },
        "standard": {
          label: "Full front package (6–12 fixtures, timer/smart)",
          low: 3500,
          high: 7500
        },
        "premium": {
          label: "Whole-property or high-end system",
          low: 7500,
          high: 16000
        }
      }
    },
    "sidewalk": {
      mode: "area",
      label: "Sidewalk / DOT concrete area (sq. ft.)",
      minArea: 80,
      maxArea: 800,
      perSqLow: 18,
      perSqHigh: 35,
      minLow: 4500,
      minHigh: 18000,
      leadSensitive: false,
      permit: "likely"
    },
    "gutters": {
      mode: "scope",
      leadSensitive: false,
      permit: "none",
      scopes: {
        "clean": {
          label: "Cleanout / minor repair",
          low: 250,
          high: 700
        },
        "replace": {
          label: "Standard replacement (typical home)",
          low: 1500,
          high: 3500
        },
        "guards": {
          label: "Install gutter guards (with minor repairs)",
          low: 1500,
          high: 3800
        }
      }
    },
    "interior-paint": {
      mode: "area",
      label: "Approx. interior floor area (sq. ft.)",
      minArea: 250,
      maxArea: 4000,
      perSqLow: 1.5,
      perSqHigh: 3.5,
      minLow: 1800,
      minHigh: 9000,
      leadSensitive: true,
      permit: "none"
    },
    "flooring": {
      mode: "area",
      label: "Floor area (sq. ft.)",
      minArea: 200,
      maxArea: 3000,
      perSqLow: 4,
      perSqHigh: 14,
      minLow: 2500,
      minHigh: 26000,
      leadSensitive: false,
      permit: "none"
    },
    "drywall": {
      mode: "area",
      label: "Wall / ceiling surface area (sq. ft.)",
      minArea: 200,
      maxArea: 4000,
      perSqLow: 2.75,
      perSqHigh: 7.5,
      minLow: 2000,
      minHigh: 18000,
      leadSensitive: true,
      permit: "maybe"
    },
    "interior-doors": {
      mode: "area",
      label: "Number of doors to replace",
      minArea: 2,
      maxArea: 20,
      perSqLow: 300,
      perSqHigh: 900,
      minLow: 600,
      minHigh: 12000,
      leadSensitive: false,
      permit: "none"
    },
    "closets": {
      mode: "scope",
      leadSensitive: false,
      permit: "none",
      scopes: {
        "simple": {
          label: "Simple reach-in or small closet",
          low: 1500,
          high: 3500
        },
        "walkin": {
          label: "Standard walk-in layout",
          low: 3500,
          high: 7800
        },
        "premium": {
          label: "Custom built-ins / dressing room",
          low: 7800,
          high: 15000
        }
      }
    },
    "interior-lighting": {
      mode: "scope",
      leadSensitive: false,
      permit: "maybe",
      scopes: {
        "room": {
          label: "Single room upgrade (recessed / fixture)",
          low: 1500,
          high: 3000
        },
        "multi": {
          label: "Multiple rooms / small apartment",
          low: 3000,
          high: 6500
        },
        "whole": {
          label: "Whole-home smart lighting package",
          low: 6500,
          high: 18000
        }
      }
    },
    "bathroom": {
      mode: "scope",
      leadSensitive: true,
      permit: "likely",
      scopes: {
        "refresh": {
          label: "Light refresh (keep layout & most fixtures)",
          low: 9000,
          high: 16000
        },
        "mid": {
          label: "Mid-level remodel (tile + fixtures upgrade)",
          low: 16000,
          high: 28000
        },
        "gut": {
          label: "Full gut with higher-end finishes",
          low: 28000,
          high: 45000
        }
      }
    },
    "kitchen": {
      mode: "scope",
      leadSensitive: true,
      permit: "likely",
      scopes: {
        "refresh": {
          label: "Cosmetic refresh (paint, backsplash, hardware)",
          low: 16000,
          high: 28000
        },
        "mid": {
          label: "Mid-level remodel (cabinets + surfaces)",
          low: 28000,
          high: 55000
        },
        "gut": {
          label: "Full gut / higher-end kitchen",
          low: 55000,
          high: 90000
        }
      }
    },
    "basement": {
      mode: "area",
      label: "Approx. finished basement area (sq. ft.)",
      minArea: 400,
      maxArea: 2000,
      perSqLow: 35,
      perSqHigh: 85,
      minLow: 22000,
      minHigh: 65000,
      leadSensitive: true,
      permit: "likely"
    },
    "garage-conversion": {
      mode: "scope",
      leadSensitive: true,
      permit: "likely",
      scopes: {
        "basic": {
          label: "Basic insulated studio / office conversion",
          low: 18000,
          high: 35000
        },
        "enhanced": {
          label: "Enhanced conversion (bath / kitchenette)",
          low: 35000,
          high: 65000
        }
      }
    },
    "epoxy-garage": {
      mode: "area",
      label: "Garage floor area (sq. ft.)",
      minArea: 250,
      maxArea: 1500,
      perSqLow: 4.25,
      perSqHigh: 9.5,
      minLow: 1800,
      minHigh: 9000,
      leadSensitive: false,
      permit: "none"
    },
    "smart-home": {
      mode: "scope",
      leadSensitive: false,
      permit: "maybe",
      scopes: {
        "basic": {
          label: "Doorbell / a few cameras / smart lock",
          low: 1500,
          high: 3000
        },
        "standard": {
          label: "Full-floor or small home package",
          low: 3000,
          high: 6500
        },
        "premium": {
          label: "Whole-home integrated smart system",
          low: 6500,
          high: 15000
        }
      }
    },
    "handyman": {
      mode: "scope",
      leadSensitive: false,
      permit: "none",
      scopes: {
        "small": {
          label: "Small visit (up to 2 hours)",
          low: 250,
          high: 450
        },
        "halfday": {
          label: "Half day (up to 4 hours)",
          low: 450,
          high: 700
        },
        "fullday": {
          label: "Full day (up to 8 hours)",
          low: 700,
          high: 1000
        }
      }
    },
    "soundproofing": {
      mode: "area",
      label: "Approx. wall/ceiling area to soundproof (sq. ft.)",
      minArea: 150,
      maxArea: 2000,
      perSqLow: 12,
      perSqHigh: 28,
      minLow: 3000,
      minHigh: 15000,
      leadSensitive: true,
      permit: "maybe"
    },
    "moisture-control": {
      mode: "area",
      label: "Approx. treated area (sq. ft.)",
      minArea: 150,
      maxArea: 2000,
      perSqLow: 8,
      perSqHigh: 22,
      minLow: 2500,
      minHigh: 15000,
      leadSensitive: true,
      permit: "maybe"
    }
  };

  const BOROUGH_FACTOR = {
    "staten-island": 1.00,
    "brooklyn": 1.08,
    "queens": 1.05,
    "bronx": 1.03,
    "manhattan": 1.18,
    "nj": 0.96,
    "outside": 1.00
  };

  const BUILDING_FACTOR = {
    "house": 1.00,
    "small-multi": 1.08,
    "coop-condo": 1.15,
    "mixed": 1.20
  };

  const FINISH_FACTOR = {
    "standard": 1.00,
    "premium": 1.15,
    "luxury": 1.32
  };

  const FINISH_LABEL = {
    "standard": "Standard",
    "premium": "Premium",
    "luxury": "Luxury"
  };

  const URGENCY_FACTOR = {
    "flex": 1.00,
    "soon": 1.07,
    "rush": 1.15
  };

  const URGENCY_LABEL = {
    "flex": "Flexible (2–3+ months)",
    "soon": "Soon (4–8 weeks)",
    "rush": "Rush (< 4 weeks)"
  };

  const SERVICE_LABEL = {
    "masonry": "Masonry · Pavers · Concrete",
    "driveway": "Driveway / Parking Area",
    "roofing": "Roofing – Shingle / Flat",
    "siding": "Siding – Exterior",
    "windows": "Windows & Exterior Doors",
    "exterior-paint": "Exterior Facade / Painting",
    "deck": "Deck / Patio Build or Rebuild",
    "fence": "Fence Install / Replacement",
    "waterproofing": "Waterproofing & Foundation Sealing",
    "power-wash": "Power Washing / Soft Washing",
    "landscaping": "Landscaping & Seasonal Care",
    "exterior-lighting": "Exterior Lighting & Smart Security",
    "sidewalk": "Sidewalk / DOT Concrete Repair",
    "gutters": "Gutter Install / Repair",
    "interior-paint": "Interior Painting",
    "flooring": "Flooring (LVP / Tile / Hardwood)",
    "drywall": "Drywall / Plaster / Skim Coat",
    "interior-doors": "Interior Doors & Trim",
    "closets": "Closet / Storage Buildouts",
    "interior-lighting": "Interior Electrical / Smart Lighting",
    "bathroom": "Bathroom Remodel",
    "kitchen": "Kitchen Remodel",
    "basement": "Basement Finishing",
    "garage-conversion": "Garage Conversion / Remodel",
    "epoxy-garage": "Epoxy Garage Floor",
    "smart-home": "Smart Home Upgrades (Ring / Nest / Cameras)",
    "handyman": "Small Repairs / Handyman Visit",
    "soundproofing": "Soundproofing",
    "moisture-control": "Mold / Moisture Prevention (non-remediation)"
  };

  // Brand config (extended)
  const BRAND_CONFIG = {
    // ... (rest of BRAND_CONFIG & SOW_CONFIG continues here in Part 2)


        "windows": {
      label: "Preferred Window / Door Brand",
      budget: [
        "Alside",
        "Revere",
        "Ideal",
        "American Craftsman (Home Depot)",
        "JELD-WEN (Home Depot)",
        "ReliaBilt (Lowe's)",
        "MI Windows",
        "Silver Line"
      ],
      standard: [
        "Pella 250",
        "Andersen 100",
        "JELD-WEN Premium",
        "Pella Lifestyle (Lowe's)",
        "Harvey Classic",
        "Okna 400"
      ],
      luxury: [
        "Andersen 400 / A-Series",
        "Marvin Elevate / Ultimate",
        "Pella Architect",
        "Marvin Signature",
        "Kolbe Ultra Series"
      ]
    },
    "roofing": {
      label: "Preferred Roofing Line",
      budget: [
        "IKO Cambridge",
        "GAF Royal Sovereign (Home Depot)",
        "Owens Corning Supreme (Lowe's)",
        "TAMKO Heritage",
        "BP Mystique"
      ],
      standard: [
        "CertainTeed Landmark",
        "Owens Corning Oakridge (Lowe's)",
        "GAF Timberline NS (Home Depot)",
        "Tamko Elite",
        "GAF Timberline HDZ"
      ],
      luxury: [
        "CertainTeed Landmark Pro",
        "Owens Corning Duration",
        "GAF Timberline UHDZ",
        "CertainTeed Grand Manor",
        "DaVinci Synthetic Slate"
      ]
    },
    "siding": {
      label: "Preferred Siding Brand",
      budget: [
        "Alside Vinyl",
        "Royal Vinyl",
        "Georgia-Pacific Vinyl (Home Depot)",
        "Everlast (Lowe's)",
        "Mastic Ovation"
      ],
      standard: [
        "CertainTeed Monogram",
        "Mastic Quest",
        "Ply Gem",
        "Norandex",
        "Royal Haven"
      ],
      luxury: [
        "James Hardie Fiber Cement",
        "CertainTeed Cedar Impressions",
        "LP SmartSide",
        "AZEK Cladding"
      ]
    },
    "flooring": {
      label: "Preferred Flooring Brand",
      budget: [
        "MSI",
        "Pergo (Home Depot)",
        "TrafficMaster (Home Depot)",
        "Style Selections (Lowe's)",
        "LifeProof Basic (Home Depot)"
      ],
      standard: [
        "Armstrong",
        "LifeProof Premium (Home Depot)",
        "Home Decorators Collection (Home Depot)",
        "Shaw (Lowe's)",
        "Mohawk RevWood"
      ],
      luxury: [
        "Mohawk Hardwood",
        "Shaw Epic Plus",
        "Cali Bamboo",
        "Bruce Solid Hardwood",
        "Mirage Hardwood"
      ]
    },
    "interior-paint": {
      label: "Preferred Paint Line",
      budget: [
        "Behr Premium Plus (Home Depot)",
        "Glidden Essentials (Home Depot)",
        "Valspar 2000 (Lowe's)",
        "PPG Speedhide"
      ],
      standard: [
        "Sherwin-Williams SuperPaint",
        "Behr Ultra (Home Depot)",
        "HGTV Home by Sherwin-Williams (Lowe's)",
        "Benjamin Moore Regal Select"
      ],
      luxury: [
        "Benjamin Moore Aura",
        "Sherwin-Williams Emerald",
        "Fine Paints of Europe"
      ]
    },
    "kitchen": {
      label: "Preferred Cabinet / Kitchen Line",
      budget: [
        "IKEA SEKTION",
        "Stock / Builder Grade",
        "Hampton Bay (Home Depot)",
        "Project Source (Lowe's)",
        "RTA Cabinets (Online)"
      ],
      standard: [
        "Fabuwood",
        "Wolf Classic",
        "Thomasville (Home Depot)",
        "Diamond NOW (Lowe's)",
        "Forevermark Cabinetry"
      ],
      luxury: [
        "KraftMaid",
        "Custom Millwork",
        "Omega",
        "Starmark",
        "Plain & Fancy"
      ]
    },
    "bathroom": {
      label: "Preferred Bath Fixture / Line",
      budget: [
        "Standard / Builder Grade",
        "Glacier Bay (Home Depot)",
        "Project Source (Lowe's)",
        "Delta Classic"
      ],
      standard: [
        "Delta",
        "Kohler",
        "Moen",
        "American Standard"
      ],
      luxury: [
        "Hansgrohe",
        "DXV / Luxury Collections",
        "Brizo",
        "Graff"
      ]
    },
    "deck": {
      label: "Deck / Railing Brand Preference",
      budget: [
        "Standard Pressure-Treated Lumber",
        "Severe Weather (Lowe's)",
        "YellaWood",
        "Grip-Rite PT"
      ],
      standard: [
        "Trex Enhance",
        "Fiberon Good Life (Home Depot)",
        "TimberTech Edge",
        "Deckorators Vista"
      ],
      luxury: [
        "Trex Transcend",
        "TimberTech AZEK",
        "Fiberon Paramount",
        "Ipe / Exotic Hardwood"
      ]
    },
    "epoxy-garage": {
      label: "Epoxy System Level",
      budget: [
        "Standard Epoxy",
        "Rust-Oleum EpoxyShield (Home Depot)",
        "Quikrete Epoxy (Lowe's)"
      ],
      standard: [
        "Flake Epoxy System",
        "Polycuramine Kits",
        "Urethane Topcoat System"
      ],
      luxury: [
        "High-Build Polyaspartic System",
        "Professional 2-Part Polyurea",
        "Quartz Broadcast System"
      ]
    },
    "masonry": {
      label: "Preferred Masonry / Paver Brand",
      budget: [
        "Sakrete / Quikrete",
        "Generic Concrete Pavers",
        "Standard Brick"
      ],
      standard: [
        "Cambridge Pavingstones",
        "Techo-Bloc",
        "Nicolock"
      ],
      luxury: [
        "Bluestone",
        "Natural Granite / Limestone",
        "Custom Imported Stone"
      ]
    },
    "driveway": {
      label: "Preferred Driveway System",
      budget: [
        "Standard Concrete",
        "Asphalt (Basic)"
      ],
      standard: [
        "Stamped Concrete",
        "Paver Driveway (Cambridge, Nicolock)"
      ],
      luxury: [
        "Natural Stone Driveway",
        "Heated Driveway System"
      ]
    },
    "power-wash": {
      label: "Preferred Cleaning Level",
      budget: [
        "Standard Detergent",
        "Basic Wash Only"
      ],
      standard: [
        "Premium House Wash Mix",
        "Concrete / Paver Cleaner"
      ],
      luxury: [
        "Full Restoration Package",
        "Sealing + Soft-Wash"
      ]
    }
  };

  // Scenario bands: Basic / Premium / Luxury
  const SCENARIO_CONFIG = {
    basic:  { label: "Basic",   factor: 0.90, desc: "Tighter budget, more standard selections." },
    premium:{ label: "Premium", factor: 1.00, desc: "Balanced mix of quality and value." },
    luxury: { label: "Luxury",  factor: 1.25, desc: "Higher-end finishes and options." }
  };

  // ==========================
  // SCOPE OF WORK + UPSELLS CONFIG
  // ==========================
  const SOW_CONFIG = {
    "masonry": {
      title: "Scope of Work – Masonry · Pavers · Concrete",
      bullets: [
        "Review site, elevations, and water flow to confirm pitch and drainage.",
        "Excavate and dispose of existing material in work area as noted in scope.",
        "Install compacted aggregate base, bedding layer, and reinforcement (if required).",
        "Set pavers/stone/concrete to agreed pattern, joints, and border details.",
        "Tool joints, wash down surfaces, and leave work area broom-clean."
      ]
    },
    "driveway": {
      title: "Scope of Work – Driveway / Parking Area",
      bullets: [
        "Confirm layout, vehicle load, and drainage/curb transitions.",
        "Demo and cart away existing surface as included in this estimate.",
        "Install compacted base, forms/edge restraint, and reinforcement (if applicable).",
        "Place and finish concrete/asphalt/pavers to agreed thickness and pattern.",
        "Final cleanup of driveway and adjacent walkways."
      ]
    },
    "roofing": {
      title: "Scope of Work – Roofing",
      bullets: [
        "Protect landscaping, siding, and walkways around the home.",
        "Remove roofing layers as listed in the estimate and inspect deck.",
        "Install underlayment, flashings, and ventilation per manufacturer standards.",
        "Install selected shingle/roof system and accessories.",
        "Clean roof, gutters, and grounds of roofing debris and fasteners."
      ]
    },
    "siding": {
      title: "Scope of Work – Siding",
      bullets: [
        "Confirm wall areas, trim details, and any framing repair needs.",
        "Remove existing siding materials as specified.",
        "Install approved housewrap or weather-resistive barrier.",
        "Install new siding, trims, and accessories per manufacturer guidelines.",
        "Seal, caulk, and clean up siding work area."
      ]
    },
    "windows": {
      title: "Scope of Work – Windows & Exterior Doors",
      bullets: [
        "Verify window/door counts, swing, clearances, and safety egress where applicable.",
        "Protect interior/exterior finishes around work areas.",
        "Remove existing units, install new windows/doors plumb, level, and square.",
        "Insulate, flash, and seal per manufacturer guidelines.",
        "Install interior/exterior trim as applicable and clean glass/frames."
      ]
    },
    "exterior-paint": {
      title: "Scope of Work – Exterior Painting / Facade",
      bullets: [
        "Wash, scrape, and sand loose or failing paint in work areas.",
        "Spot prime bare or repaired substrates with appropriate primer.",
        "Apply specified number of finish coats to siding, trims, and details.",
        "Protect roofing, windows, doors, and landscaping during work.",
        "Remove masking, clean up, and provide basic touch-up kit on request."
      ]
    },
    "deck": {
      title: "Scope of Work – Deck / Patio Build or Rebuild",
      bullets: [
        "Confirm layout, elevation, stairs, and railing locations.",
        "Install footings and framing per code and approved layout.",
        "Install decking boards and rail system as specified.",
        "Install any trims, fascia, and stair details included in scope.",
        "Clean work area and remove construction debris."
      ]
    },
    "fence": {
      title: "Scope of Work – Fence Install / Replacement",
      bullets: [
        "Verify fence line, property markers, and gate locations with homeowner.",
        "Remove and dispose of existing fence materials as included in scope.",
        "Install posts in concrete or per fence system guidelines.",
        "Install rails, panels, and gates with hardware and latches.",
        "Clean up site and remove excess materials."
      ]
    },
    // ... (SOW_CONFIG continues for all services, unchanged from your file)
    // (bathroom, kitchen, basement, etc.)
  };

  const UPSELL_CONFIG = {
    "masonry": {
      title: "Popular Upgrades for Masonry Projects",
      bullets: [
        "Upgrade to premium paver or natural stone lines for a richer look.",
        "Add contrasting borders, inlays, or step lighting for curb appeal.",
        "Include sealer and joint sand stabilization for longer life."
      ]
    },
    // ... (UPSELL_CONFIG continues for all services, unchanged)
  };

  // ==========================
  // HELPERS
  // ==========================
  function formatMoney(num){
    return "$" + Math.round(num).toLocaleString("en-US");
  }

  function formatMonthly(num){
    if (!num || num <= 0) return "$0/mo";
    return "$" + Math.round(num).toLocaleString("en-US") + "/mo";
  }

  function rebuildScopeOptions(cfg){
    scopeSelect.innerHTML = '<option value="">Select scope…</option>';
    if (!cfg.scopes) return;
    Object.entries(cfg.scopes).forEach(([value, sc]) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = sc.label;
      scopeSelect.appendChild(opt);
    });
  }

  function resetAdvanced(){
    if (advMasonry) advMasonry.style.display = "none";
    if (advRoof)    advRoof.style.display    = "none";
    if (advSiding)  advSiding.style.display  = "none";
    if (advWindows) advWindows.style.display = "none";
    if (advStyle)   advStyle.style.display   = "none";
  }

  function updateRegionNote(){
    if (!regionNoteEl) return;
    regionNoteEl.style.display = (boroughEl.value === "outside") ? "block" : "none";
  }

  function updatePermitHelper(svc){
    if (!permitBox) return;
    const cfg = SERVICE_CONFIG[svc];
    if (!cfg){
      permitBox.style.display = "none";
      permitBox.innerHTML = "";
      return;
    }
    let msg = "";
    if (cfg.permit === "likely"){
      msg = "<strong>Permit likely required:</strong> This type of project often needs DOB / municipal filings. We confirm permits in your written estimate.";
    } else if (cfg.permit === "maybe"){
      msg = "<strong>Permit may be required:</strong> Some versions of this project need permits depending on scope, structural changes, and local rules.";
    } else {
      msg = "<strong>Most jobs do NOT require a permit:</strong> Simple versions of this project are usually cosmetic only. We’ll confirm during your walkthrough.";
    }
    permitBox.innerHTML = msg;
    permitBox.style.display = "block";
  }

  // SMART ADD-ONS: render dynamic panel based on selected service
  function renderAddonPanel(svc){
    if (!addonsPanel) return;

    const cfg = ADDON_CONFIG[svc];
    addonsPanel.innerHTML = "";
    extraAddonsValue = 0;

    if (!cfg){
      addonsPanel.style.display = "none";
      return;
    }

    addonsPanel.style.display = "";
    let html = `
      <h4 class="addons-title">${cfg.title}</h4>
      <p class="addons-subnote">${cfg.subnote}</p>
      <div class="addons-list">
    `;

    cfg.items.forEach(item => {
      html += `
        <label class="addon-item">
          <input
            type="checkbox"
            class="addon-checkbox"
            data-addon-id="${item.id}"
            data-addon-low="${item.low}"
            data-addon-high="${item.high}"
          >
          <span class="addon-label">${item.label}</span>
          <span class="addon-price">+ ${formatMoney(item.low)} – ${formatMoney(item.high)}</span>
        </label>
      `;
    });

    html += `
      </div>
      <p class="addons-total-row">
        Selected add-ons approx:
        <span id="est-addons-total-val">$0</span>
      </p>
    `;

    addonsPanel.innerHTML = html;

    const checkboxes = addonsPanel.querySelectorAll(".addon-checkbox");
    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        let total = 0;
        const boxes = addonsPanel.querySelectorAll(".addon-checkbox");
        boxes.forEach(box => {
          if (box.checked){
            const low  = Number(box.dataset.addonLow)  || 0;
            const high = Number(box.dataset.addonHigh) || 0;
            const avg  = (low + high) / 2;
            total += avg;
          }
        });
        extraAddonsValue = total;
        const totalSpan = addonsPanel.querySelector("#est-addons-total-val");
        if (totalSpan){
          totalSpan.textContent = formatMoney(extraAddonsValue);
        }
        // Auto-recalculate estimate when smart add-ons change
        calculateEstimate();
      });
    });
  }

  // 🔹 helper to collect selected smart add-ons for PDF + email
  function getSelectedSmartAddons(){
    if (!addonsPanel) return [];
    const boxes = addonsPanel.querySelectorAll(".addon-checkbox");
    const selected = [];
    boxes.forEach(box => {
      if (box.checked){
        const wrapper = box.closest(".addon-item");
        const labelEl = wrapper ? wrapper.querySelector(".addon-label") : null;
        selected.push({
          label: labelEl ? labelEl.textContent : (box.dataset.addonId || "Add-On"),
          low: Number(box.dataset.addonLow) || 0,
          high: Number(box.dataset.addonHigh) || 0,
          avg: ((Number(box.dataset.addonLow) || 0) + (Number(box.dataset.addonHigh) || 0)) / 2
        });
      }
    });
    return selected;
  }

  function updateVisibility(){
    const svc = serviceEl.value;
    const cfg = SERVICE_CONFIG[svc];
    if (!cfg) return;

    if (cfg.mode === "area"){
      sizeRow.style.display  = "";
      scopeRow.style.display = "none";
      sizeLabel.textContent  = cfg.label || "Approx. size (sq. ft.)";
    } else if (cfg.mode === "scope"){
      sizeRow.style.display  = "none";
      scopeRow.style.display = "";
      rebuildScopeOptions(cfg);
    } else {
      sizeRow.style.display  = "";
      scopeRow.style.display = "";
      sizeLabel.textContent  = cfg.label || "Approx. size (sq. ft.)";
      rebuildScopeOptions(cfg);
    }

    if (cfg.leadSensitive){
      leadRow.style.display = "";
    } else {
      leadRow.style.display = "none";
      leadEl.value = "no";
    }

    resetAdvanced();

    if ((svc === "masonry" || svc === "driveway") && advMasonry){
      advMasonry.style.display = "";
    }
    if (svc === "roofing" && advRoof){
      advRoof.style.display = "";
    }
    if (svc === "siding" && advSiding){
      advSiding.style.display = "";
    }
    if (svc === "windows" && advWindows){
      advWindows.style.display = "";
    }
    if ((svc === "kitchen" || svc === "bathroom" || svc === "basement") && advStyle){
      advStyle.style.display = "";
    }

    // Smart add-ons panel refresh
    renderAddonPanel(svc);
  }

  // Confidence meter based on level of input detail
  function getConfidenceLevel(svc, cfg, usedArea, hasScope, addOnsTotal){
    let score = 0;

    if (cfg.mode === "area"){
      if (usedArea) score += 2;
      if (usedArea && cfg.minArea && cfg.maxArea){
        const middle = (cfg.minArea + cfg.maxArea) / 2;
        const spread = cfg.maxArea - cfg.minArea;
        if (Math.abs(usedArea - middle) <= spread * 0.25){
          score += 2; // size is in the “typical” zone
        }
      }
    }
    if (cfg.mode === "scope" && hasScope){
      score += 3;
    }

    if (addOnsTotal > 0) score += 1;

    if (svc === "roofing"){
      if (roofTearoffEl.value) score += 1;
      if (roofPitchEl.value)   score += 1;
      if (roofHeightEl.value)  score += 1;
    }
    if (svc === "masonry" || svc === "driveway"){
      if (driveExistingEl.value) score += 1;
      if (driveRemoveEl.value)   score += 1;
      if (driveAccessEl.value)   score += 1;
    }
    if (svc === "windows"){
      if (windowCountEl.value) score += 1;
      if (doorCountEl.value)   score += 1;
    }

    if (score >= 7) return { label: "High",    note: "Based on strong inputs and typical NYC ranges." };
    if (score >= 4) return { label: "Medium", note: "Useful ballpark — final price may shift with details or hidden conditions." };
    return { label: "Low",   note: "Good starting point only — we recommend a walkthrough or more detail for better accuracy." };
  }

  function getProTipsHtml(svc){
    switch (svc){
      case "bathroom":
        return `
          <ul class="bullets">
            <li>Decide early if you’re moving plumbing — that changes permits and cost.</li>
            <li>Larger tiles mean fewer grout lines and easier cleaning.</li>
            <li>Curbless showers and niches add cost but feel more “luxury hotel.”</li>
          </ul>
        `;
      case "kitchen":
        return `
          <ul class="bullets">
            <li>Cabinets + counters are usually the biggest drivers of budget.</li>
            <li>Keeping appliances and plumbing in the same locations saves money.</li>
            <li>Under-cabinet lighting is a small add-on that looks very high-end.</li>
          </ul>
        `;
      case "masonry":
      case "driveway":
        return `
          <ul class="bullets">
            <li>Base prep is everything — a thicker, compacted base prevents sinking.</li>
            <li>Ask about water flow and pitch so puddles don’t form by the house.</li>
            <li>Pavers cost more upfront than plain concrete but are easier to repair later.</li>
          </ul>
        `;
      case "roofing":
        return `
          <ul class="bullets">
            <li>Full tear-off usually gives a better result than “roof over” a bad base.</li>
            <li>Upgraded underlayment and flashing protect against NYC wind-driven rain.</li>
            <li>Check manufacturer warranties — some require certified installers.</li>
          </ul>
        `;
      case "basement":
        return `
          <ul class="bullets">
            <li>Always address moisture before finishing — drains, sump, or waterproofing.</li>
            <li>Plan outlets, lighting, and emergency egress early in the design.</li>
            <li>Low ceilings and beams can often be hidden with smart soffit design.</li>
          </ul>
        `;
      default:
        return `
          <ul class="bullets">
            <li>Photos or a short video walk-through always sharpen the estimate.</li>
            <li>Having a “must-have” vs “nice-to-have” list keeps the project on budget.</li>
            <li>Tell us your ideal timeline so we can schedule around weather and permits.</li>
          </ul>
        `;
    }
  }

  function computeComplexityDetails({
    svc,
    borough,
    building,
    urgency,
    leadValue,
    cfg,
    hasTightAccess,
    hasCityRowAccess
  }){
    let score = 1;
    const reasons = [];

    if (borough === "manhattan" || borough === "brooklyn"){
      score += 0.35;
      reasons.push("Busy borough with tighter access, parking, and building rules.");
    } else if (borough === "queens" || borough === "bronx"){
      score += 0.18;
      reasons.push("Typical NYC access and parking considerations.");
    }

    if (building === "coop-condo"){
      score += 0.30;
      reasons.push("Co-op / condo rules, insurance, and elevator booking add complexity.");
    } else if (building === "small-multi"){
      score += 0.16;
      reasons.push("Multi-family building with multiple units to protect.");
    } else if (building === "mixed"){
      score += 0.35;
      reasons.push("Mixed-use / commercial frontage typically requires extra protection.");
    }

    if (urgency === "soon"){
      score += 0.08;
      reasons.push("Soon timeline may compress scheduling slightly.");
    } else if (urgency === "rush"){
      score += 0.22;
      reasons.push("Rush timeline may require overtime or schedule reshuffling.");
    }

    if (cfg && cfg.leadSensitive && leadValue === "yes"){
      score += 0.22;
      reasons.push("Lead-safe procedures (pre-1978 or unknown) require slower demo and HEPA cleanup.");
    }

    if (hasTightAccess){
      score += 0.12;
      reasons.push("Tight access requires more hand carry, smaller tools, or spot protection.");
    }
    if (hasCityRowAccess){
      score += 0.18;
      reasons.push("Row-house style or limited parking adds labor for loading and unloading.");
    }

    let level = "Low";
    if (score >= 1.3 && score < 1.6){
      level = "Medium";
    } else if (score >= 1.6){
      level = "High";
    }

    return { level, score: score.toFixed(2), reasons };
  }

  function computeNationalAndNYCAverages({
    baseLow,
    baseHigh,
    building,
    finish,
    urgency,
    addOnsTotal
  }){
    const buildingFactor = BUILDING_FACTOR[building] || 1;
    const finishFactor   = FINISH_FACTOR[finish] || 1;
    const urgencyFactor  = URGENCY_FACTOR[urgency] || 1;

    const nycFactor = 1.06 * buildingFactor * finishFactor * urgencyFactor;
    const nationalFactor = nycFactor * 0.82;

    const nycLow  = baseLow  * nycFactor  + addOnsTotal;
    const nycHigh = baseHigh * nycFactor  + addOnsTotal;
    const natLow  = baseLow  * nationalFactor + addOnsTotal * 0.8;
    const natHigh = baseHigh * nationalFactor + addOnsTotal * 0.8;

    return {
      nationalLow: natLow,
      nationalHigh: natHigh,
      nycLow,
      nycHigh
    };
  }

  function buildSmartInsightsHtml({
    svc,
    svcLabel,
    complexity,
    cfg,
    boroughText,
    buildingText,
    finishLabel,
    urgencyLabel
  }){
    const items = [];

    items.push(`${svcLabel} in ${boroughText}, ${buildingText}, ${finishLabel} finish, ${urgencyLabel.toLowerCase()}.`);

    if (cfg && cfg.permit === "likely"){
      items.push("This project type often needs DOB / municipal permits. We confirm exact filings in your written estimate.");
    } else if (cfg && cfg.permit === "maybe"){
      items.push("Some versions of this project need permits, depending on scope and structural changes.");
    } else if (cfg && cfg.permit === "none"){
      items.push("Most basic versions of this project are considered cosmetic only and may not require permits.");
    }

    if (complexity.level === "High"){
      items.push("Because the complexity is High, we recommend a walkthrough before finalizing scope, access, and protection.");
    } else if (complexity.level === "Medium"){
      items.push("Medium complexity projects benefit from a quick walkthrough to confirm layout, access, and finish level.");
    } else {
      items.push("Complexity is on the simpler side, but we still confirm conditions in person before locking in a quote.");
    }

    if (svc === "kitchen"){
      items.push("Cabinets, countertops, and appliance selections drive a large portion of kitchen cost.");
    } else if (svc === "bathroom"){
      items.push("Tile coverage, plumbing changes, and shower style (tub vs walk-in) are the main cost drivers.");
    } else if (svc === "masonry" || svc === "driveway" || svc === "sidewalk"){
      items.push("Base prep, access for materials, and carting/disposal heavily impact masonry and concrete pricing.");
    } else if (svc === "roofing"){
      items.push("Tear-off layers, pitch, and building height add labor and protection costs on NYC roofs.");
    }

    const bullets = items
      .map(i => `<li>${i}</li>`)
      .join("");

    return `
      <div class="est-insights-box">
        <div class="est-badge-row">
          <span class="est-badge est-badge-complexity">Complexity: ${complexity.level}</span>
          <span class="est-badge est-badge-score">Score: ${complexity.score}</span>
        </div>
        <ul class="est-insights-list">${bullets}</ul>
      </div>
    `;
  }

  function buildScenarioRow(key, rangeLow, rangeHigh){
    const s = SCENARIO_CONFIG[key];
    const sLow  = rangeLow  * s.factor;
    const sHigh = rangeHigh * s.factor;
    return `
      <div class="scenario-row">
        <div class="scenario-label">${s.label}</div>
        <div class="scenario-range">${formatMoney(sLow)} – ${formatMoney(sHigh)}</div>
        <div class="scenario-note">${s.desc}</div>
      </div>
    `;
  }

  // ==========================
  // SOW / UPSELL / TERMS HELPERS FOR PDF + EMAIL
  // ==========================
  function buildScopeOfWorkHtml(svc, svcLabel){
    const cfg = SOW_CONFIG[svc];
    const title = cfg?.title || `Scope of Work – ${svcLabel}`;
    const bullets = cfg?.bullets || [
      "Review project area and confirm scope on site.",
      "Perform work described in the written estimate and contract.",
      "Protect adjacent surfaces where practical during work.",
      "Clean up and haul away included construction debris."
    ];
    const lis = bullets.map(b => `<li>${b}</li>`).join("");
    return `
      <h3>Scope of Work (Typical)</h3>
      <ul>${lis}</ul>
    `;
  }

  function buildUpsellsHtml(svc){
    const cfg = UPSELL_CONFIG[svc];
    if (!cfg) return "";
    const lis = cfg.bullets.map(b => `<li>${b}</li>`).join("");
    return `
      <h3>Popular Upgrades to Consider</h3>
      <ul>${lis}</ul>
    `;
  }

  function buildTermsHtml(){
    const bullets = [
      "This is a ballpark range, not a formal quote. Final pricing follows an in-person walkthrough.",
      "Lead-safe, DOB, HOA, co-op, or condo requirements may affect cost and schedule.",
      "Hidden conditions (rot, structural issues, water damage, code issues) are not included until discovered.",
      "Materials, brands, and finishes will be confirmed in a written estimate and contract before work begins.",
      "Scheduling depends on season, crew availability, permits, and material lead times."
    ];
    const lis = bullets.map(b => `<li>${b}</li>`).join("");
    return `
      <h3>Important Notes & Assumptions</h3>
      <ul>${lis}</ul>
    `;
  }

    // ==========================
  // MAIN CALCULATION (UPDATED TO USE SMART ADD-ONS IN PDF + EMAIL)
  // ==========================
  function calculateEstimate(evt){
    if (evt) evt.preventDefault();

    const svc = serviceEl.value;
    const cfg = SERVICE_CONFIG[svc];
    if (!cfg){
      resultBox.innerHTML = "<p>Choose a project type to begin.</p>";
      return;
    }

    let baseLow, baseHigh;
    let usedArea = null;
    let usedScopeLabel = "";
    let hasScope = false;

    // Core calculation
    if (cfg.mode === "area"){
      const raw = Number(sizeInput.value || 0);
      if (!raw || raw <= 0){
        resultBox.innerHTML = "<p>Please enter an approximate size or quantity.</p>";
        return;
      }
      let area = raw;
      usedArea = area;

      if (cfg.minArea && area < cfg.minArea) area = cfg.minArea;
      if (cfg.maxArea && area > cfg.maxArea) area = cfg.maxArea;

      baseLow  = area * cfg.perSqLow;
      baseHigh = area * cfg.perSqHigh;

      if (cfg.minLow && baseLow < cfg.minLow)   baseLow  = cfg.minLow;
      if (cfg.minHigh && baseHigh < cfg.minHigh) baseHigh = cfg.minHigh;
    } else if (cfg.mode === "scope"){
      const scopeVal = scopeSelect.value;
      if (!scopeVal || !cfg.scopes || !cfg.scopes[scopeVal]){
        resultBox.innerHTML = "<p>Select a scope level to get a ballpark.</p>";
        return;
      }
      const sc = cfg.scopes[scopeVal];
      baseLow  = sc.low;
      baseHigh = sc.high;
      usedScopeLabel = sc.label;
      hasScope = true;
    } else {
      baseLow  = cfg.minLow || 0;
      baseHigh = cfg.minHigh || 0;
    }

    let factor = 1;
    const borough = boroughEl.value || "staten-island";
    const building = buildingEl.value || "house";
    const finish = finishEl.value || "standard";
    const urgency = urgencyEl.value || "flex";

    factor *= BOROUGH_FACTOR[borough]  || 1;
    factor *= BUILDING_FACTOR[building]|| 1;
    factor *= FINISH_FACTOR[finish]    || 1;
    factor *= URGENCY_FACTOR[urgency]  || 1;

    const leadValue = leadEl.value || "no";
    if (cfg.leadSensitive && leadValue === "yes"){
      factor *= 1.08;
    }

    if (svc === "roofing"){
      if (roofTearoffEl.value === "multi"){
        factor *= 1.08;
      } else if (roofTearoffEl.value === "many"){
        factor *= 1.14;
      }
      if (roofPitchEl.value === "steep"){
        factor *= 1.10;
      }
      if (roofHeightEl.value === "tall"){
        factor *= 1.08;
      }
    }

    if (svc === "masonry" || svc === "driveway"){
      if (driveExistingEl.value === "bad"){
        factor *= 1.06;
      }
      if (driveRemoveEl.value === "heavy"){
        factor *= 1.08;
      }
      if (driveAccessEl.value === "tight"){
        factor *= 1.06;
      }
    }

    if (svc === "windows"){
      const wCount = Number(windowCountEl.value || 0);
      const dCount = Number(doorCountEl.value || 0);
      const totalOpenings = wCount + dCount;
      if (totalOpenings > 0){
        const extra = Math.max(0, totalOpenings - 8);
        if (extra > 0){
          baseLow  += extra * 450;
          baseHigh += extra * 900;
        }
      }
      if (SERVICE_CONFIG["windows"].minLow && baseLow  < SERVICE_CONFIG["windows"].minLow)  baseLow  = SERVICE_CONFIG["windows"].minLow;
      if (SERVICE_CONFIG["windows"].minHigh && baseHigh < SERVICE_CONFIG["windows"].minHigh) baseHigh = SERVICE_CONFIG["windows"].minHigh;

      if (dCount > 0){
        baseLow  += 2200 * dCount;
        baseHigh += 3200 * dCount;
      }
    }

    if (svc === "kitchen" || svc === "bathroom" || svc === "basement"){
      const style = designStyleEl.value;
      if (style === "modern"){
        factor *= 1.06;
      } else if (style === "italian"){
        factor *= 1.16;
      } else if (style === "classic"){
        factor *= 1.04;
      }
    }

    let adjustedLow  = baseLow  * factor;
    let adjustedHigh = baseHigh * factor;

    const dumpsterVal = Number(dumpsterEl.value || 0);
    const demoVal     = Number(demoEl.value || 0);
    const permitVal   = Number(permitEl.value || 0);
    const smartAddonsVal = extraAddonsValue || 0;

    // collect selected smart add-ons for PDF + email
    const selectedAddons = getSelectedSmartAddons();

    const addOnsTotal = dumpsterVal + demoVal + permitVal + smartAddonsVal;

    let low  = adjustedLow  + addOnsTotal;
    let high = adjustedHigh + addOnsTotal;

    const softLow  = low  * 0.95;
    const softHigh = high * 1.10;
    const mid      = (softLow + softHigh) / 2;

    const svcLabel       = SERVICE_LABEL[svc] || svc;
    const finishLabel    = FINISH_LABEL[finish] || finish;
    const urgencyLabel   = URGENCY_LABEL[urgency] || urgency;

    const brandName = (brandRow && brandRow.style.display !== "none" && brandSelect && brandSelect.options.length)
      ? brandSelect.options[brandSelect.selectedIndex].textContent
      : "";

    const leadSummary = (leadRow.style.display !== "none"
      ? (leadValue === "yes" ? "Pre-1978 or lead-sensitive surfaces." : "Not marked as lead-sensitive.")
      : "Not applicable for this project type.");

    const hasTightAccess = (svc === "masonry" || svc === "driveway") && driveAccessEl.value === "tight";
    const hasCityRowAccess = (borough === "brooklyn" || borough === "manhattan");

    const complexity = computeComplexityDetails({
      svc,
      borough,
      building,
      urgency,
      leadValue,
      cfg,
      hasTightAccess,
      hasCityRowAccess
    });

    const boroughText = (() => {
      switch (borough){
        case "staten-island": return "Staten Island";
        case "brooklyn": return "Brooklyn";
        case "queens": return "Queens";
        case "bronx": return "The Bronx";
        case "manhattan": return "Manhattan";
        case "nj": return "Nearby New Jersey areas";
        default: return "NYC area";
      }
    })();

    const buildingText = (() => {
      switch (building){
        case "house": return "1–2 family home";
        case "small-multi": return "small multi-family building";
        case "coop-condo": return "co-op / condo unit";
        case "mixed": return "mixed-use / commercial frontage building";
        default: return "residential building";
      }
    })();

    const averages = computeNationalAndNYCAverages({
      baseLow,
      baseHigh,
      building,
      finish,
      urgency,
      addOnsTotal
    });

    const complexityHtml = `
      <div class="est-complexity-row">
        <span class="est-pill">Complexity: ${complexity.level}</span>
        <span class="est-pill est-pill-soft">Score: ${complexity.score}</span>
      </div>
    `;

    const insightsHtml = buildSmartInsightsHtml({
      svc,
      svcLabel,
      complexity,
      cfg,
      boroughText,
      buildingText,
      finishLabel,
      urgencyLabel
    });

    const proTipsHtml = getProTipsHtml(svc);

    const scenarioBasic  = buildScenarioRow("basic",  softLow, softHigh);
    const scenarioPrem   = buildScenarioRow("premium",softLow, softHigh);
    const scenarioLux    = buildScenarioRow("luxury", softLow, softHigh);

    const addonsLine = smartAddonsVal
      ? `Dumpster, demo, permits + smart add-ons are included in this ballpark.`
      : `Dumpster, demo, and permits (if you entered them) are included in this ballpark.`;

    const estimateHtml = `
      <div class="est-result-card">
        <h3 class="est-title">${svcLabel}</h3>
        <p class="est-subtitle">
          For a project like this in <strong>${boroughText}</strong> in a <strong>${buildingText}</strong>,
          with <strong>${finishLabel}</strong> finishes and a <strong>${urgencyLabel}</strong> timeline:
        </p>

        <div class="est-main-range">
          <div class="est-main-number">${formatMoney(softLow)} – ${formatMoney(softHigh)}</div>
          <div class="est-main-note">Most projects of this type land somewhere in this range.</div>
        </div>

        <div class="est-avg-box">
          <div class="est-avg-row">
            <span>Soft ballpark midpoint:</span>
            <span class="est-avg-number">${formatMoney(mid)}</span>
          </div>
          <p class="tiny-note">
            This is a starting point only. A walkthrough and final design/finish selections will tighten this up.
          </p>
        </div>

        <div class="est-avg-grid">
          <div class="est-avg-col">
            <h4>National Averages (similar projects)</h4>
            <p class="est-avg-range">${formatMoney(averages.nationalLow)} – ${formatMoney(averages.nationalHigh)}</p>
            <p class="tiny-note">Broad national range, including lower-cost and higher-cost markets.</p>
          </div>
          <div class="est-avg-col">
            <h4>NYC-Area Typical Range</h4>
            <p class="est-avg-range">${formatMoney(averages.nycLow)} – ${formatMoney(averages.nycHigh)}</p>
            <p class="tiny-note">
              Your soft ballpark is
              <strong>${
                softLow > averages.nycHigh
                  ? "above"
                  : softHigh < averages.nycLow
                    ? "below"
                    : "within"
              }</strong>
              typical NYC-area ranges for similar projects.
            </p>
          </div>
        </div>

        <div class="est-breakdown-box">
          <h4>Approximate Cost Breakdown</h4>
          <div class="est-break-row">
            <div class="est-break-label">Labor + Materials</div>
            <div class="est-break-bar">
              <div class="est-break-bar-inner" style="width:70%;"></div>
            </div>
            <div class="est-break-pct">~70%</div>
          </div>
          <div class="est-break-row">
            <div class="est-break-label">Permits, Insurance, Overhead</div>
            <div class="est-break-bar">
              <div class="est-break-bar-inner" style="width:18%;"></div>
            </div>
            <div class="est-break-pct">~18%</div>
          </div>
          <div class="est-break-row">
            <div class="est-break-label">Contingency / Unknowns</div>
            <div class="est-break-bar">
              <div class="est-break-bar-inner" style="width:12%;"></div>
            </div>
            <div class="est-break-pct">~12%</div>
          </div>
          <p class="tiny-note">
            Approximate add-ons included in this range: <strong>${formatMoney(addOnsTotal)}</strong> (dumpster, demo, permits${smartAddonsVal ? " + smart add-ons" : ""}).
          </p>
        </div>

        ${insightsHtml}

        <div class="est-scenarios-box">
          <h4>How finish level and selections can shift budget</h4>
          ${scenarioBasic}
          ${scenarioPrem}
          ${scenarioLux}
        </div>

        <div class="est-notes-box">
          <h4>Pro Tips for This Type of Project</h4>
          ${proTipsHtml}
        </div>

        <p class="tiny-note">${addonsLine}</p>

        <div class="est-cta-row">
          <a class="btn est-cta" href="#contact">Request a walkthrough & written estimate</a>
          <button type="button" id="btn-est-pdf" class="btn est-cta-alt est-cta-outline">🖨 Save / Print PDF</button>
          <a class="btn est-cta-alt" href="sms:19295955300">💬 Text photos for faster quote</a>
        </div>
      </div>
    `;

    resultBox.innerHTML = estimateHtml;

    // PDF button: always use latest data (including smart add-ons)
    const pdfBtn = document.getElementById("btn-est-pdf");
    if (pdfBtn){
      pdfBtn.onclick = () => {
        openPrintableEstimate({
          svc,
          svcLabel,
          softLow,
          softHigh,
          boroughText,
          buildingText,
          finishLabel,
          urgencyLabel,
          leadSummary,
          usedArea,
          usedScopeLabel,
          addOnsTotal,
          dumpsterVal,
          demoVal,
          permitVal,
          selectedAddons  // 🔹 now included
        });
      };
    }
  }

  // 🔥 FINAL FIX — Correct service change behavior
  serviceEl.addEventListener("change", () => {
    updateVisibility();
    updateRegionNote();
    updatePermitHelper(serviceEl.value);
  });

  boroughEl.addEventListener("change", updateRegionNote);
  form.addEventListener("submit", calculateEstimate);

  // Initialize view
  updateVisibility();
  updateRegionNote();
  updatePermitHelper(serviceEl.value);
}); // end DOMContentLoaded

// ==========================
// STYLE INJECTION
// ==========================
function injectEstimatorExtraStyles(){
  const css = `
  .est-result-card{
    border-radius:18px;
    padding:18px 18px 20px;
    background:linear-gradient(135deg,rgba(7,20,38,0.96),rgba(15,28,52,0.98));
    box-shadow:0 18px 45px rgba(0,0,0,0.75);
    border:1px solid rgba(231,191,99,0.32);
    color:#f8f7f2;
    margin-top:18px;
  }
  .est-title{
    font-size:20px;
    font-weight:600;
    margin-bottom:4px;
  }
  .est-subtitle{
    font-size:13px;
    color:rgba(248,247,242,0.78);
    margin-bottom:10px;
  }
  .est-main-range{
    margin:10px 0 14px;
  }
  .est-main-number{
    font-size:22px;
    font-weight:700;
    letter-spacing:0.01em;
    color:#f5d89b;
  }
  .est-main-note{
    font-size:12px;
    color:rgba(248,247,242,0.78);
  }
  .est-avg-box{
    border:1px solid rgba(231,191,99,0.45);
    padding:10px 12px;
    border-radius:10px;
    margin:12px 0;
    background:radial-gradient(circle at top left,rgba(231,191,99,0.22),transparent 56%);
  }
  .est-avg-row{
    display:flex;
    justify-content:space-between;
    align-items:center;
    font-size:13px;
  }
  .est-avg-number{
    font-weight:600;
  }
  .tiny-note{
    font-size:11px;
    color:rgba(248,247,242,0.72);
    margin-top:6px;
  }
  .est-avg-grid{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:10px;
    margin-top:12px;
  }
  .est-avg-col{
    border-radius:10px;
    border:1px solid rgba(255,255,255,0.06);
    padding:10px 11px;
    background:rgba(3,10,22,0.75);
  }
  .est-avg-col h4{
    font-size:13px;
    margin-bottom:4px;
  }
  .est-avg-range{
    font-size:13px;
    font-weight:600;
    color:#f5d89b;
  }
  .est-breakdown-box{
    margin-top:14px;
    border-top:1px dashed rgba(255,255,255,0.18);
    padding-top:10px;
  }
  .est-break-row{
    display:grid;
    grid-template-columns:minmax(0,2.2fr) minmax(0,4fr) auto;
    align-items:center;
    gap:8px;
    margin-bottom:6px;
  }
  .est-break-label{
    font-size:12px;
  }
  .est-break-bar{
    position:relative;
    height:6px;
    border-radius:999px;
    background:rgba(14,27,53,0.95);
    overflow:hidden;
  }
  .est-break-bar-inner{
    position:absolute;
    inset:0;
    border-radius:inherit;
    background:linear-gradient(90deg,#f5d89b,#e7bf63,#f5d89b);
  }
  .est-break-pct{
    font-size:11px;
    color:rgba(248,247,242,0.82);
    text-align:right;
  }
  .est-complexity-row{
    display:flex;
    gap:8px;
    margin:10px 0 6px;
    flex-wrap:wrap;
  }
  .est-pill{
    font-size:11px;
    padding:4px 9px;
    border-radius:999px;
    border:1px solid rgba(245,216,155,0.9);
    background:rgba(5,16,33,0.96);
  }
  .est-pill-soft{
    border-color:rgba(255,255,255,0.4);
    color:rgba(248,247,242,0.86);
  }
  .est-insights-box{
    margin-top:8px;
    border-radius:10px;
    border:1px solid rgba(255,255,255,0.08);
    padding:10px 11px;
    background:rgba(5,16,33,0.95);
  }
  .est-insights-list{
    padding-left:18px;
    margin:6px 0 2px;
    font-size:12px;
  }
  .est-scenarios-box{
    margin-top:14px;
    border-radius:10px;
    border:1px solid rgba(255,255,255,0.08);
    padding:10px 11px;
    background:linear-gradient(135deg,rgba(10,22,46,0.96),rgba(12,26,52,0.98));
  }
  .scenario-row{
    display:grid;
    grid-template-columns:minmax(0,1.4fr) minmax(0,2fr);
    gap:6px 10px;
    align-items:center;
    font-size:12px;
    padding:4px 0;
    border-bottom:1px dashed rgba(255,255,255,0.10);
  }
  .scenario-row:last-child{
    border-bottom:none;
  }
  .scenario-label{
    font-weight:600;
  }
  .scenario-range{
    color:#f5d89b;
    font-weight:500;
  }
  .scenario-note{
    grid-column:1/-1;
    font-size:11px;
    color:rgba(248,247,242,0.75);
  }
  .est-notes-box{
    margin-top:14px;
    border-radius:10px;
    border:1px solid rgba(255,255,255,0.08);
    padding:10px 11px;
    background:rgba(4,14,30,0.96);
    font-size:12px;
  }
  .est-notes-box .bullets{
    padding-left:18px;
    margin:6px 0 2px;
  }
  .est-cta-row{
    margin-top:16px;
    display:flex;
    flex-wrap:wrap;
    gap:8px;
  }
  .addons-title{
    font-size:14px;
    font-weight:600;
    margin-bottom:4px;
  }
  .addons-subnote{
    font-size:11px;
    color:rgba(248,247,242,0.74);
    margin-bottom:6px;
  }
  .addons-list{
    display:flex;
    flex-direction:column;
    gap:4px;
    margin-bottom:4px;
  }
  .addon-item{
    display:flex;
    align-items:center;
    gap:6px;
    font-size:12px;
  }
  .addon-price{
    margin-left:auto;
    font-size:11px;
    color:#f5d89b;
  }
  .addons-total-row{
    font-size:12px;
    margin-top:4px;
  }
  @media (max-width:768px){
    .est-avg-grid{
      grid-template-columns:minmax(0,1fr);
    }
    .scenario-row{
      grid-template-columns:minmax(0,1fr);
    }
  }
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}




