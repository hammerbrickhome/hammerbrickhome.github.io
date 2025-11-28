/* ============================================================
   HAMMER BRICK & HOME — ESTIMATOR BOT v16.1 (FULL RESTORE)
   - RESTORED: All 100+ Smart Add-ons & Service Definitions.
   - FIXED: "Three Quotes" bug (Quote only appears ONCE at end).
   - ENGINE: Dictionary-based (English, Spanish, Chinese, Russian).
   - FEATURES: HVAC, Junk, Design, Strict Phone, Photo Reminder.
=============================================================== */

(function() {

  // --- CONFIGURATION -----------------------------------------
  const WEBHOOK_URL = ""; 
  const PHONE_NUMBER = "9295955300"; 
  const CRM_FORM_URL = ""; 
  const WALKTHROUGH_URL = "";

  // Modifiers
  const BOROUGH_MODS = {
    "Manhattan": 1.18, "Brooklyn": 1.08, "Queens": 1.05,
    "Bronx": 1.03, "Staten Island": 1.0, "New Jersey": 0.96
  };
  const DISCOUNTS = { "VIP10": 0.10, "REFERRAL5": 0.05, "WEBSAVER": 0.05 };
  const ADD_ON_PRICES = { debrisRemoval: { low: 1200, high: 2800 } };

  // --- LANGUAGE DICTIONARY -----------------------------------
  const TEXT = {
    en: {
      welcome: "👋 Hi! Ready to upgrade your home?",
      disclaimer: "I can generate a **ballpark price range** in 60 seconds. (Ref ID: ",
      startBtn: "🚀 Start Estimate",
      projectType: "Awesome. What type of project are you planning?",
      photoSkip: "📸 Send Photo (Skip to Quote)",
      photoSkipMsg: "Smart choice. A picture is worth a thousand words.",
      quickVsFull: "⚡ This looks like a quick job. Fast estimate or full detail?",
      quickBtn: "⚡ Quick Estimate",
      fullBtn: "📝 Full Detail",
      leadCheck: "Is your property built before 1978? (Lead safety required)",
      indoorOutdoor: "Is this mostly Indoor, Outdoor, or Both?",
      sizeAsk: "Approximate size?",
      sizeLow: "Number seems low. Please enter valid number (e.g. 500).",
      locationAsk: "Which borough/area is this in?",
      checkSched: "Checking schedule for",
      schedOk: "🗓️ OK! We have estimate slots available.",
      priceMode: "How should we price this?",
      rushAsk: "Is this a rush project (starting within 72 hours)?",
      promoAsk: "Any promo code today?",
      webSaverMsg: "Wait! I've applied the **'WEB-SAVER'** discount (-5%) for you. 🎉",
      debrisAsk: "Include debris removal & dumpster costs? (Typ. +$1,200–$2,800)",
      addonIntro: "I found optional **Smart Add-ons**. View upgrades?",
      viewAddons: "✨ View Add-ons",
      skip: "Skip",
      categorySel: "Select a category:",
      doneSel: "✅ Done Selecting",
      back: "⬅️ Back",
      itemAdded: "✅ **Item Added to Estimate!**",
      anotherAsk: "Would you like to add another project?",
      addMore: "➕ Add Another Project",
      finish: "No, Finish & Get Quote",
      membershipAsk: "Before we finish, hear about **VIP Memberships** (15% off labor)?",
      membershipYes: "🏆 **VIP Members** get 15% off labor + priority booking.",
      nameAsk: "What is your name?",
      phoneAsk: "And your mobile number? (SMS Capable)",
      phoneErr: "⚠️ Please enter a valid 10-digit number (e.g. 9171234567).",
      timingAsk: "When are you hoping to start?",
      sourceAsk: "How did you hear about us?",
      finalNote: "💡 Quick note: This is a **ballpark** range. Final pricing is often lower after a site visit.",
      photoRemind: "📎 **Reminder:** Photos won't attach automatically. Please add them manually in your text/email.",
      contactIntro: "Thanks! Choose how you’d like to receive your quote:",
      textBtn: "📲 Text Me the Quote",
      emailBtn: "✉️ Email Me the Quote",
      callBtn: "📞 Call Now",
      copyBtn: "📋 Copy to Clipboard",
      startOver: "🔁 Start Over"
    },
    es: {
      welcome: "👋 ¡Hola! ¿Listo para renovar tu hogar?",
      disclaimer: "Puedo generar un **rango estimado** en 60 segundos. (Ref ID: ",
      startBtn: "🚀 Comenzar",
      projectType: "Genial. ¿Qué tipo de proyecto planeas?",
      photoSkip: "📸 Enviar Foto (Saltar)",
      photoSkipMsg: "Buena elección. Una imagen vale más que mil palabras.",
      quickVsFull: "⚡ Parece rápido. ¿Estimado rápido o detallado?",
      quickBtn: "⚡ Rápido",
      fullBtn: "📝 Detallado",
      leadCheck: "¿Tu propiedad es anterior a 1978? (Seguridad plomo)",
      indoorOutdoor: "¿Interior, exterior o ambos?",
      sizeAsk: "¿Tamaño aproximado?",
      sizeLow: "Número muy bajo. Ingresa uno válido (ej. 500).",
      locationAsk: "¿En qué área está?",
      checkSched: "Revisando agenda para",
      schedOk: "🗓️ ¡Sí! Tenemos espacios disponibles.",
      priceMode: "¿Cómo debemos cotizar?",
      rushAsk: "¿Es urgente (menos de 72 horas)?",
      promoAsk: "¿Tienes código promocional?",
      webSaverMsg: "¡Espera! Apliqué el descuento **'WEB-SAVER'** (-5%). 🎉",
      debrisAsk: "¿Incluir remoción de escombros? (Typ. +$1,200–$2,800)",
      addonIntro: "Encontré **Mejoras Inteligentes**. ¿Ver opciones?",
      viewAddons: "✨ Ver Mejoras",
      skip: "Saltar",
      categorySel: "Selecciona categoría:",
      doneSel: "✅ Terminar",
      back: "⬅️ Volver",
      itemAdded: "✅ **¡Proyecto Agregado!**",
      anotherAsk: "¿Agregar otro proyecto?",
      addMore: "➕ Agregar Otro",
      finish: "No, Finalizar",
      membershipAsk: "¿Te interesa la **Membresía VIP** (15% desc)?",
      membershipYes: "🏆 **Socios VIP** tienen 15% desc en labor.",
      nameAsk: "¿Cuál es tu nombre?",
      phoneAsk: "¿Tu número de celular?",
      phoneErr: "⚠️ Ingresa un número de 10 dígitos válido.",
      timingAsk: "¿Cuándo esperas comenzar?",
      sourceAsk: "¿Cómo nos conociste?",
      finalNote: "💡 Nota: Es un **rango estimado**. El precio final suele ser menor tras la visita.",
      photoRemind: "📎 **Recordatorio:** Las fotos no se adjuntan solas. Agrégalas manualmente.",
      contactIntro: "¡Gracias! Elige cómo recibir tu cotización:",
      textBtn: "📲 Envíame Texto",
      emailBtn: "✉️ Envíame Email",
      callBtn: "📞 Llamar Ahora",
      copyBtn: "📋 Copiar",
      startOver: "🔁 Reiniciar"
    },
    cn: {
      welcome: "👋 您好！准备好升级您的家了吗？",
      disclaimer: "我可以在60秒内生成**估价范围**。(ID: ",
      startBtn: "🚀 开始",
      projectType: "太好了。您计划做什么项目？",
      photoSkip: "📸 发送照片（跳过）",
      photoSkipMsg: "明智的选择。",
      quickVsFull: "⚡ 这是快速工作。快速估价还是详细信息？",
      quickBtn: "⚡ 快速",
      fullBtn: "📝 详细",
      leadCheck: "房产是1978年之前建的吗？",
      indoorOutdoor: "室内，室外还是两者？",
      sizeAsk: "大约尺寸？",
      sizeLow: "数字太低。请输入有效数字（如 500）。",
      locationAsk: "在哪个地区？",
      checkSched: "正在检查时间表",
      schedOk: "🗓️ 好的，有空档！",
      priceMode: "如何定价？",
      rushAsk: "这是紧急项目吗（72小时内）？",
      promoAsk: "有优惠码吗？",
      webSaverMsg: "等等！已应用 **'WEB-SAVER'** 折扣 (-5%)。🎉",
      debrisAsk: "包括垃圾清理费吗？(约 +$1,200–$2,800)",
      addonIntro: "发现可选 **智能升级**。查看吗？",
      viewAddons: "✨ 查看升级",
      skip: "跳过",
      categorySel: "选择类别：",
      doneSel: "✅ 完成",
      back: "⬅️ 返回",
      itemAdded: "✅ **项目已添加！**",
      anotherAsk: "添加另一个项目？",
      addMore: "➕ 添加",
      finish: "不，获取报价",
      membershipAsk: "想了解 **VIP会员** (人工费85折) 吗？",
      membershipYes: "🏆 **VIP会员** 享受人工费85折。",
      nameAsk: "您叫什么名字？",
      phoneAsk: "您的手机号码？",
      phoneErr: "⚠️ 请输入有效的10位数字。",
      timingAsk: "希望何时开始？",
      sourceAsk: "如何知道我们的？",
      finalNote: "💡 注意：这只是**估算**。实地考察后价格通常更低。",
      photoRemind: "📎 **提醒：** 照片不会自动附加。请手动添加。",
      contactIntro: "谢谢！选择接收方式：",
      textBtn: "📲 短信",
      emailBtn: "✉️ 邮件",
      callBtn: "📞 致电",
      copyBtn: "📋 复制",
      startOver: "🔁 重新开始"
    },
    ru: {
      welcome: "👋 Привет! Готовы обновить дом?",
      disclaimer: "Создам **смету** за 60 секунд. (ID: ",
      startBtn: "🚀 Начать",
      projectType: "Отлично. Какой тип проекта?",
      photoSkip: "📸 Фото (Пропустить)",
      photoSkipMsg: "Отличный выбор.",
      quickVsFull: "⚡ Быстрая оценка или полная?",
      quickBtn: "⚡ Быстрая",
      fullBtn: "📝 Полная",
      leadCheck: "Дом построен до 1978 года?",
      indoorOutdoor: "Внутри, снаружи или оба?",
      sizeAsk: "Примерный размер?",
      sizeLow: "Мало. Введите верное число (500).",
      locationAsk: "В каком районе?",
      checkSched: "Проверяю расписание для",
      schedOk: "🗓️ Да! Есть места.",
      priceMode: "Как оценить?",
      rushAsk: "Срочный проект (72 часа)?",
      promoAsk: "Есть промокод?",
      webSaverMsg: "Применил скидку **'WEB-SAVER'** (-5%). 🎉",
      debrisAsk: "Включить вывоз мусора? (+$1,200–$2,800)",
      addonIntro: "Нашел **Доп. опции**. Посмотреть?",
      viewAddons: "✨ Посмотреть",
      skip: "Пропустить",
      categorySel: "Выберите категорию:",
      doneSel: "✅ Готово",
      back: "⬅️ Назад",
      itemAdded: "✅ **Проект добавлен!**",
      anotherAsk: "Добавить еще проект?",
      addMore: "➕ Добавить",
      finish: "Нет, получить смету",
      membershipAsk: "Интересует **VIP членство** (скидка 15%)?",
      membershipYes: "🏆 **VIP** получают скидку 15% на работы.",
      nameAsk: "Как вас зовут?",
      phoneAsk: "Ваш мобильный?",
      phoneErr: "⚠️ Введите 10 цифр.",
      timingAsk: "Когда начать?",
      sourceAsk: "Откуда узнали о нас?",
      finalNote: "💡 Это **ориентир**. Итоговая цена часто ниже.",
      photoRemind: "📎 **Напоминание:** Фото не прикрепляются сами. Добавьте вручную.",
      contactIntro: "Спасибо! Как отправить смету:",
      textBtn: "📲 СМС",
      emailBtn: "✉️ Email",
      callBtn: "📞 Позвонить",
      copyBtn: "📋 Копировать",
      startOver: "🔁 Заново"
    }
  };

  const SMART_ADDON_GROUP_LABELS = {
    luxury: "Luxury Upgrades", protection: "Protection & Safety",
    design: "Design Enhancements", speed: "Speed / Convenience",
    maintenance: "Maintenance Items"
  };

  // --- FULL SMART ADD-ONS CONFIG (RESTORED) ---
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
          { label: "Large-format or European-style pavers", low: 2200, high: 5800 }
        ],
        speed: [
          { label: "Weekend or off-hours install", low: 1500, high: 3500 }
        ],
        maintenance: [
          { label: "Polymeric sand refill & joint tightening", low: 450, high: 950 },
          { label: "Clean & seal package", low: 850, high: 2200 }
        ]
      }
    },
    driveway: {
      title: "Driveway / Parking Area",
      groups: {
        luxury: [
          { label: "Decorative apron (Belgium Block)", low: 2200, high: 5500 }, 
          { label: "Heated driveway system (Electric/Hydronic)", low: 12000, high: 28000 }, 
          { label: "Integrated lighting at edges", low: 1500, high: 3200 }
        ],
        protection: [
          { label: "Commercial grade base (6-inch concrete)", low: 2800, high: 5500 },
          { label: "Heavy-duty trench drain at garage", low: 2200, high: 4500 } 
        ],
        design: [
          { label: "Two-tone driveway with borders", low: 1800, high: 4800 },
          { label: "Stamped concrete pattern upgrade", low: 2500, high: 6500 }
        ],
        speed: [
          { label: "Temporary parking pad during work", low: 850, high: 1800 }
        ],
        maintenance: [
          { label: "Sealcoat package (asphalt)", low: 550, high: 1200 }
        ]
      }
    },
    roofing: {
      title: "Roofing",
      groups: {
        luxury: [
          { label: "Architectural designer shingle upgrade", low: 2500, high: 6500 },
          { label: "Copper flashing & accents", low: 3500, high: 8500 } 
        ],
        protection: [
          { label: "Full ice & water shield (Entire Roof)", low: 2200, high: 5500 }, 
          { label: "High-performance synthetic underlayment", low: 850, high: 2200 },
          { label: "Chimney repointing & new flashing", low: 1800, high: 4200 }
        ],
        design: [
          { label: "Color-matched drip edge & accessories", low: 650, high: 1500 },
          { label: "Decorative ridge cap upgrade", low: 850, high: 1800 }
        ],
        speed: [
          { label: "One-day tear-off & install (Extra Crew)", low: 2500, high: 5500 }
        ],
        maintenance: [
          { label: "Gutter cleaning & guard install", low: 850, high: 2200 }
        ]
      }
    },
    siding: {
      title: "Siding – Exterior",
      groups: {
        luxury: [
          { label: "Stone or brick accent wall", low: 5500, high: 14000 }, 
          { label: "Board-and-batten composite look", low: 4500, high: 11000 }
        ],
        protection: [
          { label: "Rigid foam insulation board (R-Value+)", low: 2800, high: 6500 },
          { label: "Custom PVC window trim surrounds", low: 2200, high: 5500 }
        ],
        design: [
          { label: "Premium dark colors (Anti-Fade)", low: 3200, high: 8500 },
          { label: "Decorative crown & fascia details", low: 1800, high: 4800 }
        ],
        maintenance: [
          { label: "Annual siding wash & inspection", low: 450, high: 950 }
        ]
      }
    },
    windows: {
      title: "Windows & Exterior Doors",
      groups: {
        luxury: [
          { label: "Black interior/exterior frames", low: 3500, high: 8500 },
          { label: "Sliding patio door (8ft upgrade)", low: 3800, high: 9200 }
        ],
        protection: [
          { label: "Triple-pane noise reduction glass", low: 3200, high: 8800 }, 
          { label: "Security storm door package", low: 950, high: 2200 }
        ],
        design: [
          { label: "Simulated Divided Lites (Grids)", low: 850, high: 2400 },
          { label: "New interior casing & stools", low: 1200, high: 3500 }
        ],
        speed: [
          { label: "Same-day glass removal & board-up", low: 650, high: 1500 }
        ]
      }
    },
    exterior_paint: {
      title: "Exterior Facade / Painting",
      groups: {
        luxury: [
          { label: "Multi-color Victorian accent scheme", low: 2200, high: 5500 },
          { label: "Premium elastomeric coating (Waterproof)", low: 3500, high: 7500 } 
        ],
        protection: [
          { label: "Full scrape & oil-based prime", low: 2500, high: 5500 },
          { label: "Lead-safe containment protocol", low: 1800, high: 4800 }
        ],
        design: [
          { label: "Color consult with sample boards", low: 550, high: 1200 }
        ],
        speed: [
          { label: "Lift / boom access (if accessible)", low: 2200, high: 5800 }
        ]
      }
    },
    deck: {
      title: "Deck / Patio Build or Rebuild",
      groups: {
        luxury: [
          { label: "Premium Composite (Trex Transcend)", low: 4500, high: 12000 }, 
          { label: "Cable or glass railing system", low: 3500, high: 11000 },
          { label: "Built-in cocktail rail & benches", low: 2200, high: 5500 }
        ],
        protection: [
          { label: "Steel framing upgrade", low: 3500, high: 9500 },
          { label: "Joist protection tape & flashing", low: 650, high: 1500 }
        ],
        design: [
          { label: "Picture-frame border & inlay", low: 1500, high: 3500 },
          { label: "Custom Pergola / Shade Structure", low: 7500, high: 18000 } 
        ],
        maintenance: [
          { label: "Clean & seal package (wood decks)", low: 650, high: 1800 }
        ]
      }
    },
    fence: {
      title: "Fence Install / Replacement",
      groups: {
        luxury: [
          { label: "Decorative aluminum / steel upgrade", low: 2800, high: 8500 },
          { label: "Horizontal cedar slat (Modern)", low: 3200, high: 9200 } 
        ],
        protection: [
          { label: "8ft Privacy height upgrade", low: 1500, high: 3500 },
          { label: "Concrete footer reinforcement", low: 850, high: 1800 }
        ],
        design: [
          { label: "Decorative post caps & trim", low: 550, high: 1500 },
          { label: "Lattice topper", low: 1200, high: 3200 }
        ],
        speed: [
          { label: "Temporary safety fence", low: 550, high: 1400 }
        ]
      }
    },
    waterproofing: {
      title: "Waterproofing",
      groups: {
        luxury: [
          { label: "Dual Battery backup sump system", low: 2200, high: 5800 }
        ],
        protection: [
          { label: "Interior French drain (Jackhammer)", low: 5800, high: 16000 }, 
          { label: "Full exterior excavation membrane", low: 12000, high: 35000 } 
        ],
        design: [
          { label: "Finished waterproof wall panels", low: 3500, high: 8500 }
        ]
      }
    },
    powerwash: {
      title: "Power Washing",
      groups: {
        luxury: [
          { label: "House + driveway + patio bundle", low: 650, high: 1800 } 
        ],
        protection: [
          { label: "Soft-wash roof treatment", low: 850, high: 2200 }
        ],
        design: [
          { label: "Paver sanding & sealing", low: 1200, high: 3500 }
        ],
        maintenance: [
          { label: "Seasonal wash contract (2x per year)", low: 850, high: 2200 }
        ]
      }
    },
    sidewalk: {
      title: "Sidewalk / DOT",
      groups: {
        luxury: [
          { label: "Colored concrete / decorative finish", low: 1200, high: 2800 }
        ],
        protection: [
          { label: "Steel mesh & fiber reinforcement", low: 950, high: 2200 },
          { label: "Tree root barrier & protection", low: 1500, high: 4200 }
        ],
        design: [
          { label: "Scored control joint pattern", low: 550, high: 1400 }
        ],
        speed: [
          { label: "Expedited DOT violation removal", low: 850, high: 2500 } 
        ]
      }
    },
    gutter: {
      title: "Gutters",
      groups: {
        luxury: [
          { label: "Copper or Galvalume gutters", low: 2500, high: 6500 } 
        ],
        protection: [
          { label: "Micro-mesh gutter guards", low: 1200, high: 3200 },
          { label: "New fascia board installation", low: 1500, high: 3800 }
        ],
        design: [
          { label: "Color-matched system", low: 550, high: 1200 }
        ],
        speed: [
          { label: "Same-day cleaning add-on", low: 350, high: 750 }
        ]
      }
    },
    painting: {
      title: "Interior Painting",
      groups: {
        luxury: [
          { label: "Wallpaper installation (per room)", low: 850, high: 2200 }, 
          { label: "Fine finish cabinet spray", low: 2500, high: 6500 }
        ],
        protection: [
          { label: "Full Level-5 skim coat", low: 2800, high: 7500 }, 
          { label: "Zero-VOC / Eco paint", low: 850, high: 2200 }
        ],
        design: [
          { label: "Color consult with samples", low: 450, high: 950 }
        ],
        speed: [
          { label: "Night or weekend painting", low: 1200, high: 3500 }
        ]
      }
    },
    flooring: {
      title: "Flooring",
      groups: {
        luxury: [
          { label: "Wide-plank / Herringbone install", low: 3500, high: 9500 }, 
          { label: "Radiant floor heating mats", low: 2500, high: 6500 } 
        ],
        protection: [
          { label: "Sound-proof cork underlayment", low: 1200, high: 3200 },
          { label: "Subfloor leveling & repair", low: 1500, high: 4500 }
        ],
        design: [
          { label: "Custom stair treads & risers", low: 2200, high: 5500 }
        ],
        speed: [
          { label: "Furniture moving & protection", low: 650, high: 1800 }
        ]
      }
    },
    drywall: {
      title: "Drywall",
      groups: {
        luxury: [
          { label: "Level 5 smooth finish (per room)", low: 2500, high: 6500 } 
        ],
        protection: [
          { label: "QuietRock / Sound-damping board", low: 1800, high: 5200 },
          { label: "Mold-resistant purple board", low: 950, high: 2800 }
        ],
        design: [
          { label: "Soffit / tray ceiling framing", low: 2800, high: 8200 }
        ],
        speed: [
          { label: "Dust-free sanding system", low: 850, high: 2200 }
        ]
      }
    },
    bathroom: {
      title: "Bathroom Remodel",
      groups: {
        luxury: [
          { label: "Frameless glass shower enclosure", low: 2200, high: 4800 },
          { label: "Heated floor system", low: 1800, high: 3500 },
          { label: "Wall-mounted vanity install", low: 1200, high: 2800 }
        ],
        protection: [
          { label: "Schluter-Kerdi waterproofing", low: 1500, high: 3800 },
          { label: "New subfloor & framing reinforcement", low: 1800, high: 4500 }
        ],
        design: [
          { label: "Floor-to-ceiling tile work", low: 3500, high: 8500 },
          { label: "LED niche & accent lighting", low: 850, high: 2200 }
        ],
        speed: [
          { label: "Expedited plumbing rough-in", low: 1500, high: 3500 } 
        ]
      }
    },
    kitchen: {
      title: "Kitchen Remodel",
      groups: {
        luxury: [
          { label: "Full height stone backsplash", low: 2500, high: 6500 },
          { label: "Waterfall island edge (Stone)", low: 3500, high: 8500 }, 
          { label: "Pot filler plumbing & install", low: 1200, high: 2800 }
        ],
        protection: [
          { label: "Under-cabinet LED lighting", low: 1200, high: 2800 },
          { label: "New subfloor & tile prep", low: 1800, high: 4500 }
        ],
        design: [
          { label: "Glass cabinet doors / inserts", low: 1200, high: 3200 },
          { label: "Custom range hood enclosure", low: 2500, high: 6800 }
        ],
        speed: [
          { label: "Temporary sink setup", low: 850, high: 2200 }
        ]
      }
    },
    handyman: {
      title: "Handyman",
      groups: {
        luxury: [
          { label: "Priority same-week booking", low: 250, high: 550 }
        ],
        protection: [
          { label: "Safety package (grab bars)", low: 350, high: 850 }
        ],
        design: [
          { label: "Decor hardware refresh", low: 450, high: 1200 }
        ],
        speed: [
          { label: "Evening/weekend window", low: 350, high: 750 }
        ]
      }
    },
    outdoor_living: {
      title: "Outdoor Living & Kitchens",
      groups: {
        luxury: [
          { label: "Built-in Pizza Oven", low: 3500, high: 8500 },
          { label: "Granite/Stone Counter Upgrade", low: 2500, high: 6500 }
        ],
        protection: [
          { label: "Gas Line Safety Shut-off & Permit", low: 1200, high: 2800 },
          { label: "Custom Canvas Cover", low: 650, high: 1800 }
        ],
        design: [
          { label: "Pergola / Shade Structure", low: 4500, high: 12500 },
          { label: "Under-counter LED lighting", low: 850, high: 2200 }
        ]
      }
    },
    hvac: {
      title: "HVAC / Climate",
      groups: {
        luxury: [
           { label: "Smart Thermostat Integration", low: 450, high: 950 },
           { label: "Invisible Slim-Duct Upgrade", low: 1500, high: 3200 }
        ],
        protection: [
           { label: "Extended Labor Warranty (5yr)", low: 850, high: 1800 },
           { label: "Condenser Cage / Guard", low: 350, high: 750 }
        ]
      }
    }
  };

  // --- FULL SERVICE DEFINITIONS (RESTORED) ---
  const SERVICES = {
    "masonry": {
      label: "Masonry/Concrete", emoji: "🧱", unit: "sq ft",
      baseLow: 16, baseHigh: 28, min: 2500,
      subQuestion: "Finish type?",
      options: [
        { label: "Standard Concrete ($)", factor: 1.0 },
        { label: "Pavers ($$)", factor: 1.6 },
        { label: "Natural Stone ($$$)", factor: 2.2 }
      ],
      sizePresets: [
        { label: "Sidewalk Flag (25 sq ft)", val: 25 },
        { label: "Small Patio (10x10)", val: 100 },
        { label: "Standard Backyard (20x20)", val: 400 },
        { label: "Large Driveway (50x20)", val: 1000 }
      ]
    },
    "driveway": {
      label: "Driveway", emoji: "🚗", unit: "sq ft",
      baseLow: 10, baseHigh: 20, min: 3500,
      subQuestion: "Current condition?",
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
    "hvac": {
      label: "HVAC / Mini-Splits", emoji: "❄️", unit: "fixed",
      subQuestion: "System Type?",
      options: [
        { label: "Single Zone Mini-Split", fixedLow: 4500, fixedHigh: 7500 },
        { label: "Multi-Zone (3-4 Heads)", fixedLow: 14000, fixedHigh: 22000 },
        { label: "Central Air Swap", fixedLow: 12000, fixedHigh: 18000 }
      ]
    },
    "junk_removal": {
      label: "Junk Removal", emoji: "🗑️", unit: "fixed",
      subQuestion: "Volume?", quickQuote: true,
      options: [
        { label: "1/4 Truck (Small)", fixedLow: 350, fixedHigh: 550 },
        { label: "1/2 Truck", fixedLow: 550, fixedHigh: 850 },
        { label: "Full Truck", fixedLow: 850, fixedHigh: 1400 }
      ]
    },
    "design": {
      label: "Design Services", emoji: "📐", unit: "fixed",
      subQuestion: "Service needed?",
      options: [
        { label: "3D Rendering / Concept", fixedLow: 850, fixedHigh: 2500 },
        { label: "Architectural Plans (Filing)", fixedLow: 3500, fixedHigh: 8500 },
        { label: "Interior Design Consult", fixedLow: 550, fixedHigh: 1500 }
      ]
    },
    "painting": {
      label: "Interior Paint", emoji: "🎨", unit: "sq ft",
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
      label: "Exterior Paint", emoji: "🖌", unit: "sq ft",
      baseLow: 2.5, baseHigh: 5.5, min: 3500,
      subQuestion: "Condition?",
      options: [
        { label: "Good Condition", factor: 1.0 },
        { label: "Peeling / Prep Needed", factor: 1.4 },
        { label: "Heavy Prep / Repairs", factor: 1.8 }
      ],
      sizePresets: [
        { label: "Garage Front", val: 200 },
        { label: "Small Facade", val: 400 },
        { label: "Full Detached House", val: 2500 }
      ]
    },
    "deck": {
      label: "Deck / Porch", emoji: "🪵", unit: "sq ft",
      baseLow: 35, baseHigh: 65, min: 5000,
      subQuestion: "Material?",
      options: [
        { label: "Pressure Treated", factor: 1.0 },
        { label: "Composite (Trex)", factor: 1.9 },
        { label: "PVC Luxury", factor: 2.4 }
      ],
      sizePresets: [
        { label: "Small Landing", val: 16 },
        { label: "Bistro Deck", val: 80 },
        { label: "Entertainer Deck", val: 320 }
      ]
    },
    "drywall": {
      label: "Drywall", emoji: "🛠", unit: "sq ft",
      baseLow: 3.2, baseHigh: 6.5, min: 750,
      subQuestion: "Scope?",
      options: [
        { label: "Minor Repairs", factor: 1.0 },
        { label: "Full Install", factor: 1.6 },
        { label: "Level 5 Finish", factor: 2.1 }
      ],
      sizePresets: [
        { label: "Patch", val: 50 },
        { label: "One Wall", val: 120 },
        { label: "Whole Room", val: 500 }
      ]
    },
    "flooring": {
      label: "Flooring", emoji: "🪚", unit: "sq ft",
      baseLow: 3.5, baseHigh: 9.5, min: 2500,
      subQuestion: "Type?",
      options: [
        { label: "Vinyl Plank", factor: 1.0 },
        { label: "Tile", factor: 1.8 },
        { label: "Hardwood", factor: 2.4 },
        { label: "Laminate", factor: 1.2 }
      ]
    },
    "powerwash": {
      label: "Power Washing", emoji: "💦", unit: "sq ft",
      baseLow: 0.35, baseHigh: 0.85, min: 250,
      quickQuote: true, // Quick Quote Mode
      sizePresets: [
        { label: "Deck / Patio Only", val: 300 },
        { label: "Siding (One Side)", val: 500 },
        { label: "Whole House", val: 2000 }
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
    "kitchen": {
      label: "Kitchen Remodel", emoji: "🍳", unit: "fixed",
      subQuestion: "Scope?",
      options: [
        { label: "Refresh (Cosmetic)", fixedLow: 18000, fixedHigh: 30000 },
        { label: "Mid-Range (Cabinets+)", fixedLow: 30000, fixedHigh: 55000 },
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
        { label: "Wood/Cedar Shake", factor: 1.8 },
        { label: "Fiber Cement (Hardie)", factor: 1.5 }
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
      ]
    },
    "waterproofing": {
      label: "Waterproofing", emoji: "💧", unit: "linear ft",
      baseLow: 40, baseHigh: 90, min: 2500,
      subQuestion: "Location?",
      options: [
        { label: "Exterior", factor: 1.0 },
        { label: "Interior", factor: 1.5 },
        { label: "Roof", factor: 1.8 }
      ]
    },
    "sidewalk": {
      label: "Sidewalk / DOT", emoji: "🚶", unit: "fixed",
      subQuestion: "Scope?",
      options: [
        { label: "Violation Repair", fixedLow: 3500, fixedHigh: 7500 },
        { label: "Front Stoop Rebuild", fixedLow: 6000, fixedHigh: 15000 },
        { label: "New Walkway", fixedLow: 45, fixedHigh: 85, isPerSqFt: true }
      ]
    },
    "outdoor_living": {
      label: "Outdoor Living", emoji: "🔥", unit: "fixed",
      subQuestion: "Type?",
      options: [
        { label: "Fire Pit Station", fixedLow: 3500, fixedHigh: 6500 },
        { label: "Outdoor Kitchen", fixedLow: 12000, fixedHigh: 25000 },
        { label: "Full Patio Setup", fixedLow: 25000, fixedHigh: 65000 }
      ]
    },
    "gutter": {
      label: "Gutter Install", emoji: "🩸", unit: "linear ft", baseLow: 15, baseHigh: 35, min: 1200, quickQuote: true,
      subQuestion: "Type?", options: [{ label: "Aluminum", factor: 1.0 }, { label: "Seamless", factor: 1.4 }, { label: "Copper", factor: 3.5 }]
    },
    "handyman": {
      label: "Small Repairs", emoji: "🛠", unit: "consult", quickQuote: true
    },
    "other": {
      label: "Other / Custom", emoji: "📋", unit: "consult"
    }
  };

  // --- STATE --------------------------------------------------
  let state = {
    estimateId: "", lang: "en", step: 0,
    serviceKey: null, subOption: null, size: 0, borough: null,
    isLeadHome: false, pricingMode: "full", isRush: false, promoCode: "",
    debrisRemoval: false, selectedAddons: [], 
    name: "", phone: "", projectTiming: "", leadSource: "",
    projects: [], interestedInMembership: false, isPhotoSkip: false 
  };
  let els = {};

  // --- INIT ---------------------------------------------------
  function init() {
    createInterface();
    startTicker();
    if (!sessionStorage.getItem("hb_auto_open")) {
        setTimeout(() => { if (!els.wrapper.classList.contains("hb-open")) toggleChat(); sessionStorage.setItem("hb_auto_open", "true"); }, 4000); 
    }
    state.estimateId = "EST-" + Math.floor(Math.random() * 100000);
    setTimeout(stepOne_Disclaimer, 800);
  }

  function createInterface() {
    const fab = document.createElement("div");
    fab.className = "hb-chat-fab";
    fab.innerHTML = `<span class="hb-fab-icon">⚡</span>`;
    fab.onclick = toggleChat;
    document.body.appendChild(fab);

    const wrapper = document.createElement("div");
    wrapper.className = "hb-chat-wrapper";
    wrapper.innerHTML = `
      <div class="hb-chat-header">
        <div class="hb-chat-title"><h3>Hammer Brick & Home</h3><span style="font-size:11px;color:#e7bf63">★★★★★ 5.0</span></div>
        <button class="hb-chat-close">×</button>
      </div>
      <div id="hb-ticker" style="background:#1c263b;color:#888;font-size:10px;padding:6px;white-space:nowrap;overflow:hidden;">Initializing...</div>
      <div class="hb-progress-container"><div class="hb-progress-bar" id="hb-prog"></div></div>
      <div class="hb-chat-body" id="hb-body"></div>
      <div class="hb-chat-footer"><input type="text" class="hb-chat-input" id="hb-input" disabled><button class="hb-chat-send" id="hb-send">➤</button></div>
    `;
    document.body.appendChild(wrapper);
    const photoInput = document.createElement("input");
    photoInput.type = "file"; photoInput.accept = "image/*"; photoInput.multiple = true; photoInput.style.display = "none"; photoInput.id = "hb-photo-input";
    document.body.appendChild(photoInput);

    els = { wrapper, fab, body: document.getElementById("hb-body"), input: document.getElementById("hb-input"), send: document.getElementById("hb-send"), prog: document.getElementById("hb-prog"), ticker: document.getElementById("hb-ticker"), close: wrapper.querySelector(".hb-chat-close"), photoInput };
    els.close.onclick = toggleChat;
    els.send.onclick = handleManualInput;
    photoInput.addEventListener("change", () => { if(photoInput.files.length) addBotMessage(`📷 ${photoInput.files.length} photos selected.`); });
  }

  function startTicker() {
      const msgs = ["⚡ Instant Estimate", "🛡️ NYC Licensed & Insured", "💳 VIP Members Save 10%", "📸 Text us photos"];
      let i = 0; els.ticker.innerText = msgs[0];
      setInterval(() => { i = (i + 1) % msgs.length; els.ticker.innerText = msgs[i]; }, 4000); 
  }

  function toggleChat() {
    const isOpen = els.wrapper.classList.toggle("hb-open");
    els.fab.style.display = isOpen ? "none" : "flex";
  }

  function getText(key) { return TEXT[state.lang][key] || TEXT['en'][key]; }

  function addBotMessage(text, isHtml) {
    const div = document.createElement("div");
    div.className = "hb-msg hb-msg-bot";
    div.innerHTML = isHtml ? text : text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    els.body.appendChild(div);
    els.body.scrollTop = els.body.scrollHeight;
  }

  function addUserMessage(text) {
    const div = document.createElement("div");
    div.className = "hb-msg hb-msg-user";
    div.textContent = text;
    els.body.appendChild(div);
    els.body.scrollTop = els.body.scrollHeight;
  }

  function addChoices(options, callback) {
    setTimeout(() => {
      const con = document.createElement("div"); con.className = "hb-chips";
      options.forEach(opt => {
        const btn = document.createElement("button"); btn.className = "hb-chip";
        btn.textContent = (typeof opt === "object") ? opt.label : opt;
        btn.onclick = () => { con.remove(); addUserMessage(btn.textContent); callback(opt); };
        con.appendChild(btn);
      });
      els.body.appendChild(con); els.body.scrollTop = els.body.scrollHeight;
    }, 600);
  }

  // --- FLOW ---------------------------------------------------

  function stepOne_Disclaimer() {
    addBotMessage(getText('welcome'));
    addBotMessage(getText('disclaimer') + `<b>${state.estimateId}</b>)`, true);
    addChoices([
        { label: "🚀 Start (English)", key: "en" }, 
        { label: "🇪🇸 Español", key: "es" },
        { label: "🇨🇳 中文", key: "cn" },
        { label: "🇷🇺 Русский", key: "ru" }
    ], (c) => {
        state.lang = c.key;
        addBotMessage(getText('projectType'));
        presentServiceOptions();
    });
  }

  function presentServiceOptions() {
    const opts = Object.keys(SERVICES).map(k => ({ label: SERVICES[k].emoji + " " + SERVICES[k].label, key: k }));
    opts.unshift({ label: getText('photoSkip'), key: "photo_skip" });
    addChoices(opts, (s) => {
      if (s.key === "photo_skip") {
          state.isPhotoSkip = true;
          addBotMessage(getText('photoSkipMsg'));
          els.photoInput.click();
          setTimeout(() => showLeadCapture(), 1000);
      } else {
          state.serviceKey = s.key;
          stepTwo_SubQuestions();
      }
    });
  }

  function stepTwo_SubQuestions() {
    const svc = SERVICES[state.serviceKey];
    if (svc.quickQuote) {
      addBotMessage(getText('quickVsFull'));
      addChoices([{label:getText('quickBtn'), k:"quick"}, {label:getText('fullBtn'), k:"full"}], (c) => {
        state.subOption = { factor: 1.0, label: "Standard" };
        if (c.k === "quick") { if(svc.unit === "consult") stepFive_Location(); else stepFour_Size(); } else proceedSub();
      });
      return;
    }
    proceedSub();
    function proceedSub() {
        if (svc.subQuestion && svc.options) {
          addBotMessage(svc.subQuestion);
          addChoices(svc.options, (c) => { state.subOption = c; stepThree_LeadCheck(); });
        } else if (state.serviceKey === "other") {
          stepFive_Location();
        } else {
          state.subOption = { factor: 1.0, label: "Standard" };
          stepThree_LeadCheck();
        }
    }
  }

  function stepThree_LeadCheck() {
    if (SERVICES[state.serviceKey].leadSensitive) {
      addBotMessage(getText('leadCheck'));
      addChoices(["Yes", "No"], (a) => { state.isLeadHome = (a === "Yes"); stepFour_Size(); });
    } else stepFour_Size();
  }

  function stepFour_Size() {
    const svc = SERVICES[state.serviceKey];
    if (svc.unit === "consult" || state.serviceKey === "other") {
        if(state.serviceKey==="other") { addBotMessage(getText('indoorOutdoor')); addChoices(["In", "Out", "Both"], stepFive_Location); return; }
        stepFive_Location(); return;
    }
    if (svc.unit !== "fixed" || (state.subOption||{}).isPerSqFt) {
      if (svc.sizePresets) {
        addBotMessage(getText('sizeAsk'));
        const presets = svc.sizePresets.map(p=>({label:p.label, val:p.val}));
        addChoices(presets, (c) => { state.size = c.val; stepFive_Location(); });
        setTimeout(() => enableInput((v) => { state.size = parseInt(v.replace(/\D/g,""))||500; stepFive_Location(); }), 1500);
      } else {
        addBotMessage(`${getText('sizeAsk')} (${svc.unit})`);
        enableInput((v) => { 
           const n = parseInt(v.replace(/\D/g,""));
           if(!n || n<10) { addBotMessage(getText('sizeLow')); stepFour_Size(); }
           else { state.size = n; stepFive_Location(); }
        });
      }
    } else stepFive_Location();
  }

  function stepFive_Location() {
    addBotMessage(getText('locationAsk'));
    addChoices(Object.keys(BOROUGH_MODS), (l) => {
      state.borough = l;
      addBotMessage(`${getText('checkSched')} ${l}...`);
      setTimeout(() => { addBotMessage(getText('schedOk')); stepSix_PricingMode(); }, 1500);
    });
  }

  function stepSix_PricingMode() {
    addBotMessage(getText('priceMode'));
    addChoices([{label:"Full", key:"full"}, {label:"Labor Only", key:"labor"}, {label:"Materials+", key:"materials"}], (c) => {
      state.pricingMode = c.key; stepSeven_Rush();
    });
  }

  function stepSeven_Rush() {
    addBotMessage(getText('rushAsk'));
    addChoices(["Yes", "No"], (a) => { state.isRush = (a === "Yes"); stepEight_Promo(); });
  }

  function stepEight_Promo() {
    addBotMessage(getText('promoAsk'));
    addChoices([{label:"No Code", c:""}, {label:"VIP10", c:"VIP10"}], (ch) => {
        if(!ch.c) { addBotMessage(getText('webSaverMsg')); state.promoCode = "WEBSAVER"; } 
        else state.promoCode = ch.c;
        stepNine_Debris();
    });
  }

  function stepNine_Debris() {
    if(SERVICES[state.serviceKey].unit !== "consult") {
        addBotMessage(getText('debrisAsk'));
        addChoices(["Yes", "No"], (a) => { state.debrisRemoval = (a === "Yes"); stepTen_SmartAddonsIntro(); });
    } else { state.debrisRemoval = false; stepTen_SmartAddonsIntro(); }
  }

  function stepTen_SmartAddonsIntro() {
    const config = SMART_ADDONS_CONFIG[state.serviceKey];
    if (config && config.groups) {
      addBotMessage(getText('addonIntro'));
      addChoices([{label:getText('viewAddons'), k:"yes"}, {label:getText('skip'), k:"no"}], (c) => {
        if(c.k === "yes") showAddonCategories(config); else finishItem();
      });
    } else finishItem();
  }

  function showAddonCategories(config) {
    const groups = Object.keys(config.groups).map(key => ({
      label: `📂 ${SMART_ADDON_GROUP_LABELS[key] || key.toUpperCase()}`,
      key: key
    }));
    groups.push({ label: getText('doneSel'), key: "done" });
    addBotMessage(getText('categorySel'));
    addChoices(groups, function(choice) {
      if (choice.key === "done") finishItem(); else showAddonItems(config, choice.key);
    });
  }

  function showAddonItems(config, groupKey) {
    const items = config.groups[groupKey] || [];
    const availableItems = items.filter(item => 
      !state.selectedAddons.some(sel => sel.label === item.label)
    ).map(item => ({
      label: `${item.label} (+$${item.low})`,
      itemData: item,
      group: groupKey
    }));

    availableItems.push({ label: getText('back'), isBack: true });

    addBotMessage(`**${SMART_ADDON_GROUP_LABELS[groupKey]||groupKey}**:`);
    addChoices(availableItems, function(choice) {
      if (choice.isBack) {
        showAddonCategories(config);
      } else {
        state.selectedAddons.push({ ...choice.itemData, group: choice.group });
        addBotMessage(`${getText('itemAdded')}: ${choice.itemData.label}`);
        setTimeout(() => showAddonCategories(config), 600);
      }
    });
  }

  function finishItem() {
    const est = computeEstimate();
    est.svcKey = state.serviceKey;
    state.projects.push(est);
    
    // FIX: Only show simple confirmation, not the full receipt yet
    addBotMessage(getText('itemAdded'));
    
    setTimeout(() => {
        addBotMessage(getText('anotherAsk'));
        addChoices([
            { label: getText('addMore'), k: "add" },
            { label: getText('finish'), k: "finish" }
        ], (c) => {
            if (c.k === "add") { resetItem(); addBotMessage(getText('projectType')); presentServiceOptions(); }
            else stepMembership();
        });
    }, 1000);
  }

  function stepMembership() {
    addBotMessage(getText('membershipAsk'));
    addChoices(["Yes", "No"], (a) => {
        if(a==="Yes") { state.interestedInMembership = true; addBotMessage(getText('membershipYes')); }
        showFinalQuote();
    });
  }

  // --- CALCULATION --------------------------------------------
  function computeEstimate() {
    const svc = SERVICES[state.serviceKey];
    const sub = state.subOption || {};
    const mod = BOROUGH_MODS[state.borough] || 1.0;
    let low=0, high=0;

    if (svc.unit === "fixed") {
        if(sub.isPerSqFt) {
             low = (sub.fixedLow||0) * state.size * mod;
             high = (sub.fixedHigh||0) * state.size * mod;
        } else {
             low = (sub.fixedLow || svc.baseLow) * mod; 
             high = (sub.fixedHigh || svc.baseHigh) * mod;
        }
    } else if (svc.unit !== "consult") {
        let l = svc.baseLow * (sub.factor||1), h = svc.baseHigh * (sub.factor||1);
        low = l * state.size * mod; high = h * state.size * mod;
        if(svc.min && low < svc.min) low = svc.min;
    }
    
    // Modifiers
    if(state.pricingMode === "labor") { low*=0.7; high*=0.7; }
    else if(state.pricingMode === "materials") { low*=0.5; high*=0.5; }
    
    if(state.isRush) { low*=1.15; high*=1.15; }
    if(state.promoCode) { const d = DISCOUNTS[state.promoCode]||0; low*=(1-d); high*=(1-d); }
    
    // Addons & Debris
    state.selectedAddons.forEach(a => { low += a.low*mod; high += a.high*mod; });
    if(state.debrisRemoval) { low += ADD_ON_PRICES.debrisRemoval.low*mod; high += ADD_ON_PRICES.debrisRemoval.high*mod; }

    return { svc, sub, size: state.size, borough: state.borough, low, high, addons: state.selectedAddons, debris: state.debrisRemoval };
  }

  function showFinalQuote() {
    let html = `<div class="hb-receipt"><h4>${getText('finish')}</h4>`;
    let tLow=0, tHigh=0;
    
    state.projects.forEach((p, i) => {
        tLow+=p.low; tHigh+=p.high;
        html += `<div class="hb-receipt-row"><span>#${i+1} ${p.svc.label}</span><span>$${Math.round(p.low).toLocaleString()} - $${Math.round(p.high).toLocaleString()}</span></div>`;
        if(p.addons.length) html += `<div style="font-size:10px;color:#888;margin-left:10px">+ ${p.addons.length} Add-ons</div>`;
    });

    html += `<div class="hb-receipt-total"><span>TOTAL:</span><span>$${Math.round(tLow).toLocaleString()} - $${Math.round(tHigh).toLocaleString()}</span></div>`;
    html += `<div class="hb-receipt-footer">${getText('finalNote')}</div></div>`;
    
    addBotMessage(html, true);
    setTimeout(() => showLeadCapture(), 1500);
  }

  function showLeadCapture() {
    addBotMessage(getText('contactIntro'));
    addBotMessage(getText('nameAsk'));
    enableInput((n) => {
        state.name = n;
        addBotMessage(getText('phoneAsk'));
        enableInput((p) => {
            const clean = p.replace(/\D/g, "");
            if(clean.length !== 10) { addBotMessage(getText('phoneErr')); setTimeout(showLeadCapture, 500); return; } 
            state.phone = clean.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
            askFinalDetails();
        });
    });
  }

  function askFinalDetails() {
      addBotMessage(getText('timingAsk'));
      addChoices(["ASAP", "1 Month", "Budgeting"], (t) => {
          state.projectTiming = t;
          addBotMessage(getText('sourceAsk'));
          addChoices(["Google", "Social", "Referral"], (s) => {
              state.leadSource = s;
              generateLinks();
          });
      });
  }

  function generateLinks() {
      const summary = state.projects.map((p,i) => `#${i+1} ${p.svc.label}: $${Math.round(p.low)}-$${Math.round(p.high)}`).join("\n");
      const body = encodeURIComponent(`Ref:${state.estimateId}\nName:${state.name}\nPhone:${state.phone}\n${summary}`);
      const sms = `sms:${PHONE_NUMBER}?&body=${body}`;
      const mail = `mailto:hammerbrickhome@gmail.com?subject=Estimate&body=${body}`;
      
      if(els.photoInput.files.length) addBotMessage(getText('photoRemind'), true);

      createBtn(getText('textBtn'), sms, true);
      createBtn(getText('emailBtn'), mail, true);
      createBtn(getText('callBtn'), `tel:${PHONE_NUMBER}`);
      
      const cp = document.createElement("button"); cp.className="hb-chip"; cp.textContent=getText('copyBtn');
      cp.onclick = () => { navigator.clipboard.writeText(decodeURIComponent(body)); cp.textContent="✅"; };
      els.body.appendChild(cp);
      
      const reset = document.createElement("button"); reset.className="hb-chip"; reset.style.background="#333"; reset.textContent=getText('startOver');
      reset.onclick = () => location.reload();
      els.body.appendChild(reset);
  }

  function createBtn(txt, url, isPri) {
      const b = document.createElement("a"); b.className = isPri ? "hb-chip hb-primary-btn" : "hb-chip";
      b.textContent = txt; b.href = url; b.style.display="block"; b.style.textAlign="center"; b.style.textDecoration="none";
      if(!url.startsWith("sms") && !url.startsWith("tel")) b.target="_blank";
      els.body.appendChild(b);
  }

  function enableInput(cb) {
    els.input.disabled=false; els.input.focus();
    els.send.onclick = () => { 
        const v=els.input.value.trim(); if(!v)return; 
        addUserMessage(v); els.input.value=""; els.input.disabled=true; cb(v); 
    };
  }

  function handleManualInput() { if(!els.input.disabled) els.send.click(); }
  function resetItem() { state.serviceKey=null; state.subOption=null; state.size=0; state.selectedAddons=[]; state.debrisRemoval=false; }

  document.addEventListener("DOMContentLoaded", init);

})();
