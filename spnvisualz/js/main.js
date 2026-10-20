(function () {
  "use strict";

  var CONFIG = window.SPN_CONFIG || {};
  var PROJECTS = Array.isArray(CONFIG.projects) ? CONFIG.projects : [];
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var $ = function (id) { return document.getElementById(id); };
  var state = { index: -1, panel: null, lastFocus: null, motionPaused: false };

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function storage(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { return null; }
    return null;
  }

  /* ---------- World ---------- */
  var world = window.SpnWorld;
  var worldOn = false;

  // Each project views the world from its own side; the intro looks down on the rings.
  function sceneFor(i) {
    if (i < 0) return { orb: 0, yaw: 0.6, height: 5.2, radius: 8.2, color: "#7fe9ff" };
    var p = PROJECTS[i];
    return { orb: 1, yaw: 0.6 + (i + 1) * 1.15, height: 2.7, radius: 9.2, color: p.orb || "#7fe9ff" };
  }

  function initWorld() {
    var canvas = $("world");
    if (!world || !canvas) return;
    state.motionPaused = reduceMotion || storage("spn-motion") === "paused";
    world.setScene(Object.assign({ instant: true }, sceneFor(-1)));
    worldOn = world.start(canvas, { paused: state.motionPaused });
    updateMotionButton();
  }

  function updateMotionButton() {
    var btn = $("motion-btn");
    if (!btn) return;
    btn.hidden = !worldOn;
    btn.setAttribute("aria-pressed", state.motionPaused ? "true" : "false");
    btn.textContent = state.motionPaused ? "Play the world" : "Pause the world";
  }

  /* ---------- Slider ---------- */
  var swapTimer;
  function go(i) {
    if (!PROJECTS.length) return;
    if (i >= PROJECTS.length) i = 0;
    if (i < -1) i = PROJECTS.length - 1;
    if (i === -1 && state.index === -1) return;
    var from = state.index;
    state.index = i;

    if (worldOn) world.setScene(sceneFor(i));

    var intro = $("intro"), slide = $("slide"), arrows = $("arrows"), enter = $("enter-btn");
    var onIntro = i < 0;
    intro.classList.toggle("is-gone", !onIntro);
    intro.setAttribute("aria-hidden", onIntro ? "false" : "true");
    enter.hidden = !onIntro;
    arrows.hidden = onIntro;

    if (onIntro) { slide.hidden = true; return; }

    var p = PROJECTS[i];
    var apply = function () {
      $("slide-client").textContent = p.client || "";
      $("slide-title").textContent = p.title || "";
      $("counter").textContent = pad(i + 1) + " / " + pad(PROJECTS.length);
      slide.classList.remove("is-swapping");
    };
    clearTimeout(swapTimer);
    if (from < 0 || reduceMotion) {
      apply();
      slide.hidden = false;
    } else {
      slide.classList.add("is-swapping");
      swapTimer = setTimeout(apply, 420);
    }
  }

  function initSlider() {
    $("enter-btn").addEventListener("click", function () { go(0); });
    $("next-btn").addEventListener("click", function () { go(state.index + 1); });
    $("prev-btn").addEventListener("click", function () { go(state.index - 1); });
    $("view-btn").addEventListener("click", function () { openProject(state.index); });
    $("logo").addEventListener("click", function (e) {
      e.preventDefault();
      closePanel();
      go(-1);
    });

    var wheelLock = 0;
    window.addEventListener("wheel", function (e) {
      if (state.panel) return;
      var now = Date.now();
      if (now < wheelLock || Math.abs(e.deltaY) < 12) return;
      wheelLock = now + 1300;
      if (e.deltaY > 0) go(state.index + 1 >= PROJECTS.length ? 0 : state.index + 1);
      else if (state.index > 0) go(state.index - 1);
      else if (state.index === 0) go(-1);
    }, { passive: true });

    var touchX = null, touchY = null;
    window.addEventListener("touchstart", function (e) {
      if (state.panel) return;
      touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener("touchend", function (e) {
      if (state.panel || touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      var dy = e.changedTouches[0].clientY - touchY;
      touchX = touchY = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 50) return;
      var forward = Math.abs(dx) > Math.abs(dy) ? dx < 0 : dy < 0;
      if (forward) go(state.index + 1);
      else if (state.index >= 0) go(state.index - 1);
    }, { passive: true });

    document.addEventListener("keydown", function (e) {
      if (state.panel) return;
      var tag = (e.target && e.target.tagName) || "";
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); go(state.index + 1); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        if (state.index >= 0) go(state.index - 1);
      }
    });
  }

  /* ---------- Panels ---------- */
  var PANELS = ["menu", "projects", "project", "studio", "contact"];

  function openPanel(name) {
    if (PANELS.indexOf(name) < 0) return;
    var next = $("panel-" + name);
    if (!state.panel) state.lastFocus = document.activeElement;
    PANELS.forEach(function (n) { if (n !== name) $("panel-" + n).hidden = true; });
    next.hidden = false;
    state.panel = name;
    next.querySelector(".panel-scroll").scrollTop = 0;
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.setAttribute("aria-current", a.getAttribute("data-open") === name ? "true" : "false");
    });
    var focusTarget = next.querySelector(".panel-title, .menu-links a");
    if (focusTarget) {
      if (!focusTarget.hasAttribute("tabindex") && focusTarget.tagName !== "A") focusTarget.setAttribute("tabindex", "-1");
      focusTarget.focus({ preventScroll: true });
    }
    if (["projects", "studio", "contact"].indexOf(name) >= 0 && location.hash !== "#" + name) {
      try { history.replaceState(null, "", "#" + name); } catch (e) { /* ignore */ }
    }
  }

  function closePanel() {
    if (!state.panel) return;
    $("panel-" + state.panel).hidden = true;
    state.panel = null;
    document.querySelectorAll(".nav a").forEach(function (a) { a.setAttribute("aria-current", "false"); });
    if (location.hash) {
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* ignore */ }
    }
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus({ preventScroll: true });
  }

  function initPanels() {
    document.addEventListener("click", function (e) {
      var opener = e.target.closest("[data-open]");
      if (opener) {
        e.preventDefault();
        openPanel(opener.getAttribute("data-open"));
        return;
      }
      if (e.target.closest("[data-close]")) closePanel();
    });
    $("menu-btn").addEventListener("click", function () { openPanel("menu"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && state.panel) closePanel();
    });

    // Keep Tab inside the open panel.
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !state.panel) return;
      var panel = $("panel-" + state.panel);
      var items = Array.prototype.filter.call(
        panel.querySelectorAll("a[href], button:not([disabled]), input, select, textarea, [tabindex='0']"),
        function (n) { return n.offsetParent !== null || n.classList.contains("panel-close"); }
      );
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    var motion = $("motion-btn");
    if (motion) {
      motion.addEventListener("click", function () {
        state.motionPaused = !state.motionPaused;
        storage("spn-motion", state.motionPaused ? "paused" : "playing");
        if (worldOn) world.setPaused(state.motionPaused);
        updateMotionButton();
      });
    }

    var fromHash = (location.hash || "").replace("#", "");
    if (["projects", "studio", "contact"].indexOf(fromHash) >= 0) openPanel(fromHash);
  }

  /* ---------- Project index and detail ---------- */
  function initIndex() {
    var list = $("project-index");
    if (!list) return;
    PROJECTS.forEach(function (p, i) {
      var li = el("li");
      var btn = el("button");
      btn.type = "button";
      btn.appendChild(el("span", "index-num", pad(i + 1)));
      var main = el("span", "index-main");
      main.appendChild(el("span", "index-title", p.title));
      main.appendChild(el("span", "index-client", p.client || ""));
      btn.appendChild(main);
      var type = el("span", "index-type");
      var dot = el("span", "index-dot");
      dot.style.color = p.orb || "#7fe9ff";
      dot.setAttribute("aria-hidden", "true");
      type.appendChild(dot);
      type.appendChild(document.createTextNode(p.type || ""));
      btn.appendChild(type);
      btn.addEventListener("click", function () {
        closePanel();
        go(i);
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function openProject(i) {
    var p = PROJECTS[i];
    if (!p) return;
    $("detail-client").textContent = p.client || "";
    $("detail-title").textContent = p.title || "";
    $("detail-text").textContent = p.text || "";

    var specs = $("detail-specs");
    specs.innerHTML = "";
    [["Type", p.type], ["Format", p.format], ["Length", p.length], ["Year", p.year]].forEach(function (pair) {
      if (!pair[1]) return;
      var d = el("div");
      d.appendChild(el("dt", null, pair[0]));
      d.appendChild(el("dd", null, String(pair[1])));
      specs.appendChild(d);
    });

    var actions = $("detail-actions");
    actions.innerHTML = "";
    if (p.url && /^https?:\/\//.test(p.url)) {
      var a = el("a", "frame-btn", "Watch the project ↗");
      a.href = p.url;
      a.target = "_blank";
      a.rel = "noopener";
      actions.appendChild(a);
    } else if (p.sample) {
      actions.appendChild(el("p", "note", "This is a sample project. Real work and links go in js/config.js."));
    }
    var next = el("button", "text-btn", "Next project →");
    next.type = "button";
    next.addEventListener("click", function () {
      closePanel();
      go(i + 1);
    });
    actions.appendChild(next);

    openPanel("project");
  }

  /* ---------- Socials ---------- */
  function initSocials() {
    var names = { instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", vimeo: "Vimeo" };
    var socials = CONFIG.socials || {};
    document.querySelectorAll("[data-socials]").forEach(function (list) {
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
    });
  }

  /* ---------- Project form ---------- */
  function initForm() {
    var form = $("project-form");
    if (!form) return;
    var errorBox = $("form-error");
    var result = $("form-result");
    var submit = $("form-submit");
    var value = function (id) { return $(id).value.trim(); };

    function validate() {
      var problems = [];
      var name = $("f-name"), email = $("f-email"), msg = $("f-message");
      [name, email, msg].forEach(function (f) { f.removeAttribute("aria-invalid"); });
      if (!name.value.trim()) { problems.push("your name"); name.setAttribute("aria-invalid", "true"); }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { problems.push("a valid email"); email.setAttribute("aria-invalid", "true"); }
      if (!msg.value.trim()) { problems.push("a few words about the project"); msg.setAttribute("aria-invalid", "true"); }
      return problems;
    }

    function summary(d) {
      var lines = ["Name: " + d.name, "Email: " + d.email];
      if (d.artist) lines.push("Artist or brand: " + d.artist);
      lines.push("Needs: " + d.type);
      if (d.date) lines.push("Release date: " + d.date);
      if (d.budget) lines.push("Budget: " + d.budget);
      lines.push("", d.message);
      return lines.join("\n");
    }

    function showResult(title, text) {
      result.innerHTML = "";
      result.appendChild(el("strong", null, title));
      if (text) {
        var pre = el("pre", null, text);
        result.appendChild(pre);
        var copy = el("button", "text-btn", "Copy message");
        copy.type = "button";
        copy.addEventListener("click", function () {
          var fallback = function () {
            var range = document.createRange();
            range.selectNodeContents(pre);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            copy.textContent = "Selected. Press Ctrl+C or ⌘C to copy";
          };
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(text).then(function () { copy.textContent = "Copied"; }, fallback);
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
        name: value("f-name"), email: value("f-email"), artist: value("f-artist"),
        type: value("f-type"), date: value("f-date"), budget: value("f-budget"), message: value("f-message")
      };

      if (!CONFIG.formEndpoint) {
        showResult("Preview mode: this form isn't connected yet, so nothing was sent. Here is your message to copy:", summary(data));
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
        showResult("Sent. Spnvisualz will reply to " + data.email + ".", "");
      }).catch(function () {
        showResult("The message didn't go through. Check your connection and try again, or copy it below:", summary(data));
      }).then(function () {
        submit.disabled = false;
        submit.textContent = "Send project details";
      });
    });
  }

  /* ---------- Film grain ---------- */
  function initGrain() {
    var c = document.createElement("canvas");
    c.width = c.height = 160;
    var ctx = c.getContext("2d");
    var img = ctx.createImageData(160, 160);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    $("veil").style.setProperty("--grain", "url(" + c.toDataURL("image/png") + ")");
  }

  // Boot each part on its own so one failure can't blank the rest of the page.
  [initWorld, initSlider, initIndex, initPanels, initSocials, initForm, initGrain].forEach(function (fn) {
    try { fn(); } catch (err) { if (window.console) console.error(fn.name, err); }
  });

  if (!PROJECTS.length) {
    $("enter-btn").hidden = true;
    $("index-btn").hidden = true;
  }
})();
