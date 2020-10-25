/*
BUILD INFO:
  dir: dev
  target: mod.js
  files: 23
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
   JavaArray = java.lang.reflect.Array
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
    },
    extends: function(Child, Parent){
        var F = function(){};
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
        
        //Child.prototype.superclass =
        Child.superclass = Parent.prototype;
    }
}




// file: Textures.js

var Textures = {
    __bitmaps:{},
    getBitmap:function(dir){
        if(!this.__bitmaps.hasOwnProperty(dir))
            this.__bitmaps[dir] = new BitmapFactory.decodeFile(dir);

        return this.__bitmaps[dir];
    },
    parseJSON:function(json){
        return this.parseObj(JSON.parse(json));
    },
    parseObj:function(obj){
        let bitmap = this.getBitmap(obj.file);
        bitmap = new Bitmap.createBitmap(bitmap, obj.bitmap.x, obj.bitmap.y, obj.bitmap.width, obj.bitmap.height);
        bitmap = Bitmap.createScaledBitmap(bitmap, obj.bitmap.width * obj.scale, obj.bitmap.height * obj.scale, false);
        if(obj.ninePatch)
            return this.createNinePatch(bitmap, obj.ninePatch.x.map(function(i){return i*obj.scale}),
                                    obj.ninePatch.y.map(function(i){return i*obj.scale}));
        
        return bitmap;
    },

    setStateImageButton(view, normal, pressed){
        view.setOnTouchListener(function(b, c){
            var f = c.getActionMasked();
            if (f == MotionEvent.ACTION_DOWN) {
                b.setImageBitmap(pressed);
            }
            if (f == MotionEvent.ACTION_CANCEL || f == MotionEvent.ACTION_UP) {
                b.setImageBitmap(normal);
            }
            return false;
        })
    },
    createNinePatch:function(bitmap, x, y, c){
        let xL = x.length, yL = y.length, cL = (xL+1) * (yL+1);
        if(c == undefined){
            c = [];
            for(let i = 0; i < cL; i++)
                c.push(1);
        }
        
        if(c.length != cL)
            throw new RangeError();

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
           a.putInt(c[i]);
        
        return new NinePatchDrawable(ctx.getResources(), bitmap, a.array(), new Rect(), "")

    }
}

/*
{
    file:__dir__ + "gui/arcadeUI.png",
    bitmap:{
        x:0,
        y:0,
        width:64,
        height:58
    },
    ninePatch:{
        x:[23, 24, 40, 41],
        y:[5, 37]
    },
    scale:8
}


let bitmap = new Bitmap.createBitmap(ArcadeUIBitmap, 0, 0, 64, 58);
    bitmap = Bitmap.createScaledBitmap(bitmap, 64 * 8, 58 * 8, false);
    return 

*/




// file: radio/API.js

var __RadioAPI = {
    mod:"NoNameAddon",
    files:[],
    length:0,
    addFile:function(sid, path){
        this.files.push(Sound.registerNetworkFile("RetroWave_Radio_" + sid, path));
        this.length++;
    },
    init:function(){
        let path = __dir__ + "sounds/radio/";
        let files = FileTools.GetListOfFiles(path);
        for(let i in files)
        this.addFile(files[i].getName(), path + files[i].getName());
    },
    getFile:function(){
        let i;
        do{ i = Utils.random(0, this.length); }while(i == this.index);
        this.index = i;
        return this.files[this.index];
    }
};
var RadioAPI = {
    init:function(name_mod){
        __RadioAPI.mod = name_mod;
    },
    addFile:function(path){
        __RadioAPI.addFile(__RadioAPI.mod + "_" + (new java.io.File(path)).getName(), path);
    },
    addFiles:function(paths){
        paths.map(this.addFile);
    }
}
ModAPI.registerAPI("RetroWaveRadio", RadioAPI);
__RadioAPI.init();




// file: radio/radio.js

IDRegistry.genBlockID("radio");
Block.createBlockWithRotateAndModel("radio", "Radio", "radio", "radio", { x:.5, z:.5 }, "planks");

Sound.registerTileEntity(BlockID.radio, {
    init:function(){
        this.SetSource(__RadioAPI.getFile());
    },
    OnCompletion:function(){
        this.SetSource(__RadioAPI.getFile());
        if(this.isPlaying())
            this.Play();
    },
    isPlaying:function(){
        return this.networkData.getBoolean("playing", false);
    },
    click:function(){
        let playing = this.isPlaying();
        
        this.networkData.putBoolean("playing", !playing);
        this.networkData.sendChanges();
        
        if(playing){
            this.Stop(true);
        }else{
            this.Play();
        }
    }
});




// file: gramophone/block.js

IDRegistry.genBlockID("gramophone");
Block.createBlockWithRotateAndModel("gramophone", "Gramophone", "gramophone", "gramophone", { x:0, z:0 }, "iron_block");

var gramophoneOffset = [
    [19/32, 19/32],
    [13/32, 13/32],
    [19/32, 13/32],
    [13/32, 19/32]
];
Sound.registerTileEntity(BlockID.gramophone, {
    defaultValues:{
        disk:null
    },
    insertDisk:function(id){
        this.data.disk = id;
        this.sendPacket("insert", {disk:id});
    },
    extractDisk:function(){
        if(this.data.disk != null){
            this.blockSource.spawnDroppedItem(this.x, this.y+1, this.z, this.data.disk, 1, 0, null);
            this.data.disk = null;
            this.Stop();
            this.sendPacket("extract");
            ICGame.prevent();
        }
    },

    init:function(){
        this.tile = this.blockSource.getBlock(this.x, this.y, this.z);
    },
    click:function(id, count, data, coords, client){
        if(Entity.getSneaking(client)){
            this.extractDisk();
            return;
        }
        if(GramophoneDisks.isDisk(id)){
            if(this.data.disk)
                this.extractDisk();

            this.insertDisk(id);
            Entity.setCarriedItem(client, 0,0,0);
            return;
        }

        if(this.IsPlaying())
            this.Pause();
        else
            this.Play();
    },
    destroyBlock:function(){
        this.extractDisk();
    },

    events:{
        init:function(){
            this.sendResponse("init", {
                disk:this.data.disk,
                data:this.tile.data
            });
        }
    },

    client:{
        insertDisk:function(id){
            if(!id) return;
            
            id = Network.serverToLocalId(id);
            
            this.__soundPlayer.setSource(GramophoneDisks.getSource(id));
            
            this.animate.describeItem({
                id: id,
                count: 1,
                data: 0,
                size: 1,
                rotation: [Math.PI/2, 0, 0],
                notRandomize: true
            });

            this.animate.loadCustom((function(){
                let transform = this.animate.transform();

                if(transform && this.__soundPlayer.isPlaying())
                    transform.rotate(0, 0, Math.PI/40);
            }).bind(this));
        },
        extractDisk:function(){
            this.animate.destroy();
        },

        load:function(){
            this.animate = new Animation.Item(this.x, this.y, this.z);
            this.sendPacket("init");
        },

        events:{
            init:function(data){
                this.insertDisk(data.disk);
                this.offsetDisk = gramophoneOffset[data.data];
                this.animate.setPos(this.x + this.offsetDisk[0], this.y + (3.5 / 16), this.z + this.offsetDisk[1]);
            },
            insert:function(data){
                this.insertDisk(data.disk);
            },
            extract:function(){
                this.extractDisk();
            }
        }
    }
});




// file: gramophone/API.js

var GramophoneDisksPrivate = {
    disks:{},
};

var GramophoneDisks = {
    registerDisk:function(id, file){
        if(GramophoneDisksPrivate.hasOwnProperty(id))
            throw new Error("Disk with id "+id+" was been registered");
            
        GramophoneDisksPrivate[id] = file;
    },
    isDisk:function(id){
        return GramophoneDisksPrivate.hasOwnProperty(id);
    },
    getSource:function(id){
        return GramophoneDisksPrivate[id];
    }
};

ModAPI.registerAPI("RetroWaveGramophone", GramophoneDisks);




// file: gramophone/mainDisks.js

GramophoneDisks.registerDisk(500, __dir__ + "sounds/disks/13.oga");
GramophoneDisks.registerDisk(501, __dir__ + "sounds/disks/Cat.oga");
GramophoneDisks.registerDisk(502, __dir__ + "sounds/disks/Blocks.oga");
GramophoneDisks.registerDisk(503, __dir__ + "sounds/disks/Chirp.oga");
GramophoneDisks.registerDisk(504, __dir__ + "sounds/disks/Far.oga");
GramophoneDisks.registerDisk(505, __dir__ + "sounds/disks/Mall.oga");
GramophoneDisks.registerDisk(506, __dir__ + "sounds/disks/Mellohi.oga");
GramophoneDisks.registerDisk(507, __dir__ + "sounds/disks/Stal.oga");
GramophoneDisks.registerDisk(508, __dir__ + "sounds/disks/Strad.oga");
GramophoneDisks.registerDisk(509, __dir__ + "sounds/disks/Ward.oga");
GramophoneDisks.registerDisk(510, __dir__ + "sounds/disks/11.oga");
GramophoneDisks.registerDisk(511, __dir__ + "sounds/disks/Wait.oga");
GramophoneDisks.registerDisk(759, __dir__ + "sounds/disks/Pigstep.ogg");




// file: games/game.js

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




// file: games/window.js

Game.BaseWindow = function(settings){
    this.game = null;

    this.__popup = new Popup();
    this.__popup.setWidth(-1);
    this.__popup.setHeight(-1);

    this.rootView = new RelativeLayout(ctx);
    this.rootView.setBackgroundDrawable(Textures.parseObj(settings.window));
    this.__popup.setContentView(this.rootView);

    this.__surface = new android.view.TextureView(ctx);
    var surfaceParams = new RelativeLayout.LayoutParams(-1, -1);
    surfaceParams.setMargins(
        settings.window.border[0] * settings.window.scale,
        settings.window.border[1] * settings.window.scale,
        settings.window.border[2] * settings.window.scale,
        settings.window.border[3] * settings.window.scale);
    this.rootView.addView(this.__surface, surfaceParams);

    

    let exitNormal = Textures.parseObj(settings.exit.default),
        exitPressed = Textures.parseObj(settings.exit.pressed);

    let exit = new ImageView(ctx);
    exit.setImageBitmap(exitNormal);
    Textures.setStateImageButton(exit, exitNormal, exitPressed);

    let exitButtonParams  = new RelativeLayout.LayoutParams(-2, -2);
    exitButtonParams.setMargins(settings.exit.x, settings.exit.y, settings.exit.x, settings.exit.y);
    settings.exit.rules.map(function(i){ exitButtonParams.addRule(i); });
    this.rootView.addView(exit, exitButtonParams);
    
    if(settings.exit.onClick)
        this.__OnExit = settings.exit.onClick;
    
        let fClose = this.close.bind(this);
    exit.setOnClickListener(function(){
        fClose();
    });
    
    if(settings.game){
        if(settings.game instanceof Game){
            this.game = settings.game;
        } else if(settings.game.prototype.constructor){
            let game = new settings.game();
            if(game instanceof Game)
                this.game = game;
        }
    }

    this.__thread = this.__thread.bind(this);
}
Game.BaseWindow.prototype.rootView = null;
Game.BaseWindow.prototype.__surface = null;
Game.BaseWindow.prototype.game = null;
Game.BaseWindow.prototype.__popup = null;
Game.BaseWindow.prototype.__opened = false;
Game.BaseWindow.prototype.__drawing = false;
Game.BaseWindow.prototype.__errorBG = Color.BLUE;
Game.BaseWindow.prototype.__errorFont = (function(){
    let p = new Paint();
    p.setColor(Color.WHITE);
    p.setTypeface(Game.UI.Typeface);
    p.setTextSize(20);
    return p;
})();
Game.BaseWindow.prototype.__OnExit = function(){};
Game.BaseWindow.prototype.isOpened = function(){
    return this.__opened;
};
Game.BaseWindow.prototype.open = function(){
    if(!this.game instanceof Game)
        throw new TypeError();
    
    if(this.isOpened()) return;
    runUI((function(){
        this.__popup.showAtLocation(ctx.getWindow().getDecorView(), 51, 0, 0);
    }).bind(this));
    this.__opened = true;
    
    var a = this.__thread;
    (new Thread((function(ctx){
        return function(){
            ctx.__thread();
        }
    })(this))).start();
};
Game.BaseWindow.prototype.__thread = function(){
    var canvas = null,
        currentTime = 0,
        lastTime = System.currentTimeMillis();

    this.__drawing = true;
    while (this.__opened) {
        canvas = null;
        try{
            canvas = this.__surface.lockCanvas();
            if (canvas == null) continue;

            try{
                currentTime = System.currentTimeMillis();
                this.game.tick((currentTime - lastTime)/1000);
    
                this.game.draw(canvas);
            }catch(e){
                this.game.close();
                canvas.drawColor(this.__errorBG);
                let message = e.name + ":" + e.message + "(" + e.fileName + "#" + e.lineNumber + ")";
                if(e.stack)
                    message += "\n" + e.stack;
                message = message.split("\n");

                let rect = new Rect();
                this.__errorFont.getTextBounds(message[0], 0, message[0].length, rect);
                let height = rect.bottom - rect.top;

                for(let i = 0, l = message.length; i < l; ){
                    canvas.drawText(message[i], 10, (10 + height) * (++i), this.__errorFont);
                }
                break;
            }finally{
                this.__surface.unlockCanvasAndPost(canvas);
                lastTime = currentTime;
            }
        }catch(e){
            alert(e);
            break;
        }
    }
    this.__drawing = false;
};
Game.BaseWindow.prototype.close = function(){
    if(!this.isOpened()) return;

    this.__opened = false;
    while(this.__drawing){}
    if(this.game)
        this.game.close();

    this.__OnExit();
    runUI((function(){
        this.__popup.dismiss();
    }).bind(this));
};

Game.StandardWindow = function(settings){
    Game.StandardWindow.superclass.constructor.apply(this, arguments);
    //Left
    let leftNormal = Textures.parseObj(settings.left.default),
        leftPressed = Textures.parseObj(settings.left.pressed);

    let left = new ImageView(ctx);
    left.setImageBitmap(leftNormal);
    left.setOnClickListener((function(ctx){
        return function(){
            ctx.game.invoke(Game.CONTROLS.LEFT)
        }
    })(this))
    Textures.setStateImageButton(left, leftNormal, leftPressed);

    let leftButtonParams  = new RelativeLayout.LayoutParams(-2, -2);
    leftButtonParams.setMargins(settings.left.x, settings.left.y, settings.left.x, settings.left.y);
    settings.left.rules.map(function(i){ leftButtonParams.addRule(i); });
    this.rootView.addView(left, leftButtonParams);

    // Right
    let rightNormal = Textures.parseObj(settings.right.default),
        rightPressed = Textures.parseObj(settings.right.pressed);

    let right = new ImageView(ctx);
    right.setImageBitmap(rightNormal);
    right.setOnClickListener((function(ctx){
        return function(){
            ctx.game.invoke(Game.CONTROLS.RIGHT)
        }
    })(this))
    Textures.setStateImageButton(right, rightNormal, rightPressed);

    let rightButtonParams  = new RelativeLayout.LayoutParams(-2, -2);
    rightButtonParams.setMargins(settings.right.x, settings.right.y, settings.right.x, settings.right.y);
    settings.right.rules.map(function(i){ rightButtonParams.addRule(i); });
    this.rootView.addView(right, rightButtonParams);

    //Up
    let upNormal = Textures.parseObj(settings.up.default),
        upPressed = Textures.parseObj(settings.up.pressed);

    let up = new ImageView(ctx);
    up.setImageBitmap(upNormal);
    up.setOnClickListener((function(ctx){
        return function(){
            ctx.game.invoke(Game.CONTROLS.UP)
        }
    })(this))
    Textures.setStateImageButton(up, upNormal, upPressed);

    let upButtonParams  = new RelativeLayout.LayoutParams(-2, -2);
    upButtonParams.setMargins(settings.up.x, settings.up.y, settings.up.x, settings.up.y);
    settings.up.rules.map(function(i){ upButtonParams.addRule(i); });
    this.rootView.addView(up, upButtonParams);

    //Down
    let downNormal = Textures.parseObj(settings.down.default),
        downPressed = Textures.parseObj(settings.down.pressed);

    let down = new ImageView(ctx);
    down.setImageBitmap(downNormal);
    down.setOnClickListener((function(ctx){
        return function(){
            ctx.game.invoke(Game.CONTROLS.DOWN)
        }
    })(this))
    Textures.setStateImageButton(down, downNormal, downPressed);

    let downButtonParams  = new RelativeLayout.LayoutParams(-2, -2);
    downButtonParams.setMargins(settings.down.x, settings.down.y, settings.down.x, settings.down.y);
    settings.down.rules.map(function(i){ downButtonParams.addRule(i); });
    this.rootView.addView(down, downButtonParams);

}; Utils.extends(Game.StandardWindow, Game.BaseWindow);




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

var ArcadeWindow = new Game.StandardWindow({
    window:{
        file:__dir__ + "gui/arcadeUI.png",
        bitmap:{
            x:0,
            y:0,
            width:64,
            height:58
        },
        ninePatch:{
            x:[23, 24, 40, 41],
            y:[5, 37]
        },
        scale:8,
        border:[16, 5, 16, 21]
    },
    exit:{
        default:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:15,
            bitmap:{
                x:28,
                y:63,
                width:3,
                height:3
            }
        },
        pressed:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:15,
            bitmap:{
                x:28,
                y:66,
                width:3,
                height:3
            }
        },
        rules:[RelativeLayout.ALIGN_PARENT_RIGHT],
        x:8 * 5,
        y:8 * 5,
        onClick:function(){
            this.game = new ArcadeMenu();
        }
    },
    left:{
        default:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:0,
                y:58,
                width: 7, 
                height: 7
            }
        },
        pressed:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:0,
                y:65,
                width: 7, 
                height: 7
            }
        },
        rules:[RelativeLayout.ALIGN_PARENT_BOTTOM],
        x:150,
        y:8 * 2
    },
    right:{
        default:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:7,
                y:58,
                width: 7, 
                height: 7
            }
        },
        pressed:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:7,
                y:65,
                width: 7, 
                height: 7
            }
        },
        rules:[RelativeLayout.ALIGN_PARENT_BOTTOM],
        x:270,
        y:8 * 2
    },
    up:{
        default:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:21,
                y:58,
                width: 7, 
                height: 7
            }
        },
        pressed:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:21,
                y:65,
                width: 7, 
                height: 7
            }
        },
        rules:[RelativeLayout.ALIGN_PARENT_BOTTOM, RelativeLayout.ALIGN_PARENT_RIGHT],
        x:270,
        y:8 * 2
    },
    down:{
        default:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:14,
                y:58,
                width: 7, 
                height: 7
            }
        },
        pressed:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:14,
                y:65,
                width: 7, 
                height: 7
            }
        },
        rules:[RelativeLayout.ALIGN_PARENT_BOTTOM, RelativeLayout.ALIGN_PARENT_RIGHT],
        x:150,
        y:8 * 2
    },
});
Callback.addCallback("PostLoaded", function(){
    ArcadeWindow.game = new ArcadeMenu();
});


Callback.addCallback("ItemUse", function(c, i, b){
    if(b.id == BlockID.arcade){
        ArcadeWindow.open();
        ICGame.prevent();
    }
});




// file: dendy/API.js

var Dendy = {
    list:{},
    items:{},
    registerCartridge:function(sid, game, texture){
        if(Dendy.existCartridge(sid))
            throw new Error("Данный sid уже был зарегистрирован");
        texture.color = texture.color || Color.YELLOW;
        Dendy.list[sid] = {
            game:game,
            texture:texture
        };
        Dendy.items[ItemID["cartridge_" + sid]] = Dendy.list[sid];
    },
    existCartridge:function(sid){
        return Dendy.list.hasOwnProperty(sid);
    },
    isCartridge:function(id){
        return Dendy.items.hasOwnProperty(id);
    },
    getGameFromID:function(id){
        if(Dendy.isCartridge(id))
            return Dendy.items[id].game;
        
        return null;
    }
};

Game.registerCartridge = function(game, name, texture){
    let sid = game.prototype.sid;
    let item_sid = "cartridge_" + sid;
    if(Dendy.existCartridge(sid))
        throw new Error("Данный sid уже был зарегистрирован");

    IDRegistry.genItemID(item_sid);
    Item.createItem(item_sid, "Cartridge \""+name+"\"", texture, {stack: 1 });
    Dendy.registerCartridge(sid, game, texture.color);
}
Game.isCartridge = Dendy.isCartridge;




// file: dendy/nogame.js

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




// file: dendy/window.js

Dendy.Window = function(settings){
    Dendy.Window.superclass.constructor.apply(this, arguments);
    this.__cartridgeView = new RelativeLayout(ctx);
    
    //settings.cartridge
    let params  = new RelativeLayout.LayoutParams(
        settings.cartridge.width * settings.cartridge.scale,
        settings.cartridge.height * settings.cartridge.scale);
    params.setMargins(
        settings.cartridge.x,
        settings.cartridge.y,
        settings.cartridge.x,
        settings.cartridge.y);
    settings.cartridge.rules.map(function(i){ params.addRule(i); });
    this.rootView.addView(this.__cartridgeView, params);

}; Utils.extends(Dendy.Window, Game.StandardWindow);
Dendy.Window.prototype.setColorCartridge = function(color){
    this.__cartridgeView.setBackgroundColor(color);
}
Dendy.Window.prototype.open = function(id){
    if(!Dendy.isCartridge(id))
        throw new Error("Its not cartridge");
    
    let cartridge = Dendy.items[id];

    this.game = new cartridge.game();
    this.setColorCartridge(cartridge.texture.color);
    
    Dendy.Window.superclass.open.apply(this, arguments);
}




// file: dendy/dendy.js

IDRegistry.genBlockID("dendy");
Block.createBlockWithRotateAndModel("dendy", "Dendy", "dendy", "dendy", { x:0, z:0 });

var DendyCartridgeRender = (function(){
    let render = new Render();
    let part = render.getPart("body");
    part.addBox(5, 20, -6, 4, 3, 1);
    return render;
})();

TileEntity.registerPrototype(BlockID.dendy, {
    defaultValues:{
        cartridge:null
    },
    sendPacketFor:function(ent, name, data){
        this.networkEntity.send(Network.getClientForPlayer(ent), name, data);
    },

    hasCartridge:function(){
        return this.data.cartridge != null;
    },
    insertCartridge:function(id, player){
        if(this.hasCartridge()) return;

        this.data.cartridge = id;
        this.sendPacket("insert", {cartridge:id})
        Entity.setCarriedItem(player, 0,0,0);
    },
    extractCartridge:function(){
        if(!this.hasCartridge()) return;

        this.blockSource.spawnDroppedItem(this.x, this.y+1, this.z, this.data.cartridge, 1, 0, null);
        this.data.cartridge = null;
        this.sendPacket("extract")
    },
    checkTVBox:function(){
        for(let x = -1; x <= 1; x++)
            for(let y = -1; y <= 1; y++)
                for(let z = -1; z <= 1; z++)
                    if(this.blockSource.getBlockId(this.x + x, this.y + y, this.z + z) == BlockID.tvbox)
                        return true;

        return false;
    },

    init:function(){
        this.tile = this.blockSource.getBlock(this.x, this.y, this.z);
        alert(this.tile.data);
    },
    click:function(id, count, data, coords, player){
        if(Entity.getSneaking(player)){
            this.extractCartridge();
            return;
        }

        if(Game.isCartridge(id)){
            if(this.hasCartridge())
                this.extractCartridge();

            this.insertCartridge(id, player);
            return;
        }

        if(this.checkTVBox())
            this.sendPacketFor(player, "open", {cartridge:this.data.cartridge});

        ICGame.prevent();
    },

    tick:function(){
        ICGame.tipMessage("Cartridge: " + this.data.cartridge);
    },
    destroyBlock:function(){
        this.extractCartridge();
    },

    events:{},

    client:{
        insertCartridge:function(id){
            id = id ? Network.serverToLocalId(id) : null;

            let cartridge = Dendy.items[id];
            let pixels = JavaArray.newInstance(java.lang.Integer.TYPE, 1);
            pixels[0] = cartridge.texture.color;

            this.animate.describe({
                skin:"terrain-atlas/" + cartridge.texture.name + "_" + (cartridge.texture.meta || 0) + ".png"
            });
            this.animate.load();
        },
        extractCartridge:function(){
            this.animate.destroy();
        },
        load:function(){
            this.animate = new Animation.Base(this.x, this.y, this.z);
            this.animate.describe({
                render:DendyCartridgeRender.getRenderType()
            });
        },

        events:{
            open:function(data){
                let id = data.cartridge;
                
                id = id ? Network.serverToLocalId(id) : null;

                DendyWindow.open(id);
            },
            insert:function(data){
                this.insertCartridge(data.cartridge);
            },
            extract:function(){
                this.extractCartridge();
            }
        }
    }
});

var DendyWindow = new Dendy.Window({
    window:{
        file:__dir__ + "gui/arcadeUI.png",
        bitmap:{
            x:64,
            y:0,
            width:64,
            height:64
        },
        ninePatch:{
            x:[25, 26, 38, 39],
            y:[3, 32]
        },
        scale:8,
        border:[16, 3, 16, 29]
    },
    exit:{
        default:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:31,
                y:58,
                width:9,
                height:9
            }
        },
        pressed:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:31,
                y:67,
                width:9,
                height:9
            }
        },
        rules:[RelativeLayout.ALIGN_PARENT_RIGHT],
        x:8 * 3,
        y:8 * 3
    },
    left:{
        default:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:0,
                y:72,
                width: 7, 
                height: 7
            }
        },
        pressed:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:0,
                y:79,
                width: 7, 
                height: 7
            }
        },
        rules:[RelativeLayout.ALIGN_PARENT_BOTTOM],
        x:8 * 4,
        y:8 * 2
    },
    right:{
        default:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:7,
                y:72,
                width: 7, 
                height: 7
            }
        },
        pressed:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:7,
                y:79,
                width: 7, 
                height: 7
            }
        },
        rules:[RelativeLayout.ALIGN_PARENT_BOTTOM],
        x:8 * 16,
        y:8 * 2
    },
    up:{
        default:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:21,
                y:72,
                width: 7, 
                height: 7
            }
        },
        pressed:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:21,
                y:79,
                width: 7, 
                height: 7
            }
        },
        rules:[RelativeLayout.ALIGN_PARENT_BOTTOM, RelativeLayout.ALIGN_PARENT_RIGHT],
        x:8 * 16,
        y:8 * 2
    },
    down:{
        default:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:14,
                y:72,
                width: 7, 
                height: 7
            }
        },
        pressed:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:14,
                y:79,
                width: 7, 
                height: 7
            }
        },
        rules:[RelativeLayout.ALIGN_PARENT_BOTTOM, RelativeLayout.ALIGN_PARENT_RIGHT],
        x:8 * 4,
        y:8 * 2
    },
    cartridge:{
        width:4,
        height:2,
        scale:8,
        rules:[RelativeLayout.ALIGN_PARENT_BOTTOM, RelativeLayout.CENTER_HORIZONTAL],
        y:160, x:0
    },
    game:Dendy.NoGame
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

        return Tardis.__blockSource;
    },
    spawn:function(){
        Tardis.__pos = Player.getPosition();
        Tardis.__pos.x += Utils.random(-16, 17);
        Tardis.__pos.z += Utils.random(-16, 17);
        Tardis.__pos = GenerationUtils.findHighSurface(Tardis.__pos.x, Tardis.__pos.z);
        Tardis.__pos.y++;

        Tardis.__getBlockSource().setBlock(Tardis.__pos.x, Tardis.__pos.y, Tardis.__pos.z, BlockID.tardis);
        Network.sendToAllClients("retrowave.tardis.spawn", { position: Tardis.__pos });

        Tardis.spawned = true;
    },
    despawn:function(){
        Tardis.__getBlockSource().setBlock(Tardis.__pos.x, Tardis.__pos.y, Tardis.__pos.z, 0);
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
            if(Utils.random(0, 1000) <= 1 || DEBUG){
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




