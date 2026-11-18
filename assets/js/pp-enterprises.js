/* ==========================================================================
   PP Enterprises - Business landing page scripts
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     PP Enterprises contact configuration
     - Phone: 9506210346 (from official card sponsorship)
     --------------------------------------------------------------------- */
  var PP_CONFIG = {
    whatsappNumber: "919506210346",
    phoneDisplay: "+91 95062 10346",
    phoneHref: "tel:+919506210346",
    email: "contact@ppenterprises.in",
    address: "Bandhwa Padav, Uttar Pradesh",
    facebook: "#",
    instagram: "#",
    youtube: "#",
    formEndpoint: ""
  };

  function applyConfig() {
    var waLink = "https://wa.me/" + PP_CONFIG.whatsappNumber + "?text=" +
      encodeURIComponent("Hello PP Enterprises, I would like to make a business enquiry.");

    document.querySelectorAll("[data-pp]").forEach(function (el) {
      var key = el.getAttribute("data-pp");
      if (PP_CONFIG[key]) { el.textContent = PP_CONFIG[key]; }
    });

    document.querySelectorAll("[data-pp-href]").forEach(function (el) {
      var key = el.getAttribute("data-pp-href");
      var href = null;
      if (key === "phone") { href = PP_CONFIG.phoneHref; }
      else if (key === "email") { href = "mailto:" + PP_CONFIG.email; }
      else if (key === "whatsapp") { href = waLink; }
      else if (PP_CONFIG[key]) { href = PP_CONFIG[key]; }
      if (href) { el.setAttribute("href", href); }
      if (href === "#") {
        el.addEventListener("click", function (e) { e.preventDefault(); });
      }
    });

    // Partner links left as "#" stay inert
    document.querySelectorAll(".pp-partner-link").forEach(function (a) {
      var enabled = a.getAttribute("href") && a.getAttribute("href") !== "#";
      a.classList.toggle("pp-partner-link-off", !enabled);
      if (!enabled) { a.setAttribute("tabindex", "-1"); a.setAttribute("aria-disabled", "true"); }
    });
  }

  /* ---------------------------------------------------------------------
     Header behaviour
     --------------------------------------------------------------------- */
  function initHeader() {
    var header = document.getElementById("ppHeader");
    var topBtn = document.getElementById("ppBackTop");
    var links = Array.prototype.slice.call(document.querySelectorAll(".pp-nav .nav-link[href^='#']"));

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (header) { header.classList.toggle("is-scrolled", y > 20); }
      if (topBtn) { topBtn.classList.toggle("is-visible", y > 600); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (topBtn) {
      topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            links.forEach(function (a) {
              a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      links.forEach(function (a) {
        var s = document.querySelector(a.getAttribute("href"));
        if (s) { io.observe(s); }
      });
    }

    var menu = document.getElementById("ppMenu");
    document.querySelectorAll(".pp-nav .nav-link, .pp-nav-cta").forEach(function (a) {
      a.addEventListener("click", function () {
        if (menu && menu.classList.contains("show") && window.bootstrap) {
          window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".pp-reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Product categories -> populate form select; card click pre-selects it
     --------------------------------------------------------------------- */
  function initCategories() {
    var select = document.getElementById("eProduct");
    if (!select) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll(".pp-cat-card:not(.is-hidden-cat)"));

    // Clear existing dynamic options except the first placeholder
    while (select.options.length > 1) {
      select.remove(1);
    }

    cards.forEach(function (card) {
      var label = card.getAttribute("data-category");
      if (label) {
        var opt = document.createElement("option");
        opt.value = label;
        opt.textContent = label;
        select.appendChild(opt);
      }
    });
    var other = document.createElement("option");
    other.value = "Other / Not sure";
    other.textContent = "Other / Not sure";
    select.appendChild(other);

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        select.value = card.getAttribute("data-category");
        select.classList.remove("is-invalid");
        var enquirySec = document.getElementById("ppEnquiry");
        if (enquirySec) {
          enquirySec.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        window.setTimeout(function () {
          var nameInput = document.getElementById("eName");
          if (nameInput) { nameInput.focus({ preventScroll: true }); }
        }, 700);
      });
    });

    document.querySelectorAll(".partner-enquire-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var brand = btn.getAttribute("data-brand") || "";
        var msgField = document.getElementById("eMessage");
        if (msgField && brand) {
          msgField.value = "I am interested in dealership & product supplies for " + brand + ". Please share pricing and catalog.";
        }
        var enquirySec = document.getElementById("ppEnquiry");
        if (enquirySec) {
          enquirySec.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        window.setTimeout(function () {
          var nameInput = document.getElementById("eName");
          if (nameInput) { nameInput.focus({ preventScroll: true }); }
        }, 700);
      });
    });
  }

  /* ---------------------------------------------------------------------
     Enquiry form
     --------------------------------------------------------------------- */
  function initEnquiryForm() {
    var form = document.getElementById("ppEnquiryForm");
    var alertBox = document.getElementById("ppFormAlert");
    var btn = document.getElementById("ppSubmitBtn");
    if (!form) return;

    function showAlert(type, text) {
      if (!alertBox) return;
      alertBox.className = "pp-form-alert is-visible " + (type === "ok" ? "is-success" : "is-error");
      alertBox.textContent = text;
    }

    function validate() {
      var ok = true;
      var f = form.elements;
      var checks = [
        [f.fullName, f.fullName && f.fullName.value.trim().length >= 2],
        [f.mobile, f.mobile && /^[6-9]\d{9}$/.test(f.mobile.value.replace(/[\s-]/g, "").replace(/^(\+91|91|0)/, ""))],
        [f.city, f.city && f.city.value.trim().length >= 2],
        [f.product, f.product && f.product.value !== ""]
      ];
      checks.forEach(function (pair) {
        if (pair[0]) {
          pair[0].classList.toggle("is-invalid", !pair[1]);
          if (!pair[1]) { ok = false; }
        }
      });
      return ok;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (alertBox) { alertBox.className = "pp-form-alert"; }
      if (!validate()) {
        showAlert("err", "Please correct the highlighted fields and try again.");
        return;
      }

      var f = form.elements;
      var data = {
        fullName: f.fullName ? f.fullName.value.trim() : "",
        mobile: f.mobile ? f.mobile.value.trim() : "",
        business: f.business ? f.business.value.trim() : "",
        city: f.city ? f.city.value.trim() : "",
        product: f.product ? f.product.value : "",
        message: f.message ? f.message.value.trim() : ""
      };

      if (PP_CONFIG.formEndpoint) {
        if (btn) btn.disabled = true;
        fetch(PP_CONFIG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        }).then(function (res) {
          if (!res.ok) { throw new Error("Request failed"); }
          showAlert("ok", "Thank you! Your business enquiry has been submitted. We will contact you soon.");
          form.reset();
        }).catch(function () {
          showAlert("err", "Sorry, we could not submit the enquiry right now. Please use Call Now or WhatsApp.");
        }).finally(function () { if (btn) btn.disabled = false; });
        return;
      }

      // Default: compose a WhatsApp message
      var text = "*Business Enquiry – PP Enterprises*\n" +
        "Name: " + data.fullName + "\n" +
        "Mobile: " + data.mobile + "\n" +
        (data.business ? "Business: " + data.business + "\n" : "") +
        "City: " + data.city + "\n" +
        "Product Interest: " + data.product + "\n" +
        (data.message ? "Message: " + data.message : "");
      window.open("https://wa.me/" + PP_CONFIG.whatsappNumber + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      showAlert("ok", "Thank you! Your enquiry is ready – please press Send in WhatsApp to complete it.");
      form.reset();
    });

    form.addEventListener("input", function (e) {
      if (e.target.classList && e.target.classList.contains("is-invalid")) { e.target.classList.remove("is-invalid"); }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyConfig();
    initHeader();
    initReveal();
    initCategories();
    initEnquiryForm();
    var year = document.getElementById("ppYear");
    if (year) { year.textContent = new Date().getFullYear(); }
  });
})();
