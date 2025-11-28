/* ============================================================
   HAMMER BRICK & HOME — ESTIMATOR BOT v14.3 (FULL CPQ SUITE)
   - NEW: Financing Calc, Gated Pricing, Phone Masking.
   - NEW: Real Estimate ID, Session Save, Photo Warning.
   - NEW: HVAC, Junk Removal, Design Services added.
   - INCLUDES: Anti-Freeze ID, Lead-Safe Logic, Analytics.
=============================================================== */

(function() {
  // --- CONFIGURATION -----------------------------------------

  const BOT_VERSION = "14.3";
  const WEBHOOK_URL = ""; // <- Plug in your Zapier/Make URL here
  const PHONE_NUMBER = "9295955300"; 
  const CRM_FORM_URL = ""; 
  const WALKTHROUGH_URL = "";
  
  // Financing: approx 9.99% APR for 60 months
  const FINANCING_RATE = 0.0999 / 12; 
  const FINANCING_MONTHS = 60;

  // Modifiers apply to BASE PRICE + ADD-ONS + DEBRIS
  const BOROUGH_MODS = {
    "Manhattan": 1.18, "Brooklyn": 1.08, "Queens": 1.05,
    "Bronx": 1.03, "Staten Island": 1.0, "New Jersey": 0.96
  };

  const DISCOUNTS = { "VIP10": 0.10, "REFERRAL5": 0.05, "WEBSAVER": 0.05 };
  
  // Base Debris Price
  const ADD_ON_PRICES = { "debrisRemoval": { low: 1200, high: 2800 } }; 

  const SMART_ADDON_GROUP_LABELS = {
    luxury: "Luxury Upgrades", protection: "Protection & Safety",
    design: "Design Enhancements", speed: "Speed / Convenience",
    maintenance: "Maintenance Items"
  };

  // --- SMART ADD-ONS CONFIG (RETAINED & EXPANDED) ---
  const SMART_ADDONS_CONFIG = {
    masonry: {
      title: "Masonry · Pavers · Concrete",
      groups: {
        luxury: [
          { label: "Premium border band (Granite/Blue Stone)", low: 1800, high: 3500 },
          { label: "Decorative inlays or medallion pattern", low: 1500, high: 4200 },
          { label: "Raised seating wall (per 10ft)", low: 3500, high: 6800 }, 
          { label: "Outdoor kitchen prep pad", low: 3200, high: 7500 }
        ],
        protection: [
          { label: "Full base compaction + Geogrid", low: 1200, high: 2800 },
          { label: "Perimeter channel drain system", low: 1800, high: 3800 }, 
          { label: "Concrete edge restraint / curb", low: 950, high: 2200 }
        ],
        design: [
          { label: "Color upgrade / multi-blend pavers", low: 850, high: 2200 },
          { label: "Step face stone veneer upgrade", low: 1800, high: 4500 }
        ],
        speed: [
          { label: "Weekend or off-hours install", low: 1500, high: 3500 }
        ],
        maintenance: [
          { label: "Polymeric sand refill", low: 450, high: 950 }
        ]
      }
    },
    // ... (Keeping existing addon configs, mapping new services below)
    hvac: {
        title: "HVAC / Mini-Splits",
        groups: {
            luxury: [{ label: "Wi-Fi Smart Controllers", low: 400, high: 900 }],
            protection: [{ label: "Line Set Covers (Hide pipes)", low: 350, high: 800 }]
        }
    },
    junk_removal: {
        title: "Junk Removal",
        groups: {
            speed: [{ label: "Same Day Rush", low: 250, high: 500 }]
        }
    }
  };

  // --- FULL SERVICE DEFINITIONS (EXPANDED) ---
  const SERVICES = {
    "masonry": {
      label: "Masonry & Concrete", emoji: "🧱", unit: "sq ft",
      baseLow: 16, baseHigh: 28, min: 2500,
      subQuestion: "What type of finish?",
      options: [
        { label: "Standard Concrete ($)", factor: 1.0 },
        { label: "Pavers ($$)", factor: 1.6 },
        { label: "Natural Stone ($$$)", factor: 2.2 }
      ],
      sizePresets: [
        { label: "Sidewalk Flag (25 sq ft)", val: 25 },
        { label: "Standard Backyard (20x20)", val: 400 },
        { label: "Large Driveway/Yard (50x20)", val: 1000 }
      ]
    },
    "driveway": {
      label: "Driveway", emoji: "🚗", unit: "sq ft",
      baseLow: 10, baseHigh: 20, min: 3500,
      subQuestion: "Current surface condition?",
      options: [
        { label: "Dirt/Gravel (New)", factor: 1.0 },
        { label: "Existing Asphalt (Removal)", factor: 1.25 },
        { label: "Existing Concrete (Hard Demo)", factor: 1.4 }
      ]
    },
    "roofing": {
      label: "Roofing", emoji: "🏠", unit: "sq ft",
      baseLow: 4.5, baseHigh: 9.5, min: 6500,
      subQuestion: "Roof type?",
      options: [
        { label: "Shingle (Standard)", factor: 1.0 },
        { label: "Flat Roof (NYC Spec)", factor: 1.5 },
        { label: "Slate/Specialty", factor: 2.5 }
      ]
    },
    "hvac": {
        label: "HVAC / Mini-Splits", emoji: "❄️", unit: "fixed",
        subQuestion: "Number of zones/heads?",
        options: [
            { label: "Single Zone (1 Head)", fixedLow: 3500, fixedHigh: 5500 },
            { label: "Dual Zone (2 Heads)", fixedLow: 6500, fixedHigh: 9500 },
            { label: "Whole Home (3-5 Heads)", fixedLow: 12000, fixedHigh: 22000 }
        ]
    },
    "junk_removal": {
        label: "Junk Removal", emoji: "🗑️", unit: "fixed",
        subQuestion: "Volume estimate?",
        options: [
            { label: "1/4 Truck (Small Pile)", fixedLow: 350, fixedHigh: 550 },
            { label: "1/2 Truck", fixedLow: 550, fixedHigh: 850 },
            { label: "Full Truck Load", fixedLow: 850, fixedHigh: 1400 }
        ]
    },
    "design": {
        label: "Design & Blueprints", emoji: "📐", unit: "consult",
        subQuestion: "Phase?",
        options: [
            { label: "Concept Sketches", fixedLow: 500, fixedHigh: 1500 },
            { label: "DOB Filing / Architect", fixedLow: 3500, fixedHigh: 8500 }
        ]
    },
    "demo": {
      label: "Structural Demo", emoji: "💥", unit: "sq ft",
      baseLow: 3.0, baseHigh: 7.5, min: 900,
      subQuestion: "Material?", leadSensitive: true,
      options: [
        { label: "Drywall", factor: 1.0 },
        { label: "Tile / Bathroom Demo", factor: 1.8 },
        { label: "Concrete Demo", factor: 2.4 }
      ]
    },
    "painting": {
      label: "Interior Painting", emoji: "🎨", unit: "sq ft",
      baseLow: 1.8, baseHigh: 3.8, min: 1800,
      subQuestion: "Paint quality?", leadSensitive: true,
      options: [
        { label: "Standard Paint", factor: 1.0 },
        { label: "Premium Paint", factor: 1.3 },
        { label: "Luxury Benjamin Moore", factor: 1.55 }
      ]
    },
    "exterior_paint": {
      label: "Exterior Painting", emoji: "🖌", unit: "sq ft",
      baseLow: 2.5, baseHigh: 5.5, min: 3500,
      subQuestion: "Surface condition?",
      options: [
        { label: "Good Condition", factor: 1.0 },
        { label: "Peeling / Prep Needed", factor: 1.4 }
      ]
    },
    "fence": {
      label: "Fence Install", emoji: "🚧", unit: "linear ft",
      baseLow: 30, baseHigh: 75, min: 1800,
      subQuestion: "Fence type?",
      options: [
        { label: "Wood", factor: 1.0 },
        { label: "PVC", factor: 1.6 },
        { label: "Aluminum", factor: 2.0 }
      ]
    },
    "deck": {
      label: "Deck / Porch Build", emoji: "🪵", unit: "sq ft",
      baseLow: 35, baseHigh: 65, min: 5000,
      subQuestion: "Deck material?",
      options: [
        { label: "Pressure Treated", factor: 1.0 },
        { label: "Composite (Trex)", factor: 1.9 }
      ]
    },
    "drywall": {
      label: "Drywall Install", emoji: "📐", unit: "sq ft",
      baseLow: 3.2, baseHigh: 6.5, min: 750,
      subQuestion: "Scope?",
      options: [
        { label: "Full Install", factor: 1.6 },
        { label: "Level 5 Finish", factor: 2.1 }
      ]
    },
    "flooring": {
      label: "Flooring", emoji: "🪚", unit: "sq ft",
      baseLow: 3.5, baseHigh: 9.5, min: 2500,
      subQuestion: "Flooring type?",
      options: [
        { label: "Vinyl Plank", factor: 1.0 },
        { label: "Tile", factor: 1.8 },
        { label: "Hardwood", factor: 2.4 }
      ]
    },
    "powerwash": {
      label: "Power Washing", emoji: "💦", unit: "sq ft",
      baseLow: 0.35, baseHigh: 0.85, min: 250,
      quickQuote: true,
      sizePresets: [
        { label: "Deck / Patio Only", val: 300 },
        { label: "Siding (One Side)", val: 500 },
        { label: "Whole House", val: 2000 }
      ]
    },
    "gutter": {
      label: "Gutter Install", emoji: "🩸", unit: "linear ft",
      baseLow: 15, baseHigh: 35, min: 1200,
      quickQuote: true,
      subQuestion: "Type?",
      options: [
        { label: "Seamless Aluminum", factor: 1.4 },
        { label: "Copper", factor: 3.5 }
      ]
    },
    "windows": {
      label: "Windows Install", emoji: "🪟", unit: "fixed",
      subQuestion: "Window type?",
      options: [
        { label: "Standard Vinyl", fixedLow: 550, fixedHigh: 850 },
        { label: "Double Hung Premium", fixedLow: 850, fixedHigh: 1400 }
      ]
    },
    "doors": {
      label: "Door Installation", emoji: "🚪", unit: "fixed",
      subQuestion: "Door type?",
      options: [
        { label: "Interior", fixedLow: 250, fixedHigh: 550 },
        { label: "Exterior Steel / Fiberglass", fixedLow: 950, fixedHigh: 1800 }
      ]
    },
    "handyman": {
      label: "Small Repairs", emoji: "🛠", unit: "consult", quickQuote: true
    },
    "kitchen": {
      label: "Kitchen Remodel", emoji: "🍳", unit: "fixed",
      subQuestion: "Scope?",
      options: [
        { label: "Refresh (Cosmetic)", fixedLow: 18000, fixedHigh: 30000 },
        { label: "Full Gut / Luxury", fixedLow: 55000, fixedHigh: 110000 }
      ],
      leadSensitive: true
    },
    "bathroom": {
      label: "Bathroom Remodel", emoji: "🚿", unit: "fixed",
      subQuestion: "Scope?",
      options: [
        { label: "Update (Fixtures/Tile)", fixedLow: 14000, fixedHigh: 24000 },
        { label: "Full Gut / Redo", fixedLow: 24000, fixedHigh: 45000 }
      ],
      leadSensitive: true
    },
    "siding": {
      label: "Siding Install", emoji: "🏡", unit: "sq ft",
      baseLow: 8.5, baseHigh: 18.5, min: 4000,
      subQuestion: "Material?",
      options: [
        { label: "Vinyl", factor: 1.0 },
        { label: "Wood/Cedar Shake", factor: 1.8 }
      ]
    },
    "chimney": {
      label: "Chimney Repair", emoji: "🔥", unit: "fixed",
      subQuestion: "Scope?",
      options: [
        { label: "Cap / Flashing Repair", fixedLow: 800, fixedHigh: 1800 },
        { label: "Rebuild", fixedLow: 6500, fixedHigh: 12000 }
      ]
    },
    "insulation": {
      label: "Insulation", emoji: "🌡️", unit: "sq ft",
      baseLow: 1.2, baseHigh: 3.5, min: 1000,
      subQuestion: "Type?",
      options: [
        { label: "Fiberglass", factor: 1.0 },
        { label: "Spray Foam", factor: 2.5 }
      ]
    },
    "sidewalk": {
      label: "Sidewalk / DOT", emoji: "🚶", unit: "fixed",
      subQuestion: "Scope?",
      options: [
        { label: "Sidewalk Violation Repair", fixedLow: 3500, fixedHigh: 7500 },
        { label: "Front Steps / Stoop Rebuild", fixedLow: 6000, fixedHigh: 15000 }
      ]
    },
    "outdoor_living": {
      label: "Outdoor Living", emoji: "🔥", unit: "fixed",
      subQuestion: "Build type?",
      options: [
        { label: "Outdoor Kitchen", fixedLow: 12000, fixedHigh: 25000 },
        { label: "Full Patio & Firepit", fixedLow: 25000, fixedHigh: 65000 }
      ]
    },
    "waterproofing": {
      label: "Waterproofing", emoji: "💧", unit: "linear ft",
      baseLow: 40, baseHigh: 90, min: 2500,
      subQuestion: "Location?",
      options: [
        { label: "Exterior Foundation", factor: 1.0 },
        { label: "Basement Interior", factor: 1.5 }
      ]
    },
    "other": {
      label: "Other / Custom", emoji: "📋", unit: "consult"
    }
  };

  // --- STATE MANAGEMENT ---------------------------------------
  
  // Generate a unique estimate ID for the session
  function generateEstimateID() {
    return "HB-" + Math.floor(100000 + Math.random() * 900000);
  }

  let state = {
    step: 0,
    estimateId: null, // Anti-freeze ID
    lang: "en", // en or es
    serviceKey: null,
    subOption: null,
    size: 0,
    borough: null,
    isLeadHome: false,
    pricingMode: "full",
    isRush: false,
    promoCode: "",
    debrisRemoval: false,
    selectedAddons: [], 
    name: "",
    phone: "",
    projectTiming: "",
    leadSource: "",
    projects: [],
    isPhotoSkip: false 
  };

  let els = {};
  let tickerInterval; 

  // --- HELPER: ANALYTICS & SAVING -----------------------------

  function trackEvent(name, data) {
    console.log("HB_TRACK:", name, data);
    // if (typeof gtag === 'function') { gtag('event', name, data); }
  }

  function saveState() {
    try {
      localStorage.setItem("hb_estimator_state", JSON.stringify(state));
    } catch(e) {}
  }

  function loadState() {
    try {
      const saved = localStorage.getItem("hb_estimator_state");
      if (saved) {
        // Logic could go here to resume. For now, we just note it.
        // const parsed = JSON.parse(saved);
        // if(parsed.name) ...
      }
    } catch(e) {}
  }

  // --- INIT ---------------------------------------------------

  function init() {
    console.log(`HB Chat: Initializing v${BOT_VERSION}...`);
    loadState();
    createInterface();
    startTicker();
    
    // Auto-open logic
    if (!sessionStorage.getItem("hb_has_opened_automatically")) {
        setTimeout(function() {
            if (!els.wrapper.classList.contains("hb-open")) {
                toggleChat();
                sessionStorage.setItem("hb_has_opened_automatically", "true");
            }
        }, 4000); 
    }

    setTimeout(stepOne_Disclaimer, 800);
  }

  function createInterface() {
    const fab = document.createElement("div");
    fab.className = "hb-chat-fab";
    fab.setAttribute("aria-label", "Instant Estimate");
    fab.innerHTML = `<span class="hb-fab-icon">⚡</span><span class="hb-fab-text">Instant Estimate</span>`;
    fab.style.display = "flex"; 
    fab.style.zIndex = "2147483647";
    fab.onclick = toggleChat;
    document.body.appendChild(fab);

    const wrapper = document.createElement("div");
    wrapper.className = "hb-chat-wrapper";
    wrapper.innerHTML = `
      <div class="hb-chat-header">
        <div class="hb-chat-title">
          <h3>Hammer Brick & Home</h3>
          <span style="color:#e7bf63; font-size:11px; letter-spacing:0.5px;">★★★★★ 5.0 on Google</span>
        </div>
        <div style="display:flex; gap:15px; align-items:center;">
            <a href="tel:${PHONE_NUMBER}" style="text-decoration:none; color:#fff; font-size:18px;" aria-label="Call Now">📞</a>
            <button class="hb-chat-close" style="font-size:24px;">×</button>
        </div>
      </div>
      <div id="hb-ticker" style="background:#1c263b; color:#888; font-size:10px; padding:6px 16px; border-bottom:1px solid rgba(255,255,255,0.05); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        Initializing...
      </div>
      <div class="hb-progress-container">
        <div class="hb-progress-bar" id="hb-prog"></div>
      </div>
      <div class="hb-chat-body" id="hb-body" role="log" aria-live="polite"></div>
      <div class="hb-chat-footer">
        <input type="text" class="hb-chat-input" id="hb-input" placeholder="Select an option..." disabled>
        <button class="hb-chat-send" id="hb-send">➤</button>
      </div>
    `;
    document.body.appendChild(wrapper);

    const photoInput = document.createElement("input");
    photoInput.type = "file";
    photoInput.accept = "image/*";
    photoInput.multiple = true;
    photoInput.style.display = "none";
    photoInput.id = "hb-photo-input";
    document.body.appendChild(photoInput);

    els = {
      wrapper, fab, body: document.getElementById("hb-body"),
      input: document.getElementById("hb-input"),
      send: document.getElementById("hb-send"),
      prog: document.getElementById("hb-prog"),
      ticker: document.getElementById("hb-ticker"),
      close: wrapper.querySelector(".hb-chat-close"),
      photoInput
    };

    els.close.onclick = toggleChat;
    els.send.onclick = handleManualInput;
    els.input.addEventListener("keypress", function(e) {
      if (e.key === "Enter") handleManualInput();
    });

    photoInput.addEventListener("change", function() {
      if (!photoInput.files || !photoInput.files.length) return;
      addBotMessage(`📷 You selected ${photoInput.files.length} photo(s). I've marked them for your file.`);
      trackEvent("photo_uploaded", { count: photoInput.files.length });
    });
  }

  function startTicker() {
      if (!els.ticker) return;
      const msgs = [
        "⚡ Get a price range in 60 seconds – No phone call needed.",
        "🛡️ NYC Licensed & Insured: HIC #2131291 · EPA Lead-Safe Certified",
        "💳 VIP Members get 10% off labor + priority emergency scheduling.",
        "📸 Text us photos for a fast ballpark estimate.",
        "📍 Serving Manhattan, Brooklyn, Queens, Bronx, Staten Island & NJ."
      ];
      let i = 0;
      els.ticker.innerText = msgs[0];
      setInterval(() => {
          i = (i + 1) % msgs.length;
          els.ticker.innerText = msgs[i];
      }, 4000); 
  }

  function toggleChat() {
    const isOpen = els.wrapper.classList.toggle("hb-open");
    if (isOpen) {
      els.fab.style.display = "none";
      sessionStorage.setItem("hb_chat_active", "true");
      if(els.input && !els.input.disabled) els.input.focus();
      trackEvent("chat_opened");
    } else {
      els.fab.style.display = "flex";
      sessionStorage.removeItem("hb_chat_active");
    }
  }

  function updateProgress(pct, label) {
    if (els.prog) els.prog.style.width = pct + "%";
  }

  // --- MESSAGING ---

  function addBotMessage(text, isHtml) {
    const typingId = "typing-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
    
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

    const delay = Math.min(1500, text.length * 15 + 400);

    setTimeout(function() {
      const msgBubble = document.getElementById(typingId);
      if (msgBubble) {
        msgBubble.innerHTML = isHtml ? text : text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
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

  function getSeasonalGreeting() {
      const month = new Date().getMonth(); 
      if (month === 10 || month === 11) return "❄️ Winter is coming! Check our freeze-protection packages."; 
      if (month >= 2 && month <= 4) return "🌸 Spring Rush is starting! Secure your dates now.";
      if (month >= 5 && month <= 7) return "☀️ Summer is here! Perfect time for outdoor living.";
      return "👋 Hi! Ready to upgrade your home?";
  }

  function stepOne_Disclaimer() {
    state.estimateId = generateEstimateID(); // Generate unique ID at start
    updateProgress(5, "Start");
    saveState();
    
    addBotMessage(getSeasonalGreeting());

    const disclaimerText = `
        I can generate a **ballpark price range** for your project in about 60 seconds. 
        <br><br><small>Ref ID: ${state.estimateId}</small>
    `;
    setTimeout(() => {
        addBotMessage(disclaimerText, true);
        addChoices([
            { label: "🚀 Start Estimate", key: "agree" }, 
            { label: "🌐 Español (Beta)", key: "es" },
            { label: "❌ Close", key: "exit" }
        ], function(choice) {
            if (choice.key === "es") {
                state.lang = "es";
                addBotMessage("Hola. Continuaremos en inglés por ahora, pero marcaremos su preferencia de idioma. (Hello. We will continue in English for now, but mark your language preference.)");
                setTimeout(() => presentServiceOptions(), 1500);
            } else if (choice.key === "agree") {
                addBotMessage("Awesome. What type of project are you planning?");
                presentServiceOptions();
            } else {
                toggleChat();
            }
        });
    }, 1200);
  }

  function presentServiceOptions() {
    updateProgress(10);
    const opts = Object.keys(SERVICES).map(function(k) {
      return { label: SERVICES[k].emoji + " " + SERVICES[k].label, key: k };
    });

    opts.unshift({ label: "📸 Send Photo (Skip to Quote)", key: "photo_skip" });

    addChoices(opts, function(selection) {
      if (selection.key === "photo_skip") {
          state.isPhotoSkip = true;
          addBotMessage("Smart choice. A picture is worth a thousand words.");
          if(els.photoInput) els.photoInput.click();
          setTimeout(() => {
              showLeadCapture(); // Gate immediately
          }, 1000);
      } else {
          state.serviceKey = selection.key;
          state.subOption = null;
          trackEvent("service_selected", { service: state.serviceKey });
          stepTwo_SubQuestions();
      }
    });
  }

  function stepTwo_SubQuestions() {
    updateProgress(30);
    const svc = SERVICES[state.serviceKey];
    if (!svc) return;

    if (svc.quickQuote) {
      addBotMessage("⚡ This looks like a quick job. Do you want a fast estimate or full detail?");
      addChoices([{label:"⚡ Quick Estimate", k:"quick"}, {label:"📝 Full Detail", k:"full"}], (c) => {
        if(c.k === "quick") {
           state.subOption = { factor: 1.0, label: "Standard" };
           if(svc.unit === "consult") stepFive_Location(); 
           else stepFour_Size();
        } else {
           proceedSub();
        }
      });
      return;
    }
    proceedSub();

    function proceedSub() {
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
  }

  function stepThree_LeadCheck() {
    const svc = SERVICES[state.serviceKey];
    if (svc && svc.leadSensitive) {
      addBotMessage("Is your property built before 1978? (Required for lead safety laws).");
      addChoices(["Yes (Pre-1978)", "No / Not Sure"], function(ans) {
        state.isLeadHome = !!(ans && ans.indexOf("Yes") !== -1);
        saveState();
        stepFour_Size();
      });
    } else {
      stepFour_Size();
    }
  }

  function stepFour_Size() {
    updateProgress(40);
    const svc = SERVICES[state.serviceKey];
    const sub = state.subOption || {};
    if (!svc) return;

    if (svc.unit === "consult" || state.serviceKey === "other") {
        if (state.serviceKey === "other") {
            addBotMessage("Is this project mostly **Indoor**, **Outdoor**, or **Both**?");
            addChoices(["Indoor", "Outdoor", "Both"], () => {
                addBotMessage("Got it. We'll need a walkthrough for accurate pricing.");
                stepFive_Location();
            });
            return;
        }
        stepFive_Location();
        return;
    }

    if (svc.unit !== "fixed" || sub.isPerSqFt) {
      const unitLabel = sub.isPerSqFt ? "sq ft" : svc.unit;
      
      if (svc.sizePresets && svc.sizePresets.length > 0) {
        addBotMessage(`Choose a common size, or type exact ${unitLabel} below:`);
        
        const presetChoices = svc.sizePresets.map(p => ({ label: p.label, val: p.val }));
        
        addChoices(presetChoices, function(choice) {
            state.size = choice.val;
            addBotMessage(`Selected: ${choice.val} ${unitLabel}`);
            setTimeout(stepFive_Location, 500);
        });
        
        setTimeout(() => {
            enableInput(function(val) {
              const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
              if (!num || num < 10) {
                addBotMessage("That number seems low. Please enter a valid number (e.g. 500).");
                stepFour_Size(); 
              } else {
                state.size = num;
                stepFive_Location();
              }
            });
        }, 1700);

      } else {
        addBotMessage("Approximate size in " + unitLabel + "?");
        askSizeManual();
      }

    } else {
      stepFive_Location();
    }

    function askSizeManual() {
        enableInput(function(val) {
          const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
          if (!num || num < 10) {
            addBotMessage("That number seems low. Please enter a valid number (e.g. 500).");
            askSizeManual();
          } else {
            state.size = num;
            stepFive_Location();
          }
        });
    }
  }

  function stepFive_Location() {
    updateProgress(50);
    addBotMessage("Which borough/area is this in?");
    const locs = Object.keys(BOROUGH_MODS);
    addChoices(locs, function(loc) {
      state.borough = (typeof loc === "string") ? loc : loc.label;
      stepFive_AvailabilityCheck();
    });
  }

  function stepFive_AvailabilityCheck() {
      // REAL-TIME Logic
      const today = new Date().getDay();
      const isWeekend = (today === 6 || today === 0);
      
      addBotMessage(`Checking crew schedules for ${state.borough}...`);
      
      setTimeout(() => {
          if(isWeekend) {
             addBotMessage(`🗓️ We have openings starting early next week.`);
          } else {
             addBotMessage(`🗓️ Yes! We have a few slots open for this week.`); 
          }
          setTimeout(stepSix_PricingMode, 1000);
      }, 2000);
  }

  function stepSix_PricingMode() {
    updateProgress(60);
    addBotMessage("How should we price this?");
    addChoices([
      { label: "Full Project (Labor + Materials)", key: "full" },
      { label: "Labor Only", key: "labor" },
      { label: "Materials + Light Help", key: "materials" }
    ], function(choice) {
      state.pricingMode = choice.key || "full";
      stepSeven_Rush();
    });
  }

  function stepSeven_Rush() {
    updateProgress(65);
    addBotMessage("Is this a rush project (starting within 72 hours)?");
    addChoices(["Yes, rush", "No"], function(ans) {
      state.isRush = !!(ans && ans.indexOf("Yes") !== -1);
      stepEight_Promo();
    });
  }

  function stepEight_Promo() {
    updateProgress(70);
    addBotMessage("Any promo code today?");
    addChoices([
      { label: "No Code", code: "" },
      { label: "VIP10 (10% OFF)", code: "VIP10" },
      { label: "REFERRAL5 (5% OFF)", code: "REFERRAL5" }
    ], function(choice) {
        if (choice.code === "") {
            addBotMessage("Wait! I've applied the **'WEB-SAVER'** discount (-5%) for you automatically. 🎉");
            state.promoCode = "WEBSAVER"; 
            stepNine_DebrisRemoval();
        } else {
            state.promoCode = choice.code;
            stepNine_DebrisRemoval();
        }
    });
  }

  function stepNine_DebrisRemoval() {
    updateProgress(75);
    const svc = SERVICES[state.serviceKey];
    const hasPrice = svc && svc.unit !== "consult" && state.serviceKey !== "other";

    if (hasPrice) {
        addBotMessage("Should we include debris removal & dumpster costs? (Typically +$1,200–$2,800)");
        addChoices(["Yes, include debris", "No, I'll handle debris"], function(ans) {
            state.debrisRemoval = !!(ans && ans.indexOf("Yes") !== -1);
            stepTen_SmartAddonsIntro();
        });
    } else {
        state.debrisRemoval = false;
        stepTen_SmartAddonsIntro();
    }
  }

  function stepTen_SmartAddonsIntro() {
    updateProgress(80);
    const config = SMART_ADDONS_CONFIG[state.serviceKey];
    
    if (config && config.groups) {
      addBotMessage(`I found optional **Smart Add-ons** for ${config.title}. Want to see upgrades?`);
      addChoices([
        { label: "✨ View Add-ons", key: "yes" },
        { label: "Skip", key: "no" }
      ], function(choice) {
        if (choice.key === "yes") {
          showAddonCategories(config);
        } else {
          finishCalculation();
        }
      });
    } else {
      finishCalculation();
    }
  }

  function showAddonCategories(config) {
    const groups = Object.keys(config.groups).map(key => ({
      label: `📂 ${SMART_ADDON_GROUP_LABELS[key] || key}`,
      key: key
    }));
    groups.push({ label: "✅ Done Selecting", key: "done" });

    addBotMessage("Select a category:", false);
    addChoices(groups, function(choice) {
      if (choice.key === "done") {
        finishCalculation();
      } else {
        showAddonItems(config, choice.key);
      }
    });
  }

  function showAddonItems(config, groupKey) {
    const items = config.groups[groupKey] || [];
    const groupLabel = SMART_ADDON_GROUP_LABELS[groupKey] || groupKey;

    const availableItems = items.filter(item => 
      !state.selectedAddons.some(sel => sel.label === item.label)
    ).map(item => ({
      label: `${item.label} (+$${item.low})`,
      itemData: item,
      group: groupKey
    }));

    if (availableItems.length === 0) {
      addBotMessage(`You've added all items from ${groupLabel}.`);
      showAddonCategories(config);
      return;
    }

    availableItems.push({ label: "🔙 Back", isBack: true });

    addBotMessage(`**${groupLabel}:** Tap to add.`);
    addChoices(availableItems, function(choice) {
      if (choice.isBack) {
        showAddonCategories(config);
      } else {
        state.selectedAddons.push({
          ...choice.itemData,
          group: choice.group
        });
        addBotMessage(`✅ Added: **${choice.itemData.label}**`);
        setTimeout(() => showAddonCategories(config), 600);
      }
    });
  }

  function finishCalculation() {
    const est = computeEstimateForCurrent();
    est.svcKey = state.serviceKey;
    state.projects.push(est);
    saveState();
    trackEvent("estimate_generated", { total: est.high });
    showEstimateAndAskAnother(est);
  }

  // --- CALCULATION ENGINE ---

  function calculateMonthlyPayment(totalHigh) {
    const p = totalHigh;
    const r = FINANCING_RATE;
    const n = FINANCING_MONTHS;
    const monthly = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(monthly);
  }

  function applyPriceModifiers(low, high) {
    let factor = 1;
    if (state.pricingMode === "labor") factor = 0.7;
    else if (state.pricingMode === "materials") factor = 0.5;

    low *= factor;
    high *= factor;

    if (state.isRush) {
      low *= 1.12;
      high *= 1.18;
    }

    // Capture Pre-Discount Price
    const preDiscountLow = low;
    const preDiscountHigh = high;

    let dc = 0;
    if (state.promoCode) {
      const rate = DISCOUNTS[state.promoCode.toUpperCase()];
      if (rate) dc = rate;
    }
    if (dc > 0) {
      low *= (1 - dc);
      high *= (1 - dc);
    }

    return { low, high, discountRate: dc, preDiscountLow, preDiscountHigh };
  }

  function computeEstimateForCurrent() {
    const svc = SERVICES[state.serviceKey];
    if (!svc) return null;

    const sub = state.subOption || {};
    const mod = BOROUGH_MODS[state.borough] || 1.0;
    let low = 0, high = 0;

    // 1. Base Price
    if (state.serviceKey === "other" || svc.unit === "consult") {
      // Consult
    } else if (svc.unit === "fixed") {
      if (sub.isPerSqFt) {
          low = (sub.fixedLow || 0) * state.size * mod;
          high = (sub.fixedHigh || 0) * state.size * mod;
      } else {
          low = (sub.fixedLow || 0) * mod;
          high = (sub.fixedHigh || 0) * mod;
      }
    } else {
      let rateLow = svc.baseLow;
      let rateHigh = svc.baseHigh;
      if (sub.factor) { rateLow *= sub.factor; rateHigh *= sub.factor; }
      low = rateLow * state.size * mod;
      high = rateHigh * state.size * mod;
      if (svc.min && low < svc.min) low = svc.min;
      if (svc.min && high < svc.min * 1.2) high = svc.min * 1.25;
    }

    // Lead Paint Surcharge
    if (state.isLeadHome) { 
        low *= 1.10; 
        high *= 1.10; 
    }

    const adjusted = applyPriceModifiers(low, high);
    
    // 2. Add-ons
    let addonLow = 0, addonHigh = 0;
    state.selectedAddons.forEach(addon => {
        addonLow += (addon.low * mod);
        addonHigh += (addon.high * mod);
    });

    // 3. Debris
    if (state.debrisRemoval) {
        addonLow += (ADD_ON_PRICES.debrisRemoval.low * mod);
        addonHigh += (ADD_ON_PRICES.debrisRemoval.high * mod);
    }

    const finalLow = adjusted.low + addonLow;
    const finalHigh = adjusted.high + addonHigh;

    // Calc Savings
    const savings = Math.round((adjusted.preDiscountHigh + addonHigh) - finalHigh);

    // Duration Estimate (Rough Heuristic: $3k per day)
    let days = Math.max(1, Math.round(finalHigh / 3000));
    let durationStr = `${days}–${days + 2} days`;

    return {
      svc, sub, borough: state.borough,
      size: (svc.unit === "fixed" && !sub.isPerSqFt || svc.unit === "consult") ? null : state.size,
      isLeadHome: state.isLeadHome, pricingMode: state.pricingMode, isRush: state.isRush,
      promoCode: state.promoCode, 
      low: finalLow, high: finalHigh,
      discountRate: adjusted.discountRate, 
      savings: savings,
      duration: durationStr,
      isCustom: (low === 0 && high === 0),
      debrisRemoval: state.debrisRemoval,
      selectedAddons: [...state.selectedAddons] 
    };
  }

  function computeGrandTotal() {
    let totalLow = 0, totalHigh = 0;
    state.projects.forEach(p => {
        if (p.low) totalLow += p.low;
        if (p.high) totalHigh += p.high;
    });
    return { totalLow, totalHigh, projectRequiresDebris: state.projects.some(p => p.debrisRemoval) };
  }

  function buildEstimateHtml(est) {
    const svc = est.svc;
    const sub = est.sub || {};
    const hasPrice = !!(est.low && est.high);
    const fLow = hasPrice ? Math.round(est.low).toLocaleString() : null;
    const fHigh = hasPrice ? Math.round(est.high).toLocaleString() : null;

    let discountLine = "";
    if (est.discountRate > 0) {
      discountLine = `<div class="hb-receipt-row"><span>Promo (${state.promoCode}):</span><span>-${Math.round(est.discountRate * 100)}% (Saved ~$${est.savings})</span></div>`;
    }

    let leadLine = est.isLeadHome ? `<div class="hb-receipt-row" style="color:#f90;"><span>Lead Safety:</span><span>EPA RRP Protocols Active</span></div>` : "";
    let debrisLine = est.debrisRemoval ? `<div class="hb-receipt-row" style="color:#0a9"><span>Debris:</span><span>Haul-away **included**</span></div>` : "";

    let sizeRow = "";
    if (est.size) {
      const unitLabel = sub.isPerSqFt ? "sq ft" : svc.unit;
      sizeRow = `<div class="hb-receipt-row"><span>Size:</span><span>${est.size} ${unitLabel}</span></div>`;
    }

    let addonsHtml = "";
    if (est.selectedAddons && est.selectedAddons.length > 0) {
        addonsHtml += `<div class="hb-receipt-row" style="margin-top:8px; border-bottom:1px solid #eee; padding-bottom:4px; font-weight:600;"><span>Selected Add-ons:</span></div>`;
        est.selectedAddons.forEach(addon => {
             addonsHtml += `<div class="hb-receipt-row" style="color:#666; padding-left:8px; font-size:11px;"><span>• ${addon.label}</span><span>+$${Math.round(addon.low).toLocaleString()}</span></div>`;
        });
    }

    let priceRow = hasPrice 
      ? `<div class="hb-receipt-total"><span>ESTIMATE:</span><span>$${fLow} – $${fHigh}</span></div>`
      : `<div class="hb-receipt-total"><span>ESTIMATE:</span><span>Requires on-site walkthrough</span></div>`;

    return `
      <div class="hb-receipt">
        <h4>Estimator Summary <small style="float:right;font-weight:400;opacity:0.7">ID: ${state.estimateId}</small></h4>
        <div class="hb-receipt-row"><span>Service:</span><span>${svc.label}</span></div>
        <div class="hb-receipt-row"><span>Type:</span><span>${sub.label || "Standard"}</span></div>
        ${sizeRow}
        ${leadLine}
        ${debrisLine}
        ${addonsHtml}
        ${discountLine}
        <div class="hb-receipt-row" style="margin-top:5px;font-size:11px;"><span>Est. Duration:</span><span>${est.duration} (approx)</span></div>
        ${priceRow}
        <div class="hb-receipt-footer hb-disclaimer">
          <strong>Valid for 30 days.</strong> Subject to site inspection.
        </div>
      </div>
    `;
  }

  function editCurrentProject(projectIndex) {
      if (projectIndex >= 0 && projectIndex < state.projects.length) {
          const p = state.projects[projectIndex];
          state.serviceKey = p.svcKey; 
          // Restore other state vars...
          state.projects.splice(projectIndex, 1);
          addBotMessage(`✏️ Editing **${p.svc.label}**. Starting from step 2.`);
          stepTwo_SubQuestions();
      }
  }

  function removeLastProject() {
      if(state.projects.length > 0) {
          const removed = state.projects.pop();
          addBotMessage(`🗑️ Removed **${removed.svc.label}**.`);
          if (state.projects.length === 0) {
              addBotMessage("Your cart is empty. What would you like to estimate?");
              presentServiceOptions();
          } else {
             // Show previous project
             showEstimateAndAskAnother(state.projects[state.projects.length-1]); 
          }
      }
  }

  function showEstimateAndAskAnother(est) {
    if (!est) return;
    updateProgress(92);
    const html = '--- **Project Estimate** ---<br>' + buildEstimateHtml(est);
    addBotMessage(html, true);
    
    setTimeout(() => {
        const currentProjectIndex = state.projects.length - 1;
        const choices = [
            { label: "➕ Add Another Project", key: "add" },
            { label: "✏️ Edit This Project", key: "edit", index: currentProjectIndex },
            { label: "↩️ Undo/Remove Last", key: "undo" },
            { label: "✅ Continue to Finish", key: "finish" }
        ];

        addChoices(choices, function(choice) {
            if (choice.key === "add") {
                resetProjectState();
                addBotMessage("Great! What type of project is the next one?");
                presentServiceOptions();
            } else if (choice.key === "edit") {
                editCurrentProject(choice.index);
            } else if (choice.key === "undo") {
                removeLastProject();
            } else {
                stepMembershipUpsell();
            }
        });
    }, 1200);
  }

  function stepMembershipUpsell() {
    addBotMessage("Before we finish, would you like to hear about **VIP Home Care Memberships** (15% off labor + priority booking)?");
    addChoices([
        { label: "💳 Tell me about memberships", key: "yes" },
        { label: "No thanks", key: "no" }
    ], function(choice) {
        if (choice.key === "yes") {
            addBotMessage("🏆 **VIP Members** get 15% off all labor, priority emergency booking, and annual maintenance checks. We'll include the brochure.");
            state.interestedInMembership = true;
        }
        preReceiptGate(); // GATE THE PRICE HERE
    });
  }

  // --- LEAD CAPTURE GATE (NEW) ---
  function preReceiptGate() {
      if (state.name && state.phone) {
          showCombinedReceipt();
      } else {
          showLeadCapture();
      }
  }

  function showLeadCapture(introText) {
    addBotMessage(introText || "Your official estimate is ready! To unlock the detailed breakdown and financing options, please enter your name.");
    enableInput(function(name) {
      state.name = name;
      askPhone();
    });

    function askPhone() {
        addBotMessage("And your mobile number? (We will text you the PDF link).");
        enableInput(function(phone) {
            // STRICT MASKING
            const cleanPhone = phone.replace(/\D/g, "");
            if (cleanPhone.length !== 10) {
                addBotMessage("⚠️ Please enter a valid 10-digit mobile number.");
                setTimeout(askPhone, 500); 
            } else {
                // Format: (123) 456-7890
                state.phone = cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
                saveState();
                askExtraQuestions();
            }
        });
    }
  }

  function askExtraQuestions() {
      addBotMessage("Almost done! When are you hoping to start?");
      addChoices(["ASAP / Rush", "Within 1 month", "1-3 Months", "Just budgeting"], function(timing) {
          state.projectTiming = (typeof timing === 'object') ? timing.label : timing;
          
          addBotMessage("And how did you hear about us?");
          addChoices(["Google Search", "Instagram/Facebook", "Referral", "Yard Sign"], function(source) {
              state.leadSource = (typeof source === 'object') ? source.label : source;
              showCombinedReceipt(); // NOW SHOW PRICE
          });
      });
  }

  function showCombinedReceipt() {
    updateProgress(96);
    const projects = state.projects;
    if (!projects || !projects.length) return;

    const totals = computeGrandTotal();
    const rowsHtml = projects.map((p, idx) => {
        const hasPrice = !!(p.low && p.high);
        const unitLabel = p.sub.isPerSqFt ? "sq ft" : p.svc.unit;
        const sizePart = p.size ? ` — ${p.size} ${unitLabel}` : "";
        
        let addonNote = "";
        if (p.selectedAddons && p.selectedAddons.length > 0) {
            addonNote = `<br><span style="font-size:10px; color:#888; margin-left:14px;">+ ${p.selectedAddons.length} upgrades selected</span>`;
        }

        return `<div class="hb-receipt-row">
            <span>#${idx + 1} ${p.svc.label}${sizePart}${addonNote}</span>
            <span>${hasPrice ? "$" + Math.round(p.low).toLocaleString() + " – $" + Math.round(p.high).toLocaleString() : "Walkthrough needed"}</span>
          </div>`;
    }).join("");

    let debrisRow = "";
    if (totals.projectRequiresDebris) {
        debrisRow = `<div class="hb-receipt-row" style="color:#0a9; font-weight:700;"><span>Debris Removal:</span><span>Included in estimates</span></div>`;
    }

    let totalRow = (totals.totalLow && totals.totalHigh) 
      ? `<div class="hb-receipt-total"><span>Combined Total Range:</span><span>$${Math.round(totals.totalLow).toLocaleString()} – $${Math.round(totals.totalHigh).toLocaleString()}</span></div>`
      : "";

    // Financing Line
    const monthlyPayment = calculateMonthlyPayment(totals.totalHigh);
    const financingHtml = `<div class="hb-receipt-row" style="margin-top:8px; color:#2ecc71; font-weight:bold; border-top:1px dashed #444; padding-top:5px;">
        <span>Financing Available:</span><span>As low as $${monthlyPayment}/mo</span>
    </div>`;

    let leadScoreHtml = "";
    if (totals.totalHigh > 25000) {
        leadScoreHtml = `<div class="hb-receipt-footer" style="color:#e7bf63; font-weight:bold;">🌟 VIP Project Tier</div>`;
    }

    const html = `
      <div class="hb-receipt">
        <h4>Combined Estimate Summary <small style="float:right">ID: ${state.estimateId}</small></h4>
        ${rowsHtml}
        ${debrisRow}
        ${totalRow}
        ${financingHtml}
        ${leadScoreHtml}
        <div class="hb-receipt-footer">Valid for 30 days. Ask about VIP Home Care memberships.</div>
      </div>`;

    addBotMessage('--- **Official Estimate** ---<br>' + html, true);
    setTimeout(() => generateFinalLinks(), 1500);
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
    state.debrisRemoval = false;
    state.selectedAddons = []; 
    state.interestedInMembership = false;
  }
  
  // --- LINKS & FINALIZATION ----------------------------------

  function getLeadScore(totalHigh) {
    if (totalHigh > 25000) return "VIP / High-Value";
    if (totalHigh < 5000) return "Small / Quick";
    return "Standard";
  }

  function generateFinalLinks() {
    updateProgress(100);

    let lines = [`Estimate Ref: ${state.estimateId}`, `Name: ${state.name}`];
    
    if (state.isPhotoSkip) {
        lines.push("User opted to SKIP ESTIMATE and send photos directly.");
    }

    if (state.projects && state.projects.length) {
      state.projects.forEach((p, idx) => {
        let line = `${idx + 1}. ${p.svc.label}` + (p.borough ? ` (${p.borough})` : "");
        if (p.low && p.high) {
          line += ` — ~$${Math.round(p.low).toLocaleString()}–$${Math.round(p.high).toLocaleString()}`;
        }
        lines.push(line);
      });

      const totals = computeGrandTotal();
      let leadTier = getLeadScore(totals.totalHigh);

      if (totals.totalLow) {
          lines.push(`\nCOMBINED RANGE: $${Math.round(totals.totalLow).toLocaleString()} – $${Math.round(totals.totalHigh).toLocaleString()}`);
          lines.push(`Lead Tier: ${leadTier}`);
      }
    }

    lines.push(`Phone: ${state.phone}`);
    lines.push(`Timing: ${state.projectTiming}`); 
    lines.push(`Source: ${state.leadSource}`);  
    if (state.interestedInMembership) lines.push("** Interested in VIP Membership **");
    if (state.lang === "es") lines.push("** LANGUAGE: SPANISH PREF **");

    sendLeadToWebhook(lines.join("\n"), state);

    const body = encodeURIComponent(lines.join("\n"));
    const smsLink = "sms:" + PHONE_NUMBER + "?&body=" + body;
    const emailLink = "mailto:hammerbrickhome@gmail.com?subject=" + encodeURIComponent("Estimate Request " + state.estimateId) + "&body=" + body;

    // Photo Warning Logic
    if (state.isPhotoSkip || (els.photoInput && els.photoInput.files.length)) {
        addBotMessage("⚠️ **IMPORTANT:** Because of phone security settings, your photos won't attach automatically.", false);
        addBotMessage("Please **manually attach your photos** after your text or email app opens.", false);
    }

    addBotMessage(`Thanks, ${state.name}! Choose how you’d like to contact us.`, false);
    
    setTimeout(function() {
      const createBtn = (text, href, isPrimary, isCall) => {
          const btn = document.createElement("a");
          btn.className = isPrimary ? "hb-chip hb-primary-btn" : "hb-chip";
          btn.style.display = "block";
          btn.style.textAlign = "center";
          btn.style.textDecoration = "none";
          btn.style.marginTop = "8px";
          btn.textContent = text;
          btn.href = href;
          if(!isCall && !href.startsWith("sms:") && !href.startsWith("mailto:")) btn.target = "_blank";
          els.body.appendChild(btn);
      };

      createBtn("📲 Text Estimate to Hammer Brick & Home", smsLink, true, false);
      createBtn("✉️ Email Estimate to Hammer Brick & Home", emailLink, true, false);
      createBtn("📞 Call Hammer Brick & Home", "tel:" + PHONE_NUMBER, false, true);
      
      const copyBtn = document.createElement("button");
      copyBtn.className = "hb-chip";
      copyBtn.style.display = "block";
      copyBtn.style.marginTop = "8px";
      copyBtn.textContent = "📋 Copy Estimate to Clipboard";
      copyBtn.onclick = function() {
          if (navigator.clipboard) {
              navigator.clipboard.writeText(lines.join("\n")).then(() => {
                  copyBtn.textContent = "✅ Copied!";
                  setTimeout(() => copyBtn.textContent = "📋 Copy Estimate to Clipboard", 2000);
              });
          } else {
             alert("Clipboard access not available in this context (try HTTPS).");
          }
      };
      els.body.appendChild(copyBtn);

      if (CRM_FORM_URL) createBtn("📝 Complete Full Intake Form", CRM_FORM_URL, false, false);
      if (WALKTHROUGH_URL) createBtn("📅 Book a Walkthrough", WALKTHROUGH_URL, false, false);

      const resetBtn = document.createElement("button");
      resetBtn.className = "hb-chip";
      resetBtn.style.display = "block";
      resetBtn.style.marginTop = "20px";
      resetBtn.style.background = "#333"; 
      resetBtn.textContent = "🔁 Start Over";
      resetBtn.onclick = function() {
          localStorage.removeItem("hb_estimator_state");
          location.reload(); 
      };
      els.body.appendChild(resetBtn);

      els.body.scrollTop = els.body.scrollHeight;
    }, 500);
  }

  function sendLeadToWebhook(fullText, stateData) {
      if (!WEBHOOK_URL) return;
      const totals = computeGrandTotal();
      const payload = {
          botVersion: BOT_VERSION,
          estimateId: stateData.estimateId,
          name: stateData.name,
          phone: stateData.phone,
          language: stateData.lang,
          timing: stateData.projectTiming,
          source: stateData.leadSource,
          leadTier: getLeadScore(totals.totalHigh),
          totalLow: Math.round(totals.totalLow),
          totalHigh: Math.round(totals.totalHigh),
          projects: stateData.projects.map(p => ({
              service: p.svc.label,
              subType: p.sub?.label || "Standard",
              borough: p.borough,
              size: p.size,
              low: Math.round(p.low),
              high: Math.round(p.high),
              isLeadHome: p.isLeadHome,
              addons: (p.selectedAddons || []).map(a => a.label)
          })),
          timestamp: new Date().toISOString()
      };

      fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
      }).catch(e => console.error("Webhook failed", e));
  }

  function enableInput(callback) {
    els.input.disabled = false;
    els.input.placeholder = "Type your answer...";
    els.input.focus();
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

  document.addEventListener("DOMContentLoaded", init);

})();
