'use strict';
var events = require('events');
var util = require('util');
var zepto = require('zepto-browserify');

var $ = zepto.$;

exports = module.exports = Controller;

function Controller(options) {
  this.attach(options.el);
}
util.inherits(Controller, events.EventEmitter);

Controller.prototype.attach = function(el) {
  if(!el) {
    throw new Error('Cannot attach to ' + el);
  }

  this.$el = $(el);
  this.$ = this.$el.find.bind(this.$el);
};
