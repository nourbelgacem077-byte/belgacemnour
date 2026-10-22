const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Année automatique dans le pied de page
$("#year").textContent = new Date().getFullYear();

// Barre de navigation : fond flouté dès qu'on défile
const bar = $(".topbar");
const onScroll = () => bar.classList.toggle("is-stuck", window.scrollY > 10);
onScroll();
addEventListener("scroll", onScroll, { passive: true });

// Menu mobile
const menuBtn = $(".menu");
const nav = $("#nav");
const setMenu = open => {
  nav.classList.toggle("is-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
};
menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
nav.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });

// Apparition progressive des éléments au défilement
const revealItems = $$(".reveal");
revealItems.forEach(el => {
  const siblings = [...el.parentElement.children].filter(c => c.classList.contains("reveal"));
  el.style.setProperty("--delay", (siblings.indexOf(el) % 4) * 0.08 + "s");
});

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach(el => el.classList.add("in"));
} else {
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealItems.forEach(el => revealObserver.observe(el));
}

// Lien du menu actif selon la section visible
const links = $$(".nav a");
const targets = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  targets.forEach(t => spy.observe(t));
}

// Texte qui s'écrit dans l'accueil
const typed = $("#typed");
const phrases = ["Electrical Engineer", "Embedded Systems", "Power Electronics", "PCB Layout"];
if (!reduceMotion) {
  let p = 0, i = phrases[0].length, deleting = true;
  const tick = () => {
    const word = phrases[p];
    i += deleting ? -1 : 1;
    typed.textContent = word.slice(0, i);
    let delay = deleting ? 35 : 70;
    if (!deleting && i === word.length) { deleting = true; delay = 1800; }
    else if (deleting && i === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 300; }
    setTimeout(tick, delay);
  };
  setTimeout(tick, 2200);
}

// Filtre des projets par domaine
const filters = $$(".filter");
const projects = $$(".project");
filters.forEach(btn => {
  btn.addEventListener("click", () => {
    const wanted = btn.dataset.filter;
    filters.forEach(b => {
      const on = b === btn;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });
    projects.forEach(card => {
      const categories = card.dataset.category.split(" ");
      card.hidden = !(wanted === "all" || categories.includes(wanted));
    });
  });
});
// CV menu (choose a specialty)
const cvBtn  = $(".cv-menu__btn");
const cvList = $("#cv-list");
const setCv = open => {
  cvList.hidden = !open;
  cvBtn.setAttribute("aria-expanded", String(open));
};
cvBtn.addEventListener("click", e => { e.stopPropagation(); setCv(cvList.hidden); });
cvList.addEventListener("click", () => setCv(false));
document.addEventListener("click", e => { if (!e.target.closest(".cv-menu")) setCv(false); });
document.addEventListener("keydown", e => { if (e.key === "Escape") setCv(false); });
// Project image sliders
document.querySelectorAll('.slider').forEach(function (slider) {
  var dotsBox = slider.querySelector('.slider__dots');
  var index = 0, timer = null, DELAY = 3000;

  function slides() { return slider.querySelectorAll('img'); }

  function buildDots() {
    dotsBox.innerHTML = '';
    slides().forEach(function () { dotsBox.appendChild(document.createElement('span')); });
  }

  function show(i) {
    var imgs = slides();
    if (!imgs.length) return;
    index = (i + imgs.length) % imgs.length;
    imgs.forEach(function (img, n) { img.classList.toggle('is-active', n === index); });
    dotsBox.querySelectorAll('span').forEach(function (d, n) { d.classList.toggle('is-active', n === index); });
    var cap = slider.querySelector('.slider__caption');
    if (cap) cap.textContent = imgs[index].dataset.caption || '';
  }

  function start() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stop();
    timer = setInterval(function () { show(index + 1); }, DELAY);
  }
  function stop() { clearInterval(timer); }

  // wait for the page to load so images that fail (onerror) are removed first
  window.addEventListener('load', function () {
    buildDots();
    show(0);
    if (slides().length > 1) start();
  });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
});
