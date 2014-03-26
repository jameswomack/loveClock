var path = require('path');

var Config = require('./data/config');

var Paths = Object.create({});

Paths.public = 'public';
Paths.js = path.join(Paths.public, 'js');
Paths._lib = path.join(Paths.js, 'lib');
Paths.lib = path.join('.', Paths._lib);
Paths.nodeModules = path.join('.', 'node_modules');
Paths._app = path.join(Paths.js, 'app');
Paths.app = path.join('.', Paths._app);
Paths.config = path.join(Paths.app, 'config.js');
Paths.sePath = path.join(process.cwd(), Config.seRelativePath);

module.exports = Paths;
