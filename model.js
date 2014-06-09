"use strict"

var sqlite3 = require("sqlite3");

var model = function() {
  this.db = new sqlite3.Database('./bayeux.db');
}

model.prototype.check = function(username, callback) {
  var sql = this.db.prepare("SELECT username FROM bayeux_user WHERE username=?");
  sql.get(username, function(err, res) {
    if (err) callback(true, null);
    callback(null, res);
  });
}

model.prototype.register = function(username, password, callback) {
  var sql = this.db.prepare("INSERT INTO bayeux_user VALUES (?, ?)");
  sql.run(username, password, function(err, res) {
    if (err) callback(true, null);
    else callback(null, true)
  });
}

model.prototype.signin = function(username, password, callback) {
  var sql = this.db.prepare("SELECT username FROM bayeux_user WHERE username=? AND password=?");
  sql.get(username, password, function(err, res) {
    if (err) callback(true, null);
    callback(null, res);
  });
}

model.prototype.session = function(id, username, callback) {
  var sql = this.db.prepare("INSERT INTO bayeux_session VALUES (?, ?, ?)");
  sql.run(id, username, new Date(), function(err, res) {
    if (err) callback(true, null);
    else callback(null, true)
  });
}

model.prototype.uname_session = function(id, callback) {
  var sql = this.db.prepare("SELECT username FROM bayeux_session WHERE id=?");
  sql.get(id, function(err, res) {
    if (err) callback(true, null);
    callback(null, res);
  });
}

model.prototype.unsession = function(id, username, callback) {
  var sql = this.db.prepare("DELETE FROM bayeux_session username=?");
  sql.run(username, function(err, res) {
    if (err) callback(true, null);
    else callback(null, true)
  });
}

model.prototype.presence = function(channel, username, callback) {
  var sql = this.db.prepare("INSERT INTO bayeux_presence VALUES (?, ?, ?)");
  sql.run(channel, username, new Date(), function(err, res) {
    if (err) callback(true, null);
    else callback(null, true)
  });
}

model.prototype.unpresence = function(username, callback) {
  var sql = this.db.prepare("DELETE FROM bayeux_presence WHERE username=?");
  sql.run(username, function(err, res) {
    if (err) callback(true, null);
    else callback(null, true)
  });
}

exports.model = model;