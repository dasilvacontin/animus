'use strict'
var util = require('util')
var _ = require('lodash')
var zepto = require('zepto-browserify')
var Controller = require('./controller')
var Query = require('./Query')

var $ = zepto.$

var KEYCODES = {
  ENTER: 13,
  TAB: 9,

  A: 65,
  E: 69,
  D: 68,
  U: 85,

  J: 74,
  K: 75
}

module.exports = exports = EntriesController

function EntriesController () {
  Controller.apply(this, arguments)
  this.entryViewList = []
  this.active = false
  this.bindedOnKeydown = this.onKeydown.bind(this)
  this.selectedEntryView = null
  this.selectedEntryViewIndex = -1
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
  document.addEventListener('keydown', this.bindedOnKeydown, true)
}

EntriesController.prototype.detachKeyListener = function () {
  document.removeEventListener('keydown', this.bindedOnKeydown, true)
}

EntriesController.prototype.onKeydown = function (evt) {
  evt.stopPropagation()
  if (this.inputIsFocused()) {
    switch (evt.keyCode) {

      case KEYCODES.TAB:
        this.focusFirstEntry()
        evt.preventDefault()
        break

      case KEYCODES.ENTER:
        evt.preventDefault()
        // TODO: Refactor this into a function
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
  } else {
    switch (evt.keyCode) {

      case KEYCODES.A:
      case KEYCODES.TAB:
        this.focusInput()
        evt.preventDefault()
        break

      case KEYCODES.J:
        var index = this.selectedEntryViewIndex
        index = Math.max(0, index - 1)
        this.selectEntryViewAtIndex(index)
        break

      case KEYCODES.K:
        var index = this.selectedEntryViewIndex
        index = Math.min(this.entryViewList.length - 1, index + 1)
        this.selectEntryViewAtIndex(index)
        break

      case KEYCODES.D:
        this.deleteSelectedEntry()
        // since we might end up focusing the input when no entries are left
        evt.preventDefault()
        break
    }
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
  if (entryView) {
    this.selectEntryViewAtIndex(this.entryViewList.indexOf(entryView))
    this.input.blur()
  } else {
    this.input.focus()
  }
}

/**
 * Select the EntryView at the given index
 *
 * @param {Number} index
 */
EntriesController.prototype.selectEntryViewAtIndex = function (index) {
  if (this.selectedEntryView) {
    this.selectedEntryView.setSelected(false)
  }
  var entryView = null
  if (index > -1) {
    entryView = this.entryViewList[index]
    entryView.setSelected(true)
  } else {
    index = -1
  }
  this.selectedEntryView = entryView
  this.selectedEntryViewIndex = index
}

/**
 * Removes from the list and deletes data of the selected entry.
 *
 * A double-linked list would allow faster delete. Even though we have to
 * support random access entry selecting due to being able to hover entries, it
 * could be solved by referencing the list item from the EntryView.
 * (yay circular references)
 */
EntriesController.prototype.deleteSelectedEntry = function () {
  var index = this.selectedEntryViewIndex
  if (index < 0) return
  var deletedItems = this.entryViewList.splice(index, 1)
  var entryView = deletedItems[0]
  entryView.destroy()
  this.selectedEntryView = null
  while (index >= this.entryViewList.length) --index
  this.selectEntryViewAtIndex(index)
  if (!this.selectedEntryView) this.input.focus()
}

EntriesController.prototype.inputIsFocused = function () {
  return document.activeElement === this.input[0]
}

EntriesController.prototype.focusInput = function () {
  this.input.focus()
}

EntriesController.prototype.onFocusInput = function (evt) {
  this.selectEntryViewAtIndex(-1)
}

EntriesController.prototype.focusFirstEntry = function () {
  if (this.entryViewList.length > 0) {
    this.selectEntryViewAtIndex(0)
  }
  this.input.blur()
}
