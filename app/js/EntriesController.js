'use strict'

/* globals chrome */

var util = require('util')
var _ = require('lodash')
var zepto = require('zepto-browserify')
var keycode = require('keycode')
var deepEqual = require('deep-equal')
var eventUtils = require('./event-utils')
var Controller = require('./controller')
var Query = require('./Query')
var Entry = require('./Entry')

var $ = zepto.$

module.exports = exports = EntriesController

function EntriesController () {
  Controller.apply(this, arguments)
  this.entryViewList = []
  this.active = false

  this.boundOnKeydown = this.onKeydown.bind(this)
  this.boundOnDeadEntryView = this.onDeadEntryView.bind(this)

  this.selectedEntryView = null
  this.cachedSelectionIndex = -1

  this.undoStack = []

  this.renderList() // to center the input
  var self = this
  window.addEventListener('resize', function () {
    if (self.active) {
      // recenter the view
      self.renderList()
    }
  })
  document.addEventListener('mousewheel', function (evt) {
    // We want the selection to change when manually scrolling. By resetting
    // the last MouseEvent we make sure the next one is not ignored.
    eventUtils.setLastMouseEventAfterEventQueue(undefined)
  })
  document.addEventListener('mousemove', function (evt) {
    eventUtils.setLastMouseEventAfterEventQueue(evt)
  })
  chrome.storage.sync.get(null, function (items) {
    var backup = ''
    var Model = self.model
    Model.items = items
    for (var id in items) {
      var item = items[id]
      var model = Model.fromObject(item)
      if (model instanceof Model) {
        backup += model.title + '\n'
        self.addEntry(model)
      } else {
        chrome.storage.sync.remove(id)
      }
    }
    self.renderList()
    console.log('animus backup:')
    console.log('(you probably want to save this if your entries are missing)')
    console.log(backup)
  })
  chrome.storage.onChanged.addListener(function (changes, area) {
    // TODO: refactor
    if (area !== 'sync') return
    _.forEach(changes, function (change, id) {
      // failure to perform a change probably means that this instance was the
      // one that performed the sync / modified data
      var sucess = self.performChange(change, id)

      if (sucess && deepEqual(change, self.getNextUndo(), {strict: true})) {
        /**
         * another animus instance used undo, so we pop our undo stack
         *
         * edge-case: the other animus instance was older, and had some changes
         * in its undo stack, and it's popping changes this instance doesn't have
         */
        console.log('an animus instance used undo')
        self.undoStack.pop()
      } else {
        // add change to undostack, leave it ready for performChange
        console.log('added change to undo')
        var undoChange = {}
        if (change.newValue) undoChange.oldValue = change.newValue
        if (change.oldValue) undoChange.newValue = change.oldValue
        self.undoStack.push(undoChange)
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
  this.active = flag
}

EntriesController.prototype.attachKeyListener = function () {
  document.addEventListener('keydown', this.boundOnKeydown, true)
}

EntriesController.prototype.detachKeyListener = function () {
  document.removeEventListener('keydown', this.boundOnKeydown, true)
}

EntriesController.prototype.onKeydown = function (evt) {
  // Prevent animus from blocking command usage, e.g. Cmd+Shift+F for fullscreen
  if (evt.altKey || evt.ctrlKey || evt.metaKey) {
    return
  }

  // Prevent websites to do stuff while we interact with animus
  // e.g. Wired automatically starts searching when a key is pressed
  evt.stopPropagation()

  if (evt.keyCode === keycode('esc')) {
    this.emit('toggle')
    return
  }

  if (this.inputIsFocused()) {
    switch (evt.keyCode) {

      case keycode('tab'):
        this.focusFirstEntry()
        evt.preventDefault()
        break

      case keycode('enter'):
        evt.preventDefault()
        // TODO: Refactor this into a function
        var val = this.input.val()
        if (val) {
          var Model = this.model
          var entry = new Model({
            title: val
          })
          entry.save()
          this.addEntry(entry)
          this.input.val('')
          // TODO: Why doesn't this fire automatticaly? trigger?
          this.onInputChange({srcElement: this.input[0]})
        }
        break

    }
  } else {
    var index
    switch (evt.keyCode) {

      case keycode('a'):
      case keycode('tab'):
        this.focusInput()
        evt.preventDefault()
        break

      case keycode('e'):
        var title = this.selectedEntryView.model.title
        this.deleteSelectedEntry()
        this.focusInput()
        this.input.val(title)
        evt.preventDefault()
        break

      case keycode('u'):
        this.undo()
        // since we might end up focusing the input when no entries are left
        evt.preventDefault()
        break

      case keycode('d'):
        this.deleteSelectedEntry()
        // since we might end up focusing the input when no entries are left
        evt.preventDefault()
        break

      case keycode('f'):
        if (this.selectedEntryView) {
          var link = this.selectedEntryView.model.getLink()
          if (link) {
            window.open(link, '_blank')
          }
        }
        break

      case keycode('j'):
        index = this.getSelectionIndex()
        index = Math.min(this.entryViewList.length - 1, index + 1)
        this.selectEntryViewAtIndex(index, true)
        break

      case keycode('k'):
        index = this.getSelectionIndex()
        index = Math.max(0, index - 1)
        this.selectEntryViewAtIndex(index, true)
        break

    }
  }

  if (evt.keyCode === keycode('enter') && evt.shiftKey) {
    evt.preventDefault()
    // close animus if shift+enter
    this.emit('toggle')
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
  var input = this.input[0]
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
  var entryView
  startIndex = Math.max(startIndex || 0, 0)
  for (var i = startIndex; i < this.entryViewList.length; ++i) {
    entryView = this.entryViewList[i]
    entryView.offsetY = i * 63
    entryView.$el.css('transform', 'translateY(' + entryView.offsetY + 'px)')
  }

  // We find out the list element with the largest width so that
  // we can make the input's width match it
  var maxWidth = 0
  for (var j = startIndex; j < this.entryViewList.length; ++j) {
    entryView = this.entryViewList[j]
    var domEl = entryView.$el[0]
    maxWidth = Math.max(maxWidth, domEl.offsetWidth)
  }
  this.$('.animus-new-entry-input').css('width', maxWidth)

  // We fake the list's height since all the list elements have top,left: 0px
  var listHeight = this.entryViewList.length * 63
  this.$('.animus-entry-list').css('height', listHeight + 'px')
  var inputHeight = 52
  if (listHeight) listHeight += 30
  var animusHeight = 100 + inputHeight + listHeight + 100
  this.offsetY = (window.innerHeight - animusHeight) / 2
  this.offsetY = Math.max(this.offsetY, 0)
  this.$el.css('transform', 'translateY(' + this.offsetY + 'px)')
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
      if ($('#animus')[0].scrollTop === 0) {
        this.focusInput()
      }
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
EntriesController.prototype.selectEntryViewAtIndex = function (index, shortcut) {
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
  if (entryView && shortcut) {
    var entryViewTop = this.offsetY + 182 + entryView.offsetY
    var entryViewBottom = entryViewTop + 63
    var animus = $('#animus')[0]
    var windowTop = animus.scrollTop
    var windowHeight = window.innerHeight
    var windowBottom = windowTop + windowHeight
    var margin = 182
    if (windowTop + margin > entryViewTop) {
      animus.scrollTop = entryViewTop - margin
    } else if (windowBottom - margin < entryViewBottom) {
      animus.scrollTop = entryViewBottom + margin - windowHeight
    }
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
    if (!this.selectedEntryView) {
      // no entries left
      this.focusInput()
    }
  }
}

/**
 * Undo the last action.
 */
EntriesController.prototype.undo = function () {
  var changedList = this.performChange(this.undoStack.pop())
  if (changedList) {
    this.renderList()
  }
}

EntriesController.prototype.getNextUndo = function () {
  return this.undoStack[this.undoStack.length - 1]
}

/**
 * Performs a change on the data, given by an oldValue and a newValue.
 *
 * @param {Object} change
 * @return {Boolean} success
 */

EntriesController.prototype.performChange = function (change) {
  var id = (change.newValue || change.oldValue).id
  var entry
  if (!change.newValue) {
    // deleted entry
    entry = Entry.items[id]
    if (!entry) return false
    if (entry instanceof Entry) entry.destroy()
    else Entry.items = undefined
  } else if (!change.oldValue) {
    // added entry
    if (Entry.items[id]) return false
    entry = Entry.fromObject(change.newValue)
    if (!(entry instanceof Entry)) return false
    this.addEntry(entry)
  } else {
    // updated entry
    // lol, we don't perform updates right now, we delete / re-create entries
    entry = Entry.items[id]
    entry.update(change.newValue)
  }
  return true
}

EntriesController.prototype.inputIsFocused = function () {
  return document.activeElement === this.input[0]
}

EntriesController.prototype.focusInput = function () {
  $('#animus')[0].scrollTop = 0
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
