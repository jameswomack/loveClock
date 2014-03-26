var path = require('path');
var Q = require('q');
var FS = require('q-io/fs');
var http = require('q-io/http');
var fs = require('fs.extra');
var colors = require('colors');
var request = require('request');
request = request.defaults({'proxy':process.env.HTTP_PROXY});


var Prom = Object.create(FS);


Prom.removeFromDirAndReport = function (dir) {
  Prom.removeFromDir(dir)
  .then(function (promisesResolved){
    promisesResolved.forEach(function(promiseResolved){
      gutil.log(promiseResolved);
    });
    gutil.log('Done! ' + colors.magenta(String(promisesResolved.length)) + ' items were removed.');
  }, function (err) {
    if (err)
      console.info(err);
  });
}


Prom.removeFromDir = function(dir){

  return FS.list(dir)
  .then(function(files){

    return Q.all(files.map(function(file){

      var deferred = Q.defer();
      var filePath = path.join(dir, file);

      FS.stat(filePath)
      .then(function(stats){

        fs.rmrf(filePath, function(err){
          if (err)
            deferred.reject(err);
          else {
            var type = stats.isDirectory() ? 'directory' : 'file';
            deferred.resolve('Successfully removed ' + type + ' at path ' + filePath);
          }
        });

      });

      return deferred.promise;

    }));

  });

}


Prom.downloadFromUrlToPath = function(url, path) {

  var deferred = Q.defer();

  var totalLength = 0;
  var downloadedLength = 0;
  var bytesPerMB = 1048576;
  var mb = 0;

  var reject = function(err){
    lineman.terminate();
    deferred.reject(err);
  };

  var lineman = require('./lineman')();

  request(url)
  .on('close', function(){
    console.log('Download complete');
  })
  .on('error', function(err){
    console.log(err);
  })
  .on('response', function(response) {
    totalLength = parseInt(response.headers['content-length'], 10) || null;
    mb = totalLength / bytesPerMB;
  })
  .on('data', function(chunk){
    downloadedLength += chunk.length;
    lineman.show("Downloaded " + (100.0 * downloadedLength / totalLength).toFixed(2) + "% (" + (downloadedLength / bytesPerMB).toFixed(2) + "MB of " + mb.toFixed(2) + "MB)");
  })
  .on('end', function(){
    lineman.terminate();
    deferred.resolve();
  })
  .pipe(fs.createWriteStream(path))
  .on('error', reject);

  return deferred.promise;
}


module.exports = Prom;
