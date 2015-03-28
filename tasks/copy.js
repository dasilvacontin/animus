'use strict';
var gulp = require('gulp');
var connect = require('gulp-connect');

exports.html = function() {
  return gulp.src('./app/**/*.html')
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
};
