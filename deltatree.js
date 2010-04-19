// DeltaTree factory
DeltaTree = function(p, d) {

    var deltatree = function(params) {
        if (typeof(params) == "undefined") {
          return deltatree.toObj()
        } else {
          return deltatree.fork(params);
        }
    }
    
    var parent = p;
    var delta = Delta(d, (p && p.toObj()));
    
    deltatree.parent = function() { return parent; };
    
    deltatree.fork = function(delta) {
        return DeltaTree(deltatree, delta);
    };
    
    deltatree.delta = function() {
      return delta.mergeOver({});
    };
    
    deltatree.toObj = function() {
        if(!parent) {
            return delta.mergeOver({});
        }
        return delta.mergeOver(parent.toObj());
    };
        
    return deltatree;
}

// Delta decorator
Delta = function(d, orig) {
  
    var delta = {};
    
    if(orig) {
      for (var k in d) {
        if(d[k] != orig[k]) {
          delta[k] = d[k];
        }
      }
      // for (var k in orig) {
      //   if (!(k in delta)) {
      //     delta[k] = undefined;
      //   }
      // }
    } else {
      delta = d;
    }
    
    delta.mergeOver = function(obj) {
        var merged = eval(uneval(obj));
        for (k in this) {
            if (this[k] == undefined) {
              delete merged[k];
            } else if (k != "mergeOver") {
                merged[k] = this[k];
            }
        }
        return merged;
    }

    return delta;

}