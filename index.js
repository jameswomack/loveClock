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
  var lcJSON = function(){
    console.log('cache not used');
    var loveClock = new LoveClock(i.titleize(req.params.leftZone), i.titleize(req.params.rightZone));
    return loveClock.toJSON();
  }
  
  res.render('clock', server.lruCache.getSet('clock', lcJSON));
};


server.listen();
