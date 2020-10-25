Dendy.NoGame = function(){}; Game.extends(Dendy.NoGame);
Dendy.NoGame.prototype.sid = "noGameDendy"
Dendy.NoGame.prototype.Font = (function(){
    let paint = new Paint();
    paint.setARGB(255, 255, 255, 255);
    paint.setTextAlign(Paint.Align.CENTER);
    paint.setTypeface(Game.UI.Typeface);
    paint.setTextSize(50);
    return paint;
})();
Dendy.NoGame.prototype.draw = function(canvas){
    canvas.drawColor(Color.BLACK);
    let bounds = new Rect();
    let textToDraw = "Вставьте картридж";
    this.Font.getTextBounds(textToDraw, 0, textToDraw.length, bounds);
    canvas.drawText(textToDraw, canvas.getWidth()/2, (canvas.getHeight()+(bounds.bottom-bounds.top))/2, this.Font);
}
Dendy.list.noGameDendy = {
    game:Dendy.NoGame,
    texture:{
        color:Color.TRANSPARENT
    }
}
Dendy.items[null] = Dendy.list.noGameDendy;