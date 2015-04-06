'use strict'
var events = require('events')
var util = require('util')
var zepto = require('zepto-browserify')
var Entry = require('./Entry')

var $ = zepto.$

exports = module.exports = EntryView

/**
 * Handles the rendering of an Entry and emits events when the user manipulates
 * the view.
 *
 * @constructor
 * @param {EntryModel} model
 */
function EntryView (model) {
  if (!(model instanceof Entry)) {
    throw new Error('EntryView must be initialised with an Entry')
  }
  this.model = model
  this.tags = {}
  this.createNode()
  this.visible = true
  this.matchScore = 0
}
util.inherits(EntryView, events.EventEmitter)

/**
 * Generate the initial DOM element for the EntryView using the model's info.
 */
var tagRe = /(#[a-z\d]+)/ig
var tagTpl = '<span class="animus-tag">$&</span>'

EntryView.prototype.createNode = function () {
  var html = '<li>'
    + this.model.title.replace(tagRe, tagTpl)
    + '</li>'

  this.$el = $(html)
  this.$ = this.$el.find.bind(this.$el)

  var self = this
  this.$el.on('mouseover', function (evt) {
    self.emit('hover', self)
  })
  this.$el.on('mouseout', function (evt) {
    self.emit('hover', null)
  })
  var animusTags = this.$('.animus-tag')
  animusTags.on('click', function (evt) {
    var tag = evt.toElement.textContent
    self.emit('click:tag', tag)
  })
  animusTags.forEach(function (tagView) {
    var tag = tagView.textContent.substring(1)
    var list = (self.tags[tag] || [])
    list.push(tagView)
    self.tags[tag] = list
  })
  // show-animation
  setTimeout(function () {
    self.$el.addClass('visible')
  }, 16)
}

/**
 * Updates the view depending on the Query.
 *
 * @constructor
 * @param {Query} query
 */
EntryView.prototype.applyQuery = function (query) {
  var matches = 0

  for (var tag in this.tags) {
    var tagList = this.tags[tag]
    var tagInQuery = query.hasTag(tag)
    for (var i = 0; i < tagList.length; ++i) {
      var tagView = tagList[i]
      $(tagView)[tagInQuery ? 'addClass' : 'removeClass']('high')
    }
    matches += tagList.length * tagInQuery
  }

  var exactMatch = (
  (query.tagCount === 0 && (!query.title || query.title === '#')) ||
    (query.tagCount > 0 && matches >= query.tagCount)
  )

  // TODO: softMatch condition
  var softMatch = (this.model.title.indexOf(query.title) >= 0)
  this.setVisible(exactMatch || softMatch)

  if (softMatch) matches += 0.5

  this.matchScore = matches
}

EntryView.prototype.setVisible = function (bool) {
  if (bool && !this.visible) {
    this.$el.removeClass('soft')
    this.visible = true
  } else if (!bool && this.visible) {
    this.$el.addClass('soft')
    this.visible = false
  }
}

/**
 * Display the EntryView as selected or not selected.
 *
 * @param {Boolean} flag
 */
EntryView.prototype.setSelected = function (flag) {
  this.$el[flag ? 'addClass' : 'removeClass']('selected')
}

/**
 * Removes the view from its parent, deletes data, etc.
 */
EntryView.prototype.destroy = function () {
  this.$el.removeClass('selected visible')
  this.$el.off()
  var self = this
  setTimeout(function () {
    self.$el.remove()
  }, 500)
  // TODO: data w0l0l0
}
