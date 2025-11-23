/* ============================================================
   HAMMER BRICK & HOME — INTELLIGENT CHAT BOT v2.0
   Logic derived from estimator-advanced.js & price-ranges.txt
=============================================================== */

(function() {
  // DOM Elements
  let wrapper, messagesArea, inputField, sendBtn, fab;
  
  // State
  const state = {
    service: null,
    subService: null,
    borough: null,
    size: null, // sq ft or linear ft
    name: "",
    phone: ""
  };

  // Pricing Logic (simplified from your estimator-advanced.js)
  const PRICING = {
    "Masonry/Concrete": { unit: "sq ft", low: 16, high: 28, min: 2500 },
    "Driveway": { unit: "sq ft", low: 10, high: 20, min: 3500 },
    "Roofing": { unit: "sq ft", low: 4.5, high: 9.5, min: 6500 },
    "Siding": { unit: "sq ft", low: 6.5, high: 12, min: 6500 },
    "Decks": { unit: "sq ft", low: 45, high: 75, min: 6000 },
    "Fencing": { unit: "linear ft", low: 45, high: 85, min: 3000 },
    "Interior Paint": { unit: "sq ft (floor)", low: 2.5, high: 4.5, min: 1800 },
    "Bathroom": { unit: "fixed", low: 16000, high: 28000 }, // Mid-range avg
    "Kitchen": { unit: "fixed", low: 28000, high: 55000 }, // Mid-range avg
    "Other": { unit: "consult", low: 0, high: 0 }
  };

  const BOROUGH_MODIFIERS = {
    "Manhattan": 1.18,
    "Brooklyn": 1.08,
    "Queens": 1.05,
    "Bronx": 1.03,
    "Staten Island": 1.0,
    "New Jersey": 0.96
  };

  // --- UI Construction ---
  function initChat() {
    // FAB
    fab = document.createElement("div");
    fab.className = "hb-chat-fab";
    fab.innerHTML = `<span>💬</span><span>Get an Instant Quote</span>`;
    fab.onclick = toggleChat;
    document.body.appendChild(fab);

    // Chat Window
    wrapper = document.createElement("div");
    wrapper.className = "hb-chat-wrapper";
    wrapper.innerHTML = `
      <div class="hb-chat-header">
        <div class="hb-chat-brand">
          <h3>Hammer Brick & Home</h3>
          <span>Virtual Estimator</span>
        </div>
        <button class="hb-chat-close">×</button>
      </div>
      <div class="hb-chat-messages" id="hb-chat-msgs"></div>
      <div class="hb-typing" id="hb-typing">Hammer Bot is typing...</div>
      <div class="hb-chat-input-area">
        <input type="text" class="hb-chat-input" placeholder="Type here..." disabled>
        <button class="hb-chat-send">➤</button>
      </div>
    `;
    document.body.appendChild(wrapper);

    // Elements
    messagesArea = document.getElementById("hb-chat-msgs");
    inputField = wrapper.querySelector(".hb-chat-input");
    sendBtn = wrapper.querySelector(".hb-chat-send");
    
    // Listeners
    wrapper.querySelector(".hb-chat-close").onclick = toggleChat;
    sendBtn.onclick = handleInput;
    inputField.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleInput();
    });

    // Start Flow
    addBotMessage("Hi! I'm the Hammer Brick & Home virtual assistant.");
    setTimeout(() => {
      addBotMessage("I can give you a ballpark price estimate right now. What project are you planning?");
      showOptions([
        "Masonry/Concrete", "Driveway", "Roofing", 
        "Siding", "Decks", "Fencing", 
        "Interior Paint", "Bathroom", "Kitchen", "Other"
      ], handleServiceSelect);
    }, 600);
  }

  function toggleChat() {
    wrapper.classList.toggle("hb-open");
    if(wrapper.classList.contains("hb-open")) {
      fab.style.opacity = "0";
      setTimeout(() => inputField.focus(), 300);
    } else {
      fab.style.opacity = "1";
    }
  }

  // --- Messaging Logic ---

  function addBotMessage(text, html = false) {
    const typing = document.getElementById("hb-typing");
    typing.classList.add("active");
    messagesArea.scrollTop = messagesArea.scrollHeight;

    setTimeout(() => {
      typing.classList.remove("active");
      const msg = document.createElement("div");
      msg.className = "hb-msg hb-msg-bot";
      if(html) msg.innerHTML = text; else msg.textContent = text;
      messagesArea.appendChild(msg);
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }, 600); // Fake typing delay
  }

  function addUserMessage(text) {
    const msg = document.createElement("div");
    msg.className = "hb-msg hb-msg-user";
    msg.textContent = text;
    messagesArea.appendChild(msg);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function showOptions(options, callback) {
    setTimeout(() => {
      const container = document.createElement("div");
      container.className = "hb-opts-container";
      
      options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "hb-opt-btn";
        btn.textContent = opt;
        btn.onclick = () => {
          container.remove(); // Remove buttons after click
          addUserMessage(opt);
          callback(opt);
        };
        container.appendChild(btn);
      });
      messagesArea.appendChild(container);
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }, 700);
  }

  // --- Logic Flow ---

  function handleServiceSelect(selection) {
    state.service = selection;
    const config = PRICING[selection];

    if (selection === "Other") {
      askLocation();
      return;
    }

    if (config.unit === "fixed") {
      // Bath/Kitchen - skip size, go to location
      askLocation();
    } else {
      // Needs size
      addBotMessage(`Got it, ${selection}. Approximately how many ${config.unit} is the area?`);
      addBotMessage("An estimate is fine (e.g., 500).");
      enableInput((val) => {
        state.size = parseInt(val.replace(/[^0-9]/g, ''));
        if (isNaN(state.size)) {
          addBotMessage("I didn't catch a number. Please try entering just the number (e.g. 200).");
          enableInput(arguments.callee); // Retry
        } else {
          askLocation();
        }
      });
    }
  }

  function askLocation() {
    addBotMessage("Which borough is the property in?");
    showOptions(Object.keys(BOROUGH_MODIFIERS), (loc) => {
      state.borough = loc;
      calculateAndShowEstimate();
    });
  }

  function calculateAndShowEstimate() {
    const config = PRICING[state.service];
    let minPrice = 0, maxPrice = 0;
    const modifier = BOROUGH_MODIFIERS[state.borough] || 1;

    if (state.service === "Other") {
      addBotMessage("Since this is a custom project, we need to see photos to quote it.");
    } else {
      if (config.unit === "fixed") {
        minPrice = config.low * modifier;
        maxPrice = config.high * modifier;
      } else {
        // Area based
        let baseLow = state.size * config.low;
        let baseHigh = state.size * config.high;
        
        // Enforce minimums
        if (baseLow < config.min) baseLow = config.min;
        if (baseHigh < config.min) baseHigh = config.min * 1.2;

        minPrice = baseLow * modifier;
        maxPrice = baseHigh * modifier;
      }

      // Format currency
      const fMin = Math.round(minPrice).toLocaleString();
      const fMax = Math.round(maxPrice).toLocaleString();

      const html = `
        <div class="hb-estimate-card">
          <div><strong>Est. Range for ${state.service}:</strong></div>
          <div class="hb-est-price">$${fMin} – $${fMax}</div>
          <div class="hb-est-note">Includes NYC/NJ regional factors.</div>
        </div>
      `;
      addBotMessage(html, true);
    }

    setTimeout(() => {
      addBotMessage("To get a confirmed quote, I can text this estimate to our team along with your photos.");
      addBotMessage("What is your name?");
      enableInput((val) => {
        state.name = val;
        addBotMessage("And your mobile number?");
        enableInput((phone) => {
          state.phone = phone;
          finishChat();
        });
      });
    }, 1500);
  }

  function finishChat() {
    // Generate SMS Link
    const textBody = `Hi, I'm ${state.name}. I used the website chat.
Project: ${state.service}
Area: ${state.borough}
${state.size ? `Size: ~${state.size}` : ""}
Phone: ${state.phone}
Please reply so I can send photos.`;

    const smsHref = `sms:19295955300?&body=${encodeURIComponent(textBody)}`;

    addBotMessage("Great. Click the button below to open your text messages. Attach your photos and hit send!");
    
    setTimeout(() => {
      const btn = document.createElement("a");
      btn.className = "hb-opt-btn";
      btn.style.background = "#e7bf63";
      btn.style.color = "#000";
      btn.style.fontWeight = "bold";
      btn.style.textAlign = "center";
      btn.style.display = "block";
      btn.style.marginTop = "10px";
      btn.style.textDecoration = "none";
      btn.textContent = "📲 Click to Text Photos";
      btn.href = smsHref;
      messagesArea.appendChild(btn);
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }, 500);
  }

  // Helper to enable text input
  function enableInput(callback) {
    inputField.disabled = false;
    inputField.focus();
    // One-time listener for the callback
    const handler = () => {
      const val = inputField.value.trim();
      if (!val) return;
      addUserMessage(val);
      inputField.value = "";
      inputField.disabled = true;
      sendBtn.onclick = null; // clear old handler
      callback(val);
    };
    
    sendBtn.onclick = handler;
    // We also need to update the Enter key handler dynamically, 
    // but for simplicity, the global Enter handler calls sendBtn.click()
  }

  function handleInput() {
    // Triggered by global enter or click. 
    // The actual logic is inside the `onclick` assigned by enableInput
  }

  // Initialize
  document.addEventListener("DOMContentLoaded", initChat);

})();
