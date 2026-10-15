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
   * Social links shown under "Start a project". Leave a value empty to hide it.
   * Example: instagram: "https://www.instagram.com/your_handle/"
   */
  socials: {
    instagram: "",
    youtube: "",
    tiktok: "",
    vimeo: ""
  },

  /*
   * Portfolio ("Selected work"). Newest first.
   * type:    "music-video" | "visualizer" | "cover-art" | "social"
   * url:     link to the video or post (YouTube, Vimeo, Instagram). Leave empty for no link.
   * format:  aspect ratio label shown on the card.
   * length:  runtime, e.g. "3:42". Leave empty for stills.
   * colors:  two hex colours used to draw the card's poster.
   * sample:  true marks a placeholder card. Replace these with real projects and remove the flag.
   */
  projects: [
    { title: "Night Drive", artist: "Music video", type: "music-video", year: 2026, format: "2.39:1", length: "3:40", url: "", colors: ["#2b1f5c", "#ff8a4c"], sample: true },
    { title: "Static Bloom", artist: "Spotify Canvas loop", type: "visualizer", year: 2026, format: "9:16", length: "0:08", url: "", colors: ["#0f3b4a", "#9b8cff"], sample: true },
    { title: "Low Orbit", artist: "Single artwork", type: "cover-art", year: 2026, format: "1:1", length: "", url: "", colors: ["#3a1430", "#ffb547"], sample: true },
    { title: "Tour Recap", artist: "Social cutdowns", type: "social", year: 2025, format: "9:16", length: "0:45", url: "", colors: ["#1d2a1a", "#c9f27a"], sample: true },
    { title: "Glass House", artist: "Performance video", type: "music-video", year: 2025, format: "16:9", length: "2:58", url: "", colors: ["#1a1d3d", "#ff5e7e"], sample: true },
    { title: "Signal Lost", artist: "Lyric visualizer", type: "visualizer", year: 2025, format: "16:9", length: "3:12", url: "", colors: ["#241a0f", "#ffd27a"], sample: true }
  ]
};
