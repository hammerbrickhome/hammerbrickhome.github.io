/* ============================================================
   SMART ADD-ONS — Hammer Brick & Home LLC
   Premium Dynamic Add-On System
=============================================================== */

/* -----------------------------------
   CONFIG — Add-ons for each service
----------------------------------- */
const SMART_ADDONS = {
  masonry: [
    { label: "Polymeric Sand Refill", low: 250, high: 450 },
    { label: "Paver Sealing", low: 450, high: 1200 },
    { label: "Drainage Channel", low: 900, high: 1800 },
    { label: "Border Accent Upgrade", low: 350, high: 900 },
    { label: "LED Step Lighting", low: 450, high: 1400 }
  ],
  roofing: [
    { label: "Gutter Replacement", low: 350, high: 1200 },
    { label: "Ice & Water Shield Upgrade", low: 300, high: 850 },
    { label: "Ridge Vent Upgrade", low: 400, high: 950 },
    { label: "Skylight Reseal", low: 450, high: 1100 }
  ],
  bathroom: [
    { label: "Built-In Niche", low: 350, high: 850 },
    { label: "Glass Door Upgrade", low: 900, high: 1800 },
    { label: "Heated Floor System", low: 1800, high: 3200 },
    { label: "Premium Vanity Install", low: 550, high: 1250 }
  ]
};

/* -----------------------------------
   RENDER CHECKBOXES
----------------------------------- */
function renderSmartAddons(service) {
  const panel = document.getElementById("smart-addons-panel");
  if (!panel) return;

  panel.innerHTML = "";

  if (!SMART_ADDONS[service]) {
    panel.style.display = "none";
    return;
  }

  panel.style.display = "block";

  SMART_ADDONS[service].forEach((item, i) => {
    panel.innerHTML += `
      <label style="display:block; margin:6px 0;">
        <input type="checkbox" class="smart-addon"
          data-low="${item.low}"
          data-high="${item.high}">
        ${item.label}
        <span style="color:#e7bf63;">
          (+$${item.low.toLocaleString()} – $${item.high.toLocaleString()})
        </span>
      </label>
    `;
  });
}

/* -----------------------------------
   CALCULATE SELECTED ADD-ONS
----------------------------------- */
function getSmartAddonTotals() {
  let low = 0, high = 0;
  document.querySelectorAll(".smart-addon:checked").forEach(box => {
    low += Number(box.dataset.low);
    high += Number(box.dataset.high);
  });
  return { low, high };
}

/* -----------------------------------
   HOOK INTO SERVICE CHANGE
----------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const svc = document.getElementById("est-service");
  if (!svc) return;
  svc.addEventListener("change", e => {
    renderSmartAddons(e.target.value);
  });
});

/* -----------------------------------
   PATCH calculateEstimate()
----------------------------------- */
(function patchEstimate() {
  if (typeof calculateEstimate !== "function") {
    console.error("Smart Add-Ons: calculateEstimate() not found.");
    return;
  }

  const originalFn = calculateEstimate;

  calculateEstimate = function(evt) {
    originalFn(evt);

    const { low, high } = getSmartAddonTotals();
    const rangeEl = document.querySelector(".est-main");

    if (!rangeEl) return;

    rangeEl.insertAdjacentHTML(
      "afterend",
      `
      <p style="margin-top:8px; color:#e7bf63;">
        Add-Ons Selected: +$${low.toLocaleString()} – +$${high.toLocaleString()}
      </p>
      `
    );
  };
})();
