define('shadowplay', [], function (ClockView) {
  function Shadowplay(selector, model) {
    this.selector = selector;
    this.model = {attributes: model};
    this.domMap = {};
    this.document = document.createDocumentFragment();
  }
  
  Shadowplay.prototype.def = function (k, node) {
    this.domMap[k] = node;
    
    var listener = this;
    node.addEventListener('change', function () {
      // Following line is unDRY perhaps
      var textKey = typeof node.value == 'string' ? 'value' : 'innerHTML';
      listener.model.attributes[k] = node[textKey];
    });    
        
    Object.defineProperty(this.model, k, {
      get: function () {
        return this.attributes[k];
      },
      set: function (v) {
        if (this.attributes[k] == v) {
          return;
        }
        this.attributes[k] = v;
        var textKey = typeof node.value == 'string' ? 'value' : 'innerHTML';
        if (node[textKey] != v) {
          node[textKey] = v;
        }
      }
    });
  }
  
  Shadowplay.prototype.add = function (node) {
    var deepClone = node.cloneNode(true);
    deepClone.donor = node;
    this.document.appendChild(deepClone);
  } 
  
  
  Shadowplay.prototype.build = function () {
    var all = document.querySelectorAll(this.selector);
    var length = all.length;
    for (var i = 0; i < length; i++) {
      var item = all[i];
      var dataHtmlKey;
      if ((dataHtmlKey = item.attributes['data-sp-innerHTML'].value)) {
        this.domMap[dataHtmlKey] = item;
        var domValue = item.innerHTML;
        this.def(dataHtmlKey, item);
        this.model[dataHtmlKey] = domValue;
      }
    }
  }
  
  var ShadowplayCache = function () {
    return {
      attributes: {},
      listeners: {},
      addEventListener: function (k, listener) {
        var ls = this.listeners[k] || (this.listeners[k] = []);
        var added = !(~ls.indexOf(listener));
        added && ls.unshift(listener);
        return !added;
      },
      get: function (k) {
        return this.attributes[k];
      },
      set: function (k, v) {
        if (this.attributes[k]) {
          return this.attributes[k];
        } else {
          this.attributes[k] = v;
          this.listeners[k] = this.listeners[k] || [];
          this.listeners[k].forEach(function (l) {
            l(v, k);
          });
          return null;
        }
      }
    };
  }
    
  return {
    create: function (selector, model) {
      var sp = new Shadowplay(selector, model);
      var spc = new ShadowplayCache();
      spc.set(selector, sp);
      sp.build();
      return spc.get(selector);
    }
  }
});
