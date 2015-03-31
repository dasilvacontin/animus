'use strict'
var util = require('util')
var Model = require('./model')

module.exports = exports = Entry

function Entry (params) {
  if (this === undefined) throw new Error('wat')
  Model.apply(this, arguments)
  this.createdAt = new Date()
}

util.inherits(Entry, Model)

window.Entry = Entry
