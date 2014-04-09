var server = require('./lib/serverCreator')();
var LoveClock = require('./lib/loveClock');

server.get('/clock/:leftZone/:rightZone', main);
server.get('/select/:zone', select);
// TODO - create server with a routing table or controllers
// so passing a default route like this is easy
server.use(function(req, res){
  res.redirect('/clock/tokyo/tijuana');
});

function select(req, res){
  // TODO - add caching, add cache key building function
  return res.render('select', {cities: LoveClock.cities(req.params.zone)});
}

function main(req, res) {
  var leftZone = req.params.leftZone;
  var rightZone = req.params.rightZone;
  var date = new Date();
  var cacheKey = 'clock/' + leftZone + '/' + rightZone + String(date.getHours()) + String(date.getMinutes());

  var lcJSON = function(){
    var loveClock = LoveClock.create(leftZone, rightZone);
    var toJSON = loveClock.toJSON();
    toJSON.cities = [LoveClock.cities(leftZone), LoveClock.cities(rightZone)];
    return toJSON;
  }

  // TODO - allow for auto-magic caching in server lib
  return res.render('clock', server.lruCache.getSet(cacheKey, lcJSON));
}


server.listen();
