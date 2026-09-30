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

### Receiving bookings (where David sees them)

Right now bookings are only saved in the visitor's browser (preview mode). The recommended setup
is free and uses David's own Google account. Every booking then:

- appears as an event in **David's Google Calendar**, so it shows up on his phone;
- is added as a row in a **Google Sheet** called "Bookinger";
- sends **David an email**, and sends the customer a confirmation if they gave an email.

The site reads his calendar and hides every time that is taken. **Anything in the calendar
blocks booking**, so David can block a lunch break, a day off or a holiday just by adding an event.
If he deletes a booking from the calendar, that time opens up again. The site only gets start and
end times from the calendar, never names or phone numbers.

**One-time setup (about 10 minutes, on David's Google account):**

1. Create a new Google Sheet, e.g. "David Barbershop – bookinger".
2. In the sheet, open **Extensions → Apps Script**. Delete what's there and paste in the contents of
   [`apps-script/Code.gs`](apps-script/Code.gs). If you like, fill in `SHOP_ADDRESS` at the top. Save.
3. Choose the `setup` function in the toolbar and click **Run**. Approve the permissions
   (Calendar, Sheets, send email). This creates the "Bookinger" tab.
4. Click **Deploy → New deployment**, choose the type **Web app**, and set:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
5. Click **Deploy** and copy the web app URL (`https://script.google.com/macros/s/…/exec`).
6. Paste it into `bookingEndpoint` in `js/config.js` and publish the site.

After editing `Code.gs` later, use **Deploy → Manage deployments → Edit → New version**, so the URL stays the same.

Tips:
- To keep bookings apart from private events, create a separate calendar called "Barbershop"
  and put its ID (Calendar settings → *Integrate calendar*) in `CALENDAR_ID`. Then only events
  in that calendar block booking times.
- Bookings are checked against the calendar under a lock, so two customers can't get the
  same time. The second one is asked to choose another time.
- Times are handled in Norwegian time (`Europe/Oslo`).

**Other options.** Any URL that accepts a JSON `POST` also works (Formspree, Make/Zapier,
your own API), but then the site can't hide times that are already booked. A booking platform
such as Timma (the one Bladez uses) or Setmore gives David an app with SMS reminders, for a
monthly fee. In that case, link the "Bestill time" buttons to that platform instead.

Each booking is sent as JSON like this:

```json
{
  "ref": "DB-7KQ2M", "date": "2026-10-02", "startTime": "10:30", "endTime": "11:15",
  "services": [{ "id": "skinfade", "name": "Skin fade", "min": 45, "price": 450 }],
  "totalPrice": 450, "totalMinutes": 45, "barber": "David Bereket",
  "name": "…", "phone": "…", "email": "…", "note": "…", "language": "no"
}
```

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
