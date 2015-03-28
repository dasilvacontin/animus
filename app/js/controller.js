'use strict';
var events = require('events');
var util = require('util');
var $ = require('zepto-browserify');

exports = module.exports = Controller;

function Controller() {
}
util.inherits(Controller, events.EventEmitter);

Controller.prototype.attachToEl = function(el) {
  this.$el = $(el);
  this.$ = this.$el.find.bind(this.$el);
};
