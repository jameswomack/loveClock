define('love', ['clockView', 'shadowplay'], function (ClockView, Shadowplay) {
  return {
    start: function() {
      var clockView = new ClockView();
      clockView.scrollIntoFocus();
      
      window.model = {};
      window.shadowplay = Shadowplay.create('.test', window.model);
    }
  };
});
