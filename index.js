var server = require('./lib/serverCreator')();
var fs = require('fs');
var path = require('path');


if(!!module.parent){
  server.isTesting = true;
  console.log('IN TESTING MODE\n');
}

var LoveClock = require('./lib/loveClock');

server.get('/clock/:leftZone/:rightZone.:filetype', main);
server.get('/clock/:leftZone/:rightZone', main);
server.get('/js/templates/:template.:filetype', compiledTemplate);
server.get('/select/:zone', select);
// TODO - create server with a routing table or controllers
// so passing a default route like this is easy
server.use(function(req, res){
  console.log(req.originalUrl, Object.keys(req), (req.url.indexOf('.html') !== -1));
  res.redirect('/clock/tokyo/tijuana');
});

function select(req, res){
  // TODO - add caching, add cache key building function
  return res.render('select', {cities: LoveClock.cities(req.params.zone)});
}

function compiledTemplate(req, res){
  var viewDir = server.settings.views;
  var layoutFilename = path.join(viewDir, req.params.template || 'layout');

  if (!path.extname(layoutFilename)) {
    layoutFilename += '.hbs';
  }

  fs.readFile(layoutFilename, 'utf8', function(err, str) {
    if (err) {
      return res.json(err);
    }

    var layoutTemplate = server.handlebars.precompile(str);
    console.log(typeof layoutTemplate);
    res.type('application/javascript');
    res.send('define("clock",["handlebars"],'+layoutTemplate+')');
  });
}

function main(req, res) {
  var leftZone = req.params.leftZone;
  var rightZone = req.params.rightZone;
  var date = new Date();
  var cacheKey = 'clock/' + leftZone + '/' + rightZone + String(date.getHours()) + String(date.getMinutes());
  if(req.url.indexOf('.html') !== -1){
    cacheKey = cacheKey + 'html';
  }

  var lcJSON = function(){
    var loveClock = LoveClock.create(leftZone, rightZone);
    var toJSON = loveClock.toJSON();
    toJSON.cities = [LoveClock.cities(leftZone), LoveClock.cities(rightZone)];
    if(req.url.indexOf('.html') !== -1){
      toJSON.layout = false;
    }
    return toJSON;
  }

  if (req.params.filetype === 'json')
    return res.json(server.lruCache.getSet(cacheKey, lcJSON));
  else
    // TODO - allow for auto-magic caching in server lib
    return res.render('clock', server.lruCache.getSet(cacheKey, lcJSON));
}


module.exports = server;

server.listen();
