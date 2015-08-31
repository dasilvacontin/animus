'use strict'
var zepto = require('zepto-browserify')
var EntriesController = require('./EntriesController')
var Entry = require('./Entry')
var EntryView = require('./EntryView')

var $ = zepto.$
var controller

/* TODO: Refactor into a AnimusController class. */
var animusTemplate = "<div id='animus' class='animus-hide'><div class='animus-view'><input class='animus-new-entry-input' type='text' placeholder='animus'></input><ul class='animus-entry-list'></ul></div></div>"
var animus = $(animusTemplate)

window.toggleAnimus = function () {
  if (!controller) {
    controller = new EntriesController({
      el: $(animus).find('.animus-view'),
      model: Entry,
      modelView: EntryView
    })
    controller.on('toggle', window.toggleAnimus)
  }

  blurPage(!controller.active)
  showAnimus(!controller.active)
  controller.setActive(!controller.active)
}
window.AnimusSaveWebsite = function () {
  if (!controller || !controller.active)
    window.toggleAnimus()
  controller.input.val(window.document.title + ' ' + window.location.href)
  controller.onInputChange()
  controller.input.focus()
  controller.input.scrollLeft(Infinity)
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
      $(animus).removeClass('animus-hide')
      $(document.body).addClass('animus-no-scroll')
    }, 16)
  } else {
    $(animus).addClass('animus-hide')
    $(document.body).removeClass('animus-no-scroll')
    animusTimeout = setTimeout(function () {
      $(animus).remove()
    }, 500)
  }
}
