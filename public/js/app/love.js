define('love', ['clockView','jquery', 'rivets', 'moment'], function (ClockView, $, Rivets, moment) {
  return {
    start: function() {
      var clockView = new ClockView();
      clockView.scrollIntoFocus();
      var cities = window.location.pathname.split('/').splice(2);

      var model =
      {
        currentLeft: '',
        currentRight: '',
        desiredCities: [cities[0], cities[1]],
        cityListChange: function(){
          var c0 = document.querySelectorAll('.timeZoneCities')[0].value.split('/')[1].toLowerCase();
          var c1 = document.querySelectorAll('.timeZoneCities')[1].value.split('/')[1].toLowerCase();
          var href = window.location.origin + '/clock/' + c0 + '/' + c1;
          if (href !== window.location.href) {
            console.log(href, model.desiredCities, window.location.href);
            window.location.href = href;
          }
        }
      };

      var dateEls = $('[data-date]');
      model.dateLeft = dateEls.eq(0).attr('data-date');
      model.dateRight = dateEls.eq(1).attr('data-date');

      Rivets.formatters.index = function(arr, index) {
        return arr[index];
      };

      Rivets.binders.change = {
        bind: function(el) {
          var adapter = this.view.adapters['.']
          var keypath = this.keypath

          this.callback = function() {
            console.log(arguments)
            var value = adapter.read(model, keypath)
            value(model, keypath)
          }

          $(el).on('change', this.callback)
        },

        unbind: function(el) {
          $(el).off('change', this.callback)
        }

      };

      var rivets = Rivets.bind(document.querySelector('body'), model);

      var timeUpdater = function(){
        var hoursLeftAhead =  Number(model.dateLeft.split('GMT')[1])/100;
        var hoursRightAhead = Number(model.dateRight.split('GMT')[1])/100;
        var format = 'HH:mm';
        var left = moment().zone(-hoursLeftAhead);
        if(left.format('mm') === '59'){
          window.location.href = window.location.href;
        } else {
          model.currentLeft = left.format(format);
          model.currentRight = moment().zone(-hoursRightAhead).format(format);
        }

        startTimer();
      };

      window.moment = moment;
      window.rivets = rivets;

      var startTimer = function(){
        var secsLeft = 60-new Date().getSeconds();
        setTimeout(timeUpdater, secsLeft);
      };

      startTimer();
    }
  };
});
