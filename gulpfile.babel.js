'use strict';

import gulp from 'gulp';
import uglify from 'gulp-uglify';
import sass from 'gulp-sass';
import cssnano from 'gulp-cssnano';
import rename from 'gulp-rename';
import concat from 'gulp-concat';
import cache from 'gulp-cache';
import imagemin from 'gulp-imagemin';
import htmlmin from 'gulp-htmlmin';
import sourcemaps from 'gulp-sourcemaps';
import gIf from 'gulp-if';
import transform from 'vinyl-transform';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import browserify from 'browserify';
import babelify from 'babelify';
import riotify from 'riotify';
import yargs from 'yargs';

const config = {
  srcDir: 'src/',
  distDir: 'dist/',
  debug: yargs.argv.debug != undefined,
  images: {
    srcDir: 'images/',
    distDir: 'images/'
  },
  sass: {
    srcDir: 'scss/',
    distDir: '',
    entry: 'app'
  },
  browserify: {
    srcDir: 'js/',
    distDir: '',
    entry: 'app'
  }
}

console.log(config.debug);

gulp.task('copy', () => {
  return gulp.src([
    config.srcDir + '*',
    '!' + config.srcDir + '*.html',
  ])
  .pipe(gulp.dest(config.distDir));
});

gulp.task('html', () => {
  return gulp.src(config.srcDir + '*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(config.distDir));
});

gulp.task('images', () => {
  return gulp.src(config.srcDir + config.images.srcDir + '**/*')
    .pipe(cache(imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(config.distDir + config.images.distDir));
});

gulp.task('sass', () => {
  return gulp.src(config.srcDir + config.sass.srcDir + config.sass.entry+ '.scss')
    .pipe(sass())
    .pipe(rename(function (path) {
      path.extname = '.min.css';
    }))
    .pipe(cssnano({autoprefixer: {browsers: 'last 2 versions', add: true}}))
    .pipe(gulp.dest(config.distDir + config.sass.distDir));
});

gulp.task('browserify', () => {
  var browserified = function(entry) {
    var b = browserify({
      entries: [entry],
      debug: config.debug,
    });
    b.transform(babelify);
    b.transform(riotify);
    return b.bundle();
  };
  var entry = config.srcDir + config.browserify.srcDir + config.browserify.entry + '.js';
  return browserified(entry)
    .pipe(source(config.browserify.entry  + '.min.js'))
    .pipe(buffer())
    .pipe(gIf(config.debug, sourcemaps.init({loadMaps: true})))
    .pipe(uglify())
    .pipe(gIf(config.debug, sourcemaps.write('./')))
    .pipe(gulp.dest(config.distDir + config.browserify.distDir));
});

gulp.task('default', ['copy','html','images', 'sass','browserify']);
