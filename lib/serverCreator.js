var srvr = require('./server');

module.exports = function serverCreator(options) {
  options = options || {
    usePR: true
  };

  // TODO - use a merged object
  options.usePR = options.usePR || true;

  var server = srvr();

  options.usePR ? server.pr() : void 0;

  var hbs = require('hbs');
  hbs.registerHelper('ifvalue', function (conditional, context, options) {
    if (context[options.data.parentIndex] === conditional) {
      return options.fn(this)
    } else {
      return options.inverse(this);
    }
  });
  hbs.registerHelper('arry', function (array, index, options) {
    options.data.parentIndex = options.data.index;
    if (options.fn)
      return options.fn(array[index]);
  });

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
