define('love', ['clockView', 'shadowplay', 'moment'], function (ClockView, Shadowplay, moment) {
  return {
    start: function() {
      var clockView = new ClockView();
      clockView.scrollIntoFocus();

      var model = {};
      var shadowplay = Shadowplay.create('.currentTime', model);

      var timeUpdater = function(){
        var hoursLeftAhead = Number(shadowplay.domMap.currentLeft.attributes['data-sp-date'].value.split('GMT')[1])/100;
        var hoursRightAhead = Number(shadowplay.domMap.currentRight.attributes['data-sp-date'].value.split('GMT')[1])/100;
        var format = 'HH:mm';
        var left = moment().zone(-hoursLeftAhead);
        if(left.format('mm') === '59'){
          window.location.href = window.location.href;
        } else {
          shadowplay.model.currentLeft = left.format(format);
          shadowplay.model.currentRight = moment().zone(-hoursRightAhead).format(format);
        }

        startTimer();
      };

      window.moment = moment;
      window.shadowplay = shadowplay;

      var startTimer = function(){
        var secsLeft = 60-new Date().getSeconds();
        setTimeout(timeUpdater, secsLeft);
      };

      startTimer();
    }
  };
});
