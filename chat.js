<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hammer Brick & Home Estimator</title>
  <style>
    /* ============================================================
       HAMMER BRICK & HOME — ULTRA-ADVANCED CHAT AI UI v2.2
       Desktop + Mobile • iPhone Keyboard Safe • Luxury Dark+Gold
    =============================================================== */

    :root {
      --hb-chat-bg: #090e1a;
      --hb-chat-surface: #121a2e;
      --hb-chat-gold: #e7bf63;
      --hb-chat-gold-dim: #bba060;
      --hb-chat-accent: #3a4b70;
      --hb-chat-text: #ececec;
      --hb-chat-shadow: 0 20px 50px rgba(0,0,0,0.8);
      --hb-bot-msg-bg: #1c263b;
      --hb-user-msg-bg: linear-gradient(135deg, #e7bf63, #c9a045);
    }

    body {
      margin: 0;
      padding: 0;
      background-color: #eee;
      font-family: -apple-system, system-ui, sans-serif;
    }

    /* --- FAB (Floating Action Button) --------------------------- */

    .hb-chat-fab {
      position: fixed;
      right: 25px;
      bottom: 25px;
      z-index: 2147483647; /* max z */
      background: radial-gradient(circle at top left, #2a2235, #000);
      border: 1px solid rgba(231,191,99,0.6);
      border-radius: 50px;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                  box-shadow 0.3s ease;
    }

    .hb-chat-fab:hover {
      transform: scale(1.05) translateY(-4px);
      box-shadow: 0 14px 40px rgba(0,0,0,0.7);
    }

    .hb-fab-text {
      color: var(--hb-chat-gold);
      font-weight: 700;
      font-size: 14px;
    }

    .hb-fab-icon {
      font-size: 20px;
    }

    /* --- Main Window ------------------------------------------- */

    .hb-chat-wrapper {
      position: fixed;
      bottom: 100px;
      right: 25px;
      width: 400px;
      max-width: calc(100vw - 50px);
      height: 650px;
      max-height: calc(100vh - 140px);
      background: var(--hb-chat-bg);
      border-radius: 20px;
      border: 1px solid rgba(231,191,99,0.3);
      box-shadow: var(--hb-chat-shadow);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.9);
      pointer-events: none;
      transition: opacity 0.28s ease-out,
                  transform 0.32s cubic-bezier(0.19,1,0.22,1);
      z-index: 2147483646;
      font-family: -apple-system, system-ui, sans-serif;
    }

    /* Use dynamic viewport height on modern mobile browsers */
    @supports (height: 100dvh) {
      .hb-chat-wrapper {
        max-height: 100dvh;
      }
    }

    .hb-chat-wrapper.hb-open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* --- Header & Progress ------------------------------------- */

    .hb-chat-header {
      background: rgba(18,26,46,0.95);
      padding: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(10px);
    }

    .hb-chat-title h3 {
      margin: 0;
      font-size: 15px;
      color: #fff;
    }

    .hb-chat-title span {
      font-size: 11px;
      color: var(--hb-chat-gold);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .hb-chat-close {
      background: none;
      border: none;
      color: #888;
      font-size: 24px;
      cursor: pointer;
    }

    /* Progress Bar */
    .hb-progress-container {
      height: 3px;
      background: #1c263b;
      width: 100%;
    }

    .hb-progress-bar {
      height: 100%;
      background: var(--hb-chat-gold);
      width: 0%;
      transition: width 0.5s ease;
    }

    /* --- Message Area ------------------------------------------ */

    .hb-chat-body {
      flex: 1;
      padding: 20px;
      padding-bottom: 120px; /* space for footer on desktop */
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      scroll-behavior: smooth;
    }

    /* Bubbles */
    .hb-msg {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.5;
      position: relative;
      animation: hbPopIn 0.3s ease forwards;
    }

    .hb-msg-bot {
      background: var(--hb-bot-msg-bg);
      color: #ddd;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
      border: 1px solid rgba(255,255,255,0.05);
    }

    .hb-msg-user {
      background: var(--hb-user-msg-bg);
      color: #1a120f;
      border-bottom-right-radius: 4px;
      align-self: flex-end;
      font-weight: 500;
      box-shadow: 0 4px 15px rgba(231,191,99,0.25);
    }

    @keyframes hbPopIn {
      from { opacity: 0; transform: translateY(10px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0)    scale(1); }
    }

    /* --- Choice Chips (Grid Layout) ---------------------------- */

    .hb-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 5px;
    }

    .hb-chip {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(231,191,99,0.4);
      color: var(--hb-chat-gold);
      padding: 10px 16px;
      border-radius: 12px;
      font-size: 13px;
      cursor: pointer;
      transition: 0.2s;
      flex: 1 1 auto;
      text-align: center;
    }

    .hb-chip:hover {
      background: rgba(231,191,99,0.15);
      transform: translateY(-2px);
      border-color: var(--hb-chat-gold);
    }

    /* Primary / Gold Button */
    .hb-chip.hb-primary-btn {
      background: var(--hb-chat-gold) !important;
      color: #000 !important;
      font-weight: 700;
      border: 1px solid var(--hb-chat-gold);
      box-shadow: 0 4px 15px rgba(231,191,99,0.5);
      transition: all 0.2s ease;
    }

    .hb-chip.hb-primary-btn:hover {
      background: #ffcc66 !important;
      transform: scale(1.02);
      box-shadow: 0 6px 20px rgba(231,191,99,0.7);
    }

    /* --- Receipt Card ------------------------------------------ */

    .hb-receipt {
      background: #fff;
      color: #111;
      padding: 20px;
      border-radius: 12px;
      font-family: "Courier New", monospace;
      position: relative;
      margin-top: 10px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.3);
      border-top: 5px solid var(--hb-chat-gold);
    }

    .hb-receipt h4 {
      margin: 0 0 10px 0;
      text-align: center;
      text-transform: uppercase;
      border-bottom: 2px dashed #ccc;
      padding-bottom: 10px;
    }

    .hb-receipt-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 13px;
    }

    .hb-receipt-total {
      border-top: 2px dashed #111;
      margin-top: 10px;
      padding-top: 10px;
      font-weight: 900;
      font-size: 16px;
      display: flex;
      justify-content: space-between;
    }

    .hb-receipt-footer {
      font-size: 10px;
      text-align: center;
      margin-top: 12px;
      color: #666;
    }

    /* --- Footer / Input Area ----------------------------------- */

    .hb-chat-footer {
      position: relative; /* desktop: inside wrapper bottom */
      padding: 16px;
      background: rgba(9,14,26,0.95);
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      gap: 10px;
      align-items: center;
      box-sizing: border-box;
    }

    .hb-chat-input {
      flex: 1;
      background: #1c263b;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 25px;
      padding: 12px 18px;
      color: #fff;
      outline: none;
      font-size: 16px;             /* iPhone zoom fix */
      -webkit-text-size-adjust: 100%;
    }

    .hb-chat-input::placeholder {
      color: rgba(255,255,255,0.55);
    }

    .hb-chat-send {
      background: var(--hb-chat-gold);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: #000;
      transition: 0.2s;
      flex-shrink: 0;
    }

    .hb-chat-send:hover {
      transform: rotate(-10deg) scale(1.1);
    }

    /* --- Typing Animation -------------------------------------- */

    .hb-typing-dots {
      display: inline-flex;
      gap: 4px;
      padding: 4px 8px;
    }

    .hb-dot {
      width: 6px;
      height: 6px;
      background: #888;
      border-radius: 50%;
      animation: hbBounce 1.4s infinite ease-in-out both;
    }

    .hb-dot:nth-child(1) { animation-delay: -0.32s; }
    .hb-dot:nth-child(2) { animation-delay: -0.16s; }

    @keyframes hbBounce {
      0%, 80%, 100% { transform: scale(0); }
      40%          { transform: scale(1); }
    }

    /* ============================================================
       MOBILE OPTIMIZATION
       Full-screen, keyboard-safe layout for phones
    =============================================================== */

    @media (max-width: 768px) {

      .hb-chat-wrapper {
        bottom: 0;
        right: 0;
        width: 100vw;
        max-width: 100vw;
        height: 100dvh;
        max-height: 100dvh;
        border-radius: 0;
        border-left: none;
        border-right: none;
      }

      .hb-chat-header {
        padding: 14px;
      }

      .hb-chat-body {
        padding: 14px;
        padding-bottom: calc(140px + env(safe-area-inset-bottom, 0px));
      }

      .hb-chat-footer {
        position: absolute;      /* anchor to bottom of chat window */
        left: 0;
        right: 0;
        bottom: 0;
        padding: 12px 14px calc(12px + env(safe-area-inset-bottom, 0px));
      }

      .hb-chat-input {
        padding: 10px 14px;
      }

      .hb-chat-send {
        width: 40px;
        height: 40px;
        font-size: 16px;
      }

      .hb-msg {
        font-size: 13px;
      }
    }

    /* Even tighter tweaks for very small phones */
    @media (max-width: 480px) {
      .hb-chat-title h3 {
        font-size: 14px;
      }
      .hb-chat-title span {
        font-size: 10px;
      }
    }

    /* Safety Override */
    .hb-chat-fab {
      opacity: 1;
      visibility: visible;
    }
  </style>
</head>
<body>

  <div style="padding: 40px; text-align: center; color: #555;">
    <h1>Hammer Brick & Home</h1>
    <p>The estimator bot is active.</p>
    <p>Look for the 📷 button at the bottom right.</p>
  </div>

  <script>
    /* ============================================================
       HAMMER BRICK & HOME — ULTRA ADVANCED ESTIMATOR BOT v6.0
       (Size Helpers + Full Smart Add-ons + Enhanced Contact)
    =============================================================== */

    (function() {
      // --- CONFIGURATION & DATA -----------------------------------

      // 1. SMART ADD-ONS CONFIGURATION
      const SMART_ADDON_GROUP_LABELS = {
        luxury: "Luxury Upgrades",
        protection: "Protection & Safety",
        design: "Design Enhancements",
        speed: "Speed / Convenience",
        maintenance: "Maintenance Items"
      };

      // Mapped strictly to the SERVICE keys below
      const SMART_ADDONS_CONFIG = {
        masonry: {
          title: "Masonry · Pavers · Concrete",
          groups: {
            luxury: [
              { label: "Premium border band with contrasting pavers", low: 900, high: 2200 },
              { label: "Decorative inlays or medallion pattern", low: 850, high: 2600 },
              { label: "Raised seating wall or planter", low: 1800, high: 4800 },
              { label: "Outdoor kitchen prep pad", low: 2200, high: 6800 }
            ],
            protection: [
              { label: "Full base compaction upgrade", low: 850, high: 2200 },
              { label: "Perimeter drain or channel drain", low: 950, high: 2600 },
              { label: "Concrete edge restraint / curb", low: 650, high: 1600 }
            ],
            design: [
              { label: "Color upgrade / multi-blend pavers", low: 650, high: 1900 },
              { label: "Large-format or European-style pavers", low: 1500, high: 5200 },
              { label: "Step face stone veneer upgrade", low: 1100, high: 3600 }
            ],
            speed: [
              { label: "Weekend or off-hours install", low: 850, high: 2600 }
            ],
            maintenance: [
              { label: "Clean & seal package", low: 450, high: 1800 },
              { label: "Polymeric sand refill", low: 250, high: 650 }
            ]
          }
        },
        driveway: {
          title: "Driveway / Parking Area",
          groups: {
            luxury: [
              { label: "Decorative apron or entry pattern", low: 900, high: 2800 },
              { label: "Heated driveway rough-in", low: 2800, high: 7800 },
              { label: "Integrated lighting at edges", low: 950, high: 2600 }
            ],
            protection: [
              { label: "Thicker base / driveway reinforcement", low: 1200, high: 3500 },
              { label: "Drain basin or trench drain at garage", low: 950, high: 2600 }
            ],
            design: [
              { label: "Two-tone driveway with borders", low: 1500, high: 4200 },
              { label: "Stamped concrete pattern upgrade", low: 1800, high: 5200 }
            ],
            maintenance: [
              { label: "Sealcoat package (asphalt)", low: 450, high: 900 }
            ]
          }
        },
        roofing: {
          title: "Roofing",
          groups: {
            luxury: [
              { label: "Architectural or designer shingle upgrade", low: 1800, high: 5200 },
              { label: "Decorative metal accent roofing", low: 2200, high: 7800 }
            ],
            protection: [
              { label: "Full ice & water shield upgrade", low: 1500, high: 4200 },
              { label: "High-performance synthetic underlayment", low: 650, high: 1900 },
              { label: "Premium flashing & chimney reflashing", low: 900, high: 2600 }
            ],
            design: [
              { label: "Color-matched drip edge & accessories", low: 450, high: 1200 },
              { label: "Decorative ridge cap upgrade", low: 650, high: 1600 }
            ],
            speed: [
              { label: "One-day tear-off & install", low: 1500, high: 4500 }
            ],
            maintenance: [
              { label: "Gutter cleaning added to roof project", low: 250, high: 650 }
            ]
          }
        },
        siding: {
          title: "Siding – Exterior",
          groups: {
            luxury: [
              { label: "Stone or brick accent wall", low: 3500, high: 9800 },
              { label: "Board-and-batten or mixed cladding look", low: 2200, high: 6800 }
            ],
            protection: [
              { label: "Full house wrap / moisture barrier upgrade", low: 950, high: 2800 },
              { label: "Flashing and sill pan upgrade at windows", low: 900, high: 2600 }
            ],
            design: [
              { label: "Premium color or insulated siding line", low: 2600, high: 7800 },
              { label: "Decorative trim and crown details", low: 1500, high: 4200 }
            ]
          }
        },
        windows: {
          title: "Windows & Exterior Doors",
          groups: {
            luxury: [
              { label: "Black or color-exterior window upgrade", low: 2200, high: 6800 },
              { label: "Sliding or French patio door upgrade", low: 2800, high: 7800 }
            ],
            protection: [
              { label: "Impact-resistant / laminated glass", low: 2600, high: 7800 },
              { label: "Storm door package", low: 650, high: 1800 }
            ],
            design: [
              { label: "Grids / divided lite pattern upgrade", low: 450, high: 1600 },
              { label: "Interior casing & stool upgrade", low: 750, high: 2600 }
            ],
            speed: [
              { label: "Same-day glass removal & board-up", low: 450, high: 1200 }
            ]
          }
        },
        exterior_paint: {
          title: "Exterior Painting",
          groups: {
            luxury: [
              { label: "Multi-color accent scheme", low: 950, high: 2600 },
              { label: "Premium elastomeric coating", low: 1800, high: 5200 }
            ],
            protection: [
              { label: "Full scrape & prime upgrade", low: 1200, high: 3800 },
              { label: "Lead-safe exterior paint protocol", low: 1500, high: 4500 }
            ],
            design: [
              { label: "Color consult with sample boards", low: 450, high: 950 }
            ],
            speed: [
              { label: "Lift / boom access", low: 1800, high: 5200 }
            ]
          }
        },
        deck: {
          title: "Deck / Patio",
          groups: {
            luxury: [
              { label: "Composite decking upgrade", low: 2800, high: 9800 },
              { label: "Cable or glass railing system", low: 2600, high: 8800 },
              { label: "Built-in benches", low: 1500, high: 4200 }
            ],
            protection: [
              { label: "Hidden fastener upgrade", low: 950, high: 2600 },
              { label: "Joist protection tape", low: 450, high: 1200 }
            ],
            design: [
              { label: "Picture-frame decking border", low: 900, high: 2600 },
              { label: "Pergola or shade structure", low: 2800, high: 9800 }
            ]
          }
        },
        fence: {
          title: "Fence Install",
          groups: {
            luxury: [
              { label: "Decorative aluminum or steel upgrade", low: 2200, high: 7800 },
              { label: "Automatic driveway gate prep", low: 2600, high: 8800 }
            ],
            protection: [
              { label: "Privacy height upgrade", low: 900, high: 2600 },
              { label: "Child / pet safety latch package", low: 350, high: 900 }
            ],
            design: [
              { label: "Decorative caps and trim boards", low: 450, high: 1200 },
              { label: "Lattice style upgrade", low: 1200, high: 3500 }
            ],
            speed: [
              { label: "Temporary safety fence", low: 450, high: 1200 }
            ]
          }
        },
        waterproofing: {
          title: "Waterproofing",
          groups: {
            luxury: [
              { label: "Battery backup sump system", low: 1800, high: 5200 }
            ],
            protection: [
              { label: "Interior drain tile system", low: 4800, high: 14800 },
              { label: "Full wall membrane upgrade", low: 2800, high: 9800 }
            ],
            design: [
              { label: "Finished wall panel system", low: 2600, high: 7800 }
            ]
          }
        },
        powerwash: {
          title: "Power Washing",
          groups: {
            luxury: [
              { label: "House + driveway + patio bundle", low: 450, high: 1600 }
            ],
            protection: [
              { label: "Soft-wash roof treatment", low: 650, high: 1900 }
            ],
            design: [
              { label: "Fence & rail cleaning upgrade", low: 250, high: 650 }
            ],
            maintenance: [
              { label: "Seasonal wash contract (2x/year)", low: 650, high: 1900 }
            ]
          }
        },
        sidewalk: {
          title: "Sidewalk / DOT",
          groups: {
            luxury: [
              { label: "Decorative broom or border finish", low: 650, high: 1900 }
            ],
            protection: [
              { label: "Extra thickness at tree/driveway", low: 900, high: 2600 },
              { label: "Root barrier installation", low: 1200, high: 3800 }
            ],
            design: [
              { label: "Scored control joint pattern", low: 450, high: 1200 }
            ],
            speed: [
              { label: "Phased pour scheduling", low: 450, high: 1200 }
            ]
          }
        },
        gutter: {
          title: "Gutters",
          groups: {
            luxury: [
              { label: "Seamless half-round / decorative", low: 1200, high: 3500 }
            ],
            protection: [
              { label: "Premium gutter guard system", low: 1500, high: 3800 },
              { label: "Additional downspouts", low: 450, high: 1200 }
            ],
            design: [
              { label: "Color-matched gutter & trim package", low: 450, high: 1200 }
            ],
            speed: [
              { label: "Same-day cleaning add-on", low: 250, high: 650 }
            ]
          }
        },
        painting: {
          title: "Interior Painting",
          groups: {
            luxury: [
              { label: "Accent wall / wallpaper install", low: 450, high: 1600 },
              { label: "Fine finish trim & door spray", low: 900, high: 2600 }
            ],
            protection: [
              { label: "Full skim coat upgrade", low: 1800, high: 5800 },
              { label: "Zero-VOC paint line", low: 650, high: 1900 }
            ],
            design: [
              { label: "Color consult with samples", low: 350, high: 900 }
            ],
            speed: [
              { label: "Night or weekend painting", low: 650, high: 1900 }
            ]
          }
        },
        flooring: {
          title: "Flooring",
          groups: {
            luxury: [
              { label: "Wide-plank or herringbone layout", low: 2200, high: 7800 },
              { label: "Heated floor rough-in", low: 1800, high: 5200 }
            ],
            protection: [
              { label: "Moisture barrier upgrade", low: 650, high: 1900 },
              { label: "Subfloor repair allowance", low: 900, high: 2600 }
            ],
            design: [
              { label: "Stair treads & nosing upgrade", low: 1200, high: 3800 }
            ],
            speed: [
              { label: "Room-by-room phased install", low: 450, high: 1200 }
            ]
          }
        },
        drywall: {
          title: "Drywall",
          groups: {
            luxury: [
              { label: "Level 5 finish on key walls", low: 1800, high: 5200 }
            ],
            protection: [
              { label: "Sound-damping board upgrade", low: 1500, high: 4800 },
              { label: "Mold-resistant board", low: 900, high: 2600 }
            ],
            design: [
              { label: "Simple ceiling design (tray/beams)", low: 2200, high: 7800 }
            ],
            speed: [
              { label: "Dust-reduced sanding upgrade", low: 650, high: 1900 }
            ]
          }
        },
        bathroom: {
          title: "Bathroom Remodel",
          groups: {
            luxury: [
              { label: "Full glass shower enclosure", low: 1800, high: 4200 },
              { label: "Heated floor system", low: 1800, high: 3200 },
              { label: "Rain head + handheld combo", low: 950, high: 2600 },
              { label: "Floating vanity build", low: 1500, high: 3800 }
            ],
            protection: [
              { label: "Waterproofing membrane upgrade", low: 1200, high: 3800 },
              { label: "Linear drain upgrade", low: 900, high: 2600 }
            ],
            design: [
              { label: "Large-format / Italian tile", low: 1800, high: 5200 },
              { label: "LED niche lighting", low: 650, high: 1900 }
            ],
            speed: [
              { label: "Fast-track bathroom", low: 1500, high: 4500 }
            ]
          }
        },
        kitchen: {
          title: "Kitchen Remodel",
          groups: {
            luxury: [
              { label: "Full height backsplash", low: 1800, high: 5200 },
              { label: "Waterfall island edge", low: 2800, high: 9800 },
              { label: "Pro-style appliance prep", low: 2200, high: 7800 }
            ],
            protection: [
              { label: "Under-cabinet lighting upgrade", low: 900, high: 2600 },
              { label: "Water leak sensor kit", low: 450, high: 1200 }
            ],
            design: [
              { label: "Glass or accent cabinet doors", low: 950, high: 2600 },
              { label: "Custom hood treatment", low: 2200, high: 6800 }
            ],
            speed: [
              { label: "Temporary sink setup", low: 650, high: 1900 }
            ]
          }
        },
        handyman: {
          title: "Handyman",
          groups: {
            luxury: [
              { label: "Priority same-week booking", low: 150, high: 450 }
            ],
            protection: [
              { label: "Safety package (grab bars)", low: 250, high: 750 }
            ],
            design: [
              { label: "Decor hardware refresh", low: 350, high: 900 }
            ],
            speed: [
              { label: "Evening/weekend window", low: 250, high: 650 }
            ]
          }
        }
      };

      // 2. BOROUGH / DISCOUNT CONFIG
      const BOROUGH_MODS = {
        "Manhattan": 1.18,
        "Brooklyn": 1.08,
        "Queens": 1.05,
        "Bronx": 1.03,
        "Staten Island": 1.0,
        "New Jersey": 0.96
      };

      const DISCOUNTS = {
        "VIP10": 0.10,
        "REFERRAL5": 0.05
      };

      const ADD_ON_PRICES = {
        "debrisRemoval": { low: 800, high: 1500 }
      };

      // 3. EXTERNAL LINKS (For new buttons)
      const CRM_FORM_URL = ""; 
      const WALKTHROUGH_URL = "";
      const PHONE_NUMBER = "9295955300"; // Used for Text & Call

      // 4. SERVICE DEFINITIONS (With NEW Size Presets)
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
            { label: "Small Patio (10x10)", val: 100 },
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
          ],
          sizePresets: [
            { label: "1-Car Spot (10x20)", val: 200 },
            { label: "2-Car Wide (20x20)", val: 400 },
            { label: "Long Driveway (50ft)", val: 500 }
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
          ],
          sizePresets: [
            { label: "Garage Roof", val: 300 },
            { label: "Rowhouse / Brownstone", val: 900 },
            { label: "Detached Home", val: 1600 }
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
          ],
          sizePresets: [
            { label: "Powder Room", val: 60 },
            { label: "Standard Bedroom (12x12)", val: 144 },
            { label: "Master Suite", val: 300 },
            { label: "Living/Dining Area", val: 500 },
            { label: "Whole Apartment (1 Bed)", val: 750 }
          ]
        },
        "exterior_paint": {
          label: "Exterior Painting", emoji: "🖌", unit: "sq ft",
          baseLow: 2.5, baseHigh: 5.5, min: 3500,
          subQuestion: "Surface condition?",
          options: [
            { label: "Good Condition", factor: 1.0 },
            { label: "Peeling / Prep Needed", factor: 1.4 },
            { label: "Heavy Prep / Repairs", factor: 1.8 }
          ],
          sizePresets: [
            { label: "Garage Front", val: 200 },
            { label: "Small Facade (Rowhome)", val: 400 },
            { label: "Full Detached House", val: 2500 }
          ]
        },
        "basement_floor": {
          label: "Basement Floor Paint / Epoxy", emoji: "🧼", unit: "sq ft",
          baseLow: 2.8, baseHigh: 5.5, min: 1200,
          subQuestion: "Floor type?",
          options: [
            { label: "1-Part Epoxy Paint", factor: 1.0 },
            { label: "2-Part Epoxy (Thick Coat)", factor: 1.6 },
            { label: "Flake System", factor: 2.1 }
          ],
          sizePresets: [
            { label: "Small Utility Room", val: 150 },
            { label: "Standard Basement (20x25)", val: 500 },
            { label: "Large Full Basement", val: 900 }
          ]
        },
        "fence": {
          label: "Fence Install", emoji: "🚧", unit: "linear ft",
          baseLow: 30, baseHigh: 75, min: 1800,
          subQuestion: "Fence type?",
          options: [
            { label: "Wood", factor: 1.0 },
            { label: "PVC", factor: 1.6 },
            { label: "Chain-Link", factor: 0.9 },
            { label: "Aluminum", factor: 2.0 }
          ],
          sizePresets: [
            { label: "Back Line Only (20ft)", val: 20 },
            { label: "Small Yard (3 sides)", val: 100 },
            { label: "Large Perimeter", val: 200 }
          ]
        },
        "deck": {
          label: "Deck / Porch Build", emoji: "🪵", unit: "sq ft",
          baseLow: 35, baseHigh: 65, min: 5000,
          subQuestion: "Deck material?",
          options: [
            { label: "Pressure Treated", factor: 1.0 },
            { label: "Composite (Trex)", factor: 1.9 },
            { label: "PVC Luxury", factor: 2.4 }
          ],
          sizePresets: [
            { label: "Small Landing (4x4)", val: 16 },
            { label: "Bistro Deck (8x10)", val: 80 },
            { label: "Entertainer Deck (16x20)", val: 320 }
          ]
        },
        "drywall": {
          label: "Drywall Install / Repair", emoji: "📐", unit: "sq ft",
          baseLow: 3.2, baseHigh: 6.5, min: 750,
          subQuestion: "Scope?",
          options: [
            { label: "Minor Repairs", factor: 1.0 },
            { label: "Full Install", factor: 1.6 },
            { label: "Level 5 Finish", factor: 2.1 }
          ],
          sizePresets: [
            { label: "Patch & Repair", val: 50 },
            { label: "One Wall", val: 120 },
            { label: "Whole Room", val: 500 }
          ]
        },
        "flooring": {
          label: "Flooring Installation", emoji: "🪚", unit: "sq ft",
          baseLow: 3.5, baseHigh: 9.5, min: 2500,
          subQuestion: "Flooring type?",
          options: [
            { label: "Vinyl Plank", factor: 1.0 },
            { label: "Tile", factor: 1.8 },
            { label: "Hardwood", factor: 2.4 },
            { label: "Laminate", factor: 1.2 }
          ],
          sizePresets: [
            { label: "Hallway / Foyer", val: 80 },
            { label: "Bedroom", val: 150 },
            { label: "Living Room", val: 300 }
          ]
        },
        "powerwash": {
          label: "Power Washing", emoji: "💦", unit: "sq ft",
          baseLow: 0.35, baseHigh: 0.85, min: 250,
          sizePresets: [
            { label: "Deck / Patio Only", val: 300 },
            { label: "Siding (One Side)", val: 500 },
            { label: "Whole House", val: 2000 }
          ]
        },
        "gutter": {
          label: "Gutter Install", emoji: "🩸", unit: "linear ft",
          baseLow: 15, baseHigh: 35, min: 1200,
          subQuestion: "Type?",
          options: [
            { label: "Aluminum", factor: 1.0 },
            { label: "Seamless", factor: 1.4 },
            { label: "Copper", factor: 3.5 }
          ],
          sizePresets: [
            { label: "Front Only", val: 25 },
            { label: "Front & Back", val: 50 },
            { label: "Whole House", val: 120 }
          ]
        },
        "windows": {
          label: "Windows Install", emoji: "🪟", unit: "fixed",
          subQuestion: "Window type?",
          options: [
            { label: "Standard Vinyl", fixedLow: 550, fixedHigh: 850 },
            { label: "Double Hung Premium", fixedLow: 850, fixedHigh: 1400 },
            { label: "Bay/Bow Window", fixedLow: 3500, fixedHigh: 6500 }
          ]
        },
        "doors": {
          label: "Door Installation", emoji: "🚪", unit: "fixed",
          subQuestion: "Door type?",
          options: [
            { label: "Interior", fixedLow: 250, fixedHigh: 550 },
            { label: "Exterior Steel / Fiberglass", fixedLow: 950, fixedHigh: 1800 },
            { label: "Sliding Patio", fixedLow: 2200, fixedHigh: 4200 }
          ]
        },
        "demo": {
          label: "Demolition", emoji: "💥", unit: "sq ft",
          baseLow: 3.0, baseHigh: 7.5, min: 900,
          subQuestion: "Material?", leadSensitive: true,
          options: [
            { label: "Drywall", factor: 1.0 },
            { label: "Tile / Bathroom Demo", factor: 1.8 },
            { label: "Concrete Demo", factor: 2.4 }
          ]
        },
        "retaining": {
          label: "Retaining Wall", emoji: "🧱", unit: "linear ft",
          baseLow: 60, baseHigh: 140, min: 5500,
          subQuestion: "Material?",
          options: [
            { label: "CMU Block", factor: 1.0 },
            { label: "Poured Concrete", factor: 1.7 },
            { label: "Stone Veneer", factor: 2.3 }
          ]
        },
        "handyman": {
          label: "Small Repairs / Handyman", emoji: "🛠", unit: "consult"
        },
        "kitchen": {
          label: "Kitchen Remodel", emoji: "🍳", unit: "fixed",
          subQuestion: "What is the scope?",
          options: [
            { label: "Refresh (Cosmetic)", fixedLow: 18000, fixedHigh: 30000 },
            { label: "Mid-Range (Cabinets+)", fixedLow: 30000, fixedHigh: 55000 },
            { label: "Full Gut / Luxury", fixedLow: 55000, fixedHigh: 110000 }
          ],
          leadSensitive: true
        },
        "bathroom": {
          label: "Bathroom Remodel", emoji: "🚿", unit: "fixed",
          subQuestion: "What is the scope?",
          options: [
            { label: "Update (Fixtures/Tile)", fixedLow: 14000, fixedHigh: 24000 },
            { label: "Full Gut / Redo", fixedLow: 24000, fixedHigh: 45000 }
          ],
          leadSensitive: true
        },
        "siding": {
          label: "Siding Installation", emoji: "🏡", unit: "sq ft",
          baseLow: 8.5, baseHigh: 18.5, min: 4000,
          subQuestion: "Siding Material?",
          options: [
            { label: "Vinyl", factor: 1.0 },
            { label: "Wood/Cedar Shake", factor: 1.8 },
            { label: "Fiber Cement (Hardie)", factor: 1.5 }
          ],
          sizePresets: [
            { label: "One Wall / Repair", val: 300 },
            { label: "Small Home", val: 1200 },
            { label: "Large Home", val: 2500 }
          ]
        },
        "chimney": {
          label: "Chimney Repair / Rebuild", emoji: "🔥", unit: "fixed",
          subQuestion: "Scope of work?",
          options: [
            { label: "Cap / Flashing Repair", fixedLow: 800, fixedHigh: 1800 },
            { label: "Partial Rebuild (Above roofline)", fixedLow: 3000, fixedHigh: 6500 },
            { label: "Full Masonry Rebuild", fixedLow: 6500, fixedHigh: 12000 }
          ]
        },
        "insulation": {
          label: "Insulation Install", emoji: "🌡️", unit: "sq ft",
          baseLow: 1.2, baseHigh: 3.5, min: 1000,
          subQuestion: "Insulation type?",
          options: [
            { label: "Fiberglass Batts", factor: 1.0 },
            { label: "Blown-in Cellulose", factor: 1.2 },
            { label: "Spray Foam (Closed-Cell)", factor: 2.5 }
          ]
        },
        "sidewalk": {
          label: "Sidewalk, Steps, & Stoops", emoji: "🚶", unit: "fixed",
          subQuestion: "Scope of work?",
          options: [
            { label: "Sidewalk Violation Repair", fixedLow: 3500, fixedHigh: 7500 },
            { label: "Front Steps / Stoop Rebuild", fixedLow: 6000, fixedHigh: 15000 },
            { label: "New Paver Walkway", fixedLow: 45, fixedHigh: 85, isPerSqFt: true }
          ]
        },
        "electrical": {
          label: "Electrical / Wiring", emoji: "⚡", unit: "fixed",
          subQuestion: "What is needed?",
          options: [
            { label: "Panel Upgrade (200A)", fixedLow: 3000, fixedHigh: 5500 },
            { label: "New Outlet/Switch Run (per unit)", fixedLow: 250, fixedHigh: 450 },
            { label: "Recessed Lighting Install (per unit)", fixedLow: 180, fixedHigh: 300 }
          ]
        },
        "waterproofing": {
          label: "Waterproofing / Leak Repair", emoji: "💧", unit: "linear ft",
          baseLow: 40, baseHigh: 90, min: 2500,
          subQuestion: "Location of leak?",
          options: [
            { label: "Exterior Foundation", factor: 1.0 },
            { label: "Basement Interior", factor: 1.5 },
            { label: "Roof/Flashing (Requires inspection)", factor: 1.8 }
          ]
        },
        "other": {
          label: "Other / Custom", emoji: "📋", unit: "consult"
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
        pricingMode: "full",
        isRush: false,
        promoCode: "",
        debrisRemoval: false,
        selectedAddons: [], 
        name: "",
        phone: "",
        projects: []
      };

      let els = {};

      // --- INIT ---------------------------------------------------

      function init() {
        console.log("HB Chat: Initializing v6.0...");
        createInterface();

        if (sessionStorage.getItem("hb_chat_active") === "true") {
          toggleChat();
        }
        setTimeout(stepOne_Disclaimer, 800);
      }

      function createInterface() {
        const fab = document.createElement("div");
        fab.className = "hb-chat-fab";
        fab.innerHTML = `<span class="hb-fab-icon">📷</span><span class="hb-fab-text">Get Quote</span>`;
        fab.style.display = "flex";
        fab.onclick = toggleChat;
        document.body.appendChild(fab);

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
        updateProgress(5);
        addBotMessage("👋 Hi! I can generate a ballpark estimate for your project instantly.");

        const disclaimerText = `
            Before we begin, please review our **Disclaimer of Service**:
            This tool provides an **automated ballpark range only**. It is not a formal quote or contract. Final pricing may change based on in-person inspection and site conditions. **By continuing, you acknowledge this.**
        `;
        setTimeout(() => {
            addBotMessage(disclaimerText, true);
            addChoices([
                { label: "✅ I Agree to the Disclaimer", key: "agree" },
                { label: "❌ Close Chat", key: "exit" }
            ], function(choice) {
                if (choice.key === "agree") {
                    addBotMessage("Great! What type of project are you planning?");
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
            state.isLeadHome = !!(ans && ans.indexOf("Yes") !== -1);
            stepFour_Size();
          });
        } else {
          stepFour_Size();
        }
      }

      // --- STEP FOUR: SIZE (UPDATED WITH SIZE PRESETS) ---------------------

      function stepFour_Size() {
        updateProgress(50);
        const svc = SERVICES[state.serviceKey];
        const sub = state.subOption || {};
        if (!svc) return;

        if (svc.unit === "consult" || state.serviceKey === "other") {
          stepFive_Location();
          return;
        }

        if (svc.unit !== "fixed" || sub.isPerSqFt) {
          const unitLabel = sub.isPerSqFt ? "sq ft" : svc.unit;
          
          // Check for Size Presets
          if (svc.sizePresets && svc.sizePresets.length > 0) {
            addBotMessage(`Choose a common size, or type exact ${unitLabel} below:`);
            
            // Add Presets as choices
            const presetChoices = svc.sizePresets.map(p => ({ label: p.label, val: p.val }));
            
            addChoices(presetChoices, function(choice) {
                state.size = choice.val;
                addBotMessage(`Selected: ${choice.val} ${unitLabel}`);
                setTimeout(stepFive_Location, 500);
            });
            
            // Also enable manual input in parallel (using a slight delay so choices render first)
            setTimeout(() => {
                enableInput(function(val) {
                  const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
                  if (!num || num < 10) {
                    addBotMessage("That number seems low. Please enter a valid number (e.g. 500).");
                    // re-trigger manual input
                    // Note: re-triggering size step recursively might duplicate buttons, 
                    // so we just call enableInput again here.
                    stepFour_Size(); 
                  } else {
                    state.size = num;
                    stepFive_Location();
                  }
                });
            }, 1700);

          } else {
            // Fallback to manual only
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
        updateProgress(70);
        addBotMessage("Which borough/area is this in?");
        const locs = Object.keys(BOROUGH_MODS);
        addChoices(locs, function(loc) {
          state.borough = (typeof loc === "string") ? loc : loc.label;
          stepSix_PricingMode();
        });
      }

      function stepSix_PricingMode() {
        updateProgress(78);
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
        updateProgress(82);
        addBotMessage("Is this a rush project (starting within 72 hours)?");
        addChoices(["Yes, rush", "No"], function(ans) {
          state.isRush = !!(ans && ans.indexOf("Yes") !== -1);
          stepEight_Promo();
        });
      }

      function stepEight_Promo() {
        updateProgress(86);
        addBotMessage("Any promo code today? If not, tap 'No Code'.");
        addChoices([
          { label: "No Code", code: "" },
          { label: "VIP10", code: "VIP10" },
          { label: "REFERRAL5", code: "REFERRAL5" }
        ], function(choice) {
          state.promoCode = choice.code || "";
          stepNine_DebrisRemoval();
        });
      }

      function stepNine_DebrisRemoval() {
        updateProgress(88);
        const svc = SERVICES[state.serviceKey];
        const hasPrice = svc && svc.unit !== "consult" && state.serviceKey !== "other";

        if (hasPrice) {
            addBotMessage("Should we include debris removal & dumpster costs? (Typically +$800–$1,500)");
            addChoices(["Yes, include debris removal", "No, I'll handle debris"], function(ans) {
                state.debrisRemoval = !!(ans && ans.indexOf("Yes") !== -1);
                stepTen_SmartAddonsIntro();
            });
        } else {
            state.debrisRemoval = false;
            stepTen_SmartAddonsIntro();
        }
      }

      // --- SMART ADD-ONS ----------------

      function stepTen_SmartAddonsIntro() {
        updateProgress(90);
        const config = SMART_ADDONS_CONFIG[state.serviceKey];
        
        // Only proceed if there are configured add-ons for this service
        if (config && config.groups) {
          addBotMessage(`I found optional **Smart Add-ons** for ${config.title}. Would you like to view categories like Luxury Upgrades or Protection?`);
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
        // List available groups
        const groups = Object.keys(config.groups).map(key => ({
          label: `📂 ${SMART_ADDON_GROUP_LABELS[key] || key}`,
          key: key
        }));

        // Add a Done button
        groups.push({ label: "✅ Done Selecting", key: "done" });

        addBotMessage("Select a category to view upgrades:", false);
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

        // Filter out already selected items to prevent duplicates
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

        // Add back button
        availableItems.push({ label: "🔙 Back to Categories", isBack: true });

        addBotMessage(`**${groupLabel} Options:** Tap to add.`);
        addChoices(availableItems, function(choice) {
          if (choice.isBack) {
            showAddonCategories(config);
          } else {
            // Add item
            state.selectedAddons.push({
              ...choice.itemData,
              group: choice.group
            });
            addBotMessage(`✅ Added: **${choice.itemData.label}**`);
            // Return to categories to allow jumping around
            setTimeout(() => showAddonCategories(config), 600);
          }
        });
      }

      function finishCalculation() {
        const est = computeEstimateForCurrent();
        showEstimateAndAskAnother(est);
      }

      // --- CALCULATION ENGINE ------------------------------------

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

        let dc = 0;
        if (state.promoCode) {
          const rate = DISCOUNTS[state.promoCode.toUpperCase()];
          if (rate) dc = rate;
        }
        if (dc > 0) {
          low *= (1 - dc);
          high *= (1 - dc);
        }

        return { low, high, discountRate: dc };
      }

      function computeEstimateForCurrent() {
        const svc = SERVICES[state.serviceKey];
        if (!svc) return null;

        const sub = state.subOption || {};
        const mod = BOROUGH_MODS[state.borough] || 1.0;
        let low = 0, high = 0;

        // Base Calculation
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

        if (state.isLeadHome) { low *= 1.10; high *= 1.10; }

        const adjusted = applyPriceModifiers(low, high);
        
        // Add Smart Add-ons totals
        let addonLow = 0, addonHigh = 0;
        state.selectedAddons.forEach(addon => {
            addonLow += addon.low;
            addonHigh += addon.high;
        });

        // Final sums
        const finalLow = adjusted.low + addonLow;
        const finalHigh = adjusted.high + addonHigh;

        return {
          svc, sub, borough: state.borough,
          size: (svc.unit === "fixed" && !sub.isPerSqFt || svc.unit === "consult") ? null : state.size,
          isLeadHome: state.isLeadHome, pricingMode: state.pricingMode, isRush: state.isRush,
          promoCode: state.promoCode, 
          low: finalLow, high: finalHigh,
          discountRate: adjusted.discountRate, 
          isCustom: (low === 0 && high === 0),
          debrisRemoval: state.debrisRemoval,
          selectedAddons: [...state.selectedAddons] // Copy
        };
      }

      function computeGrandTotal() {
        let totalLow = 0, totalHigh = 0;

        state.projects.forEach(p => {
            if (p.low) totalLow += p.low;
            if (p.high) totalHigh += p.high;
        });

        const projectRequiresDebris = state.projects.some(p => p.debrisRemoval === true);
        if (projectRequiresDebris) {
            totalLow += ADD_ON_PRICES.debrisRemoval.low;
            totalHigh += ADD_ON_PRICES.debrisRemoval.high;
        }

        return { totalLow, totalHigh, projectRequiresDebris };
      }

      function buildEstimateHtml(est) {
        const svc = est.svc;
        const sub = est.sub || {};
        const hasPrice = !!(est.low && est.high);
        const fLow = hasPrice ? Math.round(est.low).toLocaleString() : null;
        const fHigh = hasPrice ? Math.round(est.high).toLocaleString() : null;

        let discountLine = "";
        if (est.discountRate > 0) {
          discountLine = `<div class="hb-receipt-row"><span>Promo:</span><span>-${Math.round(est.discountRate * 100)}% applied</span></div>`;
        }

        let rushLine = est.isRush ? `<div class="hb-receipt-row"><span>Rush:</span><span>Priority scheduling included</span></div>` : "";
        let debrisLine = est.debrisRemoval ? `<div class="hb-receipt-row" style="color:#0a9"><span>Debris:</span><span>Haul-away **included**</span></div>` : "";

        let modeLabel = "Full (Labor + Materials)";
        if (est.pricingMode === "labor") modeLabel = "Labor Only";
        if (est.pricingMode === "materials") modeLabel = "Materials + Light Help";

        let sizeRow = "";
        if (est.size) {
          const unitLabel = sub.isPerSqFt ? "sq ft" : svc.unit;
          sizeRow = `<div class="hb-receipt-row"><span>Size:</span><span>${est.size} ${unitLabel}</span></div>`;
        }

        // Build Add-on List
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
            <h4>Estimator Summary</h4>
            <div class="hb-receipt-row"><span>Service:</span><span>${svc.label}</span></div>
            <div class="hb-receipt-row"><span>Type:</span><span>${sub.label || "Standard"}</span></div>
            <div class="hb-receipt-row"><span>Area:</span><span>${est.borough || "N/A"}</span></div>
            ${sizeRow}
            <div class="hb-receipt-row"><span>Pricing Mode:</span><span>${modeLabel}</span></div>
            ${rushLine}
            ${debrisLine}
            ${addonsHtml}
            ${discountLine}
            ${priceRow}
            <div class="hb-receipt-footer hb-disclaimer">
              <strong>Disclaimer:</strong> This tool provides an automated ballpark range only. Final pricing may change based on site conditions.
            </div>
          </div>
        `;
      }

      function showEstimateAndAskAnother(est) {
        if (!est) return;
        updateProgress(92);
        const html = '--- **Project Estimate** ---<br>' + buildEstimateHtml(est);
        addBotMessage(html, true);
        setTimeout(() => askAddAnother(est), 1200);
      }

      function askAddAnother(est) {
        state.projects.push(est);
        updateProgress(94);
        addBotMessage("Would you like to add another project to this estimate?");
        addChoices([
            { label: "➕ Add Another Project", key: "yes" },
            { label: "No, continue", key: "no" }
          ], function(choice) {
            if (choice.key === "yes") {
              resetProjectState();
              addBotMessage("Great! What type of project is the next one?");
              presentServiceOptions();
            } else {
              showCombinedReceiptAndLeadCapture();
            }
          });
      }

      function showCombinedReceiptAndLeadCapture() {
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
            debrisRow = `<div class="hb-receipt-row" style="color:#0a9; font-weight:700;"><span>Debris Removal:</span><span>$${Math.round(ADD_ON_PRICES.debrisRemoval.low).toLocaleString()} – $${Math.round(ADD_ON_PRICES.debrisRemoval.high).toLocaleString()}</span></div>`;
        }

        let totalRow = (totals.totalLow && totals.totalHigh) 
          ? `<div class="hb-receipt-total"><span>Combined Total Range:</span><span>$${Math.round(totals.totalLow).toLocaleString()} – $${Math.round(totals.totalHigh).toLocaleString()}</span></div>`
          : "";

        const html = `
          <div class="hb-receipt">
            <h4>Combined Estimate Summary</h4>
            ${rowsHtml}
            ${debrisRow}
            ${totalRow}
            <div class="hb-receipt-footer">Ask about VIP Home Care memberships & referral rewards.</div>
          </div>`;

        addBotMessage('--- **Combined Estimate** ---<br>' + html, true);
        setTimeout(() => showLeadCapture("To lock in this estimate, I can text or email you the details."), 1200);
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
        state.selectedAddons = []; // Reset selected add-ons
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

        let lines = [`Hello, I'm ${state.name}.`, "Projects:"];
        if (state.projects && state.projects.length) {
          state.projects.forEach((p, idx) => {
            const unitLabel = p.sub.isPerSqFt ? "sq ft" : p.svc.unit;
            let line = `${idx + 1}. ${p.svc.label}` + (p.size ? ` — ${p.size} ${unitLabel}` : "") + (p.borough ? ` (${p.borough})` : "");
            
            if (p.low && p.high) {
              line += ` — ~$${Math.round(p.low).toLocaleString()}–$${Math.round(p.high).toLocaleString()}`;
            } else {
              line += " (walkthrough needed)";
            }
            lines.push(line);

            // Add detailed breakdown line
            let extras = [];
            if (p.pricingMode !== "full") extras.push(p.pricingMode);
            if (p.isRush) extras.push("Rush");
            if (p.promoCode) extras.push(`Promo: ${p.promoCode}`);
            if (p.debrisRemoval) extras.push("Debris: Included");
            
            if (extras.length) lines.push("   [" + extras.join(" | ") + "]");

            // List smart add-ons
            if (p.selectedAddons && p.selectedAddons.length) {
                 p.selectedAddons.forEach(addon => {
                     lines.push(`   + Add-on: ${addon.label}`);
                 });
            }
          });

          const totals = computeGrandTotal();
          if (totals.projectRequiresDebris) {
              lines.push(`Add-on: Debris Removal (~$${Math.round(ADD_ON_PRICES.debrisRemoval.low).toLocaleString()})`);
          }
          if (totals.totalLow) {
              lines.push(`\nCOMBINED RANGE: $${Math.round(totals.totalLow).toLocaleString()} – $${Math.round(totals.totalHigh).toLocaleString()}`);
          }
        }

        lines.push(`Customer Name: ${state.name}`);
        lines.push(`Phone: ${state.phone}`);
        lines.push("Please reply to schedule a walkthrough.");

        const body = encodeURIComponent(lines.join("\n"));
        const smsLink = "sms:" + PHONE_NUMBER + "?&body=" + body;
        const emailLink = "mailto:hammerbrickhome@gmail.com?subject=" + encodeURIComponent("Estimate Request") + "&body=" + body;

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

          // 1. Send Estimate Texts
          createBtn("📲 Text Estimate to Hammer Brick & Home", smsLink, true, false);
          createBtn("✉️ Email Estimate to Hammer Brick & Home", emailLink, true, false);
          
          // 2. Direct Contact Buttons (New Request)
          // "tel:" link for calling
          createBtn("📞 Call Hammer Brick & Home", "tel:" + PHONE_NUMBER, false, true);
          
          // 3. Other Links
          if (CRM_FORM_URL) createBtn("📝 Complete Full Intake Form", CRM_FORM_URL, false, false);
          if (WALKTHROUGH_URL) createBtn("📅 Book a Walkthrough", WALKTHROUGH_URL, false, false);

          const photoBtn = document.createElement("button");
          photoBtn.className = "hb-chip";
          photoBtn.style.display = "block";
          photoBtn.style.marginTop = "8px";
          photoBtn.textContent = "📷 Add Photos";
          photoBtn.onclick = () => { if (els.photoInput) els.photoInput.click(); };
          els.body.appendChild(photoBtn);

          els.body.scrollTop = els.body.scrollHeight;
        }, 500);
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
  </script>
</body>
</html>
