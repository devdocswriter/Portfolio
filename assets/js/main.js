/* =========================================================
   Shailesh Jha — Portfolio interactions
   GSAP + ScrollTrigger + Lenis. Degrades gracefully.
   ========================================================= */
(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Duplicate marquee content for a seamless loop ---------- */
  $$(".marquee__row").forEach((row) => {
    $$("span", row).forEach((s) => {
      const c = s.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      row.appendChild(c);
    });
  });

  /* ---------- Split manifesto into words ---------- */
  const manifesto = $("[data-split]");
  if (manifesto) {
    manifesto.innerHTML = manifesto.textContent
      .trim()
      .split(/\s+/)
      .map((w) => `<span class="w">${w}</span>`)
      .join(" ");
  }
  const words = $$(".manifesto__text .w");

  /* ---------- Number formatting / counters ---------- */
  const fmt = (el, v) => {
    const d = +(el.dataset.decimals || 0);
    el.textContent = Number(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  const finalizeCounters = () => $$("[data-count]").forEach((el) => fmt(el, el.dataset.count));

  /* ---------- Fallback: no GSAP or reduced motion ---------- */
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.add("no-gsap");
    words.forEach((w) => w.classList.add("on"));
    finalizeCounters();
    $$(".sheet").forEach((s, i) => s.style.setProperty("--z", i * 40));
    $$(".step").forEach((s) => s.classList.add("is-active"));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  if (reduced) {
    root.classList.add("reduced", "no-gsap");
    words.forEach((w) => w.classList.add("on"));
    finalizeCounters();
    $$(".sheet").forEach((s, i) => s.style.setProperty("--z", i * 40));
    $$(".step, .node, .term .t").forEach((s) => s.classList.add("is-active", "on"));
    return;
  }

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Anchor links through Lenis
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id === "#top" ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.6, offset: 0 });
      else window.scrollTo({ top: target === 0 ? 0 : target.offsetTop, behavior: "smooth" });
    });
  });

  /* ---------- Nav: hide on scroll down, show on scroll up ---------- */
  const nav = $(".nav");
  let lastY = 0;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle("is-hidden", y > lastY && y > 400);
      lastY = y;
    },
  });

  /* ---------- Cursor glow ---------- */
  if (canHover) {
    const glow = $(".cursor-glow");
    const gx = gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3" });
    const gy = gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3" });
    window.addEventListener("pointermove", (e) => { gx(e.clientX); gy(e.clientY); });
  }

  /* ---------- HERO: intro + 3D doc stack scrubbed on scroll ---------- */
  const heroIntro = gsap.timeline({ defaults: { ease: "expo.out" } });
  heroIntro
    .from(".hero__title .word", { yPercent: 110, rotate: 4, duration: 1.4, stagger: 0.12 })
    .from(".hero__copy .reveal-up", { y: 30, opacity: 0, duration: 1.2, stagger: 0.1 }, "-=1.1")
    .from(".nav", { y: -40, opacity: 0, duration: 1 }, "-=1")
    .from(".scroll-hint", { opacity: 0, duration: 1 }, "-=.6");

  const sheets = $$(".sheet");
  const stack = $(".stack");
  gsap.set(stack, { opacity: 0, y: "35vh", rotateX: 0, rotateZ: 0, scale: 0.55 });
  gsap.set(sheets, { z: 0 });

  const heroTl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom bottom", scrub: 1 },
  });

  heroTl
    // copy recedes into depth
    .to(".hero__copy", { scale: 0.82, opacity: 0, y: "-12vh", filter: "blur(8px)", duration: 1 }, 0)
    .to(".scroll-hint", { opacity: 0, duration: 0.3 }, 0)
    // stack rises and tilts into isometric view
    .to(stack, { opacity: 1, y: 0, rotateX: 58, rotateZ: -32, scale: 0.95, duration: 1 }, 0.1)
    .to(sheets, { z: (i) => i * 55, duration: 1 }, 0.2)
    // explode layers apart
    .to(sheets, { z: (i) => i * 120 - 120, x: (i) => (i - 2) * 22, y: (i) => (i - 2) * -14, duration: 1.2 }, 1.1)
    .to(stack, { rotateZ: -18, rotateX: 50, scale: 1, duration: 1.2 }, 1.1)
    // focus: the AI agent sheet comes forward, others fall away
    .to(stack, { rotateX: 0, rotateZ: 0, scale: 1.12, duration: 1.2 }, 2.3)
    .to(sheets.filter((s) => !s.classList.contains("s4")), {
      opacity: 0, z: (i) => -200 - i * 80, y: (i) => 60 + i * 30, duration: 1, stagger: 0.05,
    }, 2.3)
    .to(".s4", { z: 160, x: 0, y: 0, duration: 1.2 }, 2.3)
    .to(stack, { opacity: 0, scale: 1.4, duration: 0.6 }, 3.4);

  /* ---------- Generic section reveals ---------- */
  $$(".section > .eyebrow, .display, .lede").forEach((el) => {
    gsap.from(el, {
      y: 60, opacity: 0, duration: 1.2, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  /* ---------- Manifesto: words light up with scroll ---------- */
  if (words.length) {
    ScrollTrigger.create({
      trigger: ".manifesto__text",
      start: "top 80%",
      end: "bottom 45%",
      scrub: true,
      onUpdate: (self) => {
        const n = Math.round(self.progress * words.length);
        words.forEach((w, i) => w.classList.toggle("on", i < n));
      },
    });
  }

  /* ---------- Counters ---------- */
  $$("[data-count]").forEach((el) => {
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: +el.dataset.count, duration: 2.2, ease: "power3.out",
          onUpdate: () => fmt(el, obj.v),
        }),
    });
  });

  /* ---------- Responsive pinned sections ---------- */
  const mm = gsap.matchMedia();

  mm.add("(min-width: 901px)", () => {
    /* Docutanix: pinned 4-step walkthrough */
    const steps = $$(".step");
    const nodes = $$(".node");
    const lines = $$(".term .t");
    const wires = $$(".wire");
    const setStage = (idx) => {
      steps.forEach((s, i) => s.classList.toggle("is-active", i === idx));
      nodes.forEach((n, i) => n.classList.toggle("on", i <= idx));
      lines.forEach((l, i) => l.classList.toggle("on", i <= idx));
      wires.forEach((w, i) => w.style.setProperty("--p", i < idx ? 1 : 0));
    };
    setStage(0);

    ScrollTrigger.create({
      trigger: ".feature__pin",
      start: "top top",
      end: "+=260%",
      pin: true,
      scrub: true,
      onUpdate: (self) => setStage(Math.min(3, Math.floor(self.progress * 4.001))),
    });
    gsap.fromTo(".device",
      { rotateX: 22, rotateY: -22, rotateZ: 3, scale: 0.92 },
      { rotateX: 4, rotateY: -4, rotateZ: 0, scale: 1, ease: "none",
        scrollTrigger: { trigger: ".feature__pin", start: "top bottom", end: "+=200%", scrub: 1 } });

    /* Journey: horizontal scroll with 3D card rotation */
    const track = $(".track");
    const distance = () => track.scrollWidth - window.innerWidth;
    const horiz = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".journey__pin",
        start: "top top",
        end: () => "+=" + distance(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    $$(".job").forEach((job) => {
      gsap.timeline({
        scrollTrigger: { trigger: job, containerAnimation: horiz, start: "left right", end: "right left", scrub: true },
      })
        .fromTo(job, { rotateY: -28, z: -180, opacity: 0.35 }, { rotateY: 0, z: 0, opacity: 1, ease: "power1.out" })
        .to(job, { rotateY: 28, z: -180, opacity: 0.35, ease: "power1.in" });
    });

    return () => setStage(0);
  });

  mm.add("(max-width: 900px)", () => {
    $$(".step").forEach((s) => s.classList.add("is-active"));
    $$(".node, .term .t").forEach((n) => n.classList.add("on"));
    $$(".wire").forEach((w) => w.style.setProperty("--p", 1));
    $$(".job").forEach((job) =>
      gsap.from(job, { y: 80, opacity: 0, rotateX: -12, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: job, start: "top 88%" } }));
  });

  /* ---------- Bento tiles: 3D rise-in ---------- */
  ScrollTrigger.batch(".tile, .cap, .sample", {
    start: "top 90%",
    once: true,
    onEnter: (batch) =>
      gsap.from(batch, {
        y: 80, rotateX: -18, opacity: 0, transformPerspective: 1000,
        duration: 1.2, ease: "expo.out", stagger: 0.08, clearProps: "transform,opacity",
      }),
  });
  gsap.from(".bar span", {
    scaleY: 0, duration: 1.6, ease: "expo.out", stagger: 0.2,
    scrollTrigger: { trigger: ".bars", start: "top 85%" },
  });

  /* ---------- Zero-to-one stacking cards ---------- */
  const cards = $$(".card");
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.fromTo(card, { scale: 1, filter: "brightness(1)" }, {
      scale: 0.9 + i * 0.015,
      filter: "brightness(0.45)",
      ease: "none",
      scrollTrigger: { trigger: next, start: "top bottom", end: "top 140px", scrub: true },
    });
  });

  /* ---------- Contact title ---------- */
  gsap.from(".contact__title", {
    yPercent: 30, opacity: 0, scale: 0.92, ease: "none",
    scrollTrigger: { trigger: ".contact", start: "top bottom", end: "top 20%", scrub: 1 },
  });

  /* ---------- Pointer-reactive 3D tilt + spotlight ---------- */
  if (canHover) {
    $$(".tilt").forEach((el) => {
      const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" });
      const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" });
      gsap.set(el, { transformPerspective: 900 });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", `${px * 100}%`);
        el.style.setProperty("--my", `${py * 100}%`);
        rx((0.5 - py) * 10);
        ry((px - 0.5) * 12);
      });
      el.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });

    /* Magnetic buttons */
    $$(".magnetic").forEach((el) => {
      const mx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      const my = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.35);
        my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("pointerleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ---------- Refresh after fonts settle ---------- */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
