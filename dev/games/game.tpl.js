var MyGame = function(){
    this.AddHandlerControl(Game.CONTROLS.UP, function(){});
}; Game.extend(MyGame);
MyGame.prototype.name = "Моя игра";
MyGame.prototype.close = function(){};
MyGame.prototype.tick = function(){};
MyGame.prototype.draw = function(canvas){
    canvas.drawColor(android.graphics.Color.BLUE);
}

Game.registerGame("my_game", MyGame);