// Object renderer
var ObjEditor = function(elem, callback) {
  r = this;
  this.elem = elem;
  this.callback = callback;
  $(elem).delegate('.property.new .key', "change", function(e) {
    e.stopImmediatePropagation();
    $this = $(this);
    $prop = $this.parents('.property');
    $this.replaceWith('<label class="key">' + $this.val() + '</label>');
    $prop
      .removeClass('new')
      .trigger('change');
  });
  $(elem).delegate('.new', "change", function(e) {
    e.stopImmediatePropagation();
  });
  $(elem).bind('change', function(e){ callback() });
}

ObjEditor.prototype.render = function(obj) {
  $list = $('<ul id="object">');
  for ( k in obj ) {
    $('<li class="property">').html('<label class="key">' + String(k) + '</label> <input class="value" name="' + String(k) + '"type="text" value="' + String(obj[k]) + '"></input>').appendTo($list);
  }
  $(this.elem).empty().append($list);
  this.newProp();
}

ObjEditor.prototype.decode = function() { 
  obj = {}
  $(this.elem).find('.property:not(.new)').each(function(e) {
    $node = $(this);
    obj[$node.find("label").text()] = $node.find("input").val();
  });
  return obj;
};

ObjEditor.prototype.newProp = function() {
  $(this.elem).find('#object').append('<li class="new property"><input class="key" value="Key..."></input><input class="value" value="Value..."></input></li>');
};
