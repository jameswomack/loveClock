var fs = require('fs.extra');
var gutil = require('gulp-util');
var colors = require('colors');


var Paths = require('../paths');


var JS = '.js';


var jsFilter = function(file){
  return file.indexOf(JS) == (file.length - 3);
};


var addFileToHash = function(filePath, hash){
  filePath = filePath.replace(Paths.js + '/', '');
  hash[filePath.split('/')[1]] = '../' + filePath.replace(JS, '');
}


var jsFilesToHashReduction = function(files){
  var jsFilesToHashReduction = files.filter(jsFilter).reduce(function(previousValue, currentValue, index, array) {
    if (typeof previousValue === 'string') {
      var hash = {};
      addFileToHash(previousValue, hash);
      previousValue = hash;
    }

    addFileToHash(currentValue, previousValue);

    return previousValue;
  });
  return jsFilesToHashReduction;
}


var fileTreeAsRequirePaths = function(fileTree){
  var reduced = jsFilesToHashReduction(fileTree);
  var fileTreeAsRequirePaths = JSON.stringify(reduced);
  return fileTreeAsRequirePaths;
}


var requiem = function (fileTree) {
  var rjs = 'require.config({paths: ' + fileTreeAsRequirePaths(fileTree) + ', shim: {pickadate: ["jquery"]}}); require([\'love\'], function(Love){Love.start();});';
  fs.writeFileSync(Paths.config, rjs);
  gutil.log('Wrote ' + colors.cyan(rjs) + ' to ' + Paths.config);
}


module.exports = requiem;
