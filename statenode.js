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
