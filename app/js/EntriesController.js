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
  this.selectedEntryView = null
}
util.inherits(EntriesController, Controller)
_.mixin(EntriesController, Controller)

EntriesController.prototype.attach = function (el) {
  Controller.prototype.attach.call(this, el)
  this.input = this.$el.find('input')
  this.input.on('input', this.onInputChange.bind(this))
  this.input.on('focus', this.onFocusInput.bind(this))
}

EntriesController.prototype.setActive = function (flag) {
  flag = !!flag
  if (!this.active && flag) {
    this.attachKeyListener()
    this.focusInput()
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
  switch (evt.keyCode) {
    case KEYCODES.TAB:
      if (this.inputIsFocused()) this.focusFirstEntry()
      else this.focusInput()
      evt.preventDefault()
      break
    case KEYCODES.ENTER:
      var val = this.input.val()
      if (!val) return
      var Model = this.model
      var entry = new Model({
        title: val
      })
      this.addEntry(entry)
      this.input.val('')
      // TODO: Why doesn't this fire automatticaly? trigger?
      this.onInputChange({srcElement: this.input[0]})
      break
  }
}

EntriesController.prototype.addEntry = function (entry) {
  var ModelView = this.modelView
  var entryView = new ModelView(entry)
  entryView.on('click:tag', this.addTagToQuery.bind(this))
  entryView.on('hover', this.hoveredEntryView.bind(this))
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
  var val = this.input.val()
  var query = new Query(val)
  if (!query.hasTag(tag)) {
    // Add tag to query
    this.input.val(val + tag)
  } else {
    // Tags only have [#a-zA-Z], so don't worry about escaping regex
    var replacingTagRe = new RegExp(tag, 'g')
    var newVal = val.replace(replacingTagRe, '')
    this.input.val(newVal)
  }
  this.focusInput()
  // TODO: Why doesn't this fire automatticaly? trigger?
  this.onInputChange({srcElement: this.input[0]})
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

/**
 * Callback for when an EntryView is hovered.
 * @param {EntryView} entryView
 */
EntriesController.prototype.hoveredEntryView = function (entryView) {
  console.log('hovered', entryView)
  if (entryView) {
    this.selectEntryView(entryView)
    this.input.blur()
  } else {
    this.input.focus()
  }
}

/**
 * Select the given EntryView
 *
 * @param {EntryView} entryView
 */
EntriesController.prototype.selectEntryView = function (entryView) {
  if (this.selectedEntryView) {
    this.selectedEntryView.setSelected(false)
  }
  if (entryView) {
    entryView.setSelected(true)
  }
  this.selectedEntryView = entryView
}

EntriesController.prototype.inputIsFocused = function () {
  return document.activeElement === this.input[0]
}

EntriesController.prototype.focusInput = function () {
  this.input.focus()
}

EntriesController.prototype.onFocusInput = function (evt) {
  this.selectEntryView(null)
}

EntriesController.prototype.focusFirstEntry = function () {
  if (this.entryViewList.length > 0) {
    this.selectEntryView(this.entryViewList[0])
  }
  this.input.blur()
}
