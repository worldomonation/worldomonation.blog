(function () {
  "use strict";

  let photos = [];
  let currentIndex = -1;
  let triggerElement = null;

  // Build lightbox DOM
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Photo viewer");
  lightbox.setAttribute("aria-hidden", "true");

  lightbox.innerHTML = [
    '<button class="lightbox-close" aria-label="Close">\u00d7</button>',
    '<button class="lightbox-nav lightbox-prev" aria-label="Previous photo">\u2039</button>',
    '<button class="lightbox-nav lightbox-next" aria-label="Next photo">\u203a</button>',
    '<div class="lightbox-content">',
    '  <img class="lightbox-image" src="" alt="">',
    '  <div class="lightbox-exif"></div>',
    '  <div class="sr-only" role="status" aria-live="polite"></div>',
    "</div>",
  ].join("\n");

  document.body.appendChild(lightbox);

  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");
  const image = lightbox.querySelector(".lightbox-image");
  const exifPanel = lightbox.querySelector(".lightbox-exif");
  const content = lightbox.querySelector(".lightbox-content");
  const liveRegion = lightbox.querySelector('[role="status"]');

  function init() {
    if (window.__PHOTOS__) {
      photos = window.__PHOTOS__;
    }

    document.querySelectorAll(".gallery-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var index = parseInt(btn.dataset.index, 10);
        triggerElement = btn;
        open(index);
      });
    });
  }

  function open(index) {
    currentIndex = index;
    update();
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    closeBtn.focus();
  }

  function close() {
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    if (triggerElement) {
      triggerElement.focus();
      triggerElement = null;
    }
  }

  function next() {
    if (photos.length < 2) return;
    currentIndex = (currentIndex + 1) % photos.length;
    update();
  }

  function prev() {
    if (photos.length < 2) return;
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    update();
  }

  function update() {
    var photo = photos[currentIndex];
    if (!photo) return;

    image.src = photo.src;
    image.alt = photo.alt;

    // Update aria for screen readers
    lightbox.setAttribute("aria-label", "Photo viewer: " + photo.alt);
    liveRegion.textContent =
      "Photo " +
      (currentIndex + 1) +
      " of " +
      photos.length +
      ": " +
      photo.alt;

    // Build EXIF panel
    var parts = [];
    var exif = photo.exif || {};

    if (exif.title) {
      parts.push('<p class="lightbox-title">' + esc(exif.title) + "</p>");
    }
    if (exif.caption) {
      parts.push('<p class="lightbox-caption">' + esc(exif.caption) + "</p>");
    }
    if (exif.camera) {
      parts.push('<p class="lightbox-camera">' + esc(exif.camera) + "</p>");
    }
    if (exif.lens) {
      parts.push('<p class="lightbox-lens">' + esc(exif.lens) + "</p>");
    }

    var exposure = [
      exif.focalLength,
      exif.aperture,
      exif.shutterSpeed,
      exif.iso ? "ISO " + exif.iso : "",
    ].filter(Boolean);

    if (exposure.length) {
      parts.push(
        '<p class="lightbox-exposure">' +
          exposure.map(esc).join(" &middot; ") +
          "</p>"
      );
    }

    if (photo.dateFormatted) {
      parts.push(
        '<p class="lightbox-date">' + esc(photo.dateFormatted) + "</p>"
      );
    }

    exifPanel.innerHTML = parts.join("");
    content.scrollTop = 0;

    // Show/hide nav buttons
    var showNav = photos.length > 1;
    prevBtn.style.display = showNav ? "" : "none";
    nextBtn.style.display = showNav ? "" : "none";
  }

  function esc(str) {
    var el = document.createElement("span");
    el.textContent = String(str);
    return el.innerHTML;
  }

  // ---- Event listeners ----

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  // Click on backdrop or content (not on image/exif) to close
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) {
      close();
    }
  });

  content.addEventListener("click", function (e) {
    if (e.target === content) {
      close();
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (lightbox.getAttribute("aria-hidden") !== "false") return;

    switch (e.key) {
      case "Escape":
        close();
        break;
      case "ArrowLeft":
        prev();
        break;
      case "ArrowRight":
        next();
        break;
      case "Tab":
        trapFocus(e);
        break;
    }
  });

  function trapFocus(e) {
    var focusable = lightbox.querySelectorAll(
      'button:not([style*="display: none"])'
    );
    if (focusable.length === 0) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // ---- Touch/swipe support ----

  var touchStartX = 0;
  var touchStartY = 0;

  lightbox.addEventListener(
    "touchstart",
    function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  lightbox.addEventListener(
    "touchend",
    function (e) {
      var deltaX = e.changedTouches[0].clientX - touchStartX;
      var deltaY = e.changedTouches[0].clientY - touchStartY;

      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          prev();
        } else {
          next();
        }
      }
    },
    { passive: true }
  );

  // ---- Initialize ----

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
