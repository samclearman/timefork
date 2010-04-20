var TimeForkHtmlRenderer = function(elem) {
  this.elem = elem
}

TimeForkHtmlRenderer.prototype.makeContainer = function(){
  this.container = document.createElement('ul');
  this.container.id = "history";
  this.elem.appendChild(this.container);
}

TimeForkHtmlRenderer.prototype.render = function(timefork){
    
  if(!this.container){
    this.makeContainer();
  }
      
  this.container.innerHTML = "";
  this.container.appendChild(this.renderTree(timefork.stateTree, timefork.activeNodes()));
    
  
};

TimeForkHtmlRenderer.prototype.renderTree = function(tree, activeNodes) {
  var rendering = document.createElement('li');
  if (activeNodes.indexOf(tree) != -1) {
    rendering.setAttribute("class", "active");
  }
  rendering.innerHTML = this.renderNode(tree);
  
  var branches = document.createElement('ul');
  for (branch in tree.branches) {
    console.log(branch);
    branches.appendChild(this.renderTree(tree.branches[branch], activeNodes));
  }
  rendering.appendChild(branches);
  return rendering;
};

TimeForkHtmlRenderer.prototype.renderNode = function(node) {
  return '<a href="#' + node.eventTime + '">' + (uneval(node.propState.delta()) || "&nbsp") + '</a>';
}