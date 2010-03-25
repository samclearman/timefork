(function(){
  
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
                spacing : 2.5,
              }
  };

  // Statenode constructor
  var StateNode = function(props){
    for(var i in props){ this[i] = props[i]; }
    return this;
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
    this.stateTree.propState = this.elem[ this.prop ];
    
    this.pointInHistory = this.stateTree;
    
    // Re-route Event Stream
    elem.addEventListener( event, function( event ){ origin.filter( event ); }, false );
    
    return this;
  };
  
  TimeFork.prototype.stateTree = new StateNode({
      ancestor  : 0,
      branches  : [],
      eventTime : defs.lastTime,
      eventType : 'History began.',
      eventData : null,
      eventData : undefined
  });
   
  TimeFork.prototype.filter = function( event ){
    clearTimeout( this.timeout );
    var origin = this;
    this.timeout = setTimeout( function(){ origin.recordState( event ); }, this.idleTime );
  };  
  
  
  TimeFork.prototype.recordState = function( event ){
    var now = new Date().getTime();    
    
    this.pointInHistory = this.pointInHistory.branches[ 0 ] = new StateNode({
      ancestor  : this.lastTime,
      branches  : [],
      eventTime : now,
      eventType : this.event,
      eventData : event,
      propState : this.elem[ this.prop ],
    });
    
    console.log( this.pointInHistory );
    this.lastTime = now;
    this.render();
  };

  TimeFork.prototype.makeCanvas = function(){
    var origin = this;
    var mouseX=0, mouseY=0;
    var mouseMoved = function(){
      console.log(mouseX, mouseY); 
    };
    
    with( this ){
      canvas = document.createElement('canvas');
      canvas.setAttribute('width' , "600px");
      canvas.setAttribute('height', "400px");
      canvas.setAttribute('style', 'border:1px solid black;display:block;'); 
      canvas.id = "history";
      body.appendChild(canvas);
      context = canvas.getContext('2d');
    }
    
    this.canvas.addEventListener('mousemove', function( e ){
      var scrollX = (window.scrollX !== null && typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset;
      var scrollY = (window.scrollY !== null && typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset;     
      mouseX = e.clientX - origin.canvas.offsetLeft + scrollX;
      mouseY = e.clientY - origin.canvas.offsetTop + scrollY;
      mouseMoved();
    }, false);    
  };
  
  
    
  // Rendering time forks and state nodes
  TimeFork.prototype.render = function(){
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
          fillStyle = "#c00";
          lineWidth = 2;
        }else{
          fillStyle = "#0af";
          lineWidth = 1;
        }
        translate(style.diam*2+style.spacing,0);
        beginPath();
          arc(0, 0, style.diam, 0, style.TWO_PI, true);
        closePath();
        fill();
        stroke();
      }
      this.renderBranch( node.branches[i] );    
    }
  };
  
  
  // Model instatiator
  this.timeFork = function( aName, elem, event, prop ){
    return new TimeFork( aName, elem, event, prop );
  };

})();
