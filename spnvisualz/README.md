# Spnvisualz

A new static website for Spnvisualz (music videos, visualizers, cover art and social content).
It's plain HTML, CSS and JS with no build step. It lives in this folder and is separate from the
existing spnvisualz.com, which is not touched.

The design follows overworldaudio.com: a full-screen, misty blue landscape with ringed ridges
and glowing rivers, drawn live in WebGL (`js/world.js`, no image files). It opens on
"Building unforgettable visual experiences". From there, scrolling, swiping, the arrow keys or the
corner arrows move through projects. Each project has its own coloured orb and camera angle, a client
line, a serif title and a "View project" button. Projects, Studio and Contact open as misted panels
over the world. Visitors can pause the animation from the menu, and it stays still for anyone who has
"reduce motion" turned on.

## Editing content

Everything you'd normally change is in [`js/config.js`](js/config.js):

- **`projects`**: the slides. The five that ship with the site are **samples** (their client line
  reads "Sample project"). Replace them with real projects: set `client`, `title`, `type`, `orb`
  (the orb's colour), a short `text`, and a `url` so "Watch the project" links to the video.
  Then remove `sample: true`.
- **`socials`**: links to Instagram, YouTube, TikTok and Vimeo. Empty values are hidden.
- **`formEndpoint`**: where the project form sends its details. Any URL that accepts a JSON `POST`
  works (Formspree, Getform, a Make or Zapier webhook). While it's empty the form is in preview mode:
  nothing is sent and the visitor gets a copy of their message instead.

The Studio text, services and process steps are written directly in `index.html`.

## Running locally

```sh
cd spnvisualz
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publishing

Upload the folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages). Point a
new domain or subdomain at it; the existing spnvisualz.com stays as it is until you decide to switch.
