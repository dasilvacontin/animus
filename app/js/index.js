'use strict'
var zepto = require('zepto-browserify')
var EntriesController = require('./EntriesController')
var Entry = require('./Entry')
var EntryView = require('./EntryView')

var $ = zepto.$

function main () {
  var controller = new EntriesController({
    el: $('#animus .animus-view'),
    model: Entry,
    modelView: EntryView
  })
  controller

  // fancy intro thing
  setTimeout(function () {
    document.getElementById('page-content').className += ' blurred'
    var animus = document.getElementById('animus')
    animus.className = animus.className.replace('hide', '')
  }, 500)
}

if (!module.parent) {
  $(function () {
    main()
  })
}
