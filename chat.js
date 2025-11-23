/* ============================================================
   HAMMER BRICK & HOME — NO-API CHAT WIZARD
   CTA: "📷 Send Photos for Quote"
=============================================================== */

(function() {
  let currentStep = 0;
  const totalSteps = 4;
  const state = {
    service: "",
    area: "",
    timing: "",
    name: "",
    phone: "",
    notes: ""
  };

  function createChatUI() {
    // Floating button
    const fab = document.createElement("button");
    fab.className = "hb-chat-fab";
    fab.type = "button";
    fab.innerHTML = `<span class="hb-chat-icon">📷</span><span>Send Photos for Quote</span>`;
    document.body.appendChild(fab);

    // Overlay + panel
    const overlay = document.createElement("div");
    overlay.className = "hb-chat-overlay";
    overlay.id = "hb-chat-overlay";

    overlay.innerHTML = `
      <div class="hb-chat-panel" role="dialog" aria-modal="true" aria-labelledby="hb-chat-heading">
        <div class="hb-chat-header">
          <div class="hb-chat-title-wrap">
            <div class="hb-chat-title" id="hb-chat-heading">Hammer Brick &amp; Home</div>
            <div class="hb-chat-sub">Share your project &amp; photos for a quicker quote.</div>
          </div>
          <button type="button" class="hb-chat-close-btn" aria-label="Close">×</button>
        </div>

        <div class="hb-chat-body">
          <!-- Step 0: Service type -->
          <div class="hb-step hb-step-0 hb-step-active">
            <div class="hb-step-title">What do you need help with?</div>
            <div class="hb-step-note">Choose the service that fits best. You can add details later.</div>
            <div class="hb-options-grid" data-field="service">
              <button type="button" class="hb-option-btn" data-value="Lead-Safe Renovation (Pre-1978)">
                Lead-Safe Renovation
              </button>
              <button type="button" class="hb-option-btn" data-value="Masonry & Concrete">
                Masonry &amp; Concrete
              </button>
              <button type="button" class="hb-option-btn" data-value="Carpentry & Remodeling">
                Carpentry &amp; Remodeling
              </button>
              <button type="button" class="hb-option-btn" data-value="Painting & Finishes">
                Painting &amp; Finishes
              </button>
              <button type="button" class="hb-option-btn" data-value="Exterior Care & Seasonal">
                Exterior Care &amp; Seasonal
              </button>
              <button type="button" class="hb-option-btn" data-value="Small Roof Repair">
                Small Roof Repair
              </button>
              <button type="button" class="hb-option-btn" data-value="Not Sure / Multiple">
                Not Sure / Multiple
              </button>
            </div>
          </div>

          <!-- Step 1: Area + timing -->
          <div class="hb-step hb-step-1">
            <div class="hb-step-title">Where is the property &amp; when are you planning the work?</div>
            <div class="hb-step-note">This helps us respond with realistic timing.</div>

            <div class="hb-step-subtitle">Service Area</div>
            <div class="hb-options-grid" data-field="area">
              <button type="button" class="hb-option-btn" data-value="Staten Island">Staten Island</button>
              <button type="button" class="hb-option-btn" data-value="Brooklyn">Brooklyn</button>
              <button type="button" class="hb-option-btn" data-value="Queens">Queens</button>
              <button type="button" class="hb-option-btn" data-value="Manhattan">Manhattan</button>
              <button type="button" class="hb-option-btn" data-value="Bronx">Bronx</button>
              <button type="button" class="hb-option-btn" data-value="New Jersey">New Jersey</button>
              <button type="button" class="hb-option-btn" data-value="Other / Nearby">Other / Nearby</button>
            </div>

            <div class="hb-step-subtitle" style="margin-top:8px;">Timing</div>
            <div class="hb-options-grid" data-field="timing">
              <button type="button" class="hb-option-btn" data-value="ASAP">ASAP</button>
              <button type="button" class="hb-option-btn" data-value="1–2 Weeks">1–2 Weeks</button>
              <button type="button" class="hb-option-btn" data-value="This Month">This Month</button>
              <button type="button" class="hb-option-btn" data-value="Just Planning / Pricing">Just Planning</button>
            </div>
          </div>

          <!-- Step 2: Photos + notes -->
          <div class="hb-step hb-step-2">
            <div class="hb-step-title">Send photos &amp; a short note.</div>
            <div class="hb-step-note">
              Attach a few photos of the area, and let us know what you’d like done.
              We’ll text or call back with next steps.
            </div>

            <label class="hb-file-label">
              <span>📷</span>
              <span>Choose Photos (will open your gallery)</span>
              <input class="hb-file-input" id="hb-file-input" type="file" accept="image/*" multiple>
            </label>
            <div class="hb-file-note">
              Files are kept private. You’ll be able to text them directly to us after this step as well.
            </div>

            <textarea
              id="hb-notes"
              class="hb-input"
              rows="3"
              placeholder="Example: 'Front steps are cracked and uneven, want new masonry steps and railing.'"></textarea>
          </div>

          <!-- Step 3: Contact details + summary -->
          <div class="hb-step hb-step-3">
            <div class="hb-step-title">Your contact details</div>
            <div class="hb-step-note">
              We’ll use this only to follow up about this quote.
            </div>

            <input id="hb-name" class="hb-input" type="text" placeholder="Your name">
            <input id="hb-phone" class="hb-input" type="tel" placeholder="Best phone number">

            <div class="hb-summary-box" id="hb-summary-box">
              <div><strong>Service:</strong> <span id="hb-summary-service">–</span></div>
              <div><strong>Area:</strong> <span id="hb-summary-area">–</span></div>
              <div><strong>Timing:</strong> <span id="hb-summary-timing">–</span></div>
              <div><strong>Note:</strong> <span id="hb-summary-notes">–</span></div>
            </div>

            <a id="hb-sms-link" class="hb-sms-link" href="#">
              <span>💬 Text this info to Hammer Brick &amp; Home</span>
            </a>
            <div class="hb-file-note" style="margin-top:4px;">
              After tapping, your phone’s Messages app will open with this info filled in.
              You can then attach your photos and hit send.
            </div>
          </div>
        </div>

        <div class="hb-chat-footer">
          <button type="button" class="hb-nav-btn hb-back">Back</button>
          <button type="button" class="hb-nav-btn hb-next">Next</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Wire up interactions
    wireChatInteractions(fab, overlay);
  }

  function wireChatInteractions(fab, overlay) {
    const closeBtn = overlay.querySelector(".hb-chat-close-btn");
    const backBtn = overlay.querySelector(".hb-back");
    const nextBtn = overlay.querySelector(".hb-next");
    const steps = overlay.querySelectorAll(".hb-step");

    function showStep(idx) {
      currentStep = idx;
      steps.forEach((step, i) => {
        step.classList.toggle("hb-step-active", i === idx);
      });

      // Back button state
      if (currentStep === 0) {
        backBtn.disabled = true;
      } else {
        backBtn.disabled = false;
      }

      // Next button label
      if (currentStep === totalSteps - 1) {
        nextBtn.textContent = "Done";
      } else {
        nextBtn.textContent = "Next";
      }

      // On final step, update summary + SMS link
      if (currentStep === 3) {
        updateSummary(overlay);
      }
    }

    function openChat() {
      overlay.classList.add("hb-chat-open");
    }

    function closeChat() {
      overlay.classList.remove("hb-chat-open");
    }

    fab.addEventListener("click", openChat);
    closeBtn.addEventListener("click", closeChat);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeChat();
      }
    });

    backBtn.addEventListener("click", () => {
      if (currentStep > 0) showStep(currentStep - 1);
    });

    nextBtn.addEventListener("click", () => {
      if (currentStep < totalSteps - 1) {
        showStep(currentStep + 1);
      } else {
        // Final Done: close
        closeChat();
      }
    });

    // Option buttons
    overlay.querySelectorAll(".hb-options-grid").forEach(grid => {
      const field = grid.getAttribute("data-field");
      grid.addEventListener("click", (e) => {
        const btn = e.target.closest(".hb-option-btn");
        if (!btn) return;
        const value = btn.getAttribute("data-value") || btn.textContent.trim();

        // toggle selection
        grid.querySelectorAll(".hb-option-btn").forEach(b => b.classList.remove("hb-option-selected"));
        btn.classList.add("hb-option-selected");

        if (field && state.hasOwnProperty(field)) {
          state[field] = value;
        }
      });
    });

    // Text areas / inputs
    const notesEl = overlay.querySelector("#hb-notes");
    const nameEl = overlay.querySelector("#hb-name");
    const phoneEl = overlay.querySelector("#hb-phone");

    if (notesEl) {
      notesEl.addEventListener("input", () => {
        state.notes = notesEl.value.trim();
      });
    }
    if (nameEl) {
      nameEl.addEventListener("input", () => {
        state.name = nameEl.value.trim();
      });
    }
    if (phoneEl) {
      phoneEl.addEventListener("input", () => {
        state.phone = phoneEl.value.trim();
      });
    }

    showStep(0);
  }

  function updateSummary(overlay) {
    const serviceSpan = overlay.querySelector("#hb-summary-service");
    const areaSpan = overlay.querySelector("#hb-summary-area");
    const timingSpan = overlay.querySelector("#hb-summary-timing");
    const notesSpan = overlay.querySelector("#hb-summary-notes");
    const smsLink = overlay.querySelector("#hb-sms-link");

    if (serviceSpan) serviceSpan.textContent = state.service || "–";
    if (areaSpan) areaSpan.textContent = state.area || "–";
    if (timingSpan) timingSpan.textContent = state.timing || "–";
    if (notesSpan) notesSpan.textContent = state.notes || "–";

    if (smsLink) {
      const parts = [];
      parts.push(`Service: ${state.service || "n/a"}`);
      parts.push(`Area: ${state.area || "n/a"}`);
      parts.push(`Timing: ${state.timing || "n/a"}`);
      parts.push(`Name: ${state.name || "n/a"}`);
      parts.push(`Phone: ${state.phone || "n/a"}`);
      if (state.notes) {
        parts.push(`Note: ${state.notes}`);
      }
      parts.push(`(You can attach photos to this text before sending.)`);

      const body = encodeURIComponent(parts.join("\n"));
      smsLink.href = `sms:+19295955300?&body=${body}`;
    }
  }

  // Init after DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    try {
      createChatUI();
    } catch (err) {
      console.error("HB Chat init error:", err);
    }
  });

})();
