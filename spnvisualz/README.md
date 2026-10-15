# Spnvisualz

A new static website for Spnvisualz (music videos, visualizers, cover art and social content).
It's plain HTML, CSS and JS with no build step. It lives in this folder and is separate from the
existing spnvisualz.com, which is not touched.

The theme is an "overworld" seen through a camera viewfinder: an animated contour map in the hero
with a "You are here" marker, a running 24 fps timecode, and services laid out as zones on the map.

Sections: hero, services ("Four zones, one look"), selected work, aspect ratios, process, and a
"Start a project" form.

## Editing content

Everything you'd normally change is in [`js/config.js`](js/config.js):

- **`projects`**: the portfolio cards. The six cards that ship with the site are **samples** (marked
  "Sample" on the card). Replace them with real projects, add a `url` (YouTube, Vimeo, Instagram)
  so the card opens the video, and remove `sample: true`. Each card's poster is drawn from its two
  `colors`, so no images are needed.
- **`socials`**: links to Instagram, YouTube, TikTok and Vimeo. Empty values are hidden.
- **`formEndpoint`**: where the project form sends its details. Any URL that accepts a JSON `POST`
  works (Formspree, Getform, a Make or Zapier webhook). While it's empty the form is in preview mode:
  nothing is sent and the visitor gets a copy of their message instead.

Service descriptions, the process steps and the aspect-ratio section are written directly in
`index.html`.

## Running locally

```sh
cd spnvisualz
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publishing

Upload the folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages). Point a
new domain or subdomain at it; the existing spnvisualz.com stays as it is until you decide to switch.
