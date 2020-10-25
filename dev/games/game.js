var Game = function (){};
Game.prototype.AddHandlerControl = function (controls, event) {
    if (!this.__controls)
        this.__controls = [];
    if(!this.__controls[controls])
        this.__controls[controls] = [];
        
    this.__controls[controls].push(event.bind(this));
}
Game.prototype.invoke = function (control) {
    if (this.__controls === null) return;
    
    let events = this.__controls[control];
    for (let i in events) {
        try{
            events[i]();
        }catch(e){
            this.throw(e);
        }
    }

}
Game.prototype.sid = "game_interface";
Game.prototype.toString = function(){
    return "Game[" + this.sid + "]";
}
Game.prototype.__controls = null;
Game.prototype.__throwed = null;
Game.prototype.tick = function(){
    if(this.__throwed) throw this.__throwed;
};
Game.prototype.draw = function (canvas){}
Game.prototype.close = function(){};
Game.prototype.throw = function(e){
    this.__throwed = e;
};

Game.CONTROLS = {
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
};
Game.__list = {};
Game.extends = function(_game){
    Utils.extends(_game, Game);
}
Game.registerGame = function (name, _game) {
    if(Game.__list.hasOwnProperty(name))
        throw new Error("Game \""+name+"\" was been register.");

    _game.sid = _game.prototype.sid = name;
    Game.__list[name] = _game;
}
Game.getGameFormSID = function(name){
    if(!Game.__list.hasOwnProperty(name))
        return null;

    return Game.__list[name];
}

Game.UI = {};
Game.UI.Typeface = android.graphics.Typeface.createFromFile(__dir__ + "gui/mc-typeface.ttf");

ModAPI.registerAPI("RetroWaveGame", Game)