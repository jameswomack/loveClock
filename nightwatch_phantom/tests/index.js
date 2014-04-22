var server = require('../..');

var port = server.httpListener.address().port;
var url = 'http://localhost:'+String(port);

module.exports = {
  'titles' : function(browser){
    browser
      .url(url)
      .waitForElementVisible('header#header',1000)
      .assert.containsText('.timeZoneTitle:nth-child(1), :not(.timeZoneTitle) + .timeZoneTitle', 'Tokyo')
      .assert.containsText('.timeZoneTitle:nth-child(2), :not(.timeZoneTitle) + .timeZoneTitle', 'Tijuana')
      .end();
  }
};

