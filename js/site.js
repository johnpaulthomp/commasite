/* Comma — renders albums, placements, brands and partners from the files in /data. */
(function () {
  "use strict";
  var FILES = ["settings", "albums", "placements", "brands", "partners", "world"];
  var SVG = "http://www.w3.org/2000/svg";

  function load() {
    if (window.SITE_DATA) return Promise.resolve(window.SITE_DATA);
    return Promise.all(FILES.map(function (name) {
      return fetch("data/" + name + ".json", { cache: "no-cache" }).then(function (r) {
        if (!r.ok) throw new Error("Could not load data/" + name + ".json (" + r.status + ")");
        return r.json();
      });
    })).then(function (parts) {
      var data = {};
      FILES.forEach(function (name, i) { data[name] = parts[i]; });
      return data;
    });
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k]; else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function applyLinks(s) {
    var map = { catalog: s.catalogUrl, email: "mailto:" + s.contactEmail, brief: s.briefUrl, submissions: s.submissionsUrl };
    document.querySelectorAll("[data-link]").forEach(function (a) {
      var href = map[a.getAttribute("data-link")];
      if (href) a.setAttribute("href", href);
      if (a.getAttribute("data-link") === "email") a.textContent = s.contactEmail;
    });
  }

  function albums(data) {
    var grid = document.getElementById("album-grid");
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".tabs [role=tab]"));
    function render(which) {
      grid.innerHTML = "";
      data.albums[which].forEach(function (a) {
        var href = data.settings.albumUrlPattern.replace("{id}", a.id);
        grid.appendChild(el("li", {}, [
          el("a", { "class": "album", href: href }, [
            el("img", { src: a.cover, alt: "", width: "300", height: "300", loading: "lazy", decoding: "async" }),
            el("span", { text: a.title })
          ])
        ]));
      });
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-tab") === which;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.setAttribute("tabindex", on ? "0" : "-1");
        if (on) grid.setAttribute("aria-labelledby", t.id);
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { render(t.getAttribute("data-tab")); });
      t.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        var next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
        next.focus(); render(next.getAttribute("data-tab"));
      });
    });
    render("latest");
  }

  function placements(data) {
    var grid = document.getElementById("placement-grid");
    var buttons = document.querySelectorAll("#placement-filters button");
    function render(filter) {
      grid.innerHTML = "";
      data.placements.filter(function (p) { return filter === "all" || p.category === filter; }).forEach(function (p) {
        grid.appendChild(el("li", { "class": "placement" }, [
          el("img", { src: p.image, alt: p.brand + ", " + p.title.replace(/[“”]/g, ""), width: "960", height: "540", loading: "lazy", decoding: "async" }),
          el("div", { "class": "placement__text" }, [
            el("span", { "class": "placement__brand", text: p.brand }),
            el("span", { text: p.title }),
            el("span", { "class": "placement__type", text: p.label })
          ])
        ]));
      });
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filter") === filter ? "true" : "false"); });
    }
    buttons.forEach(function (b) { b.addEventListener("click", function () { render(b.getAttribute("data-filter")); }); });
    render("all");
  }

  function brands(data) {
    var grid = document.getElementById("brand-grid");
    data.brands.forEach(function (b) {
      grid.appendChild(el("li", {}, [el("img", { src: b.logo, alt: b.name, width: String(b.w), height: String(b.h), loading: "lazy", decoding: "async" })]));
    });
  }

  function partners(data) {
    var svg = document.getElementById("world-map");
    var list = document.getElementById("partner-list");
    var card = document.getElementById("partner-card");
    var used = {};
    var groups = [];
    var buttons = [];
    data.partners.forEach(function (p) { p.countries.forEach(function (c) { used[c] = true; }); });
    var rest = Object.keys(data.world.countries).filter(function (c) { return !used[c]; }).map(function (c) { return data.world.countries[c]; }).join("");
    var restPath = document.createElementNS(SVG, "path");
    restPath.setAttribute("class", "rest"); restPath.setAttribute("d", rest);
    svg.appendChild(restPath);

    function select(i) {
      groups.forEach(function (g, j) { g.classList.toggle("is-active", j === i); });
      buttons.forEach(function (b, j) { b.setAttribute("aria-pressed", j === i ? "true" : "false"); });
      var p = data.partners[i];
      card.innerHTML = "";
      var actions = el("div", { "class": "partner-card__links" });
      (p.links || [{ label: "Visit " + p.name, url: p.url }]).forEach(function (l) {
        var link = el("a", { "class": "btn btn--accent btn--sm", href: l.url, target: "_blank", rel: "noopener" });
link.appendChild(document.createTextNode(l.label));
link.appendChild(el("span", { "class": "visually-hidden", text: " (opens in a new tab)" }));
actions.appendChild(link);
      });
      card.appendChild(el("div", { "class": "partner-card__text" }, [
        el("span", { "class": "partner-card__name", text: p.name }),
        el("span", { "class": "partner-card__terr", text: p.territories })
      ]));
      card.appendChild(actions);
    }

    data.partners.forEach(function (p, i) {
      var path = document.createElementNS(SVG, "path");
      path.setAttribute("class", "territory");
      path.setAttribute("d", p.countries.map(function (c) { return data.world.countries[c] || ""; }).join(""));
      var title = document.createElementNS(SVG, "title"); title.textContent = p.name; path.appendChild(title);
      path.addEventListener("mouseenter", function () { select(i); });
      path.addEventListener("click", function () { select(i); });
      svg.appendChild(path); groups.push(path);

      var btn = el("button", { type: "button", "aria-pressed": "false" }, [
        el("span", { "class": "partner-list__name", text: p.name }),
        el("span", { "class": "partner-list__terr", text: p.territories })
      ]);
      btn.addEventListener("click", function () { select(i); });
      buttons.push(btn);
      list.appendChild(el("li", {}, [btn]));
    });
    select(0);
  }

  function hero() {
    var video = document.getElementById("hero-video");
    var toggle = document.getElementById("motion-toggle");
    var dialog = document.getElementById("reel-dialog");
    var reel = document.getElementById("reel-video");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function setPaused(paused) {
      if (paused) video.pause(); else video.play().catch(function () {});
      toggle.setAttribute("aria-pressed", paused ? "true" : "false");
      toggle.setAttribute("aria-label", paused ? "Play background video" : "Pause background video");
    }
    if (reduce) { video.removeAttribute("autoplay"); setPaused(true); }
    toggle.addEventListener("click", function () { setPaused(!video.paused); });

    document.getElementById("reel-open").addEventListener("click", function () {
      if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
      reel.play().catch(function () {});
    });
    function close() { reel.pause(); if (dialog.open) dialog.close(); }
    document.getElementById("reel-close").addEventListener("click", close);
    dialog.addEventListener("click", function (e) { if (e.target === dialog) close(); });
    dialog.addEventListener("close", function () { reel.pause(); });
  }

  document.getElementById("year").textContent = String(new Date().getFullYear());
  hero();
  load().then(function (data) {
    applyLinks(data.settings);
    albums(data); placements(data); brands(data); partners(data);
  }).catch(function (err) {
    console.error(err);
    document.getElementById("album-grid").appendChild(el("li", { text: "Albums didn’t load. Refresh the page, or browse the full catalog below." }));
  });
})();
