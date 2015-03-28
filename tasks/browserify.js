'use strict';
var browserify = require('browserify');
var gulp = require('gulp');
var connect = require('gulp-connect');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var watchify = require('watchify');

var bundler = watchify(browserify('./app/js/index.js', watchify.args));

bundler.on('update', bundle);
bundler.on('log', gutil.log);

exports.all = bundle;

function bundle() {
  return bundler.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
}
