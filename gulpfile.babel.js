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
import watch from 'gulp-watch';
import transform from 'vinyl-transform';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import browserify from 'browserify';
import babelify from 'babelify';
import riotify from 'riotify';
import yargs from 'yargs';
import watchify from 'watchify';

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

gulp.task('copy', tcopy);
gulp.task('html', thtml);
gulp.task('images', timages);
gulp.task('sass', tsass);
gulp.task('browserify', () => {
  return tbrowserify(browserifyBundle());
});

gulp.task('default', ['copy','html','images', 'sass','browserify']);

gulp.task('watch',  ['copy','html','images', 'sass'], () => {

  watch([config.srcDir + '*'], tcopy);
  watch([config.srcDir + '*.html'], thtml);
  watch([config.srcDir + config.images.srcDir + '**/*.{png,jpg,svg}'], timages);
  watch([config.srcDir + config.sass.srcDir + '**/*.scss'], tsass);

  let b = watchify(browserifyBundle());
  b.on('update', () => {
    tbrowserify(b);
  });
  tbrowserify(b);
});

function tcopy() {
  return gulp.src([
    config.srcDir + '*',
    '!' + config.srcDir + '*.html',
  ])
  .pipe(gulp.dest(config.distDir));
}

function thtml() {
  return gulp.src(config.srcDir + '*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(config.distDir));
}

function timages() {
  return gulp.src(config.srcDir + config.images.srcDir + '**/*.{png,jpg,svg}')
    .pipe(cache(imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(config.distDir + config.images.distDir));
}

function tsass() {
  return gulp.src(config.srcDir + config.sass.srcDir + config.sass.entry+ '.scss')
    .pipe(gIf(config.debug, sourcemaps.init()))
    .pipe(sass())
    .pipe(rename(function (path) {
      path.extname = '.min.css';
    }))
    .pipe(cssnano({autoprefixer: {browsers: 'last 2 versions', add: true}}))
    .pipe(gIf(config.debug, sourcemaps.write('./')))
    .pipe(gulp.dest(config.distDir + config.sass.distDir));
}

function browserifyBundle() {
  let b = browserify({
    entries: [config.srcDir + config.browserify.srcDir + config.browserify.entry + '.js'],
    debug: config.debug,
  });
  b.transform(babelify);
  b.transform(riotify);
  return b;
}

function tbrowserify(b) {
  return b.bundle()
    .pipe(source(config.browserify.entry  + '.min.js'))
    .pipe(buffer())
    .pipe(gIf(config.debug, sourcemaps.init({loadMaps: true})))
    .pipe(closure())
    .pipe(gIf(config.debug, sourcemaps.write('./')))
    .pipe(gulp.dest(config.distDir + config.browserify.distDir));
}
