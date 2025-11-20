// Hammer Brick & Home LLC — Estimator Super v4
// Combines:
//  - Original estimator logic
//  - National vs NYC averages
//  - Cost breakdown + complexity score
//  - Confidence meter + sample monthly
//  - Basic / Premium / Luxury bands
//  - Pro Tips per project
//  - PDF-style printable view

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
    const cfg = SERVICE_CONFIG[svc]
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

  // Pro tips per service
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

  function openPrintableEstimate(estimateData){
    const w = window.open("", "_blank");
    if (!w) return;

    const {
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
      permitVal
    } = estimateData;

    w.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Estimate Preview — Hammer Brick & Home</title>
  <style>
    body{
      font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,system-ui,sans-serif;
      background:#070b14;
      color:#f5f5f5;
      padding:20px 26px;
    }
    .box{
      max-width:720px;
      margin:0 auto;
      border:1px solid rgba(231,191,99,.45);
      border-radius:12px;
      padding:20px 22px;
      background:#050914;
      box-shadow:0 18px 40px rgba(0,0,0,.7);
    }
    h1{font-size:22px;margin:0 0 6px;color:#e7bf63;}
    h2{font-size:17px;margin:18px 0 6px;color:#f0dca0;}
    p,li{font-size:13px;line-height:1.5;}
    .row{display:flex;flex-wrap:wrap;font-size:13px;margin:8px 0;}
    .row div{flex:1 1 220px;margin-bottom:4px;}
    .range{font-size:20px;font-weight:700;margin:8px 0;color:#f5d89b;}
    ul{padding-left:18px;margin:6px 0;}
    .footer-note{font-size:11px;color:#bbb;margin-top:14px;}
  </style>
</head>
<body>
  <div class="box">
    <h1>Ballpark Estimate (Not a Formal Quote)</h1>
  <div style="text-align:left;margin-bottom:18px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,system-ui,sans-serif;">
  <div style="font-size:22px;font-weight:700;color:#e7bf63;">HAMMER BRICK & HOME LLC</div>
  <div style="font-size:13px;color:#f0dca0;">Precision • Protection • Professionalism</div>
  <div style="font-size:13px;color:#f0dca0;">Licensed • Insured • Bonded</div>
  <div style="font-size:13px;color:#f0dca0;">HIC #21311291</div>
  <div style="font-size:13px;color:#f0dca0;">Call: 929-595-5300</div>
  <div style="font-size:13px;color:#f0dca0;margin-bottom:6px;">Building trust one brick at a time.</div>

  <!-- heavy gold line -->
  <div style="width:100%;height:2.5px;background:#e7bf63;border-radius:2px;margin-top:8px;margin-bottom:12px;"></div>
</div>


    <h2>Project Summary</h2>
    <div class="row">
      <div><strong>Project Type:</strong> ${svcLabel}</div>
      <div><strong>Location:</strong> ${boroughText}</div>
      <div><strong>Building Type:</strong> ${buildingText}</div>
    </div>
    <div class="row">
      <div><strong>Finish Level:</strong> ${finishLabel}</div>
      <div><strong>Timeline:</strong> ${urgencyLabel}</div>
      <div><strong>Lead / Pre-1978:</strong> ${leadSummary}</div>
    </div>
    ${usedArea ? `<p><strong>Approx. Size:</strong> ${usedArea}</p>` : ""}
    ${usedScopeLabel ? `<p><strong>Scope Level:</strong> ${usedScopeLabel}</p>` : ""}

    <h2>Ballpark Range</h2>
    <p class="range">${formatMoney(softLow)} – ${formatMoney(softHigh)}</p>
    <p>This is a ballpark NYC-area range only. Final pricing is confirmed in a written estimate after an on-site walkthrough.</p>

    <h2>Add-Ons Included in This Range</h2>
    <ul>
      <li>Dumpster: ${formatMoney(dumpsterVal)}</li>
      <li>Demolition: ${formatMoney(demoVal)}</li>
      <li>Permit / Filing (approx): ${formatMoney(permitVal)}</li>
      <li>Total add-ons included: ${formatMoney(addOnsTotal)}</li>
    </ul>

    <p class="footer-note">
      Important: This document is for informational purposes only. It is not a bid, proposal, or contract, and does not create
      any obligation for Hammer Brick &amp; Home LLC. Final pricing, timeline, and scope are only set out in a written estimate
      and signed agreement after a walkthrough.
    </p>
  </div>
  <script>window.print && window.print();</script>
</body>
</html>`);
    w.document.close();
  }

  // ==========================
  // MAIN CALCULATION
  // ==========================
  function calculateEstimate(evt){
    evt.preventDefault();

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

    // Core calculation: keep original logic
    if (cfg.mode === "area" || cfg.mode === "both"){
      let areaRaw = (sizeInput.value || "").toString().replace(/,/g,"");
      let area = parseFloat(areaRaw);
      if (isNaN(area) || area <= 0){
        resultBox.innerHTML = "<p>Please enter an approximate size (sq. ft. or openings).</p>";
        return;
      }
      const minArea = cfg.minArea || 1;
      const maxArea = cfg.maxArea || 5000;
      area = Math.max(minArea, Math.min(area, maxArea));
      usedArea = area;

      baseLow  = cfg.perSqLow  * area;
      baseHigh = cfg.perSqHigh * area;

      if (cfg.minLow  && baseLow  < cfg.minLow)  baseLow  = cfg.minLow;
      if (cfg.minHigh && baseHigh < cfg.minHigh) baseHigh = cfg.minHigh;
    } else if (cfg.mode === "scope"){
      const scopeVal = scopeSelect.value;
      const scopeCfg = cfg.scopes && cfg.scopes[scopeVal];
      if (!scopeCfg){
        resultBox.innerHTML = "<p>Please choose a scope level for this project type.</p>";
        return;
      }
      baseLow  = scopeCfg.low;
      baseHigh = scopeCfg.high;
      usedScopeLabel = scopeCfg.label;
      hasScope = true;
    }

    const borough     = boroughEl.value;
    const boroughText = boroughEl.options[boroughEl.selectedIndex].textContent;
    const building    = buildingEl.value;
    const buildingText= buildingEl.options[buildingEl.selectedIndex].textContent;
    const finish      = finishEl.value;
    const urgency     = urgencyEl.value;
    const leadValue   = leadEl.value;

    let factor = 1;
    factor *= BOROUGH_FACTOR[borough]   || 1;
    factor *= BUILDING_FACTOR[building] || 1;
    factor *= FINISH_FACTOR[finish]     || 1;
    factor *= URGENCY_FACTOR[urgency]   || 1;

    if (leadRow.style.display !== "none" && leadValue === "yes" && cfg.leadSensitive){
      factor *= 1.10;
    }

    let hasTightAccess = false;
    let hasCityRowAccess = false;

    if (svc === "masonry" || svc === "driveway"){
      const focus    = masonryFocusEl.value;
      const existing = driveExistingEl.value;
      const remove   = driveRemoveEl.value;
      const access   = driveAccessEl.value;

      if (focus === "driveway"){
        factor *= 1.05;
      }

      if (remove === "partial"){
        baseLow  += 1500;
        baseHigh += 2800;
      } else if (remove === "full"){
        baseLow  += 3500;
        baseHigh += 6500;
      }

      if (existing === "concrete"){
        baseLow  += 800;
        baseHigh += 1800;
      } else if (existing === "pavers"){
        baseLow  += 500;
        baseHigh += 1400;
      }

      if (access === "tight"){
        factor *= 1.06;
        hasTightAccess = true;
      } else if (access === "cityrow"){
        factor *= 1.12;
        hasCityRowAccess = true;
      }
    }

    if (svc === "roofing"){
      const tear   = parseInt(roofTearoffEl.value,10) || 0;
      const pitch  = roofPitchEl.value;
      const height = roofHeightEl.value;

      if (tear === 1){
        factor *= 1.05;
      } else if (tear === 2){
        factor *= 1.12;
      } else if (tear >= 3){
        factor *= 1.20;
      }

      if (pitch === "steep"){
        factor *= 1.12;
      } else if (pitch === "low"){
        factor *= 0.97;
      }

      if (height === "mid"){
        factor *= 1.06;
      } else if (height === "high"){
        factor *= 1.15;
      }
    }

    if (svc === "siding"){
      const removeType = sidingRemoveEl.value;
      const stories    = sidingStoriesEl.value;

      if (removeType === "wood"){
        factor *= 1.08;
      } else if (removeType === "stucco"){
        factor *= 1.18;
      }

      if (stories === "3"){
        factor *= 1.12;
      }
    }

    if (svc === "windows"){
      const winCount  = parseInt(windowCountEl.value || "0",10);
      const doorCount = parseInt(doorCountEl.value || "0",10);
      let openingsCount = winCount + doorCount;
      if (!openingsCount || openingsCount < 3){
        openingsCount = 3;
      }

      baseLow  = SERVICE_CONFIG["windows"].perSqLow  * openingsCount;
      baseHigh = SERVICE_CONFIG["windows"].perSqHigh * openingsCount;
      if (SERVICE_CONFIG["windows"].minLow  && baseLow  < SERVICE_CONFIG["windows"].minLow)  baseLow  = SERVICE_CONFIG["windows"].minLow;
      if (SERVICE_CONFIG["windows"].minHigh && baseHigh < SERVICE_CONFIG["windows"].minHigh) baseHigh = SERVICE_CONFIG["windows"].minHigh;

      if (doorCount > 0){
        baseLow  += 2200 * doorCount;
        baseHigh += 3200 * doorCount;
      }
    }

    if (svc === "kitchen" || svc === "bathroom" || svc === "basement"){
      const style = designStyleEl.value;
      if (style === "modern"){
        factor *= 1.06;
      } else if (style === "italian"){
        factor *= 1.16;
      }
    }

    let adjustedLow  = baseLow  * factor;
    let adjustedHigh = baseHigh * factor;

    const dumpsterVal = Number(dumpsterEl.value || 0);
    const demoVal     = Number(demoEl.value || 0);
    const permitVal   = Number(permitEl.value || 0);
    const addOnsTotal = dumpsterVal + demoVal + permitVal;

    let low  = adjustedLow  + addOnsTotal;
    let high = adjustedHigh + addOnsTotal;

    const softLow  = low  * 0.95;
    const softHigh = high * 1.10;
    const mid      = (softLow + softHigh) / 2;

    const svcLabel       = SERVICE_LABEL[svc] || svc;
    const finishLabel    = FINISH_LABEL[finish] || finish;
    const urgencyLabel   = URGENCY_LABEL[urgency] || urgency;

    const brandName = (brandRow.style.display !== "none" && brandSelect.options.length)
      ? brandSelect.options[brandSelect.selectedIndex].textContent
      : "";

    const leadSummary = (leadRow.style.display !== "none"
      ? (leadValue === "yes" ? "Yes / Unsure" : "No / Tested Negative or 1978+")
      : "Not applicable for this project type");

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

    const averages = computeNationalAndNYCAverages({
      baseLow,
      baseHigh,
      building,
      finish,
      urgency,
      addOnsTotal
    });

    const laborMaterialLow = adjustedLow;
    const baseForPct = laborMaterialLow + addOnsTotal;
    let laborPct = 0;
    let addonPct = 0;
    if (baseForPct > 0){
      laborPct = Math.round((laborMaterialLow / baseForPct) * 100);
      addonPct = 100 - laborPct;
    }

    const confidence = getConfidenceLevel(svc, cfg, usedArea, hasScope, addOnsTotal);
    const approxMonthly = mid > 0 ? (mid / 120) : 0; // 10-year divide (conversation only)

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

    const bodyLines = [
      "Hello,",
      "",
      "Please send me a written estimate based on this ballpark from your website:",
      "",
      "Project Type: " + svcLabel,
      usedArea ? ("Approx. Size (sq ft or openings): " + usedArea) : "",
      usedScopeLabel ? ("Scope Level: " + usedScopeLabel) : "",
      "Location (Borough): " + boroughText,
      "Building Type: " + buildingText,
      "Finish Level: " + finishLabel,
      "Timeline: " + urgencyLabel,
      "Pre-1978 / Lead-Sensitive: " + leadSummary,
      brandName ? ("Preferred Brand/Line: " + brandName) : "",
      "",
      "Selected Add-Ons:",
      "  Dumpster: $" + dumpsterVal.toLocaleString("en-US"),
      "  Demolition: $" + demoVal.toLocaleString("en-US"),
      "  DOB Permit (approx): $" + permitVal.toLocaleString("en-US"),
      "",
      "Ballpark Range Shown:",
      "  " + formatMoney(softLow) + " – " + formatMoney(softHigh),
      "",
      "My Contact Info:",
      "Name:",
      "Service Address:",
      "Phone:",
      "Email:",
      "",
      "Thank you!"
    ];

    const mailtoHref = "mailto:Hammerbrickhome@gmail.com"
      + "?subject=" + encodeURIComponent("Estimate Request – Website Tool")
      + "&body=" + encodeURIComponent(bodyLines.join("\n"));

    updatePermitHelper(svc);

    resultBox.innerHTML = `
      <p class="muted">NYC-area ballpark only — not a formal quote.</p>
      <p>Estimated range for this type of project:</p>
      <p class="est-main">${formatMoney(softLow)} – ${formatMoney(softHigh)}</p>
      <p class="est-note">
        Most approved projects land somewhere in the middle of this range once we see
        access, existing conditions, and final finish choices.
      </p>

      <div class="advanced-summary">
        <div class="advanced-chip">
          <span class="chip-label">Confidence:</span>
          <span class="chip-value chip-${confidence.label.toLowerCase()}">${confidence.label}</span>
        </div>
        <div class="advanced-chip">
          <span class="chip-label">Sample Monthly (example only):</span>
          <span class="chip-value">${formatMonthly(approxMonthly)}</span>
        </div>
      </div>

      <div class="scenario-grid">
        <h4 class="scenario-title">Compare bands by finish / budget level</h4>
        ${buildScenarioRow("basic", softLow, softHigh)}
        ${buildScenarioRow("premium", softLow, softHigh)}
        ${buildScenarioRow("luxury", softLow, softHigh)}
      </div>

      <div class="est-avg-box">
        <h4>How this compares</h4>
        <div class="est-avg-row">
          <div>
            <div class="est-avg-label">National Avg.</div>
            <div class="est-avg-value">${formatMoney(averages.nationalLow)} – ${formatMoney(averages.nationalHigh)}</div>
          </div>
          <div>
            <div class="est-avg-label">NYC / North Jersey Avg.</div>
            <div class="est-avg-value">${formatMoney(averages.nycLow)} – ${formatMoney(averages.nycHigh)}</div>
          </div>
        </div>
        <p class="est-avg-note">
          Your home is estimated slightly ${
            softLow > averages.nycHigh
              ? "above"
              : softHigh < averages.nycLow
                ? "below"
                : "within"
          } typical NYC-area ranges for similar projects.
        </p>
      </div>

      <div class="est-breakdown-box">
        <h4>Approximate Cost Breakdown</h4>
        <div class="est-break-row">
          <div class="est-break-label">Labor + Materials</div>
          <div class="est-break-bar">
            <div class="est-break-bar-inner" style="width:${laborPct}%;"></div>
          </div>
          <div class="est-break-pct">${laborPct}%</div>
        </div>
        <div class="est-break-row">
          <div class="est-break-label">Dumpster, Demo & Permits</div>
          <div class="est-break-bar est-break-bar--secondary">
            <div class="est-break-bar-inner" style="width:${addonPct}%;"></div>
          </div>
          <div class="est-break-pct">${addonPct}%</div>
        </div>
        <p class="tiny-note">
          Approximate add-ons included in this range: <strong>${formatMoney(addOnsTotal)}</strong> (dumpster, demo, permit).
        </p>
      </div>

      ${insightsHtml}

      <p class="muted" style="margin-bottom:10px;">
        <strong>Assumptions:</strong>
        ${boroughText} · ${buildingText} · ${finishLabel} finish · ${urgencyLabel}.
      </p>
      <ul class="bullets">
        <li>Includes a buffer for typical NYC access, protection, and cleanup.</li>
        <li>Does <strong>not</strong> include architect/engineer fees, major structural/MEP changes, or unforeseen conditions.</li>
        <li>Final pricing is only confirmed in a written estimate after a walkthrough.</li>
      </ul>

      <div class="pro-tips-box">
        <h4>Quick Pro Tips for this type of project</h4>
        ${getProTipsHtml(svc)}
      </div>

      <div class="est-cta-row">
        <a class="btn-email-est" href="${mailtoHref}">📧 Email me this estimate</a>
        <a class="btn est-cta-alt" href="contact.html">📝 Book a walkthrough</a>
        <button type="button" id="btn-est-pdf" class="btn est-cta-alt est-cta-outline">🖨 Save / Print PDF</button>
        <a class="btn est-cta-alt" href="sms:19295955300">💬 Text photos for faster quote</a>
      </div>
    `;

    const pdfBtn = document.getElementById("btn-est-pdf");
    if (pdfBtn){
      pdfBtn.addEventListener("click", () => {
        openPrintableEstimate({
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
          permitVal
        });
      });
    }
  }

// 🔥 FINAL FIX — Correct service change behavior
serviceEl.addEventListener("change", () => {
  updateVisibility();

  // 1. FULL reset of brand system
  brandSelect.innerHTML = "";
  brandRow.style.display = "none";

  // 2. Force finish logic AFTER reset (correct timing)
  setTimeout(() => {
    finishEl.dispatchEvent(new Event("change"));
  }, 0);
});




finishEl.addEventListener("change", () => {
  const svc = serviceEl.value;
  const cfg = BRAND_CONFIG[svc];
  if (!cfg) {
    brandRow.style.display = "none";
    brandSelect.innerHTML = "";
    return;
  }

  brandRow.style.display = "";
  brandLabel.textContent = cfg.label || "Preferred Brand / Line";

  let names = [];

  // Enforce:
  // STANDARD → budget
  // PREMIUM → standard
  // LUXURY  → luxury
  if (finishEl.value === "standard") {
    names = cfg.budget || [];
  } else if (finishEl.value === "premium") {
    names = cfg.standard || [];
  } else if (finishEl.value === "luxury") {
    names = cfg.luxury || [];
  }
  // ✅ THIS PART WAS MISSING — ADD IT
  brandSelect.innerHTML = "";
  names.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    opt.textContent = name;
    brandSelect.appendChild(opt);
  });
});


  boroughEl.addEventListener("change", updateRegionNote);
  form.addEventListener("submit", calculateEstimate);

  // Init
  updateVisibility();
  updateRegionNote();
});

// ==========================
// STYLE INJECTION
// ==========================
function injectEstimatorExtraStyles(){
  const css = `
  .est-avg-box{
    border:1px solid rgba(231,191,99,0.45);
    padding:10px 12px;
    border-radius:10px;
    margin:12px 0;
    background:rgba(10,20,35,0.55);
    box-shadow:0 0 14px rgba(231,191,99,0.18);
  }
  .est-avg-row{
    display:flex;
    flex-wrap:wrap;
    gap:12px;
    margin-top:4px;
  }
  .est-avg-row > div{
    flex:1 1 180px;
  }
  .est-avg-label{
    font-size:11px;
    text-transform:uppercase;
    letter-spacing:.08em;
    color:#d2c08c;
    margin-bottom:2px;
  }
  .est-avg-value{
    font-size:13px;
    font-weight:600;
    color:#fff;
  }
  .est-avg-note{
    font-size:11px;
    color:#c9c9c9;
    margin-top:8px;
  }
  .est-breakdown-box{
    border:1px solid rgba(231,191,99,0.35);
    padding:10px 12px;
    border-radius:10px;
    margin:10px 0;
    background:rgba(7,14,26,0.75);
  }
  .est-breakdown-box h4{
    font-size:13px;
    margin:0 0 6px;
    color:#f0dca0;
  }
  .est-break-row{
    display:grid;
    grid-template-columns:minmax(0,1.4fr) minmax(0,2fr) auto;
    gap:6px;
    align-items:center;
    margin-bottom:6px;
  }
  .est-break-label{
    font-size:11px;
    color:#ddd;
  }
  .est-break-bar{
    position:relative;
    height:7px;
    border-radius:999px;
    background:rgba(255,255,255,0.06);
    overflow:hidden;
  }
  .est-break-bar-inner{
    position:absolute;
    top:0;
    left:0;
    bottom:0;
    border-radius:999px;
    background:linear-gradient(90deg,#f5d89b,#e7bf63);
  }
  .est-break-bar--secondary .est-break-bar-inner{
    background:linear-gradient(90deg,#ffc3a0,#ff9472);
  }
  .est-break-pct{
    font-size:11px;
    text-align:right;
    color:#eee;
  }
  .est-insights-box{
    border:1px solid rgba(231,191,99,0.4);
    padding:10px 12px;
    border-radius:10px;
    margin:10px 0;
    background:rgba(10,18,32,0.9);
  }
  .est-badge-row{
    display:flex;
    flex-wrap:wrap;
    gap:6px;
    margin-bottom:6px;
  }
  .est-badge{
    display:inline-flex;
    align-items:center;
    border-radius:999px;
    border:1px solid rgba(231,191,99,0.65);
    padding:2px 9px;
    font-size:10px;
    text-transform:uppercase;
    letter-spacing:.1em;
    color:#f5e2aa;
    background:rgba(7,14,26,0.9);
  }
  .est-badge-complexity{
    border-color:rgba(255,205,120,0.85);
  }
  .est-badge-score{
    border-color:rgba(173,215,255,0.85);
  }
  .est-insights-list{
    list-style:disc;
    margin:0;
    padding-left:18px;
  }
  .est-insights-list li{
    font-size:11px;
    color:#ddd;
    margin-bottom:4px;
  }
  .est-cta-row{
    display:flex;
    flex-wrap:wrap;
    gap:6px;
    margin-top:10px;
  }
  .est-cta-alt{
    font-size:12px;
    padding:8px 12px;
  }
  .est-cta-outline{
    background:transparent;
    border:1px solid rgba(231,191,99,0.8);
    color:#f5e2aa;
  }
  .advanced-summary{
    display:flex;
    flex-wrap:wrap;
    gap:8px;
    margin:10px 0 6px;
  }
  .advanced-chip{
    display:inline-flex;
    flex-wrap:nowrap;
    align-items:center;
    gap:4px;
    padding:4px 10px;
    border-radius:999px;
    border:1px solid rgba(231,191,99,0.7);
    background:rgba(7,14,26,0.9);
  }
  .chip-label{
    font-size:10px;
    text-transform:uppercase;
    letter-spacing:.08em;
    color:#d9c693;
  }
  .chip-value{
    font-size:11px;
    font-weight:600;
  }
  .chip-high{
    color:#9cffb0;
  }
  .chip-medium{
    color:#ffe8a3;
  }
  .chip-low{
    color:#ffb3b3;
  }
  .scenario-grid{
    border:1px solid rgba(231,191,99,0.4);
    border-radius:10px;
    padding:10px 12px;
    margin:10px 0;
    background:rgba(8,14,26,0.9);
  }
  .scenario-title{
    font-size:13px;
    margin:0 0 6px;
    color:#f0dca0;
  }
  .scenario-row{
    display:grid;
    grid-template-columns:minmax(0,1fr) minmax(0,1.3fr) minmax(0,1.7fr);
    gap:6px;
    align-items:center;
    font-size:11px;
    padding:4px 0;
    border-top:1px solid rgba(255,255,255,0.04);
  }
  .scenario-row:first-of-type{
    border-top:none;
  }
  .scenario-label{
    font-weight:600;
    color:#f5d89b;
  }
  .scenario-range{
    color:#fff;
  }
  .scenario-note{
    color:#d0d0d0;
    font-size:10px;
  }
  .pro-tips-box{
    border:1px solid rgba(231,191,99,0.4);
    border-radius:10px;
    padding:10px 12px;
    margin:10px 0;
    background:rgba(7,14,26,0.9);
  }
  .pro-tips-box h4{
    font-size:13px;
    margin:0 0 6px;
    color:#f0dca0;
  }
  .pro-tips-box .bullets{
    margin:0;
    padding-left:18px;
  }
  .pro-tips-box .bullets li{
    font-size:11px;
    color:#ddd;
    margin-bottom:4px;
  }
  @media (max-width:640px){
    .est-break-row{
      grid-template-columns:minmax(0,1.2fr) minmax(0,1.8fr) auto;
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

