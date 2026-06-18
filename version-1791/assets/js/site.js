(function() {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function() {
        var menuButton = document.querySelector('[data-menu-button]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function() {
                mobileNav.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length > 1) {
            var current = 0;
            var showSlide = function(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function(slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function(dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            };
            dots.forEach(function(dot, index) {
                dot.addEventListener('click', function() {
                    showSlide(index);
                });
            });
            window.setInterval(function() {
                showSlide(current + 1);
            }, 5200);
        }

        var localFilter = document.querySelector('[data-local-filter]');
        var localCards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list] .filter-card'));
        if (localFilter && localCards.length) {
            localFilter.addEventListener('input', function() {
                var keyword = localFilter.value.trim().toLowerCase();
                localCards.forEach(function(card) {
                    var text = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(' ').toLowerCase();
                    card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
                });
            });
        }

        var searchInput = document.getElementById('searchInput');
        var regionFilter = document.getElementById('regionFilter');
        var typeFilter = document.getElementById('typeFilter');
        var yearFilter = document.getElementById('yearFilter');
        var searchCards = Array.prototype.slice.call(document.querySelectorAll('[data-search-list] .filter-card'));
        var resultNote = document.querySelector('[data-result-note]');
        if (searchInput && searchCards.length) {
            var updateSearch = function() {
                var keyword = searchInput.value.trim().toLowerCase();
                var region = regionFilter ? regionFilter.value : '';
                var type = typeFilter ? typeFilter.value : '';
                var year = yearFilter ? yearFilter.value : '';
                var visible = 0;
                searchCards.forEach(function(card) {
                    var text = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(' ').toLowerCase();
                    var ok = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (region && card.dataset.region !== region) {
                        ok = false;
                    }
                    if (type && card.dataset.type !== type) {
                        ok = false;
                    }
                    if (year && card.dataset.year !== year) {
                        ok = false;
                    }
                    card.classList.toggle('is-hidden', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (resultNote) {
                    resultNote.textContent = '当前匹配 ' + visible + ' 部内容';
                }
            };
            [searchInput, regionFilter, typeFilter, yearFilter].forEach(function(control) {
                if (control) {
                    control.addEventListener('input', updateSearch);
                    control.addEventListener('change', updateSearch);
                }
            });
            updateSearch();
        }
    });

    window.setupMoviePlayer = function(streamUrl) {
        var video = document.querySelector('[data-player-video]');
        var overlay = document.querySelector('[data-play-overlay]');
        if (!video || !overlay || !streamUrl) {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function(event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        }
        var start = function() {
            overlay.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function() {});
            }
        };
        overlay.addEventListener('click', start);
        video.addEventListener('click', function() {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function() {
            overlay.classList.add('is-hidden');
        });
    };
})();
