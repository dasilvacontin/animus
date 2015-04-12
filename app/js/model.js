'use strict' /* global chrome */
var events = require('events')
var _ = require('lodash')
var observe = require('observe')
var shortid = require('shortid')

exports = module.exports = Model

/**
 * Handles the persistence layer of a set of data.  Unique ids are auto
 * generated for each instance and all instances are held at `items[id]`
 *
 * @constructor
 */

function Model (props) {
  observe.apply(this)

  this.id = shortid.generate()
  _.extend(this, props)
  if (!this.constructor.items) this.constructor.items = {}
  this.constructor.items[this.id] = this
  this.emit('add', this)
  this.save()
}
_.mixin(Model, events.EventEmitter.prototype)
Model.prototype = observe({})

/**
 * Removes the model from the collection and from sync storage.
 */

Model.prototype.destroy = function () {
  delete this.constructor.items[this.id]
  this.emit('destroy')
  chrome.storage.sync.remove(this.id)
}

/**
 * Save the model in sync storage.
 */

Model.prototype.save = function () {
  // copy important atributes
  var saveState = _.pick(this, (this.dbProperties || []).concat('id'))

  var floppy = {}
  floppy[saveState.id] = saveState
  chrome.storage.sync.set(floppy)
}

/**
 * Update with the newValue given by chrome.storage.onChanged
 *
 * @param {Object} props
 */

Model.prototype.update = function (props) {
  _.extend(this, props)
  this.emit('update')
}
