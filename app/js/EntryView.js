'use strict';
var events = require('events');
var _ = require('lodash');
var util = require('util');
var zepto = require('zepto-browserify');

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
  if (!(model instanceof EntryModel))
    throw new Error('EntryView must be initialised with an EntryModel');
  this.model = model;
  this.createNode();
}
util.inherits(EntryView, events.EventEmitter);

/**
 * Regex that extracts the entry's `text` and the `extraTags` by matching as
 * many tags as possible at the end of the title.
 *
 * The `+?` token means as few as possible.
 */
var titleRe = /^(.+?)((\s*#[a-zA-Z\d]+\s*))*$/
var tagRe = /(#[a-zA-Z\d]+)/
var tagTpl = '<span class="animus-tag">$&</span>'

/**
 * Generate the initial DOM element for the EntryView using the model's info.
 */
EntryView.prototype.createNode = function() {
  var li = document.createElement('li');
  var match = titleRe.exec(this.model.title)

  var title = match[0];
  title = title.replace(tagRe, tagTpl)

  var extraTags = match[1];
  extraTags = extraTags.replace(tagRe, tagTpl).replace(/\s/, '')

  li.textContent = '<span class="animus-entry-text">' + title +
    '</span>' + extraTags;
  this.el = li;
  console.log(li);
}
