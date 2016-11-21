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
  sourceDir: 'src',
  scssDir: 'scss',
  distDir: 'dist',
  entryPoint: 'app'
}

gulp.task('sass', () => {
  return gulp.src(config.sourceDir + '/**/*.scss')
    .pipe(sass())

    //.pipe(rename(function (path) {
    //  path.extname = '.min.css';
    //}))
    .pipe(concat(config.entryPoint + '.min.css'))
    .pipe(cssnano({autoprefixer: {browsers: 'last 2 versions', add: true}}))
    .pipe(gulp.dest('./' + config.distDir));
});

gulp.task('browserify', () => {
  var browserified = function(entry) {
    var b = browserify({entries: [entry]});
    b.transform(babelify);
    b.transform(riotify);
    return b.bundle();
  };
  var entry = './' + config.sourceDir + '/' + config.entryPoint + '.js';
  return browserified(entry)
    .pipe(source(config.entryPoint + '.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./' + config.distDir));
});

gulp.task('default', ['browserify', 'sass']);
