/**
 * David Barbershop – booking backend (Google Apps Script).
 *
 * What it does with each booking from the website:
 *   1. Checks David's Google Calendar so the time isn't already taken.
 *   2. Creates an event in that calendar (shows up on his phone).
 *   3. Adds a row to the "Bookinger" sheet in this spreadsheet.
 *   4. Emails David, and emails the customer if they gave an address.
 *
 * It also tells the website which times are busy. It only sends start and end
 * times, never names or phone numbers. Anything in the calendar counts as busy,
 * so David can block a lunch break, a day off or a holiday by adding an event.
 *
 * Setup steps are in ../README.md ("Receiving bookings").
 */

var CONFIG = {
  CALENDAR_ID: "primary",          // "primary" = the Google account that deploys this script
  SHEET_NAME: "Bookinger",
  NOTIFY_EMAIL: "",                // "" = the account that deploys this script
  TIMEZONE: "Europe/Oslo",
  SHOP_NAME: "David Barbershop",
  SHOP_ADDRESS: "",                // shown in the calendar event and customer email
  EMAIL_CUSTOMER: true,
  MAX_RANGE_DAYS: 62
};

var HEADERS = ["Opprettet", "Referanse", "Dato", "Start", "Slutt", "Navn", "Telefon",
  "E-post", "Tjenester", "Minutter", "Pris (kr)", "Beskjed", "Språk"];

/* ---------- HTTP entry points ---------- */

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === "busy") {
    try {
      return json_({ ok: true, busy: busy_(p.from, p.to) });
    } catch (err) {
      return json_({ ok: false, error: "bad_request" });
    }
  }
  return json_({ ok: true, service: CONFIG.SHOP_NAME + " booking" });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return json_({ ok: false, error: "busy_server" });
  try {
    var b = parseBooking_(e);
    if (!b) return json_({ ok: false, error: "invalid" });

    var start = Utilities.parseDate(b.date + " " + b.startTime, CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm");
    var end = Utilities.parseDate(b.date + " " + b.endTime, CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm");
    if (end <= start) return json_({ ok: false, error: "invalid" });
    if (start.getTime() < Date.now()) return json_({ ok: false, error: "past" });

    var cal = calendar_();
    var clash = cal.getEvents(start, end).some(function (ev) {
      return ev.getStartTime() < end && ev.getEndTime() > start;
    });
    if (clash) return json_({ ok: false, error: "taken" });

    var services = b.services.map(function (s) { return s.name; }).join(", ");
    var description = [
      "Kunde: " + b.name,
      "Telefon: " + b.phone,
      b.email ? "E-post: " + b.email : "",
      "Tjenester: " + services,
      "Pris: " + b.totalPrice + " kr",
      b.note ? "Beskjed: " + b.note : "",
      "Ref: " + b.ref
    ].filter(String).join("\n");

    cal.createEvent(b.name + " – " + services, start, end, {
      description: description,
      location: CONFIG.SHOP_ADDRESS
    });

    sheet_().appendRow([new Date(), b.ref, b.date, b.startTime, b.endTime, b.name,
      "'" + b.phone, b.email, services, b.totalMinutes, b.totalPrice, b.note, b.language]);

    notify_(b, services, description);
    return json_({ ok: true, ref: b.ref });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: "server" });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Busy times ---------- */

function busy_(from, to) {
  var start = Utilities.parseDate(from + " 00:00", CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm");
  var end = nextMidnight_(Utilities.parseDate(to + " 00:00", CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm"));
  if (isNaN(start) || isNaN(end) || end <= start) throw new Error("bad range");
  if (end - start > CONFIG.MAX_RANGE_DAYS * 864e5) throw new Error("range too long");

  var out = [];
  calendar_().getEvents(start, end).forEach(function (ev) {
    var s = ev.getStartTime() < start ? start : ev.getStartTime();
    var e = ev.getEndTime() > end ? end : ev.getEndTime();
    out = out.concat(segments_(s, e));
  });
  return out;
}

/** Splits a time range into per-day pieces: {date, start, end} in minutes after midnight. */
function segments_(s, e) {
  var out = [];
  var cur = s;
  while (cur < e) {
    var mid = nextMidnight_(cur);
    var segEnd = e < mid ? e : mid;
    out.push({
      date: fmt_(cur, "yyyy-MM-dd"),
      start: minutes_(cur),
      end: segEnd.getTime() === mid.getTime() ? 1440 : minutes_(segEnd)
    });
    cur = segEnd;
  }
  return out;
}

function nextMidnight_(d) {
  var today = Utilities.parseDate(fmt_(d, "yyyy-MM-dd") + " 00:00", CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm");
  var tomorrow = new Date(today.getTime() + 36 * 3600 * 1000); // safe across DST changes
  return Utilities.parseDate(fmt_(tomorrow, "yyyy-MM-dd") + " 00:00", CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm");
}

function minutes_(d) { return Number(fmt_(d, "H")) * 60 + Number(fmt_(d, "m")); }
function fmt_(d, pattern) { return Utilities.formatDate(d, CONFIG.TIMEZONE, pattern); }

/* ---------- Helpers ---------- */

function parseBooking_(e) {
  var b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return null; }
  var str = function (v, max) { return String(v == null ? "" : v).trim().slice(0, max); };
  var time = /^\d{2}:\d{2}$/;
  var clean = {
    ref: str(b.ref, 20),
    date: str(b.date, 10),
    startTime: str(b.startTime, 5),
    endTime: str(b.endTime, 5),
    name: str(b.name, 80),
    phone: str(b.phone, 30),
    email: str(b.email, 120),
    note: str(b.note, 500),
    language: str(b.language, 5),
    totalPrice: Number(b.totalPrice) || 0,
    totalMinutes: Number(b.totalMinutes) || 0,
    services: (Array.isArray(b.services) ? b.services : []).slice(0, 10).map(function (s) {
      return { name: str(s && s.name, 60) };
    })
  };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean.date) || !time.test(clean.startTime) || !time.test(clean.endTime)) return null;
  if (clean.name.length < 2 || clean.phone.replace(/\D/g, "").length < 8 || !clean.services.length) return null;
  if (clean.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) clean.email = "";
  return clean;
}

function notify_(b, services, description) {
  var to = CONFIG.NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
  MailApp.sendEmail({
    to: to,
    subject: "Ny booking: " + b.name + " – " + b.date + " kl. " + b.startTime,
    body: description + "\n\nDato: " + b.date + " kl. " + b.startTime + "–" + b.endTime
  });
  if (CONFIG.EMAIL_CUSTOMER && b.email) {
    var en = b.language === "en";
    MailApp.sendEmail({
      to: b.email,
      name: CONFIG.SHOP_NAME,
      replyTo: to,
      subject: (en ? "Booking confirmed – " : "Booking bekreftet – ") + CONFIG.SHOP_NAME,
      body: (en
        ? "Hi " + b.name + ",\n\nYou're booked in on " + b.date + " at " + b.startTime + ".\nServices: " + services +
          "\nPrice: " + b.totalPrice + " kr\nReference: " + b.ref +
          "\n\nNeed to cancel or move it? Reply to this email at least 24 hours before."
        : "Hei " + b.name + ",\n\nDu er booket inn " + b.date + " kl. " + b.startTime + ".\nTjenester: " + services +
          "\nPris: " + b.totalPrice + " kr\nReferanse: " + b.ref +
          "\n\nMå du avbestille eller flytte timen? Svar på denne e-posten senest 24 timer før.") +
        (CONFIG.SHOP_ADDRESS ? "\n\n" + CONFIG.SHOP_ADDRESS : "") + "\n\n– " + CONFIG.SHOP_NAME
    });
  }
}

function calendar_() {
  var cal = CONFIG.CALENDAR_ID === "primary"
    ? CalendarApp.getDefaultCalendar()
    : CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
  if (!cal) throw new Error("Calendar not found: " + CONFIG.CALENDAR_ID);
  return cal;
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Run this once from the editor to grant permissions and create the sheet. */
function setup() {
  sheet_();
  calendar_();
  Logger.log("Ready. Bookings go to calendar: " + calendar_().getName());
}
