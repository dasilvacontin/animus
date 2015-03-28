'use strict';
var Promise = require('bluebird');

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

exports.emitP = function emitP(emitter, event, args) {
  args = Array.prototype.slice.call(args, 2);
  return Promise.map(emitter.listeners(event), function(handler) {
    var result = handler.apply(emitter, args);
    return result;
  });
};
