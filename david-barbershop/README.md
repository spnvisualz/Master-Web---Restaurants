# David Barbershop

Static website for David Barbershop (Instagram: [@david_bereket](https://www.instagram.com/david_bereket/)).
It's plain HTML, CSS and JS with no build step. It's in Norwegian, with an English toggle.

Sections: hero, prices, the "Ferske kutt" gallery, about David, online booking, opening hours and contact.

## Online booking

The booking flow follows the Bladez Barbershop setup (Timma):

1. **Tjeneste**: choose one or more services. The time and price add up.
2. **Tid**: the barber is David. Choose a day from the next 30 days, then a free start time.
   A time only shows when the whole appointment fits before closing.
3. **Dine detaljer**: name, mobile number, optional email and a note. The customer must accept
   the 24-hour cancellation policy.
4. **Bekreftet**: a booking reference and an "Add to calendar" (.ics) button.

Each "Bestill →" link in the price list skips straight to step 2 with that service selected.

### Receiving bookings

Right now bookings are only saved in the visitor's browser (preview mode).
To receive them for real, set `bookingEndpoint` in `js/config.js` to any URL that accepts a JSON `POST`:

- **Formspree** (easiest): create a form at formspree.io and paste its endpoint. Every booking
  arrives as an email.
- **Google Apps Script**: a web app that appends each booking to a Google Sheet.
- **Make / Zapier webhook**: forward to email, SMS or Google Calendar.
- **Your own API**.

Each booking is sent as JSON like this:

```json
{
  "ref": "DB-7KQ2M", "date": "2026-10-02", "startTime": "10:30", "endTime": "11:15",
  "services": [{ "id": "skinfade", "name": "Skin fade", "min": 45, "price": 450 }],
  "totalPrice": 450, "totalMinutes": 45, "barber": "David Bereket",
  "name": "…", "phone": "…", "email": "…", "note": "…", "language": "no"
}
```

Note: with a plain email endpoint like Formspree, customers can't see slots that other people
have already booked. To block taken times for everyone, you need a backend that stores bookings
and returns them, or a booking service such as Timma or Setmore.

## Editing content

Everything is in **`js/config.js`**: services, prices, durations, opening hours, booking rules,
contact details, gallery and Instagram posts. Contact fields left empty are hidden.

### Photos from Instagram

There are two options:

- **Photo grid**: save 6 photos from Instagram into `images/gallery/` as `01.jpg` … `06.jpg`.
- **Live Instagram posts**: paste post links into `instagramPosts` in `js/config.js`,
  for example `"https://www.instagram.com/p/XXXXXXXX/"`. The site then shows the real posts via
  Instagram's embed script.

## Run locally

```sh
cd david-barbershop
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Upload the folder to any static host: Netlify (drag and drop), Vercel, Cloudflare Pages or GitHub Pages.
