'use strict';

import gulp from 'gulp';
import uglify from 'gulp-uglify';
import sass from 'gulp-sass';
import cssnano from 'gulp-cssnano';
import rename from 'gulp-rename';
import concat from 'gulp-concat';
import transform from 'vinyl-transform';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import browserify from 'browserify';
import babelify from 'babelify';
import riotify from 'riotify';

const config = {
  sass: {
    srcDir: 'src/scss/',
    distDir: 'dist',
    entry: 'app'
  },
  browserify: {
    srcDir: 'src/js/',
    distDir: 'dist',
    entry: 'app'
  }
}

gulp.task('sass', () => {
  return gulp.src(config.sass.srcDir + config.sass.entry+ '.scss')
    .pipe(sass())
    .pipe(rename(function (path) {
      path.extname = '.min.css';
    }))
    .pipe(cssnano({autoprefixer: {browsers: 'last 2 versions', add: true}}))
    .pipe(gulp.dest('./' + config.sass.distDir));
});

gulp.task('browserify', () => {
  var browserified = function(entry) {
    var b = browserify({entries: [entry]});
    b.transform(babelify);
    b.transform(riotify);
    return b.bundle();
  };
  var entry = config.browserify.srcDir + config.browserify.entry + '.js';
  return browserified(entry)
    .pipe(source(config.browserify.entry  + '.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./' + config.browserify.distDir));
});

gulp.task('default', ['browserify', 'sass']);
