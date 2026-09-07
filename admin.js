/**
 * KASIIH STORE — ADMIN PANEL (FIREBASE VERSION)
 * ------------------------------------------------
 * Products, feedback and contact settings are stored in Firestore.
 * Every visitor's storefront listens to the same data live (see
 * initLiveData() in app.js), so a save here shows up for everyone —
 * no editing config.js or redeploying required.
 *
 * Login uses Firebase Authentication (Email/Password). Create the
 * admin account once from the Firebase console: Authentication → Users
 * → Add user. There's no signup form here on purpose — this panel is
 * for the shop owner only.
 *
 * See firebase-config.js and README.md for one-time setup.
 */

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * Reads an image file, shrinks it, and returns a compressed JPEG data
 * URL — small enough to store directly in a Firestore document field
 * (limit is ~1MB per document) without needing a paid Storage bucket.
 */
function compressImageFile(file, { maxWidth = 900, quality = 0.75 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Resolves the image for a form: prefers an uploaded file (compressed),
 * falls back to a pasted URL, falls back to whatever was there before
 * (so editing a product without touching the image keeps it unchanged).
 */
async function resolveImage(fileInput, urlInput, existing) {
  const file = fileInput.files[0];
  if (file) return compressImageFile(file);
  if (urlInput.value.trim()) return urlInput.value.trim();
  return existing || "";
}

/* ---------------------------------------------------------------- */
/* SETUP / AUTH GATE                                                   */
/* ---------------------------------------------------------------- */

function showSetupNotice() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("admin-app").style.display = "none";
  document.getElementById("setup-notice").style.display = "flex";
}

function initLogin() {
  const form = document.getElementById("login-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-pass").value;
    const err = document.getElementById("login-error");
    err.style.display = "none";

    auth.signInWithEmailAndPassword(email, pass).catch((error) => {
      err.textContent = friendlyAuthError(error.code);
      err.style.display = "block";
    });
  });

  document.getElementById("logout-btn").addEventListener("click", () => auth.signOut());
}

function friendlyAuthError(code) {
  switch (code) {
    case "auth/invalid-email": return "Email tidak sah.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential": return "Email atau password salah.";
    case "auth/too-many-requests": return "Terlalu banyak percubaan. Cuba lagi sekejap.";
    default: return "Login gagal: " + code;
  }
}

/* ---------------------------------------------------------------- */
/* PRODUCTS TAB                                                        */
/* ---------------------------------------------------------------- */

let productsCache = [];

function watchProducts() {
  db.collection("products").onSnapshot((snap) => {
    productsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderAdminProducts();
  }, (err) => flash("Ralat memuat produk: " + err.message));
}

function renderAdminProducts() {
  const table = document.getElementById("product-table-body");
  if (!productsCache.length) {
    table.innerHTML = `<tr><td colspan="5" class="muted">Tiada produk lagi. Klik "+ Add Product", atau "Seed Sample Data" di tab Settings untuk mula dengan produk contoh.</td></tr>`;
    return;
  }
  table.innerHTML = productsCache.map((p) => {
    const hasPromo = p.originalPrice && p.originalPrice > p.price;
    const priceCell = hasPromo
      ? `RM${Number(p.price).toFixed(2)} <span class="muted" style="text-decoration:line-through">RM${Number(p.originalPrice).toFixed(2)}</span>`
      : `RM${Number(p.price).toFixed(2)}`;
    return `
    <tr>
      <td><img src="${p.image}" class="thumb" alt=""></td>
      <td>${p.name}<div class="muted">${p.categoryLabel}</div></td>
      <td>${priceCell}</td>
      <td>${p.available ? '<span class="tag ok">Available</span>' : '<span class="tag no">Sold Out</span>'}${hasPromo ? ` <span class="tag promo">Promo</span>` : ""}</td>
      <td>
        <button class="mini-btn" data-edit="${p.id}">Edit</button>
        <button class="mini-btn danger" data-del="${p.id}">Delete</button>
      </td>
    </tr>
  `;
  }).join("");

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
    const p = productsCache.find((x) => x.id === id);
    form.name.value = p.name;
    form.category.value = p.category;
    form.description.value = p.description;
    form.price.value = p.price;
    form.originalPrice.value = p.originalPrice || "";
    form.rating.value = p.rating;
    form.available.checked = p.available;
    form.image.value = p.image;
    form.dataset.existingImage = p.image;
  } else {
    form.dataset.existingImage = "";
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
  const price = parseFloat(form.price.value) || 0;
  const originalPrice = parseFloat(form.originalPrice.value) || 0;

  if (originalPrice && originalPrice <= price) {
    alert("Original price (harga sebelum promo) mesti lebih tinggi daripada harga jualan.");
    return;
  }

  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  submitBtn.textContent = "Uploading...";

  let image;
  try {
    image = await resolveImage(form.imageFile, form.image, form.dataset.existingImage);
  } catch (err) {
    flash("Gagal proses gambar: " + err.message);
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Product";
    return;
  }
  if (!image) image = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80";

  const product = {
    name: form.name.value.trim(),
    category: form.category.value,
    categoryLabel: cat ? cat.name : form.category.value,
    description: form.description.value.trim(),
    price,
    originalPrice: originalPrice || null,
    rating: parseInt(form.rating.value) || 5,
    available: form.available.checked,
    image,
  };

  const id = editingId || slugify(form.name.value) + "-" + Date.now().toString(36);

  try {
    await db.collection("products").doc(id).set(product);
    closeProductForm();
    flash("Product saved.");
  } catch (err) {
    flash("Gagal simpan: " + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Product";
  }
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  try {
    await db.collection("products").doc(id).delete();
    flash("Product deleted.");
  } catch (err) {
    flash("Gagal padam: " + err.message);
  }
}

/* ---------------------------------------------------------------- */
/* FEEDBACK TAB                                                        */
/* ---------------------------------------------------------------- */

let feedbackCache = [];

function watchFeedback() {
  db.collection("feedback").onSnapshot((snap) => {
    feedbackCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderAdminFeedback();
  }, (err) => flash("Ralat memuat feedback: " + err.message));
}

function renderAdminFeedback() {
  const table = document.getElementById("feedback-table-body");
  if (!feedbackCache.length) {
    table.innerHTML = `<tr><td colspan="4" class="muted">Belum ada feedback. Upload screenshot sebenar pelanggan sahaja.</td></tr>`;
    return;
  }
  table.innerHTML = feedbackCache.map((f) => `
    <tr>
      <td><img src="${f.image}" class="thumb" alt=""></td>
      <td>@${f.username}</td>
      <td>${f.product}<div class="muted">${"★".repeat(f.rating)}</div></td>
      <td><button class="mini-btn danger" data-del-fb="${f.id}">Delete</button></td>
    </tr>
  `).join("");
  table.querySelectorAll("[data-del-fb]").forEach((b) => b.addEventListener("click", () => deleteFeedback(b.dataset.delFb)));
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
  const submitBtn = form.querySelector("button[type=submit]");

  let image;
  const file = form.imageFile.files[0];
  if (file) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading...";
    try {
      image = await compressImageFile(file, { maxWidth: 700, quality: 0.7 });
    } catch (err) {
      flash("Gagal proses gambar: " + err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Feedback";
      return;
    }
  } else if (form.image.value.trim()) {
    image = form.image.value.trim();
  } else {
    alert("Sila upload screenshot atau masukkan link gambar.");
    return;
  }

  const entry = {
    username: form.username.value.trim(),
    product: form.product.value.trim(),
    rating: parseInt(form.rating.value) || 5,
    image,
  };

  try {
    await db.collection("feedback").add(entry);
    closeFeedbackForm();
    flash("Feedback added.");
  } catch (err) {
    flash("Gagal simpan: " + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Feedback";
  }
}

async function deleteFeedback(id) {
  if (!confirm("Delete this feedback?")) return;
  try {
    await db.collection("feedback").doc(id).delete();
    flash("Feedback deleted.");
  } catch (err) {
    flash("Gagal padam: " + err.message);
  }
}

/* ---------------------------------------------------------------- */
/* SETTINGS TAB                                                        */
/* ---------------------------------------------------------------- */

function watchSettings() {
  db.collection("settings").doc("contact").onSnapshot((doc) => {
    const c = doc.exists ? doc.data() : {
      whatsapp: SITE_CONFIG.contact.whatsapp,
      whatsappMessage: SITE_CONFIG.contact.whatsappMessage,
      telegram: SITE_CONFIG.contact.telegram,
      tiktokUsername: SITE_CONFIG.contact.tiktok.username,
      tiktokUrl: SITE_CONFIG.contact.tiktok.url,
      instagramUsername: SITE_CONFIG.contact.instagram.username,
      instagramUrl: SITE_CONFIG.contact.instagram.url,
    };
    const form = document.getElementById("settings-form");
    form.whatsapp.value = c.whatsapp || "";
    form.whatsappMessage.value = c.whatsappMessage || "";
    form.telegram.value = c.telegram || "";
    form.tiktokUsername.value = c.tiktokUsername || "";
    form.tiktokUrl.value = c.tiktokUrl || "";
    form.instagramUsername.value = c.instagramUsername || "";
    form.instagramUrl.value = c.instagramUrl || "";
  }, (err) => flash("Ralat memuat settings: " + err.message));
}

async function submitSettingsForm(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    whatsapp: form.whatsapp.value.trim(),
    whatsappMessage: form.whatsappMessage.value.trim(),
    telegram: form.telegram.value.trim(),
    tiktokUsername: form.tiktokUsername.value.trim(),
    tiktokUrl: form.tiktokUrl.value.trim(),
    instagramUsername: form.instagramUsername.value.trim(),
    instagramUrl: form.instagramUrl.value.trim(),
  };
  try {
    await db.collection("settings").doc("contact").set(data);
    flash("Settings saved.");
  } catch (err) {
    flash("Gagal simpan: " + err.message);
  }
}

/* ---------------------------------------------------------------- */
/* SEED SAMPLE DATA (first-time convenience)                          */
/* ---------------------------------------------------------------- */

async function seedSampleData() {
  if (!confirm("Ini akan tambah produk contoh dari config.js ke database. Teruskan?")) return;
  try {
    const batch = db.batch();
    SITE_CONFIG.products.forEach((p) => {
      const { id, ...rest } = p;
      batch.set(db.collection("products").doc(id), rest);
    });
    batch.set(db.collection("settings").doc("contact"), {
      whatsapp: SITE_CONFIG.contact.whatsapp,
      whatsappMessage: SITE_CONFIG.contact.whatsappMessage,
      telegram: SITE_CONFIG.contact.telegram,
      tiktokUsername: SITE_CONFIG.contact.tiktok.username,
      tiktokUrl: SITE_CONFIG.contact.tiktok.url,
      instagramUsername: SITE_CONFIG.contact.instagram.username,
      instagramUrl: SITE_CONFIG.contact.instagram.url,
    });
    await batch.commit();
    flash("Sample data loaded.");
  } catch (err) {
    flash("Gagal seed: " + err.message);
  }
}

/* ---------------------------------------------------------------- */
/* MISC                                                                */
/* ---------------------------------------------------------------- */

function flash(msg) {
  const toast = document.getElementById("admin-toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(flash._t);
  flash._t = setTimeout(() => toast.classList.remove("show"), 2800);
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
  watchProducts();
  watchFeedback();
  watchSettings();
  initTabs();

  document.getElementById("add-product-btn").addEventListener("click", () => openProductForm(null));
  document.getElementById("product-form").addEventListener("submit", submitProductForm);
  document.getElementById("product-modal-close").addEventListener("click", closeProductForm);

  document.getElementById("add-feedback-btn").addEventListener("click", openFeedbackForm);
  document.getElementById("feedback-form").addEventListener("submit", submitFeedbackForm);
  document.getElementById("feedback-modal-close").addEventListener("click", closeFeedbackForm);

  document.getElementById("settings-form").addEventListener("submit", submitSettingsForm);
  document.getElementById("seed-btn").addEventListener("click", seedSampleData);
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof FIREBASE_IS_CONFIGURED === "undefined" || !FIREBASE_IS_CONFIGURED) {
    showSetupNotice();
    return;
  }

  initLogin();

  auth.onAuthStateChanged((user) => {
    const loggedIn = !!user;
    document.getElementById("login-screen").style.display = loggedIn ? "none" : "flex";
    document.getElementById("admin-app").style.display = loggedIn ? "block" : "none";
    document.getElementById("admin-email").textContent = user ? user.email : "";
    if (loggedIn) boot();
  });
});
