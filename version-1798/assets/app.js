(function () {
  function select(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = select('[data-menu-button]');
    var nav = select('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = select('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = select('[data-hero-prev]', hero);
    var next = select('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === index;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function queue() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        queue();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        queue();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        queue();
      });
    });

    if (slides.length > 1) {
      queue();
    }
  }

  function initSearchPanels() {
    selectAll('[data-search-panel]').forEach(function (panel) {
      var scope = panel.nextElementSibling ? select('[data-search-scope]', panel.nextElementSibling) : select('[data-search-scope]');
      if (!scope) {
        scope = select('[data-search-scope]');
      }
      if (!scope) {
        return;
      }
      var input = select('[data-search-input]', panel);
      var genre = select('[data-filter-genre]', panel);
      var category = select('[data-filter-category]', panel);
      var cards = selectAll('.movie-card', scope);
      var empty = select('[data-empty-state]', scope);

      function value(node) {
        return node ? node.value.trim().toLowerCase() : '';
      }

      function apply() {
        var keyword = value(input);
        var genreValue = value(genre);
        var categoryValue = value(category);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-category')
          ].join(' ').toLowerCase();
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (genreValue && String(card.getAttribute('data-genre')).toLowerCase().indexOf(genreValue) === -1) {
            ok = false;
          }
          if (categoryValue && String(card.getAttribute('data-category')).toLowerCase() !== categoryValue) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [input, genre, category].forEach(function (node) {
        if (node) {
          node.addEventListener('input', apply);
          node.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = select('video', player);
      var button = select('[data-play-button]', player);
      var data = select('.stream-json', player);
      var stream = '';
      var hls = null;
      var bound = false;

      if (!video || !data) {
        return;
      }

      try {
        stream = JSON.parse(data.textContent).src || '';
      } catch (error) {
        stream = '';
      }

      function bind() {
        if (bound || !stream) {
          return;
        }
        bound = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }
        video.src = stream;
      }

      function play() {
        bind();
        if (button) {
          button.classList.add('hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearchPanels();
    initPlayers();
  });
})();
