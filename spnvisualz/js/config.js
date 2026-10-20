/* Spnvisualz site settings. Edit this file to update the site; no build step needed. */
window.SPN_CONFIG = {
  /*
   * Where the "Start a project" form sends its details.
   * Paste any URL that accepts a JSON POST (Formspree, Getform, Make/Zapier webhook, your own API).
   * Leave it empty and the form runs in preview mode: nothing is sent, and the visitor
   * gets a copy of their message instead.
   */
  formEndpoint: "",

  /*
   * Social links shown in the menu and on the Contact panel. Leave a value empty to hide it.
   * Example: instagram: "https://www.instagram.com/your_handle/"
   */
  socials: {
    instagram: "",
    youtube: "",
    tiktok: "",
    vimeo: ""
  },

  /*
   * Projects, in the order the slider shows them. Each one gets its own orb in the world.
   *   client:  the small line above the title (artist, label or brand)
   *   title:   the big serif title
   *   type:    "Music video", "Visualizer", "Cover art", "Social" (free text)
   *   format, length, year: shown on the project page
   *   orb:     the orb's colour for this project (hex)
   *   text:    one or two sentences about the project
   *   url:     link to watch it (YouTube, Vimeo, Instagram). Leave empty if there is none yet.
   *   sample:  true marks a placeholder. Replace these with real projects and remove the flag.
   */
  projects: [
    {
      client: "Sample project", title: "Night Drive", type: "Music video",
      format: "2.39:1", length: "3:40", year: 2026, orb: "#ff9a3d",
      text: "A one-night shoot on empty roads, graded warm against a cold city.", url: "", sample: true
    },
    {
      client: "Sample project", title: "Static Bloom", type: "Visualizer",
      format: "9:16", length: "0:08", year: 2026, orb: "#b36bff",
      text: "An eight-second Spotify Canvas loop that opens like a flower on every downbeat.", url: "", sample: true
    },
    {
      client: "Sample project", title: "Low Orbit", type: "Cover art",
      format: "1:1", length: "", year: 2026, orb: "#47e6ff",
      text: "Single artwork and a matching set of press stills.", url: "", sample: true
    },
    {
      client: "Sample project", title: "Glass House", type: "Music video",
      format: "16:9", length: "2:58", year: 2025, orb: "#ff5c9d",
      text: "A performance video lit only through coloured glass.", url: "", sample: true
    },
    {
      client: "Sample project", title: "Tour Recap", type: "Social",
      format: "9:16", length: "0:45", year: 2025, orb: "#6dffb2",
      text: "Twelve cities cut into vertical recaps for Reels, TikTok and Shorts.", url: "", sample: true
    }
  ]
};
