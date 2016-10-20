'use strict';

import gulp from 'gulp';
import uglify from 'gulp-uglify';
import transform from 'vinyl-transform';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import browserify from 'browserify';
import babelify from 'babelify';
import riotify from 'riotify';

const config = {
  sourceDir: 'src',
  distDir: 'dist',
  entryPoint: 'app'
}

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

gulp.task('default', ['browserify']);
