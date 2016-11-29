'use strict';

import gulp from 'gulp';
import uglify from 'gulp-uglify';
import closure from 'gulp-closure';
import sass from 'gulp-sass';
import cssnano from 'gulp-cssnano';
import rename from 'gulp-rename';
import concat from 'gulp-concat';
import cache from 'gulp-cache';
import imagemin from 'gulp-imagemin';
import htmlmin from 'gulp-htmlmin';
import sourcemaps from 'gulp-sourcemaps';
import gIf from 'gulp-if';
import manifest from 'gulp-manifest';
import swig from 'gulp-swig';
import browserSync from 'browser-sync';
import transform from 'vinyl-transform';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import browserify from 'browserify';
import babelify from 'babelify';
import riotify from 'riotify';
import del from 'del';
import rs from 'run-sequence';


const SRC_ROOT_DIR = 'src/';
const SRC_APP_DIR = SRC_ROOT_DIR + 'app/';
const SRC_APP_ENTRY = SRC_APP_DIR + 'app.js';
const SRC_LIB_DIR = SRC_ROOT_DIR + 'lib/';
const SRC_TAGS_DIR = SRC_ROOT_DIR + 'tags/';
const SRC_STYLES_DIR = SRC_ROOT_DIR + 'styles/';
const SRC_STYLES_ENTRY = SRC_STYLES_DIR + 'app.scss';
const SRC_IMAGES_DIR = SRC_ROOT_DIR + 'images/';
const DIST_ROOT_DIR = './dist/'
const DIST_IMAGES_DIR = DIST_ROOT_DIR + 'images/';
const DIST_BUNDLE = 'app.min.js';
const DIST_HTML_MANIFEST_FILENAME = 'app.manifest';

const WEB_PORT = 9000;

const MANIFEST = {
  name: 'Web app starter',
  short_name: 'WAS',
  description: 'Starter kit for riot based webapp',
  manifest_json_filename: 'manifest.json',
  manifest_webapp_filename: 'manifest.webapp',
  apple_touch_icon: {
    src: 'images/icons/touch/apple-touch-icon-152x152.png',
    size: '152',
    sizes: '152x152',
    type: 'image/png'
  },
  chrome_touch_icon: {
    src: 'images/icons/touch/chrome-touch-icon-192x192.png',
    size: '192',
    sizes: '192x192',
    type: 'image/png'
  },
  ms_touch_icon: {
    src: 'images/icons/touch/ms-touch-icon-144x144.png',
    size: '144',
    sizes: '144x144',
    type: 'image/png'
  },
  icons: [{
    src: 'images/icons/touch/icon-128x128.png',
    size: '128',
    sizes: '128x128',
    type: 'image/png'
  }],
  start_url: '.',
  display: 'standalone',
  background_color: '#0000FF',
  theme_color: '#FFFF00'
}

let dev = true;
let bs = browserSync.create();

function errorHandler(error) {
    console.log(error);
}

gulp.task('clean', () => {
  return del([DIST_ROOT_DIR]);
});

gulp.task('root', () => {
  return gulp.src([
    SRC_ROOT_DIR + '*',
    '!' + SRC_ROOT_DIR + '*.swi',
    '!' + SRC_APP_DIR,
    '!' + SRC_LIB_DIR,
    '!' + SRC_TAGS_DIR,
    '!' + SRC_STYLES_DIR,
    '!' + SRC_IMAGES_DIR,
  ])
  .pipe(gulp.dest(DIST_ROOT_DIR));
});

gulp.task('index', () => {
  return gulp.src(SRC_ROOT_DIR + 'index.html.swi')
    .pipe(swig({data: MANIFEST}))
    .pipe(rename('index.html'))
    //.pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(DIST_ROOT_DIR));
});

gulp.task('webapp-manifests', () => {
  return gulp.src([
    SRC_ROOT_DIR + MANIFEST.manifest_webapp_filename + '.swi',
    SRC_ROOT_DIR + MANIFEST.manifest_json_filename + '.swi'
  ])
  .pipe(swig({data: MANIFEST}))
  .pipe(rename((path) => {
    path.extname = '';
  }))
  .pipe(gulp.dest(DIST_ROOT_DIR));
})

gulp.task('images', () => {
  return gulp.src(SRC_IMAGES_DIR + '**/*.{png,jpg,svg}')
    .pipe(cache(imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(DIST_IMAGES_DIR));
});

gulp.task('styles', (cb) => {
  return gulp.src(SRC_STYLES_ENTRY)
    .pipe(gIf(dev, sourcemaps.init()))
    .pipe(sass())
    .pipe(rename((path) => {
      path.extname = '.min.css';
    }))
    .pipe(cssnano({autoprefixer: {browsers: 'last 2 versions', add: true}}))
    .pipe(gIf(dev, sourcemaps.write('./')))
    .pipe(gulp.dest(DIST_ROOT_DIR));
});

gulp.task('browserify', () => {
  let b = browserify({
    entries: [SRC_APP_ENTRY],
    debug: dev,
  });
  b.transform(babelify);
  b.transform(riotify);
  return b.bundle().on('error', errorHandler)
    .pipe(source(DIST_BUNDLE))
    .pipe(buffer())
    .pipe(gIf(dev, sourcemaps.init({loadMaps: true})))
    .pipe(closure())
    .pipe(gIf(dev, sourcemaps.write('./')))
    .pipe(gulp.dest(DIST_ROOT_DIR));
});

gulp.task('bundle', (cb) => {
  rs('clean', ['root', 'index', 'webapp-manifests', 'images', 'styles', 'browserify'], cb);
});

gulp.task('serve', () => {
  bs.init({
    server: {
      baseDir: DIST_ROOT_DIR
    },
    port: WEB_PORT,
  })
});

gulp.task('reload', () => {
    return bs.reload();
})

gulp.task('watch-index', (cb) => {
  rs('index', 'reload', cb);
});

gulp.task('watch-images', (cb) => {
  rs('images', 'reload', cb);
});

gulp.task('watch-styles', (cb) => {
  rs('styles', 'reload', cb);
});

gulp.task('watch-browserify',(cb) => {
  rs('browserify', 'reload', cb);
});

gulp.task('watch', () => {

  gulp.watch([SRC_ROOT_DIR + 'index.html'], ['watch-index']);
  gulp.watch([SRC_IMAGES_DIR + '**/*.{png,jpg,svg}'], ['watch-images']);
  gulp.watch([SRC_STYLES_DIR + '**/*.scss'], ['watch-styles']);
  gulp.watch([SRC_APP_DIR + '**/*.{js, tag}', SRC_LIB_DIR + '**/*.js'], ['watch-browserify']);

});

gulp.task('html-manifest', () => {
    return gulp.src(DIST_ROOT_DIR + '**/*')
      .pipe(manifest({
        hash: true,
        preferOnline: true,
        network: ['*'],
        filename: DIST_HTML_MANIFEST_FILENAME,
        exclude: DIST_HTML_MANIFEST_FILENAME,
        timestamp: true
      }))
      .pipe(gulp.dest('dist'));
  });

gulp.task('dev', (cb) => {
  rs('bundle', cb);
});

gulp.task('serve-dev', (cb) => {
  rs('dev', 'serve', 'watch', cb);
});

gulp.task('dist', () => {
  dev = false;
  rs('bundle', 'manifest');
});

gulp.task('serve-dist', () => {
  dev = false;
  rs('bundle', 'html-manifest', 'serve');
});

gulp.task('default', ['serve-dev']);
