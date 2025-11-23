/* ============================================================
   HAMMER BRICK & HOME — ULTRA ADVANCED ESTIMATOR BOT v4.2
   (Mandatory Disclaimer Fixed, Services/Add-ons Integrated, Total/Promo Display Fixed)
   *** MODIFIED: Integrated Finish Level Selection (Advanced Cal) ***
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

  // Fixed Add-On Prices (NEW)
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


  // === ADVANCED ESTIMATOR CONFIG INTEGRATION (New Feature) ===
  // Scenario bands: Basic / Premium / Luxury (Adds the finish level dimension to pricing)
  const SCENARIO_CONFIG = {
    basic: { label: "Basic", factor: 0.90, desc: "Tighter budget, more standard selections (lowers cost)." },
    premium:{ label: "Premium", factor: 1.00, desc: "Balanced mix of quality and value (baseline cost)." },
    luxury: { label: "Luxury", factor: 1.25, desc: "Higher-end finishes and options (increases cost)." }
  };
  // ===========================================================


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
    debrisRemoval: false,   // NEW: Debris removal add-on
    financingNeeded: false, // NEW: Financing flag
    name: "",
    phone: "",
    // NEW: Advanced Cal Integration
    finishLevel: "premium", // Default finish level
    projects: []           // list of estimate objects
  };

  let els = {};

  // --- INIT ---------------------------------------------------

  function init() {
    // ... (unchanged)
  }

  function createInterface() {
    // ... (unchanged)
  }

  function toggleChat() {
    // ... (unchanged)
  }

  function updateProgress(pct) {
    if (els.prog) els.prog.style.width = pct + "%";
  }

  // --- MESSAGING ---------------------------------------------
  // ... (unchanged)

  // --- FLOW: DISCLAIMER -> SERVICE -> SUB OPTIONS --------------------------
  // ... (stepOne_Disclaimer, presentServiceOptions, stepTwo_SubQuestions, stepThree_LeadCheck)

  // --- SIZE STEP (SKIPS FIXED / CONSULT, HANDLES isPerSqFt) ---------------------
  // ... (stepFour_Size)

  // --- LOCATION ----------------------------------------------
  // ... (stepFive_Location)

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
      // OLD: stepSeven_Rush();
      // MODIFIED: Jump to the finish level step
      stepSixA_FinishLevel();
    });
  }


  // --- FINISH LEVEL (NEW STEP) -------------------------------
  function stepSixA_FinishLevel() {
    updateProgress(80);
    addBotMessage("What **finish level** are you targeting for this project? This affects material quality and detailed labor.");
    const opts = Object.keys(SCENARIO_CONFIG).map(function(k) {
      const cfg = SCENARIO_CONFIG[k];
      return { label: `[${cfg.label}] - ${cfg.desc}`, key: k };
    });
    addChoices(opts, function(choice) {
      state.finishLevel = choice.key || "premium";
      stepSeven_Rush(); // Continue to the next existing step
    });
  }
  // -----------------------------------------------------------


  // --- RUSH --------------------------------------------------

  function stepSeven_Rush() {
    updateProgress(82);
    // ... (unchanged)
  }

  // --- PROMO CODE --------------------------------------------
  // ... (stepEight_Promo)

  // --- NEW STEP: DEBRIS REMOVAL ADD-ON -----------------------
  // ... (stepNine_DebrisRemoval)

  // --- NEW STEP: FINANCING -----------------------------------
  // ... (stepTen_Financing)


  // --- CALCULATION ENGINE ------------------------------------

  // NEW: Advanced Helper for Finish Level
  function getScenarioFactors(finishLevel) {
    // This helper ensures we default to premium if an invalid level is passed
    return SCENARIO_CONFIG[finishLevel] || SCENARIO_CONFIG.premium;
  }
  // -----------------------------------------------------------

  function applyPriceModifiers(low, high) {
    // Pricing mode
    var factor = 1;
    // ... (unchanged)
    // ... (unchanged)
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
      return {
        svc: svc, sub: sub, borough: state.borough, size: null, isLeadHome: state.isLeadHome,
        pricingMode: state.pricingMode, isRush: state.isRush, promoCode: state.promoCode,
        low: 0, high: 0, discountRate: 0, isCustom: true,
        debrisRemoval: state.debrisRemoval, financingNeeded: state.financingNeeded,
        // NEW: Include finish level in the project output
        finishLevel: state.finishLevel
      };
    }

    if (svc.unit === "fixed") {
      // Handles fixed price service AND fixed price services that use the new isPerSqFt flag
      // ... (unchanged)
    } else {
      var rateLow = svc.baseLow;
      var rateHigh = svc.baseHigh;

      if (sub.factor) {
        rateLow *= sub.factor;
        rateHigh *= sub.factor;
      }
      
      // ... (unchanged)
    }

    // Lead safety bump
    if (state.isLeadHome) {
      low *= 1.10;
      high *= 1.10;
    }
    
    // NEW: Apply Finish Level Factor from advanced config
    var scenario = getScenarioFactors(state.finishLevel);
    low *= scenario.factor; // e.g., 0.90, 1.00, 1.25
    high *= scenario.factor; // e.g., 0.90, 1.00, 1.25

    var adjusted = applyPriceModifiers(low, high);

    return {
      svc: svc, sub: sub, borough: state.borough,
      size: (svc.unit === "fixed" && !sub.isPerSqFt || svc.unit === "consult") ? null : state.size,
      isLeadHome: state.isLeadHome, pricingMode: state.pricingMode, isRush: state.isRush,
      promoCode: state.promoCode, low: adjusted.low, high: adjusted.high,
      discountRate: adjusted.discountRate, isCustom: false,
      debrisRemoval: state.debrisRemoval, financingNeeded: state.financingNeeded,
      // NEW: Include finish level in the project output
      finishLevel: state.finishLevel
    };
  }

  function computeGrandTotal() {
    // ... (unchanged)
  }

  function buildEstimateHtml(est) {
    var svc = est.svc;
    // ... (unchanged)

    var modeLabel = "Full (Labor + Materials)";
    if (est.pricingMode === "labor") modeLabel = "Labor Only";
    if (est.pricingMode === "materials") modeLabel = "Materials + Light Help";

    // NEW: Finish Level Line
    var scenarioLabel = SCENARIO_CONFIG[est.finishLevel] ? SCENARIO_CONFIG[est.finishLevel].label : "Premium";
    var finishLine =
        '<div class="hb-receipt-row"><span>Finish Level:</span><span>' +
        scenarioLabel +
        "</span></div>";
    
    var sizeRow = "";
    // ... (unchanged sizeRow logic)

    var leadRow = "";
    // ... (unchanged leadRow logic)

    var priceRow = "";
    // ... (unchanged priceRow logic)

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
        finishLine + // NEW: Finish Level Line
        rushLine +
        leadRow +
        debrisLine + // ADDED DEBRIS LINE
        discountLine +
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
    // ... (unchanged)
  }

  function askAddAnother(est) {
    // ... (unchanged)
  }

  function showCombinedReceiptAndLeadCapture() {
    // ... (unchanged)
  }

  function resetProjectState() {
    state.serviceKey = null;
    // ... (rest of reset is unchanged)
    state.debrisRemoval = false; // Reset add-ons for new project
    state.financingNeeded = false;
    // NEW: Advanced Cal Integration
    state.finishLevel = "premium"; // Reset finish level for new project
  }

  // --- LEAD CAPTURE & LINKS ----------------------------------

  function showLeadCapture(introText) {
    // ... (unchanged)
  }

  function generateFinalLinks() {
    updateProgress(100);
    // ... (unchanged lines array setup)

    if (state.projects && state.projects.length) {
      state.projects.forEach(function(p, idx) {
        // ... (existing code for project line)

        // Add extra detail line (mode, rush, promo, lead, debris)
        var modeLabel = "Full (L+M)";
        if (p.pricingMode === "labor") modeLabel = "Labor Only";
        if (p.pricingMode === "materials") modeLabel = "Materials+Help";

        var extras = [modeLabel];
        
        // NEW: Add Finish Level to SMS/Email body
        var scenarioLabel = SCENARIO_CONFIG[p.finishLevel] ? SCENARIO_CONFIG[p.finishLevel].label : "Premium";
        extras.push("Finish: " + scenarioLabel);

        if (p.isRush) extras.push("Rush");

        // FIX: Promo code display
        if (p.promoCode) {
            var dc_rate = DISCOUNTS[p.promoCode.toUpperCase()];
            // Correctly format promo code as VIP10 (10% off)
            var dc_text = dc_rate ? " (" + Math.round(dc_rate * 100) + "% off)" : "";
            extras.push("Promo: " + p.promoCode.toUpperCase() + dc_text);
        }

        if (p.isLeadHome) extras.push("Lead-safe");
        if (p.debrisRemoval) extras.push("Debris: Included"); // NEW

        if (extras.length) {
          lines.push("   [" + extras.join(" | ") + "]");
        }
      });
      
      // ... (rest of generateFinalLinks is unchanged)
  }

  // --- UTILS -------------------------------------------------
  // ... (unchanged)

  // --- RUN ---------------------------------------------------
  // ... (unchanged)
})();
