(function () {
  function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId || "movie-player");
    var overlay = document.getElementById(options.overlayId || "play-overlay");
    var button = document.getElementById(options.buttonId || "play-button");
    var source = options.source;
    var hlsInstance = null;
    var initialized = false;

    if (!video || !source) {
      return;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function playVideo() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    function attachSource() {
      if (initialized) {
        hideOverlay();
        playVideo();
        return;
      }

      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        hideOverlay();
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          hideOverlay();
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          }
        });
        return;
      }

      video.src = source;
      hideOverlay();
      playVideo();
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        attachSource();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", function () {
        attachSource();
      });
    }

    video.addEventListener("click", function () {
      if (!initialized) {
        attachSource();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
