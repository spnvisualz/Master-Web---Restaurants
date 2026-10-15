(function () {
  "use strict";

  var CONFIG = window.SPN_CONFIG || {};
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var TYPE_LABELS = {
    "music-video": "Music video",
    "visualizer": "Visualizer",
    "cover-art": "Cover art",
    "social": "Social"
  };

  /* ---------- Noise (seeded value noise + fbm) ---------- */
  function hashString(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function makeNoise(seed) {
    var perm = new Uint8Array(512);
    var vals = new Float32Array(256);
    var s = seed || 1;
    function rand() {
      s = (s + 0x6d2b79f5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    var p = [];
    for (var i = 0; i < 256; i++) { p[i] = i; vals[i] = rand(); }
    for (i = 255; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = p[i]; p[i] = p[j]; p[j] = tmp;
    }
    for (i = 0; i < 512; i++) perm[i] = p[i & 255];

    function fade(t) { return t * t * (3 - 2 * t); }
    function lattice(ix, iy) { return vals[perm[(ix & 255) + perm[iy & 255]]]; }
    function noise(x, y) {
      var x0 = Math.floor(x), y0 = Math.floor(y);
      var fx = fade(x - x0), fy = fade(y - y0);
      var a = lattice(x0, y0), b = lattice(x0 + 1, y0);
      var c = lattice(x0, y0 + 1), d = lattice(x0 + 1, y0 + 1);
      return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
    }
    return function fbm(x, y) {
      return noise(x, y) * 0.62 + noise(x * 2.1 + 17.3, y * 2.1 - 4.7) * 0.28 + noise(x * 4.3 - 9.1, y * 4.3 + 3.3) * 0.1;
    };
  }

  /* Marching squares: draws iso-lines of a sampled field on a canvas context. */
  function drawContours(ctx, field, cols, rows, cell, level) {
    ctx.beginPath();
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var i = y * (cols + 1) + x;
        var tl = field[i], tr = field[i + 1];
        var bl = field[i + cols + 1], br = field[i + cols + 2];
        var idx = (tl > level ? 8 : 0) | (tr > level ? 4 : 0) | (br > level ? 2 : 0) | (bl > level ? 1 : 0);
        if (idx === 0 || idx === 15) continue;

        var px = x * cell, py = y * cell;
        var top = px + cell * ((level - tl) / (tr - tl));
        var bottom = px + cell * ((level - bl) / (br - bl));
        var left = py + cell * ((level - tl) / (bl - tl));
        var right = py + cell * ((level - tr) / (br - tr));

        switch (idx) {
          case 1: case 14: ctx.moveTo(px, left); ctx.lineTo(bottom, py + cell); break;
          case 2: case 13: ctx.moveTo(bottom, py + cell); ctx.lineTo(px + cell, right); break;
          case 3: case 12: ctx.moveTo(px, left); ctx.lineTo(px + cell, right); break;
          case 4: case 11: ctx.moveTo(top, py); ctx.lineTo(px + cell, right); break;
          case 6: case 9: ctx.moveTo(top, py); ctx.lineTo(bottom, py + cell); break;
          case 7: case 8: ctx.moveTo(px, left); ctx.lineTo(top, py); break;
          case 5:
            ctx.moveTo(px, left); ctx.lineTo(top, py);
            ctx.moveTo(bottom, py + cell); ctx.lineTo(px + cell, right);
            break;
          case 10:
            ctx.moveTo(top, py); ctx.lineTo(px + cell, right);
            ctx.moveTo(px, left); ctx.lineTo(bottom, py + cell);
            break;
        }
      }
    }
    ctx.stroke();
  }

  function cssVar(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  /* ---------- Nav menu (phones) ---------- */
  function initNav() {
    var btn = document.getElementById("menu-btn");
    var links = document.getElementById("nav-links");
    if (!btn || !links) return;
    function setOpen(open) {
      links.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Close" : "Menu";
    }
    btn.addEventListener("click", function () {
      setOpen(!links.classList.contains("is-open"));
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---------- Viewfinder timecode (24 fps) ---------- */
  function initTimecode() {
    var el = document.getElementById("timecode");
    if (!el) return;
    var start = Date.now();
    function pad(n) { return n < 10 ? "0" + n : String(n); }
    function tick() {
      var ms = Date.now() - start;
      var totalFrames = Math.floor(ms / (1000 / 24));
      var f = totalFrames % 24;
      var s = Math.floor(ms / 1000);
      el.textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60) + ":" + pad(f);
    }
    tick();
    setInterval(tick, 1000 / 24);
  }

  /* ---------- Hero overworld map ---------- */
  function initHeroMap() {
    var canvas = document.getElementById("hero-map");
    var marker = document.getElementById("hero-marker");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var fbm = makeNoise(hashString("spnvisualz"));
    var lilac = cssVar("--lilac", "#9b8cff");
    var ember = cssVar("--ember", "#ffb547");

    var CELL = 14;
    var LEVELS = [0.3, 0.38, 0.46, 0.54, 0.62, 0.7, 0.78];
    var w = 0, h = 0, cols = 0, rows = 0, field = null, dpr = 1;
    var mx = 0, my = 0;
    var visible = true, last = 0, t = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      field = new Float32Array((cols + 1) * (rows + 1));
      if (marker) {
        var heroRect = canvas.parentElement.getBoundingClientRect();
        var mRect = marker.querySelector(".marker-dot").getBoundingClientRect();
        mx = mRect.left + mRect.width / 2 - heroRect.left;
        my = mRect.top + mRect.height / 2 - heroRect.top;
      } else {
        mx = w * 0.74; my = h * 0.52;
      }
    }

    function sample(time) {
      var scale = 0.0042;
      var radius = Math.max(140, Math.min(w, h) * 0.42);
      for (var y = 0; y <= rows; y++) {
        for (var x = 0; x <= cols; x++) {
          var px = x * CELL, py = y * CELL;
          var v = fbm(px * scale + time * 0.035, py * scale - time * 0.02);
          // A summit under the "You are here" marker, so contours ring around it.
          var dx = px - mx, dy = py - my;
          var d = Math.sqrt(dx * dx + dy * dy) / radius;
          v += Math.max(0, 1 - d) * 0.38;
          field[y * (cols + 1) + x] = v;
        }
      }
    }

    function draw(time) {
      sample(time);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = "round";
      for (var i = 0; i < LEVELS.length; i++) {
        var isIndex = i === 4;
        ctx.strokeStyle = isIndex ? ember : lilac;
        ctx.globalAlpha = isIndex ? 0.5 : 0.16 + i * 0.03;
        ctx.lineWidth = isIndex ? 1.4 : 1;
        drawContours(ctx, field, cols, rows, CELL, LEVELS[i]);
      }
      ctx.globalAlpha = 1;
      // Left-side fade keeps the headline readable.
      var g = ctx.createLinearGradient(0, 0, w * 0.7, 0);
      var night = cssVar("--night", "#13111c");
      g.addColorStop(0, night);
      g.addColorStop(0.55, hexToRgba(night, 0.55));
      g.addColorStop(1, hexToRgba(night, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    function frame(now) {
      if (!visible || document.hidden) { requestAnimationFrame(frame); return; }
      if (now - last > 1000 / 30) {
        t += (now - last) / 1000;
        if (t > 1e5) t = 0;
        last = now;
        draw(t);
      }
      requestAnimationFrame(frame);
    }

    resize();
    draw(0);

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resize(); draw(t); }, 120);
    });

    if (reduceMotion) return;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }).observe(canvas);
    }
    last = performance.now();
    requestAnimationFrame(frame);
  }

  function hexToRgba(hex, alpha) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return "rgba(19,17,28," + alpha + ")";
    var n = parseInt(m[1], 16);
    return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + alpha + ")";
  }

  /* ---------- Portfolio ---------- */
  function drawPoster(canvas, project) {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, rect.width), h = Math.max(1, rect.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var colors = project.colors && project.colors.length === 2 ? project.colors : ["#1b1828", "#ffb547"];
    var seed = hashString(project.title + project.year);
    var fbm = makeNoise(seed);

    var bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, colors[0]);
    bg.addColorStop(1, cssVar("--night", "#13111c"));
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Sun / disc
    var sx = w * (0.3 + ((seed % 100) / 100) * 0.4);
    var sy = h * 0.42;
    var r = Math.min(w, h) * 0.26;
    var glow = ctx.createRadialGradient(sx, sy, r * 0.2, sx, sy, r * 2.2);
    glow.addColorStop(0, hexToRgba(colors[1], 0.55));
    glow.addColorStop(1, hexToRgba(colors[1], 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();

    // Terrain contours over the lower half
    var cell = 8;
    var cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
    var field = new Float32Array((cols + 1) * (rows + 1));
    for (var y = 0; y <= rows; y++) {
      for (var x = 0; x <= cols; x++) {
        var py = y * cell;
        var ground = Math.max(0, (py / h - 0.45) * 1.8);
        field[y * (cols + 1) + x] = fbm(x * cell * 0.012, py * 0.012) * 0.6 + ground;
      }
    }
    ctx.strokeStyle = cssVar("--paper", "#f1ecdf");
    ctx.lineWidth = 1;
    for (var l = 0; l < 6; l++) {
      ctx.globalAlpha = 0.18 + l * 0.08;
      drawContours(ctx, field, cols, rows, cell, 0.55 + l * 0.12);
    }
    ctx.globalAlpha = 1;

    // Letterbox bars for scope projects
    if (project.format === "2.39:1") {
      var bar = (h - w / 2.39) / 2;
      if (bar > 0) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, bar);
        ctx.fillRect(0, h - bar, w, bar);
      }
    }
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function initWork() {
    var grid = document.getElementById("work-grid");
    var empty = document.getElementById("work-empty");
    var filters = document.getElementById("filters");
    if (!grid) return;
    var projects = Array.isArray(CONFIG.projects) ? CONFIG.projects : [];
    var cards = [];

    projects.forEach(function (p) {
      var hasUrl = typeof p.url === "string" && /^https?:\/\//.test(p.url);
      var card = el(hasUrl ? "a" : "article", "save");
      if (hasUrl) {
        card.href = p.url;
        card.target = "_blank";
        card.rel = "noopener";
        card.setAttribute("aria-label", p.title + ", " + (TYPE_LABELS[p.type] || "project") + ", opens in a new tab");
      }
      card.dataset.type = p.type || "";

      var poster = el("div", "save-poster");
      var canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      poster.appendChild(canvas);
      poster.appendChild(el("span", "save-chip", TYPE_LABELS[p.type] || "Project"));
      if (p.sample) poster.appendChild(el("span", "save-chip save-chip-sample", "Sample"));
      if (hasUrl) {
        var play = el("span", "save-play", "▶");
        play.setAttribute("aria-hidden", "true");
        poster.appendChild(play);
      }

      var body = el("div", "save-body");
      body.appendChild(el("h3", "save-title", p.title));
      var meta = el("p", "save-meta");
      [p.artist, p.format, p.length, p.year].forEach(function (m) {
        if (m) meta.appendChild(el("span", null, String(m)));
      });
      body.appendChild(meta);

      card.appendChild(poster);
      card.appendChild(body);
      grid.appendChild(card);
      cards.push({ node: card, canvas: canvas, project: p });
    });

    function paint() {
      cards.forEach(function (c) {
        if (!c.node.hidden) drawPoster(c.canvas, c.project);
      });
    }
    paint();

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(paint, 150);
    });

    function apply(filter) {
      var shown = 0;
      cards.forEach(function (c) {
        var show = filter === "all" || c.project.type === filter;
        c.node.hidden = !show;
        if (show) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      paint();
    }

    if (filters) {
      filters.addEventListener("click", function (e) {
        var btn = e.target.closest(".filter");
        if (!btn) return;
        filters.querySelectorAll(".filter").forEach(function (b) {
          var active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", active ? "true" : "false");
        });
        apply(btn.dataset.filter);
      });
    }
    if (empty) empty.hidden = projects.length > 0;
  }

  /* ---------- Socials ---------- */
  function initSocials() {
    var list = document.getElementById("socials");
    if (!list) return;
    var names = { instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", vimeo: "Vimeo" };
    var socials = CONFIG.socials || {};
    Object.keys(names).forEach(function (key) {
      var url = socials[key];
      if (!url || !/^https?:\/\//.test(url)) return;
      var li = el("li");
      var a = el("a", null, names[key] + " ↗");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  /* ---------- Project form ---------- */
  function initForm() {
    var form = document.getElementById("project-form");
    if (!form) return;
    var errorBox = document.getElementById("form-error");
    var result = document.getElementById("form-result");
    var submit = document.getElementById("form-submit");

    function value(id) {
      var f = document.getElementById(id);
      return f ? f.value.trim() : "";
    }

    function validate() {
      var problems = [];
      var name = document.getElementById("f-name");
      var email = document.getElementById("f-email");
      var msg = document.getElementById("f-message");
      [name, email, msg].forEach(function (f) { f.removeAttribute("aria-invalid"); });
      if (!name.value.trim()) { problems.push("your name"); name.setAttribute("aria-invalid", "true"); }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { problems.push("a valid email"); email.setAttribute("aria-invalid", "true"); }
      if (!msg.value.trim()) { problems.push("a few words about the project"); msg.setAttribute("aria-invalid", "true"); }
      return problems;
    }

    function summary(data) {
      return [
        "Name: " + data.name,
        "Email: " + data.email,
        data.artist ? "Artist or brand: " + data.artist : "",
        "Needs: " + data.type,
        data.date ? "Release date: " + data.date : "",
        data.budget ? "Budget: " + data.budget : "",
        "",
        data.message
      ].filter(function (line, i, arr) { return line !== "" || (i > 0 && arr[i - 1] !== ""); }).join("\n");
    }

    function showResult(title, text, withCopy) {
      result.innerHTML = "";
      result.appendChild(el("strong", null, title));
      if (text) {
        var pre = el("pre", null, text);
        pre.id = "form-summary";
        result.appendChild(pre);
      }
      if (withCopy) {
        var copy = el("button", "btn btn-ghost btn-sm", "Copy message");
        copy.type = "button";
        copy.addEventListener("click", function () {
          var done = function () { copy.textContent = "Copied"; };
          var fallback = function () {
            var range = document.createRange();
            range.selectNodeContents(document.getElementById("form-summary"));
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            copy.textContent = "Selected. Press Ctrl+C or ⌘C to copy";
          };
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(text).then(done, fallback);
            } else { fallback(); }
          } catch (e) { fallback(); }
        });
        result.appendChild(copy);
      }
      result.hidden = false;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var problems = validate();
      if (problems.length) {
        errorBox.textContent = "Please add " + problems.join(", ") + ".";
        errorBox.hidden = false;
        return;
      }
      errorBox.hidden = true;

      var data = {
        name: value("f-name"),
        email: value("f-email"),
        artist: value("f-artist"),
        type: value("f-type"),
        date: value("f-date"),
        budget: value("f-budget"),
        message: value("f-message")
      };

      if (!CONFIG.formEndpoint) {
        showResult(
          "Preview mode: this form isn't connected yet, so nothing was sent. Here is your message to copy:",
          summary(data),
          true
        );
        return;
      }

      submit.disabled = true;
      submit.textContent = "Sending…";
      fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        showResult("Sent. Spnvisualz will reply to " + data.email + ".", "", false);
      }).catch(function () {
        showResult("The message didn't go through. Check your connection and try again, or copy it below:", summary(data), true);
      }).then(function () {
        submit.disabled = false;
        submit.textContent = "Send project details";
      });
    });
  }

  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  // Boot each part on its own so one failure can't blank the rest of the page.
  [initNav, initTimecode, initHeroMap, initWork, initSocials, initForm, initYear].forEach(function (fn) {
    try { fn(); } catch (err) { if (window.console) console.error(fn.name, err); }
  });
})();
