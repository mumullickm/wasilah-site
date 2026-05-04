const STORE_LINKS = {
  appStore: "",
  googlePlay: ""
};

const PRAYER_API_BASE = "https://api.aladhan.com/v1";
const QURAN_API_BASE = "https://api.alquran.cloud/v1";
const QURAN_EDITIONS = ["quran-uthmani", "en.asad", "bn.bengali"];

const FETCH_TIMEOUT_MS = 8000;
const PRAYER_REFRESH_MS = 10 * 60 * 1000;
const NEXT_PRAYER_TICK_MS = 30 * 1000;
const SURAH_CACHE_KEY = "wasilah-surahs-v1";
const PRAYER_CACHE_KEY = "wasilah-prayer-cache-v1";
const PRAYER_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const CITIES = [
  { name: "Dhaka", bn: "ঢাকা", lat: 23.8103, lng: 90.4125, tz: 6 },
  { name: "Chattogram", bn: "চট্টগ্রাম", lat: 22.3569, lng: 91.7832, tz: 6 },
  { name: "Sylhet", bn: "সিলেট", lat: 24.8949, lng: 91.8687, tz: 6 },
  { name: "Rajshahi", bn: "রাজশাহী", lat: 24.3745, lng: 88.6042, tz: 6 },
  { name: "Khulna", bn: "খুলনা", lat: 22.8456, lng: 89.5403, tz: 6 },
  { name: "Barishal", bn: "বরিশাল", lat: 22.701, lng: 90.3535, tz: 6 },
  { name: "Rangpur", bn: "রংপুর", lat: 25.7439, lng: 89.2752, tz: 6 },
  { name: "Mymensingh", bn: "ময়মনসিংহ", lat: 24.7471, lng: 90.4203, tz: 6 }
];

let currentLanguage = "en";
let currentCoords = CITIES[0];
let currentQuranLanguage = "ar";
let currentGuide = "umrah";
let quranSurahs = [];
let quranCache = new Map();
let lastPrayerTimes = null;
let prayerRefreshTimer = null;

const QURAN_LIBRARY = [
  {
    id: "fatihah",
    title: { en: "Al-Fatihah", bn: "সূরা আল-ফাতিহা" },
    verses: [
      {
        n: 1,
        ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        en: "In the name of Allah, the Most Compassionate, the Most Merciful.",
        bn: "পরম করুণাময়, পরম দয়ালু আল্লাহর নামে।"
      },
      {
        n: 2,
        ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        en: "All praise belongs to Allah, Lord of all worlds.",
        bn: "সব প্রশংসা আল্লাহর, যিনি সকল জগতের প্রতিপালক।"
      },
      {
        n: 3,
        ar: "الرَّحْمَٰنِ الرَّحِيمِ",
        en: "The Most Compassionate, the Most Merciful.",
        bn: "পরম করুণাময়, পরম দয়ালু।"
      },
      {
        n: 4,
        ar: "مَالِكِ يَوْمِ الدِّينِ",
        en: "Master of the Day of Judgment.",
        bn: "প্রতিদান দিবসের মালিক।"
      },
      {
        n: 5,
        ar: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        en: "You alone we worship, and You alone we ask for help.",
        bn: "আমরা শুধু আপনারই ইবাদত করি এবং শুধু আপনার কাছেই সাহায্য চাই।"
      },
      {
        n: 6,
        ar: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        en: "Guide us to the straight path.",
        bn: "আমাদের সরল পথে পরিচালিত করুন।"
      },
      {
        n: 7,
        ar: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        en: "The path of those You have blessed, not of those who earned anger, nor of those who went astray.",
        bn: "তাদের পথ, যাদের আপনি অনুগ্রহ করেছেন; তাদের পথ নয় যারা ক্রোধভাজন, এবং যারা পথভ্রষ্ট।"
      }
    ]
  },
  {
    id: "ikhlas",
    title: { en: "Al-Ikhlas", bn: "সূরা আল-ইখলাস" },
    verses: [
      { n: 1, ar: "قُلْ هُوَ اللَّهُ أَحَدٌ", en: "Say: He is Allah, One.", bn: "বলুন: তিনি আল্লাহ, এক।" },
      { n: 2, ar: "اللَّهُ الصَّمَدُ", en: "Allah, the Eternal Refuge.", bn: "আল্লাহ অমুখাপেক্ষী আশ্রয়।" },
      { n: 3, ar: "لَمْ يَلِدْ وَلَمْ يُولَدْ", en: "He neither begets nor is born.", bn: "তিনি কাউকে জন্ম দেননি, এবং তাঁকেও জন্ম দেওয়া হয়নি।" },
      { n: 4, ar: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", en: "And none is comparable to Him.", bn: "আর তাঁর সমতুল্য কেউ নেই।" }
    ]
  },
  {
    id: "falaq",
    title: { en: "Al-Falaq", bn: "সূরা আল-ফালাক" },
    verses: [
      { n: 1, ar: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", en: "Say: I seek refuge in the Lord of daybreak.", bn: "বলুন: আমি আশ্রয় চাই প্রভাতের রবের কাছে।" },
      { n: 2, ar: "مِن شَرِّ مَا خَلَقَ", en: "From the harm of what He created.", bn: "তিনি যা সৃষ্টি করেছেন তার অনিষ্ট থেকে।" },
      { n: 3, ar: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", en: "From the harm of darkness when it settles.", bn: "অন্ধকার নেমে এলে তার অনিষ্ট থেকে।" },
      { n: 4, ar: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", en: "From the harm of those who blow on knots.", bn: "গিঁটে ফুঁকদানকারীদের অনিষ্ট থেকে।" },
      { n: 5, ar: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", en: "And from the harm of the envier when he envies.", bn: "আর হিংসুকের অনিষ্ট থেকে, যখন সে হিংসা করে।" }
    ]
  }
];

const DUAS = [
  {
    id: "morning",
    title: { en: "Morning remembrance", bn: "সকালের যিকির" },
    ar: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
    en: "We have entered morning, and all dominion belongs to Allah.",
    bn: "আমরা সকালে উপনীত হয়েছি, আর সমস্ত রাজত্ব আল্লাহর।"
  },
  {
    id: "evening",
    title: { en: "Evening remembrance", bn: "সন্ধ্যার যিকির" },
    ar: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ",
    en: "We have entered evening, and all dominion belongs to Allah.",
    bn: "আমরা সন্ধ্যায় উপনীত হয়েছি, আর সমস্ত রাজত্ব আল্লাহর।"
  },
  {
    id: "knowledge",
    title: { en: "Increase in knowledge", bn: "জ্ঞান বৃদ্ধির দুয়া" },
    ar: "رَبِّ زِدْنِي عِلْمًا",
    en: "My Lord, increase me in knowledge.",
    bn: "হে আমার রব, আমাকে জ্ঞানে বৃদ্ধি করুন।"
  },
  {
    id: "parents",
    title: { en: "For parents", bn: "মা-বাবার জন্য" },
    ar: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    en: "My Lord, have mercy on them as they raised me when I was small.",
    bn: "হে আমার রব, তারা যেমন শৈশবে আমাকে লালন করেছেন, তেমনি তাদের প্রতি দয়া করুন।"
  },
  {
    id: "travel",
    title: { en: "Travel", bn: "সফর" },
    ar: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
    en: "Glory be to the One who made this available to us, though we could not have controlled it.",
    bn: "পবিত্র তিনি, যিনি এটি আমাদের অধীন করেছেন; আমরা নিজেরা তা করতে সক্ষম ছিলাম না।"
  }
];

const GUIDE_STEPS = {
  umrah: [
    { en: "Enter Ihram", bn: "ইহরাম বাঁধুন", textEn: "Make intention, recite talbiyah, and observe the Ihram restrictions.", textBn: "নিয়ত করুন, তালবিয়াহ পড়ুন এবং ইহরামের বিধিনিষেধ মানুন।" },
    { en: "Tawaf", bn: "তাওয়াফ", textEn: "Circle the Kaaba seven times with calm focus and dua.", textBn: "শান্ত মনোযোগ ও দুয়ার সঙ্গে কাবা সাতবার প্রদক্ষিণ করুন।" },
    { en: "Pray two rak'ah", bn: "দুই রাকাত নামাজ", textEn: "Pray after Tawaf where possible without blocking others.", textBn: "অন্যকে বাধা না দিয়ে সম্ভব হলে তাওয়াফের পর দুই রাকাত নামাজ পড়ুন।" },
    { en: "Sa'i", bn: "সাঈ", textEn: "Walk seven rounds between Safa and Marwah.", textBn: "সাফা ও মারওয়ার মাঝে সাত চক্কর সম্পন্ন করুন।" },
    { en: "Halq or Taqsir", bn: "হালক বা তাকসির", textEn: "Shave or trim the hair to complete Umrah.", textBn: "চুল মুণ্ডন বা ছাঁটার মাধ্যমে উমরাহ সম্পন্ন করুন।" }
  ],
  hajj: [
    { en: "Ihram and Mina", bn: "ইহরাম ও মিনা", textEn: "Enter Ihram and spend the first Hajj day in Mina.", textBn: "ইহরাম বেঁধে হজ্জের প্রথম দিন মিনায় অবস্থান করুন।" },
    { en: "Arafat", bn: "আরাফাত", textEn: "Stand at Arafat with dua and repentance; this is the heart of Hajj.", textBn: "দুয়া ও তাওবার সঙ্গে আরাফাতে অবস্থান করুন; এটিই হজ্জের মূল।" },
    { en: "Muzdalifah", bn: "মুযদালিফা", textEn: "Spend the night, pray, and collect pebbles.", textBn: "রাত কাটান, নামাজ পড়ুন এবং কংকর সংগ্রহ করুন।" },
    { en: "Ramy and sacrifice", bn: "রামি ও কুরবানি", textEn: "Stone the Jamrah, complete sacrifice, then shave or trim.", textBn: "জামরায় কংকর নিক্ষেপ, কুরবানি, তারপর চুল মুণ্ডন বা ছাঁটা সম্পন্ন করুন।" },
    { en: "Tawaf al-Ifadah", bn: "তাওয়াফে ইফাদা", textEn: "Return to Makkah for Tawaf al-Ifadah and Sa'i if required.", textBn: "তাওয়াফে ইফাদা এবং প্রয়োজন হলে সাঈর জন্য মক্কায় ফিরুন।" },
    { en: "Farewell Tawaf", bn: "বিদায়ী তাওয়াফ", textEn: "Complete Tawaf al-Wada before leaving Makkah.", textBn: "মক্কা ত্যাগের আগে তাওয়াফে বিদা সম্পন্ন করুন।" }
  ]
};

const NAMES = [
  "الرَّحْمَن|Ar-Rahman|The Most Compassionate|পরম করুণাময়",
  "الرَّحِيم|Ar-Rahim|The Most Merciful|পরম দয়ালু",
  "المَلِك|Al-Malik|The Sovereign|সর্বময় অধিপতি",
  "القُدُّوس|Al-Quddus|The Most Holy|পরম পবিত্র",
  "السَّلَام|As-Salam|The Source of Peace|শান্তির উৎস",
  "المُؤْمِن|Al-Mu'min|The Giver of Faith|নিরাপত্তাদাতা",
  "المُهَيْمِن|Al-Muhaymin|The Guardian|রক্ষক",
  "العَزِيز|Al-Aziz|The Almighty|পরাক্রমশালী",
  "الجَبَّار|Al-Jabbar|The Compeller|মহাশক্তিধর",
  "المُتَكَبِّر|Al-Mutakabbir|The Supremely Great|শ্রেষ্ঠ মহিমান্বিত",
  "الخَالِق|Al-Khaliq|The Creator|সৃষ্টিকর্তা",
  "البَارِئ|Al-Bari|The Originator|উদ্ভাবনকারী",
  "المُصَوِّر|Al-Musawwir|The Fashioner|আকৃতিদানকারী",
  "الغَفَّار|Al-Ghaffar|The Great Forgiver|মহাক্ষমাশীল",
  "القَهَّار|Al-Qahhar|The Subduer|পরাভূতকারী",
  "الوَهَّاب|Al-Wahhab|The Bestower|অকৃপণ দাতা",
  "الرَّزَّاق|Ar-Razzaq|The Provider|রিযিকদাতা",
  "الفَتَّاح|Al-Fattah|The Opener|উন্মুক্তকারী",
  "العَلِيم|Al-Alim|The All-Knowing|সর্বজ্ঞ",
  "القَابِض|Al-Qabid|The Withholder|সংকোচনকারী",
  "البَاسِط|Al-Basit|The Expander|প্রশস্তকারী",
  "الخَافِض|Al-Khafid|The Abaser|অবনতকারী",
  "الرَّافِع|Ar-Rafi|The Exalter|উন্নীতকারী",
  "المُعِزّ|Al-Mu'izz|The Honorer|সম্মানদাতা",
  "المُذِلّ|Al-Mudhill|The Humiliator|লাঞ্ছনাদাতা",
  "السَّمِيع|As-Sami|The All-Hearing|সর্বশ্রোতা",
  "البَصِير|Al-Basir|The All-Seeing|সর্বদ্রষ্টা",
  "الحَكَم|Al-Hakam|The Judge|বিচারক",
  "العَدْل|Al-Adl|The Just|ন্যায়পরায়ণ",
  "اللَّطِيف|Al-Latif|The Subtle|সূক্ষ্মদর্শী",
  "الخَبِير|Al-Khabir|The All-Aware|সর্বজ্ঞাত",
  "الحَلِيم|Al-Halim|The Forbearing|সহনশীল",
  "العَظِيم|Al-Azim|The Magnificent|মহামহিম",
  "الغَفُور|Al-Ghafur|The Forgiving|ক্ষমাশীল",
  "الشَّكُور|Ash-Shakur|The Appreciative|কৃতজ্ঞতার প্রতিদানকারী",
  "العَلِيّ|Al-Ali|The Most High|সর্বোচ্চ",
  "الكَبِير|Al-Kabir|The Most Great|সুমহান",
  "الحَفِيظ|Al-Hafiz|The Preserver|সংরক্ষণকারী",
  "المُقِيت|Al-Muqit|The Sustainer|জীবিকাদাতা",
  "الحَسِيب|Al-Hasib|The Reckoner|হিসাবগ্রহণকারী",
  "الجَلِيل|Al-Jalil|The Majestic|মহিমান্বিত",
  "الكَرِيم|Al-Karim|The Generous|মহাদাতা",
  "الرَّقِيب|Ar-Raqib|The Watchful|পর্যবেক্ষক",
  "المُجِيب|Al-Mujib|The Responsive|সাড়া দানকারী",
  "الوَاسِع|Al-Wasi|The All-Encompassing|সর্বব্যাপী",
  "الحَكِيم|Al-Hakim|The Wise|প্রজ্ঞাময়",
  "الوَدُود|Al-Wadud|The Loving|স্নেহশীল",
  "المَجِيد|Al-Majid|The Glorious|গৌরবময়",
  "البَاعِث|Al-Ba'ith|The Resurrector|পুনরুত্থানকারী",
  "الشَّهِيد|Ash-Shahid|The Witness|সাক্ষী",
  "الحَقّ|Al-Haqq|The Truth|সত্য",
  "الوَكِيل|Al-Wakil|The Trustee|ভরসাস্থল",
  "القَوِيّ|Al-Qawiyy|The Strong|শক্তিশালী",
  "المَتِين|Al-Matin|The Firm|সুদৃঢ়",
  "الوَلِيّ|Al-Wali|The Protecting Friend|অভিভাবক",
  "الحَمِيد|Al-Hamid|The Praiseworthy|প্রশংসিত",
  "المُحْصِي|Al-Muhsi|The Counter|গণনাকারী",
  "المُبْدِئ|Al-Mubdi|The Initiator|আরম্ভকারী",
  "المُعِيد|Al-Mu'id|The Restorer|পুনরায় সৃষ্টিকারী",
  "المُحْيِي|Al-Muhyi|The Giver of Life|জীবনদাতা",
  "المُمِيت|Al-Mumit|The Giver of Death|মৃত্যুদাতা",
  "الحَيّ|Al-Hayy|The Ever-Living|চিরঞ্জীব",
  "القَيُّوم|Al-Qayyum|The Sustainer of All|চিরস্থায়ী ধারক",
  "الوَاجِد|Al-Wajid|The Finder|প্রাপ্তিকারী",
  "المَاجِد|Al-Majid|The Noble|মর্যাদাময়",
  "الوَاحِد|Al-Wahid|The One|একক",
  "الأَحَد|Al-Ahad|The Unique One|অনন্য এক",
  "الصَّمَد|As-Samad|The Eternal Refuge|অমুখাপেক্ষী আশ্রয়",
  "القَادِر|Al-Qadir|The Able|ক্ষমতাবান",
  "المُقْتَدِر|Al-Muqtadir|The Powerful|পূর্ণ ক্ষমতাশালী",
  "المُقَدِّم|Al-Muqaddim|The Advancer|অগ্রসরকারী",
  "المُؤَخِّر|Al-Mu'akhkhir|The Delayer|পশ্চাতে রাখেন যিনি",
  "الأَوَّل|Al-Awwal|The First|প্রথম",
  "الآخِر|Al-Akhir|The Last|শেষ",
  "الظَّاهِر|Az-Zahir|The Manifest|প্রকাশ্য",
  "البَاطِن|Al-Batin|The Hidden|গুপ্ত",
  "الوَالِي|Al-Wali|The Governor|পরিচালনাকারী",
  "المُتَعَالِي|Al-Muta'ali|The Most Exalted|অতি উচ্চ",
  "البَرّ|Al-Barr|The Source of Goodness|কল্যাণময়",
  "التَّوَّاب|At-Tawwab|The Accepter of Repentance|তাওবা গ্রহণকারী",
  "المُنْتَقِم|Al-Muntaqim|The Avenger|প্রতিশোধ গ্রহণকারী",
  "العَفُوّ|Al-Afuww|The Pardoner|মার্জনাকারী",
  "الرَّؤُوف|Ar-Ra'uf|The Kind|অতিশয় স্নেহশীল",
  "مَالِكُ المُلْك|Malik al-Mulk|Master of the Kingdom|সাম্রাজ্যের মালিক",
  "ذُو الجَلَالِ وَالإِكْرَام|Dhul-Jalali wal-Ikram|Lord of Majesty and Honor|মহিমা ও সম্মানের অধিকারী",
  "المُقْسِط|Al-Muqsit|The Equitable|ন্যায়বণ্টনকারী",
  "الجَامِع|Al-Jami|The Gatherer|সমবেতকারী",
  "الغَنِيّ|Al-Ghani|The Self-Sufficient|অমুখাপেক্ষী ধনী",
  "المُغْنِي|Al-Mughni|The Enricher|অভাবমোচনকারী",
  "المَانِع|Al-Mani|The Preventer|নিবারণকারী",
  "الضَّار|Ad-Darr|The Distresser|ক্ষতির নিয়ন্ত্রক",
  "النَّافِع|An-Nafi|The Benefactor|উপকারকারী",
  "النُّور|An-Nur|The Light|আলো",
  "الهَادِي|Al-Hadi|The Guide|পথপ্রদর্শক",
  "البَدِيع|Al-Badi|The Originator|অনন্য স্রষ্টা",
  "البَاقِي|Al-Baqi|The Everlasting|চিরস্থায়ী",
  "الوَارِث|Al-Warith|The Inheritor|উত্তরাধিকারী",
  "الرَّشِيد|Ar-Rashid|The Guide to Rightness|সঠিক পথপ্রদর্শক",
  "الصَّبُور|As-Sabur|The Patient|ধৈর্যশীল"
].map((value, index) => {
  const [ar, transliteration, en, bn] = value.split("|");
  return { index: index + 1, ar, transliteration, en, bn };
});

const copy = {
  en: {
    heroEyebrow: "For Deen, Dunia & Akhira",
    heroLead:
      "A Bangladesh-ready Islamic companion for everyday salah, Quran, Hadith, Qibla, BDT Zakat, Ramadan, duas, and remembrance.",
    appStoreKicker: "Download on the",
    playStoreKicker: "Get it on",
    comingSoonBadge: "Apps launching soon — bookmark wasilah.site",
    featuresLabel: "Inside the app",
    featuresTitle: "Everything essential, in four simple sections.",
    featurePrayerTitle: "Prayer, Adhan & Qibla",
    featurePrayerText: "Bangladesh salah times, adhan-ready moments, and Qibla direction.",
    featureQiblaTitle: "Qibla Direction",
    featureQiblaText: "A simple compass experience for finding the direction of the Kaaba.",
    featureQuranTitle: "Quran & Hadith",
    featureQuranText: "Arabic, English, and Bangla reading for Quran and Hadith in one place.",
    featureHadithTitle: "Hadith in Arabic, English & Bangla",
    featureHadithText: "Hadith collections presented for learning, reflection, and Bengali readers.",
    featureZakatTitle: "Zakat & 99 Names",
    featureZakatText: "BDT zakat planning with the 99 Names of Allah in three languages.",
    featureDuaTitle: "Duas, Hajj & Umrah",
    featureDuaText: "Daily duas with clear Hajj and Umrah guidance for quick reading.",
    featureNamesTitle: "99 Names of Allah",
    featureNamesText: "Arabic names with English and Bangla meanings for reflection and learning.",
    featureHajjTitle: "Hajj & Umrah Guide",
    featureHajjText: "Clear step-by-step guidance for Ihram, Tawaf, Sa'i, Mina, Arafat, and more.",
    worshipLabel: "Live worship tools",
    worshipTitle: "Live worship tools, ready in the browser.",
    worshipText:
      "Scroll through focused website segments for Bangladesh salah times, Quran reading, Allah's names, duas, and Hajj or Umrah guidance.",
    segmentSalah: "Salah",
    segmentQuran: "Quran",
    segmentNames: "99 Names",
    segmentDua: "Duas",
    segmentGuide: "Hajj & Umrah",
    salahKicker: "Asia/Dhaka time",
    salahTitle: "Salah Time",
    cityLabel: "City",
    geoButton: "Use Location",
    geoLocating: "Locating...",
    geoDenied: "Location permission denied — pick a city instead.",
    geoUnavailable: "Location unavailable — pick a city instead.",
    geoUnsupported: "Geolocation isn't supported in this browser.",
    nextPrayerLabel: "Next prayer",
    loadingPrayer: "Loading prayer times...",
    prayerApiReady: "Showing live prayer times.",
    prayerApiFallback: "Offline — showing estimated prayer times.",
    quranKicker: "Quran reader",
    quranReaderTitle: "Quran",
    loadingQuran: "Loading Quran...",
    quranApiReady: "",
    quranApiFallback: "Offline — showing starter Quran text.",
    namesKicker: "Asmaul Husna",
    namesTitle: "99 Names of Allah",
    namesSearch: "Search a name or meaning",
    duaKicker: "Supplications",
    duaTitle: "Duas",
    guideKicker: "Pilgrimage",
    guideTitle: "Hajj & Umrah Guide",
    umrahTab: "Umrah",
    hajjTab: "Hajj",
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
    faqLaunchQuestion: "When is the app launching?",
    faqLaunchAnswer:
      "Wasilah is preparing for an early Bangladesh launch on iOS and Android. Bookmark wasilah.site and you'll be the first to know.",
    faqCostQuestion: "Will Wasilah be free?",
    faqCostAnswer:
      "Yes. Wasilah will be free to download and use for everyday worship support, with no ads in the prayer or Quran experience.",
    aboutLabel: "About",
    aboutTitle: "Built quietly, for daily worship.",
    aboutText:
      "Wasilah is an independent Islamic companion project. We are focused on a clean, fast, ad-free experience that respects your privacy and your worship.",
    contactLabel: "Contact",
    contactTitle: "Get in touch",
    contactText:
      "Have feedback, partnership ideas, or a feature request? We read every message.",
    contactEmail: "hello@wasilah.site",
    privacyLabel: "Privacy",
    privacyTitle: "Privacy first",
    privacyText:
      "Wasilah does not require an account to use this website. We do not sell or share personal data. Anonymous analytics help us understand how the site is used.",
    privacyBullet1: "No account or sign-in required to use the site or app.",
    privacyBullet2: "Location is requested only when you press \"Use Location,\" and used only to compute prayer times in your browser.",
    privacyBullet3: "Anonymous analytics (Google Analytics) help us improve the site. Your IP is anonymised.",
    privacyBullet4: "Email us anytime to ask what data we hold or to request deletion.",
    statusLabel: "Status",
    statusTitle: "App launch status",
    statusText: "We are in private build with launch partners. Public iOS and Android builds are next.",
    statusBuild: "Current build",
    statusBuildValue: "Internal preview",
    statusEta: "Public launch",
    statusEtaValue: "2026 — coming soon",
    backToTop: "Back to top",
    footerTagline: "An Islamic companion for Bangladesh — and Bengali-speaking Muslims everywhere.",
    footerNavTitle: "Explore",
    footerNavFeatures: "Features",
    footerNavWorship: "Worship tools",
    footerNavFaq: "FAQ",
    footerNavPrivacy: "Privacy",
    footerNavContact: "Contact",
    footerLegal: "© 2026 Wasilah. All rights reserved.",
    footerMadeIn: "Made with care for the Ummah."
  },
  bn: {
    heroEyebrow: "দীন, দুনিয়া ও আখিরাতের জন্য",
    heroLead:
      "সালাহ, কুরআন, হাদিস, কিবলা, যাকাত ও দৈনন্দিন যিকিরের জন্য একটি শান্ত ইসলামিক সহচর। দৈনন্দিন ইবাদতের জন্য তৈরি, বিশ্ব উম্মাহর জন্য উন্মুক্ত।",
    appStoreKicker: "ডাউনলোড করুন",
    playStoreKicker: "পাওয়া যাবে",
    comingSoonBadge: "অ্যাপ শীঘ্রই আসছে — wasilah.site বুকমার্ক করুন",
    featuresLabel: "অ্যাপের ভেতরে",
    featuresTitle: "প্রয়োজনীয় সবকিছু চারটি সহজ অংশে।",
    featurePrayerTitle: "নামাজ, আযান ও কিবলা",
    featurePrayerText: "বাংলাদেশের সালাহ সময়, আযানের মুহূর্ত ও কিবলার দিক।",
    featureQiblaTitle: "কিবলার দিক",
    featureQiblaText: "কাবার দিক খুঁজে পাওয়ার জন্য সহজ কম্পাস অভিজ্ঞতা।",
    featureQuranTitle: "কুরআন ও হাদিস",
    featureQuranText: "এক জায়গায় আরবি, ইংরেজি ও বাংলায় কুরআন ও হাদিস পড়া।",
    featureHadithTitle: "আরবি, ইংরেজি ও বাংলায় হাদিস",
    featureHadithText: "শেখা, চিন্তা ও বাংলাভাষী পাঠকের জন্য হাদিস সংগ্রহ।",
    featureZakatTitle: "যাকাত ও ৯৯ নাম",
    featureZakatText: "BDT যাকাত পরিকল্পনার সঙ্গে তিন ভাষায় আল্লাহর ৯৯ নাম।",
    featureDuaTitle: "দুয়া, হজ্জ ও উমরাহ",
    featureDuaText: "দৈনন্দিন দুয়া এবং দ্রুত পড়ার মতো হজ্জ ও উমরাহ গাইড।",
    featureNamesTitle: "আল্লাহর ৯৯ নাম",
    featureNamesText: "চিন্তা ও শেখার জন্য আরবি নামের সঙ্গে ইংরেজি ও বাংলা অর্থ।",
    featureHajjTitle: "হজ্জ ও উমরাহ গাইড",
    featureHajjText: "ইহরাম, তাওয়াফ, সাঈ, মিনা, আরাফাতসহ ধাপে ধাপে পরিষ্কার গাইড।",
    worshipLabel: "লাইভ ইবাদত টুলস",
    worshipTitle: "ওয়েবসাইটেই লাইভ ইবাদতের টুল।",
    worshipText:
      "বাংলাদেশের নামাজের সময়, কুরআন পাঠ, আল্লাহর নাম, দুয়া এবং হজ্জ বা উমরাহ নির্দেশনা স্ক্রলভিত্তিক ওয়েবসাইট সেগমেন্টে দেখুন।",
    segmentSalah: "নামাজ",
    segmentQuran: "কুরআন",
    segmentNames: "৯৯ নাম",
    segmentDua: "দুয়া",
    segmentGuide: "হজ্জ ও উমরাহ",
    salahKicker: "Asia/Dhaka সময়",
    salahTitle: "নামাজের সময়",
    cityLabel: "শহর",
    geoButton: "লোকেশন ব্যবহার",
    geoLocating: "লোকেশন খুঁজছি...",
    geoDenied: "লোকেশন অনুমতি দেওয়া হয়নি — শহর নির্বাচন করুন।",
    geoUnavailable: "লোকেশন পাওয়া যায়নি — শহর নির্বাচন করুন।",
    geoUnsupported: "এই ব্রাউজারে জিও-লোকেশন সমর্থিত নয়।",
    nextPrayerLabel: "পরবর্তী নামাজ",
    loadingPrayer: "নামাজের সময় লোড হচ্ছে...",
    prayerApiReady: "লাইভ নামাজের সময় দেখানো হচ্ছে।",
    prayerApiFallback: "অফলাইন — আনুমানিক সময় দেখানো হচ্ছে।",
    quranKicker: "কুরআন রিডার",
    quranReaderTitle: "কুরআন",
    loadingQuran: "কুরআন লোড হচ্ছে...",
    quranApiReady: "",
    quranApiFallback: "অফলাইন — স্টার্টার কুরআন পাঠ দেখানো হচ্ছে।",
    namesKicker: "আসমাউল হুসনা",
    namesTitle: "আল্লাহর ৯৯ নাম",
    namesSearch: "নাম বা অর্থ খুঁজুন",
    duaKicker: "দুয়াসমূহ",
    duaTitle: "দুয়া",
    guideKicker: "হজ্জ ও উমরাহ",
    guideTitle: "হজ্জ ও উমরাহ গাইড",
    umrahTab: "উমরাহ",
    hajjTab: "হজ্জ",
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
    faqLaunchQuestion: "অ্যাপ কখন আসবে?",
    faqLaunchAnswer:
      "ওয়াসিলাহ iOS এবং Android-এ বাংলাদেশে শীঘ্রই চালু হচ্ছে। wasilah.site বুকমার্ক করুন — আপনি প্রথমেই জানবেন।",
    faqCostQuestion: "ওয়াসিলাহ কি বিনামূল্যে?",
    faqCostAnswer:
      "হ্যাঁ। ওয়াসিলাহ ডাউনলোড ও ব্যবহার বিনামূল্যে; নামাজ ও কুরআন অংশে কোনো বিজ্ঞাপন থাকবে না।",
    aboutLabel: "সম্পর্কে",
    aboutTitle: "নীরবে তৈরি, দৈনন্দিন ইবাদতের জন্য।",
    aboutText:
      "ওয়াসিলাহ একটি স্বাধীন ইসলামিক সহচর প্রকল্প। আপনার গোপনীয়তা ও ইবাদতের সম্মান রেখে দ্রুত, পরিচ্ছন্ন ও বিজ্ঞাপনমুক্ত অভিজ্ঞতা আমাদের লক্ষ্য।",
    contactLabel: "যোগাযোগ",
    contactTitle: "যোগাযোগ করুন",
    contactText:
      "মতামত, পার্টনারশিপ আইডিয়া বা ফিচার অনুরোধ আছে? প্রতিটি বার্তা আমরা পড়ি।",
    contactEmail: "hello@wasilah.site",
    privacyLabel: "গোপনীয়তা",
    privacyTitle: "গোপনীয়তা প্রথমে",
    privacyText:
      "এই ওয়েবসাইট ব্যবহারের জন্য কোনো অ্যাকাউন্ট লাগে না। আমরা ব্যক্তিগত তথ্য বিক্রি বা ভাগ করি না। অজ্ঞাতনামা অ্যানালিটিক্স ব্যবহার বুঝতে সাহায্য করে।",
    privacyBullet1: "সাইট বা অ্যাপ ব্যবহারের জন্য কোনো অ্যাকাউন্ট লাগে না।",
    privacyBullet2: "আপনি \"লোকেশন ব্যবহার\" চাপলে শুধু তখনই লোকেশন চাওয়া হয়, এবং তা ব্রাউজারে নামাজের সময় হিসাবে ব্যবহৃত হয়।",
    privacyBullet3: "অজ্ঞাতনামা অ্যানালিটিক্স (Google Analytics) সাইট উন্নত করতে সহায়তা করে। IP অজ্ঞাতনামা।",
    privacyBullet4: "আমরা কী ডেটা রাখি বা মুছে ফেলতে চান, যেকোনো সময় ইমেইল করুন।",
    statusLabel: "স্ট্যাটাস",
    statusTitle: "অ্যাপ লঞ্চ স্ট্যাটাস",
    statusText: "আমরা লঞ্চ পার্টনারদের সঙ্গে প্রাইভেট বিল্ডে আছি। iOS ও Android পাবলিক বিল্ড পরবর্তী।",
    statusBuild: "বর্তমান বিল্ড",
    statusBuildValue: "ইন্টারনাল প্রিভিউ",
    statusEta: "পাবলিক লঞ্চ",
    statusEtaValue: "২০২৬ — শীঘ্রই",
    backToTop: "উপরে ফিরুন",
    footerTagline: "বাংলাদেশের জন্য — এবং সর্বত্র বাংলাভাষী মুসলিমদের জন্য একটি ইসলামিক সহচর।",
    footerNavTitle: "ঘুরে দেখুন",
    footerNavFeatures: "ফিচার",
    footerNavWorship: "ইবাদত টুল",
    footerNavFaq: "FAQ",
    footerNavPrivacy: "গোপনীয়তা",
    footerNavContact: "যোগাযোগ",
    footerLegal: "© ২০২৬ ওয়াসিলাহ। সর্বস্বত্ব সংরক্ষিত।",
    footerMadeIn: "উম্মাহর জন্য যত্নে তৈরি।"
  }
};

function t(key) {
  return copy[currentLanguage]?.[key] ?? copy.en[key] ?? "";
}

function safeStorage(action, key, value) {
  try {
    if (action === "get") return localStorage.getItem(key);
    if (action === "set") return localStorage.setItem(key, value);
    if (action === "remove") return localStorage.removeItem(key);
  } catch (_) {
    return null;
  }
}

function setLanguage(lang) {
  const next = copy[lang] ? lang : "en";
  currentLanguage = next;
  document.documentElement.lang = next === "bn" ? "bn" : "en";

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    const value = t(key);
    if (value) node.textContent = value;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.dataset.i18nPlaceholder;
    const value = t(key);
    if (value) node.setAttribute("placeholder", value);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    const key = node.dataset.i18nAriaLabel;
    const value = t(key);
    if (value) node.setAttribute("aria-label", value);
  });

  document.querySelectorAll("[data-i18n-href]").forEach((node) => {
    const key = node.dataset.i18nHref;
    const value = t(key);
    if (value) node.setAttribute("href", value.includes("@") ? `mailto:${value}` : value);
  });

  document.querySelectorAll(".lang-option").forEach((button) => {
    const active = button.dataset.lang === next;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  safeStorage("set", "wasilah-lang", next);
  populateCitySelect();
  populateQuranSelect();
  populateDuaSelect();
  if (lastPrayerTimes) {
    renderPrayerRows(lastPrayerTimes);
  } else {
    renderSalahTimes();
  }
  renderQuran();
  renderNames();
  renderDua();
  renderGuide();
}

function applyStoreLinks() {
  const links = [
    ["app-store-link", STORE_LINKS.appStore],
    ["play-store-link", STORE_LINKS.googlePlay]
  ];

  let anyLive = false;

  links.forEach(([id, url]) => {
    const anchor = document.getElementById(id);
    if (!anchor) return;

    if (url) {
      anchor.href = url;
      anchor.classList.remove("is-muted");
      anchor.removeAttribute("aria-disabled");
      anchor.target = "_blank";
      anchor.rel = "noopener";
      anyLive = true;
      return;
    }

    anchor.href = "#status";
    anchor.classList.add("is-muted");
    anchor.setAttribute("aria-disabled", "true");
    anchor.removeAttribute("target");
    anchor.removeAttribute("rel");
  });

  const banner = document.getElementById("coming-soon-badge");
  if (banner) banner.hidden = anyLive;
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

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function toDegrees(value) {
  return (value * 180) / Math.PI;
}

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

function solarPosition(date) {
  const gamma = (2 * Math.PI / 365) * (dayOfYear(date) - 1 + 0.5);
  const equation =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  return { equation, declination: toDegrees(declination) };
}

function hourAngle(latitude, declination, zenith) {
  const lat = toRadians(latitude);
  const dec = toRadians(declination);
  const zen = toRadians(zenith);
  const value = (Math.cos(zen) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec));
  return toDegrees(Math.acos(Math.min(Math.max(value, -1), 1)));
}

function minutesToTime(totalMinutes) {
  const rounded = Math.round(totalMinutes);
  const minutesInDay = ((rounded % 1440) + 1440) % 1440;
  const hours = Math.floor(minutesInDay / 60);
  const minutes = minutesInDay % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function parseTimeToMinutes(time) {
  const clean = String(time).replace(/\s*\(.+\)\s*/g, "").trim();
  const [hour, minute] = clean.split(":").map(Number);
  return hour * 60 + minute;
}

function getBangladeshDateParts() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

function getBangladeshDatePath() {
  const parts = getBangladeshDateParts();
  return `${parts.day}-${parts.month}-${parts.year}`;
}

function getBangladeshNowMinutes() {
  const parts = getBangladeshDateParts();
  return Number(parts.hour) * 60 + Number(parts.minute);
}

function setStatus(id, key, kind = "info") {
  const node = document.getElementById(id);
  if (!node) return;
  const text = key ? t(key) : "";
  node.textContent = text;
  node.dataset.kind = kind;
  node.hidden = !text;
}

async function fetchJSON(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeout || FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function calculatePrayerTimes(date, coords) {
  const { equation, declination } = solarPosition(date);
  const noon = 720 - 4 * coords.lng - equation + coords.tz * 60;
  const sunriseAngle = hourAngle(coords.lat, declination, 90.833) * 4;
  const fajrAngle = hourAngle(coords.lat, declination, 108) * 4;
  const ishaAngle = hourAngle(coords.lat, declination, 108) * 4;
  const asrAltitude = toDegrees(Math.atan(1 / (1 + Math.tan(Math.abs(toRadians(coords.lat - declination))))));
  const asrAngle = hourAngle(coords.lat, declination, 90 - asrAltitude) * 4;

  return [
    { key: "Fajr", bn: "ফজর", minutes: noon - fajrAngle },
    { key: "Sunrise", bn: "সূর্যোদয়", minutes: noon - sunriseAngle },
    { key: "Dhuhr", bn: "যোহর", minutes: noon + 2 },
    { key: "Asr", bn: "আসর", minutes: noon + asrAngle },
    { key: "Maghrib", bn: "মাগরিব", minutes: noon + sunriseAngle },
    { key: "Isha", bn: "এশা", minutes: noon + ishaAngle }
  ];
}

function getNextPrayer(times) {
  const currentMinutes = getBangladeshNowMinutes();
  return times.find((time) => time.key !== "Sunrise" && time.minutes > currentMinutes) || times[0];
}

function populateCitySelect() {
  const select = document.getElementById("city-select");
  if (!select) return;

  const previous = select.value || currentCoords.name;
  select.innerHTML = "";

  CITIES.forEach((city) => {
    const option = document.createElement("option");
    option.value = city.name;
    option.textContent = currentLanguage === "bn" ? city.bn : city.name;
    select.appendChild(option);
  });

  if (currentCoords.name === "Current location") {
    const option = document.createElement("option");
    option.value = "__current";
    option.textContent = currentLanguage === "bn" ? "বর্তমান লোকেশন" : "Current location";
    option.selected = true;
    select.appendChild(option);
  } else {
    select.value = CITIES.some((city) => city.name === previous) ? previous : currentCoords.name;
  }
}

function normalizePrayerTimes(timings) {
  return [
    { key: "Fajr", bn: "ফজর", value: timings.Fajr },
    { key: "Sunrise", bn: "সূর্যোদয়", value: timings.Sunrise },
    { key: "Dhuhr", bn: "যোহর", value: timings.Dhuhr },
    { key: "Asr", bn: "আসর", value: timings.Asr },
    { key: "Maghrib", bn: "মাগরিব", value: timings.Maghrib },
    { key: "Isha", bn: "এশা", value: timings.Isha }
  ].map((time) => ({
    ...time,
    value: String(time.value).replace(/\s*\(.+\)\s*/g, "").trim(),
    minutes: parseTimeToMinutes(time.value)
  }));
}

function loadCachedPrayer(coords) {
  try {
    const raw = safeStorage("get", PRAYER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.coordsKey !== `${coords.lat},${coords.lng}`) return null;
    if (Date.now() - parsed.savedAt > PRAYER_CACHE_TTL_MS) return null;
    if (parsed.datePath !== getBangladeshDatePath()) return null;
    return parsed.times;
  } catch (_) {
    return null;
  }
}

function saveCachedPrayer(coords, times) {
  try {
    safeStorage(
      "set",
      PRAYER_CACHE_KEY,
      JSON.stringify({
        coordsKey: `${coords.lat},${coords.lng}`,
        datePath: getBangladeshDatePath(),
        savedAt: Date.now(),
        times
      })
    );
  } catch (_) {}
}

async function fetchPrayerTimes(coords) {
  const params = new URLSearchParams({
    latitude: coords.lat,
    longitude: coords.lng,
    method: "1",
    school: "1",
    timezonestring: "Asia/Dhaka"
  });
  const url = `${PRAYER_API_BASE}/timings/${getBangladeshDatePath()}?${params.toString()}`;
  const result = await fetchJSON(url);
  if (!result?.data?.timings) throw new Error("Malformed prayer response");
  return normalizePrayerTimes(result.data.timings);
}

function renderPrayerRows(times) {
  const container = document.getElementById("salah-times");
  if (!container) return;

  const next = getNextPrayer(times);
  const nextName = document.getElementById("next-prayer-name");
  const nextTime = document.getElementById("next-prayer-time");

  if (nextName) nextName.textContent = currentLanguage === "bn" ? next.bn : next.key;
  if (nextTime) nextTime.textContent = next.value || minutesToTime(next.minutes);

  container.innerHTML = "";
  times.forEach((time) => {
    const row = document.createElement("div");
    row.className = "time-row";
    const label = document.createElement("strong");
    label.textContent = currentLanguage === "bn" ? time.bn : time.key;
    const value = document.createElement("span");
    value.textContent = time.value || minutesToTime(time.minutes);
    row.append(label, value);
    container.appendChild(row);
  });
}

async function renderSalahTimes() {
  const container = document.getElementById("salah-times");
  if (!container) return;

  setStatus("salah-status", "loadingPrayer", "loading");
  container.classList.add("is-loading");

  const cached = loadCachedPrayer(currentCoords);
  if (cached) {
    lastPrayerTimes = cached;
    renderPrayerRows(cached);
    setStatus("salah-status", "prayerApiReady", "ok");
    container.classList.remove("is-loading");
  }

  try {
    const times = await fetchPrayerTimes(currentCoords);
    lastPrayerTimes = times;
    saveCachedPrayer(currentCoords, times);
    renderPrayerRows(times);
    setStatus("salah-status", "prayerApiReady", "ok");
  } catch (error) {
    if (!cached) {
      const fallback = calculatePrayerTimes(new Date(), currentCoords).map((time) => ({
        ...time,
        value: minutesToTime(time.minutes)
      }));
      lastPrayerTimes = fallback;
      renderPrayerRows(fallback);
    }
    setStatus("salah-status", "prayerApiFallback", "warn");
  } finally {
    container.classList.remove("is-loading");
  }
}

function fallbackSurahs() {
  return QURAN_LIBRARY.map((surah, index) => ({
    number: index === 0 ? 1 : index === 1 ? 112 : 113,
    englishName: surah.title.en,
    name: surah.title.bn
  }));
}

function populateQuranSelect() {
  const select = document.getElementById("quran-surah");
  if (!select) return;

  const source = quranSurahs.length ? quranSurahs : fallbackSurahs();
  const previous = select.value || String(source[0].number);
  select.innerHTML = "";
  source.forEach((surah) => {
    const option = document.createElement("option");
    option.value = surah.number;
    option.textContent = currentLanguage === "bn"
      ? `${surah.number}. ${surah.name}`
      : `${surah.number}. ${surah.englishName}`;
    select.appendChild(option);
  });
  select.value = source.some((surah) => String(surah.number) === previous) ? previous : String(source[0].number);
}

async function loadSurahList() {
  if (quranSurahs.length) return;

  const cached = safeStorage("get", SURAH_CACHE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length) {
        quranSurahs = parsed;
        populateQuranSelect();
      }
    } catch (_) {}
  }

  try {
    const result = await fetchJSON(`${QURAN_API_BASE}/surah`);
    if (Array.isArray(result?.data) && result.data.length) {
      quranSurahs = result.data;
      safeStorage("set", SURAH_CACHE_KEY, JSON.stringify(result.data));
      populateQuranSelect();
    }
  } catch (_) {
    if (!quranSurahs.length) {
      quranSurahs = fallbackSurahs();
      populateQuranSelect();
    }
  }
}

function fallbackQuranResponse(surahNumber) {
  const fallback = QURAN_LIBRARY.find((surah) => {
    return (surahNumber === 1 && surah.id === "fatihah") || (surahNumber === 112 && surah.id === "ikhlas") || (surahNumber === 113 && surah.id === "falaq");
  }) || QURAN_LIBRARY[0];

  return fallback.verses.map((verse) => ({
    n: verse.n,
    ar: verse.ar,
    en: verse.en,
    bn: verse.bn
  }));
}

async function fetchQuranSurah(surahNumber) {
  if (quranCache.has(surahNumber)) return quranCache.get(surahNumber);

  const url = `${QURAN_API_BASE}/surah/${surahNumber}/editions/${QURAN_EDITIONS.join(",")}`;
  const result = await fetchJSON(url);
  if (!Array.isArray(result?.data) || result.data.length < 3) throw new Error("Malformed Quran response");
  const [arabic, english, bangla] = result.data;
  const verses = arabic.ayahs.map((ayah, index) => ({
    n: ayah.numberInSurah,
    ar: ayah.text,
    en: english.ayahs[index]?.text || "",
    bn: bangla.ayahs[index]?.text || ""
  }));
  quranCache.set(surahNumber, verses);
  return verses;
}

async function renderQuran() {
  const select = document.getElementById("quran-surah");
  const reader = document.getElementById("quran-reader");
  if (!select || !reader) return;

  setStatus("quran-status", "loadingQuran", "loading");
  reader.classList.add("is-loading");
  const surahNumber = Number(select.value || 1);

  try {
    await loadSurahList();
    const verses = await fetchQuranSurah(surahNumber);
    renderQuranVerses(verses);
    setStatus("quran-status", "quranApiReady", "ok");
  } catch (error) {
    renderQuranVerses(fallbackQuranResponse(surahNumber));
    setStatus("quran-status", "quranApiFallback", "warn");
  } finally {
    reader.classList.remove("is-loading");
  }
}

function renderQuranVerses(verses) {
  const reader = document.getElementById("quran-reader");
  if (!reader) return;

  reader.innerHTML = "";
  verses.forEach((verse) => {
    const wrap = document.createElement("div");
    wrap.className = "verse";

    const num = document.createElement("span");
    num.className = "verse-number";
    num.textContent = verse.n;

    const arabic = document.createElement("p");
    arabic.className = "verse-text verse-arabic";
    arabic.lang = "ar";
    arabic.dir = "rtl";
    arabic.textContent = verse.ar;

    const english = document.createElement("p");
    english.className = "verse-translation";
    english.innerHTML = "<strong>English</strong><br>";
    english.appendChild(document.createTextNode(verse.en));

    const bangla = document.createElement("p");
    bangla.className = "verse-translation";
    bangla.lang = "bn";
    bangla.innerHTML = "<strong>বাংলা</strong><br>";
    bangla.appendChild(document.createTextNode(verse.bn));

    wrap.append(num, arabic, english, bangla);
    reader.appendChild(wrap);
  });
}

function renderNames() {
  const container = document.getElementById("names-list");
  const search = document.getElementById("names-search");
  if (!container) return;

  const query = (search?.value || "").trim().toLowerCase();
  const matches = NAMES.filter((name) => {
    const haystack = `${name.ar} ${name.transliteration} ${name.en} ${name.bn}`.toLowerCase();
    return !query || haystack.includes(query);
  });

  container.innerHTML = "";
  matches.forEach((name) => {
    const row = document.createElement("div");
    row.className = "name-row";

    const idx = document.createElement("b");
    idx.textContent = name.index;

    const body = document.createElement("span");

    const arabic = document.createElement("span");
    arabic.className = "name-arabic";
    arabic.lang = "ar";
    arabic.dir = "rtl";
    arabic.textContent = name.ar;

    const trans = document.createElement("strong");
    trans.textContent = name.transliteration;

    const meaning = document.createElement("span");
    meaning.textContent = currentLanguage === "bn" ? name.bn : name.en;

    body.append(arabic, trans, meaning);
    row.append(idx, body);
    container.appendChild(row);
  });

  if (!matches.length) {
    const empty = document.createElement("div");
    empty.className = "name-empty";
    empty.textContent = currentLanguage === "bn" ? "কোনো নাম মেলেনি।" : "No names match your search.";
    container.appendChild(empty);
  }
}

function populateDuaSelect() {
  const select = document.getElementById("dua-select");
  if (!select) return;

  const previous = select.value || DUAS[0].id;
  select.innerHTML = "";
  DUAS.forEach((dua) => {
    const option = document.createElement("option");
    option.value = dua.id;
    option.textContent = currentLanguage === "bn" ? dua.title.bn : dua.title.en;
    select.appendChild(option);
  });
  select.value = DUAS.some((dua) => dua.id === previous) ? previous : DUAS[0].id;
}

function renderDua() {
  const select = document.getElementById("dua-select");
  const reader = document.getElementById("dua-reader");
  if (!select || !reader) return;

  const dua = DUAS.find((item) => item.id === select.value) || DUAS[0];
  reader.innerHTML = "";
  const block = document.createElement("div");
  block.className = "dua-block";

  const title = document.createElement("strong");
  title.textContent = currentLanguage === "bn" ? dua.title.bn : dua.title.en;

  const arabic = document.createElement("p");
  arabic.className = "dua-arabic";
  arabic.lang = "ar";
  arabic.dir = "rtl";
  arabic.textContent = dua.ar;

  const meaning = document.createElement("p");
  meaning.className = "dua-meaning";
  meaning.textContent = currentLanguage === "bn" ? dua.bn : dua.en;

  block.append(title, arabic, meaning);
  reader.appendChild(block);
}

function renderGuide() {
  const list = document.getElementById("guide-list");
  if (!list) return;

  list.innerHTML = "";
  GUIDE_STEPS[currentGuide].forEach((step) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = currentLanguage === "bn" ? step.bn : step.en;
    const text = document.createElement("p");
    text.textContent = currentLanguage === "bn" ? step.textBn : step.textEn;
    item.append(title, text);
    list.appendChild(item);
  });
}

function initScrollReveals() {
  const targets = document.querySelectorAll(
    ".section-copy, .feature-card, .worship-panel, .seo-grid article, .spiritual-inner, .faq-list details, .footer-card, .site-footer > *"
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
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  targets.forEach((target) => observer.observe(target));
}

function initStickyHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  let ticking = false;
  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true }
  );

  update();
}

function initBackToTop() {
  const button = document.getElementById("back-to-top");
  if (!button) return;

  let ticking = false;
  const update = () => {
    button.classList.toggle("is-visible", window.scrollY > 600);
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true }
  );

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  update();
}

function initYearStamp() {
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

function schedulePrayerRefresh() {
  if (prayerRefreshTimer) clearInterval(prayerRefreshTimer);
  prayerRefreshTimer = setInterval(() => {
    if (lastPrayerTimes) {
      renderPrayerRows(lastPrayerTimes);
    }
  }, NEXT_PRAYER_TICK_MS);
  setInterval(() => {
    renderSalahTimes();
  }, PRAYER_REFRESH_MS);
}

document.querySelectorAll(".lang-option").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

document.getElementById("city-select")?.addEventListener("change", (event) => {
  const value = event.target.value;
  if (value === "__current") return;
  currentCoords = CITIES.find((city) => city.name === value) || CITIES[0];
  renderSalahTimes();
});

document.getElementById("geo-button")?.addEventListener("click", (event) => {
  const button = event.currentTarget;
  if (!navigator.geolocation) {
    setStatus("salah-status", "geoUnsupported", "warn");
    return;
  }

  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = t("geoLocating");
  setStatus("salah-status", "geoLocating", "loading");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentCoords = {
        name: "Current location",
        bn: "বর্তমান লোকেশন",
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        tz: -new Date().getTimezoneOffset() / 60
      };
      populateCitySelect();
      button.disabled = false;
      button.textContent = originalLabel || t("geoButton");
      renderSalahTimes();
    },
    (err) => {
      const key = err && err.code === err.PERMISSION_DENIED ? "geoDenied" : "geoUnavailable";
      setStatus("salah-status", key, "warn");
      button.disabled = false;
      button.textContent = originalLabel || t("geoButton");
    },
    { timeout: 8000, maximumAge: 5 * 60 * 1000 }
  );
});

document.getElementById("quran-surah")?.addEventListener("change", renderQuran);

document.querySelectorAll(".reader-lang").forEach((button) => {
  button.addEventListener("click", () => {
    currentQuranLanguage = button.dataset.readerLang;
    document.querySelectorAll(".reader-lang").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderQuran();
  });
});

document.getElementById("names-search")?.addEventListener("input", renderNames);
document.getElementById("dua-select")?.addEventListener("change", renderDua);

document.querySelectorAll(".guide-tab").forEach((button) => {
  button.addEventListener("click", () => {
    currentGuide = button.dataset.guide;
    document.querySelectorAll(".guide-tab").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    renderGuide();
  });
});

setLanguage(safeStorage("get", "wasilah-lang") || "en");
applyStoreLinks();
smartRedirect();
initScrollReveals();
initStickyHeader();
initBackToTop();
initYearStamp();
schedulePrayerRefresh();
