var MyGame = function(){
    this.AddHandlerControl(Game.CONTROLS.UP, function(){
        this.Element.Rotate();
    });
}; Game.extend(MyGame);
MyGame.prototype.name = "Моя игра";
MyGame.prototype.draw = function(canvas){
    canvas.drawColor(android.graphics.Color.BLUE);
}

Game.registerGame("my_game", MyGame);