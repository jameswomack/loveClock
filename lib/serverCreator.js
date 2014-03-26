var srvr = require('./server');

module.exports = function serverCreator(usePR) {
  var server = srvr();
  
  usePR = typeof usePR === 'undefined' ? true : usePR;
  usePR ? server.pr() : void 0;
  
  var hbs = require('hbs');
  hbs.registerPartials(process.cwd() + '/views/partials');
  server.set('view engine', 'hbs');
  server.set('view options', {
    layout: 'layouts/index'
  });
  
  var LRU = require("lru-cache"), 
      options = { max: 500, 
      length: function (n) { return n * 2 }, 
      dispose: function (key, n) { console.log('Removing cache item: ' + key); }, 
      maxAge: 1000 * 60 * 60 }, 
      cache = LRU(options);

  if (server.lruCache)
    throw new Error('already had cache');
  else
    server.lruCache = cache;
    
  server.lruCache.getSet = function (k, vfn) {
    var currentValue = this.get(k);
    !currentValue && this.set(k, (currentValue = vfn()));
    return currentValue;
  }.bind(server.lruCache);
  
  return server;
};