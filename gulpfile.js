const { src, dest, watch, series } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const browserSync = require("browser-sync").create();
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const sourcemaps = require("gulp-sourcemaps");
const fs = require("fs");

/** SCSS → CSS */
function scss() {
  return src("src/assets/scss/style.scss", { sourcemaps: true })
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on("error", sass.logError))
    .pipe(sourcemaps.write("."))
    .pipe(dest("dist/assets/css"))
    .pipe(browserSync.stream());
}

/** HTML + EJS include */
function html() {
  const cardData = JSON.parse(fs.readFileSync("./src/data/cardData.json", "utf8"));

  return src("src/html/**/*.html")
    .pipe(
      ejs({
        cardBox: cardData
      }, {}, { ext: ".html" }).on("error", function (err) {
        console.error(err.toString());
        this.emit("end");
      })
    )
    .pipe(rename({ extname: ".html" }))
    .pipe(dest("dist/html"))
    .pipe(browserSync.stream());
}

/** JS file */
function js() {
  return src("src/assets/js/**/*.js")
    .pipe(dest("dist/assets/js"))
    .pipe(browserSync.stream());
}

/** images_origin → images */
function imagesOptimize() {
  return src("src/assets/images_origin/**/*")
    .pipe(
      imagemin([
        imagemin.mozjpeg({ quality: 85, progressive: true }),
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.svgo(),
      ], {
        verbose: true
      })
    )
    .pipe(dest("src/assets/images"));
}

/** images → dist */
function images() {
  return src("src/assets/images/**/*")
    .pipe(dest("dist/assets/images"))
    .pipe(browserSync.stream());
}

/** 루트에 리다이렉트 index.html 생성 (gh-pages용) */
function redirect(done) {
  const redirectHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=html/main.html">
    <script>
        window.location.href = "html/main.html";
    </script>
    <title>Redirecting...</title>
</head>
<body>
    <p>Loading...</p>
</body>
</html>`;

  fs.writeFileSync('dist/index.html', redirectHTML);
  done();
}

/** server + watch */
function serve() {
  browserSync.init({
    server: { baseDir: "dist" },
    open: true,
    startPath: "/html/main.html",
  });

  watch("src/assets/scss/**/*.scss", scss);
  watch("src/html/**/*.{html,ejs}", html);
  watch("src/data/**/*.json", html);
  watch("src/assets/js/**/*.js", js);
  watch("src/assets/images_origin/**/*", series(imagesOptimize, images));
  watch("src/assets/images/**/*", images);
}

// 빌드 태스크 (배포용)
exports.build = series(html, scss, js, imagesOptimize, images, redirect);

// 개발 서버 (기본)
exports.default = series(html, scss, js, imagesOptimize, images, serve);
