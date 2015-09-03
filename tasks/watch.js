'use strict'
var gulp = require('gulp')

exports.css = function () {
  gulp.watch('./app/**/*.scss', ['sass'])
}

exports.copy = function () {
  gulp.watch('./app/**/*.{html,jpg,jpeg,png,svg,json}', ['copy'])
  gulp.watch('./app/*.js', ['copy'])
}

exports.js = function () {
  gulp.watch('./app/**/*.js', ['browserify'])
}

exports.js.dependencies = ['build']
