var Game = function(){};
Game.CONTROLS = {
    UP = 0,
    DOWN = 1,
    LEFT = 2,
    RIGHT = 3
};

Game.prototype.AddHandlerControl = function(controls, event){
    if(!this._controls)
        this._controls = [[],[],[],[]];
    
    this._controls[controls].push(event);
}
Game.prototype.__invoke = function(control){
    let events = this._controls[control];
    for(let i in events){
        events[i]();
    }
}
Game.prototype.canvas = null;
Game.registerGame = function(obj){
    
}