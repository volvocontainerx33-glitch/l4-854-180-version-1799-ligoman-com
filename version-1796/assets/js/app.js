(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var header = document.querySelector(".site-header");
    var menuToggle = document.querySelector(".menu-toggle");

    if (header && menuToggle) {
      menuToggle.addEventListener("click", function () {
        header.classList.toggle("nav-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function startHero() {
      if (slides.length <= 1) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        if (timer) {
          window.clearInterval(timer);
          startHero();
        }
      });
    });

    showSlide(0);
    startHero();

    var query = new URLSearchParams(window.location.search).get("q") || "";
    var searchInput = document.querySelector("[data-filter='search']");
    var yearSelect = document.querySelector("[data-filter='year']");
    var regionSelect = document.querySelector("[data-filter='region']");
    var typeSelect = document.querySelector("[data-filter='type']");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
    var emptyState = document.querySelector(".empty-state");

    if (searchInput && query) {
      searchInput.value = query;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }

      var text = normalize(searchInput ? searchInput.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type")
        ].join(" "));
        var matchesText = !text || haystack.indexOf(text) !== -1;
        var matchesYear = !year || card.getAttribute("data-year") === year;
        var matchesRegion = !region || card.getAttribute("data-region") === region;
        var matchesType = !type || card.getAttribute("data-type") === type;
        var shouldShow = matchesText && matchesYear && matchesRegion && matchesType;
        card.classList.toggle("is-hidden", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  });
})();
