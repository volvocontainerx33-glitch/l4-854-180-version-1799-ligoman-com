(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobilePanel = qs('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;

    function activate(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });

    activate(0);
    if (slides.length > 1) {
      setInterval(function () {
        activate(current + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters(form) {
    var searchInput = qs('[data-filter-search]', form);
    var yearSelect = qs('[data-filter-year]', form);
    var regionSelect = qs('[data-filter-region]', form);
    var typeSelect = qs('[data-filter-type]', form);
    var query = normalize(searchInput && searchInput.value);
    var year = normalize(yearSelect && yearSelect.value);
    var region = normalize(regionSelect && regionSelect.value);
    var type = normalize(typeSelect && typeSelect.value);
    var cards = qsa('[data-movie-card]');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardType = normalize(card.getAttribute('data-type'));
      var matched = true;

      if (query && haystack.indexOf(query) === -1) {
        matched = false;
      }
      if (year && cardYear !== year) {
        matched = false;
      }
      if (region && cardRegion !== region) {
        matched = false;
      }
      if (type && cardType !== type) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    var emptyState = qs('[data-empty-state]');
    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  qsa('[data-filter-form]').forEach(function (form) {
    var searchInput = qs('[data-filter-search]', form);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilters(form);
    });

    qsa('input, select', form).forEach(function (field) {
      field.addEventListener('input', function () {
        applyFilters(form);
      });
      field.addEventListener('change', function () {
        applyFilters(form);
      });
    });

    applyFilters(form);
  });

  window.initMoviePlayer = function (source) {
    var video = qs('[data-player-video]');
    var overlay = qs('[data-player-overlay]');
    var button = qs('[data-player-button]');
    var started = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (started) {
        return;
      }
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      attachSource();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        playVideo();
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
