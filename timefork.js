//(function(){
  
  var body;
  
  addEventListener('DOMContentLoaded', function(){
    body = document.getElementsByTagName('body')[0];
  }, false);
  
  var defs = {
    idleTime: 1000,
    lastTime: new Date().getTime(),
    canvas  : undefined,
    context : undefined,
    style   : {
                TWO_PI  : Math.PI*2,
                diam    : 5,
                spacing : 4,
              }
  };

  // Statenode constructor
  var StateNode = function(props){
    for(var i in props){ this[i] = props[i]; }
    
    var ancestors = this.parent ? this.parent.ancestors().concat(this.parent) : [];
    this.ancestors = function() { return ancestors };
    return this;
      
  };
  
  StateNode.prototype.children = function() {
    var children = this.branches;
    for (var b in this.branches) {
      children = children.concat(this.branches[b].children());
    }
    return children;
  };
  
  StateNode.prototype.find = function(id) {
    console.log("trying to find " + id);
    var children = this.children();
    for (var c in children) {
      if (children[c].eventTime == id) {
        return children[c];
      }
    }
    return null;
  };
  
  // Object renderer
  var ObjRenderer = function(elem, callback) {
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
    $(elem).bind('change', function(e){ callback(r.decode()) });
  }
  
  ObjRenderer.prototype.render = function(obj) {
    $list = $('<ul id="object">');
    for ( k in obj ) {
      $('<li class="property">').html('<label class="key">' + String(k) + '</label> <input class="value" name="' + String(k) + '"type="text" value="' + String(obj[k]) + '"></input>').appendTo($list);
    }
    $(this.elem).empty().append($list);
  }
  
  ObjRenderer.prototype.decode = function() { 
    obj = {}
    $(this.elem).find('.property').each(function(e) {
      $node = $(this);
      obj[$node.find("label").text()] = $node.find("input").val();
    });
    return obj;
  };
  
  ObjRenderer.prototype.newProp = function() {
    $(this.elem).find('#object').append('<li class="new property"><input class="key" value="Key..."></input><input class="value" value="Value..."></input></li>');
  };
  
  // TimeFork Constructor
  var TimeFork = function( aName, renderer ){
  
    // Copy defaults to new instance
    for(var i in defs){ this[i] = defs[i]; }
    
    // Back reference to object, used in event calls to maintain scope
    var origin = this;

    this.name = aName;   
    this.renderer = renderer;
    
    // Set first leaf in statetree
    this.stateTree.propState = DeltaTree(null, {});
    
    this.pointInHistory = this.stateTree;
    
    // Re-route Event Stream
    //elem.addEventListener( event, function( event ){ origin.filter( event ); }, false );
    
    return this;
  };
  
  TimeFork.prototype.stateTree = new StateNode({
      parent    : null,
      ancestor  : 0,
      branches  : [],
      eventTime : defs.lastTime,
      eventType : 'History began.',
      eventData : null,
      propState : null,
  });
   
  TimeFork.prototype.filter = function( event ){
    clearTimeout( this.timeout );
    var origin = this;
    this.timeout = setTimeout( function(){ origin.recordState( event ); }, this.idleTime );
  };
  

  TimeFork.prototype.recordState = function( obj ){
    var now = new Date().getTime();    
    
    this.pointInHistory = this.pointInHistory.branches[ this.pointInHistory.branches.length ] = new StateNode({
      parent    : this.pointInHistory,
      ancestor  : this.lastTime,
      branches  : [],
      eventTime : now,
      propState : this.pointInHistory.propState.fork(obj),
    });
    
    this.lastTime = now;
    this.renderer.render(this.pointInHistory.propState.toObj());
    this.render();
  };

  // TimeFork.prototype.recordState = function( event ){
  //   var now = new Date().getTime();    
  //   
  //   this.pointInHistory = this.pointInHistory.branches[ this.pointInHistory.branches.length ] = new StateNode({
  //     parent    : this.pointInHistory,
  //     ancestor  : this.lastTime,
  //     branches  : [],
  //     eventTime : now,
  //     eventType : this.event,
  //     eventData : event,
  //     propState : "argh",
  //   });
  //   
  //   this.lastTime = now;
  //   this.render();
  // };
  
  TimeFork.prototype.makeHtml = function(){
    this.html = document.createElement('ul');
    this.html.id = "history";
    $("#pane").append(this.html);
  }
  
  TimeFork.prototype.makeCanvas = function(){
    var origin = this;

    var mouseMoved = function(){
    };
    
    with( this ){
      canvas = document.createElement('canvas');
      canvas.setAttribute('width' , "600px");
      canvas.setAttribute('height', "400px");
      canvas.setAttribute('style', 'border:1px solid black;display:block;'); 
      canvas.id = "history";
      body.appendChild(canvas);
      context = canvas.getContext('2d');
      context.mouseX=0;
      context.mouseY=0;
    }
    
    this.canvas.addEventListener('mousemove', function( e ){
      var scrollX = (window.scrollX !== null && typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset;
      var scrollY = (window.scrollY !== null && typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset;     
      origin.context.mouseX = e.clientX - origin.canvas.offsetLeft + scrollX;
      origin.context.mouseY = e.clientY - origin.canvas.offsetTop + scrollY;
      mouseMoved();
    }, false);    
  };
  
  TimeFork.prototype.go = function(point){
    this.pointInHistory = point;
    this.renderer.render(this.pointInHistory.propState.toObj());
    this.render();
  }
  
  TimeFork.prototype.back = function(){
    this.go(this.pointInHistory.parent);
  };
  
  TimeFork.prototype.forward = function(fork){
    fork = fork || this.pointInHistory.branches.length - 1;
    if (fork < this.pointInHistory.branches.length){
      this.go(this.pointInHistory.branches[fork]);
    }
  };    
  
  // Rendering time forks and state nodes
  TimeFork.prototype.render = function(){
    this.renderHtml();
  };
  
  TimeFork.prototype.activeNodes = function(){
    return this.pointInHistory.ancestors().concat(this.pointInHistory);
  };
  
  TimeFork.prototype.renderHtml = function(){
      
    if(!this.html){
      this.makeHtml();
    }
        
    this.html.innerHTML = "";
    this.html.appendChild(this.renderBranchHtml(this.stateTree));
      
    
  };
  
  TimeFork.prototype.renderBranchHtml = function(root) {
    var rendering = document.createElement('li');
    if (this.activeNodes().indexOf(root) != -1) {
      rendering.setAttribute("class", "active");
    }
    rendering.innerHTML = '<a href="#' + root.eventTime + '">' + (uneval(root.propState.delta()) || "&nbsp") + '</a>';
    
    var branches = document.createElement('ul');
    for (branch in root.branches) {
      console.log(branch);
      branches.appendChild(this.renderBranchHtml(root.branches[branch]));
    }
    rendering.appendChild(branches);
    return rendering;
  };
  
  TimeFork.prototype.renderCanvas = function(){
    with( this ){
      
      if(!canvas){
        makeCanvas();
      }
      
      with( context ){
        fillStyle   = "#aaa";
        fillRect(0, 0, canvas.width, canvas.height);
        fillStyle   = "#0af";
        strokeStyle = "#fff";
        lineWidth   = 1;         
                 
//        var x = style.diam, y = 
                 
        context.save();      
          translate( style.diam, canvas.height/2 );
          renderBranch( stateTree );        
        restore();
      }

    }
  };  
  

  TimeFork.prototype.renderBranch = function( node ){
    var style = this.style;
    for(var i in node.branches){
      with( this.context ){

        if( this.pointInHistory.eventTime === node.branches[i].eventTime ){
          strokeStyle = "#a00";
        }else{
          strokeStyle = "#fff";
        }
        lineWidth = 1;
        
        //console.log( mouseX, mouseY );
        
        beginPath();
          moveTo(0, 0);
          lineTo(style.diam*2+style.spacing,0);
        closePath();
        stroke();
        strokeStyle="#fff";
        if( this.pointInHistory.eventTime === node.branches[i].eventTime ){
          fillStyle = "#c00";
          lineWidth = 2;
        }else{
          fillStyle = "#0af";
          lineWidth = 1;
        }        
        beginPath();
          arc(0, 0, style.diam, 0, style.TWO_PI, true);
        closePath();
        fill();
        stroke();
        translate(style.diam*2+style.spacing,0);     
      }
      this.renderBranch( node.branches[i] );
    }
  };
  
  
  // Model instatiator
  this.timeFork = function( aName, elem ){
    return new TimeFork( aName, elem );
  };

//})();
