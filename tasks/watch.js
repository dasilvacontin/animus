'use strict';
var gulp = require('gulp');

exports.css = function() {
  gulp.watch('./app/**/*.css', ['autoprefix']);
};

exports.copy = function() {
  gulp.watch('./app/**/*.html', ['copy']);
};

exports.js = function() {
  gulp.watch('./app/**/*.js', ['browserify']);
};
