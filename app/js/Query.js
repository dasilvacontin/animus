'use strict'

var tagRe = /#[a-z\d]+/gi

/**
 * Util class that extracts the title and tags from a entry text/query.
 *
 * @constructor
 * @param {String} text
 */

function Query (text) {
  this.title = text || ''

  this.tags = {}
  this.tagCount = 0
  if (this.title) {
    var tags = this.title.match(tagRe) || []
    var self = this
    tags.forEach(function (tag) {
      // Remove the '#' char
      tag = tag.substr(1)
      // Keep track of how many tags of the same type
      self.tags[tag] = (self.tags[tag] || 0) + 1
      ++self.tagCount
    })
  }
}
module.exports = exports = Query

Query.prototype.hasTag = function (tag) {
  if (tag[0] === '#') tag = tag.substr(1)
  return (this.tags[tag] || 0)
}
