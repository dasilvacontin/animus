'use strict'
var connect = require('gulp-connect')

exports.connect = function () {
  connect.server({
    root: './dist',
    livereload: true,
    port: process.env.PORT || 3000
  })
}
exports.connect.dependencies = ['browserify', 'copy', 'watch', 'autoprefix']
