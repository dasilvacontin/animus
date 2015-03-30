'use strict';
var util = require('util');
var _ = require('lodash');
var Controller = require('./controller');
var Entry = require('./Entry');
var Query = require('./Query');

var KEYCODES = {
  ENTER: 13,
  TAB: 9
};

module.exports = exports = EntriesController;

function EntriesController() {
  Controller.apply(this, arguments);
  this.entryViewList = [];
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
  this.$el.find('input').on('input', this.onInputChange.bind(this));
  this.$el.find('input').focus();
};

EntriesController.prototype.onKeydown = function(evt) {
  var input = this.$el.find('input')
  if (evt.keyCode === KEYCODES.TAB) {
    if (document.activeElement == input[0]) {
      input.blur();
    } else {
      input.focus();
    }
    evt.preventDefault();
  } else if (evt.keyCode === KEYCODES.ENTER) {
    var entry = new this.model({
      title: input.val()
    });
    this.addEntry(entry);
    input.val('');
    // TODO: Why doesn't this fire automatticaly? trigger?
    this.onInputChange({srcElement: input[0]});
  }
};

EntriesController.prototype.addEntry = function(entry) {
  var entryView = new this.modelView(entry);
  entryView.on('click:tag', this.addTagToQuery.bind(this));
  var list = this.$el.find('.animus-entry-list');
  list.prepend(entryView.$el);
  this.entryViewList.push(entryView);
};

/**
 * If the tag is not already part of the query, add it.
 *
 * @param {String} tag
 */

EntriesController.prototype.addTagToQuery = function(tag) {
  console.log(tag);
  var input = this.$el.find('input');
  // TODO: check is not already part of the query
  input.val(input.val()+tag);
  input.focus();
  // TODO: Why doesn't this fire automatticaly? trigger?
  this.onInputChange({srcElement: input[0]});
}

/**
 * Callback for the InputChange Event.
 *
 * @param {Event} evt
 */

EntriesController.prototype.onInputChange = function(evt) {
  var input = evt.srcElement;
  var query = new Query(input.value);
  for (var i = 0; i < this.entryViewList.length; ++i) {
    var entryView = this.entryViewList[i];
    entryView.applyQuery(query);
  }
}
