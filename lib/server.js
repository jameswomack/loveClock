var path = require('path');
var express = require('express');
var config = require('../data/config');

function Server(options) {
  var srvr = express.call(this);
  var isProduction = process.env.NODE_ENV === 'production';
  
  srvr.listen = function () {
    var port = isProduction ? config.production.port : config.port;
    express.application.listen.call(srvr, port);
    config.logMainEvents && console.info(config.listening + port);
  };
  
  srvr.pr = function () {
    express.application.use.call(srvr, express.static(path.join(process.cwd(), config.public)));
  };
  
  !isProduction && srvr.use(express.logger());
  
  return srvr;
}

module.exports = Server;
