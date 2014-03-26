var path = require('path');
var express = require('express');
var config = require('../data/config');

function Server() {
  var srvr = express.call(this);
  srvr.listen = function () {
    express.application.listen.call(srvr, config.port);
    config.logMainEvents && console.info(config.listening + config.port);
  };
  srvr.pr = function () {
    express.application.use.call(srvr, express.static(path.join(process.cwd(), config.public)));
  };
  return srvr;
}

module.exports = Server;
