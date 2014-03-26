// Installed gulp modules
var gulp = require('gulp');
var gutil = require('gulp-util');
var bowerFiles = require('gulp-bower-files');
var nodemon = require('gulp-nodemon');
var uglify = require('gulp-uglify');
var stylus = require('gulp-stylus');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

// Local modules
var Paths = require('./paths');
var Prom = require('./lib/prom');
var Prone = require('./lib/prone');
var Config = require('./data/config');
var bowerComponentsToRequireConfig = require('./lib/requiem');


// Tasks

// Take all installed bower components' main files
// and move into a hierarchy in public/lib
// and then insert their relative paths
// into a require config
gulp.task('bower.migrate', function(){
  return bowerFiles()
  .pipe(uglify({outSourceMap: true, mangle: false}))
  .pipe(gulp.dest(Paths.lib))
  .on('end', function (){
    Prom.listTree(Paths.lib)
    .then(bowerComponentsToRequireConfig);
  });
});

// Undo bower.migrate --
// Note: Currently there isn't the possibility in gulp/orchestrator
// to have semantic output for a task that just runs
// other tasks
gulp.task('bower.clean.all', ['bower.clean.lib','bower.clean.config']);

gulp.task('bower.clean.config', function(){
  return Prom.remove(Paths.config)
  .then(function(){
    gutil.log('Removed config.js');
  }, Prone.notENOENT);
});

gulp.task('bower.clean.lib', function(){
  return Prom.removeFromDirAndReport(Paths.lib);
});


// Remove contents of node_modules
gulp.task('npm.clean.all', function(){
  return Prom.removeFromDirAndReport(Paths.nodeModules);
});


// Render all .styl files recursively
gulp.task('stylus.compile.all', function () {
  gulp.src('./src/stylus/*.styl')
  .pipe(stylus())
  .pipe(gulp.dest('./public/css'));
});


// Download Selenium standalone
gulp.task('tests.download.se', function(){
  return Prom.downloadFromUrlToPath(Config.seUrl, Paths.sePath);
});

gulp.task('tests.run.all', function () {
  gulp.src('test/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(mocha({reporter: 'spec'}));
});


// Start auto-reloading server
gulp.task('server.autoreload', function () {
  return nodemon({ script: 'index.js', ext: 'html hbs styl js' })
  .on('change', ['stylus.compile.all'])
  .on('restart', function () {
    gutil.log('nodemon has restarted the server')
  });
})
