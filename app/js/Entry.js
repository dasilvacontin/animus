'use strict'
var util = require('util')
var _ = require('lodash')
var Model = require('./model')

module.exports = exports = Entry

function Entry (params) {
  if (this === undefined) throw new Error('wat. _.mixin(Entry, Model) much?')
  if (!params.createdAt) params.createdAt = new Date()
  Model.apply(this, arguments)
}

Entry.fromObject = function (obj) {
  if (!obj.id) return
  delete obj._events
  return new Entry(obj)
}

util.inherits(Entry, Model)
for (var func in Model) {
  Entry[func] = Model[func]
}
window.Entry = Entry
