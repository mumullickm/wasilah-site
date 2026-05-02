const STORE_LINKS = {
  appStore: "",
  googlePlay: ""
};

const copy = {
  en: {
    navFeatures: "Features",
    navDownload: "Download",
    heroEyebrow: "For Deen, Dunia & Akhira",
    heroLead:
      "A calm Islamic companion for everyday salah, Quran, Hadith, Qibla, Zakat, and remembrance. Built for everyday worship, open to the global Ummah.",
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
    featureHadithTitle: "Hadith in Arabic & English",
    featureHadithText: "Authentic hadith collections presented for learning and reflection.",
    featureZakatTitle: "Zakat Calculator in BDT",
    featureZakatText: "Calculate zakat using Bangladeshi Taka across cash, gold, savings, and liabilities.",
    featureDuaTitle: "Duas & Remembrance",
    featureDuaText: "Daily adhkar and supplications for morning, evening, travel, family, and more.",
    spiritualLabel: "A quiet reminder",
    spiritualTitle: "Technology should make worship easier, not noisier.",
    spiritualText:
      "Wasilah is designed to support simple daily consistency: pray on time, return to the Quran, learn from Hadith, give with intention, and keep Allah in remembrance.",
    downloadLabel: "Coming to mobile",
    downloadTitle: "Download Wasilah when it launches.",
    downloadText: "App Store and Google Play links will appear here as soon as the app is published.",
    footerText: "Deen, Dunia & Akhira."
  },
  bn: {
    navFeatures: "ফিচার",
    navDownload: "ডাউনলোড",
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
    featureHadithTitle: "আরবি ও ইংরেজিতে হাদিস",
    featureHadithText: "শেখা ও চিন্তার জন্য প্রামাণ্য হাদিস সংগ্রহ।",
    featureZakatTitle: "BDT যাকাত ক্যালকুলেটর",
    featureZakatText: "নগদ, সোনা, সঞ্চয় ও দায় বিবেচনায় বাংলাদেশি টাকায় যাকাত হিসাব করুন।",
    featureDuaTitle: "দুয়া ও যিকির",
    featureDuaText: "সকাল, সন্ধ্যা, সফর, পরিবারসহ নানা উপলক্ষের দৈনন্দিন আযকার ও দুয়া।",
    spiritualLabel: "একটি নীরব স্মরণ",
    spiritualTitle: "টেকনোলজি ইবাদতকে সহজ করুক, ব্যস্ত নয়।",
    spiritualText:
      "ওয়াসিলাহ দৈনন্দিন ধারাবাহিকতায় সহায়তা করার জন্য তৈরি: সময়মতো নামাজ, কুরআনে ফেরা, হাদিস থেকে শেখা, নিয়তসহ দান এবং আল্লাহর স্মরণ।",
    downloadLabel: "মোবাইলে আসছে",
    downloadTitle: "লঞ্চ হলে ওয়াসিলাহ ডাউনলোড করুন।",
    downloadText: "অ্যাপ প্রকাশিত হওয়ার সঙ্গে সঙ্গে App Store ও Google Play লিংক এখানে যুক্ত হবে।",
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
    ["app-store-link-bottom", STORE_LINKS.appStore],
    ["play-store-link", STORE_LINKS.googlePlay],
    ["play-store-link-bottom", STORE_LINKS.googlePlay]
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

    anchor.href = "#download";
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

document.querySelectorAll(".lang-option").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

setLanguage(localStorage.getItem("wasilah-lang") || "en");
applyStoreLinks();
smartRedirect();
