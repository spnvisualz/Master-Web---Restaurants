/*
 * David Barbershop – all business details live here.
 * Edit this file to change prices, opening hours, photos and contact info.
 * Empty strings are hidden on the site, so nothing half-finished shows up.
 */
window.SHOP = {
  name: "David Barbershop",
  barber: "David Bereket",
  instagram: "david_bereket",
  instagramUrl: "https://www.instagram.com/david_bereket/",

  // Contact – TODO: fill in. Leave "" to hide the row.
  phone: "",            // e.g. "+47 900 00 000"
  email: "",            // e.g. "booking@davidbarbershop.no"
  address: "",          // e.g. "Storgata 1, 0155 Oslo"
  mapsUrl: "",          // Google Maps link to the shop

  currency: "kr",

  // Opening hours per weekday (0 = Sunday … 6 = Saturday). null = closed.
  hours: {
    1: ["10:00", "19:00"],
    2: ["10:00", "19:00"],
    3: ["10:00", "19:00"],
    4: ["10:00", "20:00"],
    5: ["10:00", "20:00"],
    6: ["10:00", "17:00"],
    0: null
  },

  // Booking rules
  slotStep: 15,        // minutes between start times
  leadMinutes: 60,     // earliest booking is this many minutes from now
  daysAhead: 30,       // how far ahead customers can book
  cancelHours: 24,     // free cancellation window

  /*
   * Where bookings are sent. Leave "" for preview mode (bookings are only kept
   * in the visitor's own browser). Any endpoint that accepts a JSON POST works:
   * Formspree, a Google Apps Script web app, Make/Zapier webhook, or your own API.
   * See README.md.
   */
  bookingEndpoint: "",

  categories: [
    { id: "fade",  name: { no: "Fades & klipp", en: "Fades & cuts" } },
    { id: "beard", name: { no: "Skjegg",        en: "Beard" } },
    { id: "extra", name: { no: "Barn & tillegg", en: "Kids & add-ons" } }
  ],

  // TODO: confirm prices and durations with David.
  services: [
    { id: "skinfade", cat: "fade", min: 45, price: 450,
      name: { no: "Skin fade", en: "Skin fade" },
      desc: { no: "Fade helt ned til huden, klipp på toppen og rene konturer.", en: "Fade down to the skin, cut on top and clean outlines." } },
    { id: "skinfade-deluxe", cat: "fade", min: 60, price: 500,
      name: { no: "Skin fade deluxe", en: "Skin fade deluxe" },
      desc: { no: "Skin fade med vask, varmt håndkle og styling.", en: "Skin fade with wash, hot towel and styling." } },
    { id: "taper", cat: "fade", min: 40, price: 400,
      name: { no: "Taper / low fade", en: "Taper / low fade" },
      desc: { no: "Myk overgang ved nakke og tinninger.", en: "Soft blend at the neckline and temples." } },
    { id: "haircut", cat: "fade", min: 30, price: 380,
      name: { no: "Herreklipp", en: "Men's haircut" },
      desc: { no: "Saks eller maskin, uten fade.", en: "Scissors or clippers, no fade." } },
    { id: "fade-beard", cat: "beard", min: 60, price: 600,
      name: { no: "Skin fade + skjegg", en: "Skin fade + beard" },
      desc: { no: "Full fade, skjeggtrim og linjer med barberkniv.", en: "Full fade, beard trim and razor line-up." } },
    { id: "beard", cat: "beard", min: 20, price: 250,
      name: { no: "Skjeggtrim", en: "Beard trim" },
      desc: { no: "Form, lengde og skarpe linjer.", en: "Shape, length and sharp lines." } },
    { id: "hot-towel", cat: "beard", min: 30, price: 320,
      name: { no: "Barbering med varmt håndkle", en: "Hot towel shave" },
      desc: { no: "Klassisk barbering med kniv, varmt håndkle og balm.", en: "Classic razor shave with hot towel and balm." } },
    { id: "kids", cat: "extra", min: 30, price: 300,
      name: { no: "Barneklipp (under 12)", en: "Kids cut (under 12)" },
      desc: { no: "Fade eller klassisk klipp for de små.", en: "Fade or classic cut for the little ones." } },
    { id: "design", cat: "extra", min: 10, price: 50,
      name: { no: "Linjer / design", en: "Lines / design" },
      desc: { no: "Tillegg: linjer eller mønster i fade.", en: "Add-on: lines or a pattern in the fade." } },
    { id: "lineup", cat: "extra", min: 15, price: 150,
      name: { no: "Line-up", en: "Line-up" },
      desc: { no: "Kun konturer foran og i nakken.", en: "Outline only, front and neckline." } }
  ],

  /*
   * Gallery photos. Save photos from Instagram into images/gallery/ with these
   * file names (or change the paths). A tile with a missing photo shows a
   * styled placeholder instead.
   */
  gallery: [
    { src: "images/gallery/01.jpg", label: "Skin fade",   guard: "#0 → #2" },
    { src: "images/gallery/02.jpg", label: "Burst fade",  guard: "#0 → #1½" },
    { src: "images/gallery/03.jpg", label: "Low taper",   guard: "#½ → #3" },
    { src: "images/gallery/04.jpg", label: "Drop fade",   guard: "#0 → #2" },
    { src: "images/gallery/05.jpg", label: "Fade + beard", guard: "#0 → #3" },
    { src: "images/gallery/06.jpg", label: "Mid fade",    guard: "#0 → #2" }
  ],

  /*
   * Optional: paste links to individual Instagram posts, e.g.
   * "https://www.instagram.com/p/ABC123xyz/". When this list has links, the
   * site shows the real Instagram posts (loaded live from Instagram) instead
   * of the photo grid above.
   */
  instagramPosts: []
};
