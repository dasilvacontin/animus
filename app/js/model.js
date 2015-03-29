'use strict'; /* global chrome */
var events = require('events');
var _ = require('lodash');
var observe = require('observe');
var shortid = require('shortid');
var eutils = require('./event-utils');

var emitP = eutils.emitP;
exports = module.exports = Model;

/**
 * Handles the persistence layer of a set of data.  Unique ids are auto
 * generated for each instance and all instances are held at `items[id]`
 *
 * @constructor
 */

function Model(props) {
  observe.apply(this);

  this.id = shortid.generate();
  _.extend(this, props);
  if(!this.constructor.items) this.constructor.items = {};
  this.constructor.items[this.id] = this;
  this.emit('add', this);

  var _this = this;
  this.on('change', function() {
    if(!_this.isDirty) _this.isDirty = true;
  });
}
_.mixin(Model, events.EventEmitter.prototype);
Model.prototype = observe({});

/**
 * Removes the item matching a predicate. If a string is provided, removes the
 * item with that id.
 *
 * @param {{Object|String|Function}} pred
 * @return {Promise}
 */

Model.destroy = function(query) {
  if(_.isString(query) || _.isFunction(query)) {
    this.items = _.omit(this.items, query);
  } else {
    this.items = _.omit(this.items, _.matches(query));
  }

  return this.sync();
};

/**
 * Synchronizes our items with the ChromeStorage. Executes and waits for
 * `before:sync` and `after:sync` hooks.
 *
 * @return {Promise}
 */

Model.sync = function() {
  var _this = this;
  var beforeP = emitP(this, 'before:sync');

  return beforeP
    .then(function() {
      chrome.storage.sync.set(_this.items);
      return emitP(this, 'sync');
    });
};

/**
 * Removes the model from the collection.
 *
 * @return {Promise}
 */

Model.prototype.destroy = function() {
  return this.constructor.destroy({ id: this.id });
};
