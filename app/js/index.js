'use strict';
var util = require('util');
var _ = require('lodash');
var zepto = require('zepto-browserify');
var Controller = require('./controller');
var Model = require('./model');

var $ = zepto.$;
var KEYCODES = {
  enter: 13,
};

function main() {
  var controller = new EntriesController({
    el: $('#animus .animus-view'),
    model: Entry,
  });

  // fancy intro thing
  setTimeout(function() {
    document.getElementById('page-content').className += ' blurred';
    var animus = document.getElementById('animus');
    animus.className = animus.className.replace('hide', '');
  }, 500);
}

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
  if(evt.keyCode === KEYCODES.enter) {
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
  console.log(html);
  var html = '<li>' + entry.title + '</li>';
  this.$el.find('.animus-entry-list')
    .add(html);
};

function Entry(params) {
  if (this === undefined) throw new Error('wat');
  Model.apply(this, arguments);
  this.createdAt = new Date();
}
util.inherits(Entry, Model);
_.mixin(Entry, Model);

if(!module.parent) {
  $(function() {
    main();
  });
}
