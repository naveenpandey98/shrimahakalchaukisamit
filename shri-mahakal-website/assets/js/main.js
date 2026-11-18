/* ==========================================================================
   Shri Mahakal Chauki Samiti - Homepage scripts
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Samiti contact configuration (used across the page)
     whatsappNumber: country code + number, digits only (e.g. 919506210346)
     --------------------------------------------------------------------- */
  var SITE_CONFIG = {
    whatsappNumber: "919506210346",
    whatsappGreeting: "हर हर महादेव! मैं श्री महाकाल चौकी समिति की वेबसाइट से संपर्क कर रहा/रही हूँ।",
    phoneDisplay: "+91 95062 10346",
    phoneHref: "tel:+919506210346",
    email: "info@shrimahakalsamiti.in",
    address: "बांधवा पड़ाव",
    facebook: "#",
    instagram: "#",
    youtube: "#"
  };

  function applyConfig() {
    var waLink = "https://wa.me/" + SITE_CONFIG.whatsappNumber + "?text=" + encodeURIComponent(SITE_CONFIG.whatsappGreeting);

    document.querySelectorAll("[data-config]").forEach(function (el) {
      var key = el.getAttribute("data-config");
      if (SITE_CONFIG[key]) { el.textContent = SITE_CONFIG[key]; }
    });

    document.querySelectorAll("[data-config-href]").forEach(function (el) {
      var key = el.getAttribute("data-config-href");
      var href = null;
      if (key === "phone") { href = SITE_CONFIG.phoneHref; }
      else if (key === "email") { href = "mailto:" + SITE_CONFIG.email; }
      else if (key === "whatsapp") { href = waLink; }
      else if (SITE_CONFIG[key]) { href = SITE_CONFIG[key]; }
      if (href) { el.setAttribute("href", href); }
    });
  }

  /* ---------------------------------------------------------------------
     Header: shadow on scroll + active link highlighting
     --------------------------------------------------------------------- */
  function initHeader() {
    var header = document.getElementById("siteHeader");
    var topBtn = document.getElementById("backToTop");
    var links = Array.prototype.slice.call(document.querySelectorAll(".site-nav .nav-link"));

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (header) { header.classList.toggle("is-scrolled", y > 20); }
      if (topBtn) { topBtn.classList.toggle("is-visible", y > 600); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (topBtn) {
      topBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // Active link via IntersectionObserver
    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute("href")); })
      .filter(Boolean);

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
      sections.forEach(function (s) { io.observe(s); });
    }

    // Close mobile menu after choosing a link
    var menu = document.getElementById("mainMenu");
    document.querySelectorAll(".site-nav .nav-link, .nav-cta").forEach(function (a) {
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
    var items = document.querySelectorAll(".reveal");
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
     Gallery: category filter + lightbox
     --------------------------------------------------------------------- */
  function initGallery() {
    var buttons = document.querySelectorAll(".filter-btn");
    var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.getAttribute("data-filter");
        buttons.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
        items.forEach(function (item) {
          var show = filter === "all" || item.getAttribute("data-category") === filter;
          item.classList.toggle("is-hidden", !show);
        });
      });
    });

    var box = document.getElementById("lightbox");
    var img = document.getElementById("lbImg");
    var cap = document.getElementById("lbCaption");
    var current = 0;
    var lastFocus = null;

    if (!box || !img) { return; }

    function visibleLinks() {
      return items
        .filter(function (i) { return !i.classList.contains("is-hidden"); })
        .map(function (i) { return i.querySelector(".gallery-link"); });
    }

    function show(index) {
      var links = visibleLinks();
      if (!links.length) { return; }
      current = (index + links.length) % links.length;
      var link = links[current];
      img.src = link.getAttribute("href");
      var imgEl = link.querySelector(".gallery-img");
      img.alt = imgEl ? imgEl.alt : "Gallery image";
      if (cap) { cap.textContent = link.getAttribute("data-caption") || ""; }
    }

    function open(index) {
      lastFocus = document.activeElement;
      show(index);
      box.classList.add("is-open");
      box.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      var closeBtn = document.getElementById("lbClose");
      if (closeBtn) { closeBtn.focus(); }
    }

    function close() {
      box.classList.remove("is-open");
      box.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      img.src = "";
      if (lastFocus) { lastFocus.focus(); }
    }

    items.forEach(function (item) {
      var link = item.querySelector(".gallery-link");
      if (link) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          open(visibleLinks().indexOf(e.currentTarget));
        });
      }
    });

    var closeBtn = document.getElementById("lbClose");
    var prevBtn = document.getElementById("lbPrev");
    var nextBtn = document.getElementById("lbNext");

    if (closeBtn) { closeBtn.addEventListener("click", close); }
    if (prevBtn) { prevBtn.addEventListener("click", function () { show(current - 1); }); }
    if (nextBtn) { nextBtn.addEventListener("click", function () { show(current + 1); }); }
    box.addEventListener("click", function (e) { if (e.target === box) { close(); } });

    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) { return; }
      if (e.key === "Escape") { close(); }
      else if (e.key === "ArrowLeft") { show(current - 1); }
      else if (e.key === "ArrowRight") { show(current + 1); }
    });

    // Basic swipe support
    var startX = null;
    box.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (startX === null) { return; }
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) { show(dx > 0 ? current - 1 : current + 1); }
      startX = null;
    });
  }

  /* ---------------------------------------------------------------------
     Official Member ID Card Lightbox / Preview Modal
     --------------------------------------------------------------------- */
  function initIdCardModal() {
    var modal = document.getElementById("idCardModal");
    var img = document.getElementById("idModalImg");
    var title = document.getElementById("idModalTitle");
    var sub = document.getElementById("idModalSub");
    var closeBtn = document.getElementById("idModalClose");
    if (!modal || !img) return;

    function openCard(src, cardTitle, cardSub) {
      img.src = src || "assets/images/official-id-card-sample.jpg";
      if (title) title.textContent = cardTitle || "आधिकारिक पहचान पत्र";
      if (sub) sub.textContent = cardSub || "श्री महाकाल चौकी समिति, बांधवा पड़ाव · अधिकृत परिचय पत्र";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (closeBtn) closeBtn.focus();
    }

    function closeCard() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      img.src = "";
    }

    document.querySelectorAll(".btn-card-preview, [data-preview-card]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var cardSrc = btn.getAttribute("data-card") || "assets/images/official-id-card-sample.jpg";
        var name = btn.getAttribute("data-name") || "समिति सदस्य";
        var id = btn.getAttribute("data-id") || "BANP";
        openCard(cardSrc, name + " (ID: " + id + ")", "श्री महाकाल चौकी समिति, बांधवा पड़ाव · अधिकृत पहचान पत्र");
      });
    });

    var sampleBtn = document.getElementById("openSampleCardModal");
    if (sampleBtn) {
      sampleBtn.addEventListener("click", function (e) {
        e.preventDefault();
        openCard("assets/images/official-id-card-sample.jpg", "श्री महाकाल चौकी समिति - आधिकारिक पहचान पत्र (नमूना)", "पहचान पत्र प्रायोजक: PP Enterprises | 9506210346");
      });
    }

    var tiltCard = document.querySelector(".id-card-preview-tilt");
    if (tiltCard) {
      tiltCard.addEventListener("click", function () {
        openCard("assets/images/official-id-card-sample.jpg", "श्री महाकाल चौकी समिति - आधिकारिक पहचान पत्र", "पहचान पत्र प्रायोजक: PP Enterprises | 9506210346");
      });
    }

    if (closeBtn) closeBtn.addEventListener("click", closeCard);
    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.classList.contains("id-modal-backdrop")) {
        closeCard();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (modal.classList.contains("is-open") && e.key === "Escape") {
        closeCard();
      }
    });
  }

  /* ---------------------------------------------------------------------
     Sponsors: whole PP Enterprises card clickable; "#" links stay inert
     --------------------------------------------------------------------- */
  function initSponsors() {
    var card = document.getElementById("ppeCard");
    if (card) {
      card.addEventListener("click", function (e) {
        if (e.target.closest("a")) { return; } // real links handle themselves
        window.location.href = card.getAttribute("data-href");
      });
      card.style.cursor = "pointer";
    }

    document.querySelectorAll(".sponsor-card").forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (a.getAttribute("href") === "#") { e.preventDefault(); }
      });
    });

    document.querySelectorAll(".social-btn").forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (a.getAttribute("href") === "#") { e.preventDefault(); }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Hero Carousel: Touch swipe + Bootstrap instance
     --------------------------------------------------------------------- */
  function initHeroCarousel() {
    var heroEl = document.getElementById("heroCarousel");
    if (!heroEl) { return; }

    var carousel = null;
    if (window.bootstrap && window.bootstrap.Carousel) {
      carousel = window.bootstrap.Carousel.getOrCreateInstance(heroEl, {
        interval: 5500,
        ride: "carousel",
        pause: "hover",
        wrap: true,
        touch: true
      });
    }

    // Touch swipe support for smooth mobile interaction
    var touchStartX = 0;
    var touchEndX = 0;

    heroEl.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroEl.addEventListener("touchend", function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50 && carousel) {
        if (diff > 0) {
          carousel.next();
        } else {
          carousel.prev();
        }
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Contact form -> opens WhatsApp with the typed message
     --------------------------------------------------------------------- */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) { return; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name;
      var phone = form.elements.phone;
      var message = form.elements.message;
      var ok = true;

      [name, message].forEach(function (field) {
        var valid = field.value.trim().length > 0;
        field.classList.toggle("is-invalid", !valid);
        if (!valid) { ok = false; }
      });
      if (!ok) { return; }

      var text = "हर हर महादेव!\nनाम: " + name.value.trim() +
        (phone.value.trim() ? "\nमोबाइल: " + phone.value.trim() : "") +
        "\nसंदेश: " + message.value.trim();
      window.open("https://wa.me/" + SITE_CONFIG.whatsappNumber + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyConfig();
    initHeader();
    initHeroCarousel();
    initReveal();
    initGallery();
    initIdCardModal();
    initSponsors();
    initContactForm();
    var year = document.getElementById("year");
    if (year) { year.textContent = new Date().getFullYear(); }
  });
})();
