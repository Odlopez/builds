const gulp = require(`gulp`);
const sass = require(`gulp-sass`);
const plumber = require(`gulp-plumber`);
const postcss = require(`gulp-postcss`);
const autoprefixer = require(`autoprefixer`);
const objectFit = require(`postcss-object-fit-images`);
const server = require(`browser-sync`).create();
const rename = require(`gulp-rename`);
const del = require(`del`);
const csso = require(`gulp-csso`);
const htmlmin = require(`gulp-htmlmin`);
const uglify = require(`gulp-uglify`);
const imagemin = require('gulp-imagemin');
const babel = require(`rollup-plugin-babel`);
const rollup = require(`gulp-better-rollup`);
const nodeResolve = require(`rollup-plugin-node-resolve`);
const sourcemaps = require(`gulp-sourcemaps`);
const commonjs = require(`rollup-plugin-commonjs`);
const svgmin = require(`gulp-svgmin`);
const svgstore = require(`gulp-svgstore`);
const webp = require(`gulp-webp`);
const pug = require(`gulp-pug`);
const data = require(`gulp-data`);
const fs = require(`fs`);
const mozjpeg = require('imagemin-mozjpeg');
const config = {
  dist: `build`,
  src: `src`,
  fonts: `src/fonts/**/*.{woff,woff2}`,
  img: `src/img/**/*.{png,jpg}`,
  html: `src/*.html`,
  libs: `src/libs/**/*.{js,css}`,
  css: {
    src: `src/sass/style.scss`,
    watch: `src/sass/**/*.scss`,
    dist: `build/css`,
    min: `style.min.css`
  },
  sprite: {
    src: `src/img/icons/*.svg`,
    dist: `build/img/sprite`,
    name: `sprite.svg`
  },
  js: {
    src: `src/js/main.js`,
    watch: `src/js/**/*.js`,
    mode: `iife`,
    dist: `build/js/`
  },
  pug: {
    views: `src/views/*.pug`,
    components: `src/views/**/*.pug`
  },
  svg: {
    src: `src/img/*.svg`,
    dist: `build/img`
  },
  webp: {
    src: `src/img/**/*.{png,jpg}`,
    dist: `src/img`
  },
  data: {
    src: `data.json`
  }
};

gulp.task(`clean`, function() {
  return del(config.dist);
});

gulp.task(`copy`, function() {
  return gulp
    .src([config.fonts, config.libs, config.svg.src], {
      base: config.src
    })
    .pipe(gulp.dest(config.dist));
});

gulp.task(`style`, function() {
  return gulp
    .src(config.css.src)
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      objectFit()
    ]))
    .pipe(gulp.dest(config.css.dist))
    .pipe(csso())
    .pipe(rename(config.css.min))
    .pipe(gulp.dest(config.css.dist))
    .pipe(server.stream());
});

gulp.task(`sprite`, () => {
  return gulp
    .src([config.sprite.src])
    .pipe(
      svgstore({
        inlineSvg: true
      })
    )
    .pipe(rename(config.sprite.name))
    .pipe(gulp.dest(config.sprite.dist));
});

gulp.task(`copyHtml`, () => {
  return gulp
    .src(config.html)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(config.dist));
});

gulp.task(`scripts`, () => {
  return gulp
    .src(config.js.src)
    .pipe(plumber())
    .pipe(
      rollup(
        {
          plugins: [commonjs(), nodeResolve(), babel()]
        },
        config.js.mode
      )
    )
    .pipe(uglify())
    .pipe(plumber())
    .pipe(gulp.dest(config.js.dist));
});

gulp.task(`pug`, () => {
  return gulp
    .src(config.pug.views)
    .pipe(
      data(() => {
        return JSON.parse(fs.readFileSync(config.data.src));
      })
    )
    .pipe(pug())
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(config.dist));
});

gulp.task(`image`, () =>
  gulp
    .src(config.img)
    .pipe(imagemin(mozjpeg({
      quality: 50,
      progressive: true,
    })))
    .pipe(gulp.dest(`build/img`))
);

gulp.task(`svg-optim`, () => {
  return gulp
    .src(config.svg.src)
    .pipe(svgmin())
    .pipe(gulp.dest(config.svg.dist));
});

gulp.task(
  `build`,
  gulp.series(
    `clean`,
    `copy`,
    `image`,
    `svg-optim`,
    `style`,
    `sprite`,
    `scripts`,
    `pug`,
    (done) => {
      done();
    }
  )
);

gulp.task(`serve`, () => {
  server.init({
    server: config.dist,
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp
    .watch(config.css.watch, gulp.series(`style`))
    .on(`change`, server.reload);
  gulp.watch(config.img, gulp.series(`image`)).on(`change`, server.reload);
  gulp.watch(config.html, gulp.series(`copyHtml`)).on(`change`, server.reload);
  gulp
    .watch(config.pug.components, gulp.series('pug'))
    .on(`change`, server.reload);
  gulp
    .watch(config.js.watch, gulp.series(`scripts`))
    .on(`change`, server.reload);
});

// `Одноразовые` таски
// Запустить npm i -g gulp-cli, чтобы запускать `gulp webp` в терминале без ошибок
gulp.task(`webp`, () => {
  return gulp
    .src(config.webp.src)
    .pipe(webp())
    .pipe(gulp.dest(config.webp.dist));
});
