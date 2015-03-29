'use strict';

/**
 * Regex that extracts the entry's `text` and the `extraTags` by matching as
 * many tags as possible at the end of the title.
 *
 * The `+?` token means as few as possible.
 */
var titleRe = /^(.+?)?((\s*#[a-zA-Z\d]+\s*)*)$/
var tagRe = /#[a-z\d]+/gi;

/**
 * Util class that extracts the title and tags from a entry text/query.
 *
 * @constructor
 * @param {String} text
 */

function Query(text) {
  text = text || '';
  var match = titleRe.exec(text);

  this.title = (match[1] || '');

  var extraTags = (match[2] || '');
  this.tags = [];
  if (extraTags) {
    extraTags = extraTags.replace(/\s/g, '');
    this.tags = extraTags.substr(1).split('#');
  }
  if (this.title) {
    var tagsInTitle = this.title.match(tagRe) || [];
    for (var i = 0; i < tagsInTitle.length; ++i) {
      tagsInTitle[i] = tagsInTitle[i].substr(1);
    }
    this.tags = this.tags.concat(tagsInTitle);
  }
  this.extraTags = extraTags;
}
module.exports = exports = Query;
