const gulp = require(`gulp`);
const sass = require(`gulp-sass`);
const plumber = require(`gulp-plumber`);
const postcss = require(`gulp-postcss`);
const autoprefixer = require(`autoprefixer`);
const server = require(`browser-sync`).create();
const rename = require(`gulp-rename`);
const del = require(`del`);
const csso = require(`gulp-csso`);
const htmlmin = require(`gulp-htmlmin`);
const uglify = require(`gulp-uglify`);
const babel = require(`rollup-plugin-babel`);
const rollup = require(`gulp-better-rollup`);
const nodeResolve = require(`rollup-plugin-node-resolve`);
const sourcemaps = require(`gulp-sourcemaps`);
const commonjs = require(`rollup-plugin-commonjs`);
const svgmin = require(`gulp-svgmin`);
const svgstore = require(`gulp-svgstore`);
const webp = require(`gulp-webp`);

gulp.task(`clean`, function () {
  return del(`build`);
});

gulp.task(`copy`, function () {
  return gulp.src([
    `source/fonts/**/*.{woff,woff2}`,
    `source/img/**`,
    `source/**/*.html`,
  ], {
    base: `source`
  })
    .pipe(gulp.dest(`build`));
});

gulp.task(`style`, function () {
  return gulp.src(`source/sass/style.scss`)
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest(`build/css`))
    .pipe(csso())
    .pipe(rename(`style-min.css`))
    .pipe(gulp.dest(`build/css`))
    .pipe(server.stream());
});

gulp.task(`htmlmin`, () => {
  return gulp.src(`build/*.html`)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(`build`));
});

gulp.task(`sprite`, () => {
  return gulp.src([
    `source/img/icons/*.svg`,
  ])
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename(`sprite.svg`))
  .pipe(gulp.dest(`build/img/sprite`));
});

gulp.task(`copyHtml`, () => {
  return gulp.src(`source/*.html`)
    .pipe(gulp.dest(`build`))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(`build`));
});

gulp.task(`scripts`, () => {
  return gulp.src(`source/js/main.js`).
    pipe(plumber()).
    pipe(sourcemaps.init()).
    pipe(rollup({
      plugins: [
        commonjs(),
        nodeResolve(),
        babel({
          babelrc: false,
          exclude: `node_modules/**`,
          presets: [`@babel/env`]
        }),
        uglify()
      ]
    }, `iife`)).
    pipe(sourcemaps.write(``)).
    pipe(plumber()).
    pipe(gulp.dest(`build/js/`));
});

gulp.task(`build`, gulp.series(`clean`, `copy`, `style`, `htmlmin`, `sprite`, `scripts`, (done) => {
  done();
}));

gulp.task(`serve`, () => {
  server.init({
    server: `build/`,
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch(`source/sass/**/*.{scss,sass}`, gulp.series(`style`));
  gulp.watch(`source/img/**/*`, gulp.series(`copy`)).on(`change`, server.reload);
  gulp.watch(`source/*.html`, gulp.series(`copyHtml`)).on(`change`, server.reload);
  gulp.watch(`source/js/**/*.js`, gulp.series(`scripts`)).on(`change`, server.reload);
});

// `Одноразовые` таски
// Запустить npm i -g gulp-cli, чтобы запускать `gulp webp` в терминале без ошибок
gulp.task(`svg-optim`, () => {
  return gulp.src(`source/img/*.svg`)
    .pipe(svgmin())
    .pipe(gulp.dest(`source/img`));
});

gulp.task(`webp`, () => {
  return gulp.src(`source/img/**/*.{png,jpg}`)
    .pipe(webp())
    .pipe(gulp.dest(`source/img`));
});

