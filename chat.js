/* ============================================================
   HAMMER BRICK & HOME — ULTRA ADVANCED ESTIMATOR BOT v6.1
   Multi-Project • Rush • Promo Codes • SMS & Email • Photos
   + Fixed Units, Advanced Add-ons, MINIMUM PROJECT FLOOR (Hidden Overhead)
   + RESTORED: Initial Disclaimer Check (Step Zero)
=============================================================== */

(function() {
  // --- CONFIGURATION & DATA -----------------------------------

  // Removed explicit MOBILIZATION_FEE. Cost is now absorbed into 'min' price floor for each service.

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

  // Pricing Logic / Services (v6.1)
  const SERVICES = {
    // 1. Masonry & Concrete (Square Footage Unit)
    "masonry": {
      label: "Masonry, Concrete & Brickwork", emoji: "🧱", unit: "sq ft", baseLow: 28, baseHigh: 42, minSize: 100, min: 4500, // Enforced price floor
      subQuestion: "What material or scope?",
      options: [
        { label: "Standard Concrete Slab ($)", factor: 1.0 },
        { label: "Brick Repair / Repointing ($$$)", factor: 2.2 }
      ],
      addons: [
          { label: "Power Wash & Sealant Application", key: "sealant", fixedCost: 750, percentFactor: 0.04 },
          { label: "Historical Brick Matching/Review", key: "hist_match", fixedCost: 1500 },
          { label: "NYC Permit Filing (Standard)", key: "permit", fixedCost: 600, percentFactor: 0 }
      ]
    },

    // 2. Roofing (Square Footage Unit)
    "roofing": {
      label: "Roofing", emoji: "🏠", unit: "sq ft", baseLow: 8, baseHigh: 16, minSize: 500, min: 6000,
      subQuestion: "Roof type?",
      options: [
        { label: "Shingle (Standard)", factor: 1.0 }, { label: "Flat Roof (NYC Spec)", factor: 1.5 }
      ],
      addons: [
          { label: "Gutter/Flashing Replacement", key: "flashing", percentFactor: 0.08 },
          { label: "Skylight/Vent Replacement (Per Unit)", key: "skylight_rep", fixedCost: 800 }
      ]
    },

    // 3. Siding Installation (Square Footage Unit)
    "siding": {
        label: "Siding Installation", emoji: "🏡", unit: "sq ft", baseLow: 8.5, baseHigh: 16.5, minSize: 800, min: 7500,
        subQuestion: "Siding material?",
        options: [
            { label: "Vinyl Siding (Standard)", factor: 1.0 }, { label: "Fiber Cement (e.g., HardiePlank)", factor: 1.5 }
        ],
        addons: [
            { label: "Water Barrier/House Wrap Upgrade", key: "wrap", percentFactor: 0.05 },
            { label: "Window/Door Casing Wrap", key: "casing_wrap", percentFactor: 0.04 }
        ]
    },

    // 4. Interior Painting (Square Footage Unit)
    "painting": {
      label: "Interior Painting", emoji: "🎨", unit: "sq ft", baseLow: 3.5, baseHigh: 6.5, minSize: 400, min: 3000,
      subQuestion: "Paint quality & wall condition?", leadSensitive: true,
      options: [
        { label: "Luxury Paint, Heavy Skim Coating", factor: 1.8 }
      ],
      addons: [
          { label: "Ceiling Repair/Recessed Light Prep", key: "ceiling_prep", percentFactor: 0.07 },
          { label: "Trim/Door Painting Package", key: "trim_paint", fixedCost: 500 }
      ]
    },

    // 5. Kitchen Remodel (Fixed Unit)
    "kitchen": {
      label: "Kitchen Remodel", emoji: "🍳", unit: "fixed", quantityMin: 1, // Requires quantity
      subQuestion: "Cabinetry and scope?",
      options: [
        { label: "Refresh (Cosmetic)", fixedLow: 35000, fixedHigh: 55000 },
        { label: "Full Gut / Luxury (Custom Cabinetry)", fixedLow: 65000, fixedHigh: 120000 }
      ],
      addons: [
          { label: "Asbestos/Lead Testing (Mandatory in NYC)", key: "asbestos_test", fixedCost: 1500 },
          { label: "Temporary Kitchen/Utility Setup", key: "temp_kitchen", fixedCost: 1800 },
          { label: "Custom Tiling / Complex Patterning", key: "custom_tile", percentFactor: 0.03 }
      ],
      leadSensitive: true
    },

    // 6. Bathroom Remodel (Fixed Unit)
    "bathroom": {
      label: "Bathroom Remodel", emoji: "🚿", unit: "fixed", quantityMin: 1, // Requires quantity
      subQuestion: "Fixture level and scope?",
      options: [
        { label: "Luxury Wet Room / High-End Tile", fixedLow: 45000, fixedHigh: 80000 }
      ],
      addons: [
          { label: "Custom Niche/Bench Construction", key: "niche", fixedCost: 700 },
          { label: "Heated Flooring System", key: "heated_floor", fixedCost: 2500 },
          { label: "Steam Shower System Install", key: "steam_shower", fixedCost: 4000 }
      ],
      leadSensitive: true
    },

    // 7. Windows Install (Fixed Unit)
    "windows": {
      label: "Windows Install (Per Unit)", emoji: "🪟", unit: "fixed", quantityMin: 2, // Requires quantity
      subQuestion: "Window type?",
      options: [
        { label: "Standard Vinyl", fixedLow: 750, fixedHigh: 1100 },
        { label: "Double Hung Premium", fixedLow: 1100, fixedHigh: 1800 }
      ],
      addons: [
          { label: "Interior Trim Replacement (Per Window)", key: "trim", fixedCost: 150 },
          { label: "Exterior Casing Repair/Painting", key: "casing", fixedCost: 250 },
          { label: "Energy Star Filing/Incentive Prep", key: "energy_star", fixedCost: 300 }
      ],
      leadSensitive: true
    },

    // 8. Door Installation (Fixed Unit)
    "doors": {
      label: "Door Installation (Per Unit)", emoji: "🚪", unit: "fixed", quantityMin: 1, // Requires quantity
      subQuestion: "Door type?",
      options: [
        { label: "Interior Prehung", fixedLow: 350, fixedHigh: 650 },
        { label: "Exterior Steel / Fiberglass", fixedLow: 1200, fixedHigh: 2200 }
      ],
      addons: [
          { label: "Casing/Trim Replacement", key: "trim_replace", fixedCost: 200 }
      ],
      leadSensitive: true
    },

    // 9. System Upgrades (Fixed Unit)
    "system_upgrade": {
        label: "System Upgrades (Electrical/HVAC)", emoji: "⚡️", unit: "fixed", quantityMin: 1,
        subQuestion: "What requires upgrading?",
        options: [
            { label: "Electrical Panel Upgrade (100A/200A)", fixedLow: 3500, fixedHigh: 6500 },
            { label: "HVAC Mini-Split Installation (Per Zone)", fixedLow: 4000, fixedHigh: 7000 }
        ],
        addons: [
            { label: "New dedicated line/circuit", key: "new_circuit", fixedCost: 400 },
            { label: "NYC Permit Filing (Electrical/HVC)", key: "permit", fixedCost: 600 }
        ]
    },

    // 10. Flooring Installation (Square Footage Unit)
    "flooring": {
      label: "Flooring Installation", emoji: "🪚", unit: "sq ft", baseLow: 5.5, baseHigh: 12.5, minSize: 200, min: 3500,
      subQuestion: "Flooring type and prep required?",
      options: [
        { label: "Vinyl Plank / Floating Install", factor: 1.0 },
        { label: "Hardwood Refinishing (Sanding)", factor: 1.6 }
      ],
      addons: [
          { label: "Baseboard/Trim Replacement", key: "trim_replace", percentFactor: 0.05 },
          { label: "Leveling/Subfloor Repair (High Cost)", key: "leveling", percentFactor: 0.12 }
      ]
    },

    // 11. Waterproofing (Linear Footage Unit)
    "waterproofing": {
        label: "Waterproofing & Drainage", emoji: "💧", unit: "linear ft", baseLow: 75, baseHigh: 150, minSize: 40, min: 4000,
        subQuestion: "Scope of work?",
        options: [
            { label: "Exterior French Drain", factor: 1.0 },
            { label: "Interior Basement Drain Tile", factor: 1.6 }
        ],
        addons: [
            { label: "Sump Pump Installation", key: "sump_pump", fixedCost: 2500 }
        ]
    },

    // 12. Deck / Patio Install
    "deck": {
        label: "Deck / Patio Install", emoji: "⛱️", unit: "sq ft", baseLow: 35, baseHigh: 65, minSize: 100, min: 5000,
        subQuestion: "Deck material?",
        options: [
            { label: "Pressure-Treated Wood", factor: 1.0 },
            { label: "Composite Decking (Trex, AZEK)", factor: 1.5 }
        ]
    },

    // 13. Fence Installation
    "fence": {
        label: "Fence Installation", emoji: "🚧", unit: "linear ft", baseLow: 35, baseHigh: 75, minSize: 50, min: 2500,
        subQuestion: "Fence material?",
        options: [
            { label: "Wood", factor: 1.0 },
            { label: "Vinyl / Composite", factor: 1.4 },
            { label: "Aluminum / Steel", factor: 1.6 }
        ]
    },

    // 14. Sidewalk / DOT Concrete
    "sidewalk_dot": {
        label: "Sidewalk / DOT Concrete", emoji: "🪨", unit: "sq ft", baseLow: 15, baseHigh: 22, minSize: 100, min: 2000,
        subQuestion: "Scope of work?",
        options: [
            { label: "Standard Sidewalk Replacement", factor: 1.0 },
            { label: "DOT Violation Repair (Expedited)", factor: 1.4 }
        ]
    },

    // 15. Epoxy Garage Floor
    "epoxy_floor": {
        label: "Epoxy Garage Floor", emoji: "✨", unit: "sq ft", baseLow: 7, baseHigh: 12, minSize: 200, min: 1500,
        subQuestion: "Floor size and finish type?",
        options: [
            { label: "Standard Flake / Single Color", factor: 1.0 },
            { label: "Metallic / High-End Finish", factor: 1.5 }
        ]
    },

    // --- Other Services (Simplified & Updated Pricing)
    "driveway": {
      label: "Driveway", emoji: "🚗", unit: "sq ft", baseLow: 18, baseHigh: 35, minSize: 150, min: 5000,
      subQuestion: "Condition?",
      options: [
        { label: "New Install", factor: 1.0 },
        { label: "Removal Required", factor: 1.25 }
      ]
    },

    "exterior_paint": {
      label: "Exterior Painting", emoji: "🖌", unit: "sq ft", baseLow: 5.5, baseHigh: 10.5, minSize: 800, min: 7500,
      subQuestion: "Condition?",
      options: [
        { label: "Good", factor: 1.0 },
        { label: "Heavy Prep", factor: 1.8 }
      ]
    },

    "handyman": { label: "Small Repairs / Handyman", emoji: "🛠", unit: "consult" },
    "other": { label: "Other / Custom", emoji: "📋", unit: "consult" }
  };


  // --- STATE --------------------------------------------------
  const state = {
    step: 0,
    serviceKey: null,
    subOption: null,
    size: 0,
    quantity: 1,           // NEW: For fixed-unit services (e.g., number of windows)
    selectedAddons: [],    // NEW: List of selected addon objects
    borough: null,
    isLeadHome: false,
    pricingMode: "full",   // full | labor | materials
    isRush: false,
    promoCode: "",
    name: "",
    phone: "",
    projects: []           // list of estimate objects
  };

  let els = {};

  // --- INIT ---------------------------------------------------

  function init() {
    console.log("HB Chat: Initializing v6.1 (Disclaimer Restored)..."); // VERSION BUMP
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

    // Kick off conversation
    addBotMessage("👋 Hi! I can generate a ballpark estimate for your project instantly.");
    setTimeout(function() {
      stepZero_Disclaimer(); // NEW: Start with the disclaimer check
    }, 800);
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
        msgBubble.classList.remove("hb-msg-bot");
        msgBubble.style.minHeight = "auto";
        msgBubble.innerHTML = isHtml ? text : text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      }
      els.body.scrollTop = els.body.scrollHeight;
    }, delay);
  }

  function addUserMessage(text) {
    const div = document.createElement("div");
    div.className = "hb-msg hb-msg-user";
    div.textContent = text;
    els.body.appendChild(div);
    els.body.scrollTop = els.body.scrollHeight;
  }

  function addChoices(choices, callback) {
    disableInput();
    setTimeout(function() {
      const chipContainer = document.createElement("div");
      chipContainer.className = "hb-chips";

      choices.forEach(function(choice) {
        const btn = document.createElement("button");
        const label = (typeof choice === "string") ? choice : choice.label;
        btn.className = "hb-chip";
        btn.textContent = label;

        btn.onclick = function() {
          // Send user message
          addUserMessage(label);
          // Remove all chips
          chipContainer.remove();
          // Execute callback
          callback(choice);
        };
        chipContainer.appendChild(btn);
      });
      els.body.appendChild(chipContainer);
      els.body.scrollTop = els.body.scrollHeight;
    }, 500);
  }

  // --- FLOW CONTROL (v6.1: Initial Disclaimer) -------------------------

  // NEW STEP: Initial Disclaimer Check (Step 0)
  function stepZero_Disclaimer() {
    updateProgress(5);
    const disclaimerHtml = `
      <p>⚠️ **IMPORTANT DISCLAIMER**</p>
      <p>This tool provides a **ballpark cost range** based on average NYC market data and the details you provide. It is **not** a fixed quote.</p>
      <p>The final price depends on:</p>
      <ul>
        <li>A required **on-site inspection**.</li>
        <li>Existing conditions, access, and material selections.</li>
      </ul>
      <p>By proceeding, you acknowledge and agree that this is a **preliminary estimate range** only.</p>
    `;

    addBotMessage(disclaimerHtml, true);

    addChoices(["Yes, I understand and agree", "No, close chat"], function(choice) {
      const val = (typeof choice === "string") ? choice : choice.label;
      if (val.includes("Yes")) {
        presentServiceOptions(); // Proceed to service selection
      } else {
        addBotMessage("Understood. Thank you for visiting.");
        setTimeout(toggleChat, 1000); // Close the chat window
      }
    });
  }

  function presentServiceOptions() {
    updateProgress(10);
    const keys = Object.keys(SERVICES).filter(key => SERVICES[key].unit !== "consult");
    const consultKeys = Object.keys(SERVICES).filter(key => SERVICES[key].unit === "consult");

    const options = keys.map(key => ({
      label: `${SERVICES[key].emoji} ${SERVICES[key].label}`,
      key: key
    }));

    options.push({
      label: `📝 ${SERVICES[consultKeys[0]].label} / Consult`,
      key: consultKeys[0]
    });

    addBotMessage("What type of project are you planning?");
    addChoices(options, function(choice) {
      state.serviceKey = choice.key;
      if (SERVICES[state.serviceKey].unit === "consult") {
        stepEight_PricingMode(); // Skip straight to final contact for consults
      } else {
        stepTwo_SubQuestion();
      }
    });
  }

  function stepTwo_SubQuestion() {
    updateProgress(20);
    const svc = SERVICES[state.serviceKey];

    if (!svc.subQuestion || !svc.options) {
      stepThree_LeadCheck(); // Skip if no sub-options
      return;
    }

    addBotMessage(svc.subQuestion);
    const options = svc.options.map((opt, index) => ({
      label: opt.label,
      index: index,
      data: opt
    }));

    addChoices(options, function(choice) {
      state.subOption = choice.data;
      stepThree_LeadCheck();
    });
  }

  function stepThree_LeadCheck() {
    updateProgress(35);
    const svc = SERVICES[state.serviceKey];
    if (!svc.leadSensitive) {
      state.isLeadHome = false;
      stepFour_Quantity(); // New next step
      return;
    }

    addBotMessage("Since this is a common lead-sensitive project (e.g., painting, remodeling, windows), is the structure older than 1978?");

    addChoices(["Yes, Pre-1978", "No, Built 1978+"], function(choice) {
      const val = (typeof choice === "string") ? choice : choice.label;
      state.isLeadHome = val.includes("Yes");

      if (state.isLeadHome) {
        addBotMessage("Acknowledged. We factor in EPA Lead-Safe Certified procedures (containment, special prep, HEPA vacuums, etc.), which slightly increases the estimate range.");
      }
      stepFour_Quantity(); // New next step
    });
  }

  // FIXED STEP: Fixed-Unit Quantity Check (Step 4)
  function stepFour_Quantity() {
    updateProgress(45);
    const svc = SERVICES[state.serviceKey];

    // Only proceed if it's a fixed unit service (Windows, Doors, Kitchen, Bath, Systems)
    if (svc.unit !== "fixed") {
      state.quantity = 1; // Default to 1 unit for all other services
      stepFive_Size(); // If not fixed, go to the size (sq ft/linear ft) step
      return;
    }

    const unitLabel = svc.label.includes('(Per Unit)') ? 'units' : 'units (e.g., kitchens)';
    const minQty = svc.quantityMin || 1;

    addBotMessage(`How many ${unitLabel} are you looking to install or remodel?`);
    addBotMessage(`(Enter the number, minimum: ${minQty})`);

    function askQuantityManual() {
        enableInput(function(val) {
            const num = parseInt(val.replace(/[^0-9]/g, ""), 10);

            if (!num || num < minQty) {
                const errorMsg = `Please enter at least ${minQty} ${unitLabel}.`;
                addBotMessage(errorMsg);
                askQuantityManual(); // Restart
            } else {
                state.quantity = num;
                addBotMessage(`**Confirmed:** Quantity set to ${num}.`);
                stepSix_Location(); // Skip size, go to location
            }
        }, `Enter number (Min: ${minQty})...`);
    }

    askQuantityManual();
  }

  // MODIFIED STEP: Size Input (Step 5)
  function stepFive_Size() {
    updateProgress(50);
    const svc = SERVICES[state.serviceKey];

    // Already handled in stepFour_Quantity or is consult, skip
    if (svc.unit === "fixed" || svc.unit === "consult" || state.serviceKey === "other") {
        stepSix_Location();
        return;
    }

    addBotMessage(`What is the approximate size of your project in **${svc.unit}**?`);
    addBotMessage(`(Minimum size for a typical project is ${svc.minSize} ${svc.unit})`);

    function askSize() {
      enableInput(function(val) {
        const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
        if (!num || num < svc.minSize) {
          addBotMessage(`That number seems low. Please enter a number greater than ${svc.minSize} (e.g., 500).`);
          askSize();
        } else {
          state.size = num;
          addBotMessage(`**Confirmed:** ${num} ${svc.unit}.`);
          stepSix_Location(); // Next step is Location
        }
      }, `Enter size in ${svc.unit}...`);
    }

    // Optional: Add chips for common sizes
    const commonSizes = [
        { label: "500 sq ft", key: 500 },
        { label: "1,000 sq ft", key: 1000 },
        { label: "150 linear ft", key: 150 }
    ];
    addChoices(commonSizes.filter(s => s.label.includes(svc.unit.split(' ')[0])), function(choice) {
        if (typeof choice === 'object' && choice.key) {
             state.size = choice.key;
             addUserMessage(choice.label);
             stepSix_Location();
        }
    });

    // Fallback to manual input after chips are presented
    setTimeout(askSize, 1000);
  }

  // MODIFIED STEP: Location (Step 6)
  function stepSix_Location() {
    updateProgress(65);
    addBotMessage("Which borough/area is this in?");
    const locs = Object.keys(BOROUGH_MODS);

    addChoices(locs, function(loc) {
      const val = (typeof loc === "string") ? loc : loc.label;
      state.borough = val;
      stepSeven_Addons(); // New next step
    });
  }

  // NEW STEP: Add-ons Selection (Step 7)
  function stepSeven_Addons() {
    updateProgress(70);
    const svc = SERVICES[state.serviceKey];
    if (!svc || !svc.addons || svc.addons.length === 0) {
      state.selectedAddons = [];
      stepEight_PricingMode(); // Skip to next step
      return;
    }

    state.selectedAddons = [];
    const addonsToAsk = [...svc.addons];
    askNextAddon(addonsToAsk);
  }

  function askNextAddon(addonsList) {
    if (addonsList.length === 0) {
      // All done, move to the next step
      stepEight_PricingMode();
      return;
    }

    const currentAddon = addonsList.shift();
    const costEstimate = currentAddon.fixedCost ? ` (~$${currentAddon.fixedCost.toLocaleString()})` : (currentAddon.percentFactor ? ` (~${Math.round(currentAddon.percentFactor * 100)}% extra)` : '');

    addBotMessage(`Do you require the specialized add-on: **${currentAddon.label}**${costEstimate}?`);

    addChoices(["Yes", "No"], function(ans) {
      const val = (typeof ans === "string") ? ans : ans.label;
      if (val === "Yes") {
        state.selectedAddons.push(currentAddon);
      }
      // Continue to the next add-on
      askNextAddon(addonsList);
    });
  }


  // MODIFIED STEP: Pricing Mode (Step 8)
  function stepEight_PricingMode() {
    updateProgress(75);

    addBotMessage("How would you like the estimate structured?");

    addChoices([
      { label: "Full Service (Labor + Materials)", key: "full" },
      { label: "Labor Only (I supply materials)", key: "labor" },
      { label: "Materials Only (Just supply cost)", key: "materials" }
    ], function(choice) {
      const val = (typeof choice === "string") ? choice : choice.key;
      state.pricingMode = val;

      if (val === "materials") {
        addBotMessage("This will provide a materials-only cost range (Lowest cost only).");
      }
      stepNine_Rush(); // Next step is Rush
    });
  }

  // MODIFIED STEP: Rush (Step 9)
  function stepNine_Rush() {
    updateProgress(80);
    addBotMessage("Do you require **Rush Scheduling** (within the next 2-4 weeks)?");

    addChoices(["Yes, Expedited Service", "No, Standard Scheduling"], function(choice) {
      const val = (typeof choice === "string") ? choice : choice.label;
      state.isRush = val.includes("Yes");

      if (state.isRush) {
        addBotMessage("Rush scheduling adds a small surcharge to secure crew availability.");
      }
      stepTen_Promo(); // Next step is Promo
    });
  }

  // MODIFIED STEP: Promo Code (Step 10)
  function stepTen_Promo() {
    updateProgress(85);
    addBotMessage("Do you have a **Promo Code**?");

    addChoices(["Enter Code", "No Code / Skip"], function(choice) {
      const val = (typeof choice === "string") ? choice : choice.label;

      if (val === "Enter Code") {
        addBotMessage("Please enter your promo code now:");
        enableInput(function(code) {
          state.promoCode = code.toUpperCase();
          addBotMessage(`Code: **${state.promoCode}** applied.`);
          stepEleven_Summary();
        }, "Enter promo code..."); // Added placeholder
      } else {
        state.promoCode = "";
        stepEleven_Summary();
      }
    });
  }

  // MODIFIED STEP: Summary (Step 11)
  function stepEleven_Summary() {
    updateProgress(90);

    // Compute and display the current estimate first
    const estimate = computeEstimateForCurrent();
    state.projects.push(estimate);

    addBotMessage("--- **Project Estimate** ---", true);
    addBotMessage(buildEstimateHtml(estimate), true);
    addBotMessage("---------------------------", true);

    addBotMessage("Do you have **another project** to add to this quote, or should we finish up?");

    addChoices(["Add Another Project", "Finish and Get Contact Links"], function(choice) {
      const val = (typeof choice === "string") ? choice : choice.label;
      if (val.includes("Add Another")) {
        // Reset state for the next project
        state.serviceKey = null;
        state.subOption = null;
        state.size = 0;
        state.quantity = 1;
        state.selectedAddons = [];
        state.isLeadHome = false;
        state.step = 0; // Reset flow back to step 1
        updateProgress(10);
        addBotMessage("Ok, what is the next project type?");
        presentServiceOptions(); // Go back to start
      } else {
        stepTwelve_ContactInfo();
      }
    });
  }


  // MODIFIED STEP: Contact Info (Step 12)
  function stepTwelve_ContactInfo() {
    updateProgress(95);

    if (state.projects.length > 1) {
      addBotMessage(`You have **${state.projects.length} estimates** compiled. We need your contact details to deliver the full estimate package.`);
    } else {
      addBotMessage("The estimate is ready. We need your contact details to deliver the full estimate package.");
    }

    // Step 1: Name
    addBotMessage("1. What is your full name?");
    enableInput(function(name) {
      state.name = name.trim();
      addUserMessage(state.name);

      // Step 2: Phone
      addBotMessage("2. What is your best phone number for a text message (SMS)?");
      enableInput(function(phone) {
        // Simple regex to clean phone number (allows formatting)
        state.phone = phone.trim().replace(/[^\d\+\- ]/g, '');
        addUserMessage(state.phone);
        stepThirteen_FinalLinks();
      }, "Enter phone number..."); // Added placeholder
    }, "Enter full name..."); // Added placeholder
  }

  // MODIFIED STEP: Final Links (Step 13)
  function stepThirteen_FinalLinks() {
    updateProgress(100);

    addBotMessage(`Thank you, **${state.name}**. We have texted the estimate details to **${state.phone}**.`);
    addBotMessage(generateFinalLinks(), true);

    // Final message and reset
    setTimeout(function() {
        addBotMessage("Feel free to add photos (📷 button below) or schedule a direct consultation.");
        addBotMessage("If you have any questions, just reach out! We look forward to working with you.");
    }, 1500);

    // Final reset of state (can be changed to a full page reload if preferred)
    Object.assign(state, {
      step: 0,
      serviceKey: null,
      subOption: null,
      size: 0,
      quantity: 1,
      selectedAddons: [],
      borough: null,
      isLeadHome: false,
      pricingMode: "full",
      isRush: false,
      promoCode: "",
      name: "",
      phone: "",
      projects: []
    });
    // The next time the user clicks "Get Quote", they will start over with the disclaimer.
    // We stop the explicit conversational flow here.
  }

  // --- CALCULATIONS ------------------------------------------

  function computeEstimateForCurrent() {
    const svc = SERVICES[state.serviceKey];
    const sub = state.subOption;
    let low = 0;
    let high = 0;

    // 1. Calculate Base Range
    if (svc.unit === "fixed") {
      const numUnits = state.quantity || 1;
      // Fixed units use their base low/high from the sub-option
      low = (sub.fixedLow || 0) * numUnits;
      high = (sub.fixedHigh || 0) * numUnits;
    } else if (svc.unit === "consult") {
      low = svc.min || 0;
      high = svc.min * 1.5 || 0; // Set a small placeholder range for consults
    } else {
      // Calculate unit cost
      const factor = sub.factor || 1.0;
      low = svc.baseLow * state.size * factor;
      high = svc.baseHigh * state.size * factor;
    }

    // 2. Apply Borough Mod
    const mod = BOROUGH_MODS[state.borough] || 1.0;
    low *= mod;
    high *= mod;

    // 3. Apply Lead Safety Bump (10%)
    if (state.isLeadHome && svc.leadSensitive) {
      low *= 1.10;
      high *= 1.10;
    }

    // 4. Enforce Minimum Project Price (Hidden Overhead Cost)
    const minPrice = svc.min || 0;
    if (svc.unit !== "consult") {
      low = Math.max(low, minPrice);
      // Ensure high end maintains a reasonable margin over the minimum low
      high = Math.max(high, minPrice * 1.35);
    }


    // 5. Apply Add-ons
    if (state.selectedAddons && state.selectedAddons.length > 0) {
      state.selectedAddons.forEach(addon => {
          if (addon.fixedCost) {
            low += addon.fixedCost;
            high += addon.fixedCost * 1.15; // 15% margin on fixed cost item
          } else if (addon.percentFactor) {
            // Apply percentage factor to the current running cost
            low *= (1 + addon.percentFactor);
            high *= (1 + addon.percentFactor);
          }
      });
    }

    // 6. Apply Final Modifiers (Rush, Promo, Pricing Mode)
    var adjusted = applyPriceModifiers(low, high);

    return {
      svc: svc,
      sub: sub,
      borough: state.borough,
      size: (svc.unit === "fixed" || svc.unit === "consult") ? null : state.size,
      quantity: state.quantity,
      selectedAddons: state.selectedAddons,
      isLeadHome: state.isLeadHome,
      pricingMode: state.pricingMode,
      isRush: state.isRush,
      promoCode: state.promoCode,
      low: adjusted.low,
      high: adjusted.high,
      discount: adjusted.discount
    };
  }

  function applyPriceModifiers(low, high) {
    // 1. Rush Surcharge (8% for rush jobs)
    if (state.isRush) {
      low *= 1.08;
      high *= 1.08;
    }

    // 2. Promo Discount
    let discount = 0;
    if (state.promoCode && DISCOUNTS[state.promoCode]) {
      discount = DISCOUNTS[state.promoCode];
      low *= (1 - discount);
      high *= (1 - discount);
    }

    // 3. Pricing Mode Adjustment
    if (state.pricingMode === "labor") {
      low *= 0.70; // 30% reduction for customer supplying materials
      high *= 0.85; // 15% reduction for labor-only high end (allows for unexpected labor/material conflict)
    } else if (state.pricingMode === "materials") {
      low *= 0.30; // 70% reduction, showing lowest materials cost estimate
      high = low * 1.5; // High end materials mark up is tighter
    }

    return {
      low: Math.round(low / 100) * 100,
      high: Math.round(high / 100) * 100,
      discount: discount
    };
  }


  // --- OUTPUT FORMATTING -------------------------------------

  function buildEstimateHtml(est) {
    const svc = est.svc;
    const isFixed = svc.unit === "fixed";
    const isConsult = svc.unit === "consult";

    // PROJECT DETAILS
    let detailRow = "";
    if (est.sub) {
      detailRow = `<div class="hb-receipt-row"><span>Scope:</span><span>${est.sub.label}</span></div>`;
    }

    // SIZE/QUANTITY
    var sizeRow = "";
    if (isFixed && est.quantity) {
      sizeRow = `<div class="hb-receipt-row"><span>Units:</span><span>${est.quantity}</span></div>`;
    } else if (est.size) {
      sizeRow = `<div class="hb-receipt-row"><span>Size:</span><span>${est.size} ${svc.unit}</span></div>`;
    }

    // LEAD SAFE
    const leadRow = est.isLeadHome ?
      '<div class="hb-receipt-row"><span class="hb-accent-text">Lead Safety Prep:</span><span>Included</span></div>' : '';

    // ADD-ONS
    var addonRows = "";
    if (est.selectedAddons && est.selectedAddons.length > 0) {
        addonRows = est.selectedAddons.map(a =>
            '<div class="hb-receipt-row"><span>+ Add-on: ' + a.label.split('(')[0].trim() + ':</span><span>Included</span></div>'
        ).join('');
    }

    // RUSH
    const rushLine = est.isRush ?
      '<div class="hb-receipt-row hb-alert-text"><span>Rush Scheduling:</span><span>+8% Est.</span></div>' : '';

    // DISCOUNT
    let discountLine = "";
    if (est.discount > 0) {
      discountLine = `<div class="hb-receipt-row hb-promo-text"><span>Promo Discount:</span><span>-${Math.round(est.discount * 100)}%</span></div>`;
    }

    // PRICE
    const priceStr = isConsult ?
      "Request Consult" :
      `$${est.low.toLocaleString()} - $${est.high.toLocaleString()}`;

    const modeLabel = est.pricingMode.charAt(0).toUpperCase() + est.pricingMode.slice(1);
    const priceRow = `<div class="hb-receipt-row hb-price-row"><span>**${modeLabel} Estimate:**</span><span>**${priceStr}**</span></div>`;

    // CONSULT DISCLAIMER
    const consultDisclaimer = isConsult ?
      '<p class="hb-disclaimer-small">This is a consultation service. Price shown is the typical retainer/small job minimum.</p>' : '';

    // MAIN DISCLAIMER
    const mainDisclaimer = isConsult ? '' :
      `<p class="hb-disclaimer-small">**Range Disclaimer:** This is a ballpark range based on the NYC market and your input. The final price depends on an on-site inspection of existing conditions, access, and material selections. Projects that fall under the minimum size may be subject to a higher per-unit cost.</p>`;


    return `
      <div class="hb-receipt-card">
        <div class="hb-receipt-title">
          ${svc.emoji} **${svc.label}** ${est.borough ? '(' + est.borough + ')' : ''}
        </div>
        <div class="hb-receipt-details">
          ${detailRow}
          ${sizeRow}
          ${leadRow}
          ${rushLine}
          ${addonRows}
          ${discountLine}
          ${priceRow}
        </div>
        ${consultDisclaimer}
      </div>
      ${mainDisclaimer}
    `;
  }

  function generateFinalLinks() {
    var lines = [];

    // Project List
    if (state.projects && state.projects.length) {
      state.projects.forEach(function(p, idx) {
        // MODIFIED: Use quantity if fixed unit, else use size
        var unitDetail = p.svc.unit === "fixed" ? (p.quantity ? (" — " + p.quantity + " units") : "") : (p.size ? (" — " + p.size + " " + p.svc.unit) : "");
        var areaPart = p.borough ? (" (" + p.borough + ")") : "";

        var line = (idx + 1) + ". " + p.svc.label + unitDetail + areaPart;
        var priceStr = p.svc.unit === "consult" ? "Consultation" : `$${p.low.toLocaleString()} - $${p.high.toLocaleString()}`;
        lines.push(line);

        // Extra detail line
        var modeLabel = p.pricingMode.charAt(0).toUpperCase() + p.pricingMode.slice(1);
        var extras = [modeLabel];
        if (p.isRush) extras.push("Rush scheduling");
        if (p.promoCode) extras.push("Promo: " + p.promoCode.toUpperCase());
        if (p.isLeadHome) extras.push("Lead-safe methods");

        // ADDED: Add-ons
        if (p.selectedAddons && p.selectedAddons.length > 0) {
            extras.push("Add-ons: " + p.selectedAddons.map(a => a.label.split('(')[0].trim()).join(', '));
        }

        if (extras.length) {
          lines.push("   [" + extras.join(" | ") + "]");
        }
        lines.push(`   Price Range: ${priceStr}`);
      });
    }

    const estimateText = lines.join("\n");
    const disclaimerText = "Note: This is a preliminary ballpark estimate. The price range is designed to include general overhead and logistical costs (hidden mobilization fee concept). Final pricing requires an on-site walkthrough.";
    const subject = `Estimate Request from ${state.name}`;
    const smsBody = encodeURIComponent(`Estimate for ${state.name} (${state.phone}):\n\n${estimateText}\n\n${disclaimerText}`);
    const emailBody = encodeURIComponent(`Hello Team,\n\nI have generated the following ballpark estimate:\n\n---\n${estimateText}\n---\n\n${disclaimerText}\n\nPlease contact me at ${state.phone} or reply to this email.\n\nThank you,\n${state.name}`);

    // Generate Buttons
    const html = `
      <div class="hb-final-links">
        <a class="hb-link-btn" href="sms:${state.phone}?body=${smsBody}">📥 Text Estimate to Me</a>
        <a class="hb-link-btn" href="mailto:estimates@hammerbrickhome.com?subject=${subject}&body=${emailBody}">📧 Email to Hammer Brick & Home</a>
      </div>
      <p class="hb-disclaimer-small">${disclaimerText}</p>
    `;

    return html;
  }

  // --- UTILS -------------------------------------------------

  function enableInput(callback, placeholderText) {
    els.input.disabled = false;
    els.input.placeholder = placeholderText || "Type your answer...";
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

  function disableInput() {
    els.input.disabled = true;
    els.input.placeholder = "Select an option above...";
  }

  function handleManualInput() {
    // This function is only used when the input is specifically enabled
    // The actual logic is handled by the dynamic els.send.onclick in enableInput()
  }

  // --- KICKOFF ---
  document.addEventListener("DOMContentLoaded", init);

})();
