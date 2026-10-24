import { CONTACT_EMAIL, PDF_JS_URL, supportLinks } from './src/config/siteConfig.js';
import { languages, languageByCode } from './src/config/languages.js';
import { ui } from './src/i18n/en.js';
import { branding } from './src/config/branding.js';

const PLACEHOLDER_PAGES = 8;
const LANGUAGE_KEY = 'densetsu.reader.language';
const state = { languageCode: 'en', mode: 'scroll', zoom: 1, controls: true, pageCount: PLACEHOLDER_PAGES, page: 1, pdfAvailable: false };
const DEV_MODE = window.__DENSETSU_DEV__ === true;
const MOBILE_DEBUG = DEV_MODE && new URLSearchParams(location.search).get('debugMobile') === '1';
let readerSession = null;
const langKey = suffix => `densetsu.reader.${state.languageCode}.${suffix}`;
const save = (key, value) => localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
const read = (key, fallback = null) => { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return localStorage.getItem(key) ?? fallback; } };
const currentLanguage = () => languageByCode[state.languageCode];
const currentIndex = () => currentLanguage()?.chapterIndex || [];
const chapterAtPage = page => [...currentIndex()].reverse().find(chapter => chapter.page <= page) || null;
const loadLanguageProgress = () => { const language = currentLanguage(); state.page = Math.max(1, Number(read(langKey('page'), 1)) || 1); state.mode = read(langKey('mode'), 'scroll') === 'page' ? 'page' : 'scroll'; state.zoom = Number(read(langKey('zoom'), 1)) || 1; state.pageCount = PLACEHOLDER_PAGES; state.pdfAvailable = false; document.documentElement.dir = language?.textDirection || 'ltr'; };
const persistProgress = () => { save(langKey('page'), state.page); save(langKey('chapter'), chapterAtPage(state.page)?.chapterNumber || null); save(langKey('mode'), state.mode); save(langKey('zoom'), state.zoom); };
loadLanguageProgress();
state.zoom = Math.min(1.3, Math.max(1, state.zoom));

const icon = (name, label, route, extra = '') => `<a class="symbol ${name} ${extra}" href="#${route}" ${route === 'read' ? 'data-action="enter-reader"' : ''} aria-label="${label}"><img src="${branding.navigation[name === 'katana-left' ? 'rightKatana' : name === 'katana-right' ? 'leftKatana' : name]}" alt="" /></a>`;
const brandImage = (path, className, alt) => path ? `<img class="${className}" src="${path}" alt="${alt}" />` : '';
const home = () => `<div class="shell"><header class="topbar"><a class="wordmark" href="#home">DNSNS</a><button class="menu-btn" data-action="menu" aria-label="Open menu"><span></span></button></header><main class="home" id="home"><div class="home-inner">${brandImage(branding.text.title, 'cover-title', 'Densetsu no Shinobi no Sho')}${brandImage(branding.text.subtitle, 'cover-subtitle', 'Legend of the Shinobi Scrolls')}<div class="symbol-map">${icon('katana-left', 'Contact', 'contact', 'katana')} ${icon('shuriken', 'About the novel', 'about')} ${icon('crow', 'Read the novel', 'read')} ${icon('fire', 'Reviews', 'reviews')} ${icon('katana-right', 'Support the story', 'support', 'katana')}</div>${brandImage(branding.text.authorLine, 'cover-author', 'A Story by Darius Cîmpan')}<p class="hint">Choose a symbol to enter.</p></div></main></div>`;
const pageFrame = (eyebrow, title, body) => `<div class="shell"><header class="topbar"><a class="wordmark" href="#home">DNSNS</a><button class="menu-btn" data-action="menu" aria-label="Open menu"><span></span></button></header><main class="view"><div class="view-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1></div><a class="back" href="#home">Return to cover</a></div>${body}</main></div>`;
const pageMark = (asset, alt) => asset ? `<img class="page-mark-image" src="${asset}" alt="${alt}" />` : '';
const mobileDebugMarkup = () => MOBILE_DEBUG ? `<aside class="mobile-debug" data-mobile-debug aria-live="polite"></aside><div class="touch-debug" data-touch-debug aria-hidden="true"><i class="touch-zone left-page-zone">left page tap</i><i class="touch-zone right-page-zone">right page tap</i><i class="touch-zone overlay-zone">overlay toggle</i><i class="touch-zone bookmark-zone">bookmark</i><i class="touch-zone chapter-zone">chapter</i><i class="touch-zone language-zone">language</i></div>` : '';
function safeAreaInsets() { const probe = document.createElement('div'); probe.style.cssText = 'position:fixed;inset:0;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);pointer-events:none;visibility:hidden'; document.body.appendChild(probe); const style = getComputedStyle(probe); const values = [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft]; probe.remove(); return values.join(' / '); }
function updateMobileDebug() { if (!MOBILE_DEBUG) return; const panel = document.querySelector('[data-mobile-debug]'); if (!panel) return; const chapter = chapterAtPage(state.page); const orientation = screen.orientation?.type || (innerWidth >= innerHeight ? 'landscape' : 'portrait'); panel.textContent = [`viewport ${innerWidth} × ${innerHeight}`, `dpr ${window.devicePixelRatio || 1}`, `orientation ${orientation}`, `reader ${state.mode}`, `page ${state.page}/${state.pageCount}`, `chapter ${chapter?.chapterNumber || '—'}`, `language ${currentLanguage()?.nativeLabel || state.languageCode}`, `overlay ${state.controls ? 'visible' : 'hidden'}`, `zoom ${state.zoom}`, `safe-area ${safeAreaInsets()}`].join(' · '); }
const contentImage = (asset, alt) => asset ? `<img class="content-art" src="${asset}" alt="${alt}" />` : '';
const readerChoice = () => `<div class="choice-screen"><div class="choice-inner"><div class="choice-symbols"><a class="choice-symbol choice-bokken" href="#read" data-reader-choice="beginning" aria-label="Start from the beginning"><img src="${branding.navigation.bokken}" alt="" /><span>Start from beginning</span></a><a class="choice-symbol choice-senbon" href="#read" data-reader-choice="continue" aria-label="Continue reading"><img src="${branding.navigation.senbon}" alt="" /><span>Continue</span></a></div></div></div>`;
const about = () => pageFrame('The story', 'ABOUT THE NOVEL', `<div class="about-copy"><p><strong>A village burns. A boy survives.</strong><br />Years later, Ren has become something few men can stand against.<br />Raised in the mountains by an old swordsman, he has learned discipline, stillness, and the brutal cost of hesitation. But when a hidden conflict between Iga, Kōga, and the Tokugawa begins to close around him, Ren is drawn into the world of shinobi—and toward three legendary scrolls.<br />What begins as a mission becomes something more dangerous.<br />Loyalty turns against duty.<br />Brotherhood bends under consequence.<br />And the further Ren goes, the more the line between purpose and destruction begins to disappear.<br /><strong>Densetsu no Shinobi no Sho</strong> is a grounded historical drama of shinobi, swordsmen, loyalty, obsession, and the choices that remain when hesitation is gone.</p><h2>About the Author</h2><p>Darius Cîmpan is an artist and storyteller whose work is shaped by a lifelong interest in martial arts, mythology, and history. <em>Densetsu no Shinobi no Sho</em>, his first novel, sits at the intersection of all three.</p><h2>Historical Fiction Disclaimer</h2><p><em>Densetsu no Shinobi no Sho</em> is a work of fiction. While the story draws inspiration from historical Japan and includes references to real people, places, groups, traditions, and events, the characters, relationships, chronology, actions, and circumstances depicted in the novel have been fictionalized for narrative purposes.<br />The novel is not intended to serve as a historically accurate account of the period, and any resemblance between fictional events or characters and actual historical events or persons should not be interpreted as factual representation.</p><h2>AI Assistance Disclosure</h2><p><em>Densetsu no Shinobi no Sho</em> was conceived and created by Darius Cîmpan. The story, characters, world, plot, scenes, relationships, themes, and creative decisions are entirely his own. Artificial intelligence was used as a writing and editing tool to assist with prose refinement, tightening, and cleanup during development of the manuscript.</p></div>`);
const reviewPage = () => pageFrame('Reader voices', 'REVIEWS', `${pageMark(branding.navigation.fire, 'Fire')}<div class="review-grid"><p class="no-reviews">No reviews yet.</p></div>`);
const contact = () => pageFrame('A direct line', 'CONTACT', `${pageMark(branding.navigation.leftKatana, 'Left katana')}<form class="contact-form" data-contact-form><div class="field"><label for="name">Name</label><input id="name" name="name" required /></div><div class="field"><label for="email">Email</label><input id="email" name="email" type="email" required /></div><div class="field"><label for="subject">Subject</label><input id="subject" name="subject" required /></div><div class="field"><label for="message">Message</label><textarea id="message" name="message" required></textarea></div><button class="submit" type="submit">Prepare message</button><div class="form-status" data-form-status>Messages open in your email app.</div></form>`);
const support = () => pageFrame('Keep the story moving', 'SUPPORT THE STORY', `<div class="support-grid support-layout"><div class="prose support-copy"><p><strong>Densetsu no Shinobi no Sho is free to read.</strong></p><p>If the story meant something to you and you want to support future work, you can do so here. Contributions help cover publishing costs, website hosting, artwork, and the continued development of future stories.</p><p>Support is always optional. Reading the story is enough.</p></div><div class="support-links">${supportLinks.map(([name, url]) => url ? `<a class="support-link" href="${url}" target="_blank" rel="noreferrer">${name}<small>Open</small></a>` : `<div class="support-link disabled" aria-disabled="true">${name}<small>Not configured</small></div>`).join('')}</div></div>`);
const menu = () => `<div class="menu-overlay" role="dialog" aria-label="Site menu"><div class="menu-card"><button class="menu-close" data-action="close-menu">Close</button><a href="#about">Shuriken — About</a><a href="#read">Crow — Read</a><a href="#reviews">Fire — Reviews</a><a href="#contact">Left Katana — Contact</a><a href="#support">Right Katana — Support</a></div></div>`;

function reader() {
  const language = currentLanguage(); const index = currentIndex(); const bookmark = read(langKey('bookmark'));
  const options = index.length ? index.map(chapter => `<option value="${chapter.page}" ${chapterAtPage(state.page)?.chapterNumber === chapter.chapterNumber ? 'selected' : ''}>${chapter.actTitle || '[Placeholder]'} · Chapter ${chapter.chapterNumber} — ${chapter.title || '[Placeholder]'}</option>`).join('') : '<option>No chapter index available</option>';
  const bookmarkControl = branding.navigation.senbon ? `<img class="senbon-icon" src="${branding.navigation.senbon}" alt="" />` : ui.bookmark;
  return `<div class="reader ${state.mode === 'page' ? 'page-mode' : ''}" data-reader dir="${language?.pageDirection || 'ltr'}"><div class="progress" style="width:${state.page / state.pageCount * 100}%"></div><header class="reader-controls top"><a class="reader-btn" href="#home">${ui.home}</a><div class="center" data-current-title>${language.nativeLabel} · Page ${state.page}</div><button class="reader-btn ${bookmark ? 'bookmark-mark' : ''}" data-action="bookmark" aria-label="${ui.bookmark} current page">${bookmarkControl}</button></header><main class="reader-shell"><div class="reader-mark"><img src="${branding.navigation.crow}" alt="" /></div><div class="page-stack" data-page-stack></div><div class="edition-status" data-edition-status hidden>${ui.unavailable}</div></main><footer class="reader-controls bottom"><button class="reader-btn" data-action="prev">Previous</button><select class="select chapter-select" data-chapter-select aria-label="Select chapter" ${index.length ? '' : 'disabled'}>${options}</select><label class="language-control"><span>${ui.language}</span><select class="select" data-language-select aria-label="${ui.language}"><option value="en" selected>English</option><option value="coming-soon" disabled>Coming soon</option></select></label><button class="reader-btn" data-action="toggle-mode">${state.mode === 'page' ? 'Scroll mode' : 'Page mode'}</button><button class="reader-btn" data-action="next">Next</button><div class="reader-settings"><label class="sr-only" for="zoom">Zoom</label><select class="select" id="zoom" data-zoom><option value="1">100%</option><option value="1.15">115%</option><option value="1.3">130%</option></select></div></footer>${mobileDebugMarkup()}</div>`;
}
function placeholderPage(n) { return `<article class="page ${n === state.page ? 'active' : ''}" data-page="${n}"><div class="page-inner"><div class="page-kicker">Densetsu No Shinobi No Sho · Development placeholder</div><h2>${n === 1 ? 'A story waiting to be opened' : `Page ${n}`}</h2><p>${n === 1 ? 'The selected finished PDF edition will become the authoritative reader source here.' : 'This language edition is represented by a placeholder until its finished PDF is supplied.'}</p></div></article>`; }

function render() { readerSession?.cleanup(); readerSession = null; const hash = location.hash.slice(1) || 'home'; const app = document.querySelector('#app'); if (hash === 'read') app.innerHTML = reader(); else if (hash === 'choose') app.innerHTML = readerChoice(); else if (hash === 'about') app.innerHTML = about(); else if (hash === 'reviews') app.innerHTML = reviewPage(); else if (hash === 'contact') app.innerHTML = contact(); else if (hash === 'support') app.innerHTML = support(); else app.innerHTML = home(); if (hash === 'read') setupReader(); if (document.querySelector('[data-action="menu"]')) document.querySelector('[data-action="menu"]').addEventListener('click', () => document.body.insertAdjacentHTML('beforeend', menu())); }

function switchLanguage(code) { const target = languageByCode[code]; if (!target || code === state.languageCode) return; const currentChapter = chapterAtPage(state.page)?.chapterNumber || Number(read(langKey('chapter'), 1)) || 1; persistProgress(); state.languageCode = code; save(LANGUAGE_KEY, code); loadLanguageProgress(); const mapped = target.chapterIndex?.find(chapter => chapter.chapterNumber === currentChapter); state.page = mapped?.page || target.chapterIndex?.[0]?.page || 1; save(langKey('page'), state.page); location.hash = 'read'; render(); }

async function setupReader() {
  const session = { observer: null, pdf: null, disposed: false, cleanup() { this.disposed = true; this.observer?.disconnect(); this.pdf?.destroy?.(); } }; readerSession = session; const stack = document.querySelector('[data-page-stack]'); stack.innerHTML = Array.from({ length: state.pageCount }, (_, i) => placeholderPage(i + 1)).join(''); const zoom = document.querySelector('[data-zoom]'); if (zoom) zoom.value = String(state.zoom);
  const update = () => { persistProgress(); const progress = document.querySelector('.progress'); if (progress) progress.style.width = `${state.page / state.pageCount * 100}%`; const title = document.querySelector('[data-current-title]'); if (title) title.textContent = `${currentLanguage().nativeLabel} · Page ${state.page}`; const chapterSelect = document.querySelector('[data-chapter-select]'); if (chapterSelect) chapterSelect.value = String(chapterAtPage(state.page)?.page || state.page); document.querySelectorAll('.page').forEach(page => page.classList.toggle('active', Number(page.dataset.page) === state.page)); };
  update(); document.querySelector('[data-action="prev"]').onclick = () => { state.page = Math.max(1, state.page - 1); update(); }; document.querySelector('[data-action="next"]').onclick = () => { state.page = Math.min(state.pageCount, state.page + 1); update(); }; document.querySelector('[data-action="toggle-mode"]').onclick = () => { state.mode = state.mode === 'page' ? 'scroll' : 'page'; persistProgress(); render(); }; document.querySelector('[data-chapter-select]').onchange = event => { state.page = Number(event.target.value); update(); document.querySelector('.page.active')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }; document.querySelector('[data-language-select]').onchange = event => switchLanguage(event.target.value); document.querySelector('[data-action="bookmark"]').onclick = () => { save(langKey('bookmark'), { language: state.languageCode, chapterNumber: chapterAtPage(state.page)?.chapterNumber || null, page: state.page, mode: state.mode, scroll: scrollY, timestamp: new Date().toISOString() }); render(); }; document.querySelector('[data-zoom]').onchange = event => { state.zoom = Number(event.target.value); save(langKey('zoom'), state.zoom); stack.style.transform = `scale(${state.zoom})`; stack.style.transformOrigin = 'top center'; };
  const keyHandler = event => { if (location.hash.slice(1) !== 'read') return; if (event.key === 'ArrowRight') { state.page = Math.min(state.pageCount, state.page + 1); update(); } if (event.key === 'ArrowLeft') { state.page = Math.max(1, state.page - 1); update(); } }; document.addEventListener('keydown', keyHandler); const readerEl = document.querySelector('[data-reader]'); let timer; readerEl.addEventListener('click', event => { if (event.target.closest('button,a,select')) return; state.controls = !state.controls; readerEl.classList.toggle('controls-hidden', !state.controls); clearTimeout(timer); timer = setTimeout(() => { state.controls = false; readerEl.classList.add('controls-hidden'); }, 4500); }); const oldCleanup = session.cleanup.bind(session); session.cleanup = () => { oldCleanup(); document.removeEventListener('keydown', keyHandler); clearTimeout(timer); }; await hydrateFromPdfEnhanced(stack, update, session);
}

async function hydrateFromPdf(stack, update, session) { const language = currentLanguage(); try { const response = await fetch(language.pdfPath, { method: 'HEAD' }); if (!response.ok) throw new Error('missing PDF'); const pdfjs = await import(PDF_JS_URL); if (session.disposed) return; pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs'; const pdf = await pdfjs.getDocument(language.pdfPath).promise; if (session.disposed) return; state.pdfAvailable = true; state.pageCount = pdf.numPages; stack.innerHTML = Array.from({ length: state.pageCount }, (_, i) => `<article class="page ${i + 1 === state.page ? 'active' : ''}" data-page="${i + 1}"><canvas aria-label="PDF page ${i + 1}"></canvas></article>`).join(''); const renderPage = async element => { if (element.dataset.rendered || session.disposed) return; const page = await pdf.getPage(Number(element.dataset.page)); if (session.disposed) return; const viewport = page.getViewport({ scale: Math.min(2.2, Math.max(1, window.devicePixelRatio || 1)) }); const canvas = element.querySelector('canvas'); canvas.width = viewport.width; canvas.height = viewport.height; canvas.style.width = '100%'; canvas.style.height = 'auto'; await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise; element.dataset.rendered = 'true'; }; session.observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) renderPage(entry.target); }), { rootMargin: '500px' }); document.querySelectorAll('[data-page]').forEach(element => session.observer.observe(element)); update(); } catch (error) { const status = document.querySelector('[data-edition-status]'); if (status) { status.hidden = false; status.textContent = `${language.nativeLabel}: ${ui.unavailable}`; } console.info('Selected PDF not present yet; using placeholder reader.', error.message); } }

window.addEventListener('hashchange', render); document.addEventListener('click', event => { if (event.target.matches('[data-action="close-menu"]') || event.target.closest('.menu-overlay a')) document.querySelector('.menu-overlay')?.remove(); const enterReader = event.target.closest('[data-action="enter-reader"]'); if (!enterReader || document.body.classList.contains('crow-transitioning')) return; event.preventDefault(); document.body.classList.add('crow-transitioning'); setTimeout(() => document.body.classList.add('crow-fading'), 1680); setTimeout(() => { document.body.classList.add('reader-from-crow'); location.hash = 'read'; requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('reader-visible'))); setTimeout(() => document.body.classList.remove('crow-transitioning', 'crow-fading', 'reader-from-crow', 'reader-visible'), 2880); }, 3280); }); document.addEventListener('submit', event => { if (event.target.matches('[data-contact-form]')) { event.preventDefault(); const form = event.target; const values = new FormData(form); const subject = String(values.get('subject') || 'Website contact'); const body = [`Name: ${values.get('name') || ''}`, `Email: ${values.get('email') || ''}`, '', String(values.get('message') || '')].join('\n'); form.querySelector('[data-form-status]').textContent = 'Opening your email app…'; window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; } }); render();
let touchStart = null;
document.addEventListener('touchstart', event => { if (!document.querySelector('[data-reader]') || event.touches.length !== 1) return; const touch = event.touches[0]; touchStart = { x: touch.clientX, y: touch.clientY, time: Date.now() }; }, { passive: true });
document.addEventListener('touchend', event => { if (!touchStart || !document.querySelector('[data-reader]') || event.changedTouches.length !== 1) return; const touch = event.changedTouches[0]; const dx = touch.clientX - touchStart.x; const dy = touch.clientY - touchStart.y; const elapsed = Date.now() - touchStart.time; touchStart = null; if (elapsed < 700 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) { document.querySelector(dx < 0 ? '[data-action="next"]' : '[data-action="prev"]')?.click(); } }, { passive: true });
document.addEventListener('click', updateMobileDebug);
document.addEventListener('change', updateMobileDebug);
let autosaveFrame = 0;
window.addEventListener('scroll', () => {
  if (autosaveFrame || !document.querySelector('[data-reader]')) return;
  autosaveFrame = requestAnimationFrame(() => {
    autosaveFrame = 0;
    const pages = [...document.querySelectorAll('[data-page]')];
    if (!pages.length) return;
    const midpoint = window.innerHeight / 2;
    const reached = pages
      .map(page => ({ page, rect: page.getBoundingClientRect() }))
      .filter(({ rect }) => rect.bottom > 0 && rect.top < window.innerHeight)
      .sort((a, b) => Math.abs((a.rect.top + a.rect.height / 2) - midpoint) - Math.abs((b.rect.top + b.rect.height / 2) - midpoint))[0]?.page;
    const pageNumber = Number(reached?.dataset.page);
    if (!pageNumber || pageNumber === state.page) return;
    state.page = pageNumber;
    persistProgress();
    const progress = document.querySelector('.progress');
    if (progress) progress.style.width = `${state.page / state.pageCount * 100}%`;
    const title = document.querySelector('[data-current-title]');
    if (title) title.textContent = `${currentLanguage().nativeLabel} · Page ${state.page}`;
    const chapterSelect = document.querySelector('[data-chapter-select]');
    if (chapterSelect) chapterSelect.value = String(chapterAtPage(state.page)?.page || state.page);
    updateMobileDebug();
  });
}, { passive: true });
window.addEventListener('resize', updateMobileDebug, { passive: true });
document.addEventListener('change', event => {
  if (!event.target.matches('[data-zoom]')) return;
  requestAnimationFrame(() => document.querySelector('.page.active')?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }));
});
window.addEventListener('orientationchange', () => setTimeout(updateMobileDebug, 100), { passive: true });
window.addEventListener('hashchange', () => setTimeout(updateMobileDebug, 50));
setTimeout(updateMobileDebug, 0);
function ensurePdfAdjustments() {
  const topbar = document.querySelector('[data-reader] .reader-controls.top');
  if (!topbar || topbar.querySelector('[data-pdf-adjustments]')) return;
  topbar.insertAdjacentHTML('beforeend', `<div class="pdf-adjustments" data-pdf-adjustments><button class="reader-btn pdf-adjustments-toggle" type="button" aria-expanded="false" aria-controls="pdf-adjustments-panel">Display</button><div class="pdf-adjustments-panel" id="pdf-adjustments-panel" hidden><label for="pdf-temperature">Cool–Warm</label><input id="pdf-temperature" data-pdf-temperature type="range" min="-100" max="100" value="0" step="1" /><div class="pdf-adjustments-scale"><span>Cool</span><span>Warm</span></div><label for="pdf-brightness">Dark–Bright</label><input id="pdf-brightness" data-pdf-brightness type="range" min="-100" max="100" value="0" step="1" /><div class="pdf-adjustments-scale"><span>Dark</span><span>Bright</span></div></div></div>`);
  const readerEl = document.querySelector('[data-reader]');
  const panel = topbar.querySelector('[data-pdf-adjustments]');
  panel.querySelector('.pdf-adjustments-panel').insertAdjacentHTML('afterbegin', '<button class="pdf-invert-toggle" data-pdf-invert type="button" aria-pressed="false">Invert PDF</button>');
  const toggle = panel.querySelector('.pdf-adjustments-toggle');
  const invert = panel.querySelector('[data-pdf-invert]');
  const apply = () => {
    const temperature = Number(panel.querySelector('[data-pdf-temperature]').value);
    const brightness = Number(panel.querySelector('[data-pdf-brightness]').value);
    const inverted = invert.getAttribute('aria-pressed') === 'true';
    readerEl.style.setProperty('--paper-tint-color', temperature < 0 ? '#cbdcf3' : '#f1d8af');
    readerEl.style.setProperty('--paper-tint-opacity', String(Math.abs(temperature) / 100 * 0.62));
    readerEl.style.setProperty('--pdf-brightness', String(1 + brightness / 100 * 0.55));
    readerEl.classList.toggle('pdf-inverted', inverted);
  };
  toggle.addEventListener('click', () => { const open = panel.querySelector('.pdf-adjustments-panel'); open.hidden = !open.hidden; toggle.setAttribute('aria-expanded', String(!open.hidden)); });
  invert.addEventListener('click', () => { const active = invert.getAttribute('aria-pressed') === 'true'; invert.setAttribute('aria-pressed', String(!active)); invert.textContent = active ? 'Invert PDF' : 'Normal PDF'; apply(); });
  panel.querySelectorAll('input').forEach(input => input.addEventListener('input', apply));
  apply();
}
function ensureZoomOptions() {
  const zoom = document.querySelector('[data-zoom]');
  if (!zoom) return;
  state.zoom = Math.min(1.3, Math.max(1, state.zoom));
  zoom.value = String(state.zoom);
}
function showCompletion() {
  if (document.querySelector('[data-completion-screen]')) return;
  const screen = document.createElement('div');
  screen.className = 'completion-screen';
  screen.dataset.completionScreen = '';
  screen.innerHTML = '<p>Thank you for reading<br />Densetsu no Shinobi no Sho.</p>';
  document.body.appendChild(screen);
  requestAnimationFrame(() => {
    document.body.classList.add('completion-active');
    setTimeout(() => screen.classList.add('message-visible'), 1400);
  });
}
function ensureReaderCompletionButton() {
  const readerEl = document.querySelector('[data-reader]');
  if (!readerEl || readerEl.querySelector('[data-complete]')) return;
  readerEl.insertAdjacentHTML('beforeend', '<button class="complete-reader" data-complete type="button" hidden>Complete</button>');
  const button = readerEl.querySelector('[data-complete]');
  const update = () => {
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 32;
    button.hidden = !(atBottom && state.page >= state.pageCount);
  };
  button.addEventListener('click', showCompletion);
  window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}
window.addEventListener('hashchange', () => setTimeout(ensurePdfAdjustments, 0));
window.addEventListener('hashchange', () => setTimeout(ensureZoomOptions, 0));
window.addEventListener('hashchange', () => setTimeout(ensureReaderCompletionButton, 0));
ensurePdfAdjustments();
ensureZoomOptions();
ensureReaderCompletionButton();
// Use a display-width-aware PDF raster scale so the canvas is not stretched from a low-resolution render.
async function hydrateFromPdfEnhanced(stack, update, session) {
  const language = currentLanguage();
  try {
    const response = await fetch(language.pdfPath, { method: 'HEAD' });
    if (!response.ok) throw new Error('missing PDF');
    const pdfjs = await import(PDF_JS_URL);
    if (session.disposed) return;
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
    const pdf = await pdfjs.getDocument(language.pdfPath).promise;
    if (session.disposed) return;
    state.pdfAvailable = true;
    state.pageCount = pdf.numPages;
    stack.innerHTML = Array.from({ length: state.pageCount }, (_, i) => `<article class="page ${i + 1 === state.page ? 'active' : ''}" data-page="${i + 1}"><canvas aria-label="PDF page ${i + 1}"></canvas></article>`).join('');
    stack.dataset.pdfReady = 'true';
    const renderPage = async element => {
      if (element.dataset.rendered || session.disposed) return;
      const page = await pdf.getPage(Number(element.dataset.page));
      if (session.disposed) return;
      const baseViewport = page.getViewport({ scale: 1 });
      const cssWidth = Math.min(760, Math.max(320, element.clientWidth || window.innerWidth - 32));
      const scale = Math.min(3.2, Math.max(1.35, (cssWidth / baseViewport.width) * (window.devicePixelRatio || 1)));
      const viewport = page.getViewport({ scale });
      const canvas = element.querySelector('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      element.dataset.rendered = 'true';
    };
    session.observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) renderPage(entry.target); }), { rootMargin: '500px' });
    document.querySelectorAll('[data-page]').forEach(element => session.observer.observe(element));
    update();
    requestAnimationFrame(() => document.querySelector('.page.active')?.scrollIntoView({ behavior: 'auto', block: 'center' }));
  } catch (error) {
    const status = document.querySelector('[data-edition-status]');
    if (status) { status.hidden = false; status.textContent = `${language.nativeLabel}: ${ui.unavailable}`; }
    stack.dataset.pdfReady = 'error';
    console.info('Selected PDF not present yet; using placeholder reader.', error.message);
  }
}
document.addEventListener('click', event => { const enterReader = event.target.closest('[data-action="enter-reader"]'); if (!enterReader || document.body.classList.contains('crow-transitioning')) return; event.preventDefault(); event.stopImmediatePropagation(); document.body.classList.add('crow-transitioning'); setTimeout(() => document.body.classList.add('crow-fading'), 1680); setTimeout(() => { document.body.classList.add('reader-from-crow'); location.hash = 'choose'; setTimeout(() => document.body.classList.remove('crow-transitioning', 'crow-fading', 'reader-from-crow'), 1200); }, 3280); }, true);
document.addEventListener('click', event => { const choice = event.target.closest('[data-reader-choice]'); if (!choice || document.body.classList.contains('choice-fading')) return; event.preventDefault(); const selection = choice.dataset.readerChoice; if (selection === 'beginning') { state.page = 1; save(langKey('page'), state.page); } else { loadLanguageProgress(); } document.body.classList.add('choice-fading', 'reader-from-choice'); setTimeout(() => { location.hash = 'read'; requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('reader-choice-visible'))); setTimeout(() => document.body.classList.remove('choice-fading', 'reader-from-choice', 'reader-choice-visible'), 1800); }, 900); });
