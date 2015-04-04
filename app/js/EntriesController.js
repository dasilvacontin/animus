'use strict'
var util = require('util')
var _ = require('lodash')
var zepto = require('zepto-browserify')
var Controller = require('./controller')
var Query = require('./Query')

var $ = zepto.$

var KEYCODES = {
  ENTER: 13,
  TAB: 9
}

module.exports = exports = EntriesController

function EntriesController () {
  Controller.apply(this, arguments)
  this.entryViewList = []
  this.active = false
  this.bindedOnKeydown = this.onKeydown.bind(this)
}
util.inherits(EntriesController, Controller)
_.mixin(EntriesController, Controller)

EntriesController.prototype.attach = function (el) {
  Controller.prototype.attach.call(this, el)
  var input = this.$el.find('input')
  input.on('input', this.onInputChange.bind(this))
  input.focus()
}

EntriesController.prototype.setActive = function (flag) {
  flag = !!flag
  if (!this.active && flag) {
    this.attachKeyListener()
  } else if (this.active && !flag) {
    this.detachKeyListener()
  }
  this.active = flag;
}

EntriesController.prototype.attachKeyListener = function () {
  document.addEventListener('keydown', this.bindedOnKeydown)
}

EntriesController.prototype.detachKeyListener = function () {
  document.removeEventListener('keydown', this.bindedOnKeydown)
}

EntriesController.prototype.onKeydown = function (evt) {
  var input = this.$el.find('input')
  switch (evt.keyCode) {
    case KEYCODES.TAB:
      if (document.activeElement === input[0]) {
        input.blur()
      } else {
        input.focus()
      }
      evt.preventDefault()
      break
    case KEYCODES.ENTER:
      var val = input.val()
      if (!val) return
      var Model = this.model
      var entry = new Model({
        title: val
      })
      this.addEntry(entry)
      input.val('')
      // TODO: Why doesn't this fire automatticaly? trigger?
      this.onInputChange({srcElement: input[0]})
      break
  }
}

EntriesController.prototype.addEntry = function (entry) {
  var ModelView = this.modelView
  var entryView = new ModelView(entry)
  entryView.on('click:tag', this.addTagToQuery.bind(this))
  var list = this.$el.find('.animus-entry-list')
  list.prepend(entryView.$el)
  this.entryViewList.unshift(entryView)
}

/**
 * If the tag is not already part of the query, add it.
 *
 * @param {String} tag
 */

EntriesController.prototype.addTagToQuery = function (tag) {
  console.log(tag)
  var input = this.$el.find('input')
  var val = input.val()
  var query = new Query(val)
  if (!query.hasTag(tag)) {
    // Add tag to query
    input.val(val + tag)
  } else {
    // Tags only have [#a-zA-Z], so don't worry about escaping regex
    var replacingTagRe = new RegExp(tag, 'g')
    var newVal = val.replace(replacingTagRe, '')
    input.val(newVal)
  }
  input.focus()
  // TODO: Why doesn't this fire automatticaly? trigger?
  this.onInputChange({srcElement: input[0]})
}

/**
 * Callback for the InputChange Event.
 *
 * @param {Event} evt
 */
EntriesController.prototype.onInputChange = function (evt) {
  var input = evt.srcElement
  var query = new Query(input.value)
  var entryView
  for (var i = 0; i < this.entryViewList.length; ++i) {
    entryView = this.entryViewList[i]
    entryView.applyQuery(query)
  }
  this.entryViewList = _.sortByOrder(this.entryViewList, ['matchScore'], [false])
  var ul = this.$el.find('ul').remove()
  for (i = 0; i < this.entryViewList.length; ++i) {
    entryView = this.entryViewList[i]
    ul.append(entryView.$el)
  }
  this.$el.append(ul)
  $(input)[query.title ? 'addClass' : 'removeClass']('has-content')
}
