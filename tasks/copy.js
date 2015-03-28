'use strict';
var gulp = require('gulp');
var connect = require('gulp-connect');

exports.img = function() {
  return gulp.src('./app/**/*.{jpg,jpeg,svg,png}')
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
};

exports.other = function() {
  return gulp.src('./app/**/*.json')
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
};

exports.html = function() {
  return gulp.src('./app/**/*.html')
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
};
