define('love', ['clockView'], function (ClockView) {
  return {
    start: function() {
      var clockView = new ClockView();
      clockView.scrollIntoFocus();
    }
  };
});
