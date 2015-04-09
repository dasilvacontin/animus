'use strict'
var gulp = require('gulp')
var sass = require('gulp-ruby-sass')
var autoprefixer = require('gulp-autoprefixer')
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps')

exports.sass = function() {
  return gulp.src('app/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', function (e) {
      console.log(e.message)
    })
    .pipe(autoprefixer())
    .pipe(concat('all.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
};
