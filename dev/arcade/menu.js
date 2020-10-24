var ArcadeMenu = function(){
    this.elements = [];
    this.gameSID = (function(){
        var r = [];
        for(let i in Game.__list){
            let game = Game.__list[i];
            if(game.Arcade){
                r.push(i);
            }
        }
        return r;
    })();
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
        let item = new ArcadeMenu.UI.ItemList();
        item.Text = Game.__list[this.gameSID[i]].prototype.name;
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
        this.Start(Game.__list[this.gameSID[this.__current]]);
    });
    this.AddHandlerControl(Game.CONTROLS.RIGHT, function () {
        this.Start(Game.__list[this.gameSID[this.__current]]);
    });
}; Game.extends(ArcadeMenu);
ArcadeMenu.prototype.sid = "arcade_menu";

ArcadeMenu.prototype.MenuTextEmpty = (function(){
    let paint = new Paint();
    paint.setARGB(255, 255, 255, 255);
    paint.setTextAlign(Paint.Align.CENTER);
    paint.setTypeface(Game.UI.Typeface);
    paint.setTextSize(50);
    return paint;
})();

ArcadeMenu.prototype.Start = function(game){
    if(!game instanceof Game)
        throw new TypeError("Not Game.");

        ArcadeWindow.game = new game();
};
ArcadeMenu.prototype.draw = function (canvas) { 
    //Draw background
    canvas.drawColor(android.graphics.Color.BLACK);

    //Draw "No games"
    if(this.elements.length == 0){
        let bounds = new Rect();
        let textToDraw = "Игр не найдено"
        this.MenuTextEmpty.getTextBounds(textToDraw, 0, textToDraw.length, bounds);
        return canvas.drawText(textToDraw, canvas.getWidth()/2, (canvas.getHeight()+(bounds.bottom-bounds.top))/2, this.MenuTextEmpty); 
    }

    for(let i in this.elements){
        this.elements[i].draw(canvas);
    }
}

ArcadeMenu.UI = {}
ArcadeMenu.UI.extends = function (Child, Parent) {
    if(Parent === undefined)
        Parent = ArcadeMenu.UI.IVeiw;

    var F = function(){};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;

    Child.superclass = Parent.prototype;
}
ArcadeMenu.UI.IVeiw = function(){}
ArcadeMenu.UI.IVeiw.prototype.draw = function(){};

ArcadeMenu.UI.ItemList = function(){
    this.Font = new Paint();
    this.Font.setARGB(255, 255, 255, 255);
    this.Font.setTypeface(Game.UI.Typeface);
    this.Font.setTextSize(20);
    
    this.__rect = new Rect();

    this.Paint = new Paint();
    this.Paint.setARGB(255, 255,0,0);
};
ArcadeMenu.UI.ItemList.__bitmap = new Bitmap.createBitmap(ArcadeUIBitmap, 28, 58, 3, 5);
ArcadeMenu.UI.extends(ArcadeMenu.UI.ItemList);
ArcadeMenu.UI.ItemList.prototype.toString = function(){
    return "ItemList";
}
ArcadeMenu.UI.ItemList.prototype.Text = "ItemList";
ArcadeMenu.UI.ItemList.prototype.Select = false;
ArcadeMenu.UI.ItemList.prototype.X = 0;
ArcadeMenu.UI.ItemList.prototype.Y = 0;
ArcadeMenu.UI.ItemList.prototype.draw = function(canvas){
    this.getRect();

    if(this.Select)
        canvas.drawBitmap(ArcadeMenu.UI.ItemList.__bitmap,
            new Rect(0, 0, 3, 5),
            new Rect(this.X, this.Y, this.X + this.__height * .6, this.Y + this.__height), this.Paint);
    
    canvas.drawText(this.Text, this.X + this.__height, this.Y + this.__height, this.Font); 
}
ArcadeMenu.UI.ItemList.prototype.getRect = function(){
    this.Font.getTextBounds(this.Text, 0, this.Text.length, this.__rect);
    this.__height = this.__rect.bottom - this.__rect.top;
    return this.__rect;
}