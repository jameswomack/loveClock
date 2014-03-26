// Testing modules
var chai = require('chai');
var expect = chai.expect;
var testUtils = require('./lib/utils')(module.filename);

// Import the module we're testing
var Server = require(testUtils.pathToLib);

// One describe for the entire module
describe(testUtils.testName, function(){
  var server;

  beforeEach(function(){
    server = Server();
  });

  afterEach(function(){
    server = null;
  });

  it(shouldBe('a function'), function(){
    expect(server).to.be.a('function');
  });

  // One describe for each method
  describe('pr', function(){
    // An it for each aspect of the method
    it(shouldBe('a function'), function(){
      expect(server.pr).to.be.a('function');
    });
  });
});
