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
  this.moment = m().tz(this.tz).startOf('day');
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

$$.reset = function () {
  if (this._cache)
    this._cache = null;
}

Object.defineProperty($$, 'currentMoment', {
  get: function () {
    return this._currentMoment();
  }
});

$$.adjustedForTZ = function (tz, otherMoment) {
  var moment = otherMoment || this.moment;
  return moment.tz(tz);
}

Object.defineProperty($$, 'leftDate', {
  get: function () {
    return m().tz(this.tz).format('dddd, LL');
  }
});

Object.defineProperty($$, 'rightDate', {
  get: function () {
    return m().tz(this.otherTZ).format('dddd, LL');
  }
});

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
  var _lTime = (useCurrentMoment ? this.currentMoment : this.moment.tz(this.tz));
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

$._map = (function() {
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
});

$.map = $._map();

module.exports.cities = function(left){
  var map = $._map();
  var _map = {};
  if(left){
    left = i.titleize(left);
    left = left.replace(' ','_');
    for(var key in map){
      _map[key] = {
        timeZone: map[key],
        current: (key === left)
      };
    }
  }
  return _map;
};

module.exports.create = function (left, right) {
  var sharedFormat = 'HH:mm';
  return new LoveClock(left, right, sharedFormat);
}
