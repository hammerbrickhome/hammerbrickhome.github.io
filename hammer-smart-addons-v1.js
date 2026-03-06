/* ============================================================
   SMART ADD-ONS — Hammer Brick & Home LLC
   Option C — Full Breakdown by Service + Category
   DOES NOT REMOVE OR REPLACE YOUR EXISTING FUNCTIONS
=============================================================== */

/* -----------------------------------
   CONFIG — Add-ons for each service
   Groups:
   - luxury      → Luxury Upgrades
   - protection  → Protection & Safety
   - design      → Design Enhancements
   - speed       → Speed / Convenience
   - maintenance → Maintenance Items
----------------------------------- */
const SMART_ADDONS_CONFIG = {
  masonry: {
    title: "Masonry · Pavers · Concrete",
    groups: {
      luxury: [
        { label: "Premium border band with contrasting pavers", low: 900, high: 2200, note: "Adds a designer frame to walkways, patios, or driveways." },
        { label: "Decorative inlays or medallion pattern", low: 850, high: 2600, note: "Custom shapes, logos, or patterns for higher curb appeal." },
        { label: "Raised seating wall or planter", low: 1800, high: 4800, note: "Creates a built-in sitting or planting area along the patio or yard." },
        { label: "Outdoor kitchen prep pad (gas/electric ready)", low: 2200, high: 6800, note: "Reinforced pad and rough-in for a future outdoor kitchen or bar." }
      ],
      protection: [
        { label: "Full base compaction upgrade", low: 850, high: 2200, note: "Extra gravel, compaction, and geotextile for longer-lasting work." },
        { label: "Perimeter drain or channel drain", low: 950, high: 2600, note: "Helps move water away from the house, steps, or driveway." },
        { label: "Concrete edge restraint / curb", low: 650, high: 1600, note: "Keeps pavers locked in and reduces shifting or spreading." }
      ],
      design: [
        { label: "Color upgrade / multi-blend pavers", low: 650, high: 1900, note: "Premium color ranges and blends beyond standard stock options." },
        { label: "Large-format or European-style pavers", low: 1500, high: 5200, note: "Modern oversized pavers with tighter joints and clean lines." },
        { label: "Step face stone veneer upgrade", low: 1100, high: 3600, note: "Applies stone veneer to exposed step faces and risers." }
      ],
      speed: [
        { label: "Weekend or off-hours install (where allowed)", low: 850, high: 2600, note: "Adds extra crew or overtime to speed up completion." },
        { label: "Phased work scheduling", low: 450, high: 1200, note: "Plan project in phases so driveways and entries stay usable." }
      ],
      maintenance: [
        { label: "Polymeric sand refill & joint tightening", low: 250, high: 650, note: "Refreshes joints, reduces weeds, and tightens pavers." },
        { label: "Clean & seal package (pavers or concrete)", low: 450, high: 1800, note: "Helps protect color and surface from stains and salt." },
        { label: "Annual inspection & touch-up visit", low: 350, high: 900, note: "Check joints, sunken areas, and step safety once per year." }
      ]
    }
  },

  driveway: {
    title: "Driveway / Parking Area",
    groups: {
      luxury: [
        { label: "Decorative apron or entry pattern", low: 900, high: 2800, note: "Stamped or paver apron where driveway meets street or sidewalk." },
        { label: "Heated driveway rough-in (conduit only)", low: 2800, high: 7800, note: "Prep for a future heated driveway system where allowed." },
        { label: "Integrated lighting at edges", low: 950, high: 2600, note: "Low-voltage lighting along driveway edges or retaining walls." }
      ],
      protection: [
        { label: "Thicker base / driveway reinforcement", low: 1200, high: 3500, note: "Upgraded gravel and reinforcement for heavy vehicles." },
        { label: "Drain basin or trench drain at garage", low: 950, high: 2600, note: "Helps prevent water from entering garage or basement." }
      ],
      design: [
        { label: "Two-tone driveway with borders", low: 1500, high: 4200, note: "Main field color plus contrasting border or tire track bands." },
        { label: "Stamped concrete pattern upgrade", low: 1800, high: 5200, note: "Simulates stone, slate, or brick with colored stamp patterns." }
      ],
      speed: [
        { label: "Temporary parking pad during work", low: 650, high: 1600, note: "Gravel pad or temporary area while main driveway is closed." }
      ],
      maintenance: [
        { label: "Sealcoat package (asphalt)", low: 450, high: 900, note: "Protects asphalt finish and slows down wear." },
        { label: "First-year checkup & joint touch-up", low: 350, high: 900, note: "Inspect for settlement, cracking, and proper drainage after winter." }
      ]
    }
  },

  roofing: {
    title: "Roofing – Shingle / Flat",
    groups: {
      luxury: [
        { label: "Architectural or designer shingle upgrade", low: 1800, high: 5200, note: "Heavier, dimensional shingles with longer warranties." },
        { label: "Decorative metal accent roofing", low: 2200, high: 7800, note: "Metal panels at dormers, porches, or entry roofs." }
      ],
      protection: [
        { label: "Full ice & water shield upgrade", low: 1500, high: 4200, note: "Enhances leak protection in valleys and eave areas." },
        { label: "High-performance synthetic underlayment", low: 650, high: 1900, note: "Replaces standard felt for better water resistance." },
        { label: "Premium flashing & chimney reflashing", low: 900, high: 2600, note: "Extra attention around chimneys, skylights, and walls." }
      ],
      design: [
        { label: "Color-matched drip edge & accessories", low: 450, high: 1200, note: "Coordinates trims and vents with shingle color." },
        { label: "Decorative ridge cap upgrade", low: 650, high: 1600, note: "Thicker ridge caps with enhanced visual profile." }
      ],
      speed: [
        { label: "One-day tear-off & install (where feasible)", low: 1500, high: 4500, note: "Extra crew to try completing standard roof in one day." }
      ],
      maintenance: [
        { label: "Annual roof inspection & tune-up", low: 350, high: 900, note: "Check flashing, sealants, small nail pops, and ventilation." },
        { label: "Gutter cleaning added to roof project", low: 250, high: 650, note: "Clean gutters and downspouts while roof is being replaced." }
      ]
    }
  },

  siding: {
    title: "Siding – Exterior",
    groups: {
      luxury: [
        { label: "Stone or brick accent wall", low: 3500, high: 9800, note: "Upgrades one key wall or entry area with masonry veneer." },
        { label: "Board-and-batten or mixed cladding look", low: 2200, high: 6800, note: "Mixes textures for a custom exterior design." }
      ],
      protection: [
        { label: "Full house wrap / moisture barrier upgrade", low: 950, high: 2800, note: "Improves moisture protection behind siding." },
        { label: "Flashing and sill pan upgrade at windows", low: 900, high: 2600, note: "Reduces risk of water intrusion at openings." }
      ],
      design: [
        { label: "Premium color or insulated siding line", low: 2600, high: 7800, note: "Higher-end siding with richer colors or built-in insulation." },
        { label: "Decorative trim and crown details", low: 1500, high: 4200, note: "Custom trims around windows, doors, and corners." }
      ],
      speed: [
        { label: "Staged / phased install by elevation", low: 450, high: 1200, note: "Work in phases so parts of home stay less impacted." }
      ],
      maintenance: [
        { label: "Annual siding wash & inspection", low: 350, high: 900, note: "Light wash plus caulk and joint inspection once per year." }
      ]
    }
  },

  windows: {
    title: "Windows & Exterior Doors",
    groups: {
      luxury: [
        { label: "Black or color-exterior window upgrade", low: 2200, high: 6800, note: "Modern color exteriors versus standard white." },
        { label: "Sliding or French patio door upgrade", low: 2800, high: 7800, note: "Larger glass opening with upgraded hardware." }
      ],
      protection: [
        { label: "Impact-resistant / laminated glass (where available)", low: 2600, high: 7800, note: "Stronger glass for added security and storm resistance." },
        { label: "Storm door package", low: 650, high: 1800, note: "Adds protection and ventilation to main entries." }
      ],
      design: [
        { label: "Grids / divided lite pattern upgrade", low: 450, high: 1600, note: "Adds colonial, prairie, or custom grid patterns." },
        { label: "Interior casing & stool upgrade", low: 750, high: 2600, note: "Enhances the inside trim look at each window." }
      ],
      speed: [
        { label: "Same-day glass removal & board-up", low: 450, high: 1200, note: "Temporary board-up solution if needed during changeout." }
      ],
      maintenance: [
        { label: "Hardware adjustment & weather-strip tune-up", low: 250, high: 650, note: "Adjusts locks, tilt latches, and seals after first season." }
      ]
    }
  },

  "exterior-paint": {
    title: "Exterior Facade / Painting",
    groups: {
      luxury: [
        { label: "Multi-color accent scheme", low: 950, high: 2600, note: "Adds accent colors for doors, shutters, and trims." },
        { label: "Premium elastomeric or masonry coating", low: 1800, high: 5200, note: "Higher build coatings for stucco or masonry facades." }
      ],
      protection: [
        { label: "Full scrape & prime upgrade", low: 1200, high: 3800, note: "Deeper prep for peeling or chalky surfaces." },
        { label: "Lead-safe exterior paint protocol", low: 1500, high: 4500, note: "Adds EPA-required protection when lead may be present." }
      ],
      design: [
        { label: "Color consult with sample boards", low: 450, high: 950, note: "Helps finalize color palette before painting." }
      ],
      speed: [
        { label: "Lift / boom access where allowed", low: 1800, high: 5200, note: "Speeds up high-work areas versus ladders only." }
      ],
      maintenance: [
        { label: "Touch-up visit within 12 months", low: 350, high: 900, note: "Includes minor nicks, scuffs, and caulk cracks." }
      ]
    }
  },

  deck: {
    title: "Deck / Patio Build or Rebuild",
    groups: {
      luxury: [
        { label: "Composite decking upgrade", low: 2800, high: 9800, note: "Low-maintenance composite in place of pressure-treated wood." },
        { label: "Cable or glass railing system", low: 2600, high: 8800, note: "Modern railing with more open views." },
        { label: "Built-in benches or storage boxes", low: 1500, high: 4200, note: "Adds storage or lounge seating to deck corners." }
      ],
      protection: [
        { label: "Hidden fastener upgrade", low: 950, high: 2600, note: "Reduces visible screw heads and splinters at feet." },
        { label: "Joist and post protection tape", low: 450, high: 1200, note: "Extends life of framing members." }
      ],
      design: [
        { label: "Picture-frame decking border", low: 900, high: 2600, note: "Outlines deck edges with contrasting boards." },
        { label: "Pergola or shade structure", low: 2800, high: 9800, note: "Adds a shaded area for seating or dining." }
      ],
      speed: [
        { label: "Temporary steps or access during build", low: 450, high: 1200, note: "Keeps safe access to yard while deck is rebuilt." }
      ],
      maintenance: [
        { label: "Clean & seal package (wood decks)", low: 550, high: 1600, note: "Protects wood color and grain from weathering." }
      ]
    }
  },

  fence: {
    title: "Fence Install / Replacement",
    groups: {
      luxury: [
        { label: "Decorative aluminum or steel upgrade", low: 2200, high: 7800, note: "More upscale fence look vs. standard chain or wood." },
        { label: "Automatic driveway gate prep", low: 2600, high: 8800, note: "Gate posts, power rough-in, and pad for future operator." }
      ],
      protection: [
        { label: "Privacy height upgrade (where allowed)", low: 900, high: 2600, note: "Taller sections with tighter boards or panels." },
        { label: "Child / pet safety latch package", low: 350, high: 900, note: "Self-closing hinges and child-resistant latches." }
      ],
      design: [
        { label: "Decorative caps and trim boards", low: 450, high: 1200, note: "Finishes top of fence with a more custom look." },
        { label: "Lattice or horizontal style upgrade", low: 1200, high: 3500, note: "Modern design elements versus standard pickets." }
      ],
      speed: [
        { label: "Temporary safety fence during project", low: 450, high: 1200, note: "Keeps pets and kids secure while old fence is removed." }
      ],
      maintenance: [
        { label: "Stain / paint coat for wood fence", low: 650, high: 1800, note: "Protects wood and adds color options." }
      ]
    }
  },

  waterproofing: {
    title: "Waterproofing & Foundation Sealing",
    groups: {
      luxury: [
        { label: "Battery backup sump system", low: 1800, high: 5200, note: "Keeps pump running during power outages." }
      ],
      protection: [
        { label: "Interior drain tile system", low: 4800, high: 14800, note: "Collects and redirects water along interior perimeter." },
        { label: "Full wall membrane upgrade", low: 2800, high: 9800, note: "Adds continuous water barrier on walls." }
      ],
      design: [
        { label: "Finished wall panel system (non-organic)", low: 2600, high: 7800, note: "Water-resistant panels as an alternative to drywall." }
      ],
      speed: [
        { label: "After-hours pump monitoring start-up", low: 450, high: 1200, note: "Extra checkup after first heavy rain." }
      ],
      maintenance: [
        { label: "Annual sump service & test", low: 350, high: 900, note: "Test pump, check discharge line, and clean basin." }
      ]
    }
  },

  "power-wash": {
    title: "Power Washing / Soft Washing",
    groups: {
      luxury: [
        { label: "House + driveway + patio bundle", low: 450, high: 1600, note: "Combines multiple exterior surfaces in one visit." }
      ],
      protection: [
        { label: "Soft-wash roof treatment (where appropriate)", low: 650, high: 1900, note: "Gentle cleaning on suitable roofing materials." }
      ],
      design: [
        { label: "Fence & rail cleaning upgrade", low: 250, high: 650, note: "Adds fencing and rails to the wash package." }
      ],
      speed: [
        { label: "Evening or weekend wash window", low: 250, high: 650, note: "Work timed around resident or business hours." }
      ],
      maintenance: [
        { label: "Seasonal wash contract (2x per year)", low: 650, high: 1900, note: "Pre-scheduled cleaning visits before peak seasons." }
      ]
    }
  },

  landscaping: {
    title: "Landscaping & Seasonal Care",
    groups: {
      luxury: [
        { label: "Landscape lighting at key beds", low: 950, high: 2600, note: "Spotlights and path lights to highlight plantings." },
        { label: "Decorative boulders or stone features", low: 650, high: 2200, note: "Adds natural focal points in beds or corners." }
      ],
      protection: [
        { label: "Drainage swale or small French drain", low: 950, high: 2600, note: "Helps move water away from foundations and low spots." }
      ],
      design: [
        { label: "Bed redesign with new plant layout", low: 1200, high: 3800, note: "Updates bed shapes, mulch, and plant varieties." }
      ],
      speed: [
        { label: "One-time intensive cleanup day", low: 650, high: 1800, note: "Deep cleanup, trimming, and haul-away." }
      ],
      maintenance: [
        { label: "Monthly lawn & bed care plan", low: 180, high: 450, note: "Regular mowing, trimming, and basic bed maintenance." }
      ]
    }
  },

  "exterior-lighting": {
    title: "Exterior Lighting & Smart Security",
    groups: {
      luxury: [
        { label: "Full smart landscape lighting system", low: 2800, high: 9800, note: "App-controlled color and timing profiles." }
      ],
      protection: [
        { label: "Extra motion and flood coverage", low: 650, high: 1900, note: "Additional motion heads for dark corners and alleys." }
      ],
      design: [
        { label: "Architectural wall washer lights", low: 1500, high: 4200, note: "Highlights stone, brick, or siding textures at night." }
      ],
      speed: [
        { label: "Same-day camera deployment (where possible)", low: 450, high: 1200, note: "Quick-install cameras for immediate coverage." }
      ],
      maintenance: [
        { label: "Annual lighting check & re-aim", low: 350, high: 900, note: "Check connections, transformers, and aiming once per year." }
      ]
    }
  },

  sidewalk: {
    title: "Sidewalk / DOT Concrete Repair",
    groups: {
      luxury: [
        { label: "Decorative broom or border finish", low: 650, high: 1900, note: "Custom finishes beyond standard broom surface." }
      ],
      protection: [
        { label: "Extra thickness at tree or driveway areas", low: 900, high: 2600, note: "Heavier slab where roots or vehicle loads are expected." },
        { label: "Root barrier installation (where allowed)", low: 1200, high: 3800, note: "Helps protect new concrete from future root lifting." }
      ],
      design: [
        { label: "Scored control joint pattern", low: 450, high: 1200, note: "More regular joint spacing for a clean look." }
      ],
      speed: [
        { label: "Phased pour scheduling", low: 450, high: 1200, note: "Keeps partial sidewalk open where possible during work." }
      ],
      maintenance: [
        { label: "Seal & cure control package", low: 350, high: 900, note: "Improves curing and surface performance of new slabs." }
      ]
    }
  },

  gutters: {
    title: "Gutter Install / Repair",
    groups: {
      luxury: [
        { label: "Seamless half-round or decorative profile", low: 1200, high: 3500, note: "Higher-end gutter appearance versus standard K-style." }
      ],
      protection: [
        { label: "Premium gutter guard system", low: 1500, high: 3800, note: "Reduces debris buildup and clogs." },
        { label: "Additional downspouts & splash pads", low: 450, high: 1200, note: "Helps carry water farther away from the foundation." }
      ],
      design: [
        { label: "Color-matched gutter & trim package", low: 450, high: 1200, note: "Coordinates gutters with fascia and siding colors." }
      ],
      speed: [
        { label: "Same-day gutter cleaning add-on", low: 250, high: 650, note: "Cleaning while new sections are being installed." }
      ],
      maintenance: [
        { label: "Bi-annual gutter clean plan", low: 450, high: 1600, note: "Two scheduled cleanings per year with downspout check." }
      ]
    }
  },

  "interior-paint": {
    title: "Interior Painting",
    groups: {
      luxury: [
        { label: "Accent wall feature paint or wallpaper", low: 450, high: 1600, note: "Adds a focal wall with rich color or texture." },
        { label: "Fine finish trim & door spray", low: 900, high: 2600, note: "Higher-end finish on doors, casing, and baseboards." }
      ],
      protection: [
        { label: "Full skim coat upgrade on rough walls", low: 1800, high: 5800, note: "Smooths heavily patched or uneven plaster surfaces." },
        { label: "Zero-VOC or allergy-friendly paint line", low: 650, high: 1900, note: "Better for sensitive households and bedrooms." }
      ],
      design: [
        { label: "Color consult with samples", low: 350, high: 900, note: "Helps finalize palette room by room." }
      ],
      speed: [
        { label: "Night or weekend painting (where allowed)", low: 650, high: 1900, note: "Ideal for commercial or busy households." }
      ],
      maintenance: [
        { label: "Touch-up kit labeled by room", low: 250, high: 650, note: "Leftover labeled cans and small touch-up tools." }
      ]
    }
  },

  flooring: {
    title: "Flooring (LVP / Tile / Hardwood)",
    groups: {
      luxury: [
        { label: "Wide-plank or herringbone layout", low: 2200, high: 7800, note: "High-end patterns and wider boards." },
        { label: "Heated floor rough-in (select rooms)", low: 1800, high: 5200, note: "Prepped for future radiant heating where compatible." }
      ],
      protection: [
        { label: "Moisture barrier or underlayment upgrade", low: 650, high: 1900, note: "Helps protect against basement or slab moisture." },
        { label: "Subfloor repair / leveling allowance", low: 900, high: 2600, note: "Addresses squeaks and dips before new floor goes in." }
      ],
      design: [
        { label: "Stair treads & nosing upgrade", low: 1200, high: 3800, note: "Matches stairs to new flooring for a seamless look." }
      ],
      speed: [
        { label: "Room-by-room phased install", low: 450, high: 1200, note: "Keeps key rooms open during replacement." }
      ],
      maintenance: [
        { label: "Starter care kit (cleaner & pads)", low: 250, high: 650, note: "Proper cleaners and pads to protect new floors." }
      ]
    }
  },

  drywall: {
    title: "Drywall / Plaster / Skim Coat",
    groups: {
      luxury: [
        { label: "Level 5 finish on key walls", low: 1800, high: 5200, note: "Ultra-smooth finish in high-light areas." }
      ],
      protection: [
        { label: "Sound-damping board upgrade", low: 1500, high: 4800, note: "Helps reduce noise transfer between rooms." },
        { label: "Mold-resistant board in wet-prone areas", low: 900, high: 2600, note: "Better for basements, baths, and laundry rooms." }
      ],
      design: [
        { label: "Simple ceiling design (tray / beams)", low: 2200, high: 7800, note: "Adds visual interest to living or dining rooms." }
      ],
      speed: [
        { label: "Dust-reduced sanding upgrade", low: 650, high: 1900, note: "Extra protection and HEPA vacuum sanding." }
      ],
      maintenance: [
        { label: "Small patch & crack service visit", low: 350, high: 900, note: "Return visit to fix seasonal hairline cracks." }
      ]
    }
  },

  "interior-doors": {
    title: "Interior Doors & Trim",
    groups: {
      luxury: [
        { label: "Solid-core door upgrade", low: 1200, high: 3800, note: "Quieter and more substantial feel vs. hollow core." },
        { label: "Decorative casing and header details", low: 900, high: 2600, note: "Adds higher-end trim profiles around openings." }
      ],
      protection: [
        { label: "Soft-close hardware package", low: 450, high: 1200, note: "Helps reduce slamming and wear on hinges." }
      ],
      design: [
        { label: "Premium handle / lever hardware", low: 450, high: 1600, note: "Upgrades hardware style and finish." }
      ],
      speed: [
        { label: "Same-day multi-door swap (where feasible)", low: 450, high: 1200, note: "Concentrates install in one coordinated visit." }
      ],
      maintenance: [
        { label: "Adjustment visit after one season", low: 250, high: 650, note: "Fine-tunes latch alignment after settling." }
      ]
    }
  },

  closets: {
    title: "Closet / Storage Buildouts",
    groups: {
      luxury: [
        { label: "Closet island or seating bench", low: 1800, high: 5200, note: "Adds a central island or bench in larger closets." },
        { label: "Glass doors or display sections", low: 2200, high: 6800, note: "Showcases shoes, bags, or collections." }
      ],
      protection: [
        { label: "LED closet lighting system", low: 650, high: 1900, note: "Low-heat lighting with switches or motion sensors." }
      ],
      design: [
        { label: "Color and finish upgrade on panels", low: 650, high: 2200, note: "Richer laminates or wood-look finishes." }
      ],
      speed: [
        { label: "Weekend makeover package", low: 650, high: 1900, note: "A focused 1–2 day closet transformation." }
      ],
      maintenance: [
        { label: "Reconfigurable hardware kit", low: 250, high: 650, note: "Extra shelves and hardware for future adjustments." }
      ]
    }
  },

  "interior-lighting": {
    title: "Interior Electrical / Smart Lighting",
    groups: {
      luxury: [
        { label: "Full smart dimmer & scene control", low: 1800, high: 5200, note: "App-controlled scenes and dimmers throughout." },
        { label: "LED cove or strip accent lighting", low: 900, high: 2600, note: "Hidden lighting along ceilings, niches, or cabinets." }
      ],
      protection: [
        { label: "Arc-fault / GFCI safety upgrades", low: 650, high: 1900, note: "Improves electrical safety in key circuits." }
      ],
      design: [
        { label: "Feature fixture upgrade (chandeliers, pendants)", low: 950, high: 2800, note: "Statement fixtures for dining rooms, islands, or entries." }
      ],
      speed: [
        { label: "Evening or off-hours fixture swap", low: 450, high: 1200, note: "Ideal for busy households or small businesses." }
      ],
      maintenance: [
        { label: "Annual checkup of dimmers & smart devices", low: 350, high: 900, note: "Checks programming, firmware, and connections." }
      ]
    }
  },

  bathroom: {
    title: "Bathroom Remodel",
    groups: {
      luxury: [
        { label: "Full glass shower enclosure upgrade", low: 1800, high: 4200, note: "Frameless or semi-frameless custom glass." },
        { label: "Heated floor system", low: 1800, high: 3200, note: "Electric under-tile heat with programmable thermostat." },
        { label: "Rain head + handheld shower combo", low: 950, high: 2600, note: "Multiple shower functions and diverters." },
        { label: "Floating vanity or custom vanity build", low: 1500, high: 3800, note: "Higher-end vanity with extra storage and style." }
      ],
      protection: [
        { label: "Waterproofing membrane upgrade (walls & floor)", low: 1200, high: 3800, note: "Enhanced waterproofing behind tile surfaces." },
        { label: "Linear drain or upgraded shower drain", low: 900, high: 2600, note: "Better drainage and modern appearance." }
      ],
      design: [
        { label: "Large-format or Italian-style tile upgrade", low: 1800, high: 5200, note: "Cleaner look with fewer grout lines." },
        { label: "LED niche and under-vanity lighting", low: 650, high: 1900, note: "Adds soft night lighting and ambiance." }
      ],
      speed: [
        { label: "Fast-track bathroom (where feasible)", low: 1500, high: 4500, note: "Extra crew priority for minimizing bath downtime." }
      ],
      maintenance: [
        { label: "Seal grout and stone package", low: 450, high: 1200, note: "Extends life of grout and natural stone." }
      ]
    }
  },

  kitchen: {
    title: "Kitchen Remodel",
    groups: {
      luxury: [
        { label: "Full height backsplash & niche details", low: 1800, high: 5200, note: "Tile or stone up to the ceiling in key areas." },
        { label: "Island enlargement or waterfall edge", low: 2800, high: 9800, note: "Upgrades the island as main focal point." },
        { label: "Panel-ready or pro-style appliance prep", low: 2200, high: 7800, note: "Layout, power, and openings tailored for premium appliances." }
      ],
      protection: [
        { label: "Under-cabinet lighting & receptacle upgrade", low: 900, high: 2600, note: "Improves visibility and outlet spacing for small appliances." },
        { label: "Water leak sensor kit (sink & dishwasher)", low: 450, high: 1200, note: "Alerts for early detection of leaks." }
      ],
      design: [
        { label: "Glass or accent cabinet doors", low: 950, high: 2600, note: "Showcases glassware or display pieces." },
        { label: "Custom hood / feature wall treatment", low: 2200, high: 6800, note: "Statement hood with tile or panel surround." }
      ],
      speed: [
        { label: "Temporary sink / counter setup", low: 650, high: 1900, note: "Helps keep basic kitchen function during remodel." }
      ],
      maintenance: [
        { label: "Cabinet care & touch-up kit", low: 250, high: 650, note: "Color-matched markers, cleaners, and instructions." }
      ]
    }
  },

  basement: {
    title: "Basement Finishing",
    groups: {
      luxury: [
        { label: "Home theater or media wall", low: 2800, high: 9800, note: "Framing, wiring, and feature wall for TV and sound." },
        { label: "Wet bar or kitchenette rough-in", low: 3500, high: 11800, note: "Water, drain, and power prepared for future bar or kitchenette." }
      ],
      protection: [
        { label: "Moisture-resistant wall system upgrade", low: 2600, high: 8800, note: "Non-organic materials in key areas to resist moisture." },
        { label: "Sump pump or dehumidifier integration", low: 1800, high: 5200, note: "Helps control humidity and minor water issues." }
      ],
      design: [
        { label: "Accent ceiling or beam details", low: 2200, high: 6800, note: "Breaks up a standard flat basement ceiling." }
      ],
      speed: [
        { label: "Phased construction to keep storage zones", low: 650, high: 1900, note: "Works around stored items so basement stays partially usable." }
      ],
      maintenance: [
        { label: "Seasonal humidity & filter check service", low: 350, high: 900, note: "Review humidity levels and basic mechanical filters yearly." }
      ]
    }
  },

  "garage-conversion": {
    title: "Garage Conversion / Remodel",
    groups: {
      luxury: [
        { label: "Mini split heating & cooling system", low: 3500, high: 11800, note: "Comfortable year-round climate control." },
        { label: "Feature wall or built-in storage system", low: 2200, high: 7800, note: "Custom shelving and organization features." }
      ],
      protection: [
        { label: "Slab moisture barrier and leveling", low: 1800, high: 5200, note: "Helps prep concrete for finished flooring." }
      ],
      design: [
        { label: "Sound-damping wall and ceiling package", low: 2600, high: 8800, note: "Better for studios, offices, or dens." }
      ],
      speed: [
        { label: "Phased conversion (maintain partial storage)", low: 650, high: 1900, note: "Keeps part of garage accessible while converting another area." }
      ],
      maintenance: [
        { label: "Annual comfort system check", low: 350, high: 900, note: "Inspect mini split, filters, and controls each year." }
      ]
    }
  },

  "epoxy-garage": {
    title: "Epoxy Garage Floor",
    groups: {
      luxury: [
        { label: "Full flake broadcast with custom colors", low: 650, high: 2200, note: "Denser flake for a more uniform floor appearance." },
        { label: "Logo or graphic inlay", low: 900, high: 2600, note: "Adds a center logo or design under clear coat." }
      ],
      protection: [
        { label: "Extra concrete prep and repair", low: 650, high: 1900, note: "Grinds, patches, and levels more heavily damaged slabs." }
      ],
      design: [
        { label: "Metallic or marbled epoxy effect", low: 1200, high: 3800, note: "High-end decorative epoxy finishes." }
      ],
      speed: [
        { label: "Accelerated cure system (where available)", low: 650, high: 1900, note: "Helps return garage to use more quickly." }
      ],
      maintenance: [
        { label: "Annual clean & reseal check", low: 350, high: 900, note: "Inspects coating for wear and recommends maintenance." }
      ]
    }
  },

  "smart-home": {
    title: "Smart Home Upgrades (Ring / Nest / Cameras)",
    groups: {
      luxury: [
        { label: "Whole-home smart hub integration", low: 2200, high: 7800, note: "Central control hub tied into lighting and security." }
      ],
      protection: [
        { label: "Extra cameras at blind spots", low: 650, high: 1900, note: "Covers alleys, backyards, or parking areas." },
        { label: "Professional monitoring setup assistance", low: 450, high: 1200, note: "Helps configure app accounts and monitoring plans." }
      ],
      design: [
        { label: "Clean wire-hide & mounting package", low: 450, high: 1200, note: "More hidden wiring and neatly aligned devices." }
      ],
      speed: [
        { label: "Same-day smart lock and doorbell install", low: 450, high: 1200, note: "Fast upgrade for front door security." }
      ],
      maintenance: [
        { label: "Annual smart device health check", low: 350, high: 900, note: "Review firmware, batteries, and operation once per year." }
      ]
    }
  },

  handyman: {
    title: "Small Repairs / Handyman Visit",
    groups: {
      luxury: [
        { label: "Priority same-week booking (when available)", low: 150, high: 450, note: "Moves visit into a priority slot when schedule allows." }
      ],
      protection: [
        { label: "Safety package (grab bars, rails, anti-tip kits)", low: 250, high: 750, note: "Common safety items installed during visit." }
      ],
      design: [
        { label: "Decor hardware refresh (handles, knobs, hinges)", low: 350, high: 900, note: "Swaps dated hardware for updated finishes." }
      ],
      speed: [
        { label: "Evening or weekend time window", low: 250, high: 650, note: "Flexible scheduling for busy households." }
      ],
      maintenance: [
        { label: "Quarterly “punch list” mini-visit plan", low: 450, high: 1600, note: "Smaller recurring visits for little fixes across the year." }
      ]
    }
  },

  soundproofing: {
    title: "Soundproofing",
    groups: {
      luxury: [
        { label: "Studio-grade wall assembly", low: 2600, high: 8800, note: "Layers for higher STC ratings and reduced transfer." }
      ],
      protection: [
        { label: "Door and window sound seals", low: 650, high: 1900, note: "Adds perimeter gaskets and sweeps to key openings." }
      ],
      design: [
        { label: "Acoustic panel design and layout", low: 900, high: 2600, note: "Fabric panels planned for style and performance." }
      ],
      speed: [
        { label: "Phased room-by-room soundproofing", low: 450, high: 1200, note: "Organizes work to keep parts of home open." }
      ],
      maintenance: [
        { label: "Post-project sound check & adjustment", low: 350, high: 900, note: "Fine-tunes seals and minor gaps after initial use." }
      ]
    }
  },

  "moisture-control": {
    title: "Mold / Moisture Prevention (non-remediation)",
    groups: {
      luxury: [
        { label: "Full home humidity monitoring system", low: 1800, high: 5200, note: "Sensors in key areas tied to an app dashboard." }
      ],
      protection: [
        { label: "Additional exhaust fans with timers", low: 650, high: 1900, note: "Helps control humidity in baths, laundry, and kitchen." },
        { label: "Dehumidifier drain and power prep", low: 900, high: 2600, note: "Makes it easier to place dehumidifiers in key zones." }
      ],
      design: [
        { label: "Wall and trim material upgrade (non-organic)", low: 1200, high: 3800, note: "Helps resist moisture and minor splashing." }
      ],
      speed: [
        { label: "Rapid response moisture check visit", low: 350, high: 900, note: "Quick inspection after a leak or heavy storm." }
      ],
      maintenance: [
        { label: "Seasonal humidity check & vent cleaning", low: 350, high: 900, note: "Reviews venting and basic cleaning in damp-prone areas." }
      ]
    }
  }
};

/* Category labels for the dropdown titles */
const SMART_ADDON_GROUP_LABELS = {
  luxury: "Luxury Upgrades",
  protection: "Protection & Safety",
  design: "Design Enhancements",
  speed: "Speed / Convenience",
  maintenance: "Maintenance Items"
};

/* -----------------------------------
   Helpers
----------------------------------- */
function formatMoney(num) {
  return "$" + Math.round(num).toLocaleString("en-US");
}

/* Render checkboxes + dropdown groups into the panel */
function renderSmartAddons(serviceKey) {
  const panel = document.getElementById("smart-addons-panel");
  if (!panel) return;

  panel.innerHTML = "";

  const cfg = SMART_ADDONS_CONFIG[serviceKey];
  if (!cfg) {
    panel.style.display = "none";
    return;
  }

  panel.style.display = "block";

  let html = `
    <div style="margin-bottom:8px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:rgba(231,191,99,0.9);">
        Smart Add-Ons (Optional)
      </div>
      <div style="font-size:12px;color:#aaa;margin-top:4px;">
        Choose extra upgrades, safety options, or maintenance items to include in your ballpark.
      </div>
    </div>
  `;

  Object.keys(cfg.groups).forEach(groupKey => {
    const groupLabel = SMART_ADDON_GROUP_LABELS[groupKey] || groupKey;
    const items = cfg.groups[groupKey] || [];
    if (!items.length) return;

    html += `
      <details class="sa-group" data-group="${groupKey}" style="margin:6px 0;border-radius:8px;border:1px solid rgba(231,191,99,.35);background:rgba(7,14,26,.9);">
        <summary style="cursor:pointer;padding:6px 10px;font-size:13px;color:#f5d89b;list-style:none;outline:none;">
          ▸ ${groupLabel}
        </summary>
        <div class="sa-items" style="padding:6px 10px 8px 10px;font-size:12px;color:#eee;">
    `;

    items.forEach((item, index) => {
      const id = `sa-${serviceKey}-${groupKey}-${index}`;
      html += `
        <label for="${id}" style="display:block;margin:4px 0 6px;">
          <input
            id="${id}"
            type="checkbox"
            class="smart-addon"
            data-low="${item.low}"
            data-high="${item.high}"
            data-label="${item.label.replace(/"/g, "&quot;")}"
            data-group="${groupKey}"
            style="margin-right:6px;"
          >
          <span style="font-weight:600;">${item.label}</span>
          <span style="color:#e7bf63;"> (+${formatMoney(item.low)} – ${formatMoney(item.high)})</span>
          ${item.note ? `<div style="font-size:11px;color:#aaa;margin-left:22px;margin-top:1px;">${item.note}</div>` : ""}
        </label>
      `;
    });

    html += `
        </div>
      </details>
    `;
  });

  html += `
    <div id="smart-addon-total-line" style="margin-top:8px;font-size:12px;color:#e7bf63;">
      Selected Add-Ons: <strong>+$0 – +$0</strong>
    </div>
  `;

  panel.innerHTML = html;

  /* Attach change listener to update add-on total line live */
  panel.querySelectorAll(".smart-addon").forEach(cb => {
    cb.addEventListener("change", updateSmartAddonPanelTotals);
  });
  updateSmartAddonPanelTotals();
}

/* Calculate totals for selected add-ons */
function getSmartAddonTotals() {
  let low = 0;
  let high = 0;
  const selected = [];

  document.querySelectorAll(".smart-addon:checked").forEach(box => {
    const bLow = Number(box.dataset.low) || 0;
    const bHigh = Number(box.dataset.high) || 0;
    low += bLow;
    high += bHigh;
    selected.push({
      label: box.dataset.label || "",
      group: box.dataset.group || "",
      low: bLow,
      high: bHigh
    });
  });

  return { low, high, selected };
}

/* Update the panel footer line: "Selected Add-Ons: +$X – +$Y" */
function updateSmartAddonPanelTotals() {
  const line = document.getElementById("smart-addon-total-line");
  if (!line) return;
  const { low, high } = getSmartAddonTotals();
  line.innerHTML = `
    Selected Add-Ons: <strong>+${formatMoney(low)} – +${formatMoney(high)}</strong>
  `;
}

/* Parse the base range from the .est-main element: "$XX,XXX – $YY,YYY" */
function parseBaseRangeFromResult() {
  const rangeEl = document.querySelector(".est-main");
  if (!rangeEl) return null;

  const text = rangeEl.textContent || "";
  const nums = text.match(/[\d,]+/g) || [];
  if (nums.length < 2) return null;

  const low = parseInt(nums[0].replace(/,/g, ""), 10);
  const high = parseInt(nums[1].replace(/,/g, ""), 10);
  if (isNaN(low) || isNaN(high)) return null;

  return { low, high, el: rangeEl };
}

/* Inject full breakdown (Base + Add-Ons + New Total) under the main range */
function applySmartAddonBreakdown() {
  const base = parseBaseRangeFromResult();
  if (!base) return;

  const { low: addonLow, high: addonHigh, selected } = getSmartAddonTotals();

  // Remove any previous breakdown
  const oldBox = document.getElementById("smart-addon-breakdown");
  if (oldBox && oldBox.parentNode) {
    oldBox.parentNode.removeChild(oldBox);
  }

  // If no add-ons selected, we still show a simple note
  const totalLow = base.low + addonLow;
  const totalHigh = base.high + addonHigh;

  let itemsHtml = "";
  if (selected.length) {
    itemsHtml += `<ul style="margin:6px 0 4px 18px;padding-left:0;font-size:12px;color:#ddd;">`;
    selected.forEach(item => {
      const groupLabel = SMART_ADDON_GROUP_LABELS[item.group] || "";
      itemsHtml += `
        <li style="margin-bottom:2px;">
          <span style="font-weight:600;">${item.label}</span>
          ${groupLabel ? `<span style="color:#999;"> (${groupLabel})</span>` : ""}
          <span style="color:#e7bf63;"> (+${formatMoney(item.low)} – ${formatMoney(item.high)})</span>
        </li>
      `;
    });
    itemsHtml += `</ul>`;
  } else {
    itemsHtml = `<p style="margin:4px 0 0;font-size:12px;color:#aaa;">No add-ons selected. This is the base ballpark range only.</p>`;
  }

  const breakdownHtml = `
    <div id="smart-addon-breakdown"
         style="margin-top:10px;padding:10px 12px;border-radius:10px;border:1px solid rgba(231,191,99,.45);background:rgba(7,14,26,.9);font-size:12px;line-height:1.5;color:#eee;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#f5d89b;margin-bottom:4px;">
        Add-On Breakdown (Preview Only)
      </div>

      <div><strong>Base Ballpark:</strong> ${formatMoney(base.low)} – ${formatMoney(base.high)}</div>
      <div><strong>Selected Add-Ons:</strong> +${formatMoney(addonLow)} – +${formatMoney(addonHigh)}</div>
      <div style="margin-top:4px;"><strong>New Total Range:</strong> ${formatMoney(totalLow)} – ${formatMoney(totalHigh)}</div>

      ${itemsHtml}

      <div style="margin-top:6px;font-size:11px;color:#aaa;">
        Note: Add-ons are approximate and will be itemized in your written estimate after a walkthrough.
      </div>
    </div>
  `;

  base.el.insertAdjacentHTML("afterend", breakdownHtml);
}

/* -----------------------------------
   INIT — Hook into your existing estimator
   - When project type changes → rebuild add-on panel
   - On form submit → let your original calculateEstimate run, then
     we append the breakdown under the result
----------------------------------- */
window.addEventListener("load", () => {
  const serviceSelect = document.getElementById("est-service");
  const form = document.getElementById("est-form");
  const panel = document.getElementById("smart-addons-panel");

  if (!serviceSelect || !form || !panel) return;

  // When service changes, render matching add-ons
  serviceSelect.addEventListener("change", () => {
    renderSmartAddons(serviceSelect.value);
  });

  // Render for initial selected service
  renderSmartAddons(serviceSelect.value);

  // When the estimator form is submitted:
  // - Your original listener runs first (calculateEstimate)
  // - Then our listener runs and extends the result box
  form.addEventListener("submit", (evt) => {
    // Original handler already called evt.preventDefault()
    // We just wait for DOM updates, then add the breakdown.
    setTimeout(applySmartAddonBreakdown, 0);
  });
});

