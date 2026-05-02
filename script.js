const STORE_LINKS = {
  appStore: "",
  googlePlay: ""
};

const copy = {
  en: {
    heroEyebrow: "For Deen, Dunia & Akhira",
    heroLead:
      "A Bangladesh-ready Islamic companion for everyday salah, Quran, Hadith, Qibla, BDT Zakat, Ramadan, duas, and remembrance.",
    appStoreKicker: "Download on the",
    playStoreKicker: "Get it on",
    featuresLabel: "Inside the app",
    featuresTitle: "Everything essential, gathered in one place.",
    featurePrayerTitle: "Prayer Times & Adhan",
    featurePrayerText: "Location-aware salah times and reminders for Fajr through Isha.",
    featureQiblaTitle: "Qibla Direction",
    featureQiblaText: "A simple compass experience for finding the direction of the Kaaba.",
    featureQuranTitle: "Quran in Arabic, English & Bangla",
    featureQuranText: "Read the Quran with translations for Bengali and international audiences.",
    featureHadithTitle: "Hadith in Arabic, English & Bangla",
    featureHadithText: "Hadith collections presented for learning, reflection, and Bengali readers.",
    featureZakatTitle: "Zakat Calculator in BDT",
    featureZakatText: "Calculate zakat using Bangladeshi Taka across cash, gold, savings, and liabilities.",
    featureDuaTitle: "Duas & Remembrance",
    featureDuaText: "Daily adhkar and supplications for morning, evening, travel, family, and more.",
    bangladeshLabel: "Built for Bangladesh",
    bangladeshTitle: "Bangla-first worship tools for daily Muslim life.",
    bangladeshText:
      "Wasilah focuses on what Muslims in Bangladesh search for every day: accurate salah support, Adhan reminders, Qibla direction, Bangla Quran and Hadith access, Ramadan routines, duas, Hijri dates, and Zakat calculation in Bangladeshi Taka.",
    bdPrayerTitle: "Prayer Times Bangladesh",
    bdPrayerText:
      "Support for local salah schedules across Dhaka, Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, Mymensingh, and more.",
    bdBanglaTitle: "Bangla Islamic Learning",
    bdBanglaText:
      "Arabic source text with English and Bangla access for Quran, Hadith, duas, and everyday Islamic guidance.",
    bdZakatTitle: "BDT Zakat Calculator",
    bdZakatText:
      "Calculate Zakat in Bangladeshi Taka with common local asset categories, liabilities, gold, silver, savings, and business wealth.",
    spiritualLabel: "A quiet reminder",
    spiritualTitle: "Technology should make worship easier, not noisier.",
    spiritualText:
      "Wasilah is designed to support simple daily consistency: pray on time, return to the Quran, learn from Hadith, give with intention, and keep Allah in remembrance.",
    faqLabel: "Questions",
    faqTitle: "Wasilah Bangladesh FAQ",
    faqBangladeshQuestion: "Is Wasilah made for Muslims in Bangladesh?",
    faqBangladeshAnswer:
      "Yes. Wasilah is designed around Bangla support, BDT Zakat, local prayer needs, Qibla, Quran, Hadith, duas, and daily remembrance.",
    faqLanguagesQuestion: "Does Wasilah include Quran and Hadith in Bangla?",
    faqLanguagesAnswer:
      "Wasilah brings Arabic, English, and Bangla access together so Bengali-speaking Muslims can learn and reflect in one place.",
    faqZakatQuestion: "Can Wasilah calculate Zakat in BDT?",
    faqZakatAnswer:
      "Yes. The Zakat calculator is built around Bangladeshi Taka for cash, gold, savings, business assets, and liabilities.",
    footerText: "Deen, Dunia & Akhira."
  },
  bn: {
    heroEyebrow: "দীন, দুনিয়া ও আখিরাতের জন্য",
    heroLead:
      "সালাহ, কুরআন, হাদিস, কিবলা, যাকাত ও দৈনন্দিন যিকিরের জন্য একটি শান্ত ইসলামিক সহচর। দৈনন্দিন ইবাদতের জন্য তৈরি, বিশ্ব উম্মাহর জন্য উন্মুক্ত।",
    appStoreKicker: "ডাউনলোড করুন",
    playStoreKicker: "পাওয়া যাবে",
    featuresLabel: "অ্যাপের ভেতরে",
    featuresTitle: "প্রয়োজনীয় সবকিছু এক জায়গায়।",
    featurePrayerTitle: "নামাজের সময় ও আযান",
    featurePrayerText: "ফজর থেকে এশা পর্যন্ত লোকেশনভিত্তিক সালাহ সময় ও রিমাইন্ডার।",
    featureQiblaTitle: "কিবলার দিক",
    featureQiblaText: "কাবার দিক খুঁজে পাওয়ার জন্য সহজ কম্পাস অভিজ্ঞতা।",
    featureQuranTitle: "আরবি, ইংরেজি ও বাংলায় কুরআন",
    featureQuranText: "বাংলাভাষী ও আন্তর্জাতিক পাঠকের জন্য অনুবাদসহ কুরআন পড়ুন।",
    featureHadithTitle: "আরবি, ইংরেজি ও বাংলায় হাদিস",
    featureHadithText: "শেখা, চিন্তা ও বাংলাভাষী পাঠকের জন্য হাদিস সংগ্রহ।",
    featureZakatTitle: "BDT যাকাত ক্যালকুলেটর",
    featureZakatText: "নগদ, সোনা, সঞ্চয় ও দায় বিবেচনায় বাংলাদেশি টাকায় যাকাত হিসাব করুন।",
    featureDuaTitle: "দুয়া ও যিকির",
    featureDuaText: "সকাল, সন্ধ্যা, সফর, পরিবারসহ নানা উপলক্ষের দৈনন্দিন আযকার ও দুয়া।",
    bangladeshLabel: "বাংলাদেশের জন্য",
    bangladeshTitle: "দৈনন্দিন মুসলিম জীবনের জন্য বাংলা-প্রথম ইবাদত টুলস।",
    bangladeshText:
      "বাংলাদেশের মুসলিমরা প্রতিদিন যা খোঁজেন, ওয়াসিলাহ সেগুলোতেই মনোযোগ দেয়: নামাজের সহায়তা, আযান রিমাইন্ডার, কিবলার দিক, বাংলা কুরআন ও হাদিস, রমাদান রুটিন, দুয়া, হিজরি তারিখ এবং বাংলাদেশি টাকায় যাকাত হিসাব।",
    bdPrayerTitle: "বাংলাদেশের নামাজের সময়",
    bdPrayerText:
      "ঢাকা, চট্টগ্রাম, সিলেট, রাজশাহী, খুলনা, বরিশাল, রংপুর, ময়মনসিংহসহ সারা দেশের স্থানীয় সালাহ সময়ের সহায়তা।",
    bdBanglaTitle: "বাংলা ইসলামিক শিক্ষা",
    bdBanglaText:
      "কুরআন, হাদিস, দুয়া ও দৈনন্দিন ইসলামিক নির্দেশনার জন্য আরবি মূল পাঠের সঙ্গে ইংরেজি ও বাংলা অ্যাক্সেস।",
    bdZakatTitle: "BDT যাকাত ক্যালকুলেটর",
    bdZakatText:
      "নগদ, সোনা, রুপা, সঞ্চয়, ব্যবসায়িক সম্পদ ও দায় বিবেচনায় বাংলাদেশি টাকায় যাকাত হিসাব করুন।",
    spiritualLabel: "একটি নীরব স্মরণ",
    spiritualTitle: "টেকনোলজি ইবাদতকে সহজ করুক, ব্যস্ত নয়।",
    spiritualText:
      "ওয়াসিলাহ দৈনন্দিন ধারাবাহিকতায় সহায়তা করার জন্য তৈরি: সময়মতো নামাজ, কুরআনে ফেরা, হাদিস থেকে শেখা, নিয়তসহ দান এবং আল্লাহর স্মরণ।",
    faqLabel: "প্রশ্ন",
    faqTitle: "ওয়াসিলাহ বাংলাদেশ FAQ",
    faqBangladeshQuestion: "ওয়াসিলাহ কি বাংলাদেশের মুসলিমদের জন্য তৈরি?",
    faqBangladeshAnswer:
      "হ্যাঁ। বাংলা সাপোর্ট, BDT যাকাত, স্থানীয় নামাজের প্রয়োজন, কিবলা, কুরআন, হাদিস, দুয়া ও দৈনন্দিন যিকিরকে কেন্দ্র করে ওয়াসিলাহ তৈরি।",
    faqLanguagesQuestion: "ওয়াসিলাহতে কি বাংলা কুরআন ও হাদিস থাকবে?",
    faqLanguagesAnswer:
      "ওয়াসিলাহ আরবি, ইংরেজি ও বাংলা অ্যাক্সেস একত্র করে, যাতে বাংলাভাষী মুসলিমরা এক জায়গায় শিখতে ও চিন্তা করতে পারেন।",
    faqZakatQuestion: "ওয়াসিলাহ কি BDT-তে যাকাত হিসাব করতে পারে?",
    faqZakatAnswer:
      "হ্যাঁ। নগদ, সোনা, সঞ্চয়, ব্যবসায়িক সম্পদ ও দায়ের জন্য যাকাত ক্যালকুলেটর বাংলাদেশি টাকা কেন্দ্রিক।",
    footerText: "দীন, দুনিয়া ও আখিরাত।"
  }
};

function setLanguage(lang) {
  const dictionary = copy[lang] || copy.en;
  document.documentElement.lang = lang === "bn" ? "bn" : "en";

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (dictionary[key]) {
      node.textContent = dictionary[key];
    }
  });

  document.querySelectorAll(".lang-option").forEach((button) => {
    const active = button.dataset.lang === lang;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  localStorage.setItem("wasilah-lang", lang);
}

function applyStoreLinks() {
  const links = [
    ["app-store-link", STORE_LINKS.appStore],
    ["play-store-link", STORE_LINKS.googlePlay]
  ];

  links.forEach(([id, url]) => {
    const anchor = document.getElementById(id);
    if (!anchor) return;

    if (url) {
      anchor.href = url;
      anchor.classList.remove("is-muted");
      anchor.target = "_blank";
      anchor.rel = "noopener";
      return;
    }

    anchor.href = "#top";
    anchor.classList.add("is-muted");
  });
}

function smartRedirect() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("download") !== "app") return;

  const userAgent = navigator.userAgent || "";
  const isAndroid = /Android/i.test(userAgent);
  const isApple = /iPhone|iPad|iPod|Macintosh/i.test(userAgent);

  if (isAndroid && STORE_LINKS.googlePlay) {
    window.location.assign(STORE_LINKS.googlePlay);
  } else if (isApple && STORE_LINKS.appStore) {
    window.location.assign(STORE_LINKS.appStore);
  }
}

function initScrollReveals() {
  const targets = document.querySelectorAll(
    ".section-copy, .feature-card, .seo-grid article, .spiritual-inner, .faq-list details, .site-footer > *"
  );

  if (!targets.length) return;

  document.body.classList.add("motion-ready");

  targets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
  });

  if (!("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.12
    }
  );

  targets.forEach((target) => observer.observe(target));
}

document.querySelectorAll(".lang-option").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

setLanguage(localStorage.getItem("wasilah-lang") || "en");
applyStoreLinks();
smartRedirect();
initScrollReveals();
