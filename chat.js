/* ============================================================
   HAMMER BRICK & HOME — ULTRA ADVANCED ESTIMATOR BOT v4.3
   (FIXED: Promo Display, New Button Added, Financing Removed, All Features Restored)
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
      context: "Masonry is typically priced by the square foot, often running **$16–$28 per sq ft** depending on the complexity and finish you choose.",
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
      context: "Driveways are priced by the square foot. Factors like existing asphalt removal can add to the cost, which ranges from **$10–$20 per sq ft**.",
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
      context: "Roofing costs vary widely by material and accessibility. Typical pricing is **$4.50–$9.50 per sq ft**, with a minimum project size of around $6,500.",
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
      context: "A standard interior paint job (walls/ceiling) runs about **$1.80–$3.80 per sq ft** of floor space, depending on the quality of paint selected.",
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
      context: "Exterior painting, including surface prep, typically ranges from **$2.50–$5.50 per sq ft** of surface area. Extensive prep work will increase the price.",
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
      context: "Epoxy flooring ranges widely based on the system chosen, from a simple 1-part coat to a full flake system, usually **$2.80–$5.50 per sq ft**.",
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
      context: "Fence installation is priced by the linear foot, ranging from **$30–$75 per linear foot** based on material (Wood is cheaper than Aluminum).",
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
      context: "Deck building costs vary significantly based on material. Expect **$35–$65 per sq ft** for labor and materials, with Composite and PVC being the most expensive.",
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
      context: "Drywall projects often require a minimum size due to labor mobilization costs. We typically price **$3.20–$6.50 per sq ft** for install and finishing.",
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
      context: "Flooring installation runs **$3.50–$9.50 per sq ft** for labor, with Tile and Hardwood being the highest due to complexity.",
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
      context: "Gutter installation is priced by the linear foot, from **$15–$35 per linear foot**. Copper gutters are significantly more expensive than Aluminum.",
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
      context: "Window replacements are fixed-price per unit, ranging from **$550–$1,400 per window** for standard sizes, not including Bay or specialty windows.",
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
      context: "Door installation is fixed-price per unit. Interior doors are **$250–$550**, while high-end exterior doors can exceed $1,800.",
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
      context: "Demolition costs **$3.00–$7.50 per sq ft** based on material. Concrete demo is the most labor-intensive and expensive.",
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
      context: "Retaining walls are priced by the linear foot, from **$60–$140 per linear foot**. Poured concrete and stone veneer are the highest-cost materials.",
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
      context: "A full kitchen gut and remodel typically falls between **$30,000 and $55,000** for mid-range finishes. What scope fits your budget?",
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
      context: "A standard bathroom gut and remodel runs from **$24,000–$45,000**. Updates that don't change the layout are cheaper.",
      options: [
        { label: "Update (Fixtures/Tile)", fixedLow: 14000, fixedHigh: 24000 },
        { label: "Full Gut / Redo", fixedLow: 24000, fixedHigh: 45000 }
      ],
      leadSensitive: true
    },

    "siding": {
      label: "Siding Installation",
      emoji: "🏡",
      unit: "sq ft",
      baseLow: 8.5, baseHigh: 18.5, min: 4000,
      subQuestion: "Siding Material?",
      context: "Siding installation is priced by the square foot of surface area, ranging from **$8.50–$18.50 per sq ft**. Wood and Fiber Cement are higher cost than standard Vinyl.",
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
      context: "Chimney repair is a fixed-price service. A full masonry rebuild can cost **$6,500–$12,000**, while minor cap/flashing work is $800–$1,800.",
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
      context: "Insulation costs **$1.20–$3.50 per sq ft**. Spray Foam is the highest-priced but most efficient option.",
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
      context: "Sidewalk and stoop work is highly variable. A concrete sidewalk violation repair is typically **$3,500–$7,500**. Walkways priced per sq ft are cheaper.",
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
      context: "Electrical projects are priced by the unit or scope. A panel upgrade typically runs **$3,000–$5,500**, while new outlets are $250–$450 each.",
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
      context: "Waterproofing is priced by the linear foot, from **$40–$90 per linear foot**. Basement interior work is usually more invasive and costly.",
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
    debrisRemoval: false,
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

    // Kick off conversation with the mandatory disclaimer step
    setTimeout(stepOne_Disclaimer, 800);
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
        msgBubble.innerHTML = isHtml ? text : text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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

  // --- FLOW: DISCLAIMER -> SERVICE -> SUB OPTIONS --------------------------

  function stepOne_Disclaimer() {
    updateProgress(5); // New starting progress

    const welcomeMessage = "👋 Hi! I can generate a ballpark estimate for your project instantly.";
    addBotMessage(welcomeMessage);

    const disclaimerText = `
        Before we begin, please review our **Disclaimer of Service**:
        This tool provides an **automated ballpark range only**. It is not a formal quote, contract, or offer for services. Final pricing may change based on in-person inspection, material costs, permits, and specific site conditions. **By continuing, you acknowledge and agree to this.**
    `;
    setTimeout(() => {
        addBotMessage(disclaimerText, true); // Use true for HTML/markdown formatting

        addChoices([
            { label: "✅ I Agree to the Disclaimer", key: "agree" },
            { label: "❌ Close Chat", key: "exit" }
        ], function(choice) {
            if (choice.key === "agree") {
                addBotMessage("Great! What type of project are you planning?");
                presentServiceOptions();
            } else {
                toggleChat(); // Close the chat
            }
        });
    }, 1200);
  }

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

    // RESTORED HELPFUL CONTEXT MESSAGE
    if (svc.context) {
        addBotMessage(svc.context);
    }

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

  // --- SIZE STEP (SKIPS FIXED / CONSULT, HANDLES isPerSqFt) ---------------------

  function stepFour_Size() {
    updateProgress(50);
    const svc = SERVICES[state.serviceKey];
    const sub = state.subOption || {};
    if (!svc) return;

    // Skip size step for consultation services
    if (svc.unit === "consult" || state.serviceKey === "other") {
      stepFive_Location();
      return;
    }

    // Check if size is needed (for unit-based, or for fixed services with isPerSqFt flag)
    if (svc.unit !== "fixed" || sub.isPerSqFt) {
      // Use "sq ft" for isPerSqFt fixed services, otherwise use the service's unit
      const unitLabel = sub.isPerSqFt ? "sq ft" : svc.unit;

      // RESTORED HELPFUL CONTEXT MESSAGE
      let sizeContext = "Please provide the approximate size in **" + unitLabel + "**.";
      if (svc.unit === 'sq ft') {
          if (state.serviceKey === 'roofing') {
              sizeContext = "How big is your roof in **square feet**? (A typical 2-story NYC brownstone roof is around 800–1,200 sq ft).";
          } else if (state.serviceKey === 'painting') {
              sizeContext = "What is the **total square footage** of the area you want painted? (Not surface area, just floor space).";
          }
      } else if (svc.unit === 'linear ft') {
          sizeContext = "Please provide the total length in **linear feet**. (E.g., for gutters, a typical home needs about 150–200 linear feet).";
      }

      addBotMessage(sizeContext, true);


      function askSize() {
        enableInput(function(val) {
          const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
          if (!num || num < 10) {
            addBotMessage("That number seems low. Please enter a valid number (e.g. 500).");
            askSize();
          } else {
            state.size = num;
            stepFive_Location();
          }
        });
      }
      askSize();
    } else {
      // Fixed price services without size needed (e.g. Kitchen, Windows)
      stepFive_Location();
    }
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
      { label: "Full Project (Labor + Materials)", key: "full" },
      { label: "Labor Only", key: "labor" },
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
      { label: "VIP10", code: "VIP10" },
      { label: "REFERRAL5", code: "REFERRAL5" }
    ];

    addChoices(opts, function(choice) {
      state.promoCode = choice.code || "";
      stepNine_DebrisRemoval(); // Proceeds to debris removal
    });
  }

  // --- STEP: DEBRIS REMOVAL ADD-ON -----------------------

  function stepNine_DebrisRemoval() {
    updateProgress(88);
    // Only ask if a price can be computed for this project
    const svc = SERVICES[state.serviceKey];
    const hasPrice = svc && svc.unit !== "consult" && state.serviceKey !== "other";

    if (hasPrice) {
        addBotMessage("Should we include debris removal, haul-away, and dumpster costs in your estimate? (Typically an extra $800–$1,500)");
        addChoices(["Yes, include debris removal", "No, I'll handle debris"], function(ans) {
            const val = (typeof ans === "string") ? ans : ans.label;
            state.debrisRemoval = !!(val && val.indexOf("Yes") !== -1);
            // DIRECTLY proceed to show estimate (Financing removed)
            const est = computeEstimateForCurrent();
            showEstimateAndAskAnother(est);
        });
    } else {
        // Skip for consultation or custom jobs
        state.debrisRemoval = false;
        // DIRECTLY proceed to show estimate (Financing removed)
        const est = computeEstimateForCurrent();
        showEstimateAndAskAnother(est);
    }
  }

  // --- CALCULATION ENGINE ------------------------------------

  function applyPriceModifiers(low, high) {
    // Pricing mode
    var factor = 1;
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
    var dc = 0;
    if (state.promoCode) {
      var rate = DISCOUNTS[state.promoCode.toUpperCase()];
      if (rate) dc = rate;
    }
    if (dc > 0) {
      low *= (1 - dc);
      high *= (1 - dc);
    }

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
        debrisRemoval: state.debrisRemoval
        // financingNeeded REMOVED
      };
    }

    if (svc.unit === "fixed") {
      // Handles fixed price service AND fixed price services that use the new isPerSqFt flag
      if (sub.isPerSqFt) {
          // Logic for 'fixed' services that require size (like paver walkways)
          low = (sub.fixedLow || 0) * state.size * mod;
          high = (sub.fixedHigh || 0) * state.size * mod;
      } else {
          // Standard fixed price services (like windows, kitchen, etc.)
          low = (sub.fixedLow || 0) * mod;
          high = (sub.fixedHigh || 0) * mod;
      }
    } else {
      var rateLow = svc.baseLow;
      var rateHigh = svc.baseHigh;

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

    var adjusted = applyPriceModifiers(low, high);

    return {
      svc: svc, sub: sub, borough: state.borough,
      size: (svc.unit === "fixed" && !sub.isPerSqFt || svc.unit === "consult") ? null : state.size,
      isLeadHome: state.isLeadHome, pricingMode: state.pricingMode, isRush: state.isRush,
      promoCode: state.promoCode, low: adjusted.low, high: adjusted.high,
      discountRate: adjusted.discountRate, isCustom: false,
      debrisRemoval: state.debrisRemoval
      // financingNeeded REMOVED
    };
  }

  function computeGrandTotal() {
    var totalLow = 0;
    var totalHigh = 0;

    state.projects.forEach(function(p) {
        if (p.low) totalLow += p.low;
        if (p.high) totalHigh += p.high;
    });

    // ADD-ON: DEBRIS REMOVAL (only applied once to the grand total if any project requested it)
    var projectRequiresDebris = state.projects.some(p => p.debrisRemoval === true);
    if (projectRequiresDebris) {
        totalLow += ADD_ON_PRICES.debrisRemoval.low;
        totalHigh += ADD_ON_PRICES.debrisRemoval.high;
    }

    return { totalLow, totalHigh, projectRequiresDebris };
  }

  function buildEstimateHtml(est) {
    var svc = est.svc;
    var sub = est.sub || {};
    var hasPrice = !!(est.low && est.high);
    var fLow = hasPrice ? Math.round(est.low).toLocaleString() : null;
    var fHigh = hasPrice ? Math.round(est.high).toLocaleString() : null;

    var discountLine = "";
    if (est.discountRate && est.discountRate > 0) {
      discountLine =
        '<div class="hb-receipt-row"><span>Promo:</span><span>-' +
        Math.round(est.discountRate * 100) +
        '% applied (' + est.promoCode.toUpperCase() + ')</span></div>';
    }

    var rushLine = "";
    if (est.isRush) {
      rushLine =
        '<div class="hb-receipt-row"><span>Rush:</span><span>Priority scheduling included</span></div>';
    }

    // ADD-ON LINE
    var debrisLine = "";
    if (est.debrisRemoval) {
        debrisLine =
          '<div class="hb-receipt-row" style="color:#0a9"><span>Debris:</span><span>Haul-away **included**</span></div>';
    }

    var modeLabel = "Full (Labor + Materials)";
    if (est.pricingMode === "labor") modeLabel = "Labor Only";
    if (est.pricingMode === "materials") modeLabel = "Materials + Light Help";

    var sizeRow = "";
    if (est.size) {
      // Determine unit label for custom fixed price items
      const unitLabel = sub.isPerSqFt ? "sq ft" : svc.unit;

      sizeRow =
        '<div class="hb-receipt-row"><span>Size:</span><span>' +
        est.size +
        " " +
        unitLabel +
        "</span></div>";
    }

    var leadRow = "";
    if (est.isLeadHome) {
      leadRow =
        '<div class="hb-receipt-row" style="color:#d55"><span>Lead Safety:</span><span>Included</span></div>';
    }

    var priceRow = "";
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
    if (!est) return;
    updateProgress(92);

    // Prepend the visible header for the single project estimate
    var html = '--- **Project Estimate** ---<br>' + buildEstimateHtml(est);
    addBotMessage(html, true);

    setTimeout(function() {
      askAddAnother(est);
    }, 1200);
  }

  function askAddAnother(est) {
    state.projects.push(est);
    updateProgress(94);

    addBotMessage("Would you like to add another project to this estimate?");
    addChoices(
      [
        { label: "➕ Add Another Project", key: "yes" },
        { label: "No, continue", key: "no" }
      ],
      function(choice) {
        var key =
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
    var projects = state.projects;
    if (!projects || !projects.length) return;

    var totals = computeGrandTotal();
    var totalLow = totals.totalLow;
    var totalHigh = totals.totalHigh;

    var rowsHtml = projects
      .map(function(p, idx) {
        var hasPrice = !!(p.low && p.high);

        var fLow = hasPrice ? Math.round(p.low).toLocaleString() : "Custom";
        var fHigh = hasPrice ? Math.round(p.high).toLocaleString() : "Quote";

        // Handle unit label for custom fixed price items
        const unitLabel = p.sub.isPerSqFt ? "sq ft" : p.svc.unit;

        var sizePart = p.size ? " — " + p.size + " " + unitLabel : "";
        var areaPart = p.borough ? " (" + p.borough + ")" : "";

        return (
          '<div class="hb-receipt-row">' +
            "<span>#"+ (idx + 1) + " " + p.svc.label + sizePart + areaPart + "</span>" +
            "<span>" +
              (hasPrice ? "$" + fLow + " – $" + fHigh : "Walkthrough needed") +
            "</span>" +
          "</div>"
        );
      })
      .join("");

    // ADDED DEBRIS ROW TO COMBINED RECEIPT
    var debrisRow = "";
    if (totals.projectRequiresDebris) {
        debrisRow =
            '<div class="hb-receipt-row" style="color:#0a9; font-weight:700;"><span>Debris Removal/Haul-Away:</span><span>$' +
            Math.round(ADD_ON_PRICES.debrisRemoval.low).toLocaleString() +
            " – $" +
            Math.round(ADD_ON_PRICES.debrisRemoval.high).toLocaleString() +
            "</span></div>";
    }

    var totalRow = "";
    // FIXED: Total Row only shows if calculation produced numbers
    if (totalLow && totalHigh) {
      totalRow =
        '<div class="hb-receipt-total">' +
          "<span>Combined Total Range:</span>" +
          "<span>$" +
          Math.round(totalLow).toLocaleString() +
          " – $" +
          Math.round(totalHigh).toLocaleString() +
          "</span>" +
        "</div>";
    }

    // financingFooter REMOVED

    var html =
      '<div class="hb-receipt">' +
        "<h4>Combined Estimate Summary</h4>" +
        rowsHtml +
        debrisRow +
        totalRow +
        '<div class="hb-receipt-footer">' +
          "Ask about VIP Home Care memberships & referral rewards for extra savings." +
        "</div>" +
      "</div>";

    // Prepend the visible header for the combined estimate
    var messageText = '--- **Combined Estimate** ---<br>' + html;
    addBotMessage(messageText, true);

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
    state.debrisRemoval = false; // Reset add-ons for new project
    // state.financingNeeded REMOVED
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

    var lines = [];
    lines.push("Hello, I'm " + state.name + ".");
    lines.push("Projects:");

    if (state.projects && state.projects.length) {
      state.projects.forEach(function(p, idx) {
        // Handle unit label for custom fixed price items
        const unitLabel = p.sub.isPerSqFt ? "sq ft" : p.svc.unit;

        var sizePart = p.size ? (" — " + p.size + " " + unitLabel) : "";
        var areaPart = p.borough ? (" (" + p.borough + ")") : "";

        var line = (idx + 1) + ". " + p.svc.label + sizePart + areaPart;

        if (p.low && p.high) {
          var fLow = Math.round(p.low).toLocaleString();
          var fHigh = Math.round(p.high).toLocaleString();
          line += " — ~$" + fLow + "–$" + fHigh;
        } else {
          line += " (walkthrough needed)";
        }

        lines.push(line);

        // Add extra detail line (mode, rush, promo, lead, debris)
        var modeLabel = "Full (L+M)";
        if (p.pricingMode === "labor") modeLabel = "Labor Only";
        if (p.pricingMode === "materials") modeLabel = "Materials+Help";

        var extras = [modeLabel];
        if (p.isRush) extras.push("Rush");

        // FIX: Promo code display (changed to OFF)
        if (p.promoCode) {
            var dc_rate = DISCOUNTS[p.promoCode.toUpperCase()];
            var dc_text = dc_rate ? " (" + Math.round(dc_rate * 100) + "% OFF)" : ""; // Changed 'off' to 'OFF'
            extras.push("Promo: " + p.promoCode.toUpperCase() + dc_text);
        }

        if (p.isLeadHome) extras.push("Lead-safe");
        if (p.debrisRemoval) extras.push("Debris: Included");

        if (extras.length) {
          lines.push("   [" + extras.join(" | ") + "]");
        }
      });

      // Add combined add-ons and totals
      var totals = computeGrandTotal();

      // Financing detail REMOVED

      // Add debris add-on if applicable
      if (totals.projectRequiresDebris) {
          lines.push("Add-on: Debris Removal (~$" + Math.round(ADD_ON_PRICES.debrisRemoval.low).toLocaleString() + "–$" + Math.round(ADD_ON_PRICES.debrisRemoval.high).toLocaleString() + ")");
      }

      // Add Combined Total
      if (totals.totalLow) {
          lines.push("\nCOMBINED RANGE: $" + Math.round(totals.totalLow).toLocaleString() + " – $" + Math.round(totals.totalHigh).toLocaleString());
      }
    } else if (state.serviceKey && SERVICES[state.serviceKey]) {
      lines.push(SERVICES[state.serviceKey].label);
    }

    lines.push("Customer Name: " + state.name);
    lines.push("Phone: " + state.phone);
    lines.push("Please reply to schedule a walkthrough.");
    lines.push("");
    lines.push(
      "Disclaimer: This is an automated ballpark estimate only. " +
      "It is not a formal estimate, contract, or offer for services. " +
      "Final pricing may change after an in-person walkthrough and a written agreement."
    );

    var body = encodeURIComponent(lines.join("\n"));

    // Phone and Email Fixes
    var smsLink = "sms:9295955300?&body=" + body;
    var emailLink =
      "mailto:hammerbrickhome@gmail.com?subject=" +
      encodeURIComponent("Estimate Request - Hammer Brick & Home") +
      "&body=" +
      body;

    addBotMessage(
      "Thanks, " +
        state.name +
        "! Choose how you’d like to contact us and feel free to attach your photos.",
      false
    );

    setTimeout(function() {

      // 1. Text to My Phone (user's preferred self-save)
      var smsUserBtn = document.createElement("a");
      smsUserBtn.className = "hb-chip hb-primary-btn";
      smsUserBtn.style.display = "block";
      smsUserBtn.style.textAlign = "center";
      smsUserBtn.style.textDecoration = "none";
      smsUserBtn.style.marginTop = "10px";
      smsUserBtn.textContent = "📲 Text Estimate to My Phone";
      smsUserBtn.href = smsLink;
      els.body.appendChild(smsUserBtn);

      // 2. Text to Hammer Brick (NEW BUTTON REQUESTED)
      var smsHBBtn = document.createElement("a");
      smsHBBtn.className = "hb-chip hb-primary-btn";
      smsHBBtn.style.display = "block";
      smsHBBtn.style.textAlign = "center";
      smsHBBtn.style.textDecoration = "none";
      smsHBBtn.style.marginTop = "8px";
      smsHBBtn.textContent = "📲 Text Estimate to Hammer Brick";
      smsHBBtn.href = smsLink;
      els.body.appendChild(smsHBBtn);

      // 3. Email button
      var emailBtn = document.createElement("a");
      emailBtn.className = "hb-chip hb-primary-btn";
      emailBtn.style.display = "block";
      emailBtn.style.textAlign = "center";
      emailBtn.style.textDecoration = "none";
      emailBtn.style.marginTop = "8px";
      emailBtn.textContent = "✉️ Email Estimate to Hammer Brick & Home";
      emailBtn.href = emailLink;
      els.body.appendChild(emailBtn);

      // Optional CRM / form
      if (CRM_FORM_URL) {
        var formBtn = document.createElement("a");
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
        var walkBtn = document.createElement("a");
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

  // --- UTILS -------------------------------------------------

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

  function handleManualInput() {
    if (!els.input.disabled && els.send) els.send.click();
  }

  // --- RUN ---------------------------------------------------

  document.addEventListener("DOMContentLoaded", init);

})();
