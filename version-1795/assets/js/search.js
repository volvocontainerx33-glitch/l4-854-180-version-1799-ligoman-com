(function () {
  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function card(movie) {
    return [
      '<a class="movie-card" href="' + escapeHtml(movie.detail) + '">',
      '  <div class="card-poster">',
      '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
      movie.year ? '    <span class="poster-year">' + escapeHtml(movie.year) + '</span>' : '',
      '  </div>',
      '  <div class="card-body">',
      '    <div class="card-tags">',
      '      <span class="chip">' + escapeHtml(movie.category) + '</span>',
      '      <span class="chip">' + escapeHtml(movie.region) + '</span>',
      '    </div>',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.desc) + '</p>',
      '  </div>',
      '</a>'
    ].join("");
  }

  function run() {
    var query = getQuery();
    var input = document.getElementById("page-search-input");
    var title = document.getElementById("search-title");
    var results = document.getElementById("search-results");
    var movies = window.SEARCH_MOVIES || [];

    if (input) {
      input.value = query;
    }

    if (!results) {
      return;
    }

    if (!query) {
      title.textContent = "请输入关键词开始搜索";
      results.innerHTML = movies.slice(0, 20).map(card).join("");
      return;
    }

    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = movies.filter(function (movie) {
      var haystack = [movie.title, movie.desc, movie.genre, movie.tags, movie.region, movie.year, movie.type, movie.category]
        .join(" ")
        .toLowerCase();

      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    });

    title.textContent = matched.length ? "搜索结果" : "未找到相关影片";
    results.innerHTML = matched.slice(0, 120).map(card).join("");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
