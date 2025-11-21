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

  // Add-on panel DOM (optional – only used if present in HTML)
  const addonsPanel = document.getElementById("est-addons-panel");
  
  // FIX: Change 1 - Updated to track low/high totals instead of just the average value
  let extraAddonsLow = 0;  // NEW: running total low end for selected smart add-ons
  let extraAddonsHigh = 0; // NEW: running total high end for selected smart add-ons

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
      minHigh: 8500,
      leadSensitive: false,
      permit: "none"
    },
    "kitchen": {
      mode: "scope",
      leadSensitive: false,
      permit: "likely",
      scopes: {
        "refresh": {
          label: "Cabinet refresh / appliance swap (no layout change)",
          low: 12000,
          high: 28000
        },
        "standard": {
          label: "Standard kitchen remodel (new cabinets, counters, tile)",
          low: 32000,
          high: 55000
        },
        "high-end": {
          label: "Full custom layout, higher-end kitchen",
          low: 55000,
          high: 90000
        }
      }
    },
    "bathroom": {
      mode: "area",
      label: "Approx. finished bathroom area (sq. ft.)",
      minArea: 40,
      maxArea: 120,
      perSqLow: 180,
      perSqHigh: 350,
      minLow: 12000,
      minHigh: 28000,
      leadSensitive: false,
      permit: "likely"
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
    "flooring": {
      mode: "area",
      label: "Approx. floor area (sq. ft.)",
      minArea: 250,
      maxArea: 3000,
      perSqLow: 8,
      perSqHigh: 22,
      minLow: 3500,
      minHigh: 18000,
      leadSensitive: false,
      permit: "none"
    },
    "drywall": {
      mode: "area",
      label: "Approx. wall/ceiling area (sq. ft.)",
      minArea: 300,
      maxArea: 6000,
      perSqLow: 3.5,
      perSqHigh: 8,
      minLow: 2500,
      minHigh: 15000,
      leadSensitive: false,
      permit: "maybe"
    },
    "interior-doors": {
      mode: "area",
      label: "Approx. number of doors",
      minArea: 3,
      maxArea: 20,
      perSqLow: 300,
      perSqHigh: 750,
      minLow: 1500,
      minHigh: 15000,
      leadSensitive: false,
      permit: "none"
    },
    "closets": {
      mode: "area",
      label: "Approx. linear feet of closet systems",
      minArea: 10,
      maxArea: 60,
      perSqLow: 180,
      perSqHigh: 450,
      minLow: 1800,
      minHigh: 15000,
      leadSensitive: false,
      permit: "none"
    },
    "smart-home": {
      mode: "scope",
      leadSensitive: false,
      permit: "none",
      scopes: {
        "security": {
          label: "Basic security/automation package (locks, doorbell)",
          low: 1500,
          high: 4000
        },
        "lighting": {
          label: "Smart lighting/shades package (4–8 rooms)",
          low: 3500,
          high: 8000
        },
        "full-home": {
          label: "Whole-home integration and network setup",
          low: 8000,
          high: 22000
        }
      }
    },
    "handyman": {
      mode: "scope",
      leadSensitive: false,
      permit: "none",
      scopes: {
        "half-day": {
          label: "Half-day small job (4 hours, 1 worker)",
          low: 350,
          high: 650
        },
        "full-day": {
          label: "Full-day small/medium job (8 hours, 1–2 workers)",
          low: 650,
          high: 1400
        },
        "multi-day": {
          label: "Multi-day job (small renovation, complex repairs)",
          low: 1400,
          high: 4500
        }
      }
    }
  };

  // ==========================
  // COST COEFFICIENTS
  // ==========================
  const COEFFICIENT_CONFIG = {
    // Borough Multipliers (relative to Queens=1.00)
    borough: {
      "staten-island": 0.95,
      "queens": 1.00,
      "brooklyn": 1.05,
      "bronx": 1.10,
      "manhattan": 1.20,
      "nj-north": 0.90,
      "nj-central": 0.85
    },
    // Building Type Multipliers
    building: {
      "house-sf": 1.00,
      "house-mf": 1.10, // Multi-family has more complexity/access issues
      "apartment": 1.20, // Condos/co-ops have stricter rules/access
      "commercial": 1.30
    },
    // Finish Multipliers
    finish: {
      "basic": 0.90,
      "standard": 1.00,
      "premium": 1.15,
      "luxury": 1.35
    },
    // Urgency Multipliers
    urgency: {
      "standard": 1.00,
      "quick": 1.10,
      "emergency": 1.30
    },
    // Lead Paint Multiplier (if house pre-1978 and lead is present/suspected)
    lead: {
      "yes": 1.15, // 15% increase for lead-safe work practices
      "no": 1.00
    },
    // Mandatory Add-Ons (Approximate Ranges)
    dumpster: {
      "yes": { low: 800, high: 1800 },
      "no": { low: 0, high: 0 }
    },
    demo: {
      "yes": { low: 500, high: 2000 },
      "no": { low: 0, high: 0 }
    },
    permit: {
      "yes": { low: 1000, high: 3500 }, // Typical DOB permit range
      "no": { low: 0, high: 0 }
    }
  };

  // ==========================
  // ESTIMATOR LOGIC
  // ==========================

  // FIX: Change 2 - Updated the checkbox listener to correctly track low/high totals
  if (addonsPanel){
    const checkboxes = addonsPanel.querySelectorAll(".addon-checkbox");
    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        let totalLow = 0;
        let totalHigh = 0;
        const boxes = addonsPanel.querySelectorAll(".addon-checkbox");
        boxes.forEach(box => {
          if (box.checked){
            const low = Number(box.dataset.addonLow) || 0;
            const high = Number(box.dataset.addonHigh) || 0;
            totalLow += low; // Track Low
            totalHigh += high; // Track High
          }
        });
        extraAddonsLow = totalLow;  // Store the low total
        extraAddonsHigh = totalHigh; // Store the high total

        // For display: show the average of the low/high total range
        const displayAvg = (totalLow + totalHigh) / 2;
        const totalSpan = addonsPanel.querySelector("#est-addons-total-val");
        totalSpan.textContent = formatMoney(displayAvg);
      });
    });
  }


  function calculateEstimate(evt){
    evt.preventDefault();

    // 1. Get input values and config
    const svc           = serviceEl.value;
    const borough       = boroughEl.value;
    const building      = buildingEl.value;
    let area            = parseInt(sizeInput.value || "0", 10);
    const finish        = finishEl.value;
    const urgency       = urgencyEl.value;
    const lead          = leadEl.value;
    const dumpster      = dumpsterEl.value;
    const demo          = demoEl.value;
    const permit        = permitEl.value;
    const brand         = brandSelect.value;
    const cfg           = SERVICE_CONFIG[svc];
    let usedArea        = 0;
    let usedScopeLabel  = "";
    let brandName       = brandSelect.querySelector(`option[value="${brand}"]`)?.textContent || "";

    if (!svc || !cfg){
      resultBox.innerHTML = "<p>Please select a service type.</p>";
      return;
    }

    // 2. Determine Base Price Range (before multipliers)
    let baseLow, baseHigh;

    if (cfg.mode === "area"){
      if (!area || area <= 0){
        resultBox.innerHTML = "<p>Please enter an approximate size (sq. ft. or openings).</p>";
        return;
      }
      const minArea = cfg.minArea || 1;
      const maxArea = cfg.maxArea || 5000;
      area = Math.max(minArea, Math.min(area, maxArea));
      usedArea = area;

      // Base calculation
      baseLow = cfg.perSqLow * area;
      baseHigh = cfg.perSqHigh * area;

      // Apply minimums
      if (cfg.minLow && baseLow < cfg.minLow) baseLow = cfg.minLow;
      if (cfg.minHigh && baseHigh < cfg.minHigh) baseHigh = cfg.minHigh;

    } else if (cfg.mode === "scope"){
      const scopeVal = scopeSelect.value;
      const scopeCfg = cfg.scopes && cfg.scopes[scopeVal];
      if (!scopeCfg){
        resultBox.innerHTML = "<p>Please choose a scope level.</p>";
        return;
      }
      baseLow = scopeCfg.low;
      baseHigh = scopeCfg.high;
      usedScopeLabel = scopeCfg.label;
    }

    // 2b. Override/Adjustments based on service-specific advanced inputs
    let factor = 1.0;

    // Apply complexity factors for specific projects
    if (svc === "masonry"){
      const masonryFocus = masonryFocusEl.value;
      const driveExisting = driveExistingEl.value;
      const driveRemove = driveRemoveEl.value;
      const driveAccess = driveAccessEl.value;

      if (masonryFocus === "steps-walk"){ factor *= 1.10; }
      else if (masonryFocus === "repair"){ factor *= 1.15; } // Repair is often more complex than new install

      if (svc === "driveway"){
        if (driveExisting === "asphalt"){ factor *= 1.08; }
        else if (driveExisting === "pavers"){ factor *= 1.12; }
        if (driveRemove === "yes"){ factor *= 1.05; }
        if (driveAccess === "poor"){ factor *= 1.15; }
      }
    }

    if (svc === "roofing"){
      const tearoff = roofTearoffEl.value;
      const pitch = roofPitchEl.value;
      const height = roofHeightEl.value;

      if (tearoff === "multi"){ factor *= 1.10; } // Multi-layer tearoff is harder
      if (pitch === "steep"){ factor *= 1.15; }
      if (height === "4-plus"){ factor *= 1.15; }
    }

    if (svc === "siding"){
      const removeType = sidingRemoveEl.value;
      const stories = sidingStoriesEl.value;

      if (removeType === "wood"){ factor *= 1.08; }
      else if (removeType === "stucco"){ factor *= 1.18; }
      if (stories === "3"){ factor *= 1.12; }
    }

    if (svc === "windows"){
      const winCount = parseInt(windowCountEl.value || "0",10);
      const doorCount = parseInt(doorCountEl.value || "0",10);
      let openingsCount = winCount + doorCount;
      if (!openingsCount || openingsCount < 3){ openingsCount = 3; }

      // Special calculation for windows based on count
      baseLow = SERVICE_CONFIG["windows"].perSqLow * openingsCount;
      baseHigh = SERVICE_CONFIG["windows"].perSqHigh * openingsCount;

      if (SERVICE_CONFIG["windows"].minLow && baseLow < SERVICE_CONFIG["windows"].minLow) baseLow = SERVICE_CONFIG["windows"].minLow;
      if (SERVICE_CONFIG["windows"].minHigh && baseHigh < SERVICE_CONFIG["windows"].minHigh) baseHigh = SERVICE_CONFIG["windows"].minHigh;

      usedArea = openingsCount; // Update usedArea for display/email
    }


    // 3. Apply Multipliers
    const boroughFactor = COEFFICIENT_CONFIG.borough[borough] || 1.0;
    const buildingFactor = COEFFICIENT_CONFIG.building[building] || 1.0;
    const finishFactor = COEFFICIENT_CONFIG.finish[finish] || 1.0;
    const urgencyFactor = COEFFICIENT_CONFIG.urgency[urgency] || 1.0;
    const leadFactor = (cfg.leadSensitive && lead === "yes") ? COEFFICIENT_CONFIG.lead["yes"] : 1.0;

    factor *= boroughFactor * buildingFactor * finishFactor * urgencyFactor * leadFactor;

    baseLow = Math.round(baseLow * factor);
    baseHigh = Math.round(baseHigh * factor);

    // 4. Add mandatory addons (dumpster, demo, permits)
    const dumpsterVal = (dumpster === "yes") ? COEFFICIENT_CONFIG.dumpster.yes.low : 0;
    const demoVal = (demo === "yes") ? COEFFICIENT_CONFIG.demo.yes.low : 0;
    const permitVal = (permit === "yes") ? COEFFICIENT_CONFIG.permit.yes.low : 0; // Use the low-end of permit range for estimate
    let addOnsTotal = dumpsterVal + demoVal + permitVal; // Total of DDP (Dumpster, Demo, Permit)

    // Apply the DDP total to the base range
    baseLow += addOnsTotal;
    baseHigh += addOnsTotal;

    // --- START: Smart Add-Ons Integration FIX (Change 3 - Add Smart Add-Ons to the total) ---
    let smartAddonsText = "";
    if (extraAddonsLow > 0) {
      // 1. Add the Smart Add-on totals to the project's price range
      baseLow += extraAddonsLow;
      baseHigh += extraAddonsHigh;

      // 2. Prepare text for the email body (using the full range)
      const formattedLow = extraAddonsLow.toLocaleString("en-US");
      const formattedHigh = extraAddonsHigh.toLocaleString("en-US");
      smartAddonsText = `Smart Add-Ons (range): $${formattedLow} – $${formattedHigh}`;
    }
    // --- END: Smart Add-Ons Integration FIX ---


    // 5. Final Calculations
    const finalLow = baseLow;
    const finalHigh = baseHigh;
    const finalMid = Math.round((finalLow + finalHigh) / 2);
    const softLow = Math.round(finalLow * SCENARIO_CONFIG.basic.factor);
    const softHigh = Math.round(finalHigh * SCENARIO_CONFIG.luxury.factor);

    // 6. Cost Breakdown Calculation (for visual only)
    const baseCostMid = Math.round((baseLow + baseHigh) / 2) - addOnsTotal; // The core project cost without add-ons
    const smartAddOnsMid = Math.round((extraAddonsLow + extraAddonsHigh) / 2);
    const totalWithAllAddons = finalMid;

    let laborPct = 70;
    let addonPct = 30;

    if (totalWithAllAddons > 0) {
      const allAddonsTotal = addOnsTotal + smartAddOnsMid;
      addonPct = Math.min(45, Math.round((allAddonsTotal / totalWithAllAddons) * 100));
      laborPct = 100 - addonPct;
    }

    // Cost Breakdown Text
    let addOnsAllTotal = addOnsTotal + smartAddOnsMid;
    let smartAddonsVal = extraAddonsLow > 0; // True if smart add-ons are selected


    // 7. Render Results
    const svcLabel = serviceEl.options[serviceEl.selectedIndex].textContent;
    const finishLabel = finishEl.options[finishEl.selectedIndex].textContent;
    const urgencyLabel = urgencyEl.options[urgencyEl.selectedIndex].textContent;
    const boroughText = boroughEl.options[boroughEl.selectedIndex].textContent;
    const buildingText = buildingEl.options[buildingEl.selectedIndex].textContent;
    const leadSummary = lead === "yes" ? "Pre-1978/Lead Protocol Required" : "Post-1978/Not Required";

    // Dynamic Complexity Score (based on multipliers)
    const complexity = getComplexityScore(factor);

    // Get market averages for confidence meter
    const averages = getNationalAndNycAverages(svc, area);

    // Monthly estimate (conversation only)
    const monthlyEst = finalMid > 0 ? (finalMid / 120) : 0; // 10-year divide (conversation only)

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

    // EMAIL BODY LINES (with SOW + UPSELL + TERMS)
    const sowEmailLines = buildScopeOfWorkTextLines(svc, svcLabel);
    const upsellEmailLines = buildUpsellsTextLines(svc);
    const termsEmailLines = buildTermsTextLines();

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
      " Dumpster: $" + dumpsterVal.toLocaleString("en-US"),
      " Demolition: $" + demoVal.toLocaleString("en-US"),
      " DOB Permit (approx): $" + permitVal.toLocaleString("en-US"),
      // FIX: Change 4 - Use the new smartAddonsText variable for the email body
      smartAddonsText || " (No Smart Add-Ons Selected)",
      "",
      "--- Project Cost Estimate ---",
      "BALLPARK RANGE: $" + finalLow.toLocaleString("en-US") + " – $" + finalHigh.toLocaleString("en-US"),
      "",
      "This range is based on the following assumptions and project notes:",
      ...sowEmailLines,
      "",
      "--- Upgrade Options ---",
      ...upsellEmailLines,
      "",
      "--- Key Notes & Conditions ---",
      ...termsEmailLines,
      "",
      "I understand this is a ballpark and not a final contract.",
      "",
      "Best regards,"
    ];

    const emailBody = encodeURIComponent(bodyLines.join("\n"));
    const emailSubject = encodeURIComponent(`Estimate Request: ${svcLabel} in ${boroughText}`);

    // PDF/Print button links
    const pdfLink = `mailto:hammerbrickhome@gmail.com?subject=${emailSubject}&body=${emailBody}`;
    const printLink = "#print-view"; // Uses the print-friendly div below


    // Build HTML for results box
    const resultHtml = `
      <div class="est-range-box">
        <p class="est-range-label">${svcLabel} Ballpark Estimate:</p>
        <p class="range-total-text">
          <span class="range-currency">$</span>${finalLow.toLocaleString("en-US")}
          <span class="range-separator">–</span>
          <span class="range-currency">$</span>${finalHigh.toLocaleString("en-US")}
        </p>
        <p class="monthly-est">Approx. $${Math.round(monthlyEst).toLocaleString("en-US")}/mo over 10 years</p>

        <div class="est-buttons">
          <a href="${pdfLink}" class="pill-btn gold-pill" target="_blank">📧 Email Estimate (For a Quote)</a>
          <a href="${printLink}" class="pill-btn print-pill" onclick="window.print();">🖨️ Print / PDF View</a>
        </div>
      </div>

      <div class="est-avg-box">
        <h4>Confidence Meter</h4>
        ${buildConfidenceMeterHtml(finalMid, averages, softLow, softHigh, svcLabel)}
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
          <div class="est-break-label">Add-Ons & Permits</div>
          <div class="est-break-bar est-break-bar--secondary">
            <div class="est-break-bar-inner" style="width:${addonPct}%;"></div>
          </div>
          <div class="est-break-pct">${addonPct}%</div>
        </div>
        <p class="tiny-note"> Approximate add-ons included in this range: <strong>${formatMoney(addOnsAllTotal)}</strong> (dumpster, demo, permits${smartAddonsVal ? " + smart add-ons" : ""}). </p>
      </div>

      ${insightsHtml}

      <p class="muted" style="margin-bottom:10px;">
        <strong>Assumptions:</strong> ${boroughText} · ${buildingText} · ${finishLabel} finish · ${urgencyLabel} timeline · Complexity: ${complexity.label}
      </p>

      <p class="muted">
        <strong>Disclaimer:</strong> This is a rough ballpark estimate based on common NYC conditions. Your final quote may be higher or lower after an in-person walkthrough.
      </p>

      ${buildPrintFriendlyViewHtml(
        svcLabel,
        finalLow,
        finalHigh,
        monthlyEst,
        boroughText,
        buildingText,
        finishLabel,
        urgencyLabel,
        leadSummary,
        brandName,
        usedArea,
        usedScopeLabel,
        addOnsTotal,
        smartAddonsText,
        complexity,
        averages,
        softLow,
        softHigh,
        baseCostMid,
        laborPct,
        addonPct,
        insightsHtml
      )}
    `;

    resultBox.innerHTML = resultHtml;
    resultBox.scrollIntoView({ behavior: 'smooth' });
  }

  // ==========================
  // HELPER FUNCTIONS
  // ==========================

  function getComplexityScore(factor){
    let label = "Low";
    let desc = "The job appears straightforward with minimal impact from location/building type.";
    let level = "Low";

    if (factor >= 1.25){
      label = "Medium";
      desc = "Moderate complexity due to location, building type, finish, or job size. Requires careful planning.";
      level = "Medium";
    }
    if (factor >= 1.45){
      label = "High";
      desc = "Significant complexity from borough/building type, luxury finishes, or tight timelines. Expect extra coordination and risk factors.";
      level = "High";
    }
    return { label, desc, factor, level };
  }

  function getNationalAndNycAverages(svc, area){
    // Mock data for national and NYC average ranges (per sq ft or per unit)
    const mockAverages = {
      "masonry": { nationalLow: 12, nationalHigh: 20, nycLow: 18, nycHigh: 30 },
      "driveway": { nationalLow: 7, nationalHigh: 15, nycLow: 10, nycHigh: 25 },
      "roofing": { nationalLow: 3.5, nationalHigh: 7, nycLow: 4, nycHigh: 10 },
      "siding": { nationalLow: 4.5, nationalHigh: 9, nycLow: 6, nycHigh: 14 },
      "windows": { nationalLow: 500, nationalHigh: 1200, nycLow: 800, nycHigh: 1800 },
      "exterior-paint": { nationalLow: 2, nationalHigh: 4.5, nycLow: 3, nycHigh: 7 },
      "deck": { nationalLow: 20, nationalHigh: 45, nycLow: 30, nycHigh: 70 },
      "waterproofing": { nationalLow: 15, nationalHigh: 30, nycLow: 20, nycHigh: 45 },
      "power-wash": { nationalLow: 0.4, nationalHigh: 1.2, nycLow: 0.6, nycHigh: 1.8 },
      "sidewalk": { nationalLow: 15, nationalHigh: 28, nycLow: 20, nycHigh: 40 },
      "interior-paint": { nationalLow: 1.2, nationalHigh: 3, nycLow: 1.8, nycHigh: 4 },
      "bathroom": { nationalLow: 150, nationalHigh: 300, nycLow: 200, nycHigh: 400 },
      "basement": { nationalLow: 30, nationalHigh: 70, nycLow: 40, nycHigh: 90 },
      "flooring": { nationalLow: 7, nationalHigh: 18, nycLow: 10, nycHigh: 25 },
      // Scoped services (return mock for comparison, ignore area)
      "fence": { nationalLow: 4000, nationalHigh: 10000, nycLow: 5000, nycHigh: 14000 },
      "landscaping": { nationalLow: 1000, nationalHigh: 3000, nycLow: 1500, nycHigh: 4000 },
      "exterior-lighting": { nationalLow: 3000, nationalHigh: 7000, nycLow: 4000, nycHigh: 9000 },
      "gutters": { nationalLow: 1000, nationalHigh: 3000, nycLow: 1500, nycHigh: 4000 },
      "kitchen": { nationalLow: 30000, nationalHigh: 60000, nycLow: 40000, nycHigh: 80000 },
      "drywall": { nationalLow: 3, nationalHigh: 7, nycLow: 4, nycHigh: 9 },
      "interior-doors": { nationalLow: 250, nationalHigh: 600, nycLow: 350, nycHigh: 800 },
      "closets": { nationalLow: 150, nationalHigh: 400, nycLow: 200, nycHigh: 500 },
      "smart-home": { nationalLow: 3000, nationalHigh: 7000, nycLow: 4000, nycHigh: 9000 },
      "handyman": { nationalLow: 500, nationalHigh: 1200, nycLow: 800, nycHigh: 1800 }
    };

    let cfg = mockAverages[svc];
    if (!cfg || area === 0){
      return { nationalLow: 0, nationalHigh: 0, nycLow: 0, nycHigh: 0 };
    }

    if (SERVICE_CONFIG[svc].mode === "area" && area > 0){
      return {
        nationalLow: cfg.nationalLow * area,
        nationalHigh: cfg.nationalHigh * area,
        nycLow: cfg.nycLow * area,
        nycHigh: cfg.nycHigh * area
      };
    } else {
      return cfg;
    }
  }

  // ==========================
  // EVENT HANDLERS & INITIALIZATION
  // ==========================

  function updateVisibility(){
    const svc = serviceEl.value;
    const cfg = SERVICE_CONFIG[svc];

    // Reset visibility of all advanced groups and input fields
    const allAdv = [advMasonry, advRoof, advSiding, advWindows, advStyle, sizeRow, scopeRow, leadRow, addonsPanel];
    allAdv.forEach(el => { if(el) el.style.display = 'none'; });

    // Handle area vs. scope input visibility
    if (cfg && cfg.mode === "area"){
      if(sizeRow) sizeRow.style.display = 'block';
      if(scopeRow) scopeRow.style.display = 'none';
      if(sizeLabel) sizeLabel.textContent = cfg.label;
    } else if (cfg && cfg.mode === "scope"){
      if(sizeRow) sizeRow.style.display = 'none';
      if(scopeRow) scopeRow.style.display = 'block';
    }

    // Handle lead sensitivity
    if (cfg && cfg.leadSensitive && leadRow) {
      leadRow.style.display = 'flex';
    } else if (leadRow) {
      leadRow.style.display = 'none';
    }

    // Show Smart Add-Ons panel if config exists
    if (addonsPanel && ADDON_CONFIG[svc]){
      addonsPanel.style.display = 'block';
      renderSmartAddons(svc);
    }

    // Show service-specific advanced groups
    if (svc === "masonry" || svc === "driveway" || svc === "sidewalk"){
      if(advMasonry) advMasonry.style.display = 'block';
    } else if (svc === "roofing"){
      if(advRoof) advRoof.style.display = 'block';
    } else if (svc === "siding"){
      if(advSiding) advSiding.style.display = 'block';
    } else if (svc === "windows"){
      if(advWindows) advWindows.style.display = 'block';
    } else if (svc === "kitchen" || svc === "bathroom" || svc === "basement"){
      if(advStyle) advStyle.style.display = 'block';
    }
  }

  function updateRegionNote(){
    const borough = boroughEl.value;
    const isNyc = ["staten-island", "queens", "brooklyn", "bronx", "manhattan"].includes(borough);

    if (regionNoteEl){
      if (isNyc){
        regionNoteEl.innerHTML = "NYC projects have additional complexity and regulatory costs.";
      } else {
        regionNoteEl.innerHTML = "NJ projects often have fewer regulatory costs, leading to potentially lower estimates.";
      }
    }
    // Update permit helper box visibility
    const cfg = SERVICE_CONFIG[serviceEl.value];
    if(permitBox && cfg && cfg.permit !== "none"){
      permitBox.style.display = 'block';
    } else if (permitBox) {
      permitBox.style.display = 'none';
    }
  }

  function renderSmartAddons(svc){
    const config = ADDON_CONFIG[svc];
    if (!addonsPanel || !config) {
      addonsPanel.innerHTML = '';
      addonsPanel.style.display = 'none';
      return;
    }

    let html = `
      <h3 class="addons-title">${config.title}</h3>
      <p class="addons-subnote">${config.subnote}</p>
      <div class="addons-list">
    `;

    config.items.forEach(item => {
      html += `
        <label class="addon-item">
          <input type="checkbox" class="addon-checkbox" name="addon-${item.id}"
            data-addon-low="${item.low}" data-addon-high="${item.high}" >
          <span class="addon-label">${item.label}</span>
          <span class="addon-price">+ ${formatMoney(item.low)} – ${formatMoney(item.high)}</span>
        </label>
      `;
    });

    html += `
      </div>
      <p class="addons-total-row">
        Selected add-ons approx: <span id="est-addons-total-val">$0</span>
      </p>
    `;

    addonsPanel.innerHTML = html;

    // Re-attach event listeners for the newly rendered checkboxes
    const checkboxes = addonsPanel.querySelectorAll(".addon-checkbox");
    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        let totalLow = 0;
        let totalHigh = 0;
        const boxes = addonsPanel.querySelectorAll(".addon-checkbox");
        boxes.forEach(box => {
          if (box.checked){
            const low = Number(box.dataset.addonLow) || 0;
            const high = Number(box.dataset.addonHigh) || 0;
            totalLow += low; // Track Low
            totalHigh += high; // Track High
          }
        });
        extraAddonsLow = totalLow;  // Store the low total
        extraAddonsHigh = totalHigh; // Store the high total

        // For display: show the average of the low/high total range
        const displayAvg = (totalLow + totalHigh) / 2;
        const totalSpan = addonsPanel.querySelector("#est-addons-total-val");
        totalSpan.textContent = formatMoney(displayAvg);
      });
    });
  }


  // ==========================
  // DATA CONFIG
  // ==========================

  const SOW_CONFIG = {
    // ... (Your Scope of Work config)
    "masonry": {
      title: "Scope of Work – Masonry / Paver / Concrete",
      bullets: [
        "Confirm required demolition and disposal of old material (if scoped).",
        "Prepare base with proper grading, compaction, and gravel depth.",
        "Install chosen materials (brick, stone, concrete, pavers) per design.",
        "Ensure proper drainage and slope away from the building.",
        "Clean up and remove debris from the site."
      ]
    },
    "driveway": {
      title: "Scope of Work – Driveway / Parking Lot",
      bullets: [
        "Confirm removal of existing pavement and disposal (if scoped).",
        "Perform necessary base excavation, grading, and compaction.",
        "Install new base layers and apply asphalt or chosen material.",
        "Ensure correct pitch for drainage and secure edges/borders.",
        "Clean up and remove debris from the site."
      ]
    },
    "roofing": {
      title: "Scope of Work – Roofing",
      bullets: [
        "Confirm tear-off and disposal of old roofing layers (if scoped).",
        "Inspect and repair deck sheathing as needed.",
        "Install ice and water shield, felt paper, and flashing.",
        "Apply new roofing materials (shingles, membrane, etc.) per manufacturer.",
        "Ensure proper ventilation and clean up all loose debris."
      ]
    },
    "siding": {
      title: "Scope of Work – Siding",
      bullets: [
        "Confirm removal and disposal of existing siding (if scoped).",
        "Apply or inspect house wrap/vapor barrier.",
        "Install new siding material (vinyl, wood, fiber cement) per code.",
        "Install new trim, fascia, and soffit where necessary.",
        "Clean up and remove debris from the site."
      ]
    },
    "windows": {
      title: "Scope of Work – Window / Door Replacement",
      bullets: [
        "Remove old windows/doors and associated interior/exterior trim.",
        "Prepare rough openings for new unit installation.",
        "Install and flash new windows/doors, ensuring plumb and square.",
        "Seal and insulate gaps; re-install or replace interior/exterior trim.",
        "Clean glass and remove construction debris."
      ]
    },
    "exterior-paint": {
      title: "Scope of Work – Exterior Painting",
      bullets: [
        "Scrape loose paint, sand, and clean surfaces.",
        "Perform minor patching and caulking of cracks/gaps.",
        "Apply primer (if needed) and 1–2 coats of exterior paint.",
        "Protect non-painted surfaces (windows, roof, landscaping).",
        "Clean up and remove all masking materials."
      ]
    },
    "deck": {
      title: "Scope of Work – Deck / Patio Build",
      bullets: [
        "Excavate and pour footings or prepare a compacted base.",
        "Build structural frame/substructure per plan and code.",
        "Install decking boards and railing/stairs.",
        "Ensure proper fastening and clearances.",
        "Clean up and remove debris from the site."
      ]
    },
    "fence": {
      title: "Scope of Work – Fence Installation",
      bullets: [
        "Dig/set posts in concrete per local code and depth.",
        "Install fence rails, panels, and gates as per design.",
        "Ensure fence line is straight, plumb, and secured.",
        "Confirm gate operation and latch security.",
        "Clean up and remove all debris."
      ]
    },
    "waterproofing": {
      title: "Scope of Work – Exterior/Interior Waterproofing",
      bullets: [
        "Locate and address points of water entry (crack repair, drainage).",
        "Apply sealing or barrier systems (interior or exterior).",
        "Install interior French drain or sump pump (if scoped).",
        "Ensure proper function and clean up work area."
      ]
    },
    "power-wash": {
      title: "Scope of Work – Power Washing",
      bullets: [
        "Safely prepare area (cover plants, electrical).",
        "Apply appropriate cleaning solution.",
        "Use controlled pressure to clean surfaces (siding, concrete, deck).",
        "Rinse thoroughly.",
        "Tidy up and restore original conditions."
      ]
    },
    "landscaping": {
      title: "Scope of Work – Landscaping / Yard Care",
      bullets: [
        "Define scope (mowing, trimming, planting, cleanup).",
        "Perform scheduled maintenance or one-time cleanup.",
        "Dispose of yard waste properly.",
        "Ensure beds and hardscapes are clean and edged."
      ]
    },
    "exterior-lighting": {
      title: "Scope of Work – Exterior Lighting",
      bullets: [
        "Confirm fixture locations, wiring path, and voltage.",
        "Run low-voltage wiring and install transformer.",
        "Install fixtures, ensuring proper aiming and weatherproofing.",
        "Test system operation and basic controls."
      ]
    },
    "sidewalk": {
      title: "Scope of Work – Sidewalk / Concrete Repair",
      bullets: [
        "Confirm demolition of damaged sections and disposal.",
        "Prepare base and forms per DOT/local specifications.",
        "Pour, finish, and cure new concrete.",
        "Install expansion joints and ensure correct slope.",
        "Clean up and remove all debris."
      ]
    },
    "gutters": {
      title: "Scope of Work – Gutter Maintenance / Replacement",
      bullets: [
        "Clear debris from gutters and downspouts.",
        "Perform minor repairs or full replacement (if scoped).",
        "Ensure proper pitch for water flow.",
        "Seal end caps and connections.",
        "Dispose of waste and clear blockages."
      ]
    },
    "interior-paint": {
      title: "Scope of Work – Interior Painting",
      bullets: [
        "Move/cover furniture and protect floors.",
        "Patch small holes, caulk trim, and prep surfaces.",
        "Apply primer (if needed) and 2 coats of paint to walls.",
        "Clean up and put furniture back in place.",
        "Touch-up and remove all tape/drop cloths."
      ]
    },
    "kitchen": {
      title: "Scope of Work – Kitchen Remodel",
      bullets: [
        "Demolish and dispose of old kitchen (if scoped).",
        "Adjust electrical/plumbing per new layout.",
        "Install cabinets, countertops, and appliances.",
        "Install tile backsplash and flooring.",
        "Final clean up, adjusting doors/drawers."
      ]
    },
    "bathroom": {
      title: "Scope of Work – Bathroom Remodel",
      bullets: [
        "Protect adjacent rooms and paths.",
        "Demolish and dispose of old fixtures/tile.",
        "Perform rough plumbing/electrical and moisture-proofing.",
        "Install tile, fixtures, vanity, and toilet.",
        "Final cleaning and detail work."
      ]
    },
    "basement": {
      title: "Scope of Work – Basement Finishing",
      bullets: [
        "Assess moisture and address any water issues.",
        "Build wall/ceiling framing and install drywall.",
        "Install electrical, plumbing, and HVAC as scoped.",
        "Install flooring, trim, and doors.",
        "Final cleaning and turnover."
      ]
    },
    "flooring": {
      title: "Scope of Work – Flooring Install",
      bullets: [
        "Remove and dispose of old flooring (if scoped).",
        "Prepare subfloor (leveling, patching).",
        "Install new flooring (hardwood, LVP, tile).",
        "Install baseboards and transition strips.",
        "Clean up and remove debris."
      ]
    },
    "drywall": {
      title: "Scope of Work – Drywall / Finishing",
      bullets: [
        "Install sheetrock (drywall) on walls and ceilings.",
        "Tape, mud, and sand seams for smooth finish.",
        "Apply final skim coat or texture (if required).",
        "Clean up dust and leave ready for paint or touch-up."
      ]
    },
    "interior-doors": {
      title: "Scope of Work – Door & Trim Install",
      bullets: [
        "Remove existing doors and trim (if scoped).",
        "Install new pre-hung or slab doors in existing frames.",
        "Install new casing and baseboard trim.",
        "Adjust and install hardware (hinges, knobs).",
        "Secure nail holes and leave ready for paint or touch-up."
      ]
    },
    "closets": {
      title: "Scope of Work – Closet / Storage Buildouts",
      bullets: [
        "Confirm shelving layout, hanging sections, and specialty features.",
        "Install rails, panels, rods, and shelving per system design.",
        "Secure fasteners into suitable framing or anchors.",
        "Adjust doors/fronts if part of scope.",
        "Clean up and remove packaging."
      ]
    },
    "smart-home": {
      title: "Scope of Work – Smart Home Upgrades",
      bullets: [
        "Confirm device locations, Wi-Fi coverage, and app ecosystem.",
        "Install doorbells, cameras, locks, and hubs per plan.",
        "Run low-voltage wiring where required (ethernet, power).",
        "Connect devices to the network and test functionality.",
        "Provide basic user training and troubleshooting guide."
      ]
    },
    "handyman": {
      title: "Scope of Work – Handyman Visit",
      bullets: [
        "Perform task list as agreed upon for the time block.",
        "Bring necessary tools and common materials (fasteners, caulk).",
        "Ensure quality repair or installation for small jobs.",
        "Clean up the work area before leaving."
      ]
    }
  };

  const UPSELL_CONFIG = {
    // ... (Your Upsell config)
    "masonry": {
      title: "Popular Masonry / Paver Upgrades",
      bullets: [
        "Upgrade to specialty brick, bluestone, or stamped concrete.",
        "Add a decorative border or soldier course.",
        "Include polymeric joint sand and/or sealing for longevity."
      ]
    },
    "driveway": {
      title: "Popular Driveway Upgrades",
      bullets: [
        "Upgrade to decorative paver banding or stone edging.",
        "Add extra drainage solutions or trench drains.",
        "Install heated mats/cables for snow melt (rough-in)."
      ]
    },
    "roofing": {
      title: "Popular Roofing Upgrades",
      bullets: [
        "Upgrade to architectural shingles or specialty slate/tile look.",
        "Install full ice and water shield for maximum protection.",
        "Add ridge vents for better attic ventilation."
      ]
    },
    "siding": {
      title: "Popular Siding Upgrades",
      bullets: [
        "Upgrade to high-end siding (cedar, fiber cement, or specialty vinyl).",
        "Add extra layers of insulation/house wrap.",
        "Include decorative trim, shutters, or accent panels."
      ]
    },
    "windows": {
      title: "Popular Window / Door Upgrades",
      bullets: [
        "Upgrade to triple-pane, low-e, or noise-reducing laminated glass.",
        "Choose high-end trim/casing packages for a custom look.",
        "Select premium hardware and security features."
      ]
    },
    "exterior-paint": {
      title: "Popular Exterior Paint Upgrades",
      bullets: [
        "Use premium, long-life elastomeric paints.",
        "Include full window glazing and trim detail work.",
        "Add a second color for trim/accents."
      ]
    },
    "deck": {
      title: "Popular Deck / Patio Upgrades",
      bullets: [
        "Upgrade to high-end composite decking (Trex, Azek).",
        "Install lighting packages for stairs and railings.",
        "Add a built-in privacy wall, planter, or bench."
      ]
    },
    "fence": {
      title: "Popular Fence Upgrades",
      bullets: [
        "Upgrade to premium wood (cedar) or custom ornamental metal.",
        "Add automated or high-security gate hardware.",
        "Include privacy screens or lattice toppers."
      ]
    },
    "waterproofing": {
      title: "Popular Waterproofing Upgrades",
      bullets: [
        "Upgrade to extended-warranty sealers or coatings.",
        "Install dedicated dehumidification or ventilation systems.",
        "Combine with exterior drainage improvements."
      ]
    },
    "power-wash": {
      title: "Popular Power Washing Upgrades",
      bullets: [
        "Add a soft-wash treatment for delicate surfaces (roofing, siding).",
        "Include a concrete or paver sealing treatment."
      ]
    },
    "landscaping": {
      title: "Popular Landscaping Upgrades",
      bullets: [
        "Install a full landscape design and planting plan.",
        "Add low-voltage landscape lighting.",
        "Include automatic irrigation/sprinkler system installation."
      ]
    },
    "exterior-lighting": {
      title: "Popular Exterior Lighting Upgrades",
      bullets: [
        "Upgrade to commercial-grade, fully adjustable LED fixtures.",
        "Add smart controls, motion sensors, or dimming features.",
        "Include accent lighting for trees or architectural features."
      ]
    },
    "sidewalk": {
      title: "Popular Sidewalk Upgrades",
      bullets: [
        "Upgrade to stamped or colored concrete.",
        "Add a decorative border or finish.",
        "Include specialized snow-melt cables (where feasible)."
      ]
    },
    "gutters": {
      title: "Popular Gutter Upgrades",
      bullets: [
        "Upgrade to larger capacity (K-style) or seamless gutters.",
        "Install high-quality gutter guards on all main runs.",
        "Add heat cables to prevent ice dams in trouble spots."
      ]
    },
    "interior-paint": {
      title: "Popular Interior Paint Upgrades",
      bullets: [
        "Upgrade to premium or washable paints for high-use areas.",
        "Add accent walls, ceilings, or trim colors.",
        "Include painting of doors, trims, and built-ins."
      ]
    },
    "kitchen": {
      title: "Popular Kitchen Upgrades",
      bullets: [
        "Upgrade to custom cabinetry and high-end stone countertops.",
        "Include pro-grade appliance packages and specialty plumbing fixtures.",
        "Add custom lighting (under-cabinet, pendants, LED strips)."
      ]
    },
    "bathroom": {
      title: "Popular Bathroom Upgrades",
      bullets: [
        "Install custom tile designs (full-height shower, decorative floor).",
        "Upgrade to a frameless glass shower enclosure.",
        "Add comfort features (heated floor, high-end exhaust fan)."
      ]
    },
    "basement": {
      title: "Popular Basement Finishing Upgrades",
      bullets: [
        "Upgrade to egress windows or well systems (if allowed).",
        "Add soundproofing to the ceiling or walls.",
        "Install a built-in bar or custom entertainment center."
      ]
    },
    "flooring": {
      title: "Popular Flooring Upgrades",
      bullets: [
        "Upgrade to wider planks or higher-end finishes.",
        "Add sound underlayment where helpful (multi-family/condos).",
        "Include stair treads, nosings, and railing touch-ups."
      ]
    },
    "drywall": {
      title: "Popular Drywall/Finishing Upgrades",
      bullets: [
        "Upgrade to a higher smoothness level where feasible.",
        "Add decorative trims, beams, or panel details.",
        "Include full-room repainting after skim coat."
      ]
    },
    "interior-doors": {
      title: "Popular Door & Trim Upgrades",
      bullets: [
        "Upgrade to solid-core or specialty doors.",
        "Add higher profile casings/baseboards.",
        "Include upgraded hardware (hinges, levers, handles)."
      ]
    },
    "closets": {
      title: "Popular Closet Upgrades",
      bullets: [
        "Upgrade to solid wood or custom-built closet systems.",
        "Add specialty lighting, tie racks, or shoe cubbies.",
        "Include integrated drawer systems and locking sections."
      ]
    },
    "smart-home": {
      title: "Popular Smart Home Upgrades",
      bullets: [
        "Add dedicated Wi-Fi access points for better coverage.",
        "Include specialized devices (smart blinds, air quality sensors).",
        "Integrate with existing systems (HVAC, garage doors)."
      ]
    },
    "handyman": {
      title: "Popular Small Job Add-Ons",
      bullets: [
        "Bundle multiple small repairs into one visit.",
        "Add minor caulking and touch-up painting.",
        "Install small accessories (shelves, hooks, rods) while on site."
      ]
    }
  };


  // Scenario bands: Basic / Premium / Luxury
  const SCENARIO_CONFIG = {
    basic: {
      label: "Basic",
      factor: 0.90,
      desc: "Tighter budget, more standard selections."
    },
    premium: {
      label: "Premium",
      factor: 1.00,
      desc: "Balanced mix of quality and value."
    },
    luxury: {
      label: "Luxury",
      factor: 1.25,
      desc: "High-end materials, custom work, and advanced features."
    }
  };

  // ==========================
  // HELPERS
  // ==========================

  function formatMoney(num){
    return "$" + Math.round(num).toLocaleString("en-US");
  }

  function formatMonthly(num){
    if (!num || num <= 0) return "$0/mo";
    return "$" + Math.round(num).toLocaleString("en-US") + "/mo (10 yr)";
  }

  function getBarWidth(value, low, high){
    const min = Math.max(0, low - (high - low)); // Ensure range starts reasonable
    const max = high + (high - low);
    let pct = 0;

    if (max > min) {
      pct = ((value - min) / (max - min)) * 100;
    }

    return Math.max(5, Math.min(95, pct));
  }

  function buildConfidenceMeterHtml(mid, averages, softLow, softHigh, svcLabel){
    const nycMid = (averages.nycLow + averages.nycHigh) / 2;
    const nationalMid = (averages.nationalLow + averages.nationalHigh) / 2;

    const midBar = getBarWidth(mid, softLow, softHigh);
    const nycBar = getBarWidth(nycMid, softLow, softHigh);
    const nationalBar = getBarWidth(nationalMid, softLow, softHigh);

    const comparisonNote = mid < averages.nycLow ? "below" : mid > averages.nycHigh ? "above" : "within";

    return `
      <p class="tiny-note">Your cost range is relative to typical Basic (${formatMoney(softLow)}) and Luxury (${formatMoney(softHigh)}) finishes.</p>
      <div class="meter-labels">
        <span class="meter-label-low">${SCENARIO_CONFIG.basic.label}</span>
        <span class="meter-label-mid">Your Estimate</span>
        <span class="meter-label-high">${SCENARIO_CONFIG.luxury.label}</span>
      </div>
      <div class="meter-bar">
        <div class="meter-pointer" style="left:${midBar}%;" title="Your Estimate: ${formatMoney(mid)}"></div>
      </div>
      <div class="meter-comparison">
        <div class="meter-labels">
          <span class="meter-label-compare" style="left:${nationalBar}%;">National Avg</span>
          <span class="meter-label-compare" style="left:${nycBar}%;">NYC Avg</span>
        </div>
      </div>
      <p class="meter-footer">
        Your estimate is **${comparisonNote}** typical NYC-area ranges for similar projects.
      </p>
    `;
  }

  function buildSmartInsightsHtml(data){
    const { svc, svcLabel, complexity, cfg, boroughText, buildingText, finishLabel, urgencyLabel } = data;
    const items = [];

    // Complexity Insight
    items.push(`**Complexity Score (${complexity.label})**: ${complexity.desc}`);

    // Regional/Building/Finish Insight
    items.push(`**Your Project Profile**: ${boroughText}, ${buildingText}, ${finishLabel} finish, ${urgencyLabel} timeline.`);

    // Permits
    if (cfg && cfg.permit === "likely"){
      items.push("This project type **likely requires DOB permits** for compliance and safety.");
    } else if (cfg && cfg.permit === "maybe"){
      items.push("Permits are **required for larger scope** of this project, but not always for smaller jobs.");
    } else if (cfg && cfg.permit === "none"){
      items.push("This project is typically considered cosmetic and **does not require permits**.");
    }

    // Pro Tip
    const tip = PRO_TIPS_CONFIG[svc];
    if (tip && tip.tip){
      items.push(`**Pro Tip**: ${tip.tip}`);
    }

    // Final Action
    items.push("We recommend a free site walkthrough to confirm conditions and lock in a final price.");

    const itemsHtml = items.map(i => `<li>${i}</li>`).join("");

    return `
      <div class="section-box">
        <h2 class="section-title">Smart Insights & Pro Tips</h2>
        <ul class="section-list">
          ${itemsHtml}
        </ul>
      </div>
    `;
  }

  // ==========================
  // EMAIL/PDF BUILDERS
  // ==========================

  function buildPrintFriendlyViewHtml(
      svcLabel, finalLow, finalHigh, monthlyEst, boroughText, buildingText,
      finishLabel, urgencyLabel, leadSummary, brandName, usedArea, usedScopeLabel,
      addOnsTotal, smartAddonsText, complexity, averages, softLow, softHigh,
      baseCostMid, laborPct, addonPct, insightsHtml
  ){
    // This is the HTML that gets styled for print/PDF view
    return `
      <div id="print-view" class="print-view-container">
        <div class="header-box">
          <h2>Project Ballpark Estimate</h2>
          <p class="date">Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="main-summary">
          <div class="summary-item">
            <span class="summary-label">Project:</span>
            <span class="summary-value">${svcLabel}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Estimate Range:</span>
            <span class="summary-value-range">${formatMoney(finalLow)} – ${formatMoney(finalHigh)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Monthly Est:</span>
            <span class="summary-value">${formatMonthly(monthlyEst)}</span>
          </div>
        </div>

        ${buildProjectDetailsHtml(
          boroughText, buildingText, finishLabel, urgencyLabel, leadSummary, brandName, usedArea, usedScopeLabel
        )}

        ${buildBreakdownHtml(
          addOnsTotal, smartAddonsText, baseCostMid, laborPct, addonPct
        )}

        ${buildConfidenceMeterPrintHtml(
          (finalLow + finalHigh) / 2, averages, softLow, softHigh
        )}

        ${buildScopeOfWorkHtml(serviceEl.value, svcLabel)}
        ${buildUpsellsHtml(serviceEl.value)}
        ${buildTermsHtml()}
      </div>
    `;
  }

  function buildProjectDetailsHtml(boroughText, buildingText, finishLabel, urgencyLabel, leadSummary, brandName, usedArea, usedScopeLabel){
    const items = [
      `**Location**: ${boroughText}`,
      `**Building Type**: ${buildingText}`,
      `**Finish Level**: ${finishLabel}`,
      `**Timeline**: ${urgencyLabel}`,
      `**Lead Status**: ${leadSummary}`
    ];
    if(usedArea) items.push(`**Size**: ${usedArea} sq ft / openings`);
    if(usedScopeLabel) items.push(`**Scope Level**: ${usedScopeLabel}`);
    if(brandName) items.push(`**Preferred Brand**: ${brandName}`);

    const itemsHtml = items.map(b => `<li>${b}</li>`).join("");
    return `
      <div class="section-box">
        <h2 class="section-title">Project Details</h2>
        <ul class="section-list">
          ${itemsHtml}
        </ul>
      </div>
    `;
  }

  function buildBreakdownHtml(addOnsTotal, smartAddonsText, baseCostMid, laborPct, addonPct){
    const items = [
      `Core Project Cost (Materials & Labor): ${formatMoney(baseCostMid)}`
    ];

    if (addOnsTotal > 0){
      items.push(`Mandatory Add-Ons (Dumpster, Demo, Permit): ${formatMoney(addOnsTotal)}`);
    }

    // Only include Smart Add-Ons if the text was generated (meaning items were selected)
    if (smartAddonsText){
      // smartAddonsText contains the full range.
      items.push(`Smart Add-Ons Selected: ${smartAddonsText.replace("Smart Add-Ons (range): ", "")}`);
    }

    const totalCostText = items.join("<br>");

    return `
      <div class="section-box">
        <h2 class="section-title">Cost Breakdown Summary</h2>
        <div class="breakdown-total">${totalCostText}</div>
        <div class="est-breakdown-box">
          <div class="est-break-row">
            <div class="est-break-label">Labor + Materials</div>
            <div class="est-break-bar">
              <div class="est-break-bar-inner" style="width:${laborPct}%;"></div>
            </div>
            <div class="est-break-pct">${laborPct}%</div>
          </div>
          <div class="est-break-row">
            <div class="est-break-label">Add-Ons & Permits</div>
            <div class="est-break-bar est-break-bar--secondary">
              <div class="est-break-bar-inner" style="width:${addonPct}%;"></div>
            </div>
            <div class="est-break-pct">${addonPct}%</div>
          </div>
        </div>
      </div>
    `;
  }

  function buildConfidenceMeterPrintHtml(mid, averages, softLow, softHigh){
    const comparisonNote = mid < averages.nycLow ? "below" : mid > averages.nycHigh ? "above" : "within";

    return `
      <div class="section-box">
        <h2 class="section-title">Confidence & Comparison</h2>
        <p>This estimate is **${comparisonNote}** the typical NYC-area range. The full range accounts for the difference between a **Basic** (${formatMoney(softLow)}) and **Luxury** (${formatMoney(softHigh)}) finish.</p>
        <p class="tiny-note">This is based on data for National and NYC average costs for this type of project.</p>
      </div>
    `;
  }


  function buildScopeOfWorkHtml(svc, svcLabel){
    const cfg = SOW_CONFIG[svc];
    const bullets = cfg?.bullets || [
      "Review project area and confirm final scope on site.",
      "Perform work described in written estimate and agreement.",
      "Protect nearby areas where practical and clean up work zone."
    ];
    const items = bullets.map(b => `<li>${b}</li>`).join("");

    return `
      <div class="section-box">
        <h2 class="section-title">${cfg?.title || `Scope of Work – ${svcLabel}`} (General)</h2>
        <ul class="section-list">
          ${items}
        </ul>
      </div>
    `;
  }

  function buildUpsellsHtml(svc){
    const cfg = UPSELL_CONFIG[svc];
    if (!cfg) return "";

    const items = cfg.bullets.map(b => `<li>${b}</li>`).join("");

    return `
      <div class="section-box">
        <h2 class="section-title">${cfg.title} (Optional Upgrades)</h2>
        <ul class="section-list">
          ${items}
        </ul>
      </div>
    `;
  }

  function buildTermsHtml(){
    const bullets = [
      "This document is a ballpark estimate only. It is not a formal bid, proposal, or contract.",
      "Final pricing, scope, and schedule are confirmed only in a written estimate and signed agreement.",
      "Range assumes typical access, site conditions, and standard building/code requirements.",
      "Architect/engineer fees, major structural changes, utility upgrades, or hidden conditions are not included unless specifically listed.",
      "Permits, inspections, and municipal fees are approximate and may change based on final scope and agency review."
    ];
    const items = bullets.map(b => `<li>${b}</li>`).join("");

    return `
      <div class="section-box">
        <h2 class="section-title">Key Notes & Conditions</h2>
        <ul class="section-list">
          ${items}
        </ul>
      </div>
    `;
  }

  function buildScopeOfWorkTextLines(svc, svcLabel){
    const cfg = SOW_CONFIG[svc];
    const bullets = cfg?.bullets || [
      "Review project area and confirm final scope on site.",
      "Perform work described in written estimate and agreement.",
      "Protect nearby areas where practical and clean up work zone."
    ];
    // Keep short for email body
    return bullets.slice(0, 3).map(b => `* ${b}`);
  }

  function buildUpsellsTextLines(svc){
    const cfg = UPSELL_CONFIG[svc];
    if (!cfg) return [];

    return cfg.bullets.slice(0, 3).map(b => `* ${b}`);
  }

  function buildTermsTextLines(){
    const bullets = [
      "This is a ballpark estimate only, not a contract.",
      "Final scope, price, and schedule require a signed agreement.",
      "Assumes typical site access and standard conditions."
    ];
    return bullets.map(b => `* ${b}`);
  }

  // ==========================
  // PRO TIPS
  // ==========================

  const PRO_TIPS_CONFIG = {
    // ... (Your Pro Tips config)
    "masonry": {
      tip: "Ensure a strong, compacted base is part of the scope to prevent future shifting and cracking."
    },
    "driveway": {
      tip: "Prioritize proper drainage along the edges and near the garage to protect the foundation and subbase."
    },
    "roofing": {
      tip: "Upgrade your attic ventilation to maximize the life of the new shingles and reduce summer heat buildup."
    },
    "siding": {
      tip: "If removing old siding, consider adding house wrap or insulation for a significant boost to energy efficiency."
    },
    "windows": {
      tip: "Focus on proper air sealing and flashing during installation to get the full noise reduction and energy benefits."
    },
    "exterior-paint": {
      tip: "Proper prep work—scraping, sanding, and priming—is 80% of the job. Don't skip it!"
    },
    "deck": {
      tip: "If using composite, budget for a strong railing and hidden fasteners to get the best look and long-term performance."
    },
    "fence": {
      tip: "Always check local height and setback requirements before installing, especially for shared property lines."
    },
    "waterproofing": {
      tip: "Address exterior grading issues first. Water should always be directed away from the foundation."
    },
    "power-wash": {
      tip: "Using a soft-wash chemical approach is best for avoiding damage to roofing and siding materials."
    },
    "landscaping": {
      tip: "Investing in a thoughtful landscape design plan can drastically improve curb appeal and property value."
    },
    "exterior-lighting": {
      tip: "Use low-voltage LED systems for safety and low running costs. Place lights strategically for security and accent."
    },
    "sidewalk": {
      tip: "Ensure your contractor is aware of and follows local DOT or municipal guidelines for repair, especially on public sidewalks."
    },
    "gutters": {
      tip: "Consider larger downspouts or additional runs if you have a steep roof or a large roof area to handle high rain volumes."
    },
    "interior-paint": {
      tip: "Always budget for two coats of finish paint for rich color and durability, especially when changing from a darker color."
    },
    "kitchen": {
      tip: "Spend time on the layout first. A good workflow trumps fancy appliances for long-term satisfaction."
    },
    "bathroom": {
      tip: "Moisture control is key. Ensure you have a powerful, quiet exhaust fan vented properly to the exterior."
    },
    "basement": {
      tip: "Prioritize water and moisture mitigation before you start finishing. A dry basement is a functional basement."
    },
    "flooring": {
      tip: "Always acclimate wood or LVP flooring inside the house for a week before installation to prevent gapping and warping."
    },
    "drywall": {
      tip: "For high-end finishes, specify a 'Level 5' smooth finish to prevent imperfections from showing under light."
    },
    "interior-doors": {
      tip: "Solid-core doors offer superior sound dampening and a quality feel compared to hollow-core doors."
    },
    "closets": {
      tip: "Design the storage around what you actually use (long hanging, shoe cubbies, folded items) to maximize space."
    },
    "smart-home": {
      tip: "Ensure your home network (router, Wi-Fi) is robust enough to handle the extra devices before you invest in hardware."
    },
    "handyman": {
      tip: "Group all your small repairs into one visit to save time and money on scheduling and mobilization costs."
    }
  };


  serviceEl.addEventListener("change", updateVisibility);
  serviceEl.addEventListener("change", updateRegionNote);
  boroughEl.addEventListener("change", updateRegionNote);
  form.addEventListener("submit", calculateEstimate);

  // Init
  updateVisibility();
  updateRegionNote();
});


// ==========================
// STYLE INJECTION
// ==========================
// ... (The rest of your CSS injection function remains unchanged)
function injectEstimatorExtraStyles(){
  const css = `
    .est-avg-box{ border:1px solid rgba(231,191,99,0.45); padding:10px 12px; border-radius:10px; margin:12px 0; background:rgba(10,20,35,0.55); box-shadow:0 0 14px rgba(231,191,99,0.1); }
    .est-avg-box h4{ font-size:14px; margin:0 0 6px; color:#f0dca0; font-weight:600; }
    .est-avg-box .tiny-note{ font-size:10px; color:#aaa; margin-bottom:10px; }
    .est-avg-box .meter-labels, .est-avg-box .meter-comparison{ display:flex; position:relative; height:12px; margin-bottom:4px; }
    .est-avg-box .meter-labels{ justify-content:space-between; }
    .est-avg-box .meter-labels span{ font-size:10px; color:#ddd; position:relative; }
    .est-avg-box .meter-labels .meter-label-mid{ font-weight:700; color:#e7bf63; transform:translateX(-50%); }
    .est-avg-box .meter-bar{ background:linear-gradient(90deg, #999, #bbb, #999); height:6px; border-radius:3px; position:relative; }
    .est-avg-box .meter-pointer{ width:12px; height:12px; background:#e7bf63; border-radius:50%; position:absolute; top:-3px; transform:translateX(-50%); border:2px solid #000; box-shadow:0 0 5px rgba(0,0,0,0.5); }
    .est-avg-box .meter-comparison .meter-label-compare{ position:absolute; top:12px; transform:translateX(-50%); font-size:10px; color:#ccc; border-top:1px dashed #777; padding-top:2px; }
    .est-avg-box .meter-footer{ font-size:12px; color:#eee; margin-top:20px; text-align:center; }
    .est-avg-box .meter-footer strong{ color:#e7bf63; }

    .est-breakdown-box{ border:1px solid rgba(231,191,99,0.45); padding:10px 12px; border-radius:10px; margin:12px 0; background:rgba(10,20,35,0.55); box-shadow:0 0 14px rgba(231,191,99,0.1); }
    .est-breakdown-box h4{ font-size:14px; margin:0 0 6px; color:#f0dca0; font-weight:600; }
    .est-break-row{ display:flex; align-items:center; margin-bottom:6px; }
    .est-break-label{ flex:1; font-size:12px; color:#ddd; }
    .est-break-bar{ width:150px; height:8px; background:#444; border-radius:4px; margin:0 10px; }
    .est-break-bar-inner{ height:100%; background:#e7bf63; border-radius:4px; }
    .est-break-bar--secondary .est-break-bar-inner{ background:#b77f39; }
    .est-break-pct{ width:30px; font-size:12px; color:#e7bf63; font-weight:700; text-align:right; }
    .est-breakdown-box .tiny-note{ font-size:10px; color:#aaa; margin-top:10px; }

    .section-box{ border:1px solid rgba(231,191,99,.45); border-radius:10px; padding:10px 12px; margin-top:14px; background:rgba(7,14,26,0.9); }
    .section-title{ font-size:15px; margin:0 0 6px; color:#f0dca0; font-weight:600; }
    .section-list li{ font-size:12px; color:#f5f5f5; margin-bottom:4px; }
    .section-list{ padding-left:18px; margin:6px 0; }
    .section-list strong{ color:#e7bf63; }
    .section-list li:before{ content:"• "; color:#e7bf63; font-weight:bold; display:inline-block; width:1em; margin-left:-1em; }

    /* Print View Styles */
    @media print {
      body > *:not(.print-view-container){ display:none !important; }
      .print-view-container{ display:block !important; margin:0; padding:20px; color:#000; font-family:Arial, sans-serif; }
      .print-view-container .header-box{ border-bottom:2px solid #333; padding-bottom:10px; margin-bottom:15px; }
      .print-view-container h2{ font-size:24px; color:#000; margin:0; }
      .print-view-container .date{ font-size:12px; color:#555; }
      .print-view-container .main-summary{ border:1px solid #999; padding:10px; margin-bottom:15px; background:#f0f0f0; }
      .print-view-container .summary-item{ display:flex; justify-content:space-between; font-size:14px; margin-bottom:5px; }
      .print-view-container .summary-label{ font-weight:bold; }
      .print-view-container .summary-value-range{ font-size:18px; font-weight:bold; color:#a0522d; }
      .print-view-container .section-box{ border:1px solid #ccc; border-radius:0; padding:10px; margin-top:10px; background:#fff; }
      .print-view-container .section-title{ font-size:16px; color:#a0522d; margin-bottom:5px; }
      .print-view-container .section-list li{ font-size:12px; color:#333; margin-bottom:2px; }
      .print-view-container .section-list li:before{ content:"• "; color:#a0522d; }

      .print-view-container .est-breakdown-box{ border:none; padding:0; margin:0; background:transparent; }
      .print-view-container .est-break-row{ margin-bottom:4px; }
      .print-view-container .est-break-label{ color:#333; }
      .print-view-container .est-break-bar{ background:#ddd; }
      .print-view-container .est-break-bar-inner{ background:#a0522d; }
      .print-view-container .est-break-bar--secondary .est-break-bar-inner{ background:#8a5d3f; }
      .print-view-container .est-break-pct{ color:#a0522d; }
      .print-view-container .tiny-note{ color:#666; }
      .print-view-container .breakdown-total{ font-size:12px; margin-bottom:10px; color:#333; }
    }


    /* Smart Add-Ons Panel */
    #est-addons-panel{
      border:1px solid rgba(231,191,99,0.4);
      border-radius:10px;
      padding:10px 12px;
      margin:10px 0;
      background:rgba(7,14,26,0.9);
    }
    #est-addons-panel .addons-title{
      font-size:13px;
      margin:0 0 4px;
      color:#f0dca0;
    }
    #est-addons-panel .addons-subnote{
      font-size:11px;
      color:#d0d0d0;
      margin:0 0 6px;
    }
    #est-addons-panel .addons-list{
      display:flex;
      flex-direction:column;
      gap:4px;
      margin-bottom:6px;
    }
    #est-addons-panel .addon-item{
      display:flex;
      align-items:center;
      gap:6px;
      font-size:11px;
      color:#eee;
      cursor:pointer;
      padding:3px 0;
      border-radius:4px;
      transition:background-color 0.15s;
    }
    #est-addons-panel .addon-item:hover{
      background-color:rgba(231,191,99,0.08);
    }
    #est-addons-panel .addon-item input[type="checkbox"]{
      transform:scale(0.95);
      accent-color:#e7bf63;
    }
    #est-addons-panel .addon-label{
      flex:1;
    }
    #est-addons-panel .addon-price{
      font-weight:600;
      color:#f0dca0;
      white-space:nowrap;
    }
    #est-addons-panel .addons-total-row{
      font-size:12px;
      color:#f5f5f5;
      margin-top:8px;
      border-top:1px dashed #444;
      padding-top:6px;
    }
    #est-addons-panel #est-addons-total-val{
      color:#e7bf63;
      font-weight:bold;
    }

  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

// ... (PRO_TIPS_CONFIG is defined above for completeness)
