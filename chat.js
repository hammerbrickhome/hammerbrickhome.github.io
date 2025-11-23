/* ============================================================
   HAMMER BRICK & HOME — ULTRA ADVANCED ESTIMATOR BOT v5.0 (CONSOLIDATED)
   INCLUDES: Webhook Capture, Lead Scoring (Safe), State Persistence (Secure),
   Size Wizard, Input Sanitation, Dynamic Upselling, Faster UX, Master Reset
=============================================================== */

(function() {
  // --- CONFIGURATION & DATA -----------------------------------

  // IMPORTANT: REPLACE THIS URL with your silent lead capture endpoint (e.g. Zapier, Make.com, Formspree)
  const WEBHOOK_URL = "https://your-silent-lead-capture-endpoint.com/receive"; 
  
  // Logic for suggesting a secondary project after the main one is completed
  const RELATED_SERVICES = {
    "deck": ["painting", "fence"],         // After Deck, suggest Painting and Fence
    "driveway": ["masonry", "retaining"],  // After Driveway, suggest Masonry (curbing, etc.)
    "kitchen": ["flooring", "drywall"],
    "bathroom": ["flooring"]
  };

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

    // --- PAINTING ---------------------------------------------
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

    // --- BASEMENT FLOOR ---------------------------------------
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

    // --- FENCING ----------------------------------------------
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

    // --- DECK / PORCH -----------------------------------------
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

    // --- DRYWALL ----------------------------------------------
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

    // --- FLOORING ---------------------------------------------
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

    // --- POWER WASHING ----------------------------------------
    "powerwash": {
      label: "Power Washing",
      emoji: "💦",
      unit: "sq ft",
      baseLow: 0.35, baseHigh: 0.85, min: 250
    },

    // --- GUTTERS ----------------------------------------------
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

    // --- WINDOWS & DOORS --------------------------------------
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

    // --- DEMOLITION -------------------------------------------
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

    // --- RETAINING WALL ---------------------------------------
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
    // name/phone are stored in sessionStorage for security
    name: "",              
    phone: "",
    projects: [],          // list of estimate objects
    sizeStep: 0,           // 0: ask method, 1: ask length, 2: ask width, 3: direct input
    tempLength: null,      // Used for L x W calculation
    photos: []             // Array to hold Base64 photo data
  };

  let els = {};

  // --- UTILS (REVISED/NEW) -----------------------------------
  
  // 1. Input Sanitization
  function sanitizeInput(input) {
    if (!input) return "";
    // Creates a temporary element to strip HTML tags and prevent XSS, then returns text content
    const div = document.createElement('div');
    div.textContent = input;
    return div.textContent;
  }
  
  // 2. State Persistence (Save - NOW SPLIT)
  function saveState() {
    try {
      // Data saved to LocalStorage (long-term persistence for project progress)
      const stateToSave = {
        step: state.step,
        serviceKey: state.serviceKey,
        subOption: state.subOption,
        size: state.size,
        borough: state.borough,
        isLeadHome: state.isLeadHome,
        pricingMode: state.pricingMode,
        isRush: state.isRush,
        promoCode: state.promoCode,
        sizeStep: state.sizeStep,
        tempLength: state.tempLength,
        // Photos are persisted here as base64 is not sensitive
        photos: state.photos 
      };
      localStorage.setItem("hb_chat_state", JSON.stringify(stateToSave));
      localStorage.setItem("hb_chat_projects", JSON.stringify(state.projects));

      // Fix 1: Sensitive Data saved to SessionStorage (cleared on tab close)
      const sessionState = {
          name: state.name,
          phone: state.phone,
      };
      sessionStorage.setItem("hb_chat_session", JSON.stringify(sessionState));

    } catch (e) {
      console.error("Could not save state:", e);
    }
  }

  // 3. State Persistence (Load - NOW SPLIT)
  function loadState() {
    try {
      const storedState = localStorage.getItem("hb_chat_state");
      const storedProjects = localStorage.getItem("hb_chat_projects");
      // Fix 1: Load sensitive data from sessionStorage
      const storedSession = sessionStorage.getItem("hb_chat_session");

      if (storedState) {
        Object.assign(state, JSON.parse(storedState));
      }
      if (storedProjects) {
        state.projects = JSON.parse(storedProjects);
      }
      if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          state.name = sessionData.name || state.name;
          state.phone = sessionData.phone || state.phone;
      }


      // If a name/phone exists, we assume they reached the end and don't need to restart
      if (state.name && state.phone) {
        return "completed";
      }
    } catch (e) {
      console.error("Could not load state:", e);
    }
    return "fresh";
  }
  
  // Fix 6: Master Reset Function
  function resetEstimator() {
    if (confirm("Are you sure you want to reset the estimator? All progress will be lost.")) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload(); 
    }
  }

  // --- INIT (REVISED) -----------------------------------------

  function init() {
    console.log("HB Chat: Initializing v5.0...");
    createInterface();

    const loadStatus = loadState();
    
    // Resume chat if active or state suggests it's in progress
    if (sessionStorage.getItem("hb_chat_active") === "true" || (loadStatus === "fresh" && state.projects.length > 0)) {
      toggleChat(true); 
      if (loadStatus === "completed") {
        // If loaded a completed state, skip to final links
        addBotMessage("Welcome back, " + sanitizeInput(state.name) + "! Here is your estimate summary.");
        showCombinedReceiptAndLeadCapture(); 
      } else if (state.projects.length > 0) {
        // If loaded an incomplete state with projects, ask to continue
        addBotMessage("Welcome back! I see you were working on an estimate.");
        setTimeout(() => askAddAnother(state.projects[state.projects.length - 1]), 1200);
      } else {
        // Fresh start
        startConversation();
      }
    } else {
      // Fresh start but not open
      startConversation();
    }
  }

  function startConversation() {
    // Time-of-Day Logic
    const now = new Date();
    const hour = now.getHours();
    let initialGreeting = "👋 Hi! I can generate a ballpark estimate for your project instantly.";

    if (hour >= 20 || hour < 8) { // After 8 PM or before 8 AM (Night Time)
      initialGreeting = "🌙 Welcome! Our office is closed, but I can secure your estimate and mark it for **priority review** first thing in the morning.";
    } 

    addBotMessage(initialGreeting);
    setTimeout(function() {
      addBotMessage("What type of project are you planning?");
      presentServiceOptions();
    }, 800);
  }

  function createInterface() {
    // FAB
    const fab = document.createElement("div");
    fab.className = "hb-chat-fab";
    fab.innerHTML = `<span class="hb-fab-icon">📷</span><span class="hb-fab-text">Get Quote</span>`;
    fab.style.display = "flex";
    fab.onclick = () => toggleChat();
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
        <div>
            <button class="hb-chat-close" id="hb-reset" title="Reset Estimator" style="font-size: 18px; margin-right: 10px;">🔄</button>
            <button class="hb-chat-close">×</button>
        </div>
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
      close: wrapper.querySelector(".hb-chat-close:last-child"),
      reset: document.getElementById("hb-reset"), // NEW
      photoInput
    };

    // Events
    els.close.onclick = () => toggleChat(false);
    els.reset.onclick = resetEstimator; // NEW
    els.send.onclick = handleManualInput;
    els.input.addEventListener("keypress", function(e) {
      if (e.key === "Enter") handleManualInput();
    });

    // Fix 3: Image Preview and Base64 Conversion
    els.photoInput.addEventListener("change", function(e) {
      if (!e.target.files || !e.target.files.length) return;
      
      let files = Array.from(e.target.files);
      const MAX_BASE64_SIZE = 100 * 1024; // 100 KB limit for Base64
      const MAX_FILES = 5; // Limit to 5 files

      files.slice(0, MAX_FILES).forEach(file => { 
          if (!file.type.startsWith('image/')) return;
          
          if (file.size > MAX_BASE64_SIZE) {
              addBotMessage(`⚠️ Skipping file: **${file.name}**. Too large (${(file.size / 1024).toFixed(1)}KB). Please upload smaller photos or attach them later.`);
              return;
          }

          const reader = new FileReader();
          reader.onload = function(e) {
              // Store the Base64 Data URL (e.g., data:image/jpeg;base64,...)
              state.photos.push({
                  name: file.name,
                  type: file.type,
                  data: e.target.result
              });

              // UI preview injection
              const img = document.createElement('img');
              img.src = e.target.result;
              img.alt = 'Uploaded image preview';
              img.style.maxWidth = '100px';
              img.style.maxHeight = '100px';
              img.style.borderRadius = '8px';
              img.style.margin = '5px';
              img.style.display = 'inline-block';

              const userMsgDiv = document.createElement("div");
              userMsgDiv.className = "hb-msg hb-msg-user";
              userMsgDiv.appendChild(img);
              els.body.appendChild(userMsgDiv);
              els.body.scrollTop = els.body.scrollHeight;
              saveState(); // Save state after each successful Base64 conversion
          };
          reader.readAsDataURL(file);
      });
      addBotMessage(`📷 You selected ${Math.min(files.length, MAX_FILES)} photo(s) for the lead submission.`);
      // Clear file input to allow re-uploading the same file if needed
      e.target.value = null; 
    });
  }

  function toggleChat(forceOpen) {
    const shouldOpen = (typeof forceOpen === 'boolean') ? forceOpen : !els.wrapper.classList.contains("hb-open");

    if (shouldOpen) {
      els.wrapper.classList.add("hb-open");
      els.fab.style.display = "none";
      sessionStorage.setItem("hb_chat_active", "true");
    } else {
      els.wrapper.classList.remove("hb-open");
      els.fab.style.display = "flex";
      sessionStorage.removeItem("hb_chat_active");
      saveState();
    }
  }

  function updateProgress(pct) {
    if (els.prog) els.prog.style.width = pct + "%";
  }

  // --- MESSAGING (REVISED DELAY) --------------------------------
  
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

    // Fix 2: Faster, Snappier Typing Delay
    const delay = Math.min(1000, text.length * 10 + 300);

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
      saveState(); // Save state
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
        saveState(); // Save state
        stepThree_LeadCheck();
      });
    } else if (state.serviceKey === "other") {
      saveState(); // Save state
      stepFive_Location();
    } else {
      state.subOption = { factor: 1.0, label: "Standard" };
      saveState(); // Save state
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
        saveState(); // Save state
        stepFour_Size();
      });
    } else {
      saveState(); // Save state
      stepFour_Size();
    }
  }

  // --- SIZE STEP (SIZE WIZARD) -----------------------------

  function stepFour_Size() {
    updateProgress(50);
    const svc = SERVICES[state.serviceKey];
    if (!svc) return;
    state.sizeStep = 0; // Reset size step for flow control

    // Skip size step for fixed-price or consultation services
    if (svc.unit === "fixed" || svc.unit === "consult" || state.serviceKey === "other") {
      stepFive_Location();
      return;
    }

    addBotMessage("Approximate size in " + svc.unit + "?");

    // Start of Size Wizard: Ask method
    addChoices(['Enter Size', 'Help me Measure'], stepFour_Size_Help);
  }
  
  // New function to handle the L x W flow
  function stepFour_Size_Help(ans) {
    const svc = SERVICES[state.serviceKey];
    const unit = svc.unit.replace('sq ft', 'ft').replace('linear ft', 'ft'); // 'ft' is a cleaner unit for input

    // Handle initial choice from chips
    if (state.sizeStep === 0) {
        const label = (typeof ans === "object") ? ans.label : ans;
        if (label === 'Enter Size') {
            addUserMessage('Enter Size');
            state.sizeStep = 3; // Skip to direct size entry
            stepFour_Size_Help();
        } else {
            addUserMessage('Help me Measure');
            state.sizeStep = 1; // Start length/width
            addBotMessage("Got it. What is the approximate Length (in " + unit + ")?");
            enableInput(stepFour_Size_Help);
        }
        saveState();
        return;
    }

    // Handle length input
    if (state.sizeStep === 1) {
        const length = parseInt(sanitizeInput(ans).replace(/[^0-9]/g, ""), 10);
        if (!length || length < 1) {
            addBotMessage("Please enter a valid length number (e.g. 50).");
            enableInput(stepFour_Size_Help);
            return;
        }
        state.tempLength = length;
        state.sizeStep = 2;
        addBotMessage("Thanks. And what is the approximate Width (in " + unit + ")?");
        enableInput(stepFour_Size_Help);
        saveState();
        return;
    }

    // Handle width input & calculation
    if (state.sizeStep === 2) {
        const width = parseInt(sanitizeInput(ans).replace(/[^0-9]/g, ""), 10);
        if (!width || width < 1) {
            addBotMessage("Please enter a valid width number (e.g. 10).");
            enableInput(stepFour_Size_Help);
            return;
        }

        state.size = state.tempLength * width;
        addBotMessage(`Perfect! That calculates to about **${state.size.toLocaleString()} ${svc.unit}**.`);
        
        state.sizeStep = 0; // Reset
        delete state.tempLength;
        saveState(); // Save state
        stepFive_Location();
        return;
    }

    // Handle direct size entry (from the 'Enter Size' option)
    if (state.sizeStep === 3) {
        const num = parseInt(sanitizeInput(ans).replace(/[^0-9]/g, ""), 10);
        if (!num || num < 10) {
            addBotMessage("That number seems low. Please enter a valid number (e.g. 500).");
            enableInput(stepFour_Size_Help);
        } else {
            state.size = num;
            state.sizeStep = 0; // Reset
            saveState(); // Save state
            stepFive_Location();
        }
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
      saveState(); // Save state
      stepSix_PricingMode();
    });
  }

  // --- PRICING MODE -------------------------------

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
      saveState(); // Save state
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
      saveState(); // Save state
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
      saveState(); // Save state
      const est = computeEstimateForCurrent();
      showEstimateAndAskAnother(est);
    });
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
        svc: svc,
        serviceKey: state.serviceKey, // Added for upsell/scoring
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
      svc: svc,
      serviceKey: state.serviceKey, // Added for upsell/scoring
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
        '% applied</span></div>';
    }

    var rushLine = "";
    if (est.isRush) {
      rushLine =
        '<div class="hb-receipt-row"><span>Rush:</span><span>Priority scheduling included</span></div>';
    }

    var modeLabel = "Full (Labor + Materials)";
    if (est.pricingMode === "labor") modeLabel = "Labor Only";
    if (est.pricingMode === "materials") modeLabel = "Materials + Light Help";

    var sizeRow = "";
    if (est.size) {
      sizeRow =
        '<div class="hb-receipt-row"><span>Size:</span><span>' +
        est.size +
        " " +
        svc.unit +
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


  // --- LEAD SCORING (FIXED) --------------------------------------------

  function computeLeadScore() {
      let score = 0;
      const projectScoreMap = {
          "kitchen": 50, "bathroom": 40, "roofing": 30, "retaining": 25, "deck": 20
      };
      const boroughScoreMap = {
          "Manhattan": 15, "Brooklyn": 10
      };

      state.projects.forEach(p => {
          // Base score by project type (use key instead of label)
          score += projectScoreMap[p.serviceKey] || 5; 

          // Score by size (for unit-based projects)
          if (p.size) {
              if (p.size > 5000) score += 15;
              else if (p.size > 2000) score += 8;
          }

          // Fix 5: Use optional chaining for safe access to p.sub.label
          if (p.sub?.label && (
              p.sub.label.toLowerCase().includes('luxury') ||
              p.sub.label.toLowerCase().includes('full gut')
          )) {
              score += 15;
          }
      });

      // Score modifiers for rush/location
      if (state.projects.length > 1) score += 10; // Multi-project leads
      if (state.isRush) score += 10;
      score += boroughScoreMap[state.borough] || 0;

      return Math.min(100, Math.round(score));
  }

  // --- UPSALE / NEXT PROJECT FLOW --------------------------------
  
  function showEstimateAndAskAnother(est) {
    if (!est) return;
    updateProgress(90);

    var html = buildEstimateHtml(est);
    addBotMessage(html, true);

    setTimeout(function() {
      // Step 8: Check for Smart Upselling opportunity first
      stepEight_Upsell(est); 
    }, 1200);
  }
  
  // New step for Smart Upselling
  function stepEight_Upsell(est) {
      state.projects.push(est); // Save the completed project
      saveState(); // Save state

      const relatedKeys = RELATED_SERVICES[est.serviceKey];
      if (relatedKeys && relatedKeys.length) {
          // Find the first related service that hasn't been estimated yet
          const nextKey = relatedKeys.find(k => !state.projects.some(p => p.serviceKey === k));
          
          if (nextKey) {
              const nextSvc = SERVICES[nextKey];
              updateProgress(91);
              addBotMessage(`Since you're doing **${est.svc.label}**, we often recommend bundling related services for a discount.`);
              
              setTimeout(() => {
                  addBotMessage(`Would you like to add an estimate for **${nextSvc.label}** too?`);
                  addChoices([`Yes, Add ${nextSvc.emoji} ${nextSvc.label}`, "No, continue"], function(choice) {
                      const val = (typeof choice === "string") ? choice : choice.label;
                      if (val.startsWith('Yes')) {
                          resetProjectState();
                          state.serviceKey = nextKey;
                          addBotMessage(`Got it. Starting estimate for ${nextSvc.label}...`);
                          stepTwo_SubQuestions();
                      } else {
                          askAddAnother();
                      }
                  });
              }, 1000);
              return;
          }
      }
      // If no related services or already asked, move to "Add Another"
      askAddAnother();
  }


  function askAddAnother() {
    updateProgress(92);

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

    var totalLow = 0;
    var totalHigh = 0;

    var rowsHtml = projects
      .map(function(p, idx) {
        var hasPrice = !!(p.low && p.high);
        if (hasPrice) {
          totalLow += p.low;
          totalHigh += p.high;
        }

        var fLow = hasPrice ? Math.round(p.low).toLocaleString() : "Custom";
        var fHigh = hasPrice ? Math.round(p.high).toLocaleString() : "Quote";
        var sizePart = p.size ? " — " + p.size + " " + p.svc.unit : "";
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

    var totalRow = "";
    if (totalLow && totalHigh) {
      totalRow =
        '<div class="hb-receipt-total">' +
          "<span>Combined Range:</span>" +
          "<span>$" +
          Math.round(totalLow).toLocaleString() +
          " – $" +
          Math.round(totalHigh).toLocaleString() +
          "</span>" +
        "</div>";
    }

    var html =
      '<div class="hb-receipt">' +
        "<h4>Combined Estimate Summary</h4>" +
        rowsHtml +
        totalRow +
        '<div class="hb-receipt-footer">' +
          "Ask about VIP Home Care memberships & referral rewards for extra savings." +
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
    // Don't reset name/phone/photos as they apply to the entire session
    saveState();
  }

  // --- LEAD CAPTURE & LINKS (REVISED) ----------------------------------

  function showLeadCapture(introText) {
    addBotMessage(introText);
    
    // 1. Ask Name (with sanitization)
    addBotMessage("What is your name?");
    enableInput(function(name) {
      state.name = sanitizeInput(name); // Sanitize input
      saveState(); // Save state
      
      // 2. Ask Phone (with validation)
      addBotMessage("And your mobile number?");
      askPhone();
    });
  }

  function askPhone() {
    enableInput(function(phone) {
        // Basic phone number validation (10 digits minimum, ignoring format symbols)
        const cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length < 10) {
            addBotMessage("Hmm, that doesn't look like a valid 10-digit phone number. Please try again.");
            askPhone();
        } else {
            state.phone = cleanPhone;
            saveState(); // Save state
            submitLeadData(); // NEW: Fire webhook silently
            generateFinalLinks();
        }
    });
  }

  // New function for silent lead capture (with Base64 photos)
  function submitLeadData() {
      // NOTE: For live use, make sure WEBHOOK_URL is set and CORS is configured for 'no-cors' mode
      if (!WEBHOOK_URL) return;

      const score = computeLeadScore();
      const payload = {
          name: state.name,
          phone: state.phone,
          lead_score: score,
          is_rush: state.isRush,
          num_projects: state.projects.length,
          projects: state.projects.map(p => ({
              service: p.svc.label,
              size: p.size ? `${p.size} ${p.svc.unit}` : 'N/A',
              estimate_range: p.isCustom ? 'Walkthrough needed' : `$${Math.round(p.low).toLocaleString()} - $${Math.round(p.high).toLocaleString()}`,
              details: p.sub.label || 'Standard',
              borough: p.borough,
              mode: p.pricingMode,
              rush: p.isRush,
              promo: p.promoCode,
          })),
          // Fix 3: Include Base64 photos in the payload
          photos: state.photos 
      };

      fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          mode: 'no-cors' // Crucial for security and simplicity when talking to 3rd party webhooks
      })
      .then(() => console.log("Lead silently captured via webhook."))
      .catch(e => console.error("Webhook failed:", e));
  }


  function generateFinalLinks() {
    updateProgress(100);
    const score = computeLeadScore();
    const isHighValue = score > 60;

    var lines = [];
    // Sanitize name for display
    lines.push("Hello, I'm " + sanitizeInput(state.name) + "."); 
    lines.push("Projects:");

    if (state.projects && state.projects.length) {
      state.projects.forEach(function(p, idx) {
        var sizePart = p.size ? (" — " + p.size + " " + p.svc.unit) : "";
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

        // Add extra detail line (mode, rush, promo, lead)
        var modeLabel = "Full (Labor + Materials)";
        if (p.pricingMode === "labor") modeLabel = "Labor Only";
        if (p.pricingMode === "materials") modeLabel = "Materials + Light Help";

        var extras = [modeLabel];
        if (p.isRush) extras.push("Rush scheduling");
        if (p.promoCode) extras.push("Promo: " + p.promoCode.toUpperCase());
        if (p.isLeadHome) extras.push("Lead-safe methods");

        if (extras.length) {
          lines.push("   [" + extras.join(" | ") + "]");
        }
      });
    } else if (state.serviceKey && SERVICES[state.serviceKey]) {
      lines.push(SERVICES[state.serviceKey].label);
    }
    
    // Seasonality/Time Logic
    const now = new Date();
    const month = now.getMonth();
    if (month >= 10 || month <= 2) { // Nov (10) to Feb (2)
         lines.push("");
         lines.push("NOTE: This is the Winter season. Exterior work (concrete, masonry) will be scheduled for the early Spring backlog. Book now to secure your slot.");
    }
    
    lines.push("");
    lines.push("Phone: " + state.phone);
    lines.push("Please reply to schedule a walkthrough.");
    lines.push("");
    lines.push(
      "Disclaimer: This is an automated ballpark estimate only. " +
      "It is not a formal estimate, contract, or offer for services. " +
      "Final pricing may change after an in-person walkthrough and a written agreement."
    );
    // Added a note about photos for the manual email/sms link
    if (state.photos.length > 0) {
        lines.push(`(Note: ${state.photos.length} photo(s) were submitted via our secure webhook. Please attach them again if you use this email/text link.)`);
    }

    var body = encodeURIComponent(lines.join("\n"));
    
    // Use lead score to prioritize the subject line
    var emailSubject = (isHighValue ? "🔥 HIGH PRIORITY LEAD " : "Estimate Request ") + " - Hammer Brick & Home";

    var smsLink = "sms:19295955300?&body=" + body;
    var emailLink =
      "mailto:info@hammerbrickhome.com?subject=" +
      encodeURIComponent(emailSubject) +
      "&body=" +
      body;

    addBotMessage(
      "Thanks, " +
        sanitizeInput(state.name) +
        "! Choose how you’d like to contact us and feel free to attach your photos.",
      false
    );

    setTimeout(function() {
      // SMS button
      var smsBtn = document.createElement("a");
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
      var emailBtn = document.createElement("a");
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
      // We pass the raw value to the callback for validation/sanitization there
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
