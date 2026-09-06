/**
 * KASIIH STORE — SITE CONFIGURATION
 * ----------------------------------
 * Edit everything here. Nothing else in the codebase needs to change
 * when you update contact info, prices, products or feedback.
 *
 * NOTE ON THE ADMIN PANEL (admin.html):
 * This project has no server, so the admin panel writes to the
 * browser's localStorage, not to this file. That's fine for trying
 * things out, but it means changes only show on the device/browser
 * you edited from. To make a change permanent for every visitor,
 * edit the values below and re-upload the site.
 */

const SITE_CONFIG = {
  brand: {
    name: "KaSiih Store",
    tagline: "Your Digital Gaming Store",
    subtitle: "Game Accounts • Diamonds • Top Up • Digital Products",
  },

  contact: {
    whatsapp: "60123456789",           // digits only, country code first, no + or spaces
    whatsappMessage: "Hi KaSiih Store, saya berminat nak order.",
    telegram: "https://t.me/kasiihstore",
    tiktok: {
      username: "@kasiihstore",
      url: "https://www.tiktok.com/@kasiihstore",
    },
  },

  payment: {
    methods: [
      { label: "DuitNow / Bank Transfer", detail: "Maybank 1234 5678 9012 — KASIIH STORE" },
      { label: "Touch 'n Go eWallet", detail: "011-2345 6789" },
    ],
    note: "Order akan disahkan melalui WhatsApp sebelum pembayaran. Sila jangan buat pembayaran sebelum stok/harga disahkan oleh seller.",
  },

  categories: [
    { id: "freefire", name: "Free Fire", emoji: "🔥", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
    { id: "mlbb", name: "Mobile Legends", emoji: "⚔️", image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80" },
    { id: "roblox", name: "Roblox", emoji: "🧱", image: "https://images.unsplash.com/photo-1616499452576-3e0a389bfe12?w=800&q=80" },
    { id: "accounts", name: "Game Accounts", emoji: "🎮", image: "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=800&q=80" },
    { id: "diamonds", name: "Diamonds / Top Up", emoji: "💎", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" },
    { id: "digital", name: "Digital Products", emoji: "🛍️", image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80" },
  ],

  products: [
    {
      id: "ff-diamond-100",
      name: "Free Fire Diamonds 100",
      category: "freefire",
      categoryLabel: "Free Fire",
      description: "Top up terus ke ID game anda. Proses laju, tiada perlu login akaun.",
      price: 5.00,
      rating: 5,
      available: true,
      image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80",
    },
    {
      id: "ff-diamond-520",
      name: "Free Fire Diamonds 520",
      category: "freefire",
      categoryLabel: "Free Fire",
      description: "Pilihan popular untuk event dan bundle terkini.",
      price: 24.00,
      rating: 5,
      available: true,
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    },
    {
      id: "mlbb-diamond-278",
      name: "Mobile Legends Diamonds 278",
      category: "mlbb",
      categoryLabel: "Mobile Legends",
      description: "Top up rasmi, sesuai untuk beli skin baharu.",
      price: 22.00,
      rating: 4,
      available: true,
      image: "https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?w=800&q=80",
    },
    {
      id: "mlbb-account-mythic",
      name: "MLBB Account — Mythic Glory",
      category: "mlbb",
      categoryLabel: "Mobile Legends",
      description: "60+ hero, 20+ skin epic/legend, rank Mythic Glory season lepas.",
      price: 180.00,
      rating: 5,
      available: false,
      image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80",
    },
    {
      id: "roblox-robux-800",
      name: "Roblox Robux 800",
      category: "roblox",
      categoryLabel: "Roblox",
      description: "Robux masuk terus melalui gamepass, selamat dan sah.",
      price: 32.00,
      rating: 4,
      available: true,
      image: "https://images.unsplash.com/photo-1616499452576-3e0a389bfe12?w=800&q=80",
    },
    {
      id: "netflix-1month",
      name: "Netflix Premium 1 Bulan",
      category: "digital",
      categoryLabel: "Digital Products",
      description: "Sharing profile 4K UHD, jaminan 30 hari.",
      price: 15.00,
      rating: 5,
      available: true,
      image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80",
    },
  ],

  // Set to [] and nothing will render — never invent fake feedback here.
  // Add real screenshots as { username, product, rating, image } objects.
  feedback: [
    // { username: "aiman_ff", product: "Free Fire Diamonds 520", rating: 5, image: "/uploads/feedback1.jpg" },
  ],

  howToOrder: [
    { step: "01", title: "Choose Product", detail: "Pilih produk yang anda mahu dari Store." },
    { step: "02", title: "Place Order", detail: "Hantar mesej WhatsApp/Telegram dengan butiran order." },
    { step: "03", title: "Make Payment", detail: "Buat pembayaran mengikut kaedah yang disahkan seller." },
    { step: "04", title: "Receive Product", detail: "Produk/akaun dihantar sebaik pembayaran disahkan." },
  ],

  trust: [
    { icon: "⚡", title: "Fast Response", detail: "Fast customer support" },
    { icon: "🔒", title: "Secure Order", detail: "Order process yang jelas dan selamat" },
    { icon: "💬", title: "Customer Support", detail: "Hubungi kami jika memerlukan bantuan" },
    { icon: "⭐", title: "Real Feedback", detail: "Lihat pengalaman pelanggan sebenar" },
  ],
};
