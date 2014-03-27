var server = require('./lib/serverCreator')();
var LoveClock = require('./lib/loveClock');
var i = require('i')();

server.get('/clock/:leftZone/:rightZone', main);
// TODO - create server with a routing table or controllers
// so passing a default route like this is easy
server.use(function(req, res){
  res.redirect('/clock/tokyo/tijuana');
});


function main(req, res) {
  var leftZone = req.params.leftZone;
  var rightZone = req.params.rightZone;
  var cacheKey = 'clock/' + leftZone + '/' + rightZone;

  var lcJSON = function(){
    console.log('cache not used for ' + cacheKey);
    
    var loveClock = new LoveClock(i.titleize(leftZone), i.titleize(rightZone));
    return loveClock.toJSON();
  }
  
  // TODO - allow for auto-magic caching in server lib
  return res.render('clock', server.lruCache.getSet(cacheKey, lcJSON));
};


server.listen();
