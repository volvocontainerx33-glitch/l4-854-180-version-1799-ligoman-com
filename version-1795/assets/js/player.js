(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var player = document.querySelector("[data-player]");

    if (!player) {
      return;
    }

    var video = player.querySelector("video");
    var playButton = player.querySelector("[data-play]");
    var detailButton = document.querySelector("[data-detail-play]");
    var status = player.querySelector("[data-status]");
    var source = player.getAttribute("data-source");
    var started = false;
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message || "";
      }
    }

    function playVideo() {
      if (!video || !source) {
        return;
      }

      player.classList.add("is-playing");
      setStatus("正在加载...");

      var playPromise = video.play();

      if (playPromise && typeof playPromise.then === "function") {
        playPromise.then(function () {
          setStatus("");
        }).catch(function () {
          setStatus("点击视频区域继续播放");
        });
      } else {
        setStatus("");
      }
    }

    function initSource() {
      if (started) {
        playVideo();
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("视频加载失败，请稍后重试");
          }
        });
        return;
      }

      setStatus("当前浏览器暂不支持播放");
    }

    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.preventDefault();
        initSource();
      });
    }

    if (detailButton) {
      detailButton.addEventListener("click", function (event) {
        event.preventDefault();
        initSource();
      });
    }

    video.addEventListener("play", function () {
      player.classList.add("is-playing");
      setStatus("");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        player.classList.remove("is-playing");
      }
    });

    video.addEventListener("ended", function () {
      player.classList.remove("is-playing");
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
