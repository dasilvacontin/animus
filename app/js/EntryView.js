'use strict';
var events = require('events');
var _ = require('lodash');
var util = require('util');
var zepto = require('zepto-browserify');
var Entry = require('./Entry');

var $ = zepto.$;

exports = module.exports = EntryView;

/**
 * Handles the rendering of an Entry and emits events when the user manipulates
 * the view.
 *
 * @constructor
 * @param {EntryModel} model
 */
function EntryView(model) {
  if (!(model instanceof Entry))
    throw new Error('EntryView must be initialised with an Entry');
  this.model = model;
  this.createNode();
  this.tags = {};
}
util.inherits(EntryView, events.EventEmitter);

/**
 * Regex that extracts the entry's `text` and the `extraTags` by matching as
 * many tags as possible at the end of the title.
 *
 * The `+?` token means as few as possible.
 */
var titleRe = /^(.+?)((\s*#[a-zA-Z\d]+\s*)*)$/
var tagRe = /(#[a-zA-Z\d]+)/g
var tagTpl = '<span class="animus-tag">$&</span>'

/**
 * Generate the initial DOM element for the EntryView using the model's info.
 */
EntryView.prototype.createNode = function() {
  var match = titleRe.exec(this.model.title)

  var title = match[1];
  if (title)
    title = title.replace(tagRe, tagTpl)

  var extraTags = (match[2] || '');
  if (extraTags)
    extraTags = extraTags.replace(/\s/g, '').replace(tagRe, tagTpl)

  var html = '<li><span class="animus-entry-text">' + title +
    '</span>' + extraTags + '</li>';

  this.$el = $(html);
  this.$ = this.$el.find.bind(this.$el);

  var self = this;
  this.$('.animus-tag').on('click', function(evt) {
    var tag = evt.toElement.textContent;
    self.emit('click:tag', tag);
  })
  // show-animation
  self.$el.addClass('displayed');
  setTimeout(function() {
    self.$el.addClass('visible');
  }, 16);
}
