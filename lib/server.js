var path = require('path');
var express = require('express');
var config = require('../data/config');

function Server(options) {
  var srvr = express.call(this);
  var isProduction = process.env.NODE_ENV === 'production';

  // Pull the port from config: regular, production or testing
  // TODO - make regular config namespaced like production and testing
  Object.defineProperty(srvr, 'port', {get: function(){
    var port = isProduction ? config.production.port : config.port;
    port = this.isTesting ? config.testing.port : config.port;
    return port;
  }});

  // Enhance the Express listen with an automatic port
  srvr.listen = function () {
    this.httpListener = express.application.listen.call(srvr, this.port);
    config.logMainEvents && console.info(config.listening + this.port);
    return this.httpListener;
  };

  // Like a good PR agent, we publicize all the things
  srvr.pr = function () {
    srvr.cwd = process.cwd().replace('/nightwatch_phantom','');
    express.application.use.call(srvr, express.static(path.join(srvr.cwd, config.public)));
  };

  // Log all route activity if not in production
  !isProduction && srvr.use(express.logger());

  return srvr;
}

module.exports = Server;
