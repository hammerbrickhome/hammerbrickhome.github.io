/* ============================================================
   HAMMER BRICK & HOME — ULTRA ADVANCED ESTIMATOR BOT v3.1
   (Fixed: Button Visibility & Session Restore)
=============================================================== */

(function() {
  // --- CONFIGURATION & DATA ---
  
  // Modifiers (Matches your estimator-advanced.js)
  const BOROUGH_MODS = {
    "Manhattan": 1.18, "Brooklyn": 1.08, "Queens": 1.05, 
    "Bronx": 1.03, "Staten Island": 1.0, "New Jersey": 0.96
  };

  // Pricing Logic
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
      subQuestion: "Roof type & style?",
      options: [
        { label: "Shingle (Standard)", factor: 1.0 },
        { label: "Flat Roof (NYC Spec)", factor: 1.5 },
        { label: "Slate/Specialty", factor: 2.5 }
      ]
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
    "other": {
      label: "Other / Handyman",
      emoji: "🛠",
      unit: "consult"
    }
  };

  // State Management
  const state = {
    step: 0,
    serviceKey: null,
    subOption: null,
    size: 0,
    borough: null,
    isLeadHome: false,
    name: "",
    phone: ""
  };

  // DOM Cache
  let els = {};

  // --- INIT ---
  function init() {
    console.log("HB Chat: Initializing...");
    createInterface();
    
    // Check for previous session (Persistence)
    // FIX: Changed 'openChat' to 'toggleChat' to prevent crash
    if(sessionStorage.getItem("hb_chat_active") === "true") {
      toggleChat();
    }
  }

  function createInterface() {
    // 1. FAB (Floating Button)
    const fab = document.createElement('div');
    fab.className = 'hb-chat-fab';
    fab.innerHTML = `<span class="hb-fab-icon">📷</span><span class="hb-fab-text">Get Quote</span>`;
    // FIX: Force flex display
    fab.style.display = 'flex'; 
    fab.onclick = toggleChat;
    document.body.appendChild(fab);

    // 2. Chat Wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'hb-chat-wrapper';
    wrapper.innerHTML = `
      <div class="hb-chat-header">
        <div class="hb-chat-title">
          <h3>Hammer Brick & Home</h3>
          <span>AI Estimator</span>
        </div>
        <button class="hb-chat-close">×</button>
      </div>
      <div class="hb-progress-container"><div class="hb-progress-bar" id="hb-prog"></div></div>
      <div class="hb-chat-body" id="hb-body"></div>
      <div class="hb-chat-footer">
        <input type="text" class="hb-chat-input" id="hb-input" placeholder="Select an option above..." disabled>
        <button class="hb-chat-send" id="hb-send">➤</button>
      </div>
    `;
    document.body.appendChild(wrapper);

    // 3. Cache Elements
    els = {
      wrapper, fab,
      body: document.getElementById('hb-body'),
      input: document.getElementById('hb-input'),
      send: document.getElementById('hb-send'),
      prog: document.getElementById('hb-prog'),
      close: wrapper.querySelector('.hb-chat-close')
    };

    // 4. Bind Events
    els.close.onclick = toggleChat;
    els.send.onclick = handleManualInput;
    els.input.addEventListener('keypress', e => { if(e.key === 'Enter') handleManualInput(); });

    // 5. Start Logic
    addBotMessage("👋 Hi! I can generate a ballpark estimate for your project instantly.");
    setTimeout(() => {
      addBotMessage("What type of project are you planning?");
      presentServiceOptions();
    }, 800);
  }

  function toggleChat() {
    const isOpen = els.wrapper.classList.toggle('hb-open');
    if(isOpen) {
      els.fab.style.display = 'none'; // Hide button when chat is open
      sessionStorage.setItem("hb_chat_active", "true");
    } else {
      els.fab.style.display = 'flex'; // Show button when chat is closed
      sessionStorage.removeItem("hb_chat_active");
    }
  }

  function updateProgress(pct) {
    if(els.prog) els.prog.style.width = pct + "%";
  }

  // --- MESSAGING SYSTEM ---

  function addBotMessage(text, isHtml = false) {
    // 1. Show Typing
    const typingId = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.className = 'hb-msg hb-msg-bot';
    typingDiv.id = typingId;
    typingDiv.innerHTML = `<div class="hb-typing-dots"><div class="hb-dot"></div><div class="hb-dot"></div><div class="hb-dot"></div></div>`;
    els.body.appendChild(typingDiv);
    els.body.scrollTop = els.body.scrollHeight;

    // 2. Delay transform to text
    const delay = Math.min(1500, text.length * 20 + 500); 
    setTimeout(() => {
      const msgBubble = document.getElementById(typingId);
      if(msgBubble) {
        if(isHtml) {
          msgBubble.innerHTML = text;
        } else {
          msgBubble.textContent = text;
        }
        els.body.scrollTop = els.body.scrollHeight;
      }
    }, delay);
  }

  function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'hb-msg hb-msg-user';
    div.textContent = text;
    els.body.appendChild(div);
    els.body.scrollTop = els.body.scrollHeight;
  }

  function addChoices(options, callback) {
    setTimeout(() => {
      const chipContainer = document.createElement('div');
      chipContainer.className = 'hb-chips';
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'hb-chip';
        const label = typeof opt === 'object' ? opt.label : opt;
        btn.textContent = label;
        btn.onclick = () => {
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

  // --- CONVERSATION FLOW ---

  function presentServiceOptions() {
    updateProgress(10);
    const opts = Object.keys(SERVICES).map(k => ({ label: SERVICES[k].emoji + " " + SERVICES[k].label, key: k }));
    addChoices(opts, (selection) => {
      state.serviceKey = selection.key;
      stepTwo_SubQuestions();
    });
  }

  function stepTwo_SubQuestions() {
    updateProgress(30);
    const svc = SERVICES[state.serviceKey];
    
    if (svc.subQuestion && svc.options) {
      addBotMessage(svc.subQuestion);
      addChoices(svc.options, (choice) => {
        state.subOption = choice;
        stepThree_LeadCheck();
      });
    } else if (state.serviceKey === 'other') {
      stepFive_Location(); 
    } else {
      state.subOption = { factor: 1.0, label: "Standard" };
      stepThree_LeadCheck();
    }
  }

  function stepThree_LeadCheck() {
    const svc = SERVICES[state.serviceKey];
    if (svc.leadSensitive) {
      addBotMessage("Is your property built before 1978? (Required for lead safety laws).");
      addChoices(["Yes (Pre-1978)", "No / Not Sure"], (ans) => {
        if(ans.includes("Yes")) state.isLeadHome = true;
        stepFour_Size();
      });
    } else {
      stepFour_Size();
    }
  }

  function stepFour_Size() {
    updateProgress(50);
    const svc = SERVICES[state.serviceKey];
    
    if (svc.unit === 'fixed' || state.serviceKey === 'other') {
      stepFive_Location();
      return;
    }

    addBotMessage(`Approximate size in ${svc.unit}?`);
    enableInput((val) => {
      const num = parseInt(val.replace(/[^0-9]/g, ''));
      if (!num || num < 10) {
        addBotMessage("That number seems low. Please enter a valid number (e.g. 500).");
        enableInput(arguments.callee);
      } else {
        state.size = num;
        stepFive_Location();
      }
    });
  }

  function stepFive_Location() {
    updateProgress(70);
    addBotMessage("Which borough/area is this in?");
    const locs = Object.keys(BOROUGH_MODS);
    addChoices(locs, (loc) => {
      state.borough = loc;
      calculateEstimate();
    });
  }

  // --- CALCULATION ENGINE ---

  function calculateEstimate() {
    updateProgress(90);
    const svc = SERVICES[state.serviceKey];
    const sub = state.subOption || {};
    const mod = BOROUGH_MODS[state.borough] || 1.0;
    
    let low = 0, high = 0;

    if (state.serviceKey === 'other') {
      showLeadCapture("Since this is a custom job, I need to have a human look at it.");
      return;
    }

    if (svc.unit === 'fixed') {
      low = sub.fixedLow * mod;
      high = sub.fixedHigh * mod;
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

    if (state.isLeadHome) {
      low *= 1.10;
      high *= 1.10;
    }

    const fLow = Math.round(low).toLocaleString();
    const fHigh = Math.round(high).toLocaleString();

    const receiptHtml = `
      <div class="hb-receipt">
        <h4>Estimator Summary</h4>
        <div class="hb-receipt-row"><span>Service:</span><span>${svc.label}</span></div>
        <div class="hb-receipt-row"><span>Type:</span><span>${sub.label || 'Standard'}</span></div>
        <div class="hb-receipt-row"><span>Area:</span><span>${state.borough}</span></div>
        ${state.size ? `<div class="hb-receipt-row"><span>Size:</span><span>${state.size} ${svc.unit}</span></div>` : ''}
        ${state.isLeadHome ? `<div class="hb-receipt-row" style="color:#d55"><span>Lead Safety:</span><span>Included</span></div>` : ''}
        <div class="hb-receipt-total">
          <span>ESTIMATE:</span>
          <span>$${fLow} – $${fHigh}</span>
        </div>
        <div class="hb-receipt-footer">Ballpark estimate based on local data.</div>
      </div>
    `;

    addBotMessage(receiptHtml, true);
    setTimeout(() => {
      showLeadCapture("To lock in this price range, I can text you this summary now.");
    }, 1500);
  }

  function showLeadCapture(introText) {
    addBotMessage(introText);
    addBotMessage("What is your name?");
    enableInput((name) => {
      state.name = name;
      addBotMessage("And your mobile number?");
      enableInput((phone) => {
        state.phone = phone;
        generateFinalLink();
      });
    });
  }

  function generateFinalLink() {
    updateProgress(100);
    const lines = [
      `Hello, I'm ${state.name}.`,
      `Project: ${SERVICES[state.serviceKey].label} (${state.subOption?.label || ''})`,
      `Loc: ${state.borough}`,
      state.size ? `Size: ${state.size} ${SERVICES[state.serviceKey].unit}` : '',
      `Phone: ${state.phone}`,
      `Please reply to schedule a walkthrough.`
    ];
    
    const body = encodeURIComponent(lines.join('\n'));
    const link = `sms:19295955300?&body=${body}`;

    addBotMessage(`Thanks, ${state.name}! Click below to text us.`);
    
    setTimeout(() => {
      const btn = document.createElement('a');
      btn.className = 'hb-chip';
      btn.style.background = '#e7bf63';
      btn.style.color = '#000';
      btn.style.fontWeight = 'bold';
      btn.style.display = 'block';
      btn.style.textAlign = 'center';
      btn.style.textDecoration = 'none';
      btn.style.marginTop = '10px';
      btn.textContent = "📲 Open Text Messages";
      btn.href = link;
      els.body.appendChild(btn);
      els.body.scrollTop = els.body.scrollHeight;
    }, 500);
  }

  // --- UTILS ---
  function enableInput(callback) {
    els.input.disabled = false;
    els.input.placeholder = "Type your answer...";
    els.input.focus();
    
    // Clear old listeners by cloning
    const newSend = els.send.cloneNode(true);
    els.send.parentNode.replaceChild(newSend, els.send);
    els.send = newSend;

    els.send.onclick = () => {
      const val = els.input.value.trim();
      if(!val) return;
      addUserMessage(val);
      els.input.value = "";
      els.input.disabled = true;
      els.input.placeholder = "Please wait...";
      callback(val);
    };
  }

  function handleManualInput() {
    if(!els.input.disabled && els.send) els.send.click();
  }

  // Run
  document.addEventListener("DOMContentLoaded", init);

})();
