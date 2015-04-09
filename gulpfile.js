'use strict'
var path = require('path')
var gulp = require('gulp')
var loadDirectory = require('gulp-load-directory')

loadDirectory(path.join(__dirname, 'tasks'))

gulp.task('default', ['browserify', 'copy', 'sass'], function () {
  process.exit(0)
})
