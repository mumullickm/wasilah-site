/* ============================================================
   Wasilah - next prayer bar

   The astronomy is ported straight from the app
   (lib/features/prayer_times/prayer_astronomy.dart, by way of
   wasilah-mcp/src/prayer.js) so the bar shows the same times the app
   shows, not a third-party approximation. University of Islamic
   Sciences Karachi with Hanafi Asr, which is the app's default.

   Everything runs in the browser and nothing is ever sent anywhere.
   The page does not ask for location on load: it opens on Dhaka, and
   only reads coordinates if the visitor clicks the place name and
   grants permission. Granted coordinates go straight into the maths
   below and are remembered in localStorage, which, unlike a cookie,
   is never attached to a request and never leaves the device.
   ============================================================ */
(function () {
  var root = document.querySelector('[data-next-prayer]');
  if (!root) return;
  // the glow shell carries the hidden attribute, so the rim never shows
  // around an empty bar before the first time lands in it
  var shell = root.closest('.np-shell') || root;

  var DHAKA = { lat: 23.8103, lng: 90.4125, tz: 'Asia/Dhaka', mine: false };
  var STORE_KEY = 'wasilah:next-prayer-place';
  var FAJR_ANGLE = 18.0;
  var ISHA_ANGLE = 18.0;
  var SHADOW_FACTOR = 2; // Hanafi, as the app defaults to for Bangladesh
  var HORIZON = 0.833;

  var lang = root.getAttribute('data-lang') === 'bn' ? 'bn' : 'en';
  var COPY = lang === 'bn'
    ? {
        names: { fajr: 'ফজর', dhuhr: 'যোহর', asr: 'আসর', maghrib: 'মাগরিব', isha: 'এশা' },
        dhaka: 'ঢাকা', mine: 'আপনার অবস্থান', locating: 'খোঁজা হচ্ছে…', blocked: 'অনুমতি মেলেনি',
        useMine: 'আপনার অবস্থান অনুযায়ী দেখুন', useDhaka: 'ঢাকায় ফিরে যান',
        locale: 'bn-BD'
      }
    : {
        names: { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' },
        dhaka: 'Dhaka', mine: 'Your location', locating: 'Locating…', blocked: 'Permission blocked',
        useMine: 'Use my location instead', useDhaka: 'Switch back to Dhaka',
        locale: 'en-US'
      };

  var nameEl = root.querySelector('[data-np-name]');
  var atEl = root.querySelector('[data-np-at]');
  var countEl = root.querySelector('[data-np-count]');
  var secsEl = root.querySelector('[data-np-secs]');
  var progressEl = root.querySelector('[data-np-progress]');
  var placeEl = root.querySelector('[data-np-place]');

  /* ---- solar maths (Meeus / PrayTimes.org, public domain) ---- */
  var DEG = Math.PI / 180;
  function sinD(d) { return Math.sin(d * DEG); }
  function cosD(d) { return Math.cos(d * DEG); }
  function tanD(d) { return Math.tan(d * DEG); }
  function asinD(v) { return Math.asin(v) / DEG; }
  function acosD(v) { return Math.acos(v) / DEG; }
  function atanD(v) { return Math.atan(v) / DEG; }
  function atan2D(y, x) { return Math.atan2(y, x) / DEG; }
  function norm360(d) { var r = d % 360; return r < 0 ? r + 360 : r; }

  function julianDate(year, month, day) {
    var y = year, m = month;
    if (m <= 2) { y -= 1; m += 12; }
    var a = Math.floor(y / 100);
    var b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
  }

  function solarPosition(jd) {
    var d = jd - 2451545.0;
    var g = norm360(357.529 + 0.98560028 * d);
    var q = norm360(280.459 + 0.98564736 * d);
    var l = norm360(q + 1.915 * sinD(g) + 0.02 * sinD(2 * g));
    var e = 23.439 - 0.00000036 * d;
    var raHours = atan2D(cosD(e) * sinD(l), cosD(l)) / 15.0;
    return {
      declination: asinD(sinD(e) * sinD(l)),
      equationOfTime: (q / 15.0 - raHours) * 60.0
    };
  }

  function hourAngle(angle, lat, decl) {
    var cosH = (-sinD(angle) - sinD(lat) * sinD(decl)) / (cosD(lat) * cosD(decl));
    if (cosH > 1) return 0;
    if (cosH < -1) return 180;
    return acosD(cosH);
  }

  function asrHourAngle(lat, decl, factor) {
    var asrAngle = atanD(1.0 / (factor + tanD(Math.abs(lat - decl))));
    return hourAngle(-asrAngle, lat, decl);
  }

  /* ---- the place currently being shown ---------------------- */
  var place = DHAKA;
  var zoneParts = null;
  var timeFormat = null;

  function useZone(tz) {
    zoneParts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    });
    timeFormat = new Intl.DateTimeFormat(COPY.locale, {
      timeZone: tz, hour: 'numeric', minute: '2-digit'
    });
  }

  function partsAt(instant) {
    var p = {};
    var list = zoneParts.formatToParts(instant);
    for (var i = 0; i < list.length; i++) p[list[i].type] = list[i].value;
    return p;
  }

  /* DST-correct UTC offset for the active zone, anchored near local noon. */
  function utcOffsetHours(instant) {
    var p = partsAt(instant);
    var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    return (asUTC - instant.getTime()) / 3600000;
  }

  /* Prayer instants (epoch ms) for one local calendar date. */
  function dayTimes(year, month, day) {
    var utcNoon = new Date(Date.UTC(year, month - 1, day, 12));
    var tz = utcOffsetHours(new Date(utcNoon.getTime() - utcOffsetHours(utcNoon) * 3600000));
    var jd = julianDate(year, month, day) + (12.0 - place.lng / 15.0) / 24.0 - tz / 24.0;
    var sun = solarPosition(jd);
    var decl = sun.declination;
    var lat = place.lat;
    var dhuhr = 12.0 + tz - place.lng / 15.0 - sun.equationOfTime / 60.0;

    var hours = {
      fajr: dhuhr - hourAngle(FAJR_ANGLE, lat, decl) / 15.0,
      dhuhr: dhuhr,
      asr: dhuhr + asrHourAngle(lat, decl, SHADOW_FACTOR) / 15.0,
      maghrib: dhuhr + hourAngle(HORIZON, lat, decl) / 15.0,
      isha: dhuhr + hourAngle(ISHA_ANGLE, lat, decl) / 15.0
    };

    var midnightUTC = Date.UTC(year, month - 1, day) - tz * 3600000;
    var order = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    var out = [];
    for (var i = 0; i < order.length; i++) {
      var key = order[i];
      if (!isFinite(hours[key])) continue;
      // round to the displayed minute so the countdown hits zero exactly when
      // the printed time arrives, rather than a few seconds either side
      var at = midnightUTC + Math.round(hours[key] * 60) * 60000;
      out.push({ key: key, at: at });
    }
    return out;
  }

  /* Yesterday, today and tomorrow locally, so there is always a previous
     prayer to measure progress from and a next one to count down to. */
  function schedule(now) {
    var p = partsAt(now);
    var base = Date.UTC(+p.year, +p.month - 1, +p.day);
    var all = [];
    for (var offset = -1; offset <= 1; offset++) {
      var d = new Date(base + offset * 86400000);
      all = all.concat(dayTimes(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()));
    }
    all.sort(function (a, b) { return a.at - b.at; });
    return all;
  }

  var BN_DIGITS = '০১২৩৪৫৬৭৮৯';
  function digits(s) {
    if (lang !== 'bn') return s;
    return s.replace(/\d/g, function (c) { return BN_DIGITS.charAt(+c); });
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  var times = null;
  var current = null;

  function tick() {
    var now = Date.now();
    if (!times || now >= times[times.length - 2].at) times = schedule(new Date(now));

    var idx = -1;
    for (var i = 0; i < times.length; i++) {
      if (times[i].at > now) { idx = i; break; }
    }
    if (idx < 1) return; // outside the three-day window, next tick rebuilds

    var next = times[idx];
    var prev = times[idx - 1];

    if (current !== next.at) {
      current = next.at;
      nameEl.textContent = COPY.names[next.key];
      atEl.textContent = timeFormat.format(new Date(next.at));
      root.setAttribute('data-np-current', next.key);
    }

    var left = Math.max(0, next.at - now);
    var total = Math.round(left / 1000);
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    countEl.textContent = digits(pad(h) + ':' + pad(m));
    secsEl.textContent = digits(':' + pad(s));

    var span = next.at - prev.at;
    var done = span > 0 ? Math.min(1, Math.max(0, (now - prev.at) / span)) : 0;
    progressEl.style.transform = 'scaleX(' + done.toFixed(4) + ')';
  }

  /* ---- location, only ever on a click ----------------------- */
  function store(value) {
    try {
      if (value) window.localStorage.setItem(STORE_KEY, JSON.stringify(value));
      else window.localStorage.removeItem(STORE_KEY);
    } catch (err) {
      // private mode, or storage blocked. The bar still works for this visit.
    }
  }

  function restore() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(STORE_KEY));
      if (!saved || typeof saved.lat !== 'number' || typeof saved.lng !== 'number') return null;
      return saved;
    } catch (err) {
      return null;
    }
  }

  function browserZone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || DHAKA.tz;
    } catch (err) {
      return DHAKA.tz;
    }
  }

  function apply(next) {
    place = next;
    useZone(place.tz);
    times = null;
    current = null;
    if (placeEl) {
      placeEl.textContent = place.mine ? COPY.mine : COPY.dhaka;
      placeEl.setAttribute('aria-label', place.mine ? COPY.useDhaka : COPY.useMine);
      placeEl.title = place.mine ? COPY.useDhaka : COPY.useMine;
      placeEl.setAttribute('data-np-mine', place.mine ? 'true' : 'false');
    }
    tick();
  }

  function initPlaceToggle() {
    if (!placeEl) return;
    if (!navigator.geolocation || !window.isSecureContext) {
      // nothing to offer, so leave a plain label rather than a dead control
      placeEl.replaceWith(document.createTextNode(COPY.dhaka));
      placeEl = null;
      return;
    }

    placeEl.addEventListener('click', function () {
      if (place.mine) {
        store(null);
        apply(DHAKA);
        return;
      }
      placeEl.textContent = COPY.locating;
      placeEl.disabled = true;
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          placeEl.disabled = false;
          var mine = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            tz: browserZone(),
            mine: true
          };
          // only the two numbers, and only on this device
          store({ lat: mine.lat, lng: mine.lng });
          apply(mine);
        },
        function () {
          placeEl.disabled = false;
          placeEl.textContent = COPY.blocked;
          window.setTimeout(function () { apply(place); }, 2600);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
      );
    });
  }

  try {
    var saved = restore();
    apply(saved ? { lat: saved.lat, lng: saved.lng, tz: browserZone(), mine: true } : DHAKA);
    initPlaceToggle();
    shell.hidden = false;
    setInterval(tick, 1000);
    // a backgrounded tab throttles the interval, so resync on return
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) tick();
    });
  } catch (err) {
    // never let a clock bug take the hero down with it
    shell.remove();
  }
})();
