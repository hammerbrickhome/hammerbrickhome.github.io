/* ============================================================
   HB ULTRA ESTIMATOR BOT v6.0 - FULL IMPLEMENTATION
   Conversational Memory, Deep Logic, Confidence Score, Urgency, Modular
=============================================================== */

(function() {
  // ==========================================================
  // I. CONFIGURATION & DATA (Feature 20: Modularization)
  // ==========================================================

  // --- External Settings ---
  const COMPANY_NAME = "Hammer Brick & Home";
  const CONTACT_PHONE = "19295955300"; // 1-929-595-5300
  const CONTACT_EMAIL = "info@hammerbrickhome.com";
  const CRM_FORM_URL = "";      // Optional: Link to a full form (e.g., Salesforce/Hubspot)
  const WALKTHROUGH_URL = "";   // Optional: Link to a scheduling app (e.g., Calendly)

  // --- Pricing Modifiers ---
  const BOROUGH_MODS = {
    "Manhattan": { factor: 1.18, complexity: 1.2, label: "+18% High Congestion" },
    "Brooklyn": { factor: 1.08, complexity: 1.0, label: "+8% Standard" },
    "Queens": { factor: 1.05, complexity: 1.1, label: "+5% Complexity Factor" },
    "Bronx": { factor: 1.03, complexity: 0.9, label: "+3% Multi-Family Discount" },
    "Staten Island": { factor: 1.0, complexity: 0.95, label: "Base Rate" },
    "New Jersey": { factor: 0.96, complexity: 0.9, label: "-4% Lower Tax/Labor" }
  };

  const DISCOUNTS = {
    "VIP10": 0.10,       // 10% off
    "REFERRAL5": 0.05,    // 5% off
    "SPRINGCLEAN": 0.08   // 8% off
  };

  const ROI_DATA = {
    "kitchen": "Typical ROI on a mid-range Kitchen remodel in NYC is **65-78%**.",
    "bathroom": "Typical ROI on a Bathroom remodel in NYC is **57-73%**."
  };

  const LEAD_MAGNETS = [
    { label: "NYC Home Maintenance Checklist", key: "checklist" },
    { label: "Masonry Care Guide", key: "masonry_guide" }
  ];

  // --- Pricing Logic / Services (Feature 15: Deep Logic) ---
  const SERVICES = {
    "masonry": {
      label: "Masonry & Concrete", emoji: "🧱", unit: "sq ft", baseLow: 16, baseHigh: 28, min: 2500,
      subQuestion: "What type of finish?",
      options: [
        { label: "Standard Concrete ($)", factor: 1.0 },
        { label: "Pavers/Stone ($$)", factor: 1.6, deepQuestion: "What pattern/border is desired?" },
        { label: "Poured Concrete (Reinforced)", factor: 1.8, deepQuestion: "What thickness/slope is required?" }
      ]
    },
    "painting": {
      label: "Painting", emoji: "🎨", unit: "sq ft", baseLow: 1.8, baseHigh: 3.8, min: 1800,
      subQuestion: "Scope and Finish?", leadSensitive: true,
      options: [
        { label: "Standard Flat/Matte", factor: 1.0 },
        { label: "High-Gloss/Sheen", factor: 1.3, deepQuestion: "Any major drywall/plaster repairs needed?" },
        { label: "Exterior Staining/Sealing", factor: 1.6 }
      ]
    },
    "deck": {
      label: "Deck / Porch Build", emoji: "🪵", unit: "sq ft", baseLow: 35, baseHigh: 65, min: 5000,
      subQuestion: "Deck material?",
      options: [
        { label: "Pressure Treated", factor: 1.0, deepQuestion: "Do you need staining/sealing?" },
        { label: "Composite (Trex, etc.)", factor: 1.9 },
        { label: "Ipe/Hardwood", factor: 2.4 }
      ]
    },
    "kitchen": {
      label: "Kitchen Remodel", emoji: "🍳", unit: "fixed",
      subQuestion: "What is the scope?",
      options: [
        { label: "Refresh (Cosmetic)", fixedLow: 18000, fixedHigh: 30000, deepQuestion: "Any plumbing or electrical changes?" },
        { label: "Full Gut / Luxury", fixedLow: 55000, fixedHigh: 110000, deepQuestion: "Will this require permits?" }
      ], leadSensitive: true
    },
    "bathroom": {
      label: "Bathroom Remodel", emoji: "🚿", unit: "fixed",
      subQuestion: "What is the scope?",
      options: [
        { label: "Update (Fixtures/Tile)", fixedLow: 14000, fixedHigh: 24000 },
        { label: "Full Gut / Redo", fixedLow: 24000, fixedHigh: 45000 }
      ], leadSensitive: true
    },
    "handyman": {
      label: "Small Repairs / Handyman", emoji: "🛠", unit: "fixed",
      subQuestion: "Estimated duration?",
      options: [
        { label: "Half-Day (4 hrs)", fixedLow: 450, fixedHigh: 850 },
        { label: "Full-Day (8 hrs)", fixedLow: 850, fixedHigh: 1500 },
        { label: "Multi-Day Project (Custom Quote)", fixedLow: 1500, fixedHigh: 4500 }
      ]
    },
    "other": { label: "Other / Custom", emoji: "📋", unit: "consult" }
  };

  // ==========================================================
  // II. STATE & MEMORY (Feature 1: Conversational Memory)
  // ==========================================================

  const INITIAL_PROJECT_STATE = {
    step: 0,
    serviceKey: null,
    subOption: null,
    deepAnswer: null,
    size: 0,
    borough: null,
    isLeadHome: false,
    pricingMode: "full",
    isRush: false,
    promoCode: "",
  };

  let state = {
    ...INITIAL_PROJECT_STATE,
    // Persistent data
    name: "",
    phone: "",
    projects: [],
    // Runtime data
    isChatOpen: false,
    currentStep: 0
  };

  let els = {}; // DOM elements cache
  let currentFlowCallback = null; // Used to manage the flow when input is enabled

  function loadState() {
    const storedProjects = sessionStorage.getItem("hb_projects");
    const storedName = sessionStorage.getItem("hb_name");
    const storedPhone = sessionStorage.getItem("hb_phone");
    const storedOpen = sessionStorage.getItem("hb_chat_active") === "true";

    if (storedProjects) {
      state.projects = JSON.parse(storedProjects);
    }
    if (storedName) {
      state.name = storedName;
    }
    if (storedPhone) {
      state.phone = storedPhone;
    }
    state.isChatOpen = storedOpen;
  }

  function saveState() {
    sessionStorage.setItem("hb_projects", JSON.stringify(state.projects));
    sessionStorage.setItem("hb_name", state.name);
    sessionStorage.setItem("hb_phone", state.phone);
  }

  function clearData(showConf) {
    sessionStorage.clear();
    localStorage.clear(); // Clear any potential persistence
    // Reset runtime state
    Object.assign(state, { ...INITIAL_PROJECT_STATE, name: "", phone: "", projects: [], isChatOpen: false, currentStep: 0 });
    if (showConf) {
      addBotMessage("✅ Your data has been cleared from this device, as per your request.", false, 0);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  }

  function resetProjectState() {
    Object.assign(state, { ...INITIAL_PROJECT_STATE, name: state.name, phone: state.phone, projects: state.projects });
  }

  // ==========================================================
  // III. UI UTILITIES
  // ==========================================================

  function createInterface() {
    loadState();
    const now = new Date();

    // FAB
    const fab = document.createElement("div");
    fab.className = "hb-chat-fab";
    fab.innerHTML = `<span class="hb-fab-icon">📷</span><span class="hb-fab-text">Get Estimate</span>`;
    fab.style.display = "flex";
    fab.onclick = toggleChat;
    document.body.appendChild(fab);

    // Chat wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "hb-chat-wrapper";
    wrapper.innerHTML = `
      <div class="hb-chat-header">
        <div class="hb-chat-title">
          <h3>${COMPANY_NAME}</h3>
          <span>AI Estimator</span>
        </div>
        <button class="hb-chat-close">×</button>
      </div>
      <div class="hb-progress-container">
        <div class="hb-progress-bar" id="hb-prog"></div>
      </div>
      <div class="hb-chat-body" id="hb-body"></div>
      <div class="hb-chat-footer">
        <input type="text" class="hb-chat-input hb-honeypot" name="hb-hp-field" style="display: none !important; opacity: 0; position: absolute;" tabindex="-1" autocomplete="off">
        <input type="text" class="hb-chat-input" id="hb-input" placeholder="Select an option above..." disabled>
        <button class="hb-chat-send" id="hb-send">➤</button>
      </div>
      <div class="hb-chat-privacy">
          <a href="#" id="hb-clear-data">| Clear My Data (Feature 14)</a>
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
      wrapper, fab,
      body: document.getElementById("hb-body"),
      input: document.getElementById("hb-input"),
      send: document.getElementById("hb-send"),
      prog: document.getElementById("hb-prog"),
      close: wrapper.querySelector(".hb-chat-close"),
      photoInput,
      honeypot: wrapper.querySelector(".hb-honeypot"), // Feature 9
      clearDataBtn: document.getElementById("hb-clear-data") // Feature 14
    };

    // Events
    els.close.onclick = toggleChat;
    els.send.onclick = handleManualInput;
    els.input.addEventListener("keypress", function(e) {
      if (e.key === "Enter") handleManualInput();
    });
    els.clearDataBtn.onclick = (e) => { e.preventDefault(); clearData(true); };

    photoInput.addEventListener("change", function() {
      if (!photoInput.files || !photoInput.files.length) return;
      // Feature 1: Bot remembers photo upload event
      addBotMessage(`📷 **(Memory)** You selected ${photoInput.files.length} photo(s). I'll remind our team to check these photos when you send the text.`);
      // Feature 4: Simple Keyword Check (Lite AI)
      for (let i = 0; i < photoInput.files.length; i++) {
        const name = photoInput.files[i].name.toLowerCase();
        if (name.includes('crack') || name.includes('damage')) {
          addBotMessage("⚠️ **(Lite AI)** File name included 'crack' or 'damage.' I've flagged this for specialized repair questions later.", false, 500);
        }
      }
    });

    // Run startup
    if (state.isChatOpen) {
      toggleChat(true); // Open the chat if it was open last session
    }
    startConversation();
  }

  function toggleChat(forceOpen = false) {
    const isOpen = els.wrapper.classList.toggle("hb-open", forceOpen);
    if (isOpen) {
      els.fab.style.display = "none";
      sessionStorage.setItem("hb_chat_active", "true");
    } else {
      els.fab.style.display = "flex";
      sessionStorage.removeItem("hb_chat_active");
    }
  }

  function updateProgress(step) {
    // Feature 6: Better progress calculation based on flow length (9 steps max)
    const totalSteps = 9;
    const pct = Math.min(100, Math.round((step / totalSteps) * 100));
    state.currentStep = step;
    if (els.prog) els.prog.style.width = pct + "%";

    const msg = pct < 100 ? `${pct}% Complete...` : "Almost done — one more step!";
    // Update the progress label/title if implemented in CSS
  }

  // --- Messaging & Input ---

  function addBotMessage(text, isHtml = false, delay = 800) {
    const typingId = "typing-" + Date.now();
    const typingDiv = document.createElement("div");
    typingDiv.className = "hb-msg hb-msg-bot";
    typingDiv.id = typingId;
    typingDiv.innerHTML = `
      <div class="hb-typing-dots">
        <div class="hb-dot"></div><div class="hb-dot"></div><div class="hb-dot"></div>
      </div>`;
    els.body.appendChild(typingDiv);
    els.body.scrollTop = els.body.scrollHeight;

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
    }, Math.min(1500, text.length * 15 + delay));
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
    }, 1200);
  }

  function enableInput(callback, placeholder = "Type your answer...", disableSend = false) {
    els.input.disabled = false;
    els.input.placeholder = placeholder;
    els.input.focus();
    els.send.style.pointerEvents = disableSend ? 'none' : 'auto';
    els.send.style.opacity = disableSend ? 0.5 : 1;

    // Set the current callback for manual input handling
    currentFlowCallback = function(val) {
      if (els.honeypot.value.length > 0) { // Feature 9: Spam-Block Check
        addBotMessage("⛔ Bot detection triggered. Please refresh and try again without filling the hidden field.");
        return;
      }
      
      addUserMessage(val);
      els.input.value = "";
      els.input.disabled = true;
      els.input.placeholder = "Please wait...";
      currentFlowCallback = null;
      callback(val);
    };
  }

  function handleManualInput() {
    if (!els.input.disabled && currentFlowCallback) {
      const val = els.input.value.trim();
      if (!val) return;
      currentFlowCallback(val);
    }
  }

  // ==========================================================
  // IV. FLOW LOGIC
  // ==========================================================

  function startConversation() {
    addBotMessage(`👋 Hi! Welcome to the ${COMPANY_NAME} AI Estimator. I can generate a ballpark estimate in under 60 seconds.`);

    // Feature 11: Urgency Simulation (after 9 PM)
    const hour = new Date().getHours();
    if (hour >= 21 || hour < 6) {
      addBotMessage("🚨 We're past normal business hours. We only have **2 openings left** for tomorrow morning — want priority slotting? (Feature 11)", false, 800);
    }

    setTimeout(() => {
      addBotMessage("What type of project are you planning?");
      presentServiceOptions();
    }, 1500);
  }

  function presentServiceOptions() {
    updateProgress(1);
    const opts = Object.keys(SERVICES).map(k => ({
      label: SERVICES[k].emoji + " " + SERVICES[k].label, key: k
    }));

    // Feature 18: Human Mode Switch
    opts.push({ label: "📞 Talk to a Human (Feature 18)", key: "human" });

    addChoices(opts, function(selection) {
      if (selection.key === "human") {
        showHumanMode();
        return;
      }
      state.serviceKey = selection.key;
      stepTwo_SubQuestions();
    });
  }

  function showHumanMode() {
    addBotMessage("You got it. Switching to Human Mode. Please use these links to connect directly with our team:", false, 500);
    generateFinalLinks(true); // Generate immediate links
  }


  function stepTwo_SubQuestions() {
    updateProgress(2);
    const svc = SERVICES[state.serviceKey];

    if (svc.subQuestion && svc.options) {
      addBotMessage(svc.subQuestion);
      addChoices(svc.options, function(choice) {
        state.subOption = choice;
        stepThree_DeepLogic();
      });
    } else {
      state.subOption = { factor: 1.0, label: "Standard" };
      stepFive_Size(); // Skip deep logic if no sub-options
    }
  }
  
  function stepThree_DeepLogic() {
    updateProgress(3);
    const svc = SERVICES[state.serviceKey];
    const sub = state.subOption;

    if (sub && sub.deepQuestion) {
      addBotMessage(`**(Deep Logic)** Based on selecting "${sub.label}", we need to ask: ${sub.deepQuestion}`);
      enableInput(function(ans) {
        // Feature 19: AI Rewrite Simulation (Sanitize and confirm)
        state.deepAnswer = sanitizeAndConfirmInput(ans);
        addBotMessage(`**Confirmed:** I noted your answer: "${state.deepAnswer}"`);
        stepFour_LeadCheck();
      }, "Your details here...");
    } else {
      state.deepAnswer = 'N/A';
      stepFour_LeadCheck();
    }
  }


  function stepFour_LeadCheck() {
    updateProgress(4);
    const svc = SERVICES[state.serviceKey];
    if (svc && svc.leadSensitive) {
      addBotMessage("⚠️ **(Safety Check)** Is your property built before 1978? (Required for lead safety laws).");
      addChoices(["Yes (Pre-1978)", "No / Not Sure"], function(ans) {
        state.isLeadHome = !!(ans && ans.indexOf("Yes") !== -1);
        stepFive_Size();
      });
    } else {
      stepFive_Size();
    }
  }

  function stepFive_Size() {
    updateProgress(5);
    const svc = SERVICES[state.serviceKey];

    if (svc.unit === "fixed" || svc.unit === "consult") {
      stepSix_Location();
      return;
    }

    addBotMessage(`Approximate size in **${svc.unit}**? (Minimum project size: ${svc.min.toLocaleString()} ${svc.unit})`);

    function askSize() {
      enableInput(function(val) {
        const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
        if (!num || num < 10) {
          addBotMessage("That number seems low. Please enter a valid number (e.g. 500).");
          askSize();
        } else {
          // Feature 19: AI Rewrite Simulation (Sanitize size input)
          state.size = num;
          addBotMessage(`**Confirmed:** Project size is ${num.toLocaleString()} ${svc.unit}.`);
          stepSix_Location();
        }
      }, "e.g. 500");
    }

    askSize();
  }

  function stepSix_Location() {
    updateProgress(6);
    // Feature 1: Check Memory for Borough
    if (state.projects.length > 0 && state.projects[0].borough) {
        state.borough = state.projects[0].borough;
        addBotMessage(`**(Memory)** I see your last project was in **${state.borough}**. We'll use that for the price modifier.`, false, 0);
        stepSeven_PricingMode();
        return;
    }

    addBotMessage("Which borough/area is this in?");
    const locs = Object.keys(BOROUGH_MODS).map(k => BOROUGH_MODS[k].label);
    addChoices(Object.keys(BOROUGH_MODS), function(locKey) {
      state.borough = locKey;
      stepSeven_PricingMode();
    });
  }

  function stepSeven_PricingMode() {
    updateProgress(7);
    addBotMessage("How should we calculate the estimate?");

    const opts = [
      { label: "Full Project (Labor + Materials)", key: "full" },
      { label: "Labor Only", key: "labor" },
      { label: "Materials + Light Help", key: "materials" }
    ];

    addChoices(opts, function(choice) {
      state.pricingMode = choice.key || "full";
      stepEight_Promo();
    });
  }

  function stepEight_Promo() {
    updateProgress(8);
    addBotMessage("Do you have a promo code?");

    // Feature 7 & User Request: Display discount percentage
    const opts = Object.keys(DISCOUNTS).map(code => ({
        label: `${code} (${Math.round(DISCOUNTS[code] * 100)}% off)`, code: code
    }));
    opts.unshift({ label: "No Code", code: "" });

    // Present chips
    addChoices(opts, function(choice) {
      state.promoCode = choice.code || "";
      const est = computeEstimateForCurrent();
      showEstimateAndAskAnother(est);
    });
    
    // Enable manual input for custom codes
    enableInput(function(val) {
      state.promoCode = val.trim().toUpperCase();
      const est = computeEstimateForCurrent();
      showEstimateAndAskAnother(est);
    }, "Type custom code or 'NONE'...");
  }
  
  // ==========================================================
  // V. CALCULATION & ESTIMATE (Features 2, 16, 17)
  // ==========================================================

  function calculateConfidence() {
    let score = 0;
    let maxScore = 100;
    
    // Size/Fixed Choice (40 pts)
    if (state.serviceKey === 'other' || SERVICES[state.serviceKey].unit === 'consult') {
        return 0; // Not confident, requires walkthrough
    } else if (SERVICES[state.serviceKey].unit === 'fixed') {
        score += 40;
    } else if (state.size > 0) {
        score += 40;
    }

    // Sub-Option (25 pts)
    if (state.subOption) score += 25;

    // Borough/Location (20 pts)
    if (state.borough) score += 20;

    // Deep Answer (15 pts)
    if (state.deepAnswer && state.deepAnswer !== 'N/A') score += 15;

    return Math.min(100, score);
  }

  function computeEstimateForCurrent() {
    var svc = SERVICES[state.serviceKey];
    if (!svc) return null;

    var sub = state.subOption || {};
    var boroughMod = BOROUGH_MODS[state.borough] || { factor: 1.0, complexity: 1.0 };
    var low = 0;
    var high = 0;

    // Custom/consult jobs
    if (state.serviceKey === "other" || svc.unit === "consult") {
      return { isCustom: true, svc: svc, low: 0, high: 0, confidence: 0 };
    }

    // Calculate Base Range
    if (svc.unit === "fixed") {
      low = (sub.fixedLow || 0);
      high = (sub.fixedHigh || 0);
    } else {
      var rateLow = svc.baseLow * (sub.factor || 1.0);
      var rateHigh = svc.baseHigh * (sub.factor || 1.0);

      low = rateLow * state.size;
      high = rateHigh * state.size;
    }

    // --- APPLY MODIFIERS ---
    
    // 1. Borough Modifier
    low *= boroughMod.factor;
    high *= boroughMod.factor;

    // 2. Minimum Check
    if (svc.min && svc.unit !== 'fixed') {
        low = Math.max(low, svc.min * boroughMod.complexity);
        high = Math.max(high, svc.min * 1.25 * boroughMod.complexity);
    }

    // 3. Lead safety bump
    if (state.isLeadHome) {
      low *= 1.10;
      high *= 1.10;
    }

    // 4. Pricing Mode
    var laborFactor = 1;
    if (state.pricingMode === "labor") laborFactor = 0.75;
    if (state.pricingMode === "materials") laborFactor = 0.50;
    low *= laborFactor;
    high *= laborFactor;

    // 5. Rush surcharge
    var rushFactor = 1.0;
    if (state.isRush) {
      rushFactor = 1.15; // 15% rush fee
      low *= rushFactor;
      high *= rushFactor;
    }

    // 6. Promo discount
    var dcRate = 0;
    var dcAmountLow = 0;
    var dcAmountHigh = 0;
    if (state.promoCode && DISCOUNTS[state.promoCode.toUpperCase()]) {
      dcRate = DISCOUNTS[state.promoCode.toUpperCase()];
      dcAmountLow = low * dcRate;
      dcAmountHigh = high * dcRate;
      low -= dcAmountLow;
      high -= dcAmountHigh;
    }
    
    const confidence = calculateConfidence();

    return {
      svc: svc, sub: sub, borough: state.borough, size: state.size,
      pricingMode: state.pricingMode, isRush: state.isRush, promoCode: state.promoCode,
      low: low, high: high, confidence: confidence,
      breakdown: {
          baseLow: low / laborFactor / rushFactor + dcAmountLow, // Reverse calculation
          baseHigh: high / laborFactor / rushFactor + dcAmountHigh,
          subFactor: (sub.factor || 1.0),
          boroughAdjustment: boroughMod.factor,
          rushAdjustment: rushFactor,
          discountAmountLow: dcAmountLow,
          discountAmountHigh: dcAmountHigh,
          finalLow: low,
          finalHigh: high
      }
    };
  }
  
  function buildEstimateHtml(est) {
    if (est.isCustom) {
        return `<div class="hb-receipt hb-receipt-custom">
            <h4>${est.svc.label} Summary</h4>
            <div class="hb-receipt-total"><span>ESTIMATE:</span><span>Requires Walkthrough</span></div>
            <p class="hb-disclaimer">This project requires an on-site visit due to its complexity or custom nature. We will contact you shortly to schedule.</p>
        </div>`;
    }

    const { breakdown, svc, borough, pricingMode, isRush, promoCode, confidence } = est;
    const fLow = Math.round(breakdown.finalLow).toLocaleString();
    const fHigh = Math.round(breakdown.finalHigh).toLocaleString();
    const isFixed = svc.unit === 'fixed';
    
    // Feature 16: Real-Time Price Breakdown Animation
    let html = `<div class="hb-receipt hb-breakdown">
        <h4>Detailed Estimate Breakdown</h4>
        <div class="hb-confidence-score">
            <span>Estimate Confidence: <strong>${confidence}%</strong></span>
            <span class="hb-confidence-tip">${confidence < 75 ? 'Missing details lower the accuracy.' : 'High accuracy based on your data.'}</span>
        </div>
        <div class="hb-breakdown-lines">`;
    
    // 1. Base Cost
    html += `<div class="hb-receipt-row anim-1"><span>Base Cost (${isFixed ? 'Fixed Price Tier' : est.size.toLocaleString() + ' ' + svc.unit}):</span>
        <span>$${Math.round(breakdown.baseLow).toLocaleString()} – $${Math.round(breakdown.baseHigh).toLocaleString()}</span></div>`;

    // 2. Sub-Option Factor
    if (breakdown.subFactor !== 1.0) {
        const adjustment = breakdown.subFactor > 1.0 ? `+${Math.round((breakdown.subFactor - 1) * 100)}%` : 'Standard';
        html += `<div class="hb-receipt-row anim-2"><span>Type/Material Factor:</span>
            <span>${adjustment}</span></div>`;
    }

    // 3. Borough Adjustment
    if (borough) {
        const modInfo = BOROUGH_MODS[borough] || {};
        const adjPct = Math.round((modInfo.factor - 1) * 100);
        html += `<div class="hb-receipt-row anim-3"><span>Borough Modifier (${borough}):</span>
            <span class="${adjPct > 0 ? 'plus' : 'minus'}">${modInfo.label}</span></div>`;
    }
    
    // 4. Pricing Mode
    let modeLabel = "Full Project (L+M)";
    if (pricingMode === "labor") modeLabel = "Labor Only (-25%)";
    if (pricingMode === "materials") modeLabel = "Materials Only (-50%)";
    html += `<div class="hb-receipt-row anim-4"><span>Pricing Mode:</span><span>${modeLabel}</span></div>`;

    // 5. Rush Fee
    if (isRush) {
        const rushPct = Math.round((breakdown.rushAdjustment - 1) * 100);
        html += `<div class="hb-receipt-row anim-5"><span>Rush Priority Fee:</span><span class="plus">+${rushPct}%</span></div>`;
    }

    // 6. Discount
    if (breakdown.discountAmountLow > 0) {
        const rate = DISCOUNTS[promoCode];
        const dcPct = Math.round(rate * 100);
        html += `<div class="hb-receipt-row anim-6"><span>Promo Discount (${promoCode}):</span><span class="minus">-${dcPct}% applied</span></div>`;
    } else if (promoCode) {
        html += `<div class="hb-receipt-row anim-6" style="color:#d55"><span>Promo Code:</span><span class="minus">Pending Verification</span></div>`;
    }
    
    html += `</div>`; // Close hb-breakdown-lines

    // Final Price
    html += `<div class="hb-receipt-total anim-7"><span>BALLPARK ESTIMATE:</span>
        <span>$${fLow} – $${fHigh}</span></div>`;

    html += `<div class="hb-receipt-footer hb-disclaimer">This range is for planning purposes only. A formal estimate will follow a site visit.</div>`;
    html += `</div>`; // Close hb-receipt
    
    return html;
  }

  function showEstimateAndAskAnother(est) {
    if (!est) return;
    updateProgress(9);

    var html = buildEstimateHtml(est);
    addBotMessage(html, true);

    // Feature 17: Weather Sync (Placeholder - checks current month for exterior jobs)
    const isExteriorJob = ['masonry', 'painting', 'deck'].includes(state.serviceKey);
    const month = new Date().getMonth();
    const isWinter = month === 11 || month === 0 || month === 1; // Dec, Jan, Feb
    if (isExteriorJob && isWinter) {
        addBotMessage("🥶 **(Weather Sync)** Concrete/Exterior cure time may be extended due to winter temperatures. Should we plan a spring date?", false, 1200);
    }
    
    // Feature 12: ROI Upsell Logic
    if (ROI_DATA[state.serviceKey]) {
        addBotMessage(`📈 **(ROI Upsell)** Did you know? ${ROI_DATA[state.serviceKey]}`, false, 1200);
    }

    setTimeout(function() {
      askAddAnother(est);
    }, 1500);
  }

  function askAddAnother(est) {
    state.projects.push(est);
    saveState();
    updateProgress(9);

    addBotMessage("Would you like to add another project or grab a free guide?");
    addChoices(
      [
        { label: "➕ Add Another Project", key: "yes" },
        { label: "✅ Finish & Get Links", key: "no" },
        { label: `🎁 Free Guide: ${LEAD_MAGNETS[0].label} (Feature 13)`, key: "magnet" }
      ],
      function(choice) {
        var key = choice.key || "no";
        if (key === "yes") {
          resetProjectState();
          addBotMessage("Great! What type of project is the next one?");
          presentServiceOptions();
        } else if (key === "magnet") {
            showLeadCapture(true); // Go to lead capture for magnet
        } else {
          showCombinedReceiptAndLeadCapture();
        }
      }
    );
  }

  // ==========================================================
  // VI. LEAD CAPTURE & FINAL LINKS
  // ==========================================================

  function showCombinedReceiptAndLeadCapture() {
    updateProgress(10);
    var projects = state.projects;

    var totalLow = 0;
    var totalHigh = 0;
    var requiresWalkthrough = false;

    // Build the combined summary
    var rowsHtml = projects.map((p, idx) => {
        if (p.isCustom || p.confidence < 50) requiresWalkthrough = true;
        
        var hasPrice = !!(p.low && p.high);
        if (hasPrice) {
          totalLow += p.low;
          totalHigh += p.high;
        }

        var fLow = hasPrice ? Math.round(p.low).toLocaleString() : "Custom";
        var fHigh = hasPrice ? Math.round(p.high).toLocaleString() : "Quote";
        var sizePart = p.size ? ` — ${p.size} ${p.svc.unit}` : '';
        var areaPart = p.borough ? ` (${p.borough})` : '';

        return `<div class="hb-receipt-row">
            <span>#${idx + 1} ${p.svc.label}${sizePart}${areaPart}</span>
            <span>${hasPrice ? `$${fLow} – $${fHigh}` : 'Walkthrough needed'}</span>
        </div>`;
    }).join("");

    var totalRow = "";
    if (totalLow && totalHigh) {
      totalRow = `<div class="hb-receipt-total">
          <span>Combined Range:</span>
          <span>$${Math.round(totalLow).toLocaleString()} – $${Math.round(totalHigh).toLocaleString()}</span>
        </div>`;
    }

    var html = `<div class="hb-receipt">
        <h4>Combined Estimate Summary</h4>
        ${rowsHtml}
        ${totalRow}
        <div class="hb-receipt-footer">
          ${requiresWalkthrough ? "⚠️ At least one project requires a walkthrough for accurate pricing." : "Your estimate is complete."}
        </div>
      </div>`;

    addBotMessage(html, true);

    setTimeout(function() {
      // Feature 1: Memory Check
      const intro = state.name 
        ? `Welcome back, ${state.name}! To save/send your estimate, please confirm your phone number.`
        : `To lock in this combined estimate, I can text or email you everything we just went over.`;
      
      showLeadCapture(false, intro);
    }, 1500);
  }

  function showLeadCapture(isLeadMagnet, introText) {
    if (isLeadMagnet) {
        addBotMessage("You've selected the free guide. What is your email address so we can send it?");
        enableInput(function(email) {
            // No need to store email globally, just confirm lead magnet
            addBotMessage(`Thanks! We've sent the ${LEAD_MAGNETS[0].label} to ${email}.`, false, 800);
            setTimeout(() => {
                generateFinalLinks(false, true); // Go to final links, skipping name/phone prompt
            }, 1000);
        }, "Your email address...");
        return;
    }

    addBotMessage(introText);
    
    // Feature 1: Memory - Ask for name only if not stored
    if (!state.name) {
        addBotMessage("What is your name?");
        enableInput(function(name) {
            state.name = sanitizeAndConfirmInput(name, true);
            saveState();
            addBotMessage(`Thanks, ${state.name}! And your mobile number?`);
            askPhone();
        }, "Your full name...");
    } else {
        addBotMessage("Please confirm your mobile number, or enter a new one.");
        askPhone();
    }
  }

  function askPhone() {
    enableInput(function(phone) {
        state.phone = phone.replace(/[^0-9]/g, ""); // Sanitize phone number
        saveState();
        generateFinalLinks(false);
    }, state.phone || "Your mobile number...");
  }


  function generateFinalLinks(isHumanMode, isLeadMagnet = false) {
    if (!isLeadMagnet) updateProgress(100);

    var lines = [];
    lines.push(isHumanMode ? "URGENT CONTACT REQUEST (Human Mode Switch)" : "Estimate Request");
    lines.push(`Name: ${state.name || 'N/A'}`);
    lines.push(`Phone: ${state.phone || 'N/A'}`);
    lines.push("---");
    
    if (state.projects.length) {
        lines.push("Projects Summary:");
        state.projects.forEach((p, idx) => {
            const range = (p.low && p.high) ? `~ $${Math.round(p.low).toLocaleString()}–$${Math.round(p.high).toLocaleString()}` : 'Walkthrough needed';
            lines.push(`${idx + 1}. ${p.svc.label} (${p.borough}) - ${range}`);
        });
        lines.push("---");
    } else if (isHumanMode) {
        lines.push("User hit 'Talk to Human' without completing an estimate.");
        lines.push("---");
    } else if (isLeadMagnet) {
        lines.push(`User opted for Lead Magnet: ${LEAD_MAGNETS[0].label}`);
        lines.push("---");
    }

    var body = encodeURIComponent(lines.join("\n"));
    var smsLink = `sms:${CONTACT_PHONE}?&body=${body}`;
    var emailLink = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Estimate/Contact Request")}&body=${body}`;

    addBotMessage(
      isHumanMode 
        ? "We've placed you in our urgent queue. Call or text below to connect immediately."
        : `Thanks! Here are your options to save/send the estimate and connect with ${COMPANY_NAME}:`,
      false
    );

    setTimeout(function() {
      const chipContainer = document.createElement("div");
      chipContainer.className = "hb-chips-final";

      // 1. Text Message (Primary CTA)
      const smsBtn = document.createElement("a");
      smsBtn.className = "hb-chip-cta hb-cta-sms";
      smsBtn.textContent = isHumanMode ? `📞 Call ${CONTACT_PHONE}` : `📲 Text Estimate & Details`;
      smsBtn.href = isHumanMode ? `tel:${CONTACT_PHONE}` : smsLink;
      chipContainer.appendChild(smsBtn);
      
      // 2. Email (Secondary CTA)
      const emailBtn = document.createElement("a");
      emailBtn.className = "hb-chip-cta hb-cta-email";
      emailBtn.textContent = "✉️ Email My Details";
      emailBtn.href = emailLink;
      chipContainer.appendChild(emailBtn);
      
      // 3. Printable PDF (Feature 8)
      if (!isHumanMode && !isLeadMagnet) {
          const printBtn = document.createElement("button");
          printBtn.className = "hb-chip-cta hb-cta-print";
          printBtn.textContent = "🖨️ Printable Estimate (PDF)";
          printBtn.onclick = () => window.print(); // Triggers browser print dialog
          chipContainer.appendChild(printBtn);
      }
      
      els.body.appendChild(chipContainer);

      // Add Photo Link
      const photoBtn = document.createElement("button");
      photoBtn.className = "hb-chip";
      photoBtn.style.display = "block";
      photoBtn.style.marginTop = "12px";
      photoBtn.textContent = "📷 Add Photos to Phone/Desktop";
      photoBtn.onclick = () => { if (els.photoInput) els.photoInput.click(); };
      els.body.appendChild(photoBtn);

      els.body.scrollTop = els.body.scrollHeight;
      
      // Prevent further input
      els.input.disabled = true;
      els.input.placeholder = "Conversation complete.";
      els.send.style.display = 'none';

    }, 500);
  }

  // ==========================================================
  // VII. UTILS & SANITIZATION
  // ==========================================================

  // Feature 19: AI Rewrite Simulation
  function sanitizeAndConfirmInput(input, isName = false) {
    let sanitized = input.trim();
    if (isName) {
      sanitized = sanitized.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    } else {
      // Simple rewrite/sanitization for messy project description
      sanitized = sanitized
        .replace(/\b(i|i'm|im|my|the|a|an)\b/gi, '')
        .replace(/steps r messed up/gi, 'steps are damaged')
        .replace(/idk/gi, 'I need to find out')
        .replace(/\s\s+/g, ' ')
        .trim();
    }
    return sanitized;
  }

  // ==========================================================
  // VIII. RUNTIME
  // ==========================================================

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    createInterface();
  }

})();

