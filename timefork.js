(function(){
  
  var body;
  
  addEventListener('DOMContentLoaded', function(){
    body = document.getElementsByTagName('body')[0];
  }, false);
  
  var defs = {
    idleTime: 1000,
    lastTime: new Date().getTime(),
    canvas  : undefined,
    context : undefined
  };

  // TimeFork Constructor
  var TimeFork = function( aName, elem, event, prop ){
  
    // Copy defaults to new instance
    for(var i in defs){ this[i] = defs[i]; }
    
    // Back reference to object, used in event calls to maintain scope
    var origin = this;

    this.name = aName;    
    this.event = event;
    this.elem = elem;
    this.prop = prop;    
    
    // Set first leaf in statetree
    this.stateTree[ 0 ].propState = this.elem[ this.prop ];
    
    this.pointInHistory = 0;
    
    // Re-route Event Stream
    elem.addEventListener( event, function( event ){ origin.filter( event ); }, false );
    
    return this;
  };
  
  TimeFork.prototype.stateTree = [{
      ancestor  : 0,
      branches  : [],
      eventTime : defs.lastTime,
      eventType : 'History began.',
      eventData : null,
      eventData : undefined
  }];
  
/*  var StateNode = function(props){
     for(var i in props){ this[i] = props[i]; }
  };
*/  
  
  TimeFork.prototype.filter = function( event ){
    clearTimeout( this.timeout );
    var origin = this;  
    this.timeout = setTimeout( function(){ origin.recordState( event ); }, this.idleTime );
  };  
  
  
  TimeFork.prototype.recordState = function( event ){
    var now = new Date().getTime();
    this.stateTree[ this.stateTree.length ] = {
      ancestor  : this.lastTime,
      branches  : [],
      eventTime : now,
      eventType : this.event,
      eventData : event,
      propState : this.elem[ this.prop ],
    };    
    this.pointInHistory = this.stateTree.length -1;
    console.log( this.pointInHistory );
    this.lastTime = now;
    this.render();
  };

  TimeFork.prototype.makeCanvas = function(){
    with( this ){
      canvas = document.createElement('canvas');
      canvas.setAttribute('width' , "600px");
      canvas.setAttribute('height', "400px");
      canvas.setAttribute('style', 'border:1px solid black;display:block;'); 
      canvas.id = "history";
      body.appendChild(canvas);
      context = canvas.getContext('2d');
    }
  };
    
  // Rendering time forks and state nodes
  TimeFork.prototype.render = function(){
    with( this ){
      
      if(!canvas){
        makeCanvas();
      }
      
      context.fillStyle   = "#aaa";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle   = "#0af";
      context.strokeStyle = "#fff";
      context.lineWidth   = 1;
      
      var diam = 5;
      var x = diam,
          y = canvas.height/2,
          spacing = diam * 0.5;
      
      for(var i in stateTree){
        node = stateTree[i];
          
        with( context ){
          beginPath();
            arc(x, y, diam, 0, Math.PI*2, true);
          closePath();
          fill();
          stroke();
        }
                        
        x+=diam*2+spacing;
                         
      }
    }
  };
  
  this.timeFork = function( aName, elem, event, prop ){
    return new TimeFork( aName, elem, event, prop );
  };

})();
