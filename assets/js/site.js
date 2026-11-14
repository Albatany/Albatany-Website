(() => {
  "use strict";

  const data = window.PORTFOLIO_DATA;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pageId = document.body.dataset.page || "home";
  let language = localStorage.getItem("aziz-language") || "id";
  let theme = localStorage.getItem("aziz-theme") || "dark";
  const t = (value) => typeof value === "string" ? value : (value?.[language] || value?.id || "");
  const currentPage = data.pages.find(p=>p.id===pageId) || {id:pageId,label:{id:pageId==="privacy"?"Privasi":"Login"}};
  // Sub-halaman (punya "parent") ikut nomor dan urutan halaman induknya.
  const topPages = data.pages.filter((page) => !page.parent);
  const childrenOf = (id) => data.pages.filter((page) => page.parent === id);
  const pageIndex = Math.max(0, topPages.findIndex((page) => page.id === (currentPage.parent || pageId)));
  const nextPage = topPages[(pageIndex + 1) % topPages.length];
  const two = (value) => String(value).padStart(2, "0");
  const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));

  document.documentElement.dataset.theme = theme;
  document.documentElement.lang = language;
  document.title = `${t(currentPage.label)} | albatany`;

  const icon = (name) => {
    const paths = {
      github: '<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.54 1.03 1.54 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 7c.85 0 1.7.11 2.5.34 1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.58c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>',
      linkedin: '<path d="M5.2 8.1H2.1V22h3.1V8.1ZM3.65 2A1.82 1.82 0 1 0 3.65 5.64 1.82 1.82 0 0 0 3.65 2ZM22 14.05c0-4.2-2.24-6.15-5.23-6.15-2.41 0-3.49 1.33-4.09 2.26V8.1H9.56V22h3.12v-6.88c0-1.81.34-3.57 2.59-3.57 2.22 0 2.24 2.08 2.24 3.69V22H22v-7.95Z"/>',
      whatsapp: '<path d="M20.5 3.5A11.8 11.8 0 0 0 1.9 17.7L.3 23.5l5.94-1.56A11.77 11.77 0 0 0 12 23.4h.01A11.8 11.8 0 0 0 20.5 3.5Zm-8.49 17.9a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.53.93.94-3.44-.23-.36A9.8 9.8 0 1 1 12 21.4Zm5.38-7.35c-.3-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.67.15-.2.3-.76.96-.93 1.16-.17.2-.35.22-.64.07-1.73-.86-2.87-1.54-4.01-3.5-.3-.52.3-.49.86-1.61.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.87 1.21 3.07c.15.2 2.09 3.19 5.06 4.47.71.3 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.08 1.74-.71 1.99-1.39.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"/>',
      email: '<path d="M2 5.5A2.5 2.5 0 0 1 4.5 3h15A2.5 2.5 0 0 1 22 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18.5v-13Zm2.4-.5 7.6 6.35L19.6 5H4.4Zm15.6 2.1-7.36 6.15a1 1 0 0 1-1.28 0L4 7.1v11.4c0 .28.22.5.5.5h15a.5.5 0 0 0 .5-.5V7.1Z"/>',
      youtube: '<path d="M23.5 6.2a3 3 0 0 0-2.11-2.12C19.53 3.58 12 3.58 12 3.58s-7.53 0-9.39.5A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.11 2.12c1.86.5 9.39.5 9.39.5s7.53 0 9.39-.5a3 3 0 0 0 2.11-2.12A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.55 15.6V8.4L15.82 12l-6.27 3.6Z"/>',
      tiktok: '<path d="M16.6 2c.25 2.1 1.42 3.36 3.4 3.5v3.04a8.4 8.4 0 0 1-3.37-.8v6.35a6.05 6.05 0 1 1-5.22-6V11.2a3.03 3.03 0 1 0 2.13 2.89V2h3.06Z"/>',
      arrow: '<path d="M5 19 19 5M9 5h10v10" fill="none" stroke="currentColor" stroke-width="1.8"/>',
      code: '<path d="m8.5 6-6 6 6 6M15.5 6l6 6-6 6M14 3l-4 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
      home: '<path d="m3.5 11.2 8.5-7 8.5 7M5.8 9.7v10h12.4v-10M9.2 19.7v-5.8h5.6v5.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
      user: '<circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M5 20c.7-4.1 3.1-6.1 7-6.1s6.3 2 7 6.1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
      award: '<circle cx="12" cy="9" r="5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m8.7 13-1 8 4.3-2.6 4.3 2.6-1-8M12 6.4l.8 1.7 1.9.3-1.4 1.4.3 1.9-1.6-.9-1.6.9.3-1.9-1.4-1.4 1.9-.3.8-1.7Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
      sparkle: '<path d="M12 2.8c.8 4.9 3.5 7.7 8.3 8.5-4.8.8-7.5 3.5-8.3 8.5-.8-5-3.5-7.7-8.3-8.5 4.8-.8 7.5-3.6 8.3-8.5Z" fill="currentColor"/><path d="M19.2 3.3c.2 1.4 1 2.2 2.4 2.4-1.4.2-2.2 1-2.4 2.4-.2-1.4-1-2.2-2.4-2.4 1.4-.2 2.2-1 2.4-2.4Z" fill="currentColor"/>',
      chart: '<path d="M3.5 20.5h17M5.5 17V9.5h3V17h-3Zm5-0V4.5h3V17h-3Zm5 0v-5h3v5h-3Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
      chevron: '<path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      book: '<path d="M5 4.8A1.8 1.8 0 0 1 6.8 3H19v14.5H6.8A1.8 1.8 0 0 0 5 19.3V4.8Zm0 14.5A1.8 1.8 0 0 0 6.8 21H19M9 7.5h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
      paper: '<path d="M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6M10 17h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
      feed: '<path d="M3.5 6h10M3.5 11h7M3.5 16h5m5 2.5.6-3 5.6-5.6 2.4 2.4-5.6 5.6-3 .6Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
      heart: '<path d="M12 20.5 4.6 13.4a4.9 4.9 0 0 1 0-7 4.9 4.9 0 0 1 7 0l.4.4.4-.4a4.9 4.9 0 0 1 7 0 4.9 4.9 0 0 1 0 7L12 20.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
      pen: '<path d="m4 20 1-4.5L16.5 4a2.1 2.1 0 0 1 3 3L8 18.5 4 20Zm10.5-13.5 3 3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
      globe: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.9 5.2 3.9 8.5s-1.3 6.1-3.9 8.5c-2.6-2.4-3.9-5.2-3.9-8.5s1.3-6.1 3.9-8.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/>',
      lock: '<rect x="5" y="10.5" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
      hourglass: '<path d="M7 3.5h10M7 20.5h10M8 3.5v3.2c0 1.5.8 2.7 2 3.6l2 1.7 2-1.7c1.2-.9 2-2.1 2-3.6V3.5M8 20.5v-3.2c0-1.5.8-2.7 2-3.6l2-1.7 2 1.7c1.2.9 2 2.1 2 3.6v3.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
      chat: '<path d="M4.2 5.3h10.4a3.2 3.2 0 0 1 3.2 3.2v2.4a3.2 3.2 0 0 1-3.2 3.2H9l-4.2 3v-3.3a3.2 3.2 0 0 1-3-3.2V8.5a3.2 3.2 0 0 1 2.4-3.2Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M18 9.2h1.2a3 3 0 0 1 3 3v1.7a3 3 0 0 1-2.7 3v2.6l-3.6-2.6h-3.1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
      instagram: `
  <rect
    x="3"
    y="3"
    width="18"
    height="18"
    rx="5"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
  />

  <circle
    cx="12"
    cy="12"
    r="4"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
  />

  <circle
    cx="17.4"
    cy="6.6"
    r="1.15"
    fill="currentColor"
  />
`,
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
  };

  const techMark = (name) => {
    const marks = {
      "Unity 6": "◆", "C#": "C#", "2D Pixel Art": "PX", "TextMeshPro": "T",
      "JavaScript": "JS", "Node.js": "N", "Electron": "◉", "React": "⚛",
      "Vite": "ϟ", "Tailwind": "≈", "Framer Motion": "FM", "Discord.js": "DJ",
      "Minecraft": "▦", "Pterodactyl": "PT", "MySQL": "DB"
    };
    return `<span class="tech-chip"><i>${marks[name] || "•"}</i><b>${name}</b></span>`;
  };

  const background = `
    <a class="skip-link" href="#pageRoot">Lewati navigasi / Skip navigation</a>
    <div class="cursor-glow" aria-hidden="true"></div><div class="cursor-orb" aria-hidden="true"></div>
    <div class="cosmic-background" aria-hidden="true">
      <div id="backgroundMedia"></div>
      <div class="cosmic-vignette"></div><div class="cosmic-dots"></div><div class="cosmic-grain"></div>
    </div>
    <div class="scroll-edge scroll-edge-top" aria-hidden="true"></div>
    <div class="scroll-edge scroll-edge-bottom" aria-hidden="true"></div>`;

  const transition = `
    <div class="route-transition" id="routeTransition" aria-hidden="true">
      <div class="transition-panel panel-a"></div>
      <div class="transition-panel panel-b"></div>
      <div class="transition-panel panel-c"></div>
      <div class="transition-core">
        <img src="assets/images/pixel-bird.gif" alt="">
        <span id="transitionLabel">ROUTE_${currentPage.id.toUpperCase()}</span>
        <b>0${pageIndex + 1} / 0${topPages.length}</b>
      </div>
    </div>`;

  const navIconNames = {
    home: "home",
    about: "user",
    devlogs: "feed",
    projects: "code",
    guides: "book",
    papers: "paper",
    achievements: "award",
    gallery: "sparkle",
    gendut: "heart",
    stats: "chart",
    contact: "chat"
  };

  // Bendera pixel art 16x11, digambar 2x supaya tiap pixel jatuh tepat di grid layar.
  const flags = {
    id: '<path fill="#e8112d" d="M1 0h14v1h1v4.5H0V1h1z"/><path fill="#fff" d="M0 5.5h16V10h-1v1H1v-1H0z"/>',
    en: '<path fill="#fff" d="M1 0h14v1h1v9h-1v1H1v-1H0V1h1z"/><path fill="#c8102e" d="M7 0h8v1H7zM7 2h9v1H7zM7 4h9v1H7zM0 6h16v1H0zM0 8h16v1H0zM1 10h14v1H1z"/><path fill="#22408c" d="M1 0h6v5H0V1h1z"/><path fill="#fff" d="M1 1h1v1H1zM3 1h1v1H3zM5 1h1v1H5zM2 2h1v1H2zM4 2h1v1H4zM1 3h1v1H1zM3 3h1v1H3zM5 3h1v1H5z"/>'
  };
  const languageSwitch = `<div class="language-switch" role="group" aria-label="${t({ id: "Bahasa", en: "Language" })}">${[["id", "Bahasa Indonesia"], ["en", "English"]].map(([code, name]) => `<button type="button" data-language="${code}" aria-label="${name}" title="${name}" aria-pressed="${language === code}"><svg class="pixel-flag" viewBox="0 0 16 11" width="32" height="22" shape-rendering="crispEdges" aria-hidden="true">${flags[code]}</svg></button>`).join("")}</div>`;

  const isCurrent = (page) => page.id === pageId;
  const currentAttrs = (page) => `class="route-link ${isCurrent(page) ? "active" : ""}" href="${page.file}" ${isCurrent(page) ? 'aria-current="page"' : ""}`;
  // Item yang punya sub-halaman menjadi dropdown; opsi pertamanya tetap tujuan lama item itu.
  const navGroup = (page, panelId, parentClass, parentBody, links) => `
    <div class="${parentClass}-group">
      <button type="button" class="${parentClass}-parent ${[page, ...childrenOf(page.id)].some(isCurrent) ? "active" : ""}" data-disclosure aria-expanded="false" aria-controls="${panelId}" aria-label="${escapeHTML(t(page.label))}">${parentBody}</button>
      <div class="${parentClass}-sub disclosure-panel" id="${panelId}" inert><div>${links}</div></div>
    </div>`;
  const desktopNavItem = (page) => {
    const label = escapeHTML(t(page.label));
    const body = `${icon(navIconNames[page.id])}<span class="nav-label">${label}</span>`;
    if (!childrenOf(page.id).length) return `<a ${currentAttrs(page)} aria-label="${label}">${body}</a>`;
    return navGroup(page, `sub-${page.id}`, "nav", body + icon("chevron"), [page, ...childrenOf(page.id)].map((item) =>
      `<a ${currentAttrs(item)}>${icon(navIconNames[item.id])}<span><b>${escapeHTML(t(item.label))}</b><small>${escapeHTML(t(item.hint))}</small></span></a>`).join(""));
  };
  const overlayRow = (page, number) => `<a ${currentAttrs(page)}><small>${number}</small><span>${escapeHTML(t(page.label))}</span><b>↗</b></a>`;
  const overlayNavItem = (page, index) => {
    const number = two(index + 1);
    if (!childrenOf(page.id).length) return overlayRow(page, number);
    return navGroup(page, `menu-sub-${page.id}`, "menu", `<small>${number}</small><span>${escapeHTML(t(page.label))}</span><b aria-hidden="true"></b>`,
      [page, ...childrenOf(page.id)].map((item, i) => overlayRow(item, `${number}.${i}`)).join(""));
  };

  const header = `
    <header class="site-header">
      <a class="brand route-link magnetic" href="index.html" aria-label="Home">
        <img src="assets/images/head.png" alt="AceHead" style="height: 1em; vertical-align: middle;"><span>PUSH<br>THE LIMITS</span>
      </a>
      <nav class="desktop-nav" aria-label="Main navigation">${topPages.map(desktopNavItem).join("")}</nav>
      <div class="header-actions">
        <button id="commandTrigger" aria-label="Buka pencarian menu (Control K)" title="Ctrl / Cmd + K"><span>⌕</span><kbd>⌘ K</kbd></button>
        <button data-auth-open class="auth-trigger" aria-label="Login atau kelola akun">Login</button>
        ${languageSwitch}
        <button id="menuToggle" class="menu-toggle" aria-label="Open menu" aria-expanded="false"><i></i><i></i></button>
      </div>
    </header>
    <div class="menu-overlay" id="menuOverlay" aria-hidden="true">
      <div class="menu-index">NAVIGATION / WORLD MAP</div>
      <nav>${topPages.map(overlayNavItem).join("")}</nav>
      <div class="menu-art"><img src="assets/images/pixel-bird.gif" alt="Pixel bird mascot"><span>CHOOSE A SIGNAL</span></div>
    </div>`;

  const footer = `
    <footer class="site-footer">
      <span>BANDUNG, INDONESIA</span>
      <span>© 2026 MUHAMMAD AZIZ SYAH DANI</span>
      <a href="privacy.html">${t({id:"Privasi",en:"Privacy"})}</a><a class="route-link" href="contact.html">${t({ id: "HUBUNGI SAYA", en: "CONTACT ME" })} <b>→</b></a>
    </footer>`;

  document.body.insertAdjacentHTML("afterbegin", transition + background + header);
  const root = document.getElementById("pageRoot");

  const nextLink = (label) => `
    <a class="route-next route-link magnetic" href="${nextPage.file}">
      <small>${t({ id: "LANJUTKAN ARSIP", en: "CONTINUE THE ARCHIVE" })}</small>
      <span>${label || t(nextPage.label)}</span><b>↗</b>
    </a>`;

  const pageCode = (label, title, note) => `
    <div class="page-code"><span>0${pageIndex + 1} / 0${topPages.length}</span><b>${label}</b><i>${note}</i></div>
    <h1 class="page-title scramble" data-text="${escapeHTML(title)}">${title}</h1>`;

  // Thumbnail project: jendela aplikasi di atas latar gradient. Warna mengikuti "accent" di content.js.
  const sceneLayers = (prefix, names) => `<div class="scene-layers">${names.map((name, index) => `<img loading="lazy" decoding="async" src="assets/images/project-scenes/${prefix}${name}.png" alt="" style="--layer:${index + 1}">`).join("")}</div>`;
  const projectScreens = {
    // Tanpa screenshot: kartu identitas project dari kode (preview: "terminal", atau "image" yang gambarnya kosong).
    terminal: (project) => [`<div class="cover-terminal"><b aria-hidden="true">${({ "zt-hac": "⌘", bridge: "⇄", offlinebox: "▦", chronolens: "◷" })[project.id] || "&lt;/&gt;"}</b><strong>${escapeHTML(project.title)}</strong><small>${escapeHTML(project.subtitle)}</small></div>`, "OPEN SOURCE", "EXPLORE THE BUILD"],
    memory: () => [sceneLayers("memory-", [1, 2, 3, 4, 5]) + '<div class="pixel-dialog">Setiap hari yang sama...</div>', "LOOP / 03", "MEMORY SIGNAL FOUND"],
    pathways: () => [sceneLayers("path-", ["bg", "clouds-back", "clouds-front", "front"]), "POST / 07—10", "SCORE 0840"],
    vaultkeep: () => [`<div class="vault-window">
          <header><img loading="lazy" src="assets/images/project-scenes/vaultkeep.ico" alt=""><b>VaultKeep</b><span>● ENCRYPTED</span></header>
          <aside><i>VK</i><span>ALL ITEMS</span><span>FAVORITES</span><span>GENERATOR</span></aside>
          <div class="vault-content"><div><small>PERSONAL VAULT</small><strong>12 secured items</strong></div>
            <ul><li><b>GH</b><span>github.com<small>acebreaker-cell</small></span><i>••••••••</i></li><li><b>UN</b><span>unja.ac.id<small>student account</small></span><i>••••••••</i></li></ul>
          </div>
        </div>`],
    hmif: () => ['<img class="hmif-photo" loading="lazy" decoding="async" src="assets/images/project-scenes/hmif-photo.jpg" alt="HMIF Universitas Jambi project preview"><div class="hmif-wash"></div><img class="hmif-logo" loading="lazy" src="assets/images/project-scenes/hmif-logo.png" alt="HMIF logo">', "HMIF / UNJA", "BERSAMA · BERDAYA · BERKARYA"]
  };
  const projectPreview = (project) => {
    const makeScreen = projectScreens[project.preview] || (!project.image && projectScreens.terminal);
    const [screen, hudLabel, hudText] = makeScreen ? makeScreen(project) :
      [`<img loading="lazy" decoding="async" src="${escapeHTML(project.image)}" alt="${escapeHTML(project.title)} preview">`];
    return `<div class="project-preview project-cover cover-${escapeHTML(project.preview)}" style="--accent:${escapeHTML(project.accent || "#8fd6ff")}" data-depth>
      <div class="cover-window">
        <div class="cover-bar" aria-hidden="true"><i></i><i></i><i></i><span>${escapeHTML(project.title)}</span></div>
        <div class="cover-screen">${screen}</div>
      </div>
      <div class="preview-hud"><span>${hudLabel || `${escapeHTML((project.category || "project").toUpperCase())} / ${escapeHTML(project.year)}`}</span><b>${hudText || escapeHTML(project.subtitle)}</b></div>
    </div>`;
  };

  const renderSkills = () => {
  const items = data.skills.map(name => {
    const file = data.skillIcons?.[name];

    const visual = file
      ? `
        <img
          src="assets/images/stack/${escapeHTML(file)}"
          alt=""
          width="28"
          height="28"
          decoding="async"
        >
      `
      : `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M3 3h7v7H3zM14 3h7v7h-7z
               M3 14h7v7H3zM14 14h7v7h-7z"
          />
        </svg>
      `;

    return `
      <li class="stack-chip">
        ${visual}
        <b>${escapeHTML(name)}</b>
      </li>
    `;
  }).join("");

  return `
    <section class="skill-marquee" aria-label="Tech stack" data-reveal>
      <header class="stack-heading">
        <h2>TOOLS I WORK WITH</h2>

        <button
          type="button"
          data-stack-pause
          aria-pressed="false"
        >
          ${t({ id: "Jeda", en: "Pause" })}
        </button>
      </header>

      <div
        class="stack-track"
        style="--stack-duration: ${Math.max(35, data.skills.length * 2.8)}s"
      >
        <ul>${items}</ul>
        <ul aria-hidden="true">${items}</ul>
      </div>
    </section>
  `;
};

  const renderHome = () => `
    <main class="page home-page">
      <section class="home-hero">
        <div class="hero-copy" data-reveal>
          <span class="hero-overline">EDIT THIS PAGE IN (assets/js/site.js)</span>
          <h1><em>YOUR</em><strong>NAME HERE!</strong></h1>
          <p class="hero-tagline">${t(data.person.tagline)}</p>
          <div class="hero-cta-row">
            <a class="primary-cta route-link magnetic" href="about.html">${t({ id: "MASUK KE ARSIP", en: "ENTER THE ARCHIVE" })}<b>↘</b></a>
            <span>GAME · WEB · SERVER · DESIGN · ETHICAL HACKING</span>
          </div>
        </div>
        <div class="hero-portrait tilt-surface" data-reveal>
          <div class="portrait-frame"><img src="assets/images/di-hutan.jpg" alt="Your Name Here!"><div class="portrait-glitch"></div></div>
          <div class="portrait-caption"><b>kerenbgt.png</b></div>
          <img class="pixel-companion" src="assets/images/pixel-bird.gif" alt="Pixel bird mascot">
        </div>
      </section>
      <section class="home-signal-grid" data-reveal>
        <article><span>CURRENT</span><strong>YOUR MAJOR</strong><p>Your University</p></article>
        <article><span>BUILDING</span><strong>DIGITAL WORLDS</strong><p>Game, web, Minecraft systems</p></article>
        <article><span>BASE</span><strong>YOUR COUNTRY</strong><p>Jakarta, Indonesia</p></article>
      </section>
      <section class="home-manifesto" data-reveal>
        <span>MANIFESTO</span>
        <p>${t({ id: "Saya membangun pengalaman digital seperti membangun sebuah dunia. Mulainya dari sistem, lalu desain memberinya suasana, dan orang-orang yang memakainya yang membuatnya hidup.", en: "I build digital experiences the way you'd build a small world. It starts with the system, design gives it atmosphere, and the people who use it bring it to life." })}</p>
        ${nextLink(t({ id: "Tentang Saya", en: "About Me" }))}
      </section>
    </main>${footer}`;

  const renderAbout = () => `
    <main class="page about-page">
      <section class="page-intro about-intro" data-reveal>
        ${pageCode("ORIGIN", t({ id: "Tentang Saya", en: "About Me" }), "PERSONAL LOG")}
        <div class="intro-grid"><p>${t(data.person.bio)}</p><div class="identity-stamp"><span>NAME</span><b>${data.person.name}</b><span>BASE</span><b>${data.person.location}</b><span>CURRENT</span><b>p[Your Major]</b></div></div>
      </section>
<section
  class="story-section pixel-story"
  id="story"
  aria-label="Perjalanan kreatif"
>
  <div class="journey-stage">
    <header class="journey-header">
      <span>THE ORIGIN STORY</span>
      <span>SCROLL TO EXPLORE ↓</span>
    </header>

<div class="journey-scene" aria-hidden="true">
  <canvas class="journey-canvas"></canvas>

  <div class="journey-sky">
    <span class="journey-sky__label">
      ${escapeHTML(data.story[0].label)}
    </span>

    <p class="journey-sky__title">
      ${escapeHTML(t(
        data.story[0].sceneTitle || data.story[0].title
      ))}
    </p>
  </div>
</div>

    <div class="journey-copy">
      ${data.story.map(chapter => `
        <article
        class="journey-chapter"
        data-scene-title="${escapeHTML(t(chapter.sceneTitle || chapter.title))}"
        >
          <small>${escapeHTML(chapter.label)}</small>
          <h2>${escapeHTML(t(chapter.title))}</h2>
          <p>${escapeHTML(t(chapter.body))}</p>
        </article>
      `).join("")}
    </div>

    <ol class="journey-steps" aria-label="Bab cerita">
      ${data.story.map((_, i) => `
        <li>${two(i + 1)}</li>
      `).join("")}
    </ol>
  </div>
</section>
      <section class="about-portrait-section" data-reveal>
        <figure class="tilt-surface"><img src="assets/images/profile-about.webp" alt="Muhammad Aziz Syah Dani playing drums"><figcaption>wreckingheadtour.png</figcaption></figure>
        <div class="about-statement"><span>CURIOSITY</span><h2>${t({ id: "Lewat teknologi saya bereksplorasi, dan lewat musik saya menjaga iramanya.", en: "Technology is where I explore, and music is how I keep the rhythm." })}</h2><p>${t({ id: "Saya senang membongkar cara kerja sebuah sistem, mencari masalahnya, lalu menyusunnya kembali jadi pengalaman yang lebih baik.", en: "I enjoy taking a system apart, finding where it struggles, and putting it back together as a better experience." })}</p></div>
      </section>
      <section class="resume-section" data-reveal>
        <div class="section-label">${t({ id: "PENGALAMAN", en: "EXPERIENCE" })}</div>
        <div class="experience-list">${data.experience.map((item) => `<article><time>${item.period}</time><div><h3>${item.role}</h3><b>${item.place}</b><p>${t(item.detail)}</p></div></article>`).join("")}</div>
      </section>
      ${renderSkills()}
      ${nextLink()}
    </main>${footer}`;

  const renderProjects = () => `
    <main class="page projects-page">
      <section class="page-intro compact-intro" data-reveal>
        ${pageCode("MEGASTRUCTURE [BUILD LOG]", t({ id: "Projek Terpilih", en: "Selected Projects" }), "REAL REPOSITORY DATA / 2026")}
        <p class="page-lead">${t({ id: "Semua projek di website ini bisa di edit di (assets/js/content.js), dan untuk tulisan ini bisa di edit di (assets/js/site.js). Saya sengaja tidak hapus semua projek saya, agar saya bisa kasih refrensi bagaimana cara design nya di dalam source code ini.", en: "All projects on this website can be edited in (assets/js/content.js), and this text can be edited in (assets/js/site.js). I intentionally kept all my projects to provide a reference for how the design is implemented in the source code." })}</p>
      </section>
      <div class="collection-toolbar" aria-label="Filter projects"><label class="search-field"><span>⌕</span><input id="projectSearch" type="search" placeholder="${t({id:"Cari proyek…",en:"Search projects…"})}" aria-label="Cari proyek"></label><div class="filter-chips">${["all","games","tools","security","web","archive"].map((c)=>`<button data-project-filter="${c}" aria-pressed="${c==='all'}" class="${c==='all'?'active':''}">${c==='all'?t({id:"Semua",en:"All"}):c}</button>`).join("")}</div><span id="projectCount" role="status">${data.projects.length} projects</span></div>
      <p id="projectEmpty" class="empty-state" hidden>${t({id:"Belum ada proyek yang cocok.",en:"No matching projects."})}</p>
      <section class="project-stack">
        ${data.projects.map((project) => `
          <article class="project-card ${project.status.toLowerCase()}" data-project="${project.id}" data-category="${project.category}" data-reveal>
            <header class="project-card-header"><span>${project.index}</span><b>${project.status}</b><time>${project.year}</time></header>
            <div class="project-visual">${projectPreview(project)}</div>
            <div class="project-copy">
              <small>${project.subtitle}</small><h2>${project.title}</h2><p>${t(project.description)}</p>

              <div class="tech-list">${project.technologies.map(techMark).join("")}</div>
              <div class="project-actions">
                ${project.source ? `<a class="project-button magnetic" href="${project.source}" target="_blank" rel="noreferrer">${icon("github")}<span>GitHub</span></a>` : `<span class="project-button disabled">${icon("code")}<span>Private archive</span></span>`}
                ${project.demo ? `<a class="project-button demo magnetic" href="${project.demo}" target="_blank" rel="noreferrer">${icon("arrow")}<span>Live demo</span></a>` : `<span class="project-button disabled">${icon("arrow")}<span>No public demo</span></span>`}
              </div>
              <div class="reaction-row" data-reactions="${project.id}" aria-label="Reaksi untuk ${escapeHTML(project.title)}">${[["heart","♡"],["fire","✦"],["clap","👏"]].map(([kind,glyph])=>`<button data-react="${kind}" data-project-id="${project.id}" aria-label="${kind} ${escapeHTML(project.title)}" aria-pressed="false"><span>${glyph}</span><b data-count>—</b></button>`).join("")}<small>${t({id:"Login untuk bereaksi",en:"Sign in to react"})}</small></div>
            </div>
          </article>`).join("")}
      </section>
      <a class="view-more magnetic" href="https://github.com/Albatany?tab=repositories" target="_blank" rel="noreferrer">${icon("github")}<span>View More</span><small>${t({ id: "Repository lain di GitHub", en: "More repositories on GitHub" })}</small><b>↗</b></a>
      ${nextLink()}
    </main>${footer}`;

  const validationLink = (item, demoNote) => item.validationUrl ? `<a class="validation-link" href="${escapeHTML(item.validationUrl)}" target="_blank" rel="noopener noreferrer">${t({id:"Cek Validasi",en:"Validate"})} ↗ ${item.validationDemo ? `<small>${demoNote}</small>` : ""}</a>` : "";

  const renderAchievements = () => `
    <main class="page achievements-page">
      <section class="page-intro compact-intro" data-reveal>
        ${pageCode("PROOF OR PROGRESS!", t({ id: "Pencapaian", en: "Achievements" }), "LEARN · EXPLORE · COLLECT")}
        <p class="page-lead">${t({ id: "Ini arsip bukti proses saya, dan isinya akan terus bertambah. Klik salah satu kartu untuk melihat konteks, penerbit, tanggal, dan credential-nya.", en: "This is an archive of proof that keeps growing. Open a card to see its context, issuer, date, and credential." })}</p>
      </section>
      <div class="collection-toolbar"><span class="collection-total">${two(data.achievements.length)} <small>${t({id:"SERTIFIKAT",en:"CERTIFICATES"})}</small></span><label class="search-field"><span>⌕</span><input id="certificateSearch" type="search" placeholder="${t({id:"Cari pencapaian…",en:"Search achievements…"})}" aria-label="Cari pencapaian"></label><div class="filter-chips">${["all",...new Set(data.achievements.map(a=>a.collection))].map(c=>`<button data-certificate-filter="${c}" class="${c==='all'?'active':''}" aria-pressed="${c==='all'}">${c==='all'?t({id:"Semua",en:"All"}):c}</button>`).join("")}</div></div>
      <p id="certificateEmpty" class="empty-state" role="status" hidden>${t({id:"Belum ada pencapaian yang cocok.",en:"No matching achievements."})}</p>
      <section class="certificate-list">${data.achievements.map((item,index)=>`<article class="certificate-tile" data-certificate-tile="${index}"><button class="certificate-card" data-certificate="${index}"><div class="cert-art"><img src="${item.image}" alt="${escapeHTML(t(item.title))}" loading="lazy"></div><div class="cert-copy"><small>${escapeHTML(item.year)} / ${escapeHTML(item.collection)}</small><h2>${t(item.title)}</h2><p>${t(item.issuer)}</p><span>${t({id:"Lihat sertifikat",en:"View certificate"})} ↗</span></div></button>${validationLink(item, "VALIDATION")}</article>`).join("")}</section>
      ${nextLink()}
      <dialog class="modal-dialog" id="certificateDialog" aria-label="Detail sertifikat"><button class="dialog-close" data-dialog-close aria-label="Close">×</button><div id="certificateContent"></div></dialog>
    </main>${footer}`;

  const renderGallery = () => `
    <main class="page gallery-page">
      <section class="page-intro compact-intro" data-reveal>
        ${pageCode("MEMORY BANK", t({ id: "Galeri", en: "Gallery" }), "MUSIC · CAMPUS · PROJECTS")}
        <p class="page-lead">${t({ id: "Foto-foto di sini adalah potongan waktu: musik, kampus, proses kreatif, dan hal-hal kecil yang layak disimpan.", en: "These photos are fragments of time: music, campus, creative process, and small things worth keeping." })}</p>
      </section>
      <section class="gallery-toolbar" data-reveal>
        <span>MOMENT FILTER /</span>
        <button class="active" data-gallery-filter="all">ALL</button>
        <button data-gallery-filter="music">MUSIC</button>
        <button data-gallery-filter="campus">CAMPUS</button>
        <button data-gallery-filter="projects">PROJECTS</button><button data-gallery-filter="life">LIFE</button><button data-gallery-filter="school">SCHOOL</button>
      </section>
      <section class="gallery-grid">
        ${data.gallery.map((item, index) => `<button class="gallery-item tilt-surface" data-category="${item.category}" data-gallery-item="${index}" data-reveal>
          <img loading="lazy" src="${item.image}" style="object-position:${item.position || "center"}" alt="${escapeHTML(t(item.title))}">
          <div class="gallery-shade"></div><span>0${index + 1} / ${item.category.toUpperCase()}</span>
          <div><small>${item.year}</small><h2>${t(item.title)}</h2><p>${t(item.note)}</p></div><b>↗</b>
        </button>`).join("")}
      </section>
      ${nextLink()}
      <dialog class="gallery-dialog modal-dialog" id="galleryDialog"><button class="dialog-close" data-dialog-close aria-label="Close">×</button><div id="galleryDialogContent"></div></dialog>
    </main>${footer}`;

  const loadingBars = () => `<div class="loading-bars">${Array.from({ length: 8 }, (_, index) => `<i style="--i:${index}"></i>`).join("")}</div>`;

  const statCard = (id,label,num) => `<article class="telemetry-card" id="${id}" data-reveal><header><span>${num}</span><b>${label}</b><i data-status>LOADING</i></header><div class="integration-loading">${loadingBars()}<p>FETCHING PUBLIC SIGNAL</p></div><div class="integration-content" hidden></div>${['steamCard','discordCard'].includes(id)?`<button class="stat-detail" data-stat-detail="${id}">${t({id:"Lihat ringkasan",en:"View summary"})} ↗</button>`:''}</article>`;
  const renderStats = () => `
    <main class="page stats-page">
      <section class="page-intro compact-intro" data-reveal>${pageCode("SIGNAL / TELEMETRY", t({id:"Di Balik Layar",en:"Behind the Screen"}), "CODE · TYPE · PLAY")}<p class="page-lead">${t({id:"Di sini ada jejak saya membangun, belajar, dan bermain. Datanya terhubung langsung ke layanan yang saya pakai.",en:"This is a trail of what I build, learn, and play. The data is connected directly to the services I use."})}</p></section>
      <section class="telemetry-grid">${statCard('wakaCard','WAKATIME / CODING','01')}${statCard('githubCard','GITHUB / ACTIVITY','02')}${statCard('monkeytypeCard','MONKEYTYPE / TYPING','03')}${statCard('discordCard','DISCORD / PRESENCE','04')}${statCard('steamCard','STEAM / PLAY','05')}</section>
      <section class="popular-repositories" id="popularRepositories"><div class="section-heading"><h2>Popular repositories</h2><a href="https://github.com/Albatany?tab=repositories" target="_blank" rel="noreferrer">GitHub ↗</a></div><div id="popularRepoGrid" class="popular-repo-grid"><p class="muted">${t({id:"Memuat repository…",en:"Loading repositories…"})}</p></div></section>
      <section class="resume-stats" data-reveal>${data.resumeStats.map(item=>`<article><strong>${item.value}</strong><span>${t(item.label)}</span></article>`).join('')}</section>${nextLink()}
      <dialog class="modal-dialog small-dialog" id="statsDialog" aria-labelledby="statsDialogTitle"><button class="dialog-close" data-dialog-close aria-label="Close">×</button><h2 id="statsDialogTitle">Profile</h2><div id="statsDialogContent"></div></dialog>
    </main>${footer}`;

  const renderContact = () => `
    <main class="page contact-page">
      <section class="contact-banner" aria-label="Albatany contact"><img src="assets/images/head.png" alt=""><div><span>ALBATANY / OPEN CHANNEL</span><p>Good things begin<br>with a conversation.</p></div><span class="banner-coordinate">06° S / 107° E<br>INDONESIA</span></section>
      <section class="contact-hero" data-reveal>
        <span>AVAILABLE FOR COLLABORATION</span>
        <h1 class="scramble" data-text="${escapeHTML(t({ id: "Mari membuat sesuatu yang layak diingat.", en: "Let's build something worth remembering." }))}">${t({ id: "Mari membuat sesuatu yang layak diingat.", en: "Let's build something worth remembering." })}</h1>
        <div class="contact-intro"><p>${t({ id: "Punya ide, ajakan kolaborasi, atau project game, web, maupun server? Silakan hubungi saya lewat kanal yang paling nyaman buat kamu.", en: "Have an idea, a collaboration, or a game, web, or server project? Reach out through whichever channel is most comfortable for you." })}</p><div><i></i><span>RESPONSE WINDOW<br><b>1 - 3 Days</b></span></div></div>
      </section>
      <section class="social-constellation" data-reveal>
        ${data.socials.map((social, index) => `<a class="social-card brand-${social.icon} magnetic" href="${social.href}" target="${social.href.startsWith("http") ? "_blank" : "_self"}" rel="noreferrer"><span>0${index + 1}</span><div class="social-icon">${icon(social.icon)}</div><div><small>${social.label}</small><strong>${social.value}</strong></div><b>↗</b></a>`).join("")}
      </section>
      <section class="contact-layout" data-reveal>
        <div class="contact-profile">
          <img src="assets/images/di-pantai.png" alt="Your Name Here!">
          <div><span>BASED IN</span><b>BANDUNG, JAWA BARAT</b><span>FOCUS</span><b>GAME · WEB · SERVER</b><span>STATUS</span><b class="online">OPEN TO EXPLORE</b></div>
        </div>
        <form class="contact-form" id="contactForm"><div class="form-honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
          <header><span>DIRECT MESSAGE / EMAIL</span><b>NO. 07</b></header>
          <label><span>${t({ id: "NAMA", en: "NAME" })}</span><input name="name" minlength="2" maxlength="80" required autocomplete="name" placeholder="Your name"></label>
          <label><span>EMAIL</span><input name="email" maxlength="254" required type="email" autocomplete="email" placeholder="you@example.com"></label>
          <label><span>${t({ id: "PESAN", en: "MESSAGE" })}</span><textarea name="message" minlength="10" maxlength="4000" required rows="5" placeholder="Tell me about the idea..."></textarea></label>
          <div id="contactCaptcha"></div><button type="submit" id="contactSubmit"><span>${t({id:"KIRIM PESAN",en:"SEND MESSAGE"})}</span><b>↗</b></button><p id="contactStatus" role="status" aria-live="polite">${t({id:"Nama dan email hanya dipakai untuk membalas pesanmu.",en:"Your name and email are used only to reply."})}</p><a class="email-fallback" href="mailto:${data.person.email}">${t({id:"Atau buka aplikasi email",en:"Or open your email app"})} ↗</a>
        </form>
      </section>
      <section class="contact-end" data-reveal><img src="assets/images/pixel-bird.gif" alt="Pixel bird"><p>IF THE SIGNAL IS GOOD,<br><span>LET'S MAKE IT REAL.</span></p><a href="mailto:${data.person.email}">${data.person.email}</a></section>
    </main>${footer}`;

  const renderPrivacy = () => `<main class="page privacy-page"><section class="page-intro">${pageCode("YOUR DATA / YOUR CHOICE",t({id:"Privasi",en:"Privacy"}),"UPDATED / OCTOBER 2026")}</section><article class="privacy-prose">
    <p>${t({id:"Situs ini dikelola oleh Muhammad Aziz Syah Dani (Aziz Albatany). Kamu bisa menjelajah tanpa login. Login hanya diperlukan untuk menulis guestbook dan memberi reaksi.",en:"This site is operated by Muhammad Aziz Syah Dani (Aziz Albatany). You can browse without signing in. An account is only required to post in the guestbook or react to projects."})}</p>
    <h2>${t({id:"Apa yang terlihat oleh publik?",en:"What is public?"})}</h2><p>${t({id:"Nama samaran pilihanmu, isi pesan, dan waktu pengiriman muncul di guestbook. Reaksi ditampilkan sebagai jumlah total. Email, ID autentikasi, foto profil, token, dan nama asli dari provider tidak ditampilkan melalui API komunitas publik.",en:"Your chosen alias, message, and posting time appear in the guestbook. Reactions appear as aggregate counts. Email addresses, authentication IDs, profile photos, tokens, and real names from providers are not exposed by the public community API."})}</p>
    <h2>${t({id:"Apa yang diproses saat login?",en:"What is processed during sign-in?"})}</h2><p>${t({id:"Google atau GitHub serta Supabase Auth memproses identitas dasar akun, termasuk email. Administrator proyek autentikasi dapat mengakses data tersebut melalui dashboard penyedia. Karena itu, login ini bukan layanan anonim terhadap administrator. Situs tidak meminta akses kotak masuk email atau repository privat dan tidak menyalin profil provider ke tabel komunitas.",en:"Google or GitHub and Supabase Auth process basic account identity, including email. Authentication project administrators can access this data in the provider dashboard. This is therefore not an anonymous login service with respect to administrators. The site does not request inbox or private repository access, and does not copy provider profiles into community tables."})}</p>
    <h2>${t({id:"Penyimpanan dan layanan",en:"Storage and services"})}</h2><p>${t({id:"Sesi login disimpan di sessionStorage tab browser; preferensi bahasa dan musik disimpan secara lokal. Pesan dan reaksi disimpan di Supabase sampai kamu menghapusnya atau pemilik memoderasinya. Catatan pembatasan spam tetap menyimpan ID internal, jumlah, dan waktu aktivitas. Vercel dan layanan integrasi dapat memproses log teknis termasuk alamat IP sesuai kebijakan mereka. Tidak ada analytics iklan tambahan di kode situs.",en:"The sign-in session is stored in the browser tab’s sessionStorage; language and music preferences are stored locally. Messages and reactions remain in Supabase until you delete them or the owner moderates them. Abuse prevention records retain an internal ID, counts, and timestamps. Vercel and integrated providers may process technical logs including IP addresses under their own policies. No additional advertising analytics are included in this site."})}</p>
    <h2>${t({id:"Pesan kontak",en:"Contact messages"})}</h2><p>${t({id:"Formulir kontak mengirim nama, email, dan pesan ke inbox pemilik melalui Resend untuk dibalas. Data ini tidak tampil publik. Cloudflare Turnstile memeriksa permintaan untuk mengurangi spam. Mengirim pesan kontak berarti kamu sengaja membagikan detail tersebut kepada penerima.",en:"The contact form sends your name, email, and message to the owner’s inbox through Resend so they can reply. This information is not public. Cloudflare Turnstile checks requests to reduce spam. Sending a contact message intentionally shares these details with the recipient."})}</p>
    <h2>${t({id:"Kontrol dan penghapusan",en:"Control and deletion"})}</h2><p>${t({id:"Hapus pesan sendiri lewat tombol pada guestbook. Menu Akun → Hapus kontribusi saya menghapus seluruh pesan, reaksi, dan nama samaranmu, tetapi tidak menghapus akun autentikasi atau catatan anti-spam. Untuk menghapus akun beserta catatan terkait atau meminta penghapusan email kontak, hubungi alamat di bawah. Administrator akan memverifikasi bahwa permintaan berasal dari pemilik akun.",en:"Delete individual messages in the guestbook. Account → Delete my contributions removes your messages, reactions, and alias, but not your authentication account or abuse prevention records. To delete the authentication account and related records, or request removal of contact emails, use the address below. The administrator will verify account ownership first."})}</p><a href="mailto:${data.person.email}">${data.person.email}</a>
  </article></main>${footer}`;
  const renderAuth = () => `<main class="page auth-page"><span class="modal-kicker">COMMUNITY / SIGN IN</span><h1>${t({id:"Menghubungkan akun…",en:"Connecting your account…"})}</h1><p id="authStatus" role="status">${t({id:"Sedang menyelesaikan login dengan aman.",en:"Completing your sign-in."})}</p><a href="index.html">${t({id:"Kembali ke situs",en:"Return to the site"})} ↗</a></main>`;
  /* ---------- Guides, Devlogs, Papers: isi diambil dari content.js ---------- */
  const sampleTag = (item) => item.placeholder ? `<i class="sample-tag">${t({ id: "CONTOH", en: "SAMPLE" })}</i>` : "";
  const dateLabel = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString(language === "id" ? "id-ID" : "en-US", { dateStyle: "long", timeZone: "UTC" });
  const newestFirst = (items) => items.map((item, index) => ({ item, index })).sort((a, b) => b.item.date.localeCompare(a.item.date));
  const readLabel = t({ id: "Baca", en: "Read" });
  const libraryIntro = (code, title, note, lead) => `
      <section class="page-intro compact-intro" data-reveal>
        ${pageCode(code, title, note)}
        <p class="page-lead">${lead}</p>
      </section>`;

  const renderGuides = () => `
    <main class="page guides-page">
      ${libraryIntro("LIBRARY / GUIDE BOOKS", "Guides", "READ ON THE SITE", t({ id: "Kumpulan guide book yang saya tulis sendiri. Pilih salah satu, lalu baca langsung di halaman ini.", en: "Guide books I wrote myself. Pick one and read it right here on this page." }))}
      ${data.guides.length ? `<section class="guide-shelf">${data.guides.map((guide, index) => {
        const title = escapeHTML(t(guide.title));
        return `<article class="guide-card" style="--accent:${escapeHTML(guide.accent || "#8fd6ff")}" data-reveal>
          <button type="button" class="guide-book" data-read="guides:${index}" aria-label="${readLabel} ${title}">
            <span class="book-cover">
              <span class="book-art" aria-hidden="true"><small>GUIDE ${two(index + 1)}</small><strong>${title}</strong><em>${escapeHTML(data.person.alias)}</em></span>
              ${guide.cover ? `<img src="${escapeHTML(guide.cover)}" alt="" loading="lazy" decoding="async" data-fallback="hide">` : ""}
            </span>
          </button>
          <div class="guide-copy">
            <small>${escapeHTML([guide.tag, guide.year].filter(Boolean).join(" / "))}${sampleTag(guide)}</small>
            <h2>${title}</h2>
            <p>${escapeHTML(t(guide.description))}</p>
            <button type="button" class="read-button" data-read="guides:${index}">${icon("book")}<span>${readLabel}</span></button>
          </div>
        </article>`;
      }).join("")}</section>` : `<p class="empty-state">${t({ id: "Belum ada guide book di sini.", en: "No guide books here yet." })}</p>`}
      ${nextLink()}
    </main>${footer}`;

  const renderDevlogs = () => `
    <main class="page devlogs-page">
      ${libraryIntro("FEED / DEVLOGS", "Devlogs", "NOTES · THOUGHTS", t({ id: "Tempat saya berbagi ilmu dan isi pikiran, soal teknologi atau hal lain yang sedang ingin saya ceritakan. Entri terbaru ada di paling atas.", en: "Where I share what I've learned and what's on my mind, about technology or anything else I feel like writing about. The newest entry is at the top." }))}
      ${data.devlogs.length ? `<section class="devlog-feed">${newestFirst(data.devlogs).map(({ item: post }, order) => `
        <a class="devlog-entry" href="#${escapeHTML(post.id)}" data-devlog="${escapeHTML(post.id)}" data-reveal>
          <time datetime="${escapeHTML(post.date)}">${dateLabel(post.date)}</time>
          <div>
            <small>${order ? "" : `<i class="latest-tag">${t({ id: "TERBARU", en: "LATEST" })}</i>`}${escapeHTML((post.tags || []).join(" · "))}${sampleTag(post)}<span>${Math.max(1, Math.round(t(post.body).split(/\s+/).length / 200))} ${t({ id: "menit baca", en: "min read" })}</span></small>
            <h2>${escapeHTML(t(post.title))}</h2>
            <p>${escapeHTML(t(post.excerpt))}</p>
            <span class="devlog-more">${t({ id: "Baca selengkapnya", en: "Read more" })} <b>↗</b></span>
          </div>
        </a>`).join("")}</section>` : `<p class="empty-state">${t({ id: "Belum ada entri. Mampir lagi nanti, ya.", en: "No entries yet. Please check back later." })}</p>`}
      ${nextLink()}
    </main>${footer}`;

  // Dua status per paper: dipublikasikan (bisa dibaca umum) dan diterbitkan (resmi, jurnal atau prosiding).
  const paperStatus = {
    published: {
      true: ["globe", { id: "Dipublikasikan", en: "Public" }, { id: "Paper ini sudah dipublikasikan, jadi bisa dibaca siapa saja.", en: "This paper has been made public, so anyone can read it." }],
      false: ["lock", { id: "Belum dipublikasikan", en: "Not public yet" }, { id: "Paper ini belum dipublikasikan untuk umum.", en: "This paper has not been made public yet." }]
    },
    issued: {
      true: ["award", { id: "Diterbitkan", en: "Published" }, { id: "Paper ini sudah diterbitkan secara resmi, misalnya di jurnal atau prosiding.", en: "This paper has been formally published, for example in a journal or proceedings." }],
      false: ["hourglass", { id: "Belum diterbitkan", en: "Not published yet" }, { id: "Paper ini belum diterbitkan secara resmi di jurnal atau prosiding.", en: "This paper has not been formally published in a journal or proceedings yet." }]
    }
  };
  const statusBadge = (paper, index, key) => {
    const state = Boolean(paper[key]);
    const [glyph, label, note] = paperStatus[key][state];
    const extra = key === "issued" ? [state && t(paper.venue), t(paper.statusNote)].filter(Boolean).join(". ") : "";
    return `<span class="status-wrap">
      <button type="button" class="status-badge status-${key} ${state ? "is-on" : "is-off"}" data-disclosure aria-expanded="false" aria-controls="status-${key}-${index}">${icon(glyph)}<span>${t(label)}</span></button>
      <span class="status-note disclosure-panel" id="status-${key}-${index}" role="note" inert>${t(note)}${extra ? ` <em>${escapeHTML(extra)}</em>` : ""}</span>
    </span>`;
  };
  const renderPapers = () => `
    <main class="page papers-page">
      ${libraryIntro("ARCHIVE / PAPERS", "Papers", "RESEARCH · ARTICLES", t({ id: "Hasil penelitian dan artikel yang sudah saya tulis. Klik badge status pada tiap paper untuk melihat keterangannya.", en: "Research and articles I've written. Click a paper's status badge to see what it means." }))}
      ${data.papers.length ? `<section class="paper-list">${newestFirst(data.papers).map(({ item: paper, index }) => `
        <article class="paper-card" data-reveal>
          <div class="paper-meta"><time datetime="${escapeHTML(paper.date)}">${dateLabel(paper.date)}</time><span>${escapeHTML(t(paper.kind))}</span>${sampleTag(paper)}</div>
          <div class="paper-body">
            <h2>${escapeHTML(t(paper.title))}</h2>
            ${t(paper.venue) ? `<b>${escapeHTML(t(paper.venue))}</b>` : ""}
            <p>${escapeHTML(t(paper.abstract))}</p>
          </div>
          <div class="paper-side">
            <div class="paper-status">${statusBadge(paper, index, "published")}${statusBadge(paper, index, "issued")}</div>
            ${paper.pdf ? `<button type="button" class="read-button" data-read="papers:${index}">${icon("paper")}<span>${t({ id: "Baca PDF", en: "Read PDF" })}</span></button>` : `<span class="read-button disabled">${icon("paper")}<span>${t({ id: "PDF belum tersedia", en: "PDF not available yet" })}</span></span>`}
          </div>
        </article>`).join("")}</section>` : `<p class="empty-state">${t({ id: "Belum ada paper di sini.", en: "No papers here yet." })}</p>`}
      ${nextLink()}
    </main>${footer}`;

  /* ---------- Gendut <3: foto dan kalimat diambil dari data.love ---------- */
  const pixelHeart = '<svg class="pixel-heart" viewBox="0 0 9 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M1 0h2v1h1v1h1V1h1V0h2v1h1v3H8v1H7v1H6v1H5v1H4V7H3V6H2V5H1V4H0V1h1z"/></svg>';
  const staggered = (text, unit) => text.split(unit).map((part, index) => `<span style="--w:${index}">${escapeHTML(part)}</span>`).join(unit);
  const loveTilts = [-5, 4, -3, 6, -6, 3, 5, -4];
  const loveScene = (scene, index) => `
      <section class="love-scene love-${["polaroid", "pair"][scene.photos.length - 1] || "strip"} ${index % 2 ? "is-flipped" : ""}" data-love>
        <div class="love-photos">${scene.photos.map((photo, i) => `
          <figure class="love-photo" style="--i:${i};--tilt:${loveTilts[(index * 3 + i) % loveTilts.length]}deg">
            <div class="love-frame">
              <span class="love-shot"><img src="${escapeHTML(photo.src)}" alt="${escapeHTML(t(photo.caption) || t({ id: "Foto kita", en: "A photo of us" }))}" loading="lazy" decoding="async" data-fallback="hide"></span>
              ${photo.caption ? `<figcaption>${escapeHTML(t(photo.caption))}</figcaption>` : ""}
            </div>
          </figure>`).join("")}
        </div>
        <p class="love-line">${staggered(t(scene.text), " ")}</p>
      </section>`;
  const renderGendut = () => `
    <main class="page love-page">
      <div class="love-sky" aria-hidden="true"></div>
      <section class="love-hero">
        <span class="love-kicker">${t({ id: "buat kamu", en: "for you" })}</span>
        <h1 class="love-title"><span class="love-name">${staggered(t(currentPage.label), "")}</span>${pixelHeart}</h1>
        <p class="love-lead">${escapeHTML(t(data.love.lead))}</p>
        <div class="love-song">
          <button type="button" id="loveSong" class="love-song-toggle" aria-pressed="false"><i aria-hidden="true"></i><span>${t({ id: "Putar lagunya", en: "Play the song" })}</span></button>
          <p id="loveSongHint" role="status">${escapeHTML(data.love.song.title)} · ${escapeHTML(data.love.song.artist)}</p>
        </div>
        <span class="love-cue" aria-hidden="true">scroll<i></i></span>
      </section>
      ${data.love.scenes.map(loveScene).join("")}
      <section class="love-promise" data-love>
        <svg class="love-pulse" viewBox="0 0 600 60" aria-hidden="true"><path pathLength="1" d="M0 30h214l12-20 16 44 14-38 10 14h334"/></svg>
        <p>${staggered(t(data.love.promise), " ")}</p>
      </section>
      <section class="love-end" data-love>
        <blockquote class="love-quote"><p>${escapeHTML(t(data.love.quote))}</p></blockquote>
        <p class="love-closing">${escapeHTML(t(data.love.closing))}</p>
        <div class="love-exit"><a class="love-back route-link" href="gallery.html">${pixelHeart}<span>${t({ id: "Kembali ke Gallery", en: "Back to Gallery" })}</span>${pixelHeart}</a></div>
      </section>
    </main>`;

  const renderers = {
    home: renderHome, about: renderAbout, projects: renderProjects,
    achievements: renderAchievements, gallery: renderGallery,
    stats: renderStats, contact: renderContact, privacy: renderPrivacy, auth: renderAuth,
    guides: renderGuides, devlogs: renderDevlogs, papers: renderPapers, gendut: renderGendut
  };
  root.innerHTML = (renderers[pageId] || renderHome)();
  document.querySelectorAll("[data-stack-pause]").forEach(button => {
  button.addEventListener("click", () => {
    const section = button.closest(".skill-marquee");
    const paused = section.classList.toggle("is-paused");

    button.setAttribute("aria-pressed", String(paused));

    button.textContent = paused
      ? t({ id: "Lanjutkan", en: "Resume" })
      : t({ id: "Jeda", en: "Pause" });
  });
});

const musicPlayer = `
  <aside
  class="music-player dock dock-left disk-hidden"
  id="musicPlayer"
  aria-label="Music player"
  aria-hidden="true"
  inert
>

    <section class="music-panel" id="musicPanel" aria-hidden="true" inert>
      <div class="music-panel-head">
        <span>PERSONAL ARCHIVE</span>
        <button class="music-hide" id="musicHide" data-dock-hide aria-label="Sembunyikan pemutar musik">Sembunyikan ↙</button>
      </div>

      <div class="music-info">
        <small>
          NOW PLAYING / <span id="trackNumber">01</span>
        </small>

        <b id="trackTitle"></b>
        <span id="trackArtist"></span>
      </div>

      <div class="music-controls">
        <button id="previousTrack" aria-label="Previous track">‹</button>
        <button id="playPause" aria-label="Play">▶</button>
        <button id="nextTrack" aria-label="Next track">›</button>
      </div>

      <div class="music-progress">
        <span id="currentTime">0:00</span>

        <input
          id="musicSeek"
          type="range"
          min="0"
          max="100"
          value="0"
          aria-label="Seek"
        >

        <span id="duration">0:00</span>
      </div>

      <label class="music-volume">
        <span>VOL</span>

        <input
          id="musicVolume"
          type="range"
          min="0"
          max="1"
          step=".01"
          value=".55"
          aria-label="Volume"
        >
      </label>

      <p class="music-rights">ALL RIGHTS TO ARTIST</p>
    </section>

    <button
      class="disc-button"
      id="musicExpand"
      aria-label="Open music player"
      aria-expanded="false"
      title="Open music player"
    >
<span class="vinyl-disc" aria-hidden="true">
  <span class="vinyl-label">
    <img
      id="discCover"
      alt=""
      decoding="async"
      data-fallback="music"
      hidden
    >
  </span>
  <i></i>
</span>
    </button>

    <button id="musicDockHide" class="dock-hide" data-dock-hide aria-label="Sembunyikan disk" title="Sembunyikan disk">‹</button>
    <audio id="audioPlayer" preload="none"></audio>
  </aside>`;

document.body.insertAdjacentHTML(
  "beforeend",
  musicPlayer + `
    <button id="musicRestore" class="dock-tab dock-left" type="button" aria-label="Tampilkan pemutar musik" title="Musik" aria-controls="musicPlayer" aria-expanded="false">
      <span class="tab-eq" aria-hidden="true"><i></i><i></i><i></i></span>
    </button>
  `
);

  const routeTransition = document.getElementById("routeTransition");
  const menuOverlay = document.getElementById("menuOverlay");
  const menuToggle = document.getElementById("menuToggle");

  menuOverlay.inert = true;
  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuOverlay?.setAttribute("aria-hidden", "true");
    menuOverlay.inert = true;
    root.inert = false;
  };
  menuToggle?.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuOverlay.setAttribute("aria-hidden", String(!open));
    menuOverlay.inert = !open;
    root.inert = open;
    if(open) menuOverlay.querySelector('a,button').focus();
  });

  document.addEventListener('keydown', event => {
    if (!document.body.classList.contains('menu-open')) return;
    if (event.key === 'Escape') { closeMenu(); menuToggle.focus(); }
    if (event.key === 'Tab') {
      const links = [...[...menuOverlay.querySelectorAll('a,button')].filter((item) => !item.closest('[inert]')), menuToggle];
      const current = links.indexOf(document.activeElement);
      if (document.querySelector('dialog[open]')) return;
      event.preventDefault();
      links[(current + (event.shiftKey ? -1 : 1) + links.length) % links.length].focus();
    }
  });
  // Dropdown navigasi dan keterangan badge: buka lewat klik, tutup lewat klik di luar, Esc, atau pindah fokus.
  const setDisclosure = (button, open) => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    button.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("open", open);
    panel.inert = !open;
  };
  const openDisclosures = () => [...document.querySelectorAll('[data-disclosure][aria-expanded="true"]')];
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-disclosure]");
    const keep = button || event.target.closest(".disclosure-panel")?.previousElementSibling;
    openDisclosures().forEach((other) => { if (other !== keep) setDisclosure(other, false); });
    if (button) setDisclosure(button, button.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("focusin", (event) => openDisclosures().forEach((button) => {
    if (!button.closest(".menu-overlay") && !button.parentElement.contains(event.target)) setDisclosure(button, false);
  }));
  document.addEventListener("keydown", (event) => {
    const button = event.key === "Escape" && !document.body.classList.contains("menu-open") && openDisclosures()[0];
    if (button) { setDisclosure(button, false); button.focus(); }
  });
  // Di menu mobile, grup yang memuat halaman aktif langsung terbuka.
  menuOverlay.querySelectorAll(".menu-parent.active").forEach((button) => setDisclosure(button, true));

  document.querySelectorAll(".route-link").forEach((link) => link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || !href.endsWith(".html") || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    closeMenu();
    const target = data.pages.find((page) => page.file === href);
    document.getElementById("transitionLabel").textContent = `ROUTE_${(target?.id || "NEXT").toUpperCase()}`;
    routeTransition.classList.add("active");
    window.setTimeout(() => { window.location.href = href; }, reducedMotion ? 0 : 500);
  }));

  document.querySelectorAll("[data-language]").forEach((button) => button.addEventListener("click", () => {
    if (button.dataset.language === language) return;
    language = button.dataset.language;
    localStorage.setItem("aziz-language", language);
    document.body.classList.add("soft-leave");
    window.setTimeout(() => window.location.reload(), 260);
  }));

  requestAnimationFrame(() => document.body.classList.add("ready"));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });
  document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));

  // Scroll hanya mengganti dua kelas untuk tepi blur, jadi tidak ada hitung ulang style per frame.
  let scrollQueued = false;
  const updateScroll = () => {
    const y = window.scrollY;
    document.body.classList.toggle("scrolled", y > 8);
    document.body.classList.toggle("at-end", y >= document.documentElement.scrollHeight - window.innerHeight - 8);
    scrollQueued = false;
  };
  window.addEventListener("scroll", () => {
    if (!scrollQueued) {
      requestAnimationFrame(updateScroll);
      scrollQueued = true;
    }
  }, { passive: true });
  updateScroll();

  const canHover = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (canHover && !reducedMotion) {
    // Posisi kursor dipasang di dua elemen kecil saja supaya gerakan mouse tidak menghitung ulang style seluruh halaman.
    const cursorParts = document.querySelectorAll(".cursor-glow,.cursor-orb");
    window.addEventListener("pointermove", (event) => cursorParts.forEach((part) => {
      part.style.setProperty("--cursor-x", `${event.clientX}px`);
      part.style.setProperty("--cursor-y", `${event.clientY}px`);
    }), { passive: true });
    document.querySelectorAll(".tilt-surface").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        element.style.setProperty("--mx", x.toFixed(3));
        element.style.setProperty("--my", y.toFixed(3));
        element.style.setProperty("--ry", `${(x - .5) * 5}deg`);
        element.style.setProperty("--rx", `${(.5 - y) * 4}deg`);
      });
      element.addEventListener("pointerleave", () => {
        element.style.setProperty("--ry", "0deg");
        element.style.setProperty("--rx", "0deg");
      });
    });
    document.querySelectorAll(".magnetic").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .08;
        const y = (event.clientY - rect.top - rect.height / 2) * .08;
        element.style.setProperty("--mag-x", `${x}px`);
        element.style.setProperty("--mag-y", `${y}px`);
      });
      element.addEventListener("pointerleave", () => {
        element.style.setProperty("--mag-x", "0px");
        element.style.setProperty("--mag-y", "0px");
      });
    });
  }

  document.querySelectorAll(reducedMotion ? ".no-scramble" : ".scramble").forEach((element) => {
    const original = element.dataset.text || element.textContent;
    element.addEventListener("pointerenter", () => {
      if (element.dataset.scrambling === "true") return;
      element.dataset.scrambling = "true";
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&";
      let frame = 0;
      const timer = window.setInterval(() => {
        element.textContent = original.split("").map((char, index) => {
          if (char === " ") return " ";
          return index < frame / 2 ? char : chars[Math.floor(Math.random() * chars.length)];
        }).join("");
        frame += 1;
        if (frame > original.length * 2) {
          clearInterval(timer);
          element.textContent = original;
          element.dataset.scrambling = "false";
        }
      }, 28);
    });
  });

  const openDialog = (dialog) => {
    if (!dialog) return;
    dialog.showModal();
    requestAnimationFrame(() => dialog.classList.add("open"));
  };
  document.querySelectorAll("[data-dialog-close]").forEach((button) => button.addEventListener("click", () => {
    const dialog = button.closest("dialog");
    dialog?.classList.remove("open");
    window.setTimeout(() => dialog?.close(), 220);
  }));
  document.querySelectorAll("dialog").forEach((dialog) => dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.classList.remove("open");
      window.setTimeout(() => dialog.close(), 220);
    }
  }));

  const certificateDialog = document.getElementById("certificateDialog");
  document.querySelectorAll("[data-certificate]").forEach((button) => button.addEventListener("click", () => {
    const item = data.achievements[Number(button.dataset.certificate)];
    document.getElementById("certificateContent").innerHTML = `
      <span class="modal-kicker">CERTIFICATE / ${escapeHTML(item.year)}</span>
      <h2>${escapeHTML(t(item.title))}</h2><b>${escapeHTML(t(item.issuer))}</b>
      ${item.pdf ? `
  <iframe
    class="certificate-pdf"
    src="${escapeHTML(item.pdf)}#page=1&view=FitH&toolbar=1"
    title="${escapeHTML(t(item.title))}"
    loading="lazy"
  ></iframe>

  <a
    class="certificate-pdf-link"
    href="${escapeHTML(item.pdf)}"
    target="_blank"
    rel="noreferrer"
  >
    OPEN ORIGINAL PDF ↗
  </a>
` : item.image ? `
  <img
    class="certificate-full"
    src="${item.image}"
    alt="${escapeHTML(t(item.title))}"
  >
` : `
  <div class="modal-placeholder">
    NO CERTIFICATE FILE / ADD PDF
  </div>
`}
      ${validationLink(item, "Click to check the validation!")}
      <p>${escapeHTML(t(item.description))}</p>
      <div class="dialog-data"><span>CREDENTIAL</span><b>${escapeHTML(item.credential)}</b><span>STATUS</span><b>${item.placeholder ? "TEMPLATE" : "UPLOADED"}</b></div>`;
    openDialog(certificateDialog);
  }));

  const setIntegration = (card, status, html, isError = false) => {
    if (!card) return;
    card.querySelector("[data-status]").textContent = status;
    card.classList.toggle("integration-error", isError);
    card.querySelector(".integration-loading").hidden = true;
    const content = card.querySelector(".integration-content");
    content.hidden = false;
    content.innerHTML = html;
  };
  const integrationError = (card, message) => setIntegration(card, "SETUP REQUIRED", `
    <div class="integration-empty"><span>↻</span><h2>${t({id:"Sinyal belum tersedia",en:"Signal unavailable"})}</h2><p>${t({id:"Statistik akan muncul saat koneksi layanan tersedia.",en:"Statistics will appear when the service is connected."})}</p><a class="text-button" href="stats.html">${t({id:"Coba lagi",en:"Try again"})}</a></div>`, true);

  const fetchSignal = async (endpoint) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(endpoint, { signal: controller.signal, headers: { Accept: "application/json" } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Signal unavailable");
      return payload;
    } finally {
      clearTimeout(timeout);
    }
  };

  const loadDiscord = async () => {
    const card = document.getElementById("discordCard");
    if (!card) return;
    try {
      const payload = await fetchSignal(data.integrations.discordEndpoint);
      const activity = payload.activities?.[0];
      setIntegration(card, payload.status?.toUpperCase() || "OFFLINE", `
        <div class="discord-profile">
          <div class="live-avatar"><img src="${escapeHTML(payload.avatar)}" alt=""><i class="${escapeHTML(payload.status)}"></i></div>
          <div><small>DISCORD USER</small><h2>${escapeHTML(payload.displayName || payload.username)}</h2><p>@${escapeHTML(payload.username)}</p></div>
        </div>
        <div class="discord-activity"><span>CURRENT ACTIVITY</span><strong>${escapeHTML(activity?.name || "No public activity")}</strong><p>${escapeHTML(activity?.details || activity?.state || "Presence is connected.")}</p></div>
        <div class="signal-foot"><span>STATUS <b>${escapeHTML(payload.status)}</b></span><span>SOURCE <b>LANYARD</b></span></div>`);
    } catch (error) { integrationError(card, error.message); }
  };

  const loadSteam = async () => {
    const card = document.getElementById("steamCard");
    if (!card) return;
    try {
      const payload = await fetchSignal(data.integrations.steamEndpoint);
      setIntegration(card, "LIVE", `
        <div class="steam-profile">
          <img src="${escapeHTML(payload.profile.avatar)}" alt=""><div><small>STEAM PROFILE</small><h2>${escapeHTML(payload.profile.name)}</h2><a href="${escapeHTML(payload.profile.url)}" target="_blank" rel="noreferrer">OPEN PROFILE ↗</a></div>
        </div>
        <div class="live-stat-row"><span>LEVEL <b>${escapeHTML(payload.level)}</b></span><span>GAMES <b>${escapeHTML(payload.gameCount)}</b></span><span>HOURS <b>${escapeHTML(payload.totalHours)}</b></span></div>
        <div class="recent-game"><span>MOST PLAYED</span><strong>${escapeHTML(payload.topGame?.name || "No public game data")}</strong><p>${escapeHTML(payload.topGame?.hours || "0")} hours recorded</p></div>`);
    } catch (error) { integrationError(card, error.message); }
  };

const loadWakaTime = async () => {
  const card = document.getElementById("wakaCard");
  if (!card) return;

  const percent = (value) =>
    Math.max(0, Math.min(100, Number(value) || 0));

  const renderTable = (title, items) => {
    const list = Array.isArray(items) ? items : [];

    return `
      <section class="waka-breakdown">
        <h3>${escapeHTML(title)}</h3>

        ${
          list.length
            ? `
              <table class="waka-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Time</th>
                    <th scope="col">%</th>
                  </tr>
                </thead>

                <tbody>
                  ${list.map((item) => `
                    <tr>
                      <td>${escapeHTML(item.name)}</td>
                      <td>${escapeHTML(item.text || item.time || "—")}</td>
                      <td>${percent(item.percent).toFixed(1)}%</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `
            : `<p class="waka-empty">No data available.</p>`
        }
      </section>
    `;
  };

  try {
    const payload = await fetchSignal(
      data.integrations.wakaTimeEndpoint
    );

    const languages = Array.isArray(payload.languages)
      ? payload.languages
      : [];

    setIntegration(
      card,
      payload.updating ? "UPDATING" : "ALL TIME",
      `
        <div class="coding-time">
          <strong>${escapeHTML(payload.total)}</strong>
          <span>TOTAL<br>CODING</span>
        </div>

        <div class="language-bars">
          ${languages.slice(0, 5).map((item) => `
            <div>
              <span>${escapeHTML(item.name)}</span>
              <i>
                <b style="width:${percent(item.percent)}%"></b>
              </i>
              <em>${percent(item.percent).toFixed(1)}%</em>
            </div>
          `).join("")}
        </div>

        <div class="signal-foot">
          <span>
            CODING SINCE
            <b>${escapeHTML(payload.since || "—")}</b>
          </span>

          <span>
            BEST DAY
            <b>${escapeHTML(payload.bestDay || "—")}</b>
          </span>
        </div>

        <details class="waka-more">
          <summary>
            <span class="waka-more-label">Show More</span>
            <span class="waka-less-label">Show Less</span>
          </summary>

          <div class="waka-expanded">
            <div class="waka-metrics">
              <div>
                <small>DAILY AVERAGE</small>
                <strong>${escapeHTML(payload.dailyAverage || "—")}</strong>
              </div>

              <div>
                <small>BEST DAY DURATION</small>
                <strong>${escapeHTML(payload.bestDayTime || "—")}</strong>
              </div>
            </div>

            <div class="waka-breakdowns">
              ${renderTable("LANGUAGES", payload.languages)}
              ${renderTable("EDITORS", payload.editors)}
              ${renderTable("OPERATING SYSTEMS", payload.operatingSystems)}
              ${renderTable("ACTIVITIES", payload.categories)}
            </div>
          </div>
        </details>

        ${
          payload.updating
            ? `<p class="waka-empty" role="status">
                 ${t({
                   id: "Statistik All Time sedang diperbarui. Muat ulang sebentar lagi.",
                   en: "All Time statistics are updating. Refresh again shortly."
                 })}
               </p>`
            : ""
        }
      `
    );
  } catch (error) {
    integrationError(card, error.message);
  }
};
  if (pageId === "stats") Promise.allSettled([loadDiscord(), loadSteam(), loadWakaTime()]);

  const audio = document.getElementById("audioPlayer");
  const player = document.getElementById("musicPlayer");
  // Halaman Gendut <3 memakai satu lagu tetap. State musik biasa (lagu, posisi, play/pause) tidak
  // disentuh di sini, jadi begitu pengunjung keluar, musik biasa kembali seperti sebelum masuk.
  const fixedTrack = pageId === "gendut" ? data.love.song : null;
  const playlist = fixedTrack ? [fixedTrack] : data.music;
  const musicStore = fixedTrack ? { getItem: () => null, setItem() {} } : sessionStorage;
  player.classList.toggle("fixed-track", Boolean(fixedTrack));
  const musicState = {
    track: Number(musicStore.getItem("aziz-track") || 0),
    time: Number(musicStore.getItem("aziz-time") || 0),
    volume: Number(localStorage.getItem("aziz-volume") || .55),
    playing: musicStore.getItem("aziz-playing") === "true"
  };
  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "0:00";
    return `${Math.floor(seconds / 60)}:${two(Math.floor(seconds % 60))}`;
  };
  const updateTrack = (autoplay = false) => {
    if (!playlist.length) { document.getElementById('trackTitle').textContent='Belum ada musik'; return; }
    musicState.track = Math.max(0, Math.min(playlist.length-1, Number.isFinite(musicState.track)?musicState.track:0));
    const track = playlist[musicState.track];
    const cover = document.getElementById("discCover");
    cover.hidden = true;
    cover.onload = () => {
      cover.hidden = false;
    };
    cover.onerror = () => {
      cover.hidden = true;
    };
    if (track.cover) {
      cover.src = track.cover;
    } else {
      cover.removeAttribute("src");
    }
    audio.src = track.src;
    audio.volume = Math.min(1, Math.max(0, Number.isFinite(musicState.volume)?musicState.volume:.55));
    document.getElementById("trackNumber").textContent = two(musicState.track + 1);
    document.getElementById("trackTitle").textContent = track.title;
    document.getElementById("trackArtist").textContent = track.artist;
    document.getElementById("musicVolume").value = musicState.volume;
    audio.addEventListener("loadedmetadata", () => {
      if (musicState.time && musicState.time < audio.duration) audio.currentTime = musicState.time;
      document.getElementById("duration").textContent = formatTime(audio.duration);
      if (autoplay || musicState.playing) audio.play().catch(() => {
        musicState.playing = false;
        updatePlayState();
      });
    }, { once: true });
  };
  const updatePlayState = () => {
    player.classList.toggle("playing", !audio.paused);
    musicState.playing = !audio.paused;
    document.getElementById("playPause").textContent = audio.paused ? "▶" : "Ⅱ";
    document.getElementById("playPause").setAttribute("aria-label", audio.paused ? "Play" : "Pause");
    musicStore.setItem("aziz-playing", String(musicState.playing));
  };
  const changeTrack = (direction) => {
    if (!playlist.length) return;
    musicState.track = (musicState.track + direction + playlist.length) % playlist.length;
    musicState.time = 0;
    musicStore.setItem("aziz-track", String(musicState.track));
    musicStore.setItem("aziz-time", "0");
    updateTrack(true);
  };
  const musicExpandButton = document.getElementById("musicExpand");

const setMusicPlayerExpanded = (expanded) => {
  player.classList.toggle("expanded", expanded);
  document.getElementById('musicPanel').inert = !expanded;
  document.getElementById('musicPanel').setAttribute('aria-hidden',String(!expanded));

  musicExpandButton.setAttribute(
    "aria-expanded",
    String(expanded)
  );

  musicExpandButton.setAttribute(
    "aria-label",
    expanded ? "Close music player" : "Open music player"
  );

  musicExpandButton.title = expanded
    ? "Close music player"
    : "Open music player";

  localStorage.setItem(
    "aziz-music-expanded",
    String(expanded)
  );
};

musicExpandButton.addEventListener("click", () => {
  const willOpen = !player.classList.contains("expanded");
  setMusicPlayerExpanded(willOpen);
});

/* Kondisi awal tertutup, tetapi mengingat pilihan pengunjung */
setMusicPlayerExpanded(false);
  document.getElementById("playPause").addEventListener("click", () => audio.paused ? audio.play().catch(()=>{document.getElementById('trackArtist').textContent=t({id:'File musik belum tersedia.',en:'Music file unavailable.'});}) : audio.pause());
  audio.addEventListener('error',()=>{document.getElementById('trackArtist').textContent=t({id:'File musik belum tersedia.',en:'Music file unavailable.'});musicState.playing=false;});
  document.getElementById("previousTrack").addEventListener("click", () => changeTrack(-1));
  document.getElementById("nextTrack").addEventListener("click", () => changeTrack(1));
  document.getElementById("musicVolume").addEventListener("input", (event) => {
    musicState.volume = Number(event.target.value);
    audio.volume = Math.min(1, Math.max(0, Number.isFinite(musicState.volume)?musicState.volume:.55));
    localStorage.setItem("aziz-volume", String(musicState.volume));
  });
  document.getElementById("musicSeek").addEventListener("input", (event) => {
    if (Number.isFinite(audio.duration)) audio.currentTime = Number(event.target.value) / 100 * audio.duration;
  });
  audio.addEventListener("play", updatePlayState);
  audio.addEventListener("pause", updatePlayState);
  audio.addEventListener("ended", () => changeTrack(1));
  audio.addEventListener("timeupdate", () => {
    musicState.time = audio.currentTime;
    musicStore.setItem("aziz-time", String(audio.currentTime));
    document.getElementById("currentTime").textContent = formatTime(audio.currentTime);
    if (Number.isFinite(audio.duration)) document.getElementById("musicSeek").value = String(audio.currentTime / audio.duration * 100);
  });
  window.PORTFOLIO_UI = {t, escapeHTML, icon, setIntegration, integrationError, fetchSignal, openDialog, pixelHeart};
  updateTrack(false);
  updatePlayState();
})();