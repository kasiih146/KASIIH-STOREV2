/**
 * KASIIH STORE — ADMIN PANEL (DEMO LEVEL)
 * ----------------------------------------
 * IMPORTANT: There is no server in this project, so this panel cannot
 * have real authentication or a real database. It stores an "overrides"
 * object in the browser's localStorage, and the storefront (app.js)
 * merges those overrides on top of config.js at load time.
 *
 * This means:
 *  - Changes only appear on the SAME browser/device you edited from.
 *  - The password below is checked in the browser, so anyone who reads
 *    the source can see or bypass it. It stops casual snooping, not a
 *    determined visitor.
 *  - For a real store, replace this file with a proper backend (e.g. a
 *    small API + database) and real authentication (e.g. Firebase Auth).
 *    The rendering logic in app.js can stay the same — only where the
 *    data comes from changes.
 */

const OVERRIDES_KEY = "kasiih_overrides_v1";
const ADMIN_PASS_KEY = "kasiih_admin_pass_v1";
const ADMIN_SESSION_KEY = "kasiih_admin_session_v1";
const DEFAULT_PASSWORD = "kasiih2026";

function getOverrides() {
  try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY)) || {}; }
  catch { return {}; }
}

function saveOverrides(ov) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(ov));
}

function getPassword() {
  return localStorage.getItem(ADMIN_PASS_KEY) || DEFAULT_PASSWORD;
}

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ---------------------------------------------------------------- */
/* AUTH GATE                                                          */
/* ---------------------------------------------------------------- */

function checkAuth() {
  const loggedIn = sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  document.getElementById("login-screen").style.display = loggedIn ? "none" : "flex";
  document.getElementById("admin-app").style.display = loggedIn ? "block" : "none";
  if (loggedIn) boot();
}

function initLogin() {
  const form = document.getElementById("login-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("login-pass").value;
    const err = document.getElementById("login-error");
    if (input === getPassword()) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      err.style.display = "none";
      checkAuth();
    } else {
      err.style.display = "block";
    }
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    checkAuth();
  });
}

/* ---------------------------------------------------------------- */
/* DATA MERGE (config.js + overrides)                                 */
/* ---------------------------------------------------------------- */

function currentProducts() {
  const ov = getOverrides();
  return ov.products || SITE_CONFIG.products;
}

function currentFeedback() {
  const ov = getOverrides();
  return ov.feedback || SITE_CONFIG.feedback;
}

function currentContact() {
  const ov = getOverrides();
  return { ...SITE_CONFIG.contact, ...(ov.contact || {}) };
}

/* ---------------------------------------------------------------- */
/* PRODUCTS TAB                                                        */
/* ---------------------------------------------------------------- */

function renderAdminProducts() {
  const list = currentProducts();
  const table = document.getElementById("product-table-body");
  table.innerHTML = list.map((p) => `
    <tr>
      <td><img src="${p.image}" class="thumb" alt=""></td>
      <td>${p.name}<div class="muted">${p.categoryLabel}</div></td>
      <td>RM${p.price.toFixed(2)}</td>
      <td>${p.available ? '<span class="tag ok">Available</span>' : '<span class="tag no">Sold Out</span>'}</td>
      <td>
        <button class="mini-btn" data-edit="${p.id}">Edit</button>
        <button class="mini-btn danger" data-del="${p.id}">Delete</button>
      </td>
    </tr>
  `).join("");

  table.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => openProductForm(b.dataset.edit)));
  table.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => deleteProduct(b.dataset.del)));
}

function openProductForm(id) {
  const form = document.getElementById("product-form");
  form.reset();
  document.getElementById("product-form-title").textContent = id ? "Edit Product" : "Add Product";
  form.dataset.editing = id || "";

  const catSelect = form.querySelector("[name=category]");
  catSelect.innerHTML = SITE_CONFIG.categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");

  if (id) {
    const p = currentProducts().find((x) => x.id === id);
    form.name.value = p.name;
    form.category.value = p.category;
    form.description.value = p.description;
    form.price.value = p.price;
    form.rating.value = p.rating;
    form.available.checked = p.available;
    form.image.value = p.image;
  }
  document.getElementById("product-modal-admin").classList.add("open");
}

function closeProductForm() {
  document.getElementById("product-modal-admin").classList.remove("open");
}

async function submitProductForm(e) {
  e.preventDefault();
  const form = e.target;
  const editingId = form.dataset.editing;
  const cat = SITE_CONFIG.categories.find((c) => c.id === form.category.value);

  let image = form.image.value.trim();
  const file = form.imageFile.files[0];
  if (file) image = await fileToDataUrl(file);
  if (!image) image = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80";

  const product = {
    id: editingId || slugify(form.name.value) + "-" + Date.now().toString(36),
    name: form.name.value.trim(),
    category: form.category.value,
    categoryLabel: cat ? cat.name : form.category.value,
    description: form.description.value.trim(),
    price: parseFloat(form.price.value) || 0,
    rating: parseInt(form.rating.value) || 5,
    available: form.available.checked,
    image,
  };

  const list = [...currentProducts()];
  const idx = list.findIndex((p) => p.id === editingId);
  if (idx > -1) list[idx] = product; else list.push(product);

  const ov = getOverrides();
  ov.products = list;
  saveOverrides(ov);

  closeProductForm();
  renderAdminProducts();
  flash("Product saved.");
}

function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  const list = currentProducts().filter((p) => p.id !== id);
  const ov = getOverrides();
  ov.products = list;
  saveOverrides(ov);
  renderAdminProducts();
  flash("Product deleted.");
}

/* ---------------------------------------------------------------- */
/* FEEDBACK TAB                                                        */
/* ---------------------------------------------------------------- */

function renderAdminFeedback() {
  const list = currentFeedback();
  const table = document.getElementById("feedback-table-body");
  if (!list.length) {
    table.innerHTML = `<tr><td colspan="4" class="muted">Belum ada feedback. Upload screenshot sebenar pelanggan.</td></tr>`;
    return;
  }
  table.innerHTML = list.map((f, i) => `
    <tr>
      <td><img src="${f.image}" class="thumb" alt=""></td>
      <td>@${f.username}</td>
      <td>${f.product}<div class="muted">${"★".repeat(f.rating)}</div></td>
      <td><button class="mini-btn danger" data-del-fb="${i}">Delete</button></td>
    </tr>
  `).join("");
  table.querySelectorAll("[data-del-fb]").forEach((b) => b.addEventListener("click", () => deleteFeedback(Number(b.dataset.delFb))));
}

function openFeedbackForm() {
  document.getElementById("feedback-form").reset();
  document.getElementById("feedback-modal-admin").classList.add("open");
}

function closeFeedbackForm() {
  document.getElementById("feedback-modal-admin").classList.remove("open");
}

async function submitFeedbackForm(e) {
  e.preventDefault();
  const form = e.target;
  const file = form.imageFile.files[0];
  if (!file) { alert("Sila pilih screenshot untuk upload."); return; }
  const image = await fileToDataUrl(file);

  const entry = {
    username: form.username.value.trim(),
    product: form.product.value.trim(),
    rating: parseInt(form.rating.value) || 5,
    image,
  };

  const list = [...currentFeedback(), entry];
  const ov = getOverrides();
  ov.feedback = list;
  saveOverrides(ov);

  closeFeedbackForm();
  renderAdminFeedback();
  flash("Feedback added.");
}

function deleteFeedback(index) {
  if (!confirm("Delete this feedback?")) return;
  const list = currentFeedback().filter((_, i) => i !== index);
  const ov = getOverrides();
  ov.feedback = list;
  saveOverrides(ov);
  renderAdminFeedback();
  flash("Feedback deleted.");
}

/* ---------------------------------------------------------------- */
/* SETTINGS TAB                                                        */
/* ---------------------------------------------------------------- */

function renderSettings() {
  const c = currentContact();
  const form = document.getElementById("settings-form");
  form.whatsapp.value = c.whatsapp;
  form.whatsappMessage.value = c.whatsappMessage;
  form.telegram.value = c.telegram;
  form.tiktokUsername.value = c.tiktok.username;
  form.tiktokUrl.value = c.tiktok.url;
}

function submitSettingsForm(e) {
  e.preventDefault();
  const form = e.target;
  const ov = getOverrides();
  ov.contact = {
    whatsapp: form.whatsapp.value.trim(),
    whatsappMessage: form.whatsappMessage.value.trim(),
    telegram: form.telegram.value.trim(),
    tiktok: {
      username: form.tiktokUsername.value.trim(),
      url: form.tiktokUrl.value.trim(),
    },
  };
  saveOverrides(ov);
  flash("Settings saved.");
}

function changePassword(e) {
  e.preventDefault();
  const form = e.target;
  const val = form.newPassword.value.trim();
  if (val.length < 4) { alert("Password sekurang-kurangnya 4 aksara."); return; }
  localStorage.setItem(ADMIN_PASS_KEY, val);
  form.reset();
  flash("Password updated for this browser.");
}

/* ---------------------------------------------------------------- */
/* MISC                                                                */
/* ---------------------------------------------------------------- */

function flash(msg) {
  const toast = document.getElementById("admin-toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(flash._t);
  flash._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

function resetOverrides() {
  if (!confirm("Reset semua perubahan admin dan guna semula default dari config.js?")) return;
  localStorage.removeItem(OVERRIDES_KEY);
  renderAdminProducts();
  renderAdminFeedback();
  renderSettings();
  flash("Reset done.");
}

function initTabs() {
  document.querySelectorAll(".admin-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".admin-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });
}

function boot() {
  renderAdminProducts();
  renderAdminFeedback();
  renderSettings();
  initTabs();

  document.getElementById("add-product-btn").addEventListener("click", () => openProductForm(null));
  document.getElementById("product-form").addEventListener("submit", submitProductForm);
  document.getElementById("product-modal-close").addEventListener("click", closeProductForm);

  document.getElementById("add-feedback-btn").addEventListener("click", openFeedbackForm);
  document.getElementById("feedback-form").addEventListener("submit", submitFeedbackForm);
  document.getElementById("feedback-modal-close").addEventListener("click", closeFeedbackForm);

  document.getElementById("settings-form").addEventListener("submit", submitSettingsForm);
  document.getElementById("password-form").addEventListener("submit", changePassword);
  document.getElementById("reset-btn").addEventListener("click", resetOverrides);
}

document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  checkAuth();
});
