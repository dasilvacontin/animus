'use strict';
var events = require('events');
var _ = require('lodash');
var util = require('util');
var zepto = require('zepto-browserify');
var Entry = require('./Entry');
var Query = require('./Query');

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
  this.tags = {};
  this.createNode();
  this.visible = true;
}
util.inherits(EntryView, events.EventEmitter);

/**
 * Generate the initial DOM element for the EntryView using the model's info.
 */
var tagRe = /(#[a-zA-Z\d]+)/g
var tagTpl = '<span class="animus-tag">$&</span>'

EntryView.prototype.createNode = function() {
  var query = new Query(this.model.title);
  var html = '<li>'+
    '<span class="animus-entry-text">' + query.title.replace(tagRe, tagTpl) +
    '</span>' + query.extraTags.replace(tagRe, tagTpl) + '</li>';

  this.$el = $(html);
  this.$ = this.$el.find.bind(this.$el);

  var self = this;
  this.$('.animus-tag').on('click', function(evt) {
    var tag = evt.toElement.textContent;
    self.emit('click:tag', tag);
  })
  this.$('.animus-tag').forEach(function(tagView) {
    var tag = tagView.textContent;
    self.tags[tag.substring(1)] = tagView;
  })
  // show-animation
  self.$el.addClass('displayed');
  setTimeout(function() {
    self.$el.addClass('visible');
  }, 16);
}

/**
 * Updates the view depending on the Query.
 *
 * @constructor
 * @param {Query} query
 */
EntryView.prototype.applyQuery = function(query) {
  // TODO: this must be super efficient</sarcasm>
  for (var tag in this.tags) {
    var tagView = this.tags[tag];
    $(tagView).removeClass('high');
  }
  var matches = 0;
  for (var i = 0; i < query.tags.length; ++i) {
    var tag = query.tags[i];
    console.log('query tag', tag);
    var tagView = this.tags[tag];
    if (tagView) {
      $(tagView).addClass('high');
      ++matches;
    }
  }
  this.setVisible(matches == query.tags.length || query.tags.length == 0);
}

EntryView.prototype.setVisible = function (bool) {
  if (bool && !this.visible) {
    this.$el.addClass('displayed');
    var self = this;
    setTimeout(function () {
      self.$el.addClass('visible');
    }, 16);
    this.visible = true;
  } else if (!bool && this.visible) {
    this.$el.removeClass('displayed visible');
    this.visible = false;
  }
}
