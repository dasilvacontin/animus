'use strict';
var util = require('util');
var _ = require('lodash');
var Controller = require('./controller');

var KEYCODES = {
  ENTER: 13,
};

module.exports = exports = EntriesController;

function EntriesController() {
  Controller.apply(this, arguments);
}
util.inherits(EntriesController, Controller);
_.mixin(EntriesController, Controller);

EntriesController.prototype.attach = function(el) {
  var _this = this;
  Controller.prototype.attach.call(this, el);
  var input = this.$el;
  console.log(this.$el);
  input.on('keydown', function(evt) {
    _this.onKeydown(evt);
  });
};

EntriesController.prototype.onKeydown = function(evt) {
  console.log(evt.keyCode);
  if(evt.keyCode === KEYCODES.ENTER) {
    console.log(this.model);
    var entry = new this.model({
      title: this.$el.find('input').val(),
    });
    console.log(entry);
    this.addEntry(entry);
  }
};

EntriesController.prototype.addEntry = function(entry) {
  console.log(entry);
  var entryView = new this.modelView(entry);
  var html = '<li>' + entry.title + '</li>';
  this.$el.find('.animus-entry-list')
    .add(html);
};
