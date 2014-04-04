var Handlebars = require('hbs').handlebars;
var i = require('i')();

var m = require('moment-timezone');

var lastHour = 23;

var LoveClock = function(left, right, format) {
  left = i.titleize(left);
  right = i.titleize(right);
  var tz = left.replace(' ','_');
  var otherTZ = right.replace(' ','_');
  this.leftTitle = left;
  this.rightTitle = right;
  this.tz = $.map[tz];
  this.otherTZ = $.map[otherTZ];
  this.format = format;
  this.reset();
};

var $ = LoveClock;
var $$ = $.prototype;

Object.defineProperty($$, 'cache', {
  get: function () {
    if(!this._cache) {
      this._cache = {};
    }
    return this._cache;
  }
});

$$._currentMoment = function () {
  return m().tz(this.tz);
}

$$._moment = function () {
  return m().tz(this.tz).startOf('day');
}

$$.reset = function () {
  if (this._cache)
    this._cache = null;
}

Object.defineProperty($$, 'currentMoment', {
  get: function () {
    return this.cache.currentMoment ? this.cache.currentMoment.tz(this.tz) : (this.cache.currentMoment = this._currentMoment());
  }
});

Object.defineProperty($$, 'moment', {
  get: function () {
    return this.cache.moment ? this.cache.moment.tz(this.tz) : (this.cache.moment = this._moment());
  }
});

$$.adjustedForTZ = function (tz, otherMoment) {
  var moment = otherMoment || this.moment;
  return moment.tz(tz);
}

Object.defineProperty($$, 'leftDate', {
  get: function () {
    return this.cache.leftDate ? this.cache.leftDate : (this.cache.leftDate = m().tz(this.tz).format('dddd, LL'));
  }
});

Object.defineProperty($$, 'rightDate', {
  get: function () {
    return this.cache.rightDate ? this.cache.rightDate : (this.cache.rightDate = m().tz(this.otherTZ).format('dddd, LL'));
  }
});

$$.toString = function () {
  this.reset();

  var string = this.leftTitle + ' \t' + this.rightTitle + ' \t\n______ \t______ \t\n';
  var currentHour = lastHour + 1;
  while (currentHour--) {
    var logCurrent = this.moment.hour() === this.currentMoment.hour();
    string = this.addMomentsToString(string);
    logCurrent && (string = this.addMomentsToString(string, true));
    this.moment.add('hour',1);
  }

  return string;
};

Object.defineProperty($$, 'titlesTemplateString', {
  get: function () {
    return '{{#each titles}}<h2 class="timeZoneTitle" style="display:inline-block;width:25%">{{this}}</h2>{{/each}}';
  }
});

Object.defineProperty($$, 'timesTemplateString', {
  get: function () {
    return '<br>{{#each times}}<ul class="timeZoneHours" style="display:inline-block;width:25%;box-sizing: border-box;">{{#each this}}<li>{{this}}</li>{{/each}}</ul>{{/each}}';
  }
});

Object.defineProperty($$, 'templateString', {
  get: function () {
    return this.titlesTemplateString.concat(this.timesTemplateString);
  }
});

$$._template = function () {
  return Handlebars.compile(this.templateString);
}

Object.defineProperty($$, 'template', {
  get: function () {
    return this.cache.template ? this.cache.template : (this.cache.template = $$._template());
  }
});

$$.toHTML = function () {
  var toHTML = this.template(this.toJSON());
  return toHTML;
}

$$.toJSON = function () {
  this.reset();

  var toJSON = {
    titles: [this.leftTitle, this.rightTitle],
    dates: [this.leftDate, this.rightDate],
    times:  [[], []]
  };

  var currentHour = lastHour + 1;

  while (currentHour--) {
    var addCurrent = this.moment.hour() === this.currentMoment.hour();

    var moments = this.getMoments();
    toJSON.times[0].push(moments[0]);
    toJSON.times[1].push(moments[1]);

    if (addCurrent) {
      var currentMoments = this.getMoments(addCurrent);
      toJSON.times[0].push(currentMoments[0]);
      toJSON.times[1].push(currentMoments[1]);
    }

    this.moment.add('hour',1);
  }

  return toJSON;
}

function WString(string){String.call(string); this.string = string; this.current = true;}
WString.prototype = Object.create(String.prototype);
WString.prototype.valueOf = function(){return this.string;}

$$.getMoments = function (useCurrentMoment) {
  var _lTime = (useCurrentMoment ? this.currentMoment : this.moment);
  var lTime = _lTime.format(this.format);
  var _rTime = this.adjustedForTZ(this.otherTZ, (useCurrentMoment ? this.currentMoment : undefined));
  var rTime = _rTime.format(this.format);
  if (useCurrentMoment) {
    lTime = new WString(lTime);
    var lMom = _lTime.tz(this.tz);
    lTime.date = lMom.toString();
    lTime.left = true;
    var rMom = _rTime.tz(this.otherTZ);
    rTime = new WString(rTime);
    rTime.date = rMom.toString();
  }
  return [lTime, rTime];
}

$$.addMomentsToString = function (string, useCurrentMoment) {
  var moments = this.getMoments(useCurrentMoment);
  var lTime = moments[0];
  var rTime = moments[1];
  string = string + lTime + ' \t' + rTime + ' \t\n';
  return string;
}

$.map = (function() {
  var tzData = require('../node_modules/moment-timezone/moment-timezone.json');
  var map = require('../data/citySupplement');

  Object.keys(tzData.zones).forEach(function(zoneName){
    var canSplit = ~zoneName.indexOf('/');
    if(!canSplit) return false;
    var regions = ['America','Australia','Pacific','Asia','Indian','Europe','Africa'];
    var parts = zoneName.split('/');
    var left = parts[0];
    var right = parts[1];
    var isRegional = ~regions.indexOf(left);
    isRegional && (map[right] = zoneName);
  });

  return map;
})();

module.exports = function (left, right) {
  var sharedFormat = 'HH:mm';
  return new LoveClock(left, right, sharedFormat);
}
