'use strict';
var util = require('util');
var zepto = require('zepto-browserify');
var Controller = require('./controller');
var Model = require('./model');

var $ = zepto.$;

function main() {
  var controller = new EntriesController({
    el: $('#animus .animus-view'),
  });
}

function EntriesController() {
  this.constructor.super_.apply(this, arguments);
}
util.inherits(EntriesController, Controller);

EntriesController.prototype.attach = function(el) {
  var _this = this;
  this.constructor.super_.prototype.attach.call(this, el);
  this.$el('input.animus-new-entry-input').on('keydown', function(evt) {
    _this.onKeydownNewEntry(evt);
  });
};

EntriesController.prototype.onKeydownNewEntry = function(evt) {
  console.log(evt.keyCode);
};

function Entry() {
  this.createdAt = new Date();
  this._super.constructor.apply(this, arguments);
}
util.inherits(Entry, Model);

if(!module.parent) {
  $(function() {
    main();
  });
}
