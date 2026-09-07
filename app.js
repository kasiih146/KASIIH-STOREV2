/**
 * KASIIH STORE — APP LOGIC
 * Vanilla JS, no build step. Sections are:
 *   1. Particle background (loader + hero)
 *   2. Loading screen
 *   3. Navbar / mobile menu / scroll reveal
 *   4. Renderers (categories, products, feedback, trust, timeline)
 *   5. Product modal
 *   6. Cart (localStorage-backed)
 *   7. Feedback lightbox
 *   8. Misc (magnetic buttons, toast, WhatsApp link)
 */

const CART_KEY = "kasiih_cart_v1";
const REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const IS_SMALL = window.innerWidth < 720;

/* -------------------------------------------------------------------- */
/* 1. PARTICLE BACKGROUND                                                */
/* -------------------------------------------------------------------- */

function initParticles(canvas, { density = 1, mouseParallax = false } = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, particles;
  let mouse = { x: 0, y: 0 };

  function resize() {
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }

  function makeParticles() {
    const count = REDUCE_MOTION ? 0 : Math.floor((IS_SMALL ? 26 : 60) * density);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 1.6 + 0.4) * devicePixelRatio,
      vx: (Math.random() - 0.5) * 0.15 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.15 * devicePixelRatio,
      hue: Math.random() > 0.5 ? "139,92,246" : "34,211,238",
      a: Math.random() * 0.5 + 0.2,
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      let dx = 0, dy = 0;
      if (mouseParallax) {
        dx = (mouse.x - w / 2) * 0.02;
        dy = (mouse.y - h / 2) * 0.02;
      }

      ctx.beginPath();
      ctx.arc(p.x + dx, p.y + dy, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }

  resize();
  makeParticles();
  if (!REDUCE_MOTION) requestAnimationFrame(tick);
  window.addEventListener("resize", () => { resize(); makeParticles(); });

  if (mouseParallax) {
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX * devicePixelRatio;
      mouse.y = e.clientY * devicePixelRatio;
    });
  }
}

/* -------------------------------------------------------------------- */
/* 2. LOADING SCREEN                                                     */
/* -------------------------------------------------------------------- */

function runLoader() {
  const loader = document.getElementById("loader");
  const fill = document.getElementById("loader-fill");
  const pct = document.getElementById("loader-pct");
  if (!loader) return Promise.resolve();

  return new Promise((resolve) => {
    let progress = 0;
    const step = () => {
      progress += Math.random() * 18 + 6;
      if (progress >= 100) {
        progress = 100;
        fill.style.width = "100%";
        pct.textContent = "100%";
        setTimeout(() => {
          loader.classList.add("hidden");
          resolve();
        }, 350);
        return;
      }
      fill.style.width = progress + "%";
      pct.textContent = Math.floor(progress) + "%";
      setTimeout(step, 140 + Math.random() * 120);
    };
    step();
  });
}

/* -------------------------------------------------------------------- */
/* 3. NAVBAR / SCROLL REVEAL                                             */
/* -------------------------------------------------------------------- */

function initNav() {
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  const navLinks = document.querySelectorAll(".nav-links a, .mobile-menu a");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("solid", window.scrollY > 40);
  }, { passive: true });

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      mobileMenu.classList.remove("open");
    });
  });

  const sections = document.querySelectorAll("section[id]");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((l) => l.classList.remove("active"));
        document.querySelectorAll(`.nav-links a[href="#${entry.target.id}"]`)
          .forEach((l) => l.classList.add("active"));
      }
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  sections.forEach((s) => spy.observe(s));
}

function initHeroParallax() {
  if (REDUCE_MOTION || IS_SMALL) return;
  const g1 = document.querySelector(".hero-glow.g1");
  const g2 = document.querySelector(".hero-glow.g2");
  const content = document.querySelector(".hero-content");
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        g1.style.transform = `translate3d(0, ${y * 0.25}px, 0)`;
        g2.style.transform = `translate3d(0, ${y * -0.18}px, 0)`;
        content.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
        content.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.8)));
      }
      ticking = false;
    });
  }, { passive: true });
}

function initScrollReveal() {
  const els = document.querySelectorAll(".reveal-up");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach((el) => io.observe(el));
}

/* -------------------------------------------------------------------- */
/* 4. RENDERERS                                                          */
/* -------------------------------------------------------------------- */

function money(n) {
  return "RM" + n.toFixed(2);
}

function discountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function stars(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function renderCategories() {
  const grid = document.getElementById("cat-grid");
  grid.innerHTML = SITE_CONFIG.categories.map((c, i) => `
    <div class="cat-card reveal-up" style="--i:${i}" data-cat="${c.id}" tabindex="0" role="button" aria-label="Browse ${c.name}">
      <img src="${c.image}" alt="${c.name}" loading="lazy">
      <div class="cat-info">
        <div class="cat-emoji">${c.emoji}</div>
        <div class="cat-name">${c.name}</div>
        <div class="cat-cta">Browse products →</div>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".cat-card").forEach((card) => {
    const go = () => {
      document.getElementById("store").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => setFilter(card.dataset.cat), 400);
    };
    card.addEventListener("click", go);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
  });

  initTiltEffect(grid.querySelectorAll(".cat-card"));
}

let currentFilter = "all";

function renderFilters() {
  const row = document.getElementById("filter-row");
  const cats = [{ id: "all", name: "All" }, ...SITE_CONFIG.categories];
  row.innerHTML = cats.map((c) => `
    <button class="filter-chip ${c.id === "all" ? "active" : ""}" data-filter="${c.id}">${c.name}</button>
  `).join("");
  row.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => setFilter(chip.dataset.filter));
  });
}

function setFilter(id) {
  currentFilter = id;
  document.querySelectorAll(".filter-chip").forEach((c) => {
    c.classList.toggle("active", c.dataset.filter === id);
  });
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  const list = SITE_CONFIG.products.filter(
    (p) => currentFilter === "all" || p.category === currentFilter
  );

  if (!list.length) {
    grid.innerHTML = `<div class="cart-empty" style="grid-column:1/-1">Tiada produk dalam kategori ini buat masa ini.</div>`;
    return;
  }

  grid.innerHTML = list.map((p) => {
    const pct = discountPercent(p.price, p.originalPrice);
    return `
    <article class="product-card reveal-up in-view" data-id="${p.id}">
      <div class="product-thumb">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="badge ${p.available ? "available" : "sold"}">${p.available ? "Available" : "Sold Out"}</span>
        ${pct ? `<span class="badge promo-badge">-${pct}%</span>` : ""}
      </div>
      <div class="product-body">
        <div class="product-cat">${p.categoryLabel}</div>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.description}</p>
        <div class="product-foot">
          <span class="price-block">
            <span class="product-price">${money(p.price)}</span>
            ${pct ? `<span class="product-price-original">${money(p.originalPrice)}</span>` : ""}
          </span>
          <span class="product-rating">${stars(p.rating)}</span>
        </div>
        <button class="buy-btn" data-id="${p.id}" ${p.available ? "" : "disabled"}>
          ${p.available ? "BUY NOW" : "SOLD OUT"}
        </button>
      </div>
    </article>
  `;
  }).join("");

  grid.querySelectorAll(".product-thumb, .product-name, .product-desc").forEach((el) => {
    el.addEventListener("click", () => openProductModal(el.closest(".product-card").dataset.id));
  });

  grid.querySelectorAll(".buy-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(btn.dataset.id);
    });
  });

  initTiltEffect(grid.querySelectorAll(".product-card"));
}

function renderFeedback() {
  const grid = document.getElementById("feedback-grid");
  const list = SITE_CONFIG.feedback;

  if (!list.length) {
    grid.innerHTML = `<div class="feedback-empty">Feedback pelanggan akan dipaparkan di sini sebaik seller upload screenshot sebenar.</div>`;
    return;
  }

  grid.innerHTML = list.map((f, i) => `
    <div class="feedback-item reveal-up" style="--i:${i}" data-img="${f.image}">
      <img src="${f.image}" alt="Feedback from ${f.username}" loading="lazy">
      <div class="feedback-meta">
        <strong>@${f.username}</strong> — ${f.product}
        <div class="stars">${stars(f.rating)}</div>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".feedback-item").forEach((item) => {
    item.addEventListener("click", () => openLightbox(item.dataset.img));
  });
}

function renderTrust() {
  document.getElementById("trust-grid").innerHTML = SITE_CONFIG.trust.map((t) => `
    <div class="trust-card reveal-up">
      <div class="trust-icon">${t.icon}</div>
      <h4>${t.title}</h4>
      <p>${t.detail}</p>
    </div>
  `).join("");
}

function renderTimeline() {
  document.getElementById("timeline").innerHTML = SITE_CONFIG.howToOrder.map((s) => `
    <div class="timeline-step reveal-up">
      <div class="timeline-num">${s.step}</div>
      <h3>${s.title}</h3>
      <p>${s.detail}</p>
    </div>
  `).join("");
}

function renderTikTok() {
  document.getElementById("tiktok-handle").textContent = SITE_CONFIG.contact.tiktok.username;
  document.getElementById("tiktok-follow").href = SITE_CONFIG.contact.tiktok.url;
  document.getElementById("tiktok-follow-2").href = SITE_CONFIG.contact.tiktok.url;
  document.getElementById("instagram-handle").textContent = SITE_CONFIG.contact.instagram.username;
  document.getElementById("instagram-follow").href = SITE_CONFIG.contact.instagram.url;
  document.getElementById("instagram-follow-2").href = SITE_CONFIG.contact.instagram.url;
}

function renderBrand() {
  document.querySelectorAll("[data-brand-name]").forEach((el) => el.textContent = SITE_CONFIG.brand.name);
  document.getElementById("hero-tagline").textContent = SITE_CONFIG.brand.tagline;
  document.getElementById("hero-sub").textContent = SITE_CONFIG.brand.subtitle;
  document.title = `${SITE_CONFIG.brand.name} — ${SITE_CONFIG.brand.tagline}`;
}

/* -------------------------------------------------------------------- */
/* 5. PRODUCT MODAL                                                      */
/* -------------------------------------------------------------------- */

function openProductModal(id) {
  const p = SITE_CONFIG.products.find((x) => x.id === id);
  if (!p) return;
  const overlay = document.getElementById("product-modal");
  overlay.querySelector(".modal-img").src = p.image;
  overlay.querySelector(".modal-img").alt = p.name;
  overlay.querySelector(".m-cat").textContent = p.categoryLabel;
  overlay.querySelector(".m-name").textContent = p.name;
  overlay.querySelector(".m-desc").textContent = p.description;
  overlay.querySelector(".m-price").textContent = money(p.price);
  const pct = discountPercent(p.price, p.originalPrice);
  const origEl = overlay.querySelector(".m-price-original");
  if (pct) {
    origEl.textContent = money(p.originalPrice);
    origEl.style.display = "inline";
  } else {
    origEl.style.display = "none";
  }
  overlay.querySelector(".m-rating").textContent = stars(p.rating);
  const buyBtn = overlay.querySelector(".m-buy");
  buyBtn.disabled = !p.available;
  buyBtn.textContent = p.available ? "ADD TO CART" : "SOLD OUT";
  buyBtn.onclick = () => { addToCart(p.id); closeProductModal(); };
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  document.getElementById("product-modal").classList.remove("open");
  document.body.style.overflow = "";
}

/* -------------------------------------------------------------------- */
/* 6. CART                                                               */
/* -------------------------------------------------------------------- */

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function addToCart(id) {
  const product = SITE_CONFIG.products.find((p) => p.id === id);
  if (!product || !product.available) return;
  const cart = getCart();
  const existing = cart.find((i) => i.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart(cart);
  showToast(`${product.name} ditambah ke troli`);
  openCart();
}

function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  const filtered = item.qty <= 0 ? cart.filter((i) => i.id !== id) : cart;
  saveCart(filtered);
}

function removeFromCart(id) {
  saveCart(getCart().filter((i) => i.id !== id));
}

function renderCart() {
  const cart = getCart();
  const itemsEl = document.getElementById("cart-items");
  const countEl = document.getElementById("cart-count");
  const totalEl = document.getElementById("cart-total");
  const totalCount = cart.reduce((s, i) => s + i.qty, 0);
  countEl.textContent = totalCount;
  countEl.style.display = totalCount ? "flex" : "none";

  if (!cart.length) {
    itemsEl.innerHTML = `<div class="cart-empty">Troli anda kosong.<br>Jom explore store 👀</div>`;
    totalEl.textContent = money(0);
    return;
  }

  let total = 0;
  itemsEl.innerHTML = cart.map((item) => {
    const p = SITE_CONFIG.products.find((x) => x.id === item.id);
    if (!p) return "";
    const lineTotal = p.price * item.qty;
    total += lineTotal;
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${money(lineTotal)}</div>
          <div class="qty-control">
            <button data-qty="-1" data-id="${p.id}" aria-label="Kurangkan kuantiti">–</button>
            <span>${item.qty}</span>
            <button data-qty="1" data-id="${p.id}" aria-label="Tambah kuantiti">+</button>
          </div>
        </div>
        <button class="remove-btn" data-remove="${p.id}">Remove</button>
      </div>
    `;
  }).join("");

  totalEl.textContent = money(total);

  itemsEl.querySelectorAll("[data-qty]").forEach((btn) => {
    btn.addEventListener("click", () => updateQty(btn.dataset.id, Number(btn.dataset.qty)));
  });
  itemsEl.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.remove));
  });
}

function openCart() {
  document.getElementById("cart-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  document.getElementById("cart-overlay").classList.remove("open");
  document.body.style.overflow = "";
}

function checkoutViaWhatsApp() {
  const cart = getCart();
  if (!cart.length) return;
  let total = 0;
  const lines = cart.map((item) => {
    const p = SITE_CONFIG.products.find((x) => x.id === item.id);
    if (!p) return "";
    total += p.price * item.qty;
    return `- ${p.name} x${item.qty} (${money(p.price * item.qty)})`;
  });
  const msg = [
    `Hi ${SITE_CONFIG.brand.name}, saya nak order:`,
    ...lines,
    ``,
    `Total: ${money(total)}`,
  ].join("\n");
  const url = `https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

/* -------------------------------------------------------------------- */
/* 7. FEEDBACK LIGHTBOX                                                  */
/* -------------------------------------------------------------------- */

function openLightbox(src) {
  const lb = document.getElementById("lightbox");
  lb.querySelector("img").src = src;
  lb.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("open");
  document.body.style.overflow = "";
}

/* -------------------------------------------------------------------- */
/* 8b. 3D TILT EFFECT (product / category cards)                        */
/* -------------------------------------------------------------------- */

function initTiltEffect(cards) {
  if (REDUCE_MOTION || IS_SMALL) return;
  cards.forEach((card) => {
    let raf = null;
    card.style.transformStyle = "preserve-3d";
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(900px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) translateY(-6px)`;
      });
    });
    card.addEventListener("mouseleave", () => {
      if (raf) cancelAnimationFrame(raf);
      card.style.transform = "";
    });
  });
}

/* -------------------------------------------------------------------- */
/* 8c. CURSOR GLOW TRAIL (hero only — adds cinematic weight)             */
/* -------------------------------------------------------------------- */

function initCursorGlow() {
  if (REDUCE_MOTION || IS_SMALL) return;
  const hero = document.getElementById("hero");
  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  hero.appendChild(glow);

  let tx = 0, ty = 0, cx = 0, cy = 0;
  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
  });

  function loop() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    glow.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  }
  loop();
}

/* -------------------------------------------------------------------- */
/* 8. MISC                                                               */
/* -------------------------------------------------------------------- */

function initMagneticButtons() {
  if (REDUCE_MOTION || IS_SMALL) return;
  document.querySelectorAll(".btn, .magnetic-btn").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.querySelector(".msg").textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2400);
}

function initWhatsAppLinks() {
  const url = `https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(SITE_CONFIG.contact.whatsappMessage)}`;
  document.querySelectorAll("[data-whatsapp-link]").forEach((el) => el.href = url);
  document.querySelectorAll("[data-telegram-link]").forEach((el) => el.href = SITE_CONFIG.contact.telegram);
}

/* -------------------------------------------------------------------- */
/* BOOT                                                                  */
/* -------------------------------------------------------------------- */

function initHeroText() {
  document.getElementById("hero-title").classList.add("reveal");
  setTimeout(() => document.getElementById("hero-title").classList.add("pulsing"), 900);
  setTimeout(() => document.getElementById("hero-tagline").classList.add("reveal"), 500);
  setTimeout(() => document.getElementById("hero-sub").classList.add("reveal"), 700);
  document.querySelectorAll(".hero-actions .btn").forEach((btn, i) => {
    setTimeout(() => btn.classList.add("reveal"), 900 + i * 100);
  });
}

/**
 * Pulls live content from Firebase (set up via firebase-config.js) so
 * admin changes show up for every visitor, not just one browser.
 * If Firebase isn't configured yet, everything below is skipped and
 * the site just uses the sample content already in config.js.
 */
function initLiveData() {
  if (typeof FIREBASE_IS_CONFIGURED === "undefined" || !FIREBASE_IS_CONFIGURED) return;

  db.collection("products").onSnapshot((snap) => {
    if (snap.empty) return; // nothing seeded yet — keep config.js sample products
    SITE_CONFIG.products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderProducts();
  }, (err) => console.warn("Products live-sync error:", err.message));

  db.collection("feedback").onSnapshot((snap) => {
    SITE_CONFIG.feedback = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderFeedback();
  }, (err) => console.warn("Feedback live-sync error:", err.message));

  db.collection("settings").doc("contact").onSnapshot((doc) => {
    if (!doc.exists) return;
    const data = doc.data();
    SITE_CONFIG.contact = {
      ...SITE_CONFIG.contact,
      ...data,
      tiktok: {
        username: data.tiktokUsername || SITE_CONFIG.contact.tiktok.username,
        url: data.tiktokUrl || SITE_CONFIG.contact.tiktok.url,
      },
      instagram: {
        username: data.instagramUsername || SITE_CONFIG.contact.instagram.username,
        url: data.instagramUrl || SITE_CONFIG.contact.instagram.url,
      },
    };
    renderTikTok();
    initWhatsAppLinks();
  }, (err) => console.warn("Settings live-sync error:", err.message));
}

document.addEventListener("DOMContentLoaded", () => {
  renderBrand();
  renderCategories();
  renderFilters();
  renderProducts();
  renderFeedback();
  renderTrust();
  renderTimeline();
  renderTikTok();
  renderCart();
  initWhatsAppLinks();
  initNav();
  initMagneticButtons();

  initParticles(document.getElementById("loader-canvas"), { density: 1 });
  initParticles(document.getElementById("hero-canvas"), { density: 1.6, mouseParallax: true });
  initCursorGlow();

  document.getElementById("year").textContent = new Date().getFullYear();
  initLiveData();

  // wire up static UI
  document.getElementById("cart-toggle").addEventListener("click", openCart);
  document.getElementById("cart-close").addEventListener("click", closeCart);
  document.getElementById("cart-overlay").addEventListener("click", (e) => {
    if (e.target.id === "cart-overlay") closeCart();
  });
  document.getElementById("checkout-btn").addEventListener("click", checkoutViaWhatsApp);

  document.getElementById("product-modal").addEventListener("click", (e) => {
    if (e.target.id === "product-modal") closeProductModal();
  });
  document.getElementById("modal-close").addEventListener("click", closeProductModal);

  document.getElementById("lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLightbox();
  });
  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeCart(); closeProductModal(); closeLightbox(); }
  });

  runLoader().then(() => {
    initHeroText();
    initScrollReveal();
    initHeroParallax();
  });
});
