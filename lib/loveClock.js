var Handlebars = require('handlebars');

var m = require('moment-timezone');

var tokyoTZ =    "Asia/Tokyo";
var tijuanaTZ =  "America/Tijuana";
var lastHour = 23;

var $ = LoveClock = function LoveClock(tz, otherTZ, format) {
  this.tz = tz;
  this.otherTZ = otherTZ;
  this.format = format;
  this.reset();
}

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
    return this.cache.currentMoment ? this.cache.currentMoment.tz(this.tz) : (this.cache.currentMoment = this._currentMoment());;
  }
});

Object.defineProperty($$, 'moment', {
  get: function () {
    return this.cache.moment ? this.cache.moment.tz(this.tz) : (this.cache.moment = this._moment());;
  }
});

$$.adjustedForTZ = function (tz, otherMoment) {
  var moment = otherMoment || this.moment;
  return moment.tz(tz);
}

Object.defineProperty($$, 'leftTitle', {
  get: function () {
    return this.cache.leftTitle ? this.cache.leftTitle : (this.cache.leftTitle = this.tz.split('/')[1]);
  }
});

Object.defineProperty($$, 'rightTitle', {
  get: function () {
    return this.cache.rightTitle ? this.cache.rightTitle : (this.cache.rightTitle = this.otherTZ.split('/')[1]);
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
}

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
  var lTime = (useCurrentMoment ? this.currentMoment : this.moment).format(this.format);
  var rTime = this.adjustedForTZ(this.otherTZ, (useCurrentMoment ? this.currentMoment : undefined)).format(this.format);
  if (useCurrentMoment) {
    lTime = new WString(lTime);
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

$.map = [tokyoTZ, tijuanaTZ].reduce(function (previousValue, currentValue) {
  if(typeof previousValue !== 'object') {
    var key = previousValue.split('/')[1];
    var obj = {};
    obj[key] = previousValue;
    previousValue = obj;
  }
  previousValue[currentValue.split('/')[1]] = currentValue;
  return previousValue;
})

module.exports = function (left, right) {
  var sharedFormat = 'HH:mm';
  return new LoveClock($.map[left], $.map[right], sharedFormat);
}
