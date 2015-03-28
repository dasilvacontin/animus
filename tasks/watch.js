'use strict';
var gulp = require('gulp');

exports.copy = function() {
  gulp.watch('./assets/**/*.html', ['copy']);
};

exports.js = function() {
  gulp.watch('./js/**/*.js', ['browserify']);
};
