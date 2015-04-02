'use strict' /* global chrome */
var zepto = require('zepto-browserify')
var ifvisible = window.ifvisible = require('./ifvisible')
var EntriesController = require('./EntriesController')
var Entry = require('./Entry')
var EntryView = require('./EntryView')

var $ = zepto.$
var controller

console.log('animus operative')
ifvisible.now() // force init of listeners until the issue/bug is solved

/* TODO: Refactor into a AnimusController class. */
var animusTemplate = "<div id='animus' class='hide'><div class='animus-view'><input class='animus-new-entry-input' type='text' placeholder='animus'></input><ul class='animus-entry-list'></ul></div></div>"
var animus = $(animusTemplate)

/**
 * Handles logic for the different key shortcuts.
 *
 * @param {String} command
 */
var socket = chrome.runtime.connect()
socket.onMessage.addListener(function (command) {
  console.log(+new Date, 'ifvisible.now()', ifvisible.now())
  if (!ifvisible.now()) return

  if (!controller) {
    controller = new EntriesController({
      el: $(animus).find('.animus-view'),
      model: Entry,
      modelView: EntryView
    })
  }

  if (command === 'toggle-animus') {
    blurPage(!controller.active)
    if (!controller.active) $('body').append(animus)
    showAnimus(!controller.active)
    controller.active = !controller.active
  }
})

var blurredNodes = []
function blurPage (flag) {
  var i, node
  if (flag === undefined) flag = true
  if (flag) {
    blurredNodes = []
    var rootNodes = document.body.children
    for (i = 0; i < rootNodes.length; ++i) {
      node = rootNodes[i]
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

function showAnimus (flag) {
  if (flag === undefined) flag = true
  setTimeout(function () {
    $(animus)[flag ? 'removeClass' : 'addClass']('hide')
  }, 16)
  if (!flag) {
    setTimeout(function () {
      $(animus).remove()
    }, 1000)
  }
}
