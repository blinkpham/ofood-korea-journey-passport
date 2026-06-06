import "./styles.css";

const STATE_KEY = "ofood-passport-prototype-state-v3-0606";
const COPY_KEY = "ofood-passport-prototype-copy-v3-0606";

const POSTCARD_COST = 10;
const LOC_WEEKDAY_COST = 2;
const LOC_WEEKEND_COST = 5;
const LOC_WEEKLY_CAP = 5;
const TODAY = "05/06/2026";

const iconFiles = Object.fromEntries(Object.entries(import.meta.glob("./assets/icons/*.svg", {
  eager: true,
  query: "?raw",
  import: "default"
})).map(([path, svg]) => [path.match(/\/([^/]+)\.svg$/)[1], svg]));

const frameFiles = {
  wheelPointer: new URL("./assets/frames/wheel-pointer.svg", import.meta.url).href,
  wheelMain: new URL("./assets/frames/wheel-main.svg", import.meta.url).href,
  wheelTravel: new URL("./assets/frames/wheel-travel.svg", import.meta.url).href,
  wheelVoucherWeekday: new URL("./assets/frames/wheel-voucher-weekday.svg", import.meta.url).href,
  wheelVoucherWeekend: new URL("./assets/frames/wheel-voucher-weekend.svg", import.meta.url).href,
  passportCanvas: new URL("./assets/frames/passport-canvas-frame.svg", import.meta.url).href,
  voucherWeekday: new URL("./assets/frames/voucher-frame-weekday.svg", import.meta.url).href,
  voucherWeekend: new URL("./assets/frames/voucher-frame-weekend.svg", import.meta.url).href,
  postcard: new URL("./assets/frames/postcard-frame.svg", import.meta.url).href
};

const illustrationFiles = {
  loginCharacter: new URL("./assets/illustrations/login-character.svg", import.meta.url).href,
  qrPack: new URL("./assets/illustrations/qr-pack.svg", import.meta.url).href,
  travelRewardTag: new URL("./assets/illustrations/travel-reward-tag.svg", import.meta.url).href,
  postcardNamsan: new URL("./assets/illustrations/postcard-namsan.svg", import.meta.url).href,
  postcardGyeongbok: new URL("./assets/illustrations/postcard-gyeongbok.svg", import.meta.url).href,
  postcardJeju: new URL("./assets/illustrations/postcard-jeju.svg", import.meta.url).href
};

const postcardPool = [
  { id: "namsan", title: "Bưu thiếp Namsan", hangul: "남산서울타워", image: illustrationFiles.postcardNamsan },
  { id: "gyeongbok", title: "Bưu thiếp Gyeongbok", hangul: "경복궁", image: illustrationFiles.postcardGyeongbok },
  { id: "bukchon", title: "Bưu thiếp Bukchon", hangul: "북촌한옥마을", image: illustrationFiles.postcardGyeongbok },
  { id: "jeju", title: "Bưu thiếp Jeju", hangul: "제주도", image: illustrationFiles.postcardJeju },
  { id: "cherry", title: "Bưu thiếp Hoa anh đào", hangul: "벚꽃길", image: illustrationFiles.postcardNamsan }
];

const travelRewards = [
  { title: "Túi đựng phụ kiện du lịch", tier: "Phổ biến", body: "Gọn dây sạc, khăn giấy, snack và vé nhỏ cho chuyến đi của mẹ con." },
  { title: "Gối cổ du lịch O'Food", tier: "Phổ biến", body: "Một món nhỏ nhưng hữu ích cho xe khách, máy bay hoặc buổi outing cuối tuần." },
  { title: "Bộ bento picnic", tier: "Khá hiếm", body: "Chuẩn bị món ăn nhẹ cùng O'Food cho những buổi đi chơi gia đình." },
  { title: "Set hành trang Hàn Quốc", tier: "Hiếm", body: "Một bộ vật dụng chuẩn bị chuyến đi, đúng tinh thần tiến gần Hàn Quốc cùng con." }
];

const voucherTiers = {
  weekday: [5, 10, 15, 20],
  weekend: [10, 20, 30, 40]
};

const initialState = {
  view: "scan",
  previousView: "scan",
  mapOpen: false,
  demoOpen: false,
  settingsOpen: false,
  ugcOpen: false,
  passportLayoutMode: "tidy",
  selectedPassportItemId: null,
  activeRecipeId: null,
  passportCanvasPositions: {},
  passportCanvasItemOrder: [],
  notice: null,
  spinType: null,
  spinPhase: "ready",
  spinResult: null,
  spinRotation: 0,
  activePostcards: 9,
  activeLoc: 3,
  claimedToday: false,
  voucherSpinUsed: {
    weekday: false,
    weekend: false
  },
  dayMode: "auto",
  forcedMain: "postcard-3",
  forcedVoucher: "auto",
  winXInstalled: false,
  winXLinked: false,
  winXAccountId: "",
  activeVoucherId: null,
  passportFilter: "all",
  ugcDraft: "",
  profile: {
    name: "Mẹ O'Food",
    userId: "OF-2026-0605"
  },
  settings: {
    zns: true,
    camera: true,
    winx: false
  },
  postcards: [],
  locEntries: [
    item("loc", "Lộc món ngon", "Đăng nhập hằng ngày", "03/06/2026"),
    item("loc", "Lộc món ngon", "Đăng nhập hằng ngày", "04/06/2026"),
    item("loc", "Lộc món ngon", "Đăng nhập hằng ngày", "05/06/2026")
  ],
  travelRewards: [
    item("travel", "Túi đựng phụ kiện du lịch", "Quà Hành Trang", "01/06/2026")
  ],
  vouchers: [
    voucher(20, "weekday", "WXM20-0605", "Sẵn sàng đổi", "05/06/2026")
  ],
  ugcSubmissions: [],
  history: [
    item("postcard", "Nhận 3 Bưu thiếp", "Bưu thiếp dùng để quay Hành Trang.", "03/06/2026"),
    item("loc", "Lộc món ngon", "Đăng nhập hôm nay", "04/06/2026"),
    item("voucher", "Voucher WinMart 20%", "Chờ đổi qua WinX", "05/06/2026")
  ]
};

let state = loadState();
let copyStore = loadCopy();
let spinTimer = null;
let lastRenderedView = null;
let lastModalKey = null;
let pendingCelebrate = null;
let pendingSpin = null;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const motionOK = () => !reducedMotion.matches;

const app = document.querySelector("#app");
render();

// Escape closes the topmost overlay (sheet, modal, drawer, or spin). Added once
// at the document level so it is not re-bound on every render.
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (document.activeElement?.isContentEditable) return;
  if (state.activeRecipeId) state.activeRecipeId = null;
  else if (state.activeVoucherId) state.activeVoucherId = null;
  else if (state.settingsOpen) state.settingsOpen = false;
  else if (state.mapOpen) state.mapOpen = false;
  else if (state.demoOpen) state.demoOpen = false;
  else if (state.view.startsWith("spin")) closeSpin();
  else return;
  saveState();
  render();
});

function item(type, title, body, date = TODAY) {
  return {
    id: `${type}-${slug(title)}-${date.replaceAll("/", "")}-${Math.random().toString(16).slice(2, 6)}`,
    type,
    title,
    body,
    date
  };
}

function voucher(value, mode, code, status = "Sẵn sàng đổi", date = TODAY) {
  return {
    id: `voucher-${code}`,
    type: "voucher",
    value,
    mode,
    code,
    status,
    date,
    points: value * 1000,
    terms: mode === "weekend" ? "Áp dụng T7-CN tại siêu thị được chọn, có mức chi tối thiểu." : "Áp dụng trong tuần tại cửa hàng hợp lệ, dùng trước 23:59 Chủ nhật."
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STATE_KEY));
    return saved ? mergeState(saved) : structuredClone(initialState);
  } catch {
    return structuredClone(initialState);
  }
}

function mergeState(saved) {
  const validPassportFilters = ["all", "loc", "travel", "voucher"];
  return {
    ...structuredClone(initialState),
    ...saved,
    profile: { ...structuredClone(initialState.profile), ...(saved.profile || {}) },
    settings: { ...structuredClone(initialState.settings), ...(saved.settings || {}) },
    voucherSpinUsed: { ...structuredClone(initialState.voucherSpinUsed), ...(saved.voucherSpinUsed || {}) },
    passportLayoutMode: saved.passportLayoutMode || initialState.passportLayoutMode,
    selectedPassportItemId: saved.selectedPassportItemId || null,
    activeRecipeId: saved.activeRecipeId || null,
    passportFilter: validPassportFilters.includes(saved.passportFilter) ? saved.passportFilter : "all",
    passportCanvasPositions: { ...structuredClone(initialState.passportCanvasPositions), ...(saved.passportCanvasPositions || {}) },
    passportCanvasItemOrder: Array.isArray(saved.passportCanvasItemOrder) ? saved.passportCanvasItemOrder : structuredClone(initialState.passportCanvasItemOrder),
    postcards: Array.isArray(saved.postcards) ? saved.postcards : structuredClone(initialState.postcards),
    locEntries: Array.isArray(saved.locEntries) ? saved.locEntries : structuredClone(initialState.locEntries),
    travelRewards: Array.isArray(saved.travelRewards) ? saved.travelRewards : structuredClone(initialState.travelRewards),
    vouchers: Array.isArray(saved.vouchers) ? saved.vouchers : structuredClone(initialState.vouchers),
    ugcSubmissions: Array.isArray(saved.ugcSubmissions) ? saved.ugcSubmissions : [],
    history: Array.isArray(saved.history) ? saved.history : structuredClone(initialState.history)
  };
}

function loadCopy() {
  try {
    return JSON.parse(localStorage.getItem(COPY_KEY)) || {};
  } catch {
    return {};
  }
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function saveCopy() {
  localStorage.setItem(COPY_KEY, JSON.stringify(copyStore));
}

function render() {
  const isSpin = state.view.startsWith("spin");
  // Preserve scroll position across in-place re-renders (claim, filter,
  // open sheet, toggle, etc.) so the screen does not jump to the top.
  const prevScroll = app.querySelector(".screen, .spin-screen")?.scrollTop || 0;
  app.innerHTML = `
    <main class="stage">
      <section class="phone-shell" aria-label="O'Food Korea Journey mini app">
        <div class="status-bar" aria-hidden="true"><span>9:41</span><span>● ● ●</span></div>
        <div class="app ${isSpin ? "is-spin" : ""}">
          ${isSpin ? "" : renderHeader()}
          ${renderView()}
          ${isSpin ? "" : renderBottomNav()}
          ${renderMapDrawer()}
          ${renderDemoDrawer()}
          ${state.settingsOpen ? renderSettingsModal() : ""}
          ${state.activeVoucherId ? renderWinXSheet() : ""}
          ${state.activeRecipeId ? renderRecipeModal() : ""}
        </div>
      </section>
    </main>
  `;
  const viewChanged = state.view !== lastRenderedView;
  lastRenderedView = state.view;
  const screenEl = app.querySelector(".screen, .spin-screen");
  if (viewChanged) {
    if (motionOK()) screenEl?.classList.add("view-enter");
  } else if (screenEl && prevScroll) {
    screenEl.scrollTop = prevScroll;
  }
  bindEvents();
  runCountUp(viewChanged);
  // Attach the wheel animation to the final rendered rotor (act() re-renders
  // after the handler, so animating inside runSpin would orphan the element).
  if (pendingSpin) {
    const spin = pendingSpin;
    pendingSpin = null;
    animateWheel(spin.type, spin.fromDeg, spin.toDeg);
  }
  if (pendingCelebrate) {
    celebrate(pendingCelebrate);
    pendingCelebrate = null;
  }
  // Move keyboard focus into a modal/sheet when it first opens.
  const modalKey = state.activeRecipeId ? "recipe" : state.activeVoucherId ? "winx" : state.settingsOpen ? "settings" : null;
  if (modalKey && modalKey !== lastModalKey) {
    app.querySelector(".sheet-close")?.focus();
  }
  lastModalKey = modalKey;
}

function runCountUp(active) {
  document.querySelectorAll("[data-count-to]").forEach((el) => {
    const to = Number(el.dataset.countTo);
    const suffix = el.dataset.countSuffix || "";
    if (!active || !motionOK() || !Number.isFinite(to) || to <= 0) {
      el.textContent = `${Number.isFinite(to) ? to : el.textContent}${suffix}`;
      return;
    }
    const start = performance.now();
    const duration = 540;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(eased * to)}${suffix}`;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function celebrate(kind) {
  if (!motionOK()) return;
  const host = document.querySelector(".app");
  if (!host) return;
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  const colors = ["var(--red)", "var(--green)", "var(--yellow)", "var(--gold)", "#65ff9a"];
  const count = kind === "big" ? 28 : 16;
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    const x = 6 + Math.random() * 88;
    const delay = Math.random() * 140;
    const rot = Math.random() * 140 - 70;
    const dur = 900 + Math.random() * 520;
    piece.style.cssText = `left:${x}%;background:${colors[i % colors.length]};--rot:${rot}deg;animation-delay:${delay}ms;animation-duration:${dur}ms;`;
    layer.appendChild(piece);
  }
  host.appendChild(layer);
  window.setTimeout(() => layer.remove(), 1800);
}

function renderHeader() {
  return `
    <header class="topbar">
      <button class="icon-btn" data-action="toggle-map" aria-label="Mở bản đồ chức năng">${icon("map", "Bản đồ")}</button>
      <button class="brand" data-view="scan" aria-label="Về Quét QR">${copy("brand", "O'Food", "strong")}</button>
      <button class="passport-pill ${state.view === "passport" ? "active" : ""}" data-view="passport">
        ${icon("passport", "Passport")}<span>${copy("nav.passport.short", "Passport", "span")}</span>
      </button>
    </header>
  `;
}

function renderBottomNav() {
  const nav = [
    ["travel", "Hành trang", "travel"],
    ["scan", "Quét QR", "qr"],
    ["loc", "Tích lộc", "loc"]
  ];
  return `
    <nav class="bottom-nav" aria-label="Điều hướng chính">
      ${nav.map(([view, label, iconName]) => `
        <button class="${state.view === view ? "active" : ""} ${view === "scan" ? "scan-tab" : ""}" data-view="${view}">
          ${icon(iconName, label, view === "scan" ? "nav-contrast" : "nav-red")}
          <span>${label}</span>
        </button>
      `).join("")}
    </nav>
  `;
}

function renderView() {
  if (state.view === "travel") return renderTravel();
  if (state.view === "loc") return renderLoc();
  if (state.view === "passport") return renderPassport();
  if (state.view === "spin-main") return renderSpin("main");
  if (state.view === "spin-travel") return renderSpin("travel");
  if (state.view === "spin-voucher-weekday") return renderSpin("voucher-weekday");
  if (state.view === "spin-voucher-weekend") return renderSpin("voucher-weekend");
  return renderScan();
}

function renderScan() {
  return `
    <section class="screen scan-screen">
      ${renderNotice()}
      ${renderFormula("scan", "01", "qr", "mã QR", "01", "spin", "lượt quay May Mắn", "Mã QR nằm bên trong gói O'Food. Mỗi mã hợp lệ mở một lượt quay.")}

      <article class="scanner-hero">
        <div class="scanner-copy">
          ${copy("scan.title", "Quét QR trong gói O'Food", "h1")}
          ${copy("scan.body", "Đưa mã vào khung camera để mở Vòng Quay May Mắn.", "p")}
        </div>
        <img class="qr-pack-illustration" src="${illustrationFiles.qrPack}" alt="Gói O'Food có mã QR" loading="lazy" />
        <button class="scan-frame" data-scan-capture aria-label="Quét mã QR để mở Vòng Quay May Mắn">
          <span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>
          <span class="qr-medallion" aria-hidden="true">${icon("qr", "QR", "scanner-qr")}</span>
          <span class="scan-line" aria-hidden="true"></span>
        </button>
        <div class="scan-tools" aria-label="Công cụ quét">
          <button data-action="notice-help">${icon("help", "Trợ giúp")}<span>Trợ giúp</span></button>
          <button data-action="notice-gallery">${icon("gallery", "Thư viện")}<span>Thư viện</span></button>
        </div>
      </article>

      <section class="purchase-ticket">
        <div class="ticket-image">${icon("postcard", "Bưu thiếp")}</div>
        <div>
          ${copy("scan.prize.title", "Kết quả có thể nhận", "h2")}
          ${copy("scan.prize.body", "Cơ hội Voucher du lịch Hàn Quốc 50tr mỗi tuần, hoặc 01-05 Bưu thiếp hành trình để đổi Hành Trang.", "p")}
        </div>
      </section>

      ${renderRecent("scan", "Gần đây", state.history.slice(0, 2), "Xem tất cả trong Passport")}
    </section>
  `;
}

function renderTravel() {
  const ready = state.activePostcards >= POSTCARD_COST;
  const need = Math.max(0, POSTCARD_COST - state.activePostcards);
  return `
    <section class="screen">
      ${renderNotice()}
      ${renderFormula("travel", String(POSTCARD_COST).padStart(2, "0"), "postcard", "Bưu thiếp", "01", "travel", "lượt quay Hành Trang", "Bưu thiếp là điểm đổi lượt Hành Trang, không hiển thị trong Passport.")}

      <article class="progress-object postcard-object">
        <div class="progress-head">
          <div class="object-stack">${icon("postcard", "Bưu thiếp")}</div>
          <div>
            ${copy("travel.title", "Hành trang cho chuyến đi", "h1")}
            ${copy("travel.body", "Gom Bưu thiếp hành trình để nhận quà tiện ích cho mẹ và con.", "p")}
          </div>
        </div>
        <div class="large-meter">
          <strong data-count-to="${state.activePostcards}" data-count-suffix="/${POSTCARD_COST}">${state.activePostcards}/${POSTCARD_COST}</strong>
          <span>${ready ? "Đã đủ lượt quay" : `Cần thêm ${need} Bưu thiếp`}</span>
        </div>
        ${renderMilestones(state.activePostcards, POSTCARD_COST)}
        <div class="postcard-strip">${postcardPool.slice(0, 5).map((place, index) => renderMiniPostcard(place, index < Math.min(state.activePostcards, 5))).join("")}</div>
        <button class="primary green" data-action="${ready ? "open-spin-travel" : "go-scan"}">${ready ? "Quay Hành Trang" : "Quét thêm gói O'Food"}</button>
      </article>

      ${renderRecent("travel", "Quà Hành Trang gần đây", state.travelRewards.slice(0, 2), "Xem quà trong Passport")}
    </section>
  `;
}

function renderLoc() {
  return `
    <section class="screen">
      ${renderNotice()}
      ${renderFormula("loc-login", "01", "bell", "đăng nhập", "01", "loc", "Lộc", "Zalo ZNS nhắc mẹ đăng nhập mỗi ngày. Tối đa 05 Lộc mỗi tuần, sau đó reset tuần mới.")}

      <article class="daily-panel">
        <div class="daily-illustration"><img src="${illustrationFiles.loginCharacter}" alt="Nhân vật Lộc món ngon" loading="lazy" /></div>
        <div class="daily-copy">
          ${copy("loc.title", "Tích lộc món ngon", "h1")}
          ${copy("loc.body", "Đăng nhập mỗi ngày để nhận 01 Lộc, tối đa 05 Lộc trong tuần. Lộc mở lượt quay Voucher WinMart để mua thêm O'Food.", "p")}
        </div>
        <button class="primary green" data-action="claim-loc" ${state.claimedToday || state.activeLoc >= LOC_WEEKLY_CAP ? "disabled" : ""}>${state.activeLoc >= LOC_WEEKLY_CAP ? "Đã đủ 05 Lộc tuần này" : state.claimedToday ? "Đã nhận hôm nay" : "Nhận 01 Lộc"}</button>
      </article>

      <article class="loc-wallet">
        <div class="balance-chip">${icon("loc", "Lộc")}<strong data-count-to="${state.activeLoc}" data-count-suffix="/${LOC_WEEKLY_CAP}">${state.activeLoc}/${LOC_WEEKLY_CAP}</strong><span>Lộc tuần này</span></div>
        ${renderMilestones(state.activeLoc, LOC_WEEKLY_CAP)}
        <div class="voucher-options">
          ${renderVoucherOption("weekday", "Voucher Trong Tuần", LOC_WEEKDAY_COST, "5%, 10%, 15%, 20%")}
          ${renderVoucherOption("weekend", "Voucher Cuối Tuần", LOC_WEEKEND_COST, "10%, 20%, 30%, 40%")}
        </div>
      </article>

      ${renderRecent("loc", "Lịch sử Tích lộc", [...state.locEntries, ...state.vouchers].slice(0, 2), "Xem ví trong Passport")}
    </section>
  `;
}

function renderVoucherOption(mode, title, cost, values) {
  const weekend = mode === "weekend";
  const used = state.voucherSpinUsed?.[mode];
  const ready = state.activeLoc >= cost && !used;
  return `
    <section class="voucher-option ${weekend ? "weekend" : ""}">
      <div>
        <span class="option-label">${weekend ? "Cần đủ 05 Lộc" : "Cần 02 Lộc"}</span>
        <h2>${title}</h2>
        <p>${String(cost).padStart(2, "0")} Lộc trong tuần = 01 lượt quay. Giải ${values}.</p>
      </div>
      <button class="primary ${ready ? "green" : "muted"}" data-action="${weekend ? "open-spin-voucher-weekend" : "open-spin-voucher-weekday"}" ${ready ? "" : "disabled"}>${used ? "Đã dùng lượt tuần này" : ready ? "Quay ngay" : `Cần ${cost - state.activeLoc} Lộc`}</button>
    </section>
  `;
}

function renderPassport() {
  const entries = passportEntries();
  const filtered = state.passportFilter === "all" ? entries : entries.filter((entry) => entry.type === state.passportFilter);
  const selectedCanvasItem = passportCanvasItems().find((entry) => entry.id === state.selectedPassportItemId);
  return `
    <section class="screen passport-screen">
      ${renderNotice()}
      <article class="profile-card">
        <div class="avatar">Mẹ</div>
        <div>
          ${copy("passport.name", state.profile.name, "h1")}
          <p><span class="id-chip">UserID ${state.profile.userId}</span></p>
        </div>
        <button class="icon-btn" data-action="open-settings" aria-label="Cài đặt">${icon("settings", "Cài đặt")}</button>
      </article>

      <article class="passport-canvas">
        <div class="passport-title">
          <div>
            ${copy("passport.title", "Passport của tôi", "h1")}
            ${copy("passport.body", "Theo dõi Lộc món ngon đã nhận trong tuần. Ví bên dưới lưu quà, voucher và hướng dẫn đổi thưởng.", "p")}
          </div>
        <button class="icon-btn light" data-action="share-passport" aria-label="Chia sẻ">${icon("share", "Chia sẻ")}</button>
        </div>
        <div class="passport-canvas-shell">
          <div class="memory-collage ${state.passportLayoutMode}" data-passport-canvas>
            ${passportCanvasItems().map(renderPassportCanvasItem).join("")}
          </div>
        </div>
        <div class="passport-layout-controls" aria-label="Sắp xếp Passport">
          ${renderLayoutButton("tidy", "Sắp gọn")}
          ${renderLayoutButton("free", "Tự sắp xếp")}
          ${renderLayoutButton("timeline", "Theo ngày")}
        </div>
        ${selectedCanvasItem ? renderCanvasDetail(selectedCanvasItem) : ""}
      </article>

      <section class="ugc-panel ${state.ugcOpen ? "open" : ""}">
        <button class="ugc-toggle" data-action="toggle-ugc" aria-expanded="${state.ugcOpen}">
          <span>${icon("ugc", "UGC")}<b>Gửi bài TikTok challenge</b></span>
          <small>${state.ugcSubmissions.length ? `${state.ugcSubmissions.length} bài đã gửi` : "Mở guideline và gửi link"}</small>
        </button>
        <div class="ugc-content">
          <div>
            ${copy("ugc.title", "Tham gia cùng tài khoản của mẹ", "h2")}
            ${copy("ugc.body", "Xem guideline bên ngoài, đăng TikTok bằng tài khoản của mẹ, rồi gửi link để O'Food ghi nhận.", "p")}
          </div>
          <label class="ugc-input">
            <span>Link TikTok</span>
            <input data-field="ugcDraft" value="${escapeAttr(state.ugcDraft)}" placeholder="https://www.tiktok.com/..." />
          </label>
          <div class="split-actions">
            <button class="secondary" data-action="notice-guideline">Xem guideline</button>
            <button class="primary red" data-action="submit-ugc">Gửi link</button>
          </div>
        </div>
      </section>

      <section class="passport-drawer">
        <div class="filter-row">
          ${[
            ["all", "Tất cả"],
            ["loc", "Lộc"],
            ["travel", "Hành Trang"],
            ["voucher", "Voucher"]
          ].map(([key, label]) => `<button class="${state.passportFilter === key ? "active" : ""}" data-filter="${key}">${label}</button>`).join("")}
        </div>
        <div class="wallet-list">${filtered.map(renderPassportRow).join("") || renderEmpty(state.passportFilter)}</div>
      </section>
    </section>
  `;
}

function renderSpin(type) {
  const meta = spinMeta(type);
  const blocked = (meta.cost && meta.balance < meta.cost) || meta.used;
  return `
    <section class="spin-screen ${type}">
      <header class="spin-head">
        <button class="icon-btn" data-action="close-spin" aria-label="Đóng">×</button>
        <h1>${meta.title}</h1>
        <button class="passport-pill small" data-view="passport">${icon("passport", "Passport")}</button>
      </header>
      ${renderFormula(`spin-${type}`, meta.leftNumber, meta.leftIcon, meta.leftLabel, "01", meta.rightIcon, meta.rightLabel, meta.hint)}
      <div class="wheel-stage ${state.spinPhase}" style="--turn:${state.spinRotation}deg">
        <img class="wheel-pointer" src="${frameFiles.wheelPointer}" alt="" aria-hidden="true" />
        <div class="wheel-rotor">
          <img class="wheel-art" src="${frameFiles[meta.wheelAsset]}" alt="" aria-hidden="true" />
          <span class="wheel-center">${icon(meta.wheelIcon, meta.title)}<b>${meta.center}</b></span>
        </div>
      </div>
      <section class="spin-panel">
        ${state.spinResult
          ? renderSpinResult(meta)
          : state.spinPhase === "spinning"
            ? `<p>${meta.body}</p><button class="primary red full is-loading" disabled aria-live="polite">Đang quay…</button>`
            : `<p>${meta.body}</p><button class="primary red full" data-action="run-spin" ${blocked ? "disabled" : ""}>${blocked ? meta.blocked : "Quay ngay"}</button>`}
      </section>
    </section>
  `;
}

function renderSpinResult(meta) {
  const result = state.spinResult;
  return `
    <article class="result-card">
      <div class="result-icon">${icon(result.icon, "Kết quả")}</div>
      <h2>${result.title}</h2>
      <p>${result.body}</p>
      <div class="result-ledger">${result.ledger}</div>
      <div class="split-actions">
        <button class="primary green" data-action="${result.primaryAction}">${result.primaryLabel}</button>
        <button class="secondary" data-action="close-spin">Đóng</button>
      </div>
    </article>
  `;
}

function spinMeta(type) {
  if (type === "main") {
    return {
      title: "Vòng Quay May Mắn",
      cost: 0,
      balance: 1,
      leftNumber: "01",
      leftIcon: "qr",
      leftLabel: "mã QR",
      rightIcon: "spin",
      rightLabel: "lượt quay May Mắn",
      hint: "Trúng Voucher du lịch Hàn Quốc 50tr mỗi tuần, hoặc nhận 01-05 Bưu thiếp.",
      body: "Mỗi gói O'Food hợp lệ biến thành một lượt quay có ý nghĩa thương mại và cảm xúc.",
      wheelIcon: "qr",
      wheelAsset: "wheelMain",
      center: "QR"
    };
  }
  if (type === "travel") {
    return {
      title: "Vòng Quay Hành Trang",
      cost: POSTCARD_COST,
      balance: state.activePostcards,
      blocked: `Cần thêm ${POSTCARD_COST - state.activePostcards} Bưu thiếp`,
      leftNumber: String(POSTCARD_COST).padStart(2, "0"),
      leftIcon: "postcard",
      leftLabel: "Bưu thiếp",
      rightIcon: "travel",
      rightLabel: "lượt quay Hành Trang",
      hint: "Đổi quà tiện ích đi chơi, picnic, chuẩn bị chuyến Hàn Quốc.",
      body: "Bưu thiếp là điểm đổi lượt Hành Trang, còn Passport tập trung lưu Lộc, quà và voucher.",
      wheelIcon: "travel",
      wheelAsset: "wheelTravel",
      center: "Quà"
    };
  }
  const weekend = type === "voucher-weekend";
  const mode = weekend ? "weekend" : "weekday";
  return {
    title: weekend ? "Vòng Quay Voucher Cuối Tuần" : "Vòng Quay Voucher Trong Tuần",
    cost: weekend ? LOC_WEEKEND_COST : LOC_WEEKDAY_COST,
    balance: state.activeLoc,
    used: state.voucherSpinUsed?.[mode],
    blocked: state.voucherSpinUsed?.[mode] ? "Đã dùng lượt tuần này" : `Cần thêm ${(weekend ? LOC_WEEKEND_COST : LOC_WEEKDAY_COST) - state.activeLoc} Lộc`,
    leftNumber: weekend ? "05" : "02",
    leftIcon: "loc",
    leftLabel: "Lộc",
    rightIcon: "voucher",
    rightLabel: "lượt quay Voucher",
    hint: weekend ? "05 Lộc tích trong tuần mở một lượt Voucher Cuối Tuần: 10%, 20%, 30%, 40%." : "02 Lộc tích trong tuần mở một lượt Voucher Trong Tuần: 5%, 10%, 15%, 20%.",
    body: "Lộc tuần này không bị trừ khi quay. Mỗi loại voucher chỉ có một lượt trong tuần.",
    wheelIcon: "voucher",
    wheelAsset: weekend ? "wheelVoucherWeekend" : "wheelVoucherWeekday",
    center: "Win"
  };
}

function renderMapDrawer() {
  return `
    <aside class="map-drawer ${state.mapOpen ? "open" : ""}" aria-label="Bản đồ chức năng">
      <div class="drawer-head">
        <h2>Bản đồ mini app</h2>
        <button class="icon-btn" data-action="toggle-map" aria-label="Đóng">×</button>
      </div>
      ${mapAction("scan", "Muốn quét gói mới?", "Mở camera QR để vào Vòng Quay May Mắn.", "Quét QR")}
      ${mapAction("travel", "Đủ Bưu thiếp rồi?", "Dùng 10 Bưu thiếp để quay Hành Trang.", "Hành trang")}
      ${mapAction("loc", "Muốn nhận Lộc hôm nay?", "Đăng nhập và tích 01 Lộc món ngon.", "Tích lộc")}
      ${mapAction("passport", "Muốn dùng Voucher WinMart?", "Mở ví voucher và hướng dẫn đổi qua WinX.", "Passport")}
      ${mapAction("passport", "Muốn gửi TikTok challenge?", "Gửi link TikTok để O'Food ghi nhận bài dự thi.", "Gửi UGC")}
    </aside>
  `;
}

function mapAction(view, title, body, cta) {
  return `
    <button class="map-route" data-map-view="${view}">
      <span>${title}</span>
      <small>${body}</small>
      <b>${cta}</b>
    </button>
  `;
}

function renderDemoDrawer() {
  return `
    <aside class="demo ${state.demoOpen ? "open" : ""}">
      <button class="demo-tab" data-action="toggle-demo">Demo</button>
      <div class="demo-body">
        <label>Bưu thiếp<select data-demo="activePostcards">${[0, 9, 10, 19].map((n) => `<option value="${n}" ${state.activePostcards === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
        <label>Lộc tuần<select data-demo="activeLoc">${[0, 1, 2, 3, 5].map((n) => `<option value="${n}" ${state.activeLoc === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
        <label>Main<select data-demo="forcedMain"><option value="postcard-1" ${state.forcedMain === "postcard-1" ? "selected" : ""}>+1 Bưu thiếp</option><option value="postcard-3" ${state.forcedMain === "postcard-3" ? "selected" : ""}>+3 Bưu thiếp</option><option value="postcard-5" ${state.forcedMain === "postcard-5" ? "selected" : ""}>+5 Bưu thiếp</option><option value="korea" ${state.forcedMain === "korea" ? "selected" : ""}>Voucher du lịch</option><option value="random" ${state.forcedMain === "random" ? "selected" : ""}>Ngẫu nhiên</option></select></label>
        <label>WinX<select data-demo="winX"><option value="none" ${!state.winXInstalled ? "selected" : ""}>Chưa cài</option><option value="installed" ${state.winXInstalled && !state.winXLinked ? "selected" : ""}>Đã cài</option><option value="linked" ${state.winXLinked ? "selected" : ""}>Đã liên kết</option></select></label>
        <button data-action="reset-demo">Reset trạng thái</button>
      </div>
    </aside>
  `;
}

function renderWinXSheet() {
  const v = state.vouchers.find((entry) => entry.id === state.activeVoucherId);
  if (!v) return "";
  return `
    <div class="sheet-backdrop">
      <section class="winx-sheet" role="dialog" aria-modal="true" aria-label="Đổi Voucher WinMart qua WinX">
        <button class="icon-btn sheet-close" data-action="close-winx" aria-label="Đóng">×</button>
        ${icon("winmart", "WinMart")}
        <h2>Đổi Voucher WinMart ${v.value}% qua WinX</h2>
        <p>${winXCopy(v)}</p>
        <div class="winx-steps">
          <span class="${state.winXInstalled ? "done" : ""}">1. Cài WinX</span>
          <span class="${state.winXLinked ? "done" : ""}">2. Liên kết tài khoản</span>
          <span class="${v.status === "Đã gửi điểm WinX" ? "done" : ""}">3. Nhận điểm</span>
        </div>
        <button class="primary green full" data-action="${winXAction(v)}">${winXButton(v)}</button>
      </section>
    </div>
  `;
}

function renderSettingsModal() {
  return `
    <div class="sheet-backdrop settings-backdrop">
      <section class="settings-modal" role="dialog" aria-modal="true" aria-label="Cài đặt Passport">
        <header class="settings-head">
          ${icon("settings", "Cài đặt")}
          <div>
            <h2>Cài đặt Passport</h2>
            <p>UserID ${escapeHtml(state.profile.userId)}</p>
          </div>
          <button class="icon-btn sheet-close" data-action="close-settings" aria-label="Đóng">×</button>
        </header>
        <div class="settings-list">
          ${renderSettingToggle("zns", "Nhắc qua Zalo ZNS", "Nhận lời nhắc Tích lộc món ngon mỗi ngày.", "bell")}
          ${renderSettingToggle("camera", "Quyền camera QR", "Cho phép khung Quét QR hoạt động trong bản thật.", "scan")}
          ${renderSettingToggle("winx", "Liên kết WinX", "Cho phép nhận điểm từ Voucher WinMart.", "link")}
        </div>
        <div class="policy-list">
          <button data-action="notice-rules">${icon("rules", "Thể lệ")}<span>Thể lệ chương trình</span></button>
          <button data-action="notice-policy">${icon("policy", "Chính sách")}<span>Điều khoản và chính sách dữ liệu</span></button>
          <button data-action="notice-permission">${icon("shield", "Quyền")}<span>Quyền truy cập và bảo mật</span></button>
        </div>
      </section>
    </div>
  `;
}

function renderRecipeModal() {
  const entry = state.locEntries.find((itemEntry) => itemEntry.id === state.activeRecipeId)
    || state.history.find((itemEntry) => itemEntry.id === state.activeRecipeId)
    || state.locEntries[0];
  const recipe = recipeForLoc(entry);
  return `
    <div class="sheet-backdrop recipe-backdrop">
      <section class="recipe-modal" role="dialog" aria-modal="true" aria-label="Công thức món ngon từ Lộc">
        <button class="icon-btn sheet-close" data-action="close-recipe" aria-label="Đóng">×</button>
        <div class="recipe-stamp">${icon("loc", "Lộc")}</div>
        <p class="recipe-date">${escapeHtml(entry?.date || TODAY)}</p>
        <h2>${escapeHtml(recipe.title)}</h2>
        <p>${escapeHtml(recipe.intro)}</p>
        <div class="recipe-grid">
          <section>
            <h3>Nguyên liệu</h3>
            <ul>${recipe.ingredients.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
          </section>
          <section>
            <h3>Cách làm nhanh</h3>
            <ol>${recipe.steps.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ol>
          </section>
        </div>
        <button class="primary green full" data-action="close-recipe">Đã lưu trong Passport</button>
      </section>
    </div>
  `;
}

function recipeForLoc(entry) {
  const recipes = [
    {
      title: "Cơm cuộn rong biển O'Food",
      intro: "Một món gọn tay để mẹ và bé cùng chuẩn bị cho buổi picnic cuối tuần.",
      ingredients: ["Rong biển O'Food", "Cơm nóng trộn mè", "Trứng cuộn, cà rốt, dưa leo", "Một ít dầu mè"],
      steps: ["Trải rong biển lên mành cuộn.", "Dàn cơm mỏng, xếp nhân theo một hàng.", "Cuộn chặt tay, cắt khoanh vừa ăn."]
    },
    {
      title: "Canh rong biển ấm bụng",
      intro: "Một công thức nhẹ nhàng để biến Lộc hằng ngày thành khoảnh khắc bữa cơm gia đình.",
      ingredients: ["Rong biển O'Food", "Thịt bò hoặc nấm", "Tỏi băm", "Nước dùng và mè rang"],
      steps: ["Ngâm rong biển đến khi mềm.", "Xào nhanh với tỏi và thịt bò hoặc nấm.", "Thêm nước dùng, nêm vừa ăn và rắc mè."]
    },
    {
      title: "Snack rong biển trộn cơm",
      intro: "Món cực nhanh cho ngày bận, giúp mẹ dùng O'Food trong bữa nhỏ của con.",
      ingredients: ["Rong biển O'Food cắt vụn", "Cơm trắng", "Mè rang", "Trứng hoặc cá hồi áp chảo"],
      steps: ["Làm tơi cơm trong tô.", "Trộn rong biển, mè và phần đạm yêu thích.", "Nắm thành viên nhỏ hoặc để trong hộp bento."]
    }
  ];
  const seed = Number(String(entry?.date || TODAY).replace(/\D/g, "").slice(-2)) || 0;
  return recipes[seed % recipes.length];
}

function renderSettingToggle(key, title, body, iconName) {
  return `
    <label class="setting-toggle">
      ${icon(iconName, title)}
      <span><b>${title}</b><small>${body}</small></span>
      <input type="checkbox" data-setting="${key}" ${state.settings[key] ? "checked" : ""} />
    </label>
  `;
}

function winXCopy(v) {
  if (!state.winXInstalled) return "Ứng dụng sẽ kiểm tra WinX. Nếu chưa cài, mẹ cài WinX, đăng ký tài khoản, rồi quay lại mini app để tiếp tục.";
  if (!state.winXLinked) return "WinX đã sẵn sàng. Bước tiếp theo là liên kết tài khoản để O'Food gửi điểm đúng người nhận.";
  if (v.status === "Đã gửi điểm WinX") return `Đã gửi ${v.points.toLocaleString("vi-VN")} điểm WinX vào tài khoản liên kết.`;
  return `Khi mẹ bấm nhận, hệ thống gửi ${v.points.toLocaleString("vi-VN")} điểm WinX để đổi ưu đãi tương ứng.`;
}

function winXAction(v) {
  if (!state.winXInstalled) return "mark-winx-installed";
  if (!state.winXLinked) return "link-winx";
  if (v.status === "Đã gửi điểm WinX") return "close-winx";
  return "redeem-winx";
}

function winXButton(v) {
  if (!state.winXInstalled) return "Tôi đã cài WinX và quay lại";
  if (!state.winXLinked) return "Liên kết tài khoản WinX";
  if (v.status === "Đã gửi điểm WinX") return "Xong";
  return "Nhận điểm WinX";
}

function renderFormula(key, leftNumber, leftIcon, leftLabel, rightNumber, rightIcon, rightLabel, hint) {
  return `
    <section class="formula">
      <div class="formula-line">
        <span><b>${leftNumber}</b>${icon(leftIcon, leftLabel)}<strong>${leftLabel}</strong></span>
        <em>=</em>
        <span><b>${rightNumber}</b>${icon(rightIcon, rightLabel)}<strong>${rightLabel}</strong></span>
      </div>
      <p>${copy(`${key}.hint`, hint, "span")}</p>
    </section>
  `;
}

function renderNotice() {
  if (!state.notice) return "";
  return `
    <section class="notice">
      ${icon(state.notice.icon || "spark", "Thông báo")}
      <div><strong>${escapeHtml(state.notice.title)}</strong><p>${escapeHtml(state.notice.body)}</p></div>
      <button data-action="clear-notice" aria-label="Đóng">×</button>
    </section>
  `;
}

function renderMilestones(value, total) {
  const milestones = total <= 5 ? [2, total] : total <= 10 ? [5, total] : [5, 10, total];
  return `
    <div class="milestones">
      <div class="meter"><span style="width:${Math.min(100, (value / total) * 100)}%"></span></div>
      <div class="milestone-row">${milestones.map((n) => `<span class="${value >= n ? "done" : ""}"><b>${n}</b><small>${n === total ? "Đổi quà" : "Mốc"}</small></span>`).join("")}</div>
    </div>
  `;
}

function renderMiniPostcard(place, filled) {
  if (!filled) return `<span class="mini-postcard empty">?</span>`;
  return `
    <span class="mini-postcard filled">
      ${renderPostcardCard(place, "mini")}
    </span>
  `;
}

function renderRecent(source, title, rows, cta) {
  return `
    <section class="recent">
      <div class="section-head"><h2>${title}</h2><button data-action="go-passport">${cta}</button></div>
      <div class="recent-list">${rows.length ? rows.map((row) => `
        <article class="${row.type === "loc" ? "clickable" : ""}" ${row.type === "loc" ? `data-loc-recipe="${row.id}"` : ""}>
          ${icon(row.type === "loc" ? "loc" : row.type, row.type)}
          <div><strong>${escapeHtml(row.title)}</strong><p>${escapeHtml(row.body)}</p></div>
          <time>${escapeHtml(row.date)}</time>
        </article>
      `).join("") : `<p class="recent-empty">Chưa có hoạt động nào, hãy bắt đầu từ Quét QR.</p>`}</div>
    </section>
  `;
}

function passportCanvasItems() {
  const locItems = state.locEntries.map((entry, index) => ({
    id: entry.id,
    type: "loc",
    filter: "loc",
    label: "Lộc",
    badge: entry.date.slice(0, 5),
    body: `${entry.title} từ ${entry.body.toLowerCase()}, tính vào mốc 02 và 05 Lộc trong tuần.`,
    visual: icon("loc", "Lộc")
  }));
  return locItems.slice(0, 5);
}

function renderLayoutButton(mode, label) {
  return `<button class="${state.passportLayoutMode === mode ? "active" : ""}" data-layout-mode="${mode}">${label}</button>`;
}

function renderPassportCanvasItem(entry) {
  const pos = state.passportCanvasPositions[entry.id] || {};
  const style = state.passportLayoutMode === "free" && Number.isFinite(pos.x) && Number.isFinite(pos.y)
    ? `style="left:${pos.x}%; top:${pos.y}%;"` : "";
  const selected = state.selectedPassportItemId === entry.id ? "selected" : "";
  return `
    <button class="memory-sticker ${entry.type} ${selected}" data-canvas-item="${entry.id}" data-canvas-filter="${entry.filter}" ${style}>
      <span class="canvas-visual">${entry.visual}</span>
      <span>${entry.label}</span>
      ${entry.badge ? `<b>${escapeHtml(entry.badge)}</b>` : ""}
    </button>
  `;
}

function renderCanvasDetail(entry) {
  return `
    <section class="canvas-detail">
      <div>
        <strong>${entry.label}</strong>
        <p>${entry.body}</p>
      </div>
      <button class="secondary" data-loc-recipe="${entry.id}">Xem công thức</button>
    </section>
  `;
}

function renderPostcardCard(place, size = "normal") {
  return `
    <span class="postcard-card ${size}" style="--postcard-frame: url('${frameFiles.postcard}')">
      <img class="postcard-place" src="${place.image}" alt="${escapeAttr(place.title)}" loading="lazy" />
      <span class="postcard-hangul">${escapeHtml(place.hangul)}</span>
    </span>
  `;
}

function placeFromPostcardEntry(entry) {
  return postcardPool.find((place) => entry.title.includes(place.title.replace("Bưu thiếp ", ""))) || postcardPool[0];
}

function passportEntries() {
  return [
    ...state.locEntries,
    ...state.travelRewards,
    ...state.vouchers
  ];
}

function renderEmpty(filter) {
  const states = {
    all: { icon: "passport", title: "Passport đang chờ kỷ niệm đầu tiên", body: "Quét gói O'Food và tích Lộc mỗi ngày để lấp đầy trang này." },
    loc: { icon: "loc", title: "Chưa có Lộc món ngon nào", body: "Vào Tích lộc, đăng nhập hằng ngày để nhận 01 Lộc và mở công thức." },
    travel: { icon: "travel", title: "Chưa có quà Hành Trang", body: "Gom đủ 10 Bưu thiếp rồi quay Hành Trang để nhận quà du lịch." },
    voucher: { icon: "voucher", title: "Chưa có Voucher WinMart", body: "Tích đủ Lộc trong tuần để quay Voucher, rồi đổi điểm qua WinX." }
  };
  const meta = states[filter] || states.all;
  return `
    <div class="empty">
      ${icon(meta.icon, meta.title)}
      <strong>${meta.title}</strong>
      <span>${meta.body}</span>
    </div>
  `;
}

function renderPassportRow(entry) {
  if (entry.type === "voucher") {
    const shortTerms = entry.mode === "weekend"
      ? "T7-CN · siêu thị được chọn · có mức chi tối thiểu."
      : "Trong tuần · cửa hàng hợp lệ · dùng trước 23:59 CN.";
    return `
      <article class="voucher-slip ${entry.mode}">
        <div class="voucher-value"><strong>${entry.value}%</strong><span>giảm</span></div>
        <div class="voucher-copy"><h3>Voucher WinMart</h3><p>${shortTerms}</p><small>Mã ${entry.code} · ${entry.status}</small></div>
        <button class="primary green" data-voucher="${entry.id}">Đổi qua WinX</button>
      </article>
    `;
  }
  if (entry.type === "postcard") {
    const place = placeFromPostcardEntry(entry);
    return `
      <article class="passport-row postcard-row">
        ${renderPostcardCard(place, "row")}
        <div><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.body)}</p></div>
        <time>${escapeHtml(entry.date)}</time>
      </article>
    `;
  }
  return `
    <article class="passport-row ${entry.type === "loc" ? "clickable" : ""}" ${entry.type === "loc" ? `data-loc-recipe="${entry.id}"` : ""}>
      ${icon(entry.type === "loc" ? "loc" : entry.type, entry.title)}
      <div><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.body)}</p></div>
      <time>${escapeHtml(entry.date)}</time>
    </article>
  `;
}

function icon(name, alt = "", className = "") {
  const raw = iconFiles[name] || iconFiles.spark;
  const label = alt || name;
  let svg = raw.includes("<title>")
    ? raw.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(label)}</title>`)
    : raw.replace(/<svg\b([^>]*)>/, `<svg$1><title>${escapeHtml(label)}</title>`);
  if (className.includes("nav-red")) svg = recolorSvg(svg, "nav-red");
  if (className.includes("nav-contrast")) svg = recolorSvg(svg, "nav-contrast");
  return svg.replace("<svg", `<svg class="streamline-icon ${escapeAttr(className)}" aria-label="${escapeAttr(label)}"`);
}

function recolorSvg(svg, palette) {
  const replacements = palette === "nav-contrast"
    ? {
        "#d71920": "#fffdf8",
        "#ffd5d8": "#ffd95a",
        "#16833a": "#fffdf8",
        "#dff7e9": "#ffd95a",
        "#07502a": "#fffdf8",
        "#a31116": "#fffdf8",
        "#e1ab22": "#fff2b3"
      }
    : {
        "#16833a": "#d71920",
        "#dff7e9": "#ffd5d8",
        "#07502a": "#a31116",
        "#e1ab22": "#f06a76",
        "#fff1c5": "#ffd5d8"
      };
  return Object.entries(replacements).reduce((current, [from, to]) => current.replaceAll(from, to), svg);
}

function copy(id, fallback, tag = "span") {
  const value = copyStore[id] ?? fallback;
  return `<${tag} data-editable-id="${escapeAttr(id)}" title="Double-click để sửa chữ">${escapeHtml(value)}</${tag}>`;
}

function bindEvents() {
  document.querySelectorAll("[data-editable-id]").forEach((node) => {
    node.addEventListener("dblclick", () => {
      node.contentEditable = "true";
      node.focus();
      document.getSelection()?.selectAllChildren(node);
    });
    node.addEventListener("blur", () => {
      if (node.isContentEditable) {
        copyStore[node.dataset.editableId] = node.textContent.trim();
        node.contentEditable = "false";
        saveCopy();
      }
    });
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        node.blur();
      }
      if (event.key === "Escape") {
        node.contentEditable = "false";
        render();
      }
    });
  });

  const scanFrame = document.querySelector("[data-scan-capture]");
  if (scanFrame) {
    scanFrame.addEventListener("click", () => {
      if (!motionOK()) {
        openSpin("spin-main");
        return;
      }
      if (scanFrame.classList.contains("capturing")) return;
      scanFrame.classList.add("capturing");
      window.setTimeout(() => openSpin("spin-main"), 300);
    });
  }

  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => go(button.dataset.view)));
  document.querySelectorAll("[data-map-view]").forEach((button) => button.addEventListener("click", () => {
    state.mapOpen = false;
    go(button.dataset.mapView);
  }));
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => act(button.dataset.action)));
  document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
    state.passportFilter = button.dataset.filter;
    state.view = "passport";
    saveState();
    render();
  }));
  document.querySelectorAll("[data-voucher]").forEach((button) => button.addEventListener("click", () => {
    state.activeVoucherId = button.dataset.voucher;
    saveState();
    render();
  }));
  document.querySelectorAll("[data-loc-recipe]").forEach((node) => node.addEventListener("click", (event) => {
    event.stopPropagation();
    state.activeRecipeId = node.dataset.locRecipe;
    saveState();
    render();
  }));
  document.querySelectorAll("[data-layout-mode]").forEach((button) => button.addEventListener("click", () => {
    state.passportLayoutMode = button.dataset.layoutMode;
    saveState();
    render();
  }));
  document.querySelectorAll("[data-open-filter]").forEach((button) => button.addEventListener("click", () => {
    state.passportFilter = button.dataset.openFilter;
    state.selectedPassportItemId = button.dataset.openFilter;
    saveState();
    render();
  }));
  document.querySelectorAll("[data-canvas-item]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedPassportItemId = button.dataset.canvasItem;
      state.passportFilter = button.dataset.canvasFilter || "all";
      if (button.dataset.canvasFilter === "loc") state.activeRecipeId = button.dataset.canvasItem;
      saveState();
      render();
    });
    button.addEventListener("pointerdown", (event) => startCanvasDrag(event, button));
  });
  document.querySelectorAll("[data-demo]").forEach((control) => control.addEventListener("change", () => updateDemo(control)));
  document.querySelectorAll("[data-setting]").forEach((control) => control.addEventListener("change", () => {
    state.settings[control.dataset.setting] = control.checked;
    saveState();
  }));
  document.querySelectorAll("[data-field]").forEach((input) => input.addEventListener("input", () => {
    state[input.dataset.field] = input.value;
    saveState();
  }));
}

function startCanvasDrag(event, node) {
  if (state.passportLayoutMode !== "free") return;
  const canvas = document.querySelector("[data-passport-canvas]");
  if (!canvas) return;
  const itemId = node.dataset.canvasItem;
  state.selectedPassportItemId = itemId;
  node.setPointerCapture?.(event.pointerId);
  node.classList.add("dragging");
  event.preventDefault();

  const move = (moveEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(4, Math.min(76, ((moveEvent.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(8, Math.min(70, ((moveEvent.clientY - rect.top) / rect.height) * 100));
    state.passportCanvasPositions[itemId] = { x, y };
    node.style.left = `${x}%`;
    node.style.top = `${y}%`;
  };

  const done = () => {
    node.classList.remove("dragging");
    saveState();
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", done);
    render();
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", done, { once: true });
}

function go(view) {
  state.previousView = state.view;
  state.view = view;
  state.notice = null;
  saveState();
  render();
}

function act(action) {
  const map = {
    "toggle-map": () => { state.mapOpen = !state.mapOpen; },
    "toggle-demo": () => { state.demoOpen = !state.demoOpen; },
    "toggle-ugc": () => { state.ugcOpen = !state.ugcOpen; },
    "open-settings": () => { state.settingsOpen = true; },
    "close-settings": () => { state.settingsOpen = false; },
    "close-recipe": () => { state.activeRecipeId = null; },
    "clear-notice": () => { state.notice = null; },
    "go-scan": () => go("scan"),
    "go-passport": () => go("passport"),
    "open-spin-main": () => openSpin("spin-main"),
    "open-spin-travel": () => openSpin("spin-travel"),
    "open-spin-voucher-weekday": () => openSpin("spin-voucher-weekday"),
    "open-spin-voucher-weekend": () => openSpin("spin-voucher-weekend"),
    "close-spin": closeSpin,
    "run-spin": runSpin,
    "claim-loc": claimLoc,
    "share-passport": () => notice("Đã mở chia sẻ", "Bản mẫu mô phỏng điểm chia sẻ Passport lên mạng xã hội.", "share"),
    "notice-help": () => notice("Cách quét", "Mở gói O'Food, đưa mã QR bên trong vào giữa khung camera.", "help"),
    "notice-gallery": () => notice("Mở từ thư viện", "Bản thật có thể cho mẹ chọn ảnh QR đã chụp trong thư viện khi không quét trực tiếp được.", "gallery"),
    "notice-rules": () => { state.settingsOpen = false; notice("Thể lệ chương trình", "Bản thật sẽ mở đầy đủ thể lệ, thời hạn dùng voucher, cách nhận điểm WinX và quy định nhận thưởng.", "rules"); },
    "notice-policy": () => { state.settingsOpen = false; notice("Điều khoản và chính sách", "Bản thật sẽ mở điều khoản dữ liệu, quyền riêng tư và điều kiện sử dụng mini app.", "policy"); },
    "notice-permission": () => { state.settingsOpen = false; notice("Quyền truy cập", "Camera chỉ dùng để quét QR. WinX chỉ liên kết khi mẹ chủ động xác nhận.", "shield"); },
    "notice-guideline": () => notice("Guideline TikTok", "Bản thật sẽ mở trang thể lệ UGC bên ngoài. Bé chỉ tham gia qua tài khoản của mẹ.", "ugc"),
    "submit-ugc": submitUgc,
    "close-winx": () => { state.activeVoucherId = null; },
    "mark-winx-installed": () => { state.winXInstalled = true; notice("Đã ghi nhận WinX", "Tiếp theo, mẹ liên kết tài khoản WinX với mini app.", "phone"); },
    "link-winx": () => { state.winXInstalled = true; state.winXLinked = true; state.winXAccountId = "WINX-OF-0605"; notice("Đã liên kết WinX", "Tài khoản WinX đã sẵn sàng nhận điểm từ Voucher WinMart.", "link"); },
    "redeem-winx": redeemWinX,
    "reset-demo": resetDemo
  };
  map[action]?.();
  saveState();
  render();
}

function openSpin(view) {
  state.previousView = state.view;
  state.view = view;
  state.spinPhase = "ready";
  state.spinResult = null;
  state.notice = null;
  saveState();
  render();
}

function closeSpin() {
  window.clearTimeout(spinTimer);
  state.view = state.previousView && !state.previousView.startsWith("spin") ? state.previousView : "scan";
  state.spinPhase = "ready";
  state.spinResult = null;
}

function runSpin() {
  const type = state.view.replace("spin-", "");
  const meta = spinMeta(type);
  if ((meta.cost && meta.balance < meta.cost) || meta.used) return;
  if (state.spinPhase === "spinning") return;
  const fromDeg = state.spinRotation;
  const turns = 6 + Math.floor(Math.random() * 3); // 6-8 full cycles
  const toDeg = fromDeg + turns * 360 + Math.floor(Math.random() * 360);
  state.spinRotation = toDeg;
  state.spinPhase = "spinning";
  // Defer the animation to the next render (act() renders after this handler).
  pendingSpin = { type, fromDeg, toDeg };
}

// Suspense build: wind-up, multi-cycle launch, long ease-out-expo creep to the
// result. Motion blur peaks during the fast phase; the pointer ticks like pegs
// and dampens as the wheel slows. Driven by the Web Animations API so the result
// fires exactly on settle. Reduced motion skips straight to the outcome.
function animateWheel(type, fromDeg, toDeg) {
  window.clearTimeout(spinTimer);
  const rotor = document.querySelector(".wheel-rotor");
  const pointer = document.querySelector(".wheel-pointer");
  if (!rotor || typeof rotor.animate !== "function" || !motionOK()) {
    spinTimer = window.setTimeout(() => finishSpin(type), motionOK() ? 600 : 160);
    return;
  }
  const duration = 3400;
  const easeOutExpo = "cubic-bezier(0.16, 1, 0.3, 1)";
  const spin = rotor.animate(
    [
      { transform: `rotate(${fromDeg}deg)`, offset: 0, easing: "cubic-bezier(0.4, 0, 0.7, 0.2)" },
      { transform: `rotate(${fromDeg - 18}deg)`, offset: 0.06, easing: easeOutExpo },
      { transform: `rotate(${toDeg}deg)`, offset: 1 }
    ],
    { duration, fill: "forwards" }
  );
  rotor.animate(
    [
      { filter: "blur(0px)", offset: 0 },
      { filter: "blur(2px)", offset: 0.08 },
      { filter: "blur(7px)", offset: 0.26 },
      { filter: "blur(3px)", offset: 0.6 },
      { filter: "blur(0px)", offset: 1 }
    ],
    { duration, easing: "linear", fill: "forwards" }
  );
  animatePointerTicks(pointer, duration);
  spin.onfinish = () => {
    if (state.view.startsWith("spin") && state.spinPhase === "spinning") finishSpin(type);
  };
}

function animatePointerTicks(pointer, duration) {
  if (!pointer || typeof pointer.animate !== "function") return;
  const frames = [{ transform: "rotate(0deg)", offset: 0 }];
  const segments = 24;
  for (let i = 1; i < segments; i += 1) {
    const t = i / segments;
    const offset = Number((1 - Math.pow(1 - t, 0.42)).toFixed(4)); // frequent early, sparse late
    const amplitude = 12 * Math.pow(1 - t, 1.5); // wobble dies out as it slows
    const direction = i % 2 ? -1 : -0.3; // struck to one side, partial return
    frames.push({ transform: `rotate(${(direction * amplitude).toFixed(2)}deg)`, offset });
  }
  frames.push({ transform: "rotate(0deg)", offset: 1 });
  pointer.animate(frames, { duration, easing: "linear", fill: "forwards" });
}

function finishSpin(type) {
  if (type === "main") finishMainSpin();
  if (type === "travel") finishTravelSpin();
  if (type === "voucher-weekday") finishVoucherSpin("weekday");
  if (type === "voucher-weekend") finishVoucherSpin("weekend");
  state.spinPhase = "result";
  saveState();
  render();
}

function finishMainSpin() {
  const forced = state.forcedMain;
  if (forced === "korea") {
    const result = item("voucher", "Voucher du lịch Hàn Quốc 50tr", "Kết quả hiếm từ Vòng Quay May Mắn, cần xác minh theo thể lệ.", TODAY);
    state.history.unshift(result);
    state.spinResult = {
      icon: "spark",
      title: result.title,
      body: result.body,
      ledger: "Cơ hội giải lớn đã được lưu vào Passport.",
      primaryAction: "go-passport",
      primaryLabel: "Xem trong Passport"
    };
    pendingCelebrate = "big";
    return;
  }
  const quantity = forced === "random" ? pick([1, 1, 2, 3, 5]) : Number(forced.replace("postcard-", ""));
  state.activePostcards += quantity;
  const postcardEvent = item("postcard", `Nhận ${quantity} Bưu thiếp`, "Bưu thiếp dùng để quay Hành Trang, không lưu trong Passport.", TODAY);
  state.history.unshift(postcardEvent);
  const ready = state.activePostcards >= POSTCARD_COST;
  state.spinResult = {
    icon: "postcard",
    title: `Mẹ nhận ${quantity} Bưu thiếp`,
    body: "Bưu thiếp được cộng vào lượt Hành Trang. Passport chỉ lưu Lộc, quà và voucher.",
    ledger: `${quantity} Bưu thiếp · hiện có ${state.activePostcards}/${POSTCARD_COST}`,
    primaryAction: ready ? "open-spin-travel" : "go-scan",
    primaryLabel: ready ? "Quay Hành Trang ngay" : "Quét thêm gói"
  };
}

function finishTravelSpin() {
  state.activePostcards -= POSTCARD_COST;
  const reward = pick(travelRewards);
  const saved = item("travel", reward.title, reward.body, TODAY);
  state.travelRewards.unshift(saved);
  state.history.unshift(saved);
  state.spinResult = {
    icon: "travel",
    title: reward.title,
    body: `${reward.body} Bưu thiếp đã dùng cho lượt Hành Trang này.`,
    ledger: `-${POSTCARD_COST} Bưu thiếp · còn ${state.activePostcards}/${POSTCARD_COST}`,
    primaryAction: "go-passport",
    primaryLabel: "Xem trong Passport"
  };
  pendingCelebrate = "big";
}

function finishVoucherSpin(mode) {
  const cost = mode === "weekend" ? LOC_WEEKEND_COST : LOC_WEEKDAY_COST;
  state.voucherSpinUsed[mode] = true;
  const value = state.forcedVoucher === "auto" ? pick(voucherTiers[mode]) : Number(state.forcedVoucher);
  const created = voucher(value, mode, `WX${mode === "weekend" ? "WE" : "WD"}${value}-${Date.now().toString().slice(-4)}`);
  state.vouchers.unshift(created);
  state.history.unshift(item("voucher", `Voucher WinMart ${value}%`, "Đã lưu vào Passport, đổi qua WinX khi sẵn sàng.", TODAY));
  state.spinResult = {
    icon: "voucher",
    title: `Voucher WinMart ${value}%`,
    body: created.terms,
    ledger: `${state.activeLoc}/${LOC_WEEKLY_CAP} Lộc tuần này · đã dùng lượt ${mode === "weekend" ? "cuối tuần" : "trong tuần"}`,
    primaryAction: "go-passport",
    primaryLabel: "Đổi trong Passport"
  };
}

function claimLoc() {
  if (state.claimedToday || state.activeLoc >= LOC_WEEKLY_CAP) return;
  state.activeLoc += 1;
  state.claimedToday = true;
  const saved = item("loc", "Lộc món ngon", "Đăng nhập hằng ngày", TODAY);
  state.locEntries.unshift(saved);
  state.history.unshift(saved);
  if (state.activeLoc >= LOC_WEEKLY_CAP) {
    pendingCelebrate = "soft";
    notice("Đủ 05 Lộc tuần này", "Mẹ đã mở khoá lượt Vòng Quay Voucher Cuối Tuần. Lộc vẫn được giữ trong Passport.", "loc");
  } else {
    notice("Đã nhận 01 Lộc", "Lộc được lưu trong Passport. Đủ 02 Lộc mở Voucher Trong Tuần, đủ 05 Lộc mở Voucher Cuối Tuần.", "loc");
  }
}

function redeemWinX() {
  const v = state.vouchers.find((entry) => entry.id === state.activeVoucherId);
  if (!v) return;
  v.status = "Đã gửi điểm WinX";
  v.redeemedAt = TODAY;
  state.history.unshift(item("voucher", `Đã gửi ${v.points.toLocaleString("vi-VN")} điểm WinX`, `Từ Voucher WinMart ${v.value}%.`, TODAY));
  notice("Điểm WinX đã được gửi", `Voucher WinMart ${v.value}% đã đổi thành ${v.points.toLocaleString("vi-VN")} điểm WinX.`, "check");
}

function submitUgc() {
  const url = state.ugcDraft.trim();
  if (!/^https?:\/\/(www\.)?tiktok\.com\//i.test(url)) {
    notice("Link TikTok chưa đúng", "Hãy dán link bắt đầu bằng https://www.tiktok.com/ để gửi bài dự thi.", "ugc");
    return;
  }
  const saved = item("ugc", "Bài TikTok đã gửi", "Trạng thái: chờ O'Food kiểm duyệt.", TODAY);
  saved.url = url;
  state.ugcSubmissions.unshift(saved);
  state.history.unshift(saved);
  state.ugcDraft = "";
  notice("Đã gửi bài dự thi", "Link TikTok đã được lưu trong Passport để theo dõi trạng thái.", "ugc");
}

function updateDemo(control) {
  const key = control.dataset.demo;
  if (key === "activePostcards" || key === "activeLoc") state[key] = Number(control.value);
  if (key === "dayMode") state.dayMode = control.value;
  if (key === "forcedMain") state.forcedMain = control.value;
  if (key === "forcedVoucher") state.forcedVoucher = control.value;
  if (key === "winX") {
    state.winXInstalled = control.value === "installed" || control.value === "linked";
    state.winXLinked = control.value === "linked";
  }
  saveState();
  render();
}

function resetDemo() {
  localStorage.removeItem(STATE_KEY);
  localStorage.removeItem(COPY_KEY);
  state = structuredClone(initialState);
  copyStore = {};
}

function notice(title, body, iconName = "spark") {
  state.notice = { title, body, icon: iconName };
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function slug(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
