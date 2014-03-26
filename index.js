var server = require('./lib/serverCreator')();
var LoveClock = require('./lib/loveClock');
var i = require('i')();

server.get('/love_clock/:leftZone/:rightZone', function (req, res) {
  var lcJSON = function(){
    console.log('cache not used');
    var loveClock = new LoveClock(i.titleize(req.params.leftZone), i.titleize(req.params.rightZone));
    return loveClock.toJSON();
  }
  
  res.render('love_clock', server.lruCache.getSet('love_clock', lcJSON));
});

server.listen();