'use strict'

/* global MouseEvent */

var Promise = require('bluebird')

/**
 * Emits an event on an EventEmitter. If the handlers return a promise, it
 * waits for them to complete. Returns a promise to the fulfillment value of
 * each handler.
 *
 * @param {EventEmitter} emitter
 * @param {String} event
 * @param {Mixed...} args
 * @param {Object} [options]
 * @return {Promise<Array>}
 */

exports.emitP = function emitP (emitter, event, args) {
  args = Array.prototype.slice.call(args, 2)
  return Promise.map(emitter.listeners(event), function (handler) {
    var result = handler.apply(emitter, args)
    return result
  })
}

/**
 * In case of a mousevent, it checks if the event was caused by actual motion.
 * Chrome fires mousevents when pageX/pageY changes, eg while scrolling
 * dynamically by code, which is usually not desired.
 *
 * @param {Event} event
 * @return {Boolean}
 */

var lastMouseEvent
var setLastMouseEventTimeoutId
exports.didMove = function (event) {
  if (!(event instanceof MouseEvent)) {
    return false
  }

  var moved = !lastMouseEvent
  if (lastMouseEvent) {
    moved =
      event.screenX !== lastMouseEvent.screenX ||
      event.screenY !== lastMouseEvent.screenY
  }
  exports.setLastMouseEventAfterEventQueue(event)
  return moved
}

/**
 * Store a MouseEvent that will be used to compare positions in #didMove.
 *
 * @param {MouseEvent|undefined|null} event
 */

exports.setLastMouseEventAfterEventQueue = function (event) {
  if (event && !(event instanceof MouseEvent)) {
    throw new Error('Expected {MouseEvent|undefined|null} as first argument.')
  }

  if (setLastMouseEventTimeoutId) {
    clearTimeout(setLastMouseEventTimeoutId)
  }
  setLastMouseEventTimeoutId = setTimeout(function () {
    lastMouseEvent = event
  }, 1)
}

/**
 * Log event type. If it's a MouseEvent event, log screenX/Y too.
 */

exports.log = function (event) {
  if (!event) {
    return
  }
  if (event instanceof MouseEvent) {
    console.log(event.type, 'screenX', event.screenX, 'screenY', event.screenY)
  } else {
    console.log(event.type)
  }
}
