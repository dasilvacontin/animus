'use strict'
var gulp = require('gulp')
var sass = require('gulp-ruby-sass')
var autoprefixer = require('gulp-autoprefixer')
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps')

exports.sass = function() {
  return sass('app/css/')
    .on('error', sass.logError)
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(concat('all.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
};
