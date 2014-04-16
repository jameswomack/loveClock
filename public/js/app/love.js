define('love', ['clockView','jquery', 'rivets', 'moment', 'backbone', 'picker'], function (ClockView, $, Rivets, moment, Backbone) {
  return {
    start: function() {
      var model = this.model = null;

      var originalPathName = location.pathname;

      var render = (function(){
        var clockView = new ClockView();
        clockView.scrollIntoFocus();
        var cities = window.location.pathname.split('/').splice(2);

        model =
        {
          currentLeft: '',
          currentRight: '',
          desiredCities: [cities[0], cities[1]],
          cityListChange: function(){
            var c0 = document.querySelectorAll('.timeZoneCities')[0].value.split('/')[1].toLowerCase();
            var c1 = document.querySelectorAll('.timeZoneCities')[1].value.split('/')[1].toLowerCase();
            var path = '/clock/' + c0 + '/' + c1;
            var href = window.location.origin + path;
            if (href !== window.location.href) {
              window.router.navigate(path, {trigger: true});
            }
          },

        };

        var dateEls = $('[data-date]');
        model.dateLeft = dateEls.eq(0).attr('data-date');
        model.dateRight = dateEls.eq(1).attr('data-date');

        var rivets = Rivets.bind(document.querySelector('body'), model);
        window.rivets = rivets;

        var _timeUpdater = function(){
          if(!model && model.dateLeft)
            return;
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
        };

        var timeUpdater = function(){
          _timeUpdater();
          startTimer();
        };

        var startTimer = function(){
          var secsLeft = 60-new Date().getSeconds();
          clearTimeout(setTimeout);
          setTimeout(timeUpdater, secsLeft*1000);
        };

        timeUpdater();
      }).bind(this);

      var Router = Backbone.Router.extend({
        routes: {
          'clock/:leftZone/:rightZone': 'main'
        },

        main: function(leftZone, rightZone){
          if('/clock/'+leftZone+'/'+rightZone !== originalPathName){
            $('body').load('/clock/'+leftZone+'/'+rightZone+'.html', function(){
              console.log('/clock/'+leftZone+'/'+rightZone+'.html');
              render();
            });
          }
        }
      });

      window.router = new Router();

      Backbone.history.start({pushState: true});

      Rivets.formatters.index = function(arr, index) {
        return arr[index];
      };

      Rivets.binders.change = {
        bind: function(el) {
          var adapter = this.view.adapters['.']
          var keypath = this.keypath;

          this.callback = function() {
            var value = adapter.read(model, keypath)
            value(model, keypath)
          }

          $(el).on('change', this.callback)
        },

        unbind: function(el) {
          $(el).off('change', this.callback)
        }

      };

      render();

      window.moment = moment;
    }
  };
});
