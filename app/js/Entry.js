'use strict'
var util = require('util')
var _ = require('lodash')
var Model = require('./model')

module.exports = exports = Entry

function Entry (params) {
  if (this === undefined) throw new Error('wat. _.mixin(Entry, Model) much?')
  if (!params.title) {
    return []
  }
  if (!params.createdAt) params.createdAt = new Date()
  Model.apply(this, arguments)
}

util.inherits(Entry, Model)
// _.mixin(Entry, Model) <- this causes a bug somehow
for (var func in Model) {
  Entry[func] = Model[func]
}

Entry.fromObject = function (obj) {
  if (!obj.id) return null
  obj = _.pick(obj, this.prototype.dbProperties)
  return new Entry(obj)
}

/* Properties that will be saved to the database */
Entry.prototype.dbProperties = ['id', 'title', 'createdAt']
