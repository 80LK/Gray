var Game = function (){
    this.elements = [];
    this.gameSID = Object.keys(Game.__list);
    this.__current = 0;

    this.Next = function(){
        if(this.__current == this.elements.length-1)
            this.Select(0);
        else
            this.Select(this.__current+1);
    }
    this.Prev = function(){
        if(this.__current == 0)
            this.Select(this.elements.length-1);
        else
            this.Select(this.__current-1);
    }
    this.Select = function(i){
        this.elements[this.__current].Select = false;
        this.elements[this.__current = i].Select = true;
    }

    let size;
    for(let i = 0, l = this.gameSID.length; i < l; i++){
        let item = new Game.UI.ItemList();
        item.Text = Game.__list[this.gameSID[i]].name;
        if(!size){
            item.getRect();
            size = item.__height;
        }
        item.X = 10;
        item.Y = 10 + (size + 10) * i;
        if(i==0)
            item.Select = true;

        this.elements.push(item);
    }

    this.AddHandlerControl(Game.CONTROLS.UP, function () {
        this.Prev();
    });
    this.AddHandlerControl(Game.CONTROLS.DOWN, function () {
        this.Next();
    });
    this.AddHandlerControl(Game.CONTROLS.LEFT, function () {
        ArcadeMenu.Start(Game.__list[this.gameSID[this.__current]]);
    });
    this.AddHandlerControl(Game.CONTROLS.RIGHT, function () {
        ArcadeMenu.Start(Game.__list[this.gameSID[this.__current]]);
    });
};
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
Game.prototype.sid = "arcade_menu";
Game.prototype.toString = function(){
    return "Game[" + this.name + "]";
}
Game.prototype.__controls = null;
Game.prototype.tick = function(){};
Game.prototype.draw = function (canvas) { 
    //Draw background
    canvas.drawColor(android.graphics.Color.BLACK);

    //Draw "No games"
    if(this.elements.length == 0){
        let bounds = new Rect();
        let textToDraw = "Игр не найдено"
        ArcadeMenu.MenuTextEmpty.getTextBounds(textToDraw, 0, textToDraw.length, bounds);
        return canvas.drawText(textToDraw, canvas.getWidth()/2, (canvas.getHeight()+(bounds.bottom-bounds.top))/2, ArcadeMenu.MenuTextEmpty); 
    }

    for(let i in this.elements){
        this.elements[i].draw(canvas);
    }
}
Game.prototype.close = function(){
    Arcade.game = Game.MenuGame;
}
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
    Game.__list[name] = new _game();
}

Game.UI = {};
Game.UI.Typeface = android.graphics.Typeface.createFromFile(__dir__ + "gui/mc-typeface.ttf");
Game.UI.extends = function (Child, Parent) {
    if(Parent === undefined)
        Parent = Game.UI.IVeiw;

    var F = function(){};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;

    Child.superclass = Parent.prototype;
}
Game.UI.IVeiw = function(){}
Game.UI.IVeiw.prototype.draw = function(){};

Game.UI.ItemList = function(){
    this.Font = new Paint();
    this.Font.setARGB(255, 255, 255, 255);
    this.Font.setTypeface(Game.UI.Typeface);
    this.Font.setTextSize(20);
    
    this.__rect = new Rect();

    this.Paint = new Paint();
    this.Paint.setARGB(255, 255,0,0);
};
Game.UI.ItemList.__bitmap = (function(){
    let bitmap = new BitmapFactory.decodeFile(__dir__ + "gui/arcadeUI.png");
    return new Bitmap.createBitmap(bitmap, 28, 58, 3, 5);
})();
Game.UI.extends(Game.UI.ItemList);
Game.UI.ItemList.prototype.toString = function(){
    return "ItemList";
}
Game.UI.ItemList.prototype.Text = "ItemList";
Game.UI.ItemList.prototype.Select = false;
Game.UI.ItemList.prototype.X = 0;
Game.UI.ItemList.prototype.Y = 0;
Game.UI.ItemList.prototype.draw = function(canvas){
    this.getRect();

    if(this.Select)
        canvas.drawBitmap(Game.UI.ItemList.__bitmap,
            new Rect(0, 0, 3, 5),
            new Rect(this.X, this.Y, this.X + this.__height * .6, this.Y + this.__height), this.Paint);
    
    canvas.drawText(this.Text, this.X + this.__height, this.Y + this.__height, this.Font); 
}
Game.UI.ItemList.prototype.getRect = function(){
    this.Font.getTextBounds(this.Text, 0, this.Text.length, this.__rect);
    this.__height = this.__rect.bottom - this.__rect.top;
    return this.__rect;
}

var ArcadeMenu = {
    MenuTextEmpty:(function(){
        let paint = new Paint();
        paint.setARGB(255, 255, 255, 255);
        paint.setTextAlign(Paint.Align.CENTER);
        paint.setTypeface(Game.UI.Typeface);
        paint.setTextSize(50);
        return paint;
    })(),
    Start:function(game){
        if(!game instanceof Game)
            throw new TypeError("Not Game.");
        Arcade.game = game;
    }
};

Callback.addCallback("PostLoaded", function(){
    Game.MenuGame = new Game();
    Arcade.game = Game.MenuGame;
});

ModAPI.registerAPI("RetroWaveGame", {
    extends:Game.extends,
    registerGame:Game.registerGame
})