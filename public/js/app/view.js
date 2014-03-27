define('view', ['backbone'], function(Backbone){
  var View = Backbone.View.extend({
    id: null,
    el: function(){
      return document.getElementById(this.id);
    },
    initialize: function(){
      this.scrollIntoFocus();
    },
    scrollIntoFocus: function(){
      var frame = this.frame();
      window.scrollTo(frame.left, frame.top);
    },
    frame: function(){
      var clientRects = this.el.getClientRects();
      var clientRect = clientRects[0];
      return clientRect;
    }
  });

  return View;
});
