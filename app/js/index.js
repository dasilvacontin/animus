'use strict'
var zepto = require('zepto-browserify')
var EntriesController = require('./EntriesController')
var Entry = require('./Entry')
var EntryView = require('./EntryView')

var $ = zepto.$
var controller

console.log('animus operative')

/* TODO: Refactor into a AnimusController class. */
var animusTemplate = "<div id='animus' class='hide'><div class='animus-view'><input class='animus-new-entry-input' type='text' placeholder='animus'></input><ul class='animus-entry-list'></ul></div></div>"
var animus = $(animusTemplate)

/**
 * Expose toggle function that will be called by the background process.
 */
window.toggleAnimus = function () {
  if (!controller) {
    controller = new EntriesController({
      el: $(animus).find('.animus-view'),
      model: Entry,
      modelView: EntryView
    })
  }

  blurPage(!controller.active)
  showAnimus(!controller.active)
  controller.active = !controller.active
}

var blurredNodes = []
function blurPage (flag) {
  var i, node
  if (flag === undefined) flag = true
  if (flag) {
    blurredNodes = []
    var rootNodes = document.body.children
    for (i = 0; i < rootNodes.length; ++i) {
      node = rootNodes[i]
      if (node === animus[0]) continue
      $(node).addClass('blurred')
      blurredNodes.push(node)
    }
  } else {
    for (i = 0; i < blurredNodes.length; ++i) {
      node = blurredNodes[i]
      $(node).removeClass('blurred')
    }
  }
}

var animusTimeout
function showAnimus (flag) {
  if (flag === undefined) flag = true
  clearTimeout(animusTimeout)
  if (flag) {
    $('body').append(animus)
    animusTimeout = setTimeout(function () {
      $(animus).removeClass('hide')
    }, 16)
  } else {
    $(animus).addClass('hide')
    animusTimeout = setTimeout(function () {
      $(animus).remove()
    }, 500)
  }
}
