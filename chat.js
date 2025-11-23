/* ============================================================
   HAMMER BRICK & HOME — ULTRA ADVANCED ESTIMATOR BOT v3.4
   Premium NYC Pricing • Multi-Project • Rush • Promo Tags
   Time-Based Greeting • Full Estimator Link • Disclaimer
=============================================================== */

(function() {
  // --- CONFIGURATION & DATA -----------------------------------

  // Borough modifiers (premium NYC contractor level)
  const BOROUGH_MODS = {
    "Manhattan": 1.20,
    "Brooklyn": 1.10,
    "Queens": 1.07,
    "Bronx": 1.04,
    "Staten Island": 1.00,
    "New Jersey": 0.96
  };

  // Recognized promo codes
  const DISCOUNTS = {
    "VIP10": 0.10,       // 10% off
    "REFERRAL5": 0.05    // 5% off
    // You can add others like FRIEND20: 0.20
  };

  // Optional external URLs
  const CRM_FORM_URL = "";
  const WALKTHROUGH_URL = "";

  const FULL_ESTIMATOR_URL = "https://www.hammerbrickhome.com/project-estimator";
  const HIC_NUMBER = "21311291";

  // Helper: time-based greeting
  function getGreeting() {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
  }

  // Pricing Logic / Services (premium contractor level)
  const SERVICES = {
    // --- MASONRY & CONCRETE -----------------------------------
    "masonry": {
      label: "Masonry & Concrete",
      emoji: "🧱",
      unit: "sq ft",
      baseLow: 18, baseHigh: 32, min: 2800,
      subQuestion: "What type of finish?",
      options: [
        { label: "Standard Concrete ($) — 💰 Best Value", factor: 1.0 },
        { label: "Pavers ($$) — ⭐ Most Popular", factor: 1.7 },
        { label: "Natural Stone / Bluestone ($$$) — 🔥 Premium Upgrade", factor: 2.4 }
      ]
    },

    "driveway": {
      label: "Driveway",
      emoji: "🚗",
      unit: "sq ft",
      baseLow: 12, baseHigh: 24, min: 3800,
      subQuestion: "Current surface condition?",
      options: [
        { label: "Dirt/Gravel (New) — 💰 Best Value", factor: 1.0 },
        { label: "Existing Asphalt (Removal) — ⭐ Most Popular", factor: 1.25 },
        { label: "Existing Concrete (Hard Demo) — 🔥 Premium Upgrade", factor: 1.45 }
      ]
    },

    "roofing": {
      label: "Roofing",
      emoji: "🏠",
      unit: "sq ft",
      baseLow: 5.25, baseHigh: 10.5, min: 7000,
      subQuestion: "Roof type?",
      options: [
        { label: "Architectural Shingle (GAF etc.) — ⭐ Most Popular", factor: 1.0 },
        { label: "Flat Roof (NYC Spec) — 💰 Best Value", factor: 1.4 },
        { label: "Slate / Specialty — 🔥 Premium Upgrade", factor: 2.6 }
      ]
    },

    // --- PAINTING ---------------------------------------------
    "painting": {
      label: "Interior Painting",
      emoji: "🎨",
      unit: "sq ft",
      baseLow: 2.0, baseHigh: 4.2, min: 1900,
      subQuestion: "Paint quality?",
      leadSensitive: true,
      options: [
        { label: "Standard (Behr/Valspar) — 💰 Best Value", factor: 1.0 },
        { label: "Sherwin-Williams / Regal — ⭐ Most Popular", factor: 1.35 },
        { label: "Benjamin Moore Aura — 🔥 Premium Upgrade", factor: 1.6 }
      ]
    },

    "exterior_paint": {
      label: "Exterior Painting",
      emoji: "🖌",
      unit: "sq ft",
      baseLow: 2.75, baseHigh: 6.0, min: 3800,
      subQuestion: "Surface condition?",
      options: [
        { label: "Good Condition — 💰 Best Value", factor: 1.0 },
        { label: "Peeling / Prep Needed — ⭐ Most Popular", factor: 1.4 },
        { label: "Heavy Prep / Wood Repairs — 🔥 Premium Upgrade", factor: 1.9 }
      ]
    },

    // --- BASEMENT FLOOR ---------------------------------------
    "basement_floor": {
      label: "Basement Floor Epoxy",
      emoji: "🧼",
      unit: "sq ft",
      baseLow: 3.0, baseHigh: 6.0, min: 1300,
      subQuestion: "Floor system?",
      options: [
        { label: "1-Part Epoxy Paint — 💰 Best Value", factor: 1.0 },
        { label: "2-Part Epoxy (Thicker) — ⭐ Most Popular", factor: 1.6 },
        { label: "Flake / Decorative System — 🔥 Premium Upgrade", factor: 2.1 }
      ]
    },

    // --- FENCING ----------------------------------------------
    "fence": {
      label: "Fence Install",
      emoji: "🚧",
      unit: "linear ft",
      baseLow: 34, baseHigh: 80, min: 1900,
      subQuestion: "Fence type?",
      options: [
        { label: "Pressure-Treated Wood — 💰 Best Value", factor: 1.0 },
        { label: "PVC (White or Tan) — ⭐ Most Popular", factor: 1.7 },
        { label: "Chain-Link — Budget-Friendly", factor: 0.95 },
        { label: "Aluminum / Ornamental — 🔥 Premium Upgrade", factor: 2.1 }
      ]
    },

    // --- DECK / PORCH -----------------------------------------
    "deck": {
      label: "Deck / Porch Build",
      emoji: "🪵",
      unit: "sq ft",
      baseLow: 40, baseHigh: 75, min: 5500,
      subQuestion: "Deck material?",
      options: [
        { label: "Pressure Treated — 💰 Best Value", factor: 1.0 },
        { label: "Composite (Trex / TimberTech) — ⭐ Most Popular", factor: 2.0 },
        { label: "PVC Luxury (Azek, etc.) — 🔥 Premium Upgrade", factor: 2.5 }
      ]
    },

    // --- DRYWALL ----------------------------------------------
    "drywall": {
      label: "Drywall Install / Repair",
      emoji: "📐",
      unit: "sq ft",
      baseLow: 3.5, baseHigh: 7.0, min: 800,
      subQuestion: "Scope?",
      options: [
        { label: "Minor Repairs / Patches — 💰 Best Value", factor: 1.0 },
        { label: "Full Install — ⭐ Most Popular", factor: 1.6 },
        { label: "Level 5 Finish / Skim — 🔥 Premium Upgrade", factor: 2.2 }
      ]
    },

    // --- FLOORING ---------------------------------------------
    "flooring": {
      label: "Flooring Installation",
      emoji: "🪚",
      unit: "sq ft",
      baseLow: 4.0, baseHigh: 10.5, min: 2700,
      subQuestion: "Flooring type?",
      options: [
        { label: "Vinyl Plank (LVP) — 💰 Best Value", factor: 1.0 },
        { label: "Tile (Porcelain/Ceramic) — ⭐ Most Popular", factor: 1.9 },
        { label: "Hardwood — 🔥 Premium Upgrade", factor: 2.5 },
        { label: "Laminate — Budget-Friendly", factor: 1.2 }
      ]
    },

    // --- HARDWOOD REFINISH ------------------------------------
    "hardwood_refinish": {
      label: "Hardwood Sand & Refinish",
      emoji: "🪵",
      unit: "sq ft",
      baseLow: 4.5, baseHigh: 9.0, min: 2300,
      subQuestion: "Finish level?",
      options: [
        { label: "Basic Poly Finish — 💰 Best Value", factor: 1.0 },
        { label: "Oil-Based Premium — ⭐ Most Popular", factor: 1.3 },
        { label: "Water-Based Low-VOC — 🔥 Premium Upgrade", factor: 1.5 }
      ]
    },

    // --- SOUNDPROOFING ----------------------------------------
    "soundproofing": {
      label: "Soundproofing (Walls & Ceilings)",
      emoji: "🔇",
      unit: "sq ft",
      baseLow: 11, baseHigh: 22, min: 2800,
      subQuestion: "System type?",
      leadSensitive: true,
      options: [
        { label: "Insulation + 5/8\" Drywall — 💰 Best Value", factor: 1.0 },
        { label: "Channel / Clips System — ⭐ Most Popular", factor: 1.5 },
        { label: "Studio-Grade Package — 🔥 Premium Upgrade", factor: 2.0 }
      ]
    },

    // --- SIDING -----------------------------------------------
    "siding": {
      label: "Siding & Exterior Trim",
      emoji: "🏡",
      unit: "sq ft",
      baseLow: 9, baseHigh: 18, min: 4800,
      subQuestion: "Siding type?",
      options: [
        { label: "Vinyl Siding — 💰 Best Value", factor: 1.0 },
        { label: "Hardie / Fiber Cement — ⭐ Most Popular", factor: 1.7 },
        { label: "Luxury Composite Panels — 🔥 Premium Upgrade", factor: 2.2 }
      ]
    },

    // --- ACCENT WALL ------------------------------------------
    "accent_wall": {
      label: "Accent / Feature Wall",
      emoji: "🎯",
      unit: "sq ft",
      baseLow: 14, baseHigh: 32, min: 1900,
      subQuestion: "Accent style?",
      options: [
        { label: "Shiplap / Simple Panels — 💰 Best Value", factor: 1.0 },
        { label: "Slat Wall / Modern — ⭐ Most Popular", factor: 1.4 },
        { label: "Custom Millwork / Built-In — 🔥 Premium Upgrade", factor: 2.0 }
      ]
    },

    // --- BASEMENT FINISH --------------------------------------
    "basement_finish": {
      label: "Basement Finish / Remodel",
      emoji: "🏚️",
      unit: "sq ft",
      baseLow: 75, baseHigh: 160, min: 16000,
      subQuestion: "Finish level?",
      options: [
        { label: "Basic Finish — 💰 Best Value", factor: 1.0 },
        { label: "Mid-Grade (Rec Room) — ⭐ Most Popular", factor: 1.3 },
        { label: "Luxury (Office / Theater) — 🔥 Premium Upgrade", factor: 1.7 }
      ]
    },

    // --- BATH TILE (LABOR) ------------------------------------
    "bath_tile": {
      label: "Bathroom Tile (Labor Only)",
      emoji: "🧼",
      unit: "sq ft",
      baseLow: 16, baseHigh: 32, min: 2600,
      subQuestion: "Scope?",
      options: [
        { label: "Floor Only — 💰 Best Value", factor: 1.0 },
        { label: "Tub / Shower Walls — ⭐ Most Popular", factor: 1.5 },
        { label: "Full Walls + Floor — 🔥 Premium Upgrade", factor: 2.0 }
      ]
    },

    // --- POWER WASHING ----------------------------------------
    "powerwash": {
      label: "Power Washing",
      emoji: "💦",
      unit: "sq ft",
      baseLow: 0.40, baseHigh: 0.95, min: 260
    },

    // --- GUTTERS ----------------------------------------------
    "gutter": {
      label: "Gutter Install",
      emoji: "🩸",
      unit: "linear ft",
      baseLow: 16, baseHigh: 38, min: 1300,
      subQuestion: "Type?",
      options: [
        { label: "Aluminum K-Style — 💰 Best Value", factor: 1.0 },
        { label: "Seamless Aluminum — ⭐ Most Popular", factor: 1.4 },
        { label: "Copper — 🔥 Premium Upgrade", factor: 3.5 }
      ]
    },

    // --- WINDOWS & DOORS --------------------------------------
    "windows": {
      label: "Windows Install",
      emoji: "🪟",
      unit: "fixed",
      subQuestion: "Window type?",
      options: [
        { label: "Standard Vinyl — 💰 Best Value", fixedLow: 600, fixedHigh: 900 },
        { label: "Premium Double-Hung — ⭐ Most Popular", fixedLow: 900, fixedHigh: 1500 },
        { label: "Bay / Bow Window — 🔥 Premium Upgrade", fixedLow: 3600, fixedHigh: 6800 }
      ]
    },

    "doors": {
      label: "Door Installation",
      emoji: "🚪",
      unit: "fixed",
      subQuestion: "Door type?",
      options: [
        { label: "Interior — 💰 Best Value", fixedLow: 280, fixedHigh: 600 },
        { label: "Exterior Steel / Fiberglass — ⭐ Most Popular", fixedLow: 1000, fixedHigh: 1900 },
        { label: "Sliding Patio — 🔥 Premium Upgrade", fixedLow: 2300, fixedHigh: 4300 }
      ]
    },

    // --- DEMOLITION -------------------------------------------
    "demo": {
      label: "Demolition",
      emoji: "💥",
      unit: "sq ft",
      baseLow: 3.2, baseHigh: 8.0, min: 950,
      subQuestion: "Material?",
      leadSensitive: true,
      options: [
        { label: "Drywall Demo — 💰 Best Value", factor: 1.0 },
        { label: "Tile / Bathroom Demo — ⭐ Most Popular", factor: 1.9 },
        { label: "Concrete Demo — 🔥 Premium Upgrade", factor: 2.5 }
      ]
    },

    // --- RETAINING WALL ---------------------------------------
    "retaining": {
      label: "Retaining Wall",
      emoji: "🧱",
      unit: "linear ft",
      baseLow: 65, baseHigh: 150, min: 5800,
      subQuestion: "Material?",
      options: [
        { label: "CMU Block — 💰 Best Value", factor: 1.0 },
        { label: "Poured Concrete — ⭐ Most Popular", factor: 1.7 },
        { label: "Stone Veneer — 🔥 Premium Upgrade", factor: 2.4 }
      ]
    },

    // --- HANDYMAN ---------------------------------------------
    "handyman": {
      label: "Small Repairs / Handyman",
      emoji: "🛠",
      unit: "consult"
    },

    // --- KITCHEN / BATH (FIXED) -------------------------------
    "kitchen": {
      label: "Kitchen Remodel",
      emoji: "🍳",
      unit: "fixed",
      subQuestion: "What is the scope?",
      options: [
        { label: "Refresh (Cosmetic) — 💰 Best Value", fixedLow: 19000, fixedHigh: 32000 },
        { label: "Mid-Range (New Cabinets) — ⭐ Most Popular", fixedLow: 32000, fixedHigh: 60000 },
        { label: "Full Gut / Luxury — 🔥 Premium Upgrade", fixedLow: 60000, fixedHigh: 120000 }
      ],
      leadSensitive: true
    },

    "bathroom": {
      label: "Bathroom Remodel",
      emoji: "🚿",
      unit: "fixed",
      subQuestion: "What is the scope?",
      options: [
        { label: "Update (Fixtures/Tile) — 💰 Best Value", fixedLow: 15000, fixedHigh: 26000 },
        { label: "Full Gut / Redo — ⭐ Most Popular", fixedLow: 26000, fixedHigh: 48000 }
      ],
      leadSensitive: true
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
    name: "",
    phone: "",
    projects: []
  };

  let els = {};

  // --- INIT ---------------------------------------------------

  function init() {
    console.log("HB Chat: Initializing v3.4 (Premium)...");
    createInterface();
    if (sessionStorage.getItem("hb_chat_active") === "true") {
      toggleChat();
    }
  }

  function createInterface() {
    // FAB
    const fab = document.createElement("div");
    fab.className = "hb-chat-fab";
    fab.innerHTML = `<span class="hb-fab-icon">📷</span><span class="hb-fab-text">Get Quote</span>`;
    fab.style.display = "flex";
    fab.onclick = toggleChat;
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

    // Cache elements
    els = {
      wrapper,
      fab,
      body: document.getElementById("hb-body"),
      input: document.getElementById("hb-input"),
      send: document.getElementById("hb-send"),
      prog: document.getElementById("hb-prog"),
      close: wrapper.querySelector(".hb-chat-close"),
      photoInput
    };

    // Events
    els.close.onclick = toggleChat;
    els.send.onclick = handleManualInput;
    els.input.addEventListener("keypress", function(e) {
      if (e.key === "Enter") handleManualInput();
    });

    photoInput.addEventListener("change", function() {
      if (!photoInput.files || !photoInput.files.length) return;
      addBotMessage(`📷 You selected ${photoInput.files.length} photo(s). Please attach these when you text or email us.`);
    });

    // Kick off conversation with time-based greeting
    const greet = getGreeting();
    addBotMessage(`${greet}! I am the Hammer Brick & Home AI estimator for NYC / NJ.`);
    addBotMessage(`We are Licensed & Insured • NYC HIC #${HIC_NUMBER}. I will ask a few quick questions to give you a realistic local ballpark.`);
    setTimeout(function() {
      addBotMessage("What type of project are you planning?");
      presentServiceOptions();
    }, 900);
  }

  function toggleChat() {
    const isOpen = els.wrapper.classList.toggle("hb-open");
    if (isOpen) {
      els.fab.style.display = "none";
      sessionStorage.setItem("hb_chat_active", "true");
    } else {
      els.fab.style.display = "flex";
      sessionStorage.removeItem("hb_chat_active");
    }
  }

  function updateProgress(pct) {
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
        if (isHtml) {
          msgBubble.innerHTML = text;
        } else {
          msgBubble.textContent = text;
        }
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

  // --- FLOW: SERVICE -> SUB OPTIONS --------------------------

  function presentServiceOptions() {
    updateProgress(10);
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
    updateProgress(30);
    const svc = SERVICES[state.serviceKey];
    if (!svc) return;

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

  function stepThree_LeadCheck() {
    const svc = SERVICES[state.serviceKey];
    if (svc && svc.leadSensitive) {
      addBotMessage("Is your property built before 1978? (Required for lead safety laws).");
      addChoices(["Yes (Pre-1978)", "No / Not Sure"], function(ans) {
        const val = (typeof ans === "string") ? ans : ans.label;
        state.isLeadHome = !!(val && val.indexOf("Yes") !== -1);
        stepFour_Size();
      });
    } else {
      stepFour_Size();
    }
  }

  // --- SIZE STEP (SKIPS FIXED / CONSULT) ---------------------

  function stepFour_Size() {
    updateProgress(50);
    const svc = SERVICES[state.serviceKey];
    if (!svc) return;

    // Skip size step for fixed-price or consultation services
    if (svc.unit === "fixed" || svc.unit === "consult" || state.serviceKey === "other") {
      stepFive_Location();
      return;
    }

    addBotMessage("Approximate size in " + svc.unit + "? (ballpark is fine).");

    function askSize() {
      enableInput(function(val) {
        const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
        if (!num || num < 10) {
          addBotMessage("That number seems low. Please enter a valid number (for example 500).");
          askSize();
        } else {
          state.size = num;
          stepFive_Location();
        }
      });
    }

    askSize();
  }

  // --- LOCATION ----------------------------------------------

  function stepFive_Location() {
    updateProgress(70);
    addBotMessage("Which borough/area is this in?");
    const locs = Object.keys(BOROUGH_MODS);

    addChoices(locs, function(loc) {
      const val = (typeof loc === "string") ? loc : loc.label;
      state.borough = val;
      stepSix_PricingMode();
    });
  }

  // --- PRICING MODE (FULL / LABOR / MATERIALS) ---------------

  function stepSix_PricingMode() {
    updateProgress(78);
    addBotMessage("How should we price this?");

    const opts = [
      { label: "Full Project (Labor + Materials) — ⭐ Most Popular", key: "full" },
      { label: "Labor Only — 💰 Best Value", key: "labor" },
      { label: "Materials + Light Help", key: "materials" }
    ];

    addChoices(opts, function(choice) {
      state.pricingMode = choice.key || "full";
      stepSeven_Rush();
    });
  }

  // --- RUSH --------------------------------------------------

  function stepSeven_Rush() {
    updateProgress(82);
    addBotMessage("Is this a rush project (starting within 72 hours)?");

    addChoices(["Yes, rush", "No"], function(ans) {
      const val = (typeof ans === "string") ? ans : ans.label;
      state.isRush = !!(val && val.indexOf("Yes") !== -1);
      stepEight_Promo();
    });
  }

  // --- PROMO CODE --------------------------------------------

  function stepEight_Promo() {
    updateProgress(86);
    addBotMessage("Any promo code today? If not, tap 'No Code'.");

    const opts = [
      { label: "No Code", code: "" },
      { label: "VIP10 (10% Off) — ⭐ Most Popular", code: "VIP10" },
      { label: "REFERRAL5 (5% Off) — 💰 Best Value", code: "REFERRAL5" }
    ];

    addChoices(opts, function(choice) {
      state.promoCode = choice.code || "";
      const est = computeEstimateForCurrent();
      showEstimateAndAskAnother(est);
    });
  }

  // --- CALCULATION ENGINE ------------------------------------

  function applyPriceModifiers(low, high) {
    // Pricing mode
    let factor = 1;
    if (state.pricingMode === "labor") {
      factor = 0.7;
    } else if (state.pricingMode === "materials") {
      factor = 0.5;
    }
    low *= factor;
    high *= factor;

    // Rush surcharge
    if (state.isRush) {
      low *= 1.12;
      high *= 1.18;
    }

    // Promo discount
    let dc = 0;
    if (state.promoCode) {
      const rate = DISCOUNTS[state.promoCode.toUpperCase()];
      if (rate) dc = rate;
    }
    if (dc > 0) {
      low *= (1 - dc);
      high *= (1 - dc);
    }

    return { low: low, high: high, discountRate: dc };
  }

  function computeEstimateForCurrent() {
    const svc = SERVICES[state.serviceKey];
    if (!svc) return null;

    const sub = state.subOption || {};
    const mod = BOROUGH_MODS[state.borough] || 1.0;
    let low = 0;
    let high = 0;

    // Custom/consult jobs: no auto price
    if (state.serviceKey === "other" || svc.unit === "consult") {
      return {
        svc: svc,
        sub: sub,
        borough: state.borough,
        size: null,
        isLeadHome: state.isLeadHome,
        pricingMode: state.pricingMode,
        isRush: state.isRush,
        promoCode: state.promoCode,
        low: 0,
        high: 0,
        discountRate: 0,
        isCustom: true
      };
    }

    if (svc.unit === "fixed") {
      low = (sub.fixedLow || 0) * mod;
      high = (sub.fixedHigh || 0) * mod;
    } else {
      let rateLow = svc.baseLow;
      let rateHigh = svc.baseHigh;

      if (sub.factor) {
        rateLow *= sub.factor;
        rateHigh *= sub.factor;
      }

      low = rateLow * state.size * mod;
      high = rateHigh * state.size * mod;

      if (svc.min && low < svc.min) low = svc.min;
      if (svc.min && high < svc.min * 1.2) high = svc.min * 1.25;
    }

    // Lead safety bump
    if (state.isLeadHome) {
      low *= 1.10;
      high *= 1.10;
    }

    const adjusted = applyPriceModifiers(low, high);

    return {
      svc: svc,
      sub: sub,
      borough: state.borough,
      size: (svc.unit === "fixed" || svc.unit === "consult") ? null : state.size,
      isLeadHome: state.isLeadHome,
      pricingMode: state.pricingMode,
      isRush: state.isRush,
      promoCode: state.promoCode,
      low: adjusted.low,
      high: adjusted.high,
      discountRate: adjusted.discountRate,
      isCustom: false
    };
  }

  function buildEstimateHtml(est) {
    const svc = est.svc;
    const sub = est.sub || {};
    const hasPrice = !!(est.low && est.high);
    const fLow = hasPrice ? Math.round(est.low).toLocaleString() : null;
    const fHigh = hasPrice ? Math.round(est.high).toLocaleString() : null;

    let discountLine = "";
    if (est.discountRate && est.discountRate > 0) {
      discountLine =
        '<div class="hb-receipt-row"><span>Promo:</span><span>-' +
        Math.round(est.discountRate * 100) +
        "% applied</span></div>";
    }

    let rushLine = "";
    if (est.isRush) {
      rushLine =
        '<div class="hb-receipt-row"><span>Rush:</span><span>Priority scheduling included</span></div>';
    }

    let modeLabel = "Full (Labor + Materials)";
    if (est.pricingMode === "labor") modeLabel = "Labor Only";
    if (est.pricingMode === "materials") modeLabel = "Materials + Light Help";

    let sizeRow = "";
    if (est.size) {
      sizeRow =
        '<div class="hb-receipt-row"><span>Size:</span><span>' +
        est.size.toLocaleString() +
        " " +
        svc.unit +
        "</span></div>";
    }

    let leadRow = "";
    if (est.isLeadHome) {
      leadRow =
        '<div class="hb-receipt-row" style="color:#d55"><span>Lead Safety:</span><span>Included</span></div>';
    }

    let priceRow = "";
    if (hasPrice) {
      priceRow =
        '<div class="hb-receipt-total"><span>ESTIMATE:</span><span>$' +
        fLow +
        " – $" +
        fHigh +
        "</span></div>";
    } else {
      priceRow =
        '<div class="hb-receipt-total"><span>ESTIMATE:</span><span>Requires on-site walkthrough</span></div>';
    }

    const disclaimerHtml =
      '<div class="hb-receipt-footer">' +
      'Disclaimer: This tool provides an automated ballpark range only. ' +
      'It is not a formal estimate, contract, or offer for services. ' +
      'Final pricing may change based on site conditions, labor requirements, ' +
      'structural issues, materials selected, permits, access limitations, ' +
      'and code compliance. A legally binding estimate is issued only after ' +
      'an in-person walkthrough and a written agreement signed by both parties.' +
      "</div>";

    const linkHtml =
      '<div class="hb-receipt-footer-link">' +
      '<a href="' +
      FULL_ESTIMATOR_URL +
      '" target="_blank" rel="noopener noreferrer">' +
      "🔍 View full detailed project estimator</a>" +
      "</div>";

    return (
      '<div class="hb-receipt">' +
      "<h4>Estimator Summary</h4>" +
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
      rushLine +
      leadRow +
      discountLine +
      priceRow +
      disclaimerHtml +
      linkHtml +
      "</div>"
    );
  }

  function showEstimateAndAskAnother(est) {
    if (!est) return;
    updateProgress(90);

    const html = buildEstimateHtml(est);
    addBotMessage(html, true);

    setTimeout(function() {
      askAddAnother(est);
    }, 1200);
  }

  function askAddAnother(est) {
    state.projects.push(est);
    updateProgress(92);

    addBotMessage("Would you like to add another project to this estimate?");
    addChoices(
      [
        { label: "➕ Add Another Project", key: "yes" },
        { label: "No, continue", key: "no" }
      ],
      function(choice) {
        const key =
          choice.key ||
          (choice.label && choice.label.indexOf("No") !== -1 ? "no" : "yes");
        if (key === "yes") {
          resetProjectState();
          addBotMessage("Great! What type of project is the next one?");
          presentServiceOptions();
        } else {
          showCombinedReceiptAndLeadCapture();
        }
      }
    );
  }

  function showCombinedReceiptAndLeadCapture() {
    updateProgress(96);
    const projects = state.projects;
    if (!projects || !projects.length) return;

    let totalLow = 0;
    let totalHigh = 0;

    const rowsHtml = projects
      .map(function(p, idx) {
        const hasPrice = !!(p.low && p.high);
        if (hasPrice) {
          totalLow += p.low;
          totalHigh += p.high;
        }

        const fLow = hasPrice ? Math.round(p.low).toLocaleString() : "Custom";
        const fHigh = hasPrice ? Math.round(p.high).toLocaleString() : "Quote";
        const sizePart = p.size
          ? " — " + p.size.toLocaleString() + " " + p.svc.unit
          : "";
        const areaPart = p.borough ? " (" + p.borough + ")" : "";

        return (
          '<div class="hb-receipt-row">' +
          "<span># " +
          (idx + 1) +
          " " +
          p.svc.label +
          sizePart +
          areaPart +
          "</span>" +
          "<span>" +
          (hasPrice ? "$" + fLow + " – $" + fHigh : "Walkthrough needed") +
          "</span>" +
          "</div>"
        );
      })
      .join("");

    let totalRow = "";
    if (totalLow && totalHigh) {
      totalRow =
        '<div class="hb-receipt-total"><span>Combined Range:</span><span>$' +
        Math.round(totalLow).toLocaleString() +
        " – $" +
        Math.round(totalHigh).toLocaleString() +
        "</span></div>";
    }

    const html =
      '<div class="hb-receipt">' +
      "<h4>Combined Estimate Summary</h4>" +
      rowsHtml +
      totalRow +
      '<div class="hb-receipt-footer">' +
      "Ask about VIP Home Care memberships and referral rewards for extra savings." +
      "</div>" +
      '<div class="hb-receipt-footer-link">' +
      '<a href="' +
      FULL_ESTIMATOR_URL +
      '" target="_blank" rel="noopener noreferrer">' +
      "🔍 View full detailed project estimator</a>" +
      "</div>" +
      "</div>";

    addBotMessage(html, true);

    setTimeout(function() {
      showLeadCapture(
        "To lock in this combined estimate, I can text or email you everything we just went over."
      );
    }, 1200);
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
  }

  // --- LEAD CAPTURE & LINKS ----------------------------------

  function showLeadCapture(introText) {
    addBotMessage(introText);
    addBotMessage("What is your name?");
    enableInput(function(name) {
      state.name = name;
      addBotMessage("And your mobile number?");
      enableInput(function(phone) {
        state.phone = phone;
        generateFinalLinks();
      });
    });
  }

  function generateFinalLinks() {
    updateProgress(100);

    const lines = [];
    lines.push("Hello, I am " + state.name + ".");
    lines.push("Projects:");

    if (state.projects && state.projects.length) {
      state.projects.forEach(function(p, idx) {
        const sizePart = p.size
          ? " — " + p.size.toLocaleString() + " " + p.svc.unit
          : "";
        const areaPart = p.borough ? " (" + p.borough + ")" : "";
        lines.push(idx + 1 + ". " + p.svc.label + sizePart + areaPart);
      });
    } else if (state.serviceKey && SERVICES[state.serviceKey]) {
      lines.push(SERVICES[state.serviceKey].label);
    }

    lines.push("Phone: " + state.phone);
    lines.push("Please reply to schedule a walkthrough.");
    const body = encodeURIComponent(lines.join("\n"));

    const smsLink = "sms:19295955300?&body=" + body;
    const emailLink =
      "mailto:info@hammerbrickhome.com?subject=" +
      encodeURIComponent("Estimate Request - Hammer Brick & Home") +
      "&body=" +
      body;

    addBotMessage(
      "Thanks, " +
        state.name +
        "! Choose how you would like to contact us and feel free to attach your photos.",
      false
    );

    setTimeout(function() {
      // SMS button
      const smsBtn = document.createElement("a");
      smsBtn.className = "hb-chip";
      smsBtn.style.background = "#e7bf63";
      smsBtn.style.color = "#000";
      smsBtn.style.fontWeight = "bold";
      smsBtn.style.display = "block";
      smsBtn.style.textAlign = "center";
      smsBtn.style.textDecoration = "none";
      smsBtn.style.marginTop = "10px";
      smsBtn.textContent = "📲 Open Text Messages";
      smsBtn.href = smsLink;
      els.body.appendChild(smsBtn);

      // Email button
      const emailBtn = document.createElement("a");
      emailBtn.className = "hb-chip";
      emailBtn.style.display = "block";
      emailBtn.style.textAlign = "center";
      emailBtn.style.textDecoration = "none";
      emailBtn.style.marginTop = "8px";
      emailBtn.textContent = "✉️ Email My Estimate";
      emailBtn.href = emailLink;
      els.body.appendChild(emailBtn);

      // Optional CRM / form
      if (CRM_FORM_URL) {
        const formBtn = document.createElement("a");
        formBtn.className = "hb-chip";
        formBtn.style.display = "block";
        formBtn.style.textAlign = "center";
        formBtn.style.textDecoration = "none";
        formBtn.style.marginTop = "8px";
        formBtn.textContent = "📝 Complete Full Intake Form";
        formBtn.href = CRM_FORM_URL;
        formBtn.target = "_blank";
        els.body.appendChild(formBtn);
      }

      // Optional walkthrough booking
      if (WALKTHROUGH_URL) {
        const walkBtn = document.createElement("a");
        walkBtn.className = "hb-chip";
        walkBtn.style.display = "block";
        walkBtn.style.textAlign = "center";
        walkBtn.style.textDecoration = "none";
        walkBtn.style.marginTop = "8px";
        walkBtn.textContent = "📅 Book a Walkthrough";
        walkBtn.href = WALKTHROUGH_URL;
        walkBtn.target = "_blank";
        els.body.appendChild(walkBtn);
      }

      // Photo button (triggers hidden input)
      const photoBtn = document.createElement("button");
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

  // --- UTILS -------------------------------------------------

  function enableInput(callback) {
    els.input.disabled = false;
    els.input.placeholder = "Type your answer...";
    els.input.focus();

    // Reset send button listener
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

  // --- RUN ---------------------------------------------------

  document.addEventListener("DOMContentLoaded", init);

})();


