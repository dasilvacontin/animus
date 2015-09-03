'use strict'

/* globals XMLHttpRequest */

var _ = require('lodash')
var events = require('events')
var eventUtils = require('./event-utils')
var util = require('util')
var zepto = require('zepto-browserify')
var Entry = require('./Entry')
var ghURLParser = require('./ghURLParser')

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

  var self = this
  this.model.on('destroy', function () {
    self.destroy()
  })
}
util.inherits(EntryView, events.EventEmitter)

/**
 * Generate the initial DOM element for the EntryView using the model's info.
 */
var tagRe = /(#[a-z\d]+)/ig
var tagTpl = '<span class="animus-tag">$&</span>'

EntryView.prototype.createNode = function () {

  var text = this.model.title
  var href = this.model.getLink()

  // replace link before replacing tags since link can contain '#'
  text = text.replace(href, '').replace(tagRe, tagTpl)
  if (!text) {
    text = this.model.title
  }

  var html = '<li>' + text

  // Link Parsing
  if (href) {
    html += ' <a href="' + href + '" target="_blank"><span class="octicon octicon-link"></span></a>'
  }

  // GitHub integration
  var self = this
  if (href) {
    var ghURL = ghURLParser(href)
    if (ghURL && ['issue', 'pull'].indexOf(ghURL.type) > -1) {
      var req = new XMLHttpRequest()
      req.onload = function (e) {
        if (req.response) {
          var data = JSON.parse(req.response)
          var status = data.state
          if (status === 'closed' && data.merged) {
            status = 'merged'
          }
          status = _.capitalize(status)

          var a = self.$el.find('a')
          var html = ''
          html += '<span class="animus-github-badge animus-bgcolor-' + status.toLowerCase() + '">'
          if (ghURL.type === 'issue') {
            if (status === 'closed') {
              html += '<span class="octicon octicon-issue-closed"></span> '
            } else {
              html += '<span class="octicon octicon-issue-opened"></span> '
            }
          } else if (ghURL.type === 'pull') {
            html += '<span class="octicon octicon-git-pull-request"></span> '
          }
          html += status
          html += '</span>'
          a.append(html)
        }
      }
      req.open('GET', 'https://api.github.com/repos/' + ghURL.owner + '/' + ghURL.repo + '/' + ghURL.type + 's/' + ghURL.number)
      req.send()
    }
  }
  html += '</li>'

  this.$el = $(html)
  this.$ = this.$el.find.bind(this.$el)

  this.$el.on('mouseover', function (evt) {
    if (!eventUtils.didMove(evt)) {
      return
    }
    self.emit('hover', self)
  })
  this.$el.on('mouseout', function (evt) {
    if (!eventUtils.didMove(evt)) {
      return
    }
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
  var softMatch = (this.model.title.toLowerCase().indexOf(query.title) >= 0)
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
 * Destroy model. Model alerts depending views, etc.
 */
EntryView.prototype.deleteEntry = function (hint) {
  this.hint = hint
  this.model.destroy()
}

/**
 * Removes the view from its parent, delete animations, remove listeners, etc.
 */
EntryView.prototype.destroy = function () {
  this.$el.removeClass('selected visible')
  this.$el.off()
  var self = this
  setTimeout(function () {
    self.$el.remove()
  }, 500)
  if (this.hint === undefined) this.hint = -1
  this.emit('destroy', this, this.hint)
}
