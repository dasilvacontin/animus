'use strict'
var path = require('path')
var gulp = require('gulp')
var loadDirectory = require('gulp-load-directory')

loadDirectory(path.join(__dirname, 'tasks'))

gulp.task('build', ['browserify', 'copy', 'sass'])

gulp.task('default', ['build'], function () {
  process.exit(0)
})
