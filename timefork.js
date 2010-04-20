// require: statenode.js deltaree.js
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


  
  // TimeFork Constructor
  var TimeFork = function( aName, callback ){
  
    // Copy defaults to new instance
    for(var i in defs){ this[i] = defs[i]; }
    
    // Back reference to object, used in event calls to maintain scope
    var origin = this;

    this.name = aName;
    this.callback = callback;
    
    // Set first leaf in statetree
    this.stateTree.propState = DeltaTree(null, {});
    this.pointInHistory = this.stateTree;
    
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
    this.callback();
  };
  
  TimeFork.prototype.currentState = function() {
    return this.pointInHistory.propState.toObj();
  };
  
  TimeFork.prototype.go = function(point){
    this.pointInHistory = point;
    this.callback();
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
    
  TimeFork.prototype.activeNodes = function(){
    return this.pointInHistory.ancestors().concat(this.pointInHistory);
  };
  
  
  
  // Model instatiator
  this.timeFork = function( aName, elem ){
    return new TimeFork( aName, elem );
  };


//})();
