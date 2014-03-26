var readline = require('readline');


function createReadline(options) {  
  options = options || {};
  
  var stream = options.stream || process.stderr;
  
  var rl = readline.createInterface({
    input: process.stdin,
    output: stream
  });
  
  rl.previousString = '';
  
  
  for(var key in options) {
    // clear, et al
    rl[key] = options[key];
  }

  rl.setPrompt('', 0);


  rl.clearLine = function() {
    this.write(null, {ctrl: true, name: 'u'});
  }.bind(rl);


  rl.terminate = function(){
    this.resume();

    if (this.clear) {
      this.clearLine();
      this.close();
    } else {
      this.close();
      console.log();
    }
  }.bind(rl);
  
  
  rl.show = function (str) {
    if (this.previousString !== str) {
      this.clearLine();
      this.write(str);
      this.previousString = str;
    }
  }.bind(rl);
  
  
  return rl;
  
}

module.exports = createReadline;