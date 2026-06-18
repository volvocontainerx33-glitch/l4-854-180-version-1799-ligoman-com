(function () {
    "use strict";

    var fallbackSources = [
        "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/afb44fcefc59ca999b28c8937184c396/manifest/video.m3u8",
        "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/b8f50401d6e57187343ce07f96b5caa4/manifest/video.m3u8",
        "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/f2a3bb8ebc2e75161e0845b6f6bc90f7/manifest/video.m3u8",
        "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c8d08e36c6fd9c76e4e2e6c2e3d4f5a1/manifest/video.m3u8"
];

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-main-nav]");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");

        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                restart();
            });
        });

        restart();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        var input = document.querySelector("[data-search-input]");
        var select = document.querySelector("[data-category-filter]");
        var grid = document.querySelector("[data-card-grid]");
        var counter = document.querySelector("[data-result-counter]");

        if (!grid || (!input && !select)) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

        function apply() {
            var query = normalize(input ? input.value : "");
            var category = normalize(select ? select.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var categoryValue = normalize(card.getAttribute("data-category"));
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedCategory = !category || categoryValue === category;
                var matched = matchedQuery && matchedCategory;

                card.classList.toggle("is-hidden-card", !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (counter) {
                counter.textContent = "当前显示 " + visible + " 部影片";
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        if (select) {
            select.addEventListener("change", apply);
        }

        apply();
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));

        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector("[data-player-button]");
            var status = shell.querySelector("[data-player-status]");
            var sources = [shell.getAttribute("data-video-src")].concat(fallbackSources).filter(Boolean);
            var sourceIndex = 0;
            var hls = null;
            var isLoaded = false;

            function setStatus(message, visible) {
                if (!status) {
                    return;
                }

                status.textContent = message || "";
                status.hidden = !visible;
            }

            function destroyHls() {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }

                hls = null;
            }

            function tryNextSource() {
                sourceIndex += 1;

                if (sourceIndex >= sources.length) {
                    setStatus("视频加载失败，请稍后刷新页面重试。", true);
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                    return;
                }

                loadSource(sources[sourceIndex], true);
            }

            function loadSource(source, autoplay) {
                if (!video || !source) {
                    return;
                }

                destroyHls();
                setStatus("正在加载视频源…", true);

                if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("视频已就绪", false);
                        if (autoplay) {
                            video.play().catch(function () {
                                setStatus("视频已加载，请再次点击播放。", true);
                            });
                        }
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            tryNextSource();
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", function () {
                        setStatus("视频已就绪", false);
                        if (autoplay) {
                            video.play().catch(function () {
                                setStatus("视频已加载，请再次点击播放。", true);
                            });
                        }
                    }, { once: true });
                    video.addEventListener("error", tryNextSource, { once: true });
                } else {
                    setStatus("当前浏览器不支持 HLS 播放，请使用 Chrome、Safari、Edge 或 Firefox。", true);
                }

                isLoaded = true;
            }

            function start() {
                if (button) {
                    button.classList.add("is-hidden");
                }

                if (!isLoaded) {
                    loadSource(sources[sourceIndex], true);
                } else if (video) {
                    video.play().catch(function () {
                        setStatus("视频已加载，请再次点击播放。", true);
                    });
                }
            }

            if (button) {
                button.addEventListener("click", start);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (!isLoaded || video.paused) {
                        start();
                    }
                });
                video.addEventListener("play", function () {
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                    setStatus("", false);
                });
            }
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
