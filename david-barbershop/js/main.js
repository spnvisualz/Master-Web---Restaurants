(function () {
  "use strict";

  var SHOP = window.SHOP;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Storage (safe) ---------- */
  var mem = {};
  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return key in mem ? mem[key] : fallback; }
  }
  function save(key, value) {
    mem[key] = value;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
  }

  /* ---------- Language ---------- */
  var STRINGS = {
    no: {
      "nav.services": "Priser", "nav.cuts": "Kutt", "nav.about": "Om David", "nav.info": "Åpningstider",
      "cta.book": "Bestill time", "cta.cuts": "Se kuttene",
      "hero.lede": "Skarpe fades, rene linjer og skjegg som sitter. Velg tjeneste, finn en ledig tid og bestill på under ett minutt.",
      "hero.next": "Neste ledige time: {when}",
      "services.eyebrow": "Tjenester", "services.title": "Priser", "services.book": "Bestill",
      "cuts.eyebrow": "Fra Instagram", "cuts.title": "Ferske kutt", "cuts.more": "Flere kutt på Instagram",
      "about.eyebrow": "Barberen",
      "about.p1": "Hver klipp starter med en kort prat: hvor lav skal fadingen gå, hvor mye skal bli igjen på toppen, og hvordan pleier du å style håret. Så jobber David seg opp guard for guard til overgangen er helt jevn.",
      "about.p2": "Resultatet er en fade som ser like ren ut fra siden som rett forfra, med skarpe linjer ved panne, tinninger og nakke.",
      "about.pt1": "Skin, low, mid og burst fades", "about.pt2": "Linjer og design", "about.pt3": "Skjegg med varmt håndkle og kniv",
      "booking.eyebrow": "Online booking", "booking.title": "Bestill time",
      "step.1": "Tjeneste", "step.2": "Tid", "step.3": "Dine detaljer", "step.4": "Bekreftet",
      "p1.hint": "Velg én eller flere tjenester.",
      "p2.barber": "Barber", "p2.date": "Velg dag", "p2.time": "Ledige tider", "p2.timeFor": "Ledige tider {day}",
      "p2.none": "Ingen ledige tider denne dagen. Prøv en annen dag.",
      "p2.closed": "Stengt",
      "f.name": "Navn", "f.phone": "Mobilnummer", "f.email": "E-post", "f.optional": "(valgfritt)",
      "f.note": "Beskjed til David", "f.notePh": "F.eks. «Lav skin fade, litt av toppen»",
      "f.policy": "Jeg godtar avbestillingsvilkårene: avbestill senest {h} timer før. Ved senere avbestilling eller ved å ikke møte opp kan 100 % av prisen bli belastet.",
      "err.name": "Skriv inn navnet ditt.", "err.phone": "Skriv inn et gyldig mobilnummer (minst 8 siffer).",
      "err.email": "Sjekk e-postadressen.", "err.policy": "Du må godta vilkårene for å bestille.",
      "err.submit": "Bookingen ble ikke sendt. Prøv igjen, eller send David en melding på Instagram.",
      "c.ref": "Referanse", "c.title": "Du er booket inn!",
      "c.note": "Kom gjerne 5 minutter før. Trenger du å flytte timen, gi beskjed senest {h} timer før.",
      "c.ics": "Legg til i kalender", "c.again": "Ny booking",
      "c.preview": "Forhåndsvisning: bookingen er bare lagret i denne nettleseren. Legg inn en bookingEndpoint i js/config.js for å motta bookinger.",
      "s.label": "Din booking", "s.empty": "Ingen tjenester valgt ennå.", "s.back": "Tilbake",
      "s.next": "Neste", "s.pickTime": "Velg tid", "s.confirm": "Bekreft booking", "s.sending": "Sender…", "s.done": "Ferdig",
      "s.min": "{m} min",
      "info.eyebrow": "Åpningstider", "info.contact": "Kontakt", "info.policy": "Avbestilling",
      "info.policyText": "Avbestill eller flytt timen senest {h} timer før. Ved senere avbestilling eller ved å ikke møte opp forbeholder vi oss retten til å belaste 100 % av prisen.",
      "info.closed": "Stengt", "info.ig": "Instagram (send DM)", "info.phone": "Telefon", "info.email": "E-post", "info.address": "Adresse",
      "today": "i dag", "tomorrow": "i morgen", "at": "kl.",
      "lang.switch": "Switch to English"
    },
    en: {
      "nav.services": "Prices", "nav.cuts": "Cuts", "nav.about": "About", "nav.info": "Hours",
      "cta.book": "Book now", "cta.cuts": "See the cuts",
      "hero.lede": "Sharp fades, clean lines and a beard that sits right. Pick a service, find a free slot and book in under a minute.",
      "hero.next": "Next free slot: {when}",
      "services.eyebrow": "Services", "services.title": "Prices", "services.book": "Book",
      "cuts.eyebrow": "From Instagram", "cuts.title": "Fresh cuts", "cuts.more": "More cuts on Instagram",
      "about.eyebrow": "The barber",
      "about.p1": "Every cut starts with a quick talk: how low the fade goes, how much stays on top, and how you usually style it. Then David works up guard by guard until the blend is seamless.",
      "about.p2": "The result is a fade that looks as clean from the side as it does straight on, with sharp lines at the forehead, temples and neck.",
      "about.pt1": "Skin, low, mid and burst fades", "about.pt2": "Lines and designs", "about.pt3": "Beard work with hot towel and razor",
      "booking.eyebrow": "Online booking", "booking.title": "Book an appointment",
      "step.1": "Service", "step.2": "Time", "step.3": "Your details", "step.4": "Confirmed",
      "p1.hint": "Choose one or more services.",
      "p2.barber": "Barber", "p2.date": "Choose a day", "p2.time": "Free times", "p2.timeFor": "Free times {day}",
      "p2.none": "No free times this day. Try another day.",
      "p2.closed": "Closed",
      "f.name": "Name", "f.phone": "Mobile number", "f.email": "Email", "f.optional": "(optional)",
      "f.note": "Note for David", "f.notePh": "E.g. “Low skin fade, a little off the top”",
      "f.policy": "I accept the cancellation policy: cancel at least {h} hours before. Late cancellations or no-shows may be charged 100% of the price.",
      "err.name": "Enter your name.", "err.phone": "Enter a valid mobile number (at least 8 digits).",
      "err.email": "Check the email address.", "err.policy": "Accept the policy to book.",
      "err.submit": "The booking wasn't sent. Try again, or message David on Instagram.",
      "c.ref": "Reference", "c.title": "You're booked!",
      "c.note": "Please arrive 5 minutes early. Need to move it? Let us know at least {h} hours before.",
      "c.ics": "Add to calendar", "c.again": "New booking",
      "c.preview": "Preview: this booking is only saved in this browser. Add a bookingEndpoint in js/config.js to receive bookings.",
      "s.label": "Your booking", "s.empty": "No services selected yet.", "s.back": "Back",
      "s.next": "Next", "s.pickTime": "Choose time", "s.confirm": "Confirm booking", "s.sending": "Sending…", "s.done": "Done",
      "s.min": "{m} min",
      "info.eyebrow": "Opening hours", "info.contact": "Contact", "info.policy": "Cancellation",
      "info.policyText": "Cancel or move your appointment at least {h} hours before. Late cancellations and no-shows may be charged 100% of the price.",
      "info.closed": "Closed", "info.ig": "Instagram (send a DM)", "info.phone": "Phone", "info.email": "Email", "info.address": "Address",
      "today": "today", "tomorrow": "tomorrow", "at": "at",
      "lang.switch": "Bytt til norsk"
    }
  };

  var lang = load("db-lang", "no") === "en" ? "en" : "no";
  function t(key, vars) {
    var s = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.no[key] || key;
    vars = vars || {};
    vars.h = vars.h || SHOP.cancelHours;
    return s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ""; });
  }
  function L(obj) { return obj[lang] || obj.no; }
  function locale() { return lang === "en" ? "en-GB" : "nb-NO"; }

  function applyStaticText() {
    document.documentElement.lang = lang === "en" ? "en" : "no";
    $$("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    $$("[data-i18n-ph]").forEach(function (el) { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
    var btn = $("#lang-toggle");
    btn.textContent = lang === "en" ? "NO" : "EN";
    btn.setAttribute("aria-label", t("lang.switch"));
  }

  /* ---------- Helpers ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function toMin(hhmm) { var p = hhmm.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function fmtTime(min) { return pad(Math.floor(min / 60)) + ":" + pad(min % 60); }
  function dateKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function fromKey(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function money(n) { return n.toLocaleString(locale()) + " " + SHOP.currency; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function svc(id) { return SHOP.services.filter(function (s) { return s.id === id; })[0]; }
  function dayLabel(d, withWeekday) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var diff = Math.round((fromKey(dateKey(d)) - today) / 864e5);
    if (diff === 0) return t("today");
    if (diff === 1) return t("tomorrow");
    return d.toLocaleDateString(locale(), withWeekday === false ? { day: "numeric", month: "long" } : { weekday: "long", day: "numeric", month: "long" });
  }

  /* ---------- Availability ---------- */
  function bookings() { return load("db-bookings", []); }

  function slotsFor(date, duration) {
    var h = SHOP.hours[date.getDay()];
    if (!h) return [];
    var open = toMin(h[0]), close = toMin(h[1]);
    var key = dateKey(date);
    var taken = bookings().filter(function (b) { return b.date === key; });
    var now = new Date();
    var earliest = key === dateKey(now) ? now.getHours() * 60 + now.getMinutes() + SHOP.leadMinutes : -1;
    if (key < dateKey(now)) return [];
    var out = [];
    for (var m = open; m + duration <= close; m += SHOP.slotStep) {
      if (m < earliest) continue;
      var clash = taken.some(function (b) { return m < b.end && m + duration > b.start; });
      if (!clash) out.push(m);
    }
    return out;
  }

  function bookableDays() {
    var days = [], d = new Date(); d.setHours(0, 0, 0, 0);
    for (var i = 0; i < SHOP.daysAhead; i++) {
      days.push(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i));
    }
    return days;
  }

  function nextFreeSlot(duration) {
    var days = bookableDays();
    for (var i = 0; i < days.length; i++) {
      var s = slotsFor(days[i], duration);
      if (s.length) return { date: days[i], min: s[0] };
    }
    return null;
  }

  /* ---------- Booking state ---------- */
  var state = { step: 1, selected: [], date: null, time: null, sending: false, last: null };

  function totals() {
    return state.selected.reduce(function (acc, id) {
      var s = svc(id); acc.min += s.min; acc.price += s.price; return acc;
    }, { min: 0, price: 0 });
  }

  /* ---------- Render: price list ---------- */
  function renderPriceList() {
    $("#price-list").innerHTML = SHOP.categories.map(function (c) {
      var rows = SHOP.services.filter(function (s) { return s.cat === c.id; }).map(function (s) {
        return '<div class="price-row">' +
          '<span class="nm">' + esc(L(s.name)) + '</span>' +
          '<span class="pr">' + money(s.price) + '</span>' +
          '<span class="ds">' + esc(L(s.desc)) + '</span>' +
          '<span class="mt"><span class="dur">' + t("s.min", { m: s.min }) + '</span>' +
          '<button class="quick" type="button" data-quick="' + s.id + '">' + t("services.book") + ' →</button></span>' +
          '</div>';
      }).join("");
      return '<div class="price-cat"><h3>' + esc(L(c.name)) + '</h3>' + rows + '</div>';
    }).join("");
  }

  /* ---------- Render: gallery ---------- */
  function renderGallery() {
    var root = $("#gallery");
    if (SHOP.instagramPosts && SHOP.instagramPosts.length) {
      root.className = "ig-embeds";
      root.innerHTML = SHOP.instagramPosts.map(function (url) {
        return '<blockquote class="instagram-media" data-instgrm-permalink="' + esc(url) + '" data-instgrm-version="14">' +
          '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(url) + '</a></blockquote>';
      }).join("");
      var s = document.createElement("script");
      s.async = true; s.src = "https://www.instagram.com/embed.js";
      document.body.appendChild(s);
      return;
    }
    root.innerHTML = SHOP.gallery.map(function (g) {
      return '<figure class="cut">' +
        '<div class="cut-ph" aria-hidden="true"></div>' +
        '<img src="' + esc(g.src) + '" alt="' + esc(g.label) + ' – David Barbershop" loading="lazy">' +
        '<figcaption><strong>' + esc(g.label) + '</strong><span>' + esc(g.guard || "") + '</span></figcaption>' +
        '</figure>';
    }).join("");
    $$("img", root).forEach(function (img) {
      img.addEventListener("error", function () { img.remove(); });
    });
  }

  /* ---------- Render: hours + contact ---------- */
  function renderInfo() {
    var order = [1, 2, 3, 4, 5, 6, 0];
    var today = new Date().getDay();
    var ref = new Date(2024, 0, 7); // a Sunday, used only for weekday names
    $("#hours").innerHTML = "<tbody>" + order.map(function (d) {
      var h = SHOP.hours[d];
      var name = new Date(ref.getFullYear(), 0, 7 + d).toLocaleDateString(locale(), { weekday: "long" });
      name = name.charAt(0).toUpperCase() + name.slice(1);
      var cls = (d === today ? "is-today " : "") + (h ? "" : "is-closed");
      return '<tr class="' + cls + '"><td>' + name + "</td><td>" + (h ? h[0] + "–" + h[1] : t("info.closed")) + "</td></tr>";
    }).join("") + "</tbody>";

    var rows = [];
    rows.push([t("info.ig"), '<a href="' + esc(SHOP.instagramUrl) + '" target="_blank" rel="noopener">@' + esc(SHOP.instagram) + "</a>"]);
    if (SHOP.phone) rows.push([t("info.phone"), '<a href="tel:' + esc(SHOP.phone.replace(/\s/g, "")) + '">' + esc(SHOP.phone) + "</a>"]);
    if (SHOP.email) rows.push([t("info.email"), '<a href="mailto:' + esc(SHOP.email) + '">' + esc(SHOP.email) + "</a>"]);
    if (SHOP.address) rows.push([t("info.address"), SHOP.mapsUrl ? '<a href="' + esc(SHOP.mapsUrl) + '" target="_blank" rel="noopener">' + esc(SHOP.address) + "</a>" : esc(SHOP.address)]);
    $("#contact").innerHTML = rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("");
  }

  function renderNextSlot() {
    var shortest = Math.min.apply(null, SHOP.services.filter(function (s) { return s.cat !== "extra"; }).map(function (s) { return s.min; }));
    var n = nextFreeSlot(shortest);
    var el = $("#next-slot");
    if (!n) { el.hidden = true; return; }
    $("#next-slot-text").textContent = t("hero.next", { when: dayLabel(n.date, false) + " " + t("at") + " " + fmtTime(n.min) });
    el.hidden = false;
  }

  /* ---------- Render: booking ---------- */
  function renderServicesPicker() {
    $("#svc-picker").innerHTML = SHOP.categories.map(function (c) {
      var items = SHOP.services.filter(function (s) { return s.cat === c.id; }).map(function (s) {
        var on = state.selected.indexOf(s.id) !== -1;
        return '<button type="button" class="svc" data-svc="' + s.id + '" aria-pressed="' + on + '">' +
          '<span class="box" aria-hidden="true"></span>' +
          '<span class="txt"><strong>' + esc(L(s.name)) + '</strong><small>' + esc(L(s.desc)) + '</small></span>' +
          '<span class="meta"><span>' + money(s.price) + '</span><small>' + t("s.min", { m: s.min }) + '</small></span>' +
          '</button>';
      }).join("");
      return '<div class="svc-group"><h3>' + esc(L(c.name)) + '</h3>' + items + '</div>';
    }).join("");
  }

  function renderDates() {
    var dur = totals().min || 30;
    var days = bookableDays();
    // keep the chosen day if it still has room, otherwise jump to the first open day
    if (state.date && !slotsFor(fromKey(state.date), dur).length) { state.date = null; state.time = null; }
    if (!state.date) {
      var first = days.filter(function (d) { return slotsFor(d, dur).length; })[0];
      state.date = first ? dateKey(first) : null;
    }
    $("#dates").innerHTML = days.map(function (d) {
      var key = dateKey(d);
      var open = slotsFor(d, dur).length > 0;
      var sel = key === state.date;
      return '<button type="button" class="date" role="option" data-date="' + key + '" aria-selected="' + sel + '"' + (open ? "" : " disabled") +
        ' aria-label="' + esc(d.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" })) + '">' +
        '<span class="dw">' + d.toLocaleDateString(locale(), { weekday: "short" }).replace(".", "") + '</span>' +
        '<span class="dn">' + d.getDate() + '</span>' +
        '<span class="dm">' + (SHOP.hours[d.getDay()] ? d.toLocaleDateString(locale(), { month: "short" }).replace(".", "") : t("p2.closed")) + '</span>' +
        '</button>';
    }).join("");
    renderTimes();
  }

  function renderTimes() {
    var root = $("#times");
    if (!state.date) { root.innerHTML = '<p class="times-empty">' + t("p2.none") + "</p>"; return; }
    var d = fromKey(state.date);
    $("#times-title").textContent = t("p2.timeFor", { day: dayLabel(d) });
    var slots = slotsFor(d, totals().min || 30);
    if (state.time != null && slots.indexOf(state.time) === -1) state.time = null;
    root.innerHTML = slots.length ? slots.map(function (m) {
      return '<button type="button" class="time" data-time="' + m + '" aria-pressed="' + (m === state.time) + '">' + fmtTime(m) + "</button>";
    }).join("") : '<p class="times-empty">' + t("p2.none") + "</p>";
  }

  function whenText() {
    if (!state.date || state.time == null) return "";
    var d = fromKey(state.date), tot = totals();
    var day = dayLabel(d);
    return day.charAt(0).toUpperCase() + day.slice(1) + ", " + fmtTime(state.time) + "–" + fmtTime(state.time + tot.min);
  }

  function renderSummary() {
    var tot = totals();
    $("#s-items").innerHTML = state.selected.map(function (id) {
      var s = svc(id); return "<li><span>" + esc(L(s.name)) + "</span><span>" + money(s.price) + "</span></li>";
    }).join("");
    $("#s-empty").hidden = state.selected.length > 0;
    var w = whenText();
    $("#s-when").hidden = !w || state.step === 4;
    $("#s-when").textContent = w;
    $("#s-dur").textContent = tot.min ? t("s.min", { m: tot.min }) : "";
    $("#s-total").textContent = money(tot.price);

    var back = $("#back-btn"), next = $("#next-btn");
    back.hidden = state.step === 1 || state.step === 4;
    $("#summary").classList.toggle("is-done", state.step === 4);
    if (state.step === 1) { next.textContent = t("s.pickTime"); next.disabled = !state.selected.length; }
    if (state.step === 2) { next.textContent = t("s.next"); next.disabled = state.time == null; }
    if (state.step === 3) { next.textContent = state.sending ? t("s.sending") : t("s.confirm"); next.disabled = state.sending; }
    if (state.step === 4) { next.textContent = t("c.again"); next.disabled = false; }
  }

  function renderStepper() {
    $$("#stepper li").forEach(function (li) {
      var n = +li.getAttribute("data-step");
      li.classList.toggle("is-active", n === state.step);
      li.classList.toggle("is-done", n < state.step);
      if (n === state.step) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    $$(".panel").forEach(function (p) { p.hidden = +p.getAttribute("data-panel") !== state.step; });
  }

  function renderBooking() {
    renderStepper();
    if (state.step === 1) renderServicesPicker();
    if (state.step === 2) renderDates();
    if (state.step === 4) renderConfirmation();
    renderSummary();
  }

  function goTo(step, scroll) {
    state.step = step;
    renderBooking();
    if (scroll) {
      var top = $("#stepper").getBoundingClientRect().top + window.scrollY - 90;
      if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top: top, behavior: "smooth" });
    }
  }

  /* ---------- Details form ---------- */
  function validate() {
    var f = $("#details-form").elements;
    var name = f.name.value.trim(), phone = f.phone.value.trim(), email = f.email.value.trim();
    var errs = {
      name: name.length < 2,
      phone: phone.replace(/\D/g, "").length < 8,
      email: email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      policy: !f.policy.checked
    };
    Object.keys(errs).forEach(function (k) {
      $('[data-err="' + k + '"]').classList.toggle("show", errs[k]);
      var field = f[k] && f[k].closest(".field");
      if (field) field.classList.toggle("has-err", errs[k]);
    });
    var firstBad = ["name", "phone", "email", "policy"].filter(function (k) { return errs[k]; })[0];
    if (firstBad) { f[firstBad].focus(); return null; }
    return { name: name, phone: phone, email: email, note: f.note.value.trim() };
  }

  function makeRef() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "DB-";
    for (var i = 0; i < 5; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
    return s;
  }

  function submit() {
    var details = validate();
    if (!details) return;
    var tot = totals();
    var booking = {
      ref: makeRef(),
      date: state.date,
      start: state.time,
      end: state.time + tot.min,
      startTime: fmtTime(state.time),
      endTime: fmtTime(state.time + tot.min),
      services: state.selected.map(function (id) { var s = svc(id); return { id: id, name: s.name.no, min: s.min, price: s.price }; }),
      totalPrice: tot.price,
      totalMinutes: tot.min,
      barber: SHOP.barber,
      name: details.name, phone: details.phone, email: details.email, note: details.note,
      language: lang,
      createdAt: new Date().toISOString()
    };
    $("#submit-error").classList.remove("show");
    state.sending = true; renderSummary();

    var send = SHOP.bookingEndpoint
      ? fetch(SHOP.bookingEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(booking)
        }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); })
      : Promise.resolve();

    send.then(function () {
      var all = bookings(); all.push(booking); save("db-bookings", all);
      state.last = booking;
      state.sending = false;
      $("#details-form").reset();
      goTo(4, true);
      renderNextSlot();
    }).catch(function () {
      state.sending = false;
      $("#submit-error").classList.add("show");
      renderSummary();
    });
  }

  function renderConfirmation() {
    var b = state.last;
    if (!b) return;
    $("#c-ref").textContent = b.ref;
    var d = fromKey(b.date);
    var day = d.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" });
    $("#c-when").textContent = day.charAt(0).toUpperCase() + day.slice(1) + ", " + b.startTime + "–" + b.endTime + " · David";
    $("#c-list").innerHTML = b.services.map(function (s) {
      var full = svc(s.id);
      return "<li><span>" + esc(full ? L(full.name) : s.name) + "</span><span>" + money(s.price) + "</span></li>";
    }).join("") + "<li><strong>Total</strong><strong>" + money(b.totalPrice) + "</strong></li>";
    $("#preview-note").hidden = !!SHOP.bookingEndpoint;
    $("#ics-btn").hidden = SHOP.icsEnabled === false;
  }

  function downloadIcs() {
    var b = state.last; if (!b) return;
    var d = b.date.replace(/-/g, "");
    var stamp = function (m) { return d + "T" + pad(Math.floor(m / 60)) + pad(m % 60) + "00"; };
    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//David Barbershop//Booking//NO", "BEGIN:VEVENT",
      "UID:" + b.ref + "@davidbarbershop",
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, ""),
      "DTSTART:" + stamp(b.start), "DTEND:" + stamp(b.end),
      "SUMMARY:" + SHOP.name + " – " + b.services.map(function (s) { return s.name; }).join(", "),
      "DESCRIPTION:Ref " + b.ref,
      SHOP.address ? "LOCATION:" + SHOP.address : "",
      "END:VEVENT", "END:VCALENDAR"
    ].filter(Boolean).join("\r\n");
    var url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    var a = document.createElement("a");
    a.href = url; a.download = "david-barbershop-" + b.ref + ".ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------- Events ---------- */
  document.addEventListener("click", function (e) {
    var q = e.target.closest("[data-quick]");
    if (q) {
      state.selected = [q.getAttribute("data-quick")];
      state.time = null;
      goTo(2, false);
      document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
      return;
    }
    var s = e.target.closest("[data-svc]");
    if (s) {
      var id = s.getAttribute("data-svc"), i = state.selected.indexOf(id);
      if (i === -1) state.selected.push(id); else state.selected.splice(i, 1);
      s.setAttribute("aria-pressed", i === -1);
      renderSummary();
      return;
    }
    var d = e.target.closest("[data-date]");
    if (d && !d.disabled) {
      state.date = d.getAttribute("data-date"); state.time = null;
      $$("#dates .date").forEach(function (b) { b.setAttribute("aria-selected", b === d); });
      renderTimes(); renderSummary();
      return;
    }
    var tm = e.target.closest("[data-time]");
    if (tm) {
      state.time = +tm.getAttribute("data-time");
      $$("#times .time").forEach(function (b) { b.setAttribute("aria-pressed", b === tm); });
      renderSummary();
    }
  });

  $("#next-btn").addEventListener("click", function () {
    if (state.step === 1 && state.selected.length) return goTo(2, true);
    if (state.step === 2 && state.time != null) { goTo(3, true); setTimeout(function () { $("#f-name").focus({ preventScroll: true }); }, 50); return; }
    if (state.step === 3) return submit();
    if (state.step === 4) { state.selected = []; state.date = null; state.time = null; state.last = null; goTo(1, true); }
  });
  $("#back-btn").addEventListener("click", function () { if (state.step > 1) goTo(state.step - 1, true); });
  $("#details-form").addEventListener("submit", function (e) { e.preventDefault(); submit(); });
  $("#again-btn").addEventListener("click", function () { $("#next-btn").click(); });
  $("#ics-btn").addEventListener("click", downloadIcs);

  $("#lang-toggle").addEventListener("click", function () {
    lang = lang === "en" ? "no" : "en";
    save("db-lang", lang);
    renderAll();
  });

  /* ---------- Boot ---------- */
  function renderAll() {
    applyStaticText();
    renderPriceList();
    renderInfo();
    renderNextSlot();
    renderBooking();
  }

  $("#year").textContent = new Date().getFullYear();
  renderGallery();
  renderAll();
})();
