'use strict';
var util = require('util');
var Controller = require('./controller');

function main() {
}

function EntriesController() {
}

function Entry() {
  this.createdAt = new Date();
  this._super.constructor.apply(this, arguments);
}
util.inherits(Entry, Model);

if(!module.parent) {
  main();
}
