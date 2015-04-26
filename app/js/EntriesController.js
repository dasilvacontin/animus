'use strict'
var util = require('util')
var _ = require('lodash')
var zepto = require('zepto-browserify')
var Controller = require('./controller')
var Query = require('./Query')
var Entry = require('./Entry')

var $ = zepto.$

var KEYCODES = {
  ENTER: 13,
  TAB: 9,
  ESC: 27,

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

  this.boundOnKeydown = this.onKeydown.bind(this)
  this.boundOnDeadEntryView = this.onDeadEntryView.bind(this)

  this.selectedEntryView = null
  this.cachedSelectionIndex = -1

  this.renderList() // to center the input
  var self = this
  window.addEventListener('resize', function () {
    if (self.active) {
      // recenter the view
      self.renderList()
    }
  })
  chrome.storage.sync.get(null, function (items) {
    var Model = self.model
    Model.items = items
    for (var id in items) {
      var item = items[id]
      var model = Model.fromObject(item)
      if (model instanceof Model) {
        self.addEntry(model)
      } else {
        chrome.storage.sync.remove(id)
      }
    }
    self.renderList()
  })
  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area != 'sync') return
    _.forEach(changes, function (change, id) {
      if (!change.newValue) {
        var entry = Entry.items[id]
        if (entry instanceof Entry) entry.destroy()
        else chrome.storage.sync.remove(id)
      } else if (!change.oldValue && !Entry.items[id]) {
        var entry = Entry.fromObject(change.newValue)
        if (entry instanceof Entry)
          self.addEntry(entry)
      } else {
        var entry = Entry.items[id]
        entry.update(change.newValue)
      }
    })
    self.renderList()
  })
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
    // recenter the view in case there was a resize whilst unactive
    this.renderList()
  } else if (this.active && !flag) {
    this.detachKeyListener()
  }
  this.active = flag;
}

EntriesController.prototype.attachKeyListener = function () {
  document.addEventListener('keydown', this.boundOnKeydown, true)
}

EntriesController.prototype.detachKeyListener = function () {
  document.removeEventListener('keydown', this.boundOnKeydown, true)
}

EntriesController.prototype.onKeydown = function (evt) {
  evt.stopPropagation()

  if (evt.keyCode === KEYCODES.ESC) {
    this.emit('toggle')
    return
  }

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
        var current = this.getSelectionIndex()
        var index = current
        var listLength = this.entryViewList.length
        var entryView = undefined
        while (index + 1 < listLength && (!entryView || !entryView.alive)) {
          index += 1
          entryView = this.entryViewList[index]
        }
        if (current != index && entryView.alive)
          this.selectEntryViewAtIndex(index)
        break

      case KEYCODES.K:
        var current = this.getSelectionIndex()
        var index = current
        var entryView = undefined
        while (index - 1 >= 0 && (!entryView || !entryView.alive)) {
          index -= 1
          entryView = this.entryViewList[index]
        }
        if (current != index && entryView.alive)
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
  entryView.on('destroy', this.boundOnDeadEntryView)
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
  for (var i = 0; i < this.entryViewList.length; ++i) {
    var entryView = this.entryViewList[i]
    entryView.applyQuery(query)
  }
  this.entryViewList = _.sortByOrder(this.entryViewList, ['matchScore'], [false])
  this.renderList()
  $(input)[query.title ? 'addClass' : 'removeClass']('has-content')
}

/**
 * Relocates EntryViews
 */
EntriesController.prototype.renderList = function (startIndex) {
  startIndex = Math.max(startIndex || 0, 0)
  for (var i = startIndex; i < this.entryViewList.length; ++i) {
    var entryView = this.entryViewList[i]
    entryView.$el.css('transform', 'translateY(' + i*63 + 'px)')
  }

  var maxWidth = 0
  for (var i = startIndex; i < this.entryViewList.length; ++i) {
    var entryView = this.entryViewList[i]
    var domEl = entryView.$el[0]
    maxWidth = Math.max(maxWidth, domEl.offsetWidth)
  }
  this.$('.animus-new-entry-input').css('width', maxWidth)

  var listHeight = this.entryViewList.length * 63
  this.$('.animus-entry-list').css('height', listHeight + 'px')
  var inputHeight = 52
  if (listHeight) listHeight += 30
  var animusHeight = 100 + inputHeight + listHeight + 100
  var animusY = (window.innerHeight - animusHeight) / 2
  animusY = Math.max(animusY, 0)
  this.$el.css('transform', 'translateY(' + animusY + 'px)')
}

/**
 * Callback for when an EntryView is hovered.
 * @param {EntryView} entryView
 */
EntriesController.prototype.hoveredEntryView = function (entryView) {
  clearTimeout(this.focusTimeout)
  if (entryView) {
    this.selectEntryViewAtIndex(this.entryViewList.indexOf(entryView))
    this.input.blur()
  } else {
    /**
     * mouseout is called when changing hover between elements, and focusing
     * the input scrolls, even just during the entry switch, scrolls the view
     * to the input. not desired.
     */
    this.focusTimeout = setTimeout(function () {
      this.input.focus()
    }.bind(this), 1)
  }
}

/**
 * Get index of selected EntryView. We store a cache of the index, but since
 * the entry list can be modified due to sync events, we must ensure the cached
 * index is still correct.
 *
 * @return {Number} selectionIndex
 */
EntriesController.prototype.getSelectionIndex = function () {
  if (!this.selectedEntryView) {
    return -1
  }
  var cachedEntryView = this.entryViewList[this.cachedSelectionIndex]
  if (cachedEntryView === this.selectedEntryView) {
    return this.cachedSelectionIndex
  }
  this.cachedSelectionIndex = this.entryViewList.indexOf(this.selectedEntryView)
  return this.cachedSelectionIndex
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
  this.cachedSelectionIndex = index
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
  var index = this.getSelectionIndex()
  var entryView = this.entryViewList[index]
  if (!entryView) return
  entryView.deleteEntry(index)
}

/**
 * Dead entry view callback. It may give a `hint` about it's index in
 * entryViewList.
 *
 * @param {EntryView} entryView
 * @param {Number} hint
 */
EntriesController.prototype.onDeadEntryView = function (entryView, hint) {
  var index = hint
  if (index === -1) {
    // TODO: improve this, hashing
    if (this.selectedEntryView === entryView) {
      // happy coincidence
      index = this.getSelectionIndex()
    } else {
      index = this.entryViewList.indexOf(entryView)
    }
  }
  if (index === -1) return
  this.entryViewList.splice(index, 1)
  this.renderList(index)
  if (this.selectedEntryView === entryView) {
    this.selectedEntryView = null
    while (index >= this.entryViewList.length) --index
    this.selectEntryViewAtIndex(index)
    if (!this.selectedEntryView) this.input.focus()
  }
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
