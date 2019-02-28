const gulp = require("gulp");
const sass = require("gulp-sass");
const plumber = require("gulp-plumber"); 
const postcss = require("gulp-postcss"); 
const autoprefixer = require("autoprefixer"); 
const server = require("browser-sync").create();
const run = require('run-sequence');
const rename = require("gulp-rename"); 
const del = require('del'); 
const csso = require('gulp-csso');
const htmlmin = require('gulp-htmlmin');

gulp.task("clean", function () {
  return del("build");
});

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/**/*.html",
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
});

gulp.task("style", function() {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style-min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task('htmlmin', function() {
  return gulp.src("build/*.html")
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"));
});

gulp.task("copyHtml", function () {
  return gulp.src("source/*.html")
    .pipe(gulp.dest("build"))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"));
});

gulp.task('build', gulp.series('clean', 'copy', 'style', 'htmlmin', function (done) {
  done();
}));

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("style"));
  gulp.watch("source/*.html", gulp.series("copyHtml")).on("change", server.reload);
});

// В случае чего ставим:
// npm install node-sass@latest
// npm install natives@1.1.6
// npm i -g gulp-cli