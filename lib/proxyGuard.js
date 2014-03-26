var URL = require('url');


// ENV
var env = process.env;

function proxyKey(options) {
  return options.protocol.substring(0,4).toUpperCase() + '_PROXY';
}

function proxyValue(options) {
  return env[proxyKey(options)];
}


function proxyWrapper(requestOptions) {
  var envProxyUrlComponents = URL.parse( proxyValue(requestOptions) );
  
  return {
    host: envProxyUrlComponents.hostname,
    port: envProxyUrlComponents.port,
    path: requestOptions.protocol + '//' + requestOptions.host + requestOptions.path,
    protocol: envProxyUrlComponents.protocol
  };
}


function requestOptions(requestOptions) { 
  var envProxyValue = proxyValue(requestOptions); 
  var envHasProxyValue = !!envProxyValue;
  return envHasProxyValue ? proxyWrapper(requestOptions) : requestOptions;
}


module.exports = function(url) {
  var safeRequestOptions = requestOptions( URL.parse(url) );
  return safeRequestOptions;
}
