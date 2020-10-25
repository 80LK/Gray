var Tetris = function(){
    this.initDefaultValue();


    this.AddHandlerControl(Game.CONTROLS.UP, function(){
        if(this.CheckValidPlace(this.Element.X, this.Element.Y, this.Element.getRotateForm()))
            this.Element.Rotate();
    });
    this.AddHandlerControl(Game.CONTROLS.DOWN, function(){
        while(this.CheckValidPlace(this.Element.X, this.Element.Y + 1, this.Element.Form))
            this.Element.Y++;
    });
    this.AddHandlerControl(Game.CONTROLS.LEFT, function(){
        if(this.CheckValidPlace(this.Element.X - 1 , this.Element.Y, this.Element.Form))
            this.Element.TryLeft();
    });
    this.AddHandlerControl(Game.CONTROLS.RIGHT, function(){
        if(this.CheckValidPlace(this.Element.X + 1 , this.Element.Y, this.Element.Form))
            this.Element.TryRight();
    });
}; Game.extends(Tetris);

Tetris.prototype.name = "Тетрис";
Tetris.Arcade = true;

Tetris.prototype.score = 0;
Tetris.paints = [];
(function(colors){
    for(let i = colors.length-1; i >= 0; i--){
        let p = new Paint();
        p.setColor(colors[i])
        Tetris.paints.push(p);
    }
})([Color.RED, Color.GREEN, Color.CYAN, Color.BLUE, Color.MAGENTA, Color.YELLOW, Color.argb(255, 255, 128, 0)]);
Tetris.elements = [
    [[1,1],[1,1]],
    [[1,1,1,1]],
    [[1,1,0],[0,1,1]],
    [[0,1,1],[1,1,0]],
    [[1,1,1],[0,1,0]],
    [[1,0,0],[1,1,1]],
    [[0,0,1],[1,1,1]]
];
Tetris.prototype.BorderPaint = (function(){
    let p = new Paint();
    p.setColor(Color.WHITE);
    p.setStyle(Paint.Style.STROKE);
    p.setStrokeWidth(2);
    return p;
})();
Tetris.prototype.GridPaint = (function(){
    let p = new Paint();
    p.setARGB(64,255,255,255);
    p.setStyle(Paint.Style.STROKE);
    p.setStrokeWidth(2);
    return p;
})();
Tetris.prototype.FontPaint = (function(){
    let p = new Paint();
    p.setColor(Color.WHITE);
    p.setTypeface(Game.UI.Typeface);
    p.setTextSize(20);
    return p;
})();
Tetris.prototype.EndFontPaint = (function(){
    let p = new Paint();
    p.setColor(Color.WHITE);
    p.setTypeface(Game.UI.Typeface);
    p.setTextSize(50);
    return p;
})();
Tetris.prototype.time = 0;
Tetris.prototype.end = false;

Tetris.prototype.tick = function(delta){
    Tetris.superclass.tick.apply(this, arguments);

    this.time += delta;
    
    if(this.time >= 1){
        this.time-=1;
        if(this.CheckValidPlace(this.Element.X, this.Element.Y + 1, this.Element.Form)){
            this.Element.Y++;
        }else if(this.Element.Y ==0){
            this.end = true;
        }else{
            this.InsertElement();
            this.CheckLines();
            this.UpdateElement();
        }
    }
}
Tetris.prototype.CheckLines = function(){
    let offset = 0;
    for(let y = 0; y < 20; y++){
        if(offset > 0){
            for(let x = 0; x < 10; x++){    
                this.field[y - offset][x] = this.field[y][x];
                if(y >= 19)
                    this.field[y][x] = null;
            }
        }
        for(let x = 0; x < 10; x++){
            if(this.field[y - offset][x] == null) break;
            if(x == 9){
                this.score++;
                offset++;
            }

        }
    }
}
Tetris.prototype.CheckValidPlace = function(x, y, form){
    let height = form.length,
        width = form[0].length;

    if(y < 0 || y > 20 - height) return false;
    if(x < 0 || x > 10 - width) return false;

    for(let _x = 0; _x < width; _x++){
        for(let _y = 0; _y < height; _y++){
            if(form[_y][_x]){
                if(this.field[19 - (y + _y)][x + _x] != null)
                    return false;
            }
        }
    }
    return true;
}
Tetris.prototype.InsertElement = function(){
    for(let x = 0; x < this.Element.Width; x++){
        for(let y = 0; y < this.Element.Height; y++){
            if(this.Element.Form[y][x]){
                this.field[19 - (this.Element.Y + y)][this.Element.X + x] = this.Element.indexPaint;
            }
        }
    }
}
Tetris.prototype.UpdateElement = function(){
    this.Element = this.Next;
    this.GenerateNextElement();
}
Tetris.prototype.GenerateNextElement = function(){
    this.Next = new Tetris.Element(Tetris.elements[Utils.random(0,7)]);
    this.Next.indexPaint = Utils.random(0,7);
    if(this.rect)
        this.Next.Size = this.rect.size;
}
Tetris.prototype.draw = function(canvas){
    if(!this.rect){
        this.rect = {};

        this.rect.height = canvas.getHeight() - 20;
        this.rect.width = this.rect.height / 2;
        this.Next.Size = this.Element.Size = this.rect.size = this.rect.width / 10;
        let rect = new Rect();
        this.FontPaint.getTextBounds("A", 0, 1, rect);
        this.rect.heightFont = rect.bottom-rect.top;
    }

    //Фон
    canvas.drawColor(Color.BLACK);

    //Игровое поле
    canvas.drawRect(10, 10, this.rect.width + 10, this.rect.height + 10, this.BorderPaint);
    for(let y = 0; y < 20; y++)
        for(let x = 0; x < 10; x++){
            if(this.field[y][x] != null)
                canvas.drawRect(10 + (this.rect.size * x),       10 + this.rect.height - this.rect.size * (y + 1),
                                10 + (this.rect.size * (x + 1)), 10 + this.rect.height - this.rect.size * y,
                                Tetris.paints[this.field[y][x]]);
        }

    this.Element.draw(canvas);

    for(let y = 0; y < 20; y++)
        canvas.drawLine(10, 10 + this.rect.size * y, 10 + this.rect.width, 10+this.rect.size * y, this.GridPaint);

    for(let y = 0; y < 10; y++)
        canvas.drawLine(10 + this.rect.size * y, 10, 10 + this.rect.size * y, 10 + this.rect.height, this.GridPaint);

    //Следующая фигура
    canvas.drawText("Следующая фигура", this.rect.width + 20, this.rect.heightFont + 10, this.FontPaint);
    
    canvas.drawRect(this.rect.width + 20, this.rect.heightFont + 20,
            this.rect.width + 90, this.rect.heightFont + 90, this.BorderPaint);

    this.Next.drawSize(canvas, this.rect.width + 25, this.rect.heightFont + 25, 15);
    //Очки
    canvas.drawText("Очки: " + this.score, this.rect.width + 20, 2*this.rect.heightFont + 100, this.FontPaint);

    
    if(this.end){
        let str = "Конец игры. Ваш счет: " + this.score,
            rect = new Rect();
        this.EndFontPaint.getTextBounds(str, 0, str.length, rect);
        let width = canvas.getWidth(),
            height = canvas.getHeight(),
            heightFont = rect.bottom-rect.top,
            widthFont = rect.right - rect.left;
        canvas.clipRect( (width - widthFont)/2 - 20, (height - heightFont)/2 - 20,
                        (width + widthFont)/2 + 20, (height + heightFont)/2 + 20);
        canvas.drawColor(Color.BLACK);
        canvas.drawText(str, (width - widthFont)/2, (height + heightFont)/2, this.EndFontPaint);
    }
}
Tetris.prototype.initDefaultValue = function(){
    this.rect = null;
    this.score = 0;
    this.end = false;
    this.time = 0;

    this.field = [];
    for(let y = 0; y < 20; y++){
        this.field.push([]);

        for(let x = 0; x < 10; x++)
            this.field[y].push(null);
    }

    this.__soundPlayer = new Sound("tetris.wav");
    this.__soundPlayer.play();
    this.__soundPlayer.setLooping(true);
    this.GenerateNextElement();
    this.UpdateElement();   
}
Tetris.prototype.close = function(){
    this.__soundPlayer.stop();
}
//Element
Tetris.Element = function(form){
    this.__setForm(form);

    this.X = 5 - Math.round(this.Width/2);
}
Tetris.Element.prototype.__setForm = function(form){
    this.Form = form;
    this.Height = form.length;
    this.Width = form[0].length;
}
Tetris.Element.prototype.Rotate = function(){
    

    this.__setForm(this.getRotateForm());
}
Tetris.Element.prototype.getRotateForm = function(){
    let form = [];
    
    for(let y = 0, ly = this.Form[0].length; y < ly; y++){
        let row = [];
        for(let x = this.Form.length-1; x >= 0 ; x--){
            row.push(this.Form[x][y]);
        }
        form.push(row);
    }
    return form;
}

Tetris.Element.prototype.Y = 0;
Tetris.Element.prototype.Size = 20;
Tetris.Element.prototype.SetX = function(x){
    if(x > 10 - this.Width || x < 0)
        throw new Error("Can't set X in " + x);
    
    this.X = x;
}
Tetris.Element.prototype.TryLeft = function(){
    try{this.SetX(this.X - 1)}catch(e){}
}
Tetris.Element.prototype.TryRight = function(){
    try{this.SetX(this.X + 1)}catch(e){}
}


Tetris.Element.prototype.draw = function(canvas){
    this.drawSize(canvas, 10 + this.X * this.Size, 10 + this.Y * this.Size, this.Size);
}
Tetris.Element.prototype.drawSize = function(canvas, _x, _y, size){
    for(let y = this.Form.length-1; y >= 0; y--)
        for(let x = this.Form[y].length-1; x >= 0; x--)
            if(this.Form[y][x] == 1)
            canvas.drawRect(_x + size * x,        _y + size * y,
                            _x + size * (x + 1),  _y + size * (y + 1), Tetris.paints[this.indexPaint]);
}

Game.registerGame("tetris", Tetris);

Game.registerCartridge(Tetris, "Tetris", {
    name:"cartridge",
    meta:0,
    color: Color.argb(255, 0, 188, 89)
});