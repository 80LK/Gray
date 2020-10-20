/*
BUILD INFO:
  dir: dev
  target: mod.js
  files: 12
*/



// file: header.js

/*
   ____                        
  / ___|  _ __    __ _   _   _ 
 | |  _  | '__|  / _` | | | | |
 | |_| | | |    | (_| | | |_| |
  \____| |_|     \__,_|  \__, |
                         |___/ 
                         by WolfTeam & Diskrizy
*/

const DEBUG = (function(){
   var config = FileTools.ReadJSON(__packdir__ + "/innercore/config.json") || {};
   return config["developer_mode"] === true;
})();

Block.createBlockWithRotateAndModel = function(sid, name, model, texture, offset, blockTexture, inCreative){
    if(typeof texture == "string")
        texture = {name:texture};
    
    if(texture.name == undefined)
      throw new Error("texture.name is undefined");

   if(blockTexture == undefined)
      blockTexture = texture.name;

   if(!offset) offset = {};

   if(inCreative === undefined)
      inCreative = true;

   Block.createBlockWithRotation(sid, [{
      name:name,
      texture: [[blockTexture, 0]],
      inCreative:inCreative
   }]);


   var rots = [
      Math.PI,
      0,
      Math.PI * .5,
      Math.PI * 1.5,
  ];
  for(let i = 0; i < 4; i++){
      let mesh = new RenderMesh();
      mesh.setBlockTexture(texture.name, texture.meta | 0);
      mesh.importFromFile(__dir__ + "models/"+model+".obj", "obj", null);
      mesh.rotate(0, rots[i], 0);
      mesh.translate(.5,0,.5);

      let render = new BlockRenderer.Model(mesh);
      let icrender = new ICRender.Model(); 
      icrender.addEntry(render);
      BlockRenderer.setStaticICRender(BlockID[sid], i, icrender);
  }
}

var View = android.view.View,
   Popup = android.widget.PopupWindow,
   NinePatchDrawable = android.graphics.drawable.NinePatchDrawable,
   RelativeLayout = android.widget.RelativeLayout,
   Button = android.widget.Button,
   ImageView = android.widget.ImageView,
   Thread = java.lang.Thread,
   Bitmap = android.graphics.Bitmap,
   Rect = android.graphics.Rect,
   Paint = android.graphics.Paint,
   Color = android.graphics.Color,
   System = java.lang.System,
   MotionEvent = android.view.MotionEvent,
   BitmapFactory = android.graphics.BitmapFactory;

var ArcadeUIBitmap = new BitmapFactory.decodeFile(__dir__ + "gui/arcadeUI.png");
var ctx = UI.getContext();
var ICGame = Game;

function runUI(f){
   if(f)
      ctx.runOnUiThread(new java.lang.Runnable({
         run: function() {
            f();
         }
      }))
}

function createNinePatch(bitmap, x, y, c){
   let xL = x.length, yL = y.length, cL = (xL+1) * (yL+1);
   var a = java.nio.ByteBuffer.allocate(32 + (xL+yL+cL) * 4).order(java.nio.ByteOrder.nativeOrder());
   a.put(1);
   a.put(xL);
   a.put(yL);
   a.put(cL);
   a.putInt(0);
   a.putInt(0);
   a.putInt(0);
   a.putInt(0);
   a.putInt(0);
   a.putInt(0);
   a.putInt(0);

   for(let i = 0; i < xL; i++)
      a.putInt(x[i]);
   for(let i = 0; i < yL; i++)
      a.putInt(y[i]);
   for(let i = 0; i < cL; i++)
      a.putInt(1);
   
   return new NinePatchDrawable(ctx.getResources(), bitmap, a.array(), new Rect(), "")
}

runUI(function(){
   ctx.getWindow().setFlags(
      android.view.WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
      android.view.WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
  );
});

IMPORT("SoundAPI");




// file: utils.js

const Utils = {
    random:function(min, max){
        if(min === undefined) min=0;
        if(max === undefined) max=min+10;

        return Math.floor((max-min) * Math.random() + min);
    }
}




// file: games/game.js

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




// file: arcade/menu.js

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

    Arcade.game = new game();
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

Callback.addCallback("PostLoaded", function(){
    Arcade.game = new ArcadeMenu();
});




// file: arcade/arcade.js

IDRegistry.genBlockID("arcade");
Block.createBlockWithRotateAndModel("arcade", "Arcade", "arcade", "arcade", { x:0, z:0 }, "planks");

(function(){
    let CollisionShape = new ICRender.CollisionShape();
    let Entry = CollisionShape.addEntry();
    Entry.addBox(0,0,0,1,1.5,1);
    
    BlockRenderer.setCustomCollisionShape(BlockID.arcade, -1, CollisionShape);
})()




// file: arcade/window.js

//MotionEvent
var Arcade = {
    game:null,
    window:null
};

Arcade.window = (function(){
    let popup = new Popup();
    popup.setWidth(-1);
    popup.setHeight(-1);
    let surface, surfaceHolder;
    let errorPaint = (function(){
        let p = new Paint();
        p.setColor(Color.WHITE);
        p.setTypeface(Game.UI.Typeface);
        p.setTextSize(20);
        return p;
    })();

    let thisWindow =  {
        open:function(){
            if(thisWindow.opened) return;
            runUI(function(){
                popup.showAtLocation(ctx.getWindow().getDecorView(), 51, 0, 0);
            });
            thisWindow.opened = true;
            new Thread(function(){
                var canvas = null, error = false;
                thisWindow.drawing = true;
                let lastTime = System.currentTimeMillis();
                while (thisWindow.opened) {
                    let currentTime = System.currentTimeMillis();
                    Arcade.game.tick((currentTime - lastTime)/1000);
                    lastTime = currentTime;

                    canvas = null;
                    try {
                        canvas = surface.lockCanvas();
                        if (canvas == null) continue;

                        Arcade.game.draw(canvas);
                    } catch(e){
                        canvas.drawColor(Color.BLUE);
                        e = e.toString();
                        let rect = new Rect();
                        errorPaint.getTextBounds(e, 0, e.length || e.length(), rect)
                        canvas.drawText(e, 10, 10 + rect.bottom - rect.top, errorPaint)
                        error = true;
                    }finally {
                        if (canvas != null)
                            surface.unlockCanvasAndPost(canvas);
                        if(error)
                            break;
                    }
                }
                thisWindow.drawing = false;
            }).start();
        },
        opened:false,
        drawing:false,
        close:function(){
            if(!thisWindow.opened) return;
        
            thisWindow.opened = false;
            while(thisWindow.drawing){}
            Arcade.game = new ArcadeMenu();
            runUI(function(){
                popup.dismiss();
            });
        }
    };

    let rootLayout = new RelativeLayout(ctx);
    rootLayout.setBackgroundDrawable((function(){
        let bitmap = new Bitmap.createBitmap(ArcadeUIBitmap, 0, 0, 64, 58);
        bitmap = Bitmap.createScaledBitmap(bitmap, 64 * 8, 58 * 8, false);
        return createNinePatch(bitmap, [23 * 8, 24 * 8, 40 * 8, 41 * 8], [5 * 8, 37 * 8], [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
    })());
    popup.setContentView(rootLayout);

    var surfaceParams = new RelativeLayout.LayoutParams(-1, -1);
    surfaceParams.setMargins(128, 40, 128, 168);
    runUI(function(){
        surface = new android.view.TextureView(ctx);
        surface.setOnClickListener(function(){alert("Click!")})
        rootLayout.addView(surface, surfaceParams);
    });

    

    let exitButton = new ImageView(ctx);
    let exitButtonDefaultBitmap = (function(){
            let bitmap = new Bitmap.createBitmap(ArcadeUIBitmap, 28, 63, 3, 3);
            return Bitmap.createScaledBitmap(bitmap, 3 * 15, 3 * 15, false);
        })(),
        exitButtonPressBitmap = (function(){
            let bitmap = new Bitmap.createBitmap(ArcadeUIBitmap, 28, 66, 3, 3);
            return Bitmap.createScaledBitmap(bitmap, 3 * 10, 3 * 10, false);
        })();
    exitButton.setImageBitmap(exitButtonDefaultBitmap);
    exitButton.setOnClickListener(thisWindow.close);
    exitButton.setOnTouchListener(function(b, c){
        var f = c.getActionMasked();
        if (f == MotionEvent.ACTION_DOWN) {
            b.setImageBitmap(exitButtonPressBitmap);
        }
        if (f == MotionEvent.ACTION_CANCEL || f == MotionEvent.ACTION_UP) {
            b.setImageBitmap(exitButtonDefaultBitmap);
        }
        return false;
    })
    let exitButtonParams  = new RelativeLayout.LayoutParams(-2, -2);
    exitButtonParams.setMargins(0, 8 * 5, 8 * 5, 0);
    exitButtonParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
    rootLayout.addView(exitButton, exitButtonParams);

    let buttonControlUp = new ImageView(ctx);
    let buttonControlUpDefaultBitmap = (function(){
            let bitmap = new Bitmap.createBitmap(ArcadeUIBitmap, 21, 58, 7, 7);
            return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
        })(),
        buttonControlUpPressBitmap = (function(){
            let bitmap = new Bitmap.createBitmap(ArcadeUIBitmap, 21, 65, 7, 7);
            return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
        })();
    buttonControlUp.setImageBitmap(buttonControlUpDefaultBitmap);
    buttonControlUp.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.UP)
    });
    buttonControlUp.setOnTouchListener(function(b, c){
        var f = c.getActionMasked();
        if (f == MotionEvent.ACTION_DOWN) {
            b.setImageBitmap(buttonControlUpPressBitmap);
        }
        if (f == MotionEvent.ACTION_CANCEL || f == MotionEvent.ACTION_UP) {
            b.setImageBitmap(buttonControlUpDefaultBitmap);
        }
        return false;
    })
    let buttonControlUpParams  = new RelativeLayout.LayoutParams(-2, -2);
    buttonControlUpParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
    buttonControlUpParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
    buttonControlUpParams.setMargins(0, 0, 270, 8 * 2);
    rootLayout.addView(buttonControlUp, buttonControlUpParams);

    let buttonControlDown = new ImageView(ctx);
    let buttonControlDownDefaultBitmap = (function(){
        let bitmap = new Bitmap.createBitmap(ArcadeUIBitmap, 14, 58, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
    })(),
    buttonControlDownPressBitmap = (function(){
        let bitmap = new Bitmap.createBitmap(ArcadeUIBitmap, 14, 65, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
    })();

    buttonControlDown.setImageBitmap(buttonControlDownDefaultBitmap);
    buttonControlDown.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.DOWN)
    });
    buttonControlDown.setOnTouchListener(function(b, c){
        var f = c.getActionMasked();
        if (f == MotionEvent.ACTION_DOWN) {
            b.setImageBitmap(buttonControlDownPressBitmap);
        }
        if (f == MotionEvent.ACTION_CANCEL || f == MotionEvent.ACTION_UP) {
            b.setImageBitmap(buttonControlDownDefaultBitmap);
        }
        return false;
    })
    let buttonControlDownParams  = new RelativeLayout.LayoutParams(-2, -2);
    buttonControlDownParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
    buttonControlDownParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
    buttonControlDownParams.setMargins(0, 0, 150, 8 * 2);
    rootLayout.addView(buttonControlDown, buttonControlDownParams);

    let buttonControlLeft = new ImageView(ctx);
    let buttonControlLeftDefaultBitmap = (function(){
        let bitmap = new Bitmap.createBitmap(ArcadeUIBitmap, 0, 58, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
    })(),
    buttonControlLeftPressBitmap = (function(){
        let bitmap = new Bitmap.createBitmap(ArcadeUIBitmap, 0, 65, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
    })();

    buttonControlLeft.setImageBitmap(buttonControlLeftDefaultBitmap);
    buttonControlLeft.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.LEFT)
    });
    buttonControlLeft.setOnTouchListener(function(b, c){
        var f = c.getActionMasked();
        if (f == MotionEvent.ACTION_DOWN) {
            b.setImageBitmap(buttonControlLeftPressBitmap);
        }
        if (f == MotionEvent.ACTION_CANCEL || f == MotionEvent.ACTION_UP) {
            b.setImageBitmap(buttonControlLeftDefaultBitmap);
        }
        return false;
    })
    let buttonControlLeftParams  = new RelativeLayout.LayoutParams(-2, -2);
    buttonControlLeftParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
    buttonControlLeftParams.setMargins(150, 0, 0, 8 * 2);
    rootLayout.addView(buttonControlLeft, buttonControlLeftParams);

    let buttonControlRight = new ImageView(ctx);
    let buttonControlRightDefaultBitmap = (function(){
        let bitmap = new Bitmap.createBitmap(ArcadeUIBitmap, 7, 58, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
    })(),
    buttonControlRightPressBitmap = (function(){
        let bitmap = new Bitmap.createBitmap(ArcadeUIBitmap, 7, 65, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
    })();

    buttonControlRight.setImageBitmap(buttonControlRightDefaultBitmap);
    buttonControlRight.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.RIGHT)
    });
    buttonControlRight.setOnTouchListener(function(b, c){
        var f = c.getActionMasked();
        if (f == MotionEvent.ACTION_DOWN) {
            b.setImageBitmap(buttonControlRightPressBitmap);
        }
        if (f == MotionEvent.ACTION_CANCEL || f == MotionEvent.ACTION_UP) {
            b.setImageBitmap(buttonControlRightDefaultBitmap);
        }
        return false;
    })
    let buttonControlRightParams  = new RelativeLayout.LayoutParams(-2, -2);
    buttonControlRightParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
    buttonControlRightParams.setMargins(270, 0, 0, 8 * 2);
    rootLayout.addView(buttonControlRight, buttonControlRightParams);

    return thisWindow;
})();


Callback.addCallback("ItemUse", function(c, i, b){
    if(b.id == BlockID.arcade){
        Arcade.window.open();
        ICGame.prevent();
    }
});




// file: games/tetris.js

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
    this.__end = false;
    this.end = false;
    this.time = 0;

    this.field = [];
    for(let y = 0; y < 20; y++){
        this.field.push([]);

        for(let x = 0; x < 10; x++)
            this.field[y].push(null);
    }

    this.GenerateNextElement();
    this.UpdateElement();   
}
Tetris.prototype.close = function(){
    this.initDefaultValue();
    Tetris.superclass.close.apply(this);
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
        for(let x = this.Form[0].length-1; x >= 0; x--)
            if(this.Form[y][x] == 1)
            canvas.drawRect(_x + size * x,        _y + size * y,
                            _x + size * (x + 1),  _y + size * (y + 1), Tetris.paints[this.indexPaint]);
}

Game.registerGame("tetris", Tetris);




// file: cooler/cooler.js

IDRegistry.genBlockID("cooler");
Block.createBlockWithRotateAndModel("cooler", "Refrigerator", "cooler", "cooler", { x:0, z:0 }, "iron_block");

(function(){
    let CollisionShape = new ICRender.CollisionShape();
    let Entry = CollisionShape.addEntry();
    Entry.addBox(0,0,0,1,2,1);

    BlockRenderer.setCustomCollisionShape(BlockID.cooler, -1, CollisionShape);
})()

TileEntity.registerPrototype(BlockID.cooler, {
    useNetworkItemContainer:true,
    getScreenName:function(){
        return "cooler";
    },
    getScreenByName:function(){
        var header = CoolerInterface.getWindow("header");
        header.contentProvider.drawing[2].text = Translation.translate("Refrigerator");
        
        return CoolerInterface;
    }
})




// file: cooler/interface.js

var CoolerInterface = (function(){
    let elements = {};
    for(let y = 0; y < 3; y++){
        for(let x = 0; x < 6; x++){
            elements["slot_"+x+"_"+y] = {
                type:"slot",
                x:400 + ( 75 * x),
                y:40 + ( 75 * y) + (y == 2 ? 30 : 0),
                size:75,
                bitmap:"cooler_slot"
            }
        }   
    }
    
    elements["image_1"] = {
        type:"image",
        bitmap:"ice_2",
        x:400,
        y:220,
        scale:7
    }

    elements["image_2"] = {
        type:"image",
        bitmap:"ice",
        x:400,
        y:295,
        scale:7
    }
    return new UI.StandartWindow({
        standart:{
            header: {
                text: {
                    text: "Refrigerator",
                },
                height: 80,
            },
            background: { color:android.graphics.Color.rgb(134, 217,220) },
            inventory: {
                width: 300,
                padding: 20
            },
        },
        elements:elements
    });
})()


Translation.addTranslation("Refrigerator", {
    "ru":"Холодильник"
});




// file: tv/tv.js

IDRegistry.genBlockID("tvbox");
Block.createBlockWithRotateAndModel("tvbox", "TV", "tv", "tv", { x:0, z:0 }, "iron_block");




// file: tardis/tardis.js

IDRegistry.genBlockID("tardis");
Block.createBlockWithRotateAndModel("tardis", "Tardis", "tardis", "tardis", { x:0, z:0 }, "tardis", false);
Block.setBlockMaterial("tardis", "unbreaking");

(function(){
    let CollisionShape = new ICRender.CollisionShape();
    let Entry = CollisionShape.addEntry();
    Entry.addBox(0,0,0,1,2,1);

    BlockRenderer.setCustomCollisionShape(BlockID.tardis, -1, CollisionShape);
})()

var Tardis = {
    spawned: false,
    player:new Sound("tardis.wav"),
    __pos:{},
    __blockSource:null,
    __getBlockSource:function(){
        if(Tardis.__blockSource == null)
            Tardis.__blockSource = BlockSource.getDefaultForDimension(Native.Dimension.NORMAL);
    },
    spawn:function(){
        Tardis.__pos = Player.getPosition();
        Tardis.__pos.x += Utils.random(-16, 17);
        Tardis.__pos.z += Utils.random(-16, 17);
        Tardis.__pos = GenerationUtils.findHighSurface(Tardis.__pos.x, Tardis.__pos.z);
        Tardis.__pos.y++;

        Tardis.__getBlockSource.setBlock(Tardis.__pos.x, Tardis.__pos.y, Tardis.__pos.z, BlockID.tardis);
        Network.sendToAllClients("retrowave.tardis.spawn", { position: Tardis.__pos });

        Tardis.spawned = true;
    },
    despawn:function(){
        Tardis.__getBlockSource.setBlock(Tardis.__pos.x, Tardis.__pos.y, Tardis.__pos.z, 0);
        Network.sendToAllClients("retrowave.tardis.despawn", {});
        Tardis.spawned = false;
    },
    tick:function(){
        let worldTime = World.getWorldTime();
        let dayTime = worldTime % 24000;
        
        if(DEBUG)
            ICGame.tipMessage("Time: " + worldTime + "(" + dayTime + ") ");

        if(Tardis.spawned){
            if(dayTime >= 23000){
                Tardis.despawn();
            }
        }else if(dayTime >= 17000 && dayTime < 20000){
            if(Utils.random(0, 1000) <= 1 || true){
                Tardis.spawn();
            }
        }
    }
};


Network.addClientPacket("retrowave.tardis.spawn", function(packetData) {
    if(DEBUG)
            Debug.message([packetData.position.x, packetData.position.y, packetData.position.z]);

    Tardis.player.setInBlock(packetData.position.x, packetData.position.y, packetData.position.z, 16);
    Tardis.player.play();
});
Network.addClientPacket("retrowave.tardis.despawn", function(packetData) {
    Tardis.player.play();
});
    

Saver.addSavesScope("RW_Tardis",
    function read(scope){
        Tardis.spawned = scope.spawned || false;
        Tardis.__pos = scope.posistion || {x:0, y:0, z:0} ;

        Tardis.player.setInBlock(Tardis.__pos.x, Tardis.__pos.y, Tardis.__pos.z, 16);
    },

    function save(){
        return {
            spawned:Tardis.spawned || false,
            position:Tardis.__pos || {x:0, y:0, z:0}
        };
    }
);

Callback.addCallback("tick", Tardis.tick);




// file: decor.js

IDRegistry.genBlockID("lenin");
Block.createBlockWithRotateAndModel("lenin", "Lenin's bust", "lena bl", "lena_bl", { x:.5, z:.5 });

IDRegistry.genBlockID("old_phone");
Block.createBlockWithRotateAndModel("old_phone", "Old Phone", "telePHon", "telePHon", { x:.5, z:.5 });




