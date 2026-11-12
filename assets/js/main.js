/* =========================================================
   shailesh.docs — interactions
   - rough.js draws every [data-rough] outline (and "boils" on hover)
   - rough-notation marks text: highlight, strike, circle, crossed-off
   - Fig. 1: cursor-scrubbed image sequence (Code → Clarity)
   - docs chrome: scrollspy TOC, search palette, tabs, copy, "Try it"
   Everything degrades: without JS the page is fully readable.
   ========================================================= */
(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduced) root.classList.add("reduced");

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     1. Hand-drawn outlines (rough.js)
     --------------------------------------------------------- */
  const INK = "#2a2420";
  function drawRough(el, seed) {
    if (!window.rough) return;
    let svg = el.querySelector(":scope > .rough-svg");
    const w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) return;
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.classList.add("rough-svg");
      svg.setAttribute("aria-hidden", "true");
      el.prepend(svg);
    }
    svg.setAttribute("width", w + 8);
    svg.setAttribute("height", h + 8);
    svg.replaceChildren();
    const fill = el.dataset.roughFill;
    const rc = rough.svg(svg);
    svg.appendChild(rc.rectangle(4, 4, w, h, {
      seed: seed || el._seed || (el._seed = 1 + Math.floor(Math.random() * 9999)),
      roughness: 1.3, bowing: 1.2, strokeWidth: 1.7, stroke: INK,
      fill: fill || undefined, fillStyle: fill ? "solid" : undefined,
    }));
  }
  const roughEls = $$("[data-rough]");
  const redrawAll = () => roughEls.forEach((el) => drawRough(el));
  if (window.rough) {
    redrawAll();
    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver((entries) => entries.forEach((e) => drawRough(e.target)));
      roughEls.forEach((el) => ro.observe(el));
    }
    // "boil": redraw the line with a new seed while hovered, like a hand-drawn loop
    if (canHover && !reduced) {
      $$(".btn[data-rough], .search[data-rough], .toc-toggle[data-rough]").forEach((el) => {
        let t = 0;
        el.addEventListener("pointerenter", () => {
          clearInterval(t);
          t = setInterval(() => drawRough(el, 1 + Math.floor(Math.random() * 9999)), 140);
        });
        el.addEventListener("pointerleave", () => { clearInterval(t); drawRough(el); });
      });
    }
    document.fonts && document.fonts.ready.then(redrawAll);
  }

  /* ---------------------------------------------------------
     2. Text annotations (rough-notation), drawn when scrolled into view
     --------------------------------------------------------- */
  const RN = window.RoughNotation;
  const annotated = new Map();
  if (RN) {
    $$("[data-annotate]").forEach((el) => {
      const a = RN.annotate(el, {
        type: el.dataset.annotate,
        color: el.dataset.color || "#c2412d",
        strokeWidth: el.dataset.annotate === "highlight" ? 1 : 2,
        padding: el.dataset.annotate === "circle" ? 6 : el.dataset.annotate === "highlight" ? 2 : 3,
        multiline: true,
        iterations: el.dataset.annotate === "highlight" ? 1 : 2,
        animate: !reduced,
        animationDuration: el.dataset.annotate === "highlight" ? 900 : 650,
      });
      annotated.set(el, a);
    });
    const showGroup = (els) => els.forEach((el, i) => {
      const a = annotated.get(el);
      if (!a || a.isShowing()) return;
      setTimeout(() => a.show(), reduced ? 0 : i * 420);
    });
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          showGroup($$("[data-annotate]", e.target));
        });
      }, { threshold: 0.3 });
      // group by section so marks play in reading order
      $$(".sheet").forEach((s) => { if (s.querySelector("[data-annotate]")) io.observe(s); });
    } else {
      showGroup($$("[data-annotate]"));
    }
    // the hero "edit": strike the old word, then write the new one
    const edit = $(".edit");
    if (edit) setTimeout(() => edit.classList.add("is-done"), reduced ? 0 : 900);
    // annotations are absolutely positioned; keep them aligned after fonts settle
    document.fonts && document.fonts.ready.then(() => annotated.forEach((a) => { if (a.isShowing()) { a.hide(); a.show(); } }));
  } else {
    const edit = $(".edit");
    if (edit) edit.classList.add("is-done");
  }

  /* ---------------------------------------------------------
     3. Fig. 1 — cursor-scrubbed image sequence
        60 pre-rendered frames (tools/hero-render). Like scrubbing a video.
     --------------------------------------------------------- */
  (function heroScrub() {
    const fig = $(".fig");
    const canvas = $(".hero__canvas");
    if (!fig || !canvas) return;
    const ctx = canvas.getContext("2d");
    const N = 60;
    const src = (i) => `assets/hero/${String(i).padStart(3, "0")}.webp`;
    const frames = new Array(N);
    let cur = 0, target = 0, last = -1, user = false, visible = true, raf = 0;

    const draw = () => {
      const want = Math.round(cur * (N - 1));
      let idx = -1;
      for (let d = 0; d < N && idx < 0; d++) {
        if (frames[want - d] && frames[want - d].ok) idx = want - d;
        else if (frames[want + d] && frames[want + d].ok) idx = want + d;
      }
      if (idx < 0 || idx === last) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frames[idx].img, 0, 0, canvas.width, canvas.height);
      last = idx;
    };
    const setP = () => fig.style.setProperty("--p", cur.toFixed(3));
    const load = (i) => new Promise((res) => {
      if (frames[i]) return res();
      const img = new Image();
      frames[i] = { img, ok: false };
      img.decoding = "async";
      img.onload = () => { frames[i].ok = true; res(); };
      img.onerror = res;
      img.src = src(i);
    });

    if (reduced) { load(N - 1).then(() => { cur = 1; setP(); draw(); }); return; }

    const tick = () => {
      raf = 0;
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      setP(); draw();
      if (cur !== target && visible) raf = requestAnimationFrame(tick);
    };
    const go = () => { if (!raf && visible) raf = requestAnimationFrame(tick); };

    const order = [0, N - 1];
    for (const step of [12, 6, 3, 1]) for (let i = 0; i < N; i += step) if (!order.includes(i)) order.push(i);
    load(0).then(draw);
    (async () => {
      for (const i of order) {
        await load(i);
        if (Math.abs(i - cur * (N - 1)) < 2) { last = -1; draw(); }
      }
    })();

    // Intro: the page assembles once, then the visitor takes over.
    const introStart = performance.now() + 700;
    const intro = (t) => {
      if (user) return;
      const k = Math.min(1, Math.max(0, (t - introStart) / 2800));
      target = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      go();
      if (k < 1) requestAnimationFrame(intro);
    };
    requestAnimationFrame(intro);

    const clamp01 = (v) => Math.min(1, Math.max(0, v));
    const hero = $(".hero");
    if (canHover) {
      hero.addEventListener("pointermove", (e) => {
        user = true;
        const r = hero.getBoundingClientRect();
        target = clamp01((e.clientX - r.left - r.width * 0.08) / (r.width * 0.84));
        go();
      }, { passive: true });
    } else {
      const hint = $(".fig-hint");
      if (hint) hint.textContent = "Drag the figure to edit code into clarity.";
      let x0 = null, t0 = 0;
      canvas.addEventListener("pointerdown", (e) => { x0 = e.clientX; t0 = target; user = true; });
      window.addEventListener("pointermove", (e) => {
        if (x0 === null) return;
        target = clamp01(t0 + (e.clientX - x0) / canvas.clientWidth);
        go();
      }, { passive: true });
      const end = () => { x0 = null; };
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) go(); }).observe(fig);
    }
  })();

  /* ---------------------------------------------------------
     4. TOC: scrollspy + mobile drawer
     --------------------------------------------------------- */
  const tocLinks = $$(".toc__list a");
  const byId = new Map(tocLinks.map((a) => [a.getAttribute("href").slice(1), a]));
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tocLinks.forEach((a) => a.classList.remove("is-active"));
        const a = byId.get(e.target.id);
        if (a) { a.classList.add("is-active"); a.setAttribute("aria-current", "true"); }
        tocLinks.forEach((x) => { if (x !== a) x.removeAttribute("aria-current"); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$("main section[id]").forEach((s) => spy.observe(s));
  }

  const toc = $("#toc");
  const toggle = $(".toc-toggle");
  let scrim = null;
  const closeToc = () => {
    toc.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if (scrim) { scrim.remove(); scrim = null; }
  };
  if (toggle && toc) {
    toggle.addEventListener("click", () => {
      const open = !toc.classList.contains("is-open");
      if (!open) return closeToc();
      toc.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      scrim = document.createElement("div");
      scrim.className = "toc-scrim";
      scrim.addEventListener("click", closeToc);
      document.body.appendChild(scrim);
      const first = $(".toc__list a", toc);
      if (first) first.focus();
    });
    tocLinks.forEach((a) => a.addEventListener("click", () => { if (toc.classList.contains("is-open")) closeToc(); }));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && toc.classList.contains("is-open")) { closeToc(); toggle.focus(); } });
  }

  /* ---------------------------------------------------------
     5. Search palette ( / or Ctrl/⌘ K )
     --------------------------------------------------------- */
  const palette = $("#palette");
  const input = $("#palette-input");
  const list = $("#palette-list");
  const INDEX = [
    { t: "Overview", id: "overview", s: "Getting started", k: "about bio shailesh jha technical writer bengaluru" },
    { t: "Quickstart: working with me", id: "quickstart", s: "Getting started", k: "process steps hire" },
    { t: "Case study: Docutanix", id: "docutanix", s: "Guides", k: "ai agent rag glean nutanix drafting kb" },
    { t: "Style guide (excerpt)", id: "style-guide", s: "Guides", k: "editorial voice do dont accessibility writing rules" },
    { t: "By the numbers", id: "numbers", s: "Guides", k: "impact metrics kb approved backlog deflection receipt" },
    { t: "Changelog", id: "changelog", s: "Reference", k: "career experience history jobs releases" },
    { t: "v5.0.0 · Nutanix", id: "changelog", s: "Changelog", k: "nutanix senior technical content engineer aos prism" },
    { t: "v4.0.0 · Gupshup", id: "changelog", s: "Changelog", k: "gupshup founding lead readme portal api sdk" },
    { t: "v3.0.0 · Rocket Software", id: "changelog", s: "Changelog", k: "rocket information developer cli hybrid cloud" },
    { t: "v2.0.0 · Adobe", id: "changelog", s: "Changelog", k: "adobe support release notes" },
    { t: "v1.0.0 · Amazon", id: "changelog", s: "Changelog", k: "amazon aws iam ec2 faq" },
    { t: "API: GET /skills", id: "api", s: "Reference", k: "skills tools json openapi postman git" },
    { t: "Writing samples", id: "samples", s: "Reference", k: "portfolio work examples gupshup docs" },
    { t: "Contact", id: "contact", s: "Support", k: "email phone linkedin resume hire" },
  ];
  let results = [], sel = 0;
  const render = () => {
    const q = input.value.trim().toLowerCase();
    results = INDEX.filter((r) => !q || (r.t + " " + r.k + " " + r.s).toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, results.length - 1));
    list.replaceChildren(...(results.length ? results.map((r, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(i === sel));
      li.innerHTML = `<b></b><span></span>`;
      li.querySelector("b").textContent = r.t;
      li.querySelector("span").textContent = r.s;
      li.addEventListener("click", () => openResult(r));
      li.addEventListener("pointermove", () => { if (sel !== i) { sel = i; render(); } });
      return li;
    }) : [Object.assign(document.createElement("li"), { className: "empty", textContent: "No matches. Try “API”, “Gupshup” or “style”." })]));
  };
  const openResult = (r) => {
    palette.close();
    const target = document.getElementById(r.id);
    if (target) { target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); history.replaceState(null, "", "#" + r.id); }
  };
  const openPalette = () => {
    if (!palette || palette.open) return;
    input.value = ""; sel = 0; render();
    palette.showModal();
    input.focus();
  };
  if (palette && typeof palette.showModal === "function") {
    $$("[data-open-search]").forEach((b) => b.addEventListener("click", openPalette));
    input.addEventListener("input", () => { sel = 0; render(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(results.length - 1, sel + 1); render(); }
      if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); render(); }
      if (e.key === "Enter") { e.preventDefault(); if (results[sel]) openResult(results[sel]); }
    });
    palette.addEventListener("click", (e) => { if (e.target === palette) palette.close(); });
    document.addEventListener("keydown", (e) => {
      const typing = /input|textarea|select/i.test(document.activeElement.tagName);
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) { e.preventDefault(); openPalette(); }
    });
  } else {
    $$("[data-open-search]").forEach((b) => (b.hidden = true));
  }

  /* ---------------------------------------------------------
     6. Code tabs, copy buttons, "Try it"
     --------------------------------------------------------- */
  const tabs = $$('[role="tab"]');
  const selectTab = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(n); n.focus();
    });
  });

  const copyText = async (text, btn) => {
    const done = (msg) => { const o = btn.textContent; btn.textContent = msg; setTimeout(() => (btn.textContent = o), 1400); };
    try { await navigator.clipboard.writeText(text); done("copied ✓"); }
    catch {
      const r = document.createRange(); const span = document.createElement("span");
      span.textContent = text; document.body.appendChild(span); r.selectNodeContents(span);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      try { document.execCommand("copy"); done("copied ✓"); } catch { done("select & copy"); }
      s.removeAllRanges(); span.remove();
    }
  };
  $$(".copy").forEach((btn) => btn.addEventListener("click", () => {
    if (btn.dataset.copyText) return copyText(btn.dataset.copyText, btn);
    const scope = btn.closest(".codeblock") || document;
    const el = $(btn.dataset.copyTarget, scope) || $(btn.dataset.copyTarget);
    if (el) copyText(el.textContent, btn);
  }));

  // Try it: call the real endpoint and print the live response
  const tryBtn = $("#try-it");
  const out = $("#api-out");
  const status = $(".status");
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const highlight = (json) => esc(json)
    .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span class="c-k">$1</span>$2')
    .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="c-s">$1</span>')
    .replace(/(\[|,)\s*("(?:[^"\\]|\\.)*")/g, (m, p, s) => `${p} <span class="c-s">${s}</span>`);
  if (tryBtn && out && status) {
    tryBtn.addEventListener("click", async () => {
      selectTab($("#tab-res"));
      status.classList.add("is-loading");
      $(".status__text", status).textContent = "GET /api/skills.json …";
      const t0 = performance.now();
      try {
        const res = await fetch("api/skills.json", { cache: "no-store" });
        const data = await res.json();
        const ms = Math.round(performance.now() - t0);
        out.innerHTML = highlight(JSON.stringify({ skills: data.skills, certifications: data.certifications }, null, 2));
        $(".status__text", status).textContent = `${res.status} ${res.ok ? "OK" : res.statusText} · ${ms} ms · live`;
      } catch {
        $(".status__text", status).textContent = "Couldn't reach the endpoint. Showing the example instead.";
      } finally {
        status.classList.remove("is-loading");
      }
    });
  }
})();
