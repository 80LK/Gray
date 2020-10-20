var Game = function (){};
Game.prototype.AddHandlerControl = function (controls, event) {
    if (!this.__controls)
        this.__controls = [[], [], [], []];

    this.__controls[controls].push(event.bind(this));
}
Game.prototype.invoke = function (control) {
    if (this.__controls === null) return;
    
    let events = this.__controls[control];
    for (let i in events) {
        events[i]();
    }
}
Game.prototype.sid = "game_interface";
Game.prototype.toString = function(){
    return "Game[" + this.name + "]";
}
Game.prototype.__controls = null;
Game.prototype.tick = function(){};
Game.prototype.draw = function (canvas){}
Game.prototype.close = function(){};

Game.CONTROLS = {
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
};
Game.__list = {};
Game.extends = function(_game){
    var F = function(){};
    F.prototype = Game.prototype;
    _game.prototype = new F();
    _game.prototype.constructor = _game;
    _game.superclass = Game.prototype;
}
Game.registerGame = function (name, _game) {
    if(Game.__list.hasOwnProperty(name))
        throw new Error("Game \""+name+"\" was been register.");

    _game.prototype.sid = name;
    Game.__list[name] = _game;
}

Game.UI = {};
Game.UI.Typeface = android.graphics.Typeface.createFromFile(__dir__ + "gui/mc-typeface.ttf");

ModAPI.registerAPI("RetroWaveGame", Game)