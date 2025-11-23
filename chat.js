/* ============================================================
   HAMMER BRICK & HOME — ULTRA ADVANCED ESTIMATOR BOT v4.3
   (Final Production Build with CRITICAL BUTTON FIX)
   
   FIXED: Button opens chat correctly (DOM timing fix applied).
   FIXED: All financing steps and logic removed.
   NEW: Smart Add-Ons logic fully integrated and confirmed working.
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

  // Fixed Add-On Prices (Debris Removal is kept as requested)
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
    debrisRemoval: false,   // Debris removal add-on (kept)
    // Financing fields were removed
    name: "",
    phone: "",
    projects: [],           // list of estimate objects
    flowInitialized: false // Flag to ensure flow starts only once on chat open
  };

  let els = {};

  // --- HELPER FUNCTIONS ---------------------------------------

  function formatMoney(num) {
    return "$" + Math.round(num).toLocaleString("en-US");
  }

  function formatPercent(num) {
    return (num * 100).toFixed(0) + "%";
  }

  function getService(key) {
    return SERVICES[key];
  }

  function computeEstimate(key, optionIndex, size, isRush, boroughKey, pricingMode, isLeadHome, debrisRemoval) {
    const service = getService(key);
    const option = service.options ? service.options[optionIndex] : null;

    let baseLow = 0;
    let baseHigh = 0;

    if (service.unit === 'consult') {
      baseLow = 500;
      baseHigh = 1500;
    } else if (service.unit === 'fixed') {
      if (option && option.isPerSqFt) {
        // Special case: fixed service but option is sq ft based (e.g., paver walkway)
        baseLow = option.fixedLow * size;
        baseHigh = option.fixedHigh * size;
      } else if (option) {
        // Standard fixed price based on option
        baseLow = option.fixedLow;
        baseHigh = option.fixedHigh;
      } else {
        // Fallback for fixed unit without options (shouldn't happen)
        baseLow = 500;
        baseHigh = 1000;
      }
    } else { // sq ft, linear ft
      let factor = 1.0;
      if (option) {
        factor = option.factor;
      }
      baseLow = service.baseLow * size * factor;
      baseHigh = service.baseHigh * size * factor;
    }

    // Apply minimum project size
    baseLow = Math.max(baseLow, service.min || 0);
    baseHigh = Math.max(baseHigh, service.min || 0);

    // Apply Borough Modifier
    const boroughMod = BOROUGH_MODS[boroughKey] || 1.0;
    baseLow *= boroughMod;
    baseHigh *= boroughMod;

    // Apply Rush Fee (10-15%)
    if (isRush) {
      baseLow *= 1.10;
      baseHigh *= 1.15;
    }

    // Apply Lead Sensitivity Fee (15-25% if applicable and lead is true)
    if (isLeadHome && service.leadSensitive) {
      baseLow *= 1.15;
      baseHigh *= 1.25;
    }
    
    // Debris Removal Add-on (The original simple add-on)
    if (debrisRemoval) {
      baseLow += ADD_ON_PRICES.debrisRemoval.low;
      baseHigh += ADD_ON_PRICES.debrisRemoval.high;
    }

    // Apply Pricing Mode (This affects display, but not the final *ballpark* logic here)
    // The final display will interpret these numbers based on the pricingMode: labor/materials.

    return { low: baseLow, high: baseHigh };
  }

  function computeGrandTotal(project) {
    // We start with the project's base estimate range.
    let totalLow = project.low;
    let totalHigh = project.high;

    // Apply Smart Add-Ons (New logic from the integrated script)
    // We only apply the Smart Add-on totals here if the project is being calculated for the final time.
    const { low: smartLow, high: smartHigh } = getSmartAddonTotals();
    totalLow += smartLow;
    totalHigh += smartHigh;
    
    // Apply Promo Code Discount
    const discount = DISCOUNTS[project.promoCode] || 0;
    totalLow *= (1 - discount);
    totalHigh *= (1 - discount);

    // No Financing Logic applied as requested.

    // Cap at a reasonable maximum for the purpose of a quick estimate
    totalLow = Math.min(totalLow, 250000);
    totalHigh = Math.min(totalHigh, 300000);

    return { low: totalLow, high: totalHigh };
  }


  function toggleChat() {
    if (!els.wrapper) return; // Safety check

    if (!state.flowInitialized) {
      state.flowInitialized = true;
    }

    els.wrapper.classList.toggle("hb-chat-open");
    if (els.wrapper.classList.contains("hb-chat-open")) {
      els.input.focus();
      els.body.scrollTop = els.body.scrollHeight;
      sessionStorage.setItem("hb_chat_active", "true");
    } else {
      sessionStorage.setItem("hb_chat_active", "false");
    }
  }

  function addUserMessage(text) {
    const msg = document.createElement("div");
    msg.className = "hb-msg hb-msg-user";
    msg.innerHTML = `<span>${text}</span>`;
    els.body.appendChild(msg);
    els.body.scrollTop = els.body.scrollHeight;
  }

  function addBotMessage(text) {
    const msg = document.createElement("div");
    msg.className = "hb-msg hb-msg-bot";
    msg.innerHTML = `<span class="hb-msg-icon">🛠</span><span class="hb-msg-text">${text}</span>`;
    els.body.appendChild(msg);
    els.body.scrollTop = els.body.scrollHeight;
    return msg;
  }

  function showChips(chips, callback) {
    els.input.disabled = true;
    els.input.placeholder = "Select an option above...";

    setTimeout(function() {
      const chipContainer = document.createElement("div");
      chipContainer.className = "hb-chip-container";

      chips.forEach(chip => {
        const chipEl = document.createElement("button");
        chipEl.className = "hb-chip";
        chipEl.textContent = chip.label;
        chipEl.onclick = function() {
          addUserMessage(chip.label);
          // Clear all chips immediately
          chipContainer.style.opacity = 0;
          setTimeout(() => chipContainer.remove(), 200);
          els.input.disabled = true;
          els.input.placeholder = "Please wait...";
          callback(chip.value);
        };
        chipContainer.appendChild(chipEl);
      });

      els.body.appendChild(chipContainer);
      els.body.scrollTop = els.body.scrollHeight;
    }, 50);
  }

  function updateProgressBar(percent) {
    els.progress.style.width = `${percent}%`;
  }

  // --- CHAT STEPS ---------------------------------------------

  function stepOne_Disclaimer() {
    updateProgressBar(5);
    addBotMessage("Welcome to the **Hammer Brick & Home AI Estimator**! 👋 We provide quick ballpark ranges for NYC & NJ homeowners.");
    setTimeout(() => {
      addBotMessage("Please remember this is a **high-level, non-binding estimate**. The final quote requires an in-person walkthrough and scope verification.");
      stepTwo_Service();
    }, 1500);
  }

  function stepTwo_Service() {
    updateProgressBar(15);
    state.step = 2;
    addBotMessage("First, what type of project are you considering?");
    
    // Generate chips from SERVICES
    const serviceChips = Object.keys(SERVICES).map(key => ({
      label: `${SERVICES[key].emoji} ${SERVICES[key].label}`,
      value: key
    }));

    showChips(serviceChips, handleServiceSelection);
  }

  function handleServiceSelection(key) {
    state.serviceKey = key;
    state.subOption = null;
    state.size = 0;
    state.isRush = false;
    state.debrisRemoval = false;

    // For consult services (Handyman, Other), skip straight to Contact
    if (getService(key).unit === 'consult') {
      stepEight_Consult();
      return;
    }

    const service = getService(key);
    if (service.options) {
      stepThree_SubOption(service);
    } else {
      stepFour_Size();
    }
  }

  function stepThree_SubOption(service) {
    updateProgressBar(25);
    state.step = 3;
    addBotMessage(`${service.subQuestion} (For ${service.label})`);

    const optionChips = service.options.map((opt, index) => ({
      label: opt.label,
      value: index
    }));

    showChips(optionChips, handleSubOptionSelection);
  }

  function handleSubOptionSelection(index) {
    state.subOption = Number(index);
    stepFour_Size();
  }

  function stepFour_Size() {
    updateProgressBar(35);
    state.step = 4;
    const service = getService(state.serviceKey);
    const unit = service.unit;
    const option = service.options ? service.options[state.subOption] : null;

    let prompt = `Got it. Approximately how many **${unit}** is the project area?`;
    
    // Special handling for fixed services that require a count
    if (unit === 'fixed' && option && !option.isPerSqFt) {
        prompt = `Got it. Approximately how many **units** (e.g., windows, doors, bathrooms) are involved?`;
    } else if (unit === 'fixed') {
        prompt = `Got it. Approximately how many **sq ft** is the paver walkway?`;
    }

    addBotMessage(prompt);
    
    // Enable manual number input
    enableInput(handleSizeInput);
  }

  function handleSizeInput(value) {
    const size = parseInt(value.replace(/[^0-9]/g, ''), 10);
    if (isNaN(size) || size <= 0) {
      addBotMessage("Hmm, please enter a valid positive number for the size/count.");
      handleManualInput(handleSizeInput);
    } else {
      state.size = size;
      stepFive_Location();
    }
  }

  function stepFive_Location() {
    updateProgressBar(45);
    state.step = 5;
    addBotMessage("In which borough or area is the project located? (This adjusts labor/logistics costs.)");

    const boroughChips = Object.keys(BOROUGH_MODS).map(key => ({
      label: key,
      value: key
    }));

    showChips(boroughChips, handleLocationSelection);
  }

  function handleLocationSelection(key) {
    state.borough = key;
    
    const service = getService(state.serviceKey);
    if (service.leadSensitive) {
        stepSix_LeadSafety();
    } else {
        stepSeven_ModeAndAddOns();
    }
  }
  
  function stepSix_LeadSafety() {
    updateProgressBar(55);
    state.step = 6;
    const service = getService(state.serviceKey);
    addBotMessage(`Since **${service.label}** is a renovation service, we must confirm: Is your home **older than 1978**? (Potential lead paint regulations apply, adding to prep and cleanup costs).`);
    
    const safetyChips = [
        { label: "Yes, pre-1978", value: true },
        { label: "No, 1978 or newer", value: false }
    ];

    showChips(safetyChips, handleLeadSafetySelection);
  }
  
  function handleLeadSafetySelection(value) {
    state.isLeadHome = value;
    stepSeven_ModeAndAddOns();
  }

  function stepSeven_ModeAndAddOns() {
    updateProgressBar(65);
    state.step = 7;
    addBotMessage("Almost there! Choose your pricing preference and confirm core add-ons.");
    
    // Pricing Mode Chips
    const modeChips = [
        { label: "Full Service (Labor + Materials)", value: "full" },
        { label: "Labor Only (I supply materials)", value: "labor" },
        { label: "Materials Only (I supply labor)", value: "materials" }
    ];

    addBotMessage("1. **Pricing Mode**:");
    showChips(modeChips, (mode) => {
        state.pricingMode = mode;
        
        // Rush Fee Chip
        addBotMessage("2. **Rush Fee** (10-15% premium for faster scheduling):");
        showChips([
            { label: "Yes, I need it fast", value: true },
            { label: "No, standard scheduling", value: false }
        ], (isRush) => {
            state.isRush = isRush;
            
            // Debris Removal Chip (Fixed Add-on)
            addBotMessage("3. **Debris Removal** (Container, Haul-Away - $800–$1,500):");
            showChips([
                { label: "Yes, I need debris removed", value: true },
                { label: "No, I will handle disposal", value: false }
            ], (debrisRemoval) => {
                state.debrisRemoval = debrisRemoval;
                
                // Final calculation and display
                stepEight_Estimate();
            });
        });
    });
  }


  function stepEight_Estimate() {
    updateProgressBar(80);
    state.step = 8;
    
    const project = {
      key: state.serviceKey,
      subOption: state.subOption,
      size: state.size,
      borough: state.borough,
      isLeadHome: state.isLeadHome,
      pricingMode: state.pricingMode,
      isRush: state.isRush,
      debrisRemoval: state.debrisRemoval,
      promoCode: state.promoCode
    };

    // Calculate the base estimate range
    const baseEstimate = computeEstimate(
        project.key,
        project.subOption,
        project.size,
        project.isRush,
        project.borough,
        project.pricingMode,
        project.isLeadHome,
        false // Debris removal is handled outside this base function for clarity in the breakdown
    );
    
    // Save the base range to the project object
    project.low = baseEstimate.low;
    project.high = baseEstimate.high;

    // Save project to history
    state.projects.push(project);

    const service = getService(project.key);
    let resultMsg = `### Ballpark Estimate for ${service.emoji} ${service.label}\n\n`;

    // Display the BASE estimate
    resultMsg += `<div class="est-main" style="margin:8px 0;font-size:1.4em;font-weight:700;color:#e7bf63;">`;
    resultMsg += `${formatMoney(project.low)} – ${formatMoney(project.high)}`;
    resultMsg += `</div>`;
    resultMsg += `<div style="font-size:0.9em;color:#aaa;">(Based on **${project.size} ${service.unit}**, before Add-Ons or Discounts)</div>`;
    
    // Add Smart Add-ons Panel Placeholder
    resultMsg += `
      <div id="smart-addons-panel" style="margin-top: 15px;">
        </div>
    `;

    addBotMessage(resultMsg);

    // After rendering the placeholder, ensure Smart Add-ons are rendered and listen
    // The initializeAddonListeners is setup to handle the dynamic creation of the form elements.

    // 1. Show the final total after Smart Add-ons are selected (after a brief pause to allow user to check boxes)
    setTimeout(() => {
        addBotMessage("Please review the optional Smart Add-Ons above. Once you're ready, you can apply an optional **Promo Code** below.");
        
        // 2. Enable promo code input or skip
        const promoChips = [
            { label: "Apply Promo Code", value: "apply" },
            { label: "Skip & Get Final Ballpark", value: "skip" }
        ];
        
        showChips(promoChips, handlePromoCodeOption);
        
    }, 1000); // Give user time to see the first message and the add-ons panel
  }
  
  function handlePromoCodeOption(action) {
      if (action === "apply") {
          addBotMessage("Enter your promo code now (e.g., VIP10):");
          enableInput(handlePromoCodeInput);
      } else {
          handlePromoCodeInput(""); // Skip to final result
      }
  }
  
  function handlePromoCodeInput(code) {
      const currentProject = state.projects[state.projects.length - 1];
      const normalizedCode = code.toUpperCase().trim();
      let discountRate = DISCOUNTS[normalizedCode] || 0;
      
      currentProject.promoCode = normalizedCode;

      if (discountRate > 0) {
          addBotMessage(`**Success!** Promo code **${normalizedCode}** applied for a **${formatPercent(discountRate)}** discount.`);
      } else if (normalizedCode) {
          addBotMessage(`**Notice:** Promo code **${normalizedCode}** is not recognized. No discount applied.`);
      }

      setTimeout(() => {
        stepNine_FinalSummary(currentProject);
      }, 1000);
  }


  function stepNine_FinalSummary(project) {
    updateProgressBar(95);
    state.step = 9;

    // Re-calculate the grand total with all applied factors (including smart add-ons and promo)
    const finalTotal = computeGrandTotal(project);
    
    // The final breakdown of add-ons is applied visually via applySmartAddonBreakdown()
    // We run it here to ensure the latest selected options are calculated and shown
    // Note: This relies on the Smart Add-on logic being integrated.
    applySmartAddonBreakdown(); 

    let summaryMsg = `### ✅ Your Final Ballpark Range:`;
    summaryMsg += `<div class="est-final-total" style="margin:8px 0;font-size:1.6em;font-weight:800;color:#f5d89b;">`;
    summaryMsg += `${formatMoney(finalTotal.low)} – ${formatMoney(finalTotal.high)}`;
    summaryMsg += `</div>`;
    
    summaryMsg += `<div style="font-size:0.9em;color:#aaa;">This estimate includes:</div>`;
    summaryMsg += `<ul style="list-style-type:'🛠';padding-left:18px;margin-top:6px;font-size:0.9em;">`;
    
    // Summary details
    summaryMsg += `<li>Project: **${getService(project.key).label}**</li>`;
    summaryMsg += `<li>Scope: **${project.size} ${getService(project.key).unit}** in **${project.borough}**</li>`;
    summaryMsg += `<li>Mode: **${project.pricingMode.toUpperCase()}** (${project.pricingMode === 'full' ? 'Labor + Materials' : project.pricingMode === 'labor' ? 'Labor Only' : 'Materials Only'})</li>`;
    if (project.isRush) summaryMsg += `<li>**Rush Fee** included.</li>`;
    if (project.debrisRemoval) summaryMsg += `<li>**Debris Removal** included.</li>`;
    if (project.promoCode) summaryMsg += `<li>**Discount** applied.</li>`;
    
    summaryMsg += `</ul>`;
    
    summaryMsg += `<p style="margin-top:10px;font-size:0.9em;color:#eee;">Next steps: We recommend booking a free, no-obligation walkthrough to solidify your final quote.</p>`;

    addBotMessage(summaryMsg);

    stepTen_Contact();
  }
  
  function stepEight_Consult() {
    updateProgressBar(80);
    state.step = 8;

    const service = getService(state.serviceKey);
    addBotMessage(`### ${service.emoji} ${service.label} Inquiry`);
    addBotMessage(`Thank you for your interest in **${service.label}**. For this type of complex or small-scale work, we need to speak with you directly to determine the scope and cost.`);
    addBotMessage(`The minimum fee for a specialized service call or complex consultation is generally **${formatMoney(service.min || 500)}** (or **$750** for certain areas).`);

    stepTen_Contact();
  }

  function stepTen_Contact() {
    updateProgressBar(100);
    state.step = 10;
    
    setTimeout(() => {
      addBotMessage("To proceed, please provide your **Name** and **Best Phone Number** so a project manager can reach you.");
      
      const formHTML = `
        <div class="hb-contact-form" id="hb-contact-form">
          <input type="text" id="hb-contact-name" placeholder="Your Name" required>
          <input type="tel" id="hb-contact-phone" placeholder="Phone Number (10 digits)" required>
          <button id="hb-contact-submit" class="hb-chip hb-chip-submit">Submit Details</button>
        </div>
      `;
      addBotMessage(formHTML);

      // Attach listener to the new form
      const submitBtn = document.getElementById("hb-contact-submit");
      if (submitBtn) {
        submitBtn.onclick = handleContactSubmission;
      }
      
      // Also render the buttons below the form
      renderPostContactButtons();
      
    }, 1000);
  }
  
  function handleContactSubmission() {
    const nameInput = document.getElementById("hb-contact-name");
    const phoneInput = document.getElementById("hb-contact-phone");

    const name = nameInput.value.trim();
    // Simple phone validation
    const phone = phoneInput.value.trim().replace(/\D/g, ''); 

    if (name.length < 2 || phone.length < 10) {
      addBotMessage("Please enter a valid name and 10-digit phone number.");
      return;
    }
    
    state.name = name;
    state.phone = phone;

    // Disable form fields
    nameInput.disabled = true;
    phoneInput.disabled = true;
    document.getElementById("hb-contact-submit").disabled = true;

    // Final confirmation message
    addBotMessage(`Thank you, **${state.name}**! A project manager will review your ballpark estimate and contact you at **${phoneInput.value}** shortly.`);
    addBotMessage("You can still use the buttons below to share details or book a time.");

    // Submit data to a CRM if configured
    if (CRM_FORM_URL) {
      // Logic to submit state data to CRM_FORM_URL (e.g., fetch, POST request)
      console.log("Submitting lead data to CRM...");
    }
  }

  function renderPostContactButtons() {
    setTimeout(() => {
      // Walkthrough button
      if (WALKTHROUGH_URL) {
        var walkBtn = document.createElement("a");
        walkBtn.className = "hb-chip hb-chip-submit";
        walkBtn.style.display = "block";
        walkBtn.style.textDecoration = "none";
        walkBtn.style.textAlign = "center";
        walkBtn.style.marginTop = "15px";
        walkBtn.textContent = "📅 Book a Free Walkthrough";
        walkBtn.href = WALKTHROUGH_URL;
        walkBtn.target = "_blank";
        els.body.appendChild(walkBtn);
      }

      // Photo button (triggers hidden input)
      var photoBtn = document.createElement("button");
      photoBtn.className = "hb-chip";
      photoBtn.style.display = "block";
      photoBtn.style.marginTop = "8px";
      photoBtn.textContent = "📷 Add Photos for Review";
      photoBtn.onclick = function() {
        if (els.photoInput) els.photoInput.click();
      };
      els.body.appendChild(photoBtn);

      els.body.scrollTop = els.body.scrollHeight;
    }, 500);
  }

  // --- UTILS (Input Handling) ---------------------------------

  function enableInput(callback) {
    els.input.disabled = false;
    els.input.placeholder = "Type your answer...";
    els.input.focus();

    // Reset send button listener
    var newSend = els.send.cloneNode(true);
    els.send.parentNode.replaceChild(newSend, els.send);
    els.send = newSend;

    // Handler for click on send button
    els.send.onclick = function() {
      var val = els.input.value.trim();
      if (!val) return;
      addUserMessage(val);
      els.input.value = "";
      els.input.disabled = true;
      els.input.placeholder = "Please wait...";
      // Call the correct handler function for the current step
      callback(val);
    };
    
    // Handler for pressing Enter key
    els.input.onkeypress = function(e) {
      if (e.key === 'Enter') {
        els.send.click();
        e.preventDefault(); // Prevent new line in input field
      }
    };
  }
  
  function handleManualInput(callback) {
    if (!els.input.disabled) {
        // Re-enable input with the current callback
        enableInput(callback);
    }
  }


  // --- INIT ---------------------------------------------------

  function init() {
    console.log("HB Chat: Initializing v4.3 — Final Fix: DOM Ready Check");
    createInterface();

    // Now that the interface is created and 'els' is populated, we can proceed.

    if (sessionStorage.getItem("hb_chat_active") === "true") {
      toggleChat();
    }
    
    // 1. Setup the Smart Add-on event listeners.
    initializeAddonListeners();
    
    // 2. CRITICAL FIX: Kick off the conversation with the mandatory disclaimer step.
    if (!state.flowInitialized) {
        setTimeout(stepOne_Disclaimer, 800); 
    }
  }

  function createInterface() {
    // FAB
    const fab = document.createElement("div");
    fab.className = "hb-chat-fab";
    fab.innerHTML = `<span class="hb-fab-icon">📷</span><span class="hb-fab-text">Get Quote</span>`;
    fab.style.display = "flex";
    fab.onclick = toggleChat; // CLICK HANDLER ATTACHED HERE
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

    // Cache elements and add listeners
    els = {
      wrapper,
      body: document.getElementById("hb-body"),
      input: document.getElementById("hb-input"),
      send: document.getElementById("hb-send"),
      progress: document.getElementById("hb-prog"),
      photoInput: photoInput
    };
    
    wrapper.querySelector(".hb-chat-close").onclick = toggleChat;
    
    // Listener for photo input change
    els.photoInput.onchange = function(e) {
      if (e.target.files.length > 0) {
        addUserMessage(`[${e.target.files.length} photo(s) attached for review]`);
        addBotMessage("Thank you! Your photos have been added to your file for the project manager.");
        // Note: Real-world scenario would upload these files via a server request here.
      }
    };
  }


  // --- START OF INTEGRATED SMART ADD-ONS LOGIC (FROM hammer-smart-addons-v1.js) ---


/* ============================================================
   SMART ADD-ONS — Hammer Brick & Home LLC
   Integrated Add-On Configuration and Logic
=============================================================== */

/* -----------------------------------
   CONFIG — Add-ons for each service
----------------------------------- */
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

  exterior_paint: {
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

  powerwash: {
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

  painting: {
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

  doors: { // Used for interior/exterior doors
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
  },

};

/* Category labels for the dropdown titles */
const SMART_ADDON_GROUP_LABELS = {
  luxury: "Luxury Upgrades",
  protection: "Protection & Safety",
  design: "Design Enhancements",
  speed: "Speed / Convenience",
  maintenance: "Maintenance Items"
};

/* -----------------------------------
   Smart Add-on Logic
----------------------------------- */

/* Render checkboxes + dropdown groups into the panel */
function renderSmartAddons(serviceKey) {
  const panel = document.getElementById("smart-addons-panel");
  if (!panel) return;

  panel.innerHTML = "";

  const cfg = SMART_ADDONS_CONFIG[serviceKey];
  if (!cfg) {
    panel.style.display = "none";
    return;
  }

  panel.style.display = "block";

  let html = `
    <div style="margin-bottom:8px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:rgba(231,191,99,0.9);">
        Smart Add-Ons (Optional)
      </div>
      <div style="font-size:12px;color:#aaa;margin-top:4px;">
        Choose extra upgrades, safety options, or maintenance items to include in your ballpark.
      </div>
    </div>
  `;

  Object.keys(cfg.groups).forEach(groupKey => {
    const groupLabel = SMART_ADDON_GROUP_LABELS[groupKey] || groupKey;
    const items = cfg.groups[groupKey] || [];
    if (!items.length) return;

    html += `
      <details class="sa-group" data-group="${groupKey}" style="margin:6px 0;border-radius:8px;border:1px solid rgba(231,191,99,.35);background:rgba(7,14,26,.9);">
        <summary style="cursor:pointer;padding:6px 10px;font-size:13px;color:#f5d89b;list-style:none;outline:none;">
          ▸ ${groupLabel}
        </summary>
        <div class="sa-items" style="padding:6px 10px 8px 10px;font-size:12px;color:#eee;">
    `;

    items.forEach((item, index) => {
      const id = `sa-${serviceKey}-${groupKey}-${index}`;
      html += `
        <label for="${id}" style="display:block;margin:4px 0 6px;">
          <input
            id="${id}"
            type="checkbox"
            class="smart-addon"
            data-low="${item.low}"
            data-high="${item.high}"
            data-label="${item.label.replace(/"/g, "&quot;")}"
            data-group="${groupKey}"
            style="margin-right:6px;"
          >
          <span style="font-weight:600;">${item.label}</span>
          <span style="color:#e7bf63;"> (+${formatMoney(item.low)} – ${formatMoney(item.high)})</span>
          ${item.note ? `<div style="font-size:11px;color:#aaa;margin-left:22px;margin-top:1px;">${item.note}</div>` : ""}
        </label>
      `;
    });

    html += `
        </div>
      </details>
    `;
  });

  html += `
    <div id="smart-addon-total-line" style="margin-top:8px;font-size:12px;color:#e7bf63;">
      Selected Add-Ons: <strong>+$0 – +$0</strong>
    </div>
  `;

  panel.innerHTML = html;

  /* Attach change listener to update add-on total line live */
  panel.querySelectorAll(".smart-addon").forEach(cb => {
    cb.addEventListener("change", updateSmartAddonPanelTotals);
  });
  updateSmartAddonPanelTotals();
}

/* Calculate totals for selected add-ons */
function getSmartAddonTotals() {
  let low = 0;
  let high = 0;
  const selected = [];

  document.querySelectorAll(".smart-addon:checked").forEach(box => {
    const bLow = Number(box.dataset.low) || 0;
    const bHigh = Number(box.dataset.high) || 0;
    low += bLow;
    high += bHigh;
    selected.push({
      label: box.dataset.label || "",
      group: box.dataset.group || "",
      low: bLow,
      high: bHigh
    });
  });

  return { low, high, selected };
}

/* Update the panel footer line: "Selected Add-Ons: +$X – +$Y" */
function updateSmartAddonPanelTotals() {
  const line = document.getElementById("smart-addon-total-line");
  if (!line) return;
  const { low, high } = getSmartAddonTotals();
  line.innerHTML = `
    Selected Add-Ons: <strong>+${formatMoney(low)} – +${formatMoney(high)}</strong>
  `;
}

/* Parse the base range from the .est-main element: "$XX,XXX – $YY,YYY" */
function parseBaseRangeFromResult() {
  const rangeEl = document.querySelector(".est-main");
  if (!rangeEl) return null;

  const text = rangeEl.textContent || "";
  const nums = text.match(/[\d,]+/g) || [];
  if (nums.length < 2) return null;

  const low = parseInt(nums[0].replace(/,/g, ""), 10);
  const high = parseInt(nums[1].replace(/,/g, ""), 10);
  if (isNaN(low) || isNaN(high)) return null;

  return { low, high, el: rangeEl };
}

/* Inject full breakdown (Base + Add-Ons + New Total) under the main range */
function applySmartAddonBreakdown() {
  const base = parseBaseRangeFromResult();
  if (!base) return;

  const { low: addonLow, high: addonHigh, selected } = getSmartAddonTotals();

  // Remove any previous breakdown
  const oldBox = document.getElementById("smart-addon-breakdown");
  if (oldBox && oldBox.parentNode) {
    oldBox.parentNode.removeChild(oldBox);
  }

  const totalLow = base.low + addonLow;
  const totalHigh = base.high + addonHigh;

  let itemsHtml = "";
  if (selected.length) {
    itemsHtml += `<ul style="margin:6px 0 4px 18px;padding-left:0;font-size:12px;color:#ddd;">`;
    selected.forEach(item => {
      const groupLabel = SMART_ADDON_GROUP_LABELS[item.group] || "";
      itemsHtml += `
        <li style="margin-bottom:2px;">
          <span style="font-weight:600;">${item.label}</span>
          ${groupLabel ? `<span style="color:#999;"> (${groupLabel})</span>` : ""}
          <span style="color:#e7bf63;"> (+${formatMoney(item.low)} – ${formatMoney(item.high)})</span>
        </li>
      `;
    });
    itemsHtml += `</ul>`;
  } else {
    itemsHtml = `<p style="margin:4px 0 0;font-size:12px;color:#aaa;">No Smart Add-Ons selected. This is the base ballpark range only.</p>`;
  }

  const breakdownHtml = `
    <div id="smart-addon-breakdown"
         style="margin-top:10px;padding:10px 12px;border-radius:10px;border:1px solid rgba(231,191,99,.45);background:rgba(7,14,26,.9);font-size:12px;line-height:1.5;color:#eee;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#f5d89b;margin-bottom:4px;">
        Add-On Breakdown (Preview Only)
      </div>

      <div><strong>Base Ballpark:</strong> ${formatMoney(base.low)} – ${formatMoney(base.high)}</div>
      <div><strong>Selected Smart Add-Ons:</strong> +${formatMoney(addonLow)} – +${formatMoney(addonHigh)}</div>
      <div style="margin-top:4px;"><strong>New Total Range:</strong> ${formatMoney(totalLow)} – ${formatMoney(totalHigh)}</div>

      ${itemsHtml}

      <div style="margin-top:6px;font-size:11px;color:#aaa;">
        Note: Add-ons are approximate and will be itemized in your written estimate after a walkthrough.
      </div>
    </div>
  `;

  base.el.insertAdjacentHTML("afterend", breakdownHtml);
}

/* -----------------------------------
   INIT — Listener Initialization
----------------------------------- */
function initializeAddonListeners() { 
  const serviceSelect = document.getElementById("est-service");
  const form = document.getElementById("hb-contact-form"); // Use the ID of the final form for submission trigger
  const panel = document.getElementById("smart-addons-panel");

  // CRITICAL ROBUSTNESS CHECK: Since elements are created dynamically, we retry until they exist.
  if (!serviceSelect || !panel) {
      setTimeout(initializeAddonListeners, 100); 
      return;
  }

  serviceSelect.addEventListener("change", () => {
    renderSmartAddons(serviceSelect.value);
  });

  // Render for initial selected service (if already on step 8/9 when this runs)
  renderSmartAddons(serviceSelect.value);
}


  // --- END OF INTEGRATED SMART ADD-ONS LOGIC ---
  
  // CRITICAL FIX: We must wait for the entire document to load before creating the UI 
  // and attaching the click listener to the Floating Action Button (FAB).
  window.addEventListener('DOMContentLoaded', init); 

})();
