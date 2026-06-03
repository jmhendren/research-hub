// research-hub/assets/chart-embed.js
// Progressive enhancement: upgrade static chart images to interactive Vega-Lite
// charts when their `.vl.json` sibling is published. No JS, a fetch failure, or
// a missing/invalid spec => the static <img> is left exactly as-is (the
// no-JS baseline). Requires vega-embed-bundle.js to have loaded first.
(function () {
  "use strict";
  if (typeof vegaEmbed === "undefined") return; // bundle absent -> stay static
  var EMBED_OPTS = { renderer: "svg", actions: false, tooltip: true };

  function upgrade(img) {
    var src = img.getAttribute("src") || "";
    if (!/\.png$/i.test(src)) return;                 // only chart PNGs
    var specUrl = src.replace(/\.png$/i, ".vl.json");
    fetch(specUrl)
      .then(function (r) { if (!r.ok) throw new Error("no spec"); return r.text(); })
      .then(function (txt) {
        var spec = JSON.parse(txt); // text()+parse: content-type-agnostic on Pages
        var holder = document.createElement("div");
        holder.className = "vega-chart";
        img.parentNode.insertBefore(holder, img);
        return vegaEmbed(holder, spec, EMBED_OPTS)
          .then(function () { img.style.display = "none"; }) // success: hide fallback
          .catch(function () { holder.remove(); });          // embed failed: keep <img>
      })
      .catch(function () { /* no spec / parse error: leave the static <img> */ });
  }

  function run() {
    Array.prototype.forEach.call(document.querySelectorAll("img"), upgrade);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
