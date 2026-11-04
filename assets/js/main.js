(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSub = document.body.classList.contains("subpage");
  let io; // reveal observer, created lazily by observeReveal()

  // ---------- nav (transparent over the dark hero, solid after it) ----------
  const nav = $("#nav");
  if (!isSub) {
    const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > (window.innerWidth < 760 ? 40 : window.innerHeight * 0.6));
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  }
  const burger = $("#navBurger"), links = $("#navLinks");
  burger.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", open); links.classList.toggle("is-open", open);
  });
  $$("a", links).forEach((a) => a.addEventListener("click", () => { burger.setAttribute("aria-expanded", "false"); links.classList.remove("is-open"); }));

  // active section highlight
  if (!isSub) {
    const map = new Map($$("a", links).map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      $$("a", links).forEach((a) => a.classList.remove("is-active"));
      map.get(e.target.id)?.classList.add("is-active");
    }), { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach((s) => spy.observe(s));
  }

  // ---------- helpers ----------
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const authors = (s) => esc(s).replace(/&lt;me&gt;(.*?)&lt;\/me&gt;/g, "<me>$1</me>");
  const KIND = { journal: "Journal", kjournal: "Journal (KR)", intconf: "Conference", kconf: "Conference (KR)", thesis: "Thesis" };
  // Citation counts come from assets/data/citations.json, refreshed daily from Google Scholar by a GitHub Action.
  const citeKey = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const citeData = fetch("assets/data/citations.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  function applyCites(root = document) {
    citeData.then((d) => {
      if (!d) return;
      $$(".cite[data-key]", root).forEach((el) => {
        const n = d.papers[el.dataset.key];
        if (n == null) return;
        el.textContent = `Cited by ${n}`;
        el.title = `Google Scholar · updated ${d.updated}`;
        el.hidden = false;
      });
    });
  }

  function pubItem(p, showKind) {
    const badges = [];
    if (p.type === "journal") badges.push(`<span class="badge cite" data-key="${citeKey(p.title)}" hidden></span>`);
    if (showKind) badges.push(`<span class="badge kind">${KIND[p.type]}</span>`);
    if (p.award) badges.push(`<span class="badge award">🏆 ${esc(p.award)}</span>`);
    (p.badges || []).forEach((b) => badges.push(`<span class="badge">${esc(b)}</span>`));
    if (p.link) badges.push(`<a class="badge" href="${p.link}" target="_blank" rel="noopener">${p.link.includes("arxiv") ? "arXiv" : "Paper"} ↗</a>`);
    const lead = p.fig
      ? `<button class="pub-fig" type="button" data-src="${p.fig.src}" data-cap="${esc(p.fig.caption)} — ${esc(p.title)}" aria-label="Enlarge figure: ${esc(p.fig.caption)}"><img src="${p.fig.src}" alt="${esc(p.fig.caption)}" loading="lazy"></button>`
      : `<div class="pub-year">${p.year}</div>`;
    return `<li class="pub reveal${p.fig ? "" : " no-fig"}">${lead}<div>
      ${p.fig ? `<div class="pub-meta">${p.year}</div>` : ""}
      <div class="pub-title">${esc(p.title)}</div>
      <div class="pub-authors">${authors(p.authors)}</div>
      <div class="pub-venue">${esc(p.venue)}${p.detail ? ` <span class="det">· ${esc(p.detail)}</span>` : ""}</div>
      ${badges.length ? `<div class="pub-badges">${badges.join("")}</div>` : ""}</div></li>`;
  }

  // figure lightbox
  const lb = $("#lightbox");
  if (lb) {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".pub-fig");
      if (!btn) return;
      $("img", lb).src = btn.dataset.src; $("img", lb).alt = btn.dataset.cap; $(".lb-cap", lb).textContent = btn.dataset.cap;
      lb.showModal();
    });
    $(".lb-close", lb).addEventListener("click", () => lb.close());
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  }

  // ---------- projects ----------
  const years = $("#years");
  if (years) {
    const P = window.PROJECTS;
    $("#cntAll").textContent = P.length; $("#cntPm").textContent = P.filter((p) => p.pm).length;
    const groups = [...new Set(P.map((p) => p.year))];
    years.innerHTML = groups.map((y) => `<div class="year reveal" data-year="${y}"><div class="year-no">${y}</div><div class="proj-list">${
      P.filter((p) => p.year === y).map((p) => `<article class="proj" data-pm="${!!p.pm}">
        <div class="proj-org">${esc(p.org)}</div><div class="proj-when">${p.when}</div>
        <div class="proj-title">${esc(p.title)}${p.pm ? '<span class="pm">PM</span>' : ""}</div>
        ${p.desc ? `<p class="proj-desc">${esc(p.desc)}</p>` : ""}
        <div class="proj-tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      </article>`).join("")}</div></div>`).join("");
    $$(".filter[data-filter]").forEach((b) => b.addEventListener("click", () => {
      $$(".filter[data-filter]").forEach((x) => x.classList.toggle("is-on", x === b));
      const pmOnly = b.dataset.filter === "pm";
      $$(".proj", years).forEach((el) => (el.hidden = pmOnly && el.dataset.pm !== "true"));
      $$(".year", years).forEach((el) => (el.hidden = !$$(".proj", el).some((x) => !x.hidden)));
    }));
  }

  // ---------- publications ----------
  const sel = $("#selectedPubs");
  if (sel) { sel.innerHTML = window.PUBLICATIONS.filter((p) => p.selected).sort((a, b) => b.year - a.year).map((p) => pubItem(p, true)).join(""); applyCites(sel); }

  const all = $("#allPubs");
  if (all) {
    const render = (type) => {
      all.innerHTML = window.PUB_GROUPS.filter(([t]) => type === "all" || t === type).map(([t, label]) => {
        const items = window.PUBLICATIONS.filter((p) => p.type === t).sort((a, b) => b.year - a.year);
        return items.length ? `<div class="pub-group"><h2>${label}<span>${items.length}</span></h2><ol class="pub-list">${items.map((p) => pubItem(p, false)).join("")}</ol></div>` : "";
      }).join("");
      observeReveal();
      applyCites(all);
    };
    const f = $("#pubFilters");
    const opts = [["all", "All", window.PUBLICATIONS.length], ...window.PUB_GROUPS.map(([t, l]) => [t, l, window.PUBLICATIONS.filter((p) => p.type === t).length])];
    f.innerHTML = opts.map(([t, l, n], k) => `<button class="filter${k ? "" : " is-on"}" data-type="${t}" type="button">${l} <span>${n}</span></button>`).join("");
    $$("button", f).forEach((b) => b.addEventListener("click", () => { $$("button", f).forEach((x) => x.classList.toggle("is-on", x === b)); render(b.dataset.type); }));
    render("all");
  }

  // ---------- reveal on scroll ----------
  function observeReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) { $$(".reveal").forEach((el) => el.classList.add("is-in")); return; }
    io = io || new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal:not(.is-in)").forEach((el) => io.observe(el));
  }
  observeReveal();

  // ---------- visuals ----------
  const V = window.Visuals;
  if ($("#heroBg")) V.ribbons($("#heroBg"), { preset: "hero", weight: "right", theme: "light" });
  if ($("#contactBg")) V.ribbons($("#contactBg"), { preset: "band", weight: "right", theme: "light", fps: 30 });
  const figs = [["#visGallery", V.gallery, 11], ["#visField", V.field, 5], ["#visRib", V.ribs, 3], ["#visLatent", V.latent, 9]]
    .map(([s, fn, seed]) => ({ el: $(s), fn, seed })).filter((f) => f.el);
  const drawFigs = () => figs.forEach((f) => f.fn(f.el, f.seed));
  figs.forEach((f) => f.el.addEventListener("click", () => { f.seed = (f.seed * 7919 + 13) % 100003; f.fn(f.el, f.seed); }));
  drawFigs();
  let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(drawFigs, 160); });
})();
