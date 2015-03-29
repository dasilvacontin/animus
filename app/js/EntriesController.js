'use strict';
var util = require('util');
var _ = require('lodash');
var Controller = require('./controller');
var Entry = require('./Entry');

var KEYCODES = {
  ENTER: 13,
  TAB: 9
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
  input.on('keydown', function(evt) {
    _this.onKeydown(evt);
  });
};

EntriesController.prototype.onKeydown = function(evt) {
  if (evt.keyCode === KEYCODES.ENTER) {
    var input = this.$el.find('input')
    var entry = new this.model({
      title: input.val()
    });
    this.addEntry(entry);
    input.val('');
  }
};

EntriesController.prototype.addEntry = function(entry) {
  var entryView = new this.modelView(entry);
  entryView.on('click:tag', this.clickedTag.bind(this));
  var list = this.$el.find('.animus-entry-list');
  list.prepend(entryView.$el);
};

/**
 * Adds the tag to the search.
 *
 * @param {String} tag
 */

EntriesController.prototype.clickedTag = function(tag) {
  console.log(tag);
  var input = this.$el.find('input');
  input.val(input.val()+tag);
}
