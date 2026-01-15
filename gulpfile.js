const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const browserSync = require("browser-sync").create();
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const sourcemaps = require("gulp-sourcemaps");
const fs = require("fs");
const del = require("del"); // 추가 필요: npm install --save-dev del

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

/** 이미지 폴더 정리 (빌드용) */
function cleanImages() {
  return del(['src/assets/images/**/*', 'dist/assets/images/**/*']);
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
    <title>JUN Portfolio</title>
    <meta property="og:type" content="website">
    <meta property="og:title" content="JUN Portfolio">
    <meta property="og:description" content="web publisher Portfolio">
    <meta property="og:image" content="https://junjunpark.github.io/junspace/assets/images/og.png">
    <meta property="og:url" content="https://junjunpark.github.io/junspace/">
    <script>
        window.location.href = "html/main.html";
    </script>
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

  // images_origin 감시 - 변경/추가/삭제 이벤트 처리
  const imageOriginWatcher = watch("src/assets/images_origin/**/*");

  imageOriginWatcher.on('change', function(path) {
    return src(path, { base: 'src/assets/images_origin' })
      .pipe(imagemin([
        imagemin.mozjpeg({ quality: 85, progressive: true }),
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.svgo(),
      ]))
      .pipe(dest("src/assets/images"))
      .pipe(dest("dist/assets/images"))
      .pipe(browserSync.stream());
  });

  imageOriginWatcher.on('add', function(path) {
    return src(path, { base: 'src/assets/images_origin' })
      .pipe(imagemin([
        imagemin.mozjpeg({ quality: 85, progressive: true }),
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.svgo(),
      ]))
      .pipe(dest("src/assets/images"))
      .pipe(dest("dist/assets/images"))
      .pipe(browserSync.stream());
  });

  imageOriginWatcher.on('unlink', function(path) {
    const relativePath = path.replace(/src[\/\\]assets[\/\\]images_origin[\/\\]/, '');
    del.sync([
      `src/assets/images/${relativePath}`,
      `dist/assets/images/${relativePath}`
    ]);
    console.log(`🗑️  Deleted: ${relativePath}`);
    browserSync.reload();
  });

  // images 폴더 직접 감시 (수동 편집용)
  watch("src/assets/images/**/*", images);
}

// 빌드 태스크 (배포용) - 이미지 정리 후 다시 생성
exports.build = series(
  cleanImages,
  parallel(html, scss, js),
  imagesOptimize,
  images,
  redirect
);

// 개발 서버 (기본)
exports.default = series(
  parallel(html, scss, js, series(imagesOptimize, images)),
  serve
);
