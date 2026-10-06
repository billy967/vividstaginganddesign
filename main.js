(() => {
  const PHONE = "+12483305943";

  // Mobile nav
  const menuBtn = document.querySelector(".menu-btn");
  const links = document.querySelector(".nav-links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open);
    });
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
  }

  // Reveal on scroll
  const io = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 }) : null;
  document.querySelectorAll(".reveal").forEach(el => io ? io.observe(el) : el.classList.add("in"));

  // Cost-of-waiting calculator
  const fmt = n => "$" + Math.round(n).toLocaleString("en-US");
  const price = document.getElementById("price");
  const carry = document.getElementById("carry");
  if (price && carry) {
    const update = () => {
      const p = +price.value, c = +carry.value;
      document.getElementById("priceOut").textContent = fmt(p);
      document.getElementById("carryOut").textContent = fmt(c) + "/mo";
      document.getElementById("cost60").textContent = fmt(c * 2);
      document.getElementById("onePct").textContent = fmt(p * 0.01);
      document.getElementById("threePct").textContent = fmt(p * 0.03);
    };
    price.addEventListener("input", update);
    carry.addEventListener("input", update);
    update();
  }

  // Before / after slider
  document.querySelectorAll(".ba").forEach(ba => {
    const range = ba.querySelector("input");
    const after = ba.querySelector(".after-wrap");
    const handle = ba.querySelector(".handle");
    const set = v => { after.style.clipPath = `inset(0 0 0 ${v}%)`; handle.style.left = v + "%"; };
    range.addEventListener("input", () => set(range.value));
    set(range.value);
  });

  // Estimate form -> pre-written text to Soham's phone (no backend needed)
  document.querySelectorAll("form.estimate-form").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const d = new FormData(form);
      const lines = [
        "FREE ESTIMATE REQUEST - Vivid Staging & Design",
        "Name: " + (d.get("name") || ""),
        "Phone: " + (d.get("phone") || ""),
        d.get("email") ? "Email: " + d.get("email") : "",
        "Property: " + (d.get("address") || ""),
        "Type: " + (d.get("type") || ""),
        d.get("size") ? "Size: " + d.get("size") : "",
        d.get("timeline") ? "Timeline: " + d.get("timeline") : "",
        d.get("notes") ? "Notes: " + d.get("notes") : ""
      ].filter(Boolean).join("\n");
      const sms = `sms:${PHONE}?&body=${encodeURIComponent(lines)}`;
      form.querySelectorAll("a.sms-send").forEach(a => a.href = sms);
      const pre = form.querySelector(".req");
      if (pre) pre.textContent = lines;
      const copy = form.querySelector(".copy-req");
      if (copy) copy.onclick = () => {
        const done = () => { copy.textContent = "Copied. Paste it into a text to (248) 330-5943"; };
        const fallback = () => { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent = "Selected. Copy it and text it to us"; };
        try { navigator.clipboard.writeText(lines).then(done, fallback); } catch (err) { fallback(); }
      };
      form.classList.add("sent");
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      if (matchMedia("(pointer:coarse)").matches) { try { window.location.href = sms; } catch (err) {} }
    });
  });

  // Gallery lightbox
  const figs = [...document.querySelectorAll(".masonry figure")];
  const lb = document.querySelector(".lightbox");
  if (figs.length && lb) {
    const img = lb.querySelector("img");
    const count = lb.querySelector(".lb-count");
    let i = 0;
    const show = n => {
      const live = figs.filter(f => f.isConnected);
      i = (n + live.length) % live.length;
      img.src = live[i].querySelector("img").src;
      img.alt = live[i].querySelector("img").alt;
      count.textContent = `${i + 1} / ${live.length}`;
    };
    figs.forEach((f, n) => f.addEventListener("click", () => { show(figs.filter(x => x.isConnected).indexOf(f)); lb.classList.add("open"); }));
    lb.querySelector(".lb-close").addEventListener("click", () => lb.classList.remove("open"));
    lb.querySelector(".lb-prev").addEventListener("click", e => { e.stopPropagation(); show(i - 1); });
    lb.querySelector(".lb-next").addEventListener("click", e => { e.stopPropagation(); show(i + 1); });
    lb.addEventListener("click", e => { if (e.target === lb) lb.classList.remove("open"); });
    document.addEventListener("keydown", e => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") lb.classList.remove("open");
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    });
  }

  document.querySelectorAll(".year").forEach(y => y.textContent = new Date().getFullYear());
})();

// Nav height for pinned sections + scroll-driven staging scene
(() => {
  const nav = document.querySelector(".nav");
  const setNav = () => nav && document.documentElement.style.setProperty("--navh", nav.offsetHeight + "px");
  setNav(); addEventListener("resize", setNav);
  const film = document.querySelector(".film");
  if (!film) return;
  const steps = [...film.querySelectorAll(".film-step")];
  const pills = [...film.querySelectorAll(".film-pills button")];
  let cur = -1;
  const show = s => {
    if (s === cur) return; cur = s;
    [1, 2, 3].forEach(n => film.classList.toggle("s" + n, s >= n));
    steps.forEach((el, i) => el.classList.toggle("on", i === s));
    pills.forEach((el, i) => el.classList.toggle("on", i === s));
  };
  const onScroll = () => {
    const r = film.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    show(Math.min(3, Math.floor(p * 4)));
  };
  pills.forEach((b, i) => b.addEventListener("click", () => {
    const top = film.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (film.offsetHeight - innerHeight) * (i + 0.5) / 4, behavior: "smooth" });
  }));
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
