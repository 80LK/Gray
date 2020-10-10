/*
BUILD INFO:
  dir: dev
  target: mod.js
  files: 13
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

Block.createBlockWithRotateAndModel = function(sid, name, model, texture, offset, blockTexture){
    if(typeof texture == "string")
        texture = {name:texture};
    
    if(texture.name == undefined)
      throw new Error("texture.name is undefined");

   if(blockTexture == undefined)
      blockTexture = texture.name;

   if(!offset) offset = {};

   Block.createBlockWithRotation(sid, [{
      name:name,
      texture: [[blockTexture, 0]],
      inCreative:true
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
   BitmapFactory = android.graphics.BitmapFactory;
   
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




// file: radio/radio.js

IDRegistry.genBlockID("radio");
Block.createBlockWithRotateAndModel("radio", "Radio", "radio", "radio", { x:.5, z:.5 }, "planks");

TileEntity.registerPrototype(BlockID.radio, {
    defaultValue:{
        playing:false
    },
    init:function(){
        this.soundPlayer = new Sound();
        this.soundPlayer.setInBlock(this.x, this.y, this.z, 5);
        this.soundPlayer.setOnCompletion((function(){
            if(this.data.playing){
                this.soundPlayer.setSource(RadioFiles[Utils.random(0, RadioFiles.length)]);
                this.soundPlayer.play();
            }
        }).bind(this))
    },
    click:function(){
        if(this.data.playing){
            this.soundPlayer.stop();
            this.data.playing = false;
        }else{
            this.soundPlayer.setSource(RadioFiles[Utils.random(0, RadioFiles.length)]);
            this.soundPlayer.play();

            this.data.playing = true;
        }
    }
});

var RadioFiles = (function(){
    let ret = [];
    let files = FileTools.GetListOfFiles(__dir__ + "sounds/radio/");

    for(let i in files)
        ret.push(__dir__+"sounds/radio/" + files[i].getName());

    return ret;
})();

ModAPI.registerAPI("RetroWaveRadio", {
    addFile:function(path){
        RadioFiles.push(path);
    },
    addFiles:function(paths){
        RadioFiles = RadioFiles.concat(paths);
    }
})




// file: gramophone/block.js

IDRegistry.genBlockID("gramophone");
Block.createBlockWithRotateAndModel("gramophone", "Gramophone", "gramophone", "gramophone", { x:0, z:0 }, "iron_block");
var gramophoneOffset = [
    [19/32, 19/32],
    [13/32, 13/32],
    [19/32, 13/32],
    [13/32, 19/32]
];
TileEntity.registerPrototype(BlockID.gramophone, {
    defaultData:{
        disk:null,
        playing:false
    },
    init:function(){
        this.player = new Sound();
        this.tile = World.getBlock(this.x, this.y, this.z);
        
        alert(this.tile.data);

        this.offsetDisk = gramophoneOffset[this.tile.data];
        

        this.player.setInBlock(this.x, this.y, this.z, 5);
        this.player.setOnCompletion((function(){ this.data.playing = false; }).bind(this));

        this.__extraxtDisk = this.__extraxtDisk.bind(this);
        this.__insertDisk = this.__insertDisk.bind(this);

        
        this.animate = new Animation.Item(this.x + this.offsetDisk[0], this.y + (3.5 / 16), this.z + this.offsetDisk[1]);
        //this.animate = new Animation.Item(this.x + .5, this.y + (3.5 / 16), this.z + .5);
        if(this.data.disk)
            this.__insertDisk(this.data.disk);
    },
    __insertDisk:function(id){
        this.data.disk = id;
        this.player.setSource(GramophoneDisks.getSource(this.data.disk));
        this.player.setSource(GramophoneDisks.getSource(id));
        this.data.rotate = 0;
        this.animate.describeItem({
            id: this.data.disk,
            count: 1,
            data: 0,
            size: 1,
            rotation: [Math.PI/2, 0, 0],
            notRandomize: true
        });
        this.animate.loadCustom((function(){
                if(!this.animate.translated && this.animate.transform()){
                    this.animate.translated = true;
                }

                if(this.data.playing){
                    this.animate.transform().rotate(0, 0, Math.PI/40);
                }
            }).bind(this));
    },
    __extraxtDisk:function(){
        if(this.data.disk != null){
            World.drop(this.x, this.y+1, this.z, this.data.disk, 1);            
            this.player.stop();
            this.data.disk = null;
            this.data.playing = false;
            this.animate.destroy();
            ICGame.prevent();
        }
    },
    click:function(id, count, data){
        
        if(Entity.getSneaking(Player.get())){
            this.__extraxtDisk();
            return;
        }
        if(GramophoneDisks.isDisk(id)){
            if(this.data.disk)
                this.__extraxtDisk();

            this.__insertDisk(id);
            Player.setCarriedItem(0,0,0);
            return;
        }
        
        if(this.data.playing){
            this.player.pause();
            this.data.playing = false;
        }else{
            this.player.play();
            this.data.playing = true;
        }
    },
    destroyBlock:function(){
        this.__extraxtDisk();
    }
});

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

var Arcade = {
    game:null,
    window:null
};

Arcade.window = (function(){
    let popup = new Popup();
    popup.setWidth(-1);
    popup.setHeight(-1);
    let surface, surfaceHolder;


    let thisWindow =  {
        open:function(){
            if(thisWindow.opened) return;
            runUI(function(){
                popup.showAtLocation(ctx.getWindow().getDecorView(), 51, 0, 0);
            });
            thisWindow.opened = true;
            new Thread(function(){
                var canvas = null;
                alert("Start draw");
                while (thisWindow.opened) {
                    canvas = null;
                    try {
                        canvas = surface.lockCanvas();
                        if (canvas == null) continue;

                        Arcade.game.draw(canvas);
                    } catch(e){
                        alert(e);
                        break;
                    }finally {
                        if (canvas != null)
                            surface.unlockCanvasAndPost(canvas);
                    }
                }
                alert("stop draw");
            }).start();
        },
        opened:false,
        close:function(){
            if(!thisWindow.opened) return;
        
            thisWindow.opened = false;
            runUI(function(){
                popup.dismiss();
            });
        }
    };
    

    let rootLayout = new RelativeLayout(ctx);
    rootLayout.setBackgroundDrawable((function(){
        let bitmap = new BitmapFactory.decodeFile(__dir__ + "gui/arcadeUI.png");
        bitmap = new Bitmap.createBitmap(bitmap, 0, 0, 64, 58);
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
    exitButton.setImageBitmap((function(){
        let bitmap = new BitmapFactory.decodeFile(__dir__ + "gui/arcadeUI.png");
        bitmap = new Bitmap.createBitmap(bitmap, 28, 63, 3, 3);
        return Bitmap.createScaledBitmap(bitmap, 3 * 8, 3 * 8, false);;
    })());
    exitButton.setOnClickListener(thisWindow.close);
    let exitButtonParams  = new RelativeLayout.LayoutParams(-2, -2);
    exitButtonParams.setMargins(0, 8 * 5, 8 * 5, 0);
    exitButtonParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
    rootLayout.addView(exitButton, exitButtonParams);

    let buttonControlUp = new ImageView(ctx);
    buttonControlUp.setImageBitmap((function(){
        let bitmap = new BitmapFactory.decodeFile(__dir__ + "gui/arcadeUI.png");
        bitmap = new Bitmap.createBitmap(bitmap, 21, 58, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);;
    })());
    buttonControlUp.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.UP)
    });
    let buttonControlUpParams  = new RelativeLayout.LayoutParams(-2, -2);
    buttonControlUpParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
    buttonControlUpParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
    buttonControlUpParams.setMargins(0, 0, 270, 8 * 2);
    rootLayout.addView(buttonControlUp, buttonControlUpParams);

    let buttonControlDown = new ImageView(ctx);
    buttonControlDown.setImageBitmap((function(){
        let bitmap = new BitmapFactory.decodeFile(__dir__ + "gui/arcadeUI.png");
        bitmap = new Bitmap.createBitmap(bitmap, 14, 58, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);;
    })());
    buttonControlDown.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.DOWN)
    });
    let buttonControlDownParams  = new RelativeLayout.LayoutParams(-2, -2);
    buttonControlDownParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
    buttonControlDownParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
    buttonControlDownParams.setMargins(0, 0, 150, 8 * 2);
    rootLayout.addView(buttonControlDown, buttonControlDownParams);

    let buttonControlLeft = new ImageView(ctx);
    buttonControlLeft.setImageBitmap((function(){
        let bitmap = new BitmapFactory.decodeFile(__dir__ + "gui/arcadeUI.png");
        bitmap = new Bitmap.createBitmap(bitmap, 0, 58, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);;
    })());
    buttonControlLeft.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.LEFT)
    });
    let buttonControlLeftParams  = new RelativeLayout.LayoutParams(-2, -2);
    buttonControlLeftParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
    buttonControlLeftParams.setMargins(150, 0, 0, 8 * 2);
    rootLayout.addView(buttonControlLeft, buttonControlLeftParams);

    let buttonControlRight = new ImageView(ctx);
    buttonControlRight.setImageBitmap((function(){
        let bitmap = new BitmapFactory.decodeFile(__dir__ + "gui/arcadeUI.png");
        bitmap = new Bitmap.createBitmap(bitmap, 7, 58, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);;
    })());
    buttonControlRight.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.RIGHT)
    });
    let buttonControlRightParams  = new RelativeLayout.LayoutParams(-2, -2);
    buttonControlRightParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
    buttonControlRightParams.setMargins(270, 0, 0, 8 * 2);
    rootLayout.addView(buttonControlRight, buttonControlRightParams);

    return thisWindow;
})();


Callback.addCallback("ItemUse", function(c, i, b){
    if(b.id == BlockID.arcade){
        ICGame.message("Open");
        Arcade.window.open();
        ICGame.prevent();
    }
});




// file: arcade/game.js

var Game = function (){
    this.elements = [];
    
    this.elements.push(new Game.UI.ItemList());
    this.elements[0].Select = true;

    this.AddHandlerControl(Game.CONTROLS.UP, function () { alert(Game.CONTROLS.UP) });
    this.AddHandlerControl(Game.CONTROLS.DOWN, function () { alert(Game.CONTROLS.DOWN) });
    this.AddHandlerControl(Game.CONTROLS.LEFT, function () { alert(Game.CONTROLS.LEFT) });
    this.AddHandlerControl(Game.CONTROLS.RIGHT, function () { alert(Game.CONTROLS.RIGHT) });
};
Game.prototype.AddHandlerControl = function (controls, event) {
    if (!this.__controls)
        this.__controls = [[], [], [], []];

    this.__controls[controls].push(event);
}
Game.prototype.invoke = function (control) {
    if (this.__controls === null) return;
    
    let events = this.__controls[control];
    for (let i in events) {
        events[i]();
    }
}
Game.prototype.name = "arcade_menu";
Game.prototype.toString = function(){
    return "Game[" + this.name + "]";
}
Game.prototype.__controls = null;
Game.prototype.draw = function (canvas) { 
    //Draw background
    canvas.drawColor(android.graphics.Color.BLACK);

    //Draw "No games"
    if(this.elements.length == 0){
        let bounds = new Rect();
        let textToDraw = "Игр не найдено"
        ArcadeMemu.MenuTextEmpty.getTextBounds(textToDraw, 0, textToDraw.length, bounds);
        return canvas.drawText(textToDraw, canvas.getWidth()/2, (canvas.getHeight()+(bounds.bottom-bounds.top))/2, ArcadeMemu.MenuTextEmpty); 
    }

    for(let i in this.elements)
        this.elements.draw(canvas);
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
Game.registerGame = function (name, _game) {
    if(Game.__list.hasOwnProperty(name))
        throw new Error("Game \""+name+"\" was been register.");

    var F = function(){};
    F.prototype = Game.prototype;
    _game.prototype = new F();
    _game.prototype.name = name;
    _game.prototype.constructor = _game;
    _game.superclass = Game.prototype;

    Game.__list[name] = new _game();
}

Game.UI = {};
Game.UI.extends = function (Child, Parent) {
    if(Parent === undefined)
        Parent = Game.UI.IVeiw;

    var F = function(){};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.name = name;
    Child.prototype.constructor = Child;

    Child.superclass = Parent.prototype;
}
Game.UI.IVeiw = function(){}
Game.UI.IVeiw.prototype.draw = function(){};

Game.UI.ItemList = function(){
    this.Font = new Paint();
    this.Font.setARGB(255, 255, 255, 255);
    this.Font.setTypeface(Game.Font);
    this.Paint = new Paint();
    this.Paint.setARGB(255, 255,0,0);
};
Game.UI.ItemList.__bitmap = (function(){
    let bitmap = new BitmapFactory.decodeFile(__dir__ + "gui/arcadeUI.png");
    return new Bitmap.createBitmap(bitmap, 28, 58, 3, 5);
})();
Game.UI.extends(Game.UI.ItemList);
Game.UI.ItemList.prototype.Text = "";
Game.UI.ItemList.prototype.Select = false;
Game.UI.ItemList.prototype.X = 0;
Game.UI.ItemList.prototype.Y = 0;
Game.UI.ItemList.prototype.draw = function(canvas){
    let padding = [10, 5];
    let bounds = new Rect();
    this.Font.getTextBounds(this.Text, 0, this.Text.length, bounds);
    let textHeight = bounds.bottom - bounds.top;
    if(this.Select)
        canvas.drawBitmap(Game.UI.ItemList.__bitmap,
            new Rect(0, 0, 3, 5),
            new Rect(this.X, this.Y, this.X + textHeight*.6, this.Y + textHeight), this.Paint);
    //canvas.drawText(this.Text, this.X + padding[0] + width/2, this.Y + padding[1] + (height+(bounds.bottom-bounds.top))/2, this.Font); 
}


Game.MenuGame = new Game();
Game.Font = android.graphics.Typeface.createFromFile(__dir__ + "gui/mc-typeface.ttf");

Arcade.game = Game.MenuGame;
var ArcadeMemu = {
    MenuTextEmpty:(function(){
        let paint = new Paint();
        paint.setARGB(255, 255, 255, 255);
        paint.setTextAlign(Paint.Align.CENTER);
        paint.setTypeface(Game.Font);
        paint.setTextSize(50);
        return paint;
    })()
};




// file: dendy/dendy.js

IDRegistry.genBlockID("dendy");
Block.createBlockWithRotateAndModel("dendy", "Dendy", "dendy", "dendy", { x:0, z:0 });

IDRegistry.genBlockID("dendy_green");
Block.createBlockWithRotateAndModel("dendy_green", "Dendy", "dendy_0", "dendy", { x:0, z:0 });

IDRegistry.genBlockID("dendy_yellow");
Block.createBlockWithRotateAndModel("dendy_yellow", "Dendy", "dendy_1", "dendy", { x:0, z:0 });
Callback.addCallback("ItemUse", function(coords, item, block){
    switch(block.id){
        case BlockID.dendy_green:
            World.drop(coords.x, coords.y+1, coords.z, ItemID.cartridge_green, 1);
            World.setBlock(coords.x, coords.y, coords.z, BlockID.dendy, block.data);
        break;
        case BlockID.dendy_yellow:
            World.drop(coords.x, coords.y+1, coords.z, ItemID.cartridge_yellow, 1);
            World.setBlock(coords.x, coords.y, coords.z, BlockID.dendy, block.data);
        break;
    }
});

IDRegistry.genItemID("cartridge_green");
Item.createItem("cartridge_green", "Cartridge", {name:"cartridge", data:0}, {stack: 1 });
Item.registerUseFunction("cartridge_green", function(coords, item, block){
    if(block.id == BlockID.dendy){
        Player.setCarriedItem(0,0,0);
        World.setBlock(coords.x, coords.y, coords.z, BlockID.dendy_green, block.data);
    }
});

IDRegistry.genItemID("cartridge_yellow");
Item.createItem("cartridge_yellow", "Cartridge", {name:"cartridge", data:1}, {stack: 1 });
Item.registerUseFunction("cartridge_yellow", function(coords, item, block){
    if(block.id == BlockID.dendy){
        Player.setCarriedItem(0,0,0);
        World.setBlock(coords.x, coords.y, coords.z, BlockID.dendy_yellow, block.data);
    }
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
    getGuiScreen:function(){
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
                    text: "Холодос",
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




// file: tv/tv.js

IDRegistry.genBlockID("tvbox");
Block.createBlockWithRotateAndModel("tvbox", "TV", "tv", "tv", { x:0, z:0 }, "iron_block");




// file: tardis/tardis.js

IDRegistry.genBlockID("tardis");
Block.createBlockWithRotateAndModel("tardis", "Tardis", "tardis", "tardis", { x:0, z:0 });

(function(){
    let CollisionShape = new ICRender.CollisionShape();
    let Entry = CollisionShape.addEntry();
    Entry.addBox(0,0,0,1,2,1);

    BlockRenderer.setCustomCollisionShape(BlockID.cooler, -1, CollisionShape);
})()

var Tardis = {
    spawned: false,
    player:new Sound("tardis.wav"),
    __pos:{},
    spawn:function(){
        Tardis.__pos = Player.getPosition();
        Tardis.__pos.x += Utils.random(-16, 17);
        Tardis.__pos.z += Utils.random(-16, 17);
        Tardis.__pos = GenerationUtils.findHighSurface(Tardis.__pos.x, Tardis.__pos.z);
        
        World.setBlock(Tardis.__pos.x, Tardis.__pos.y, Tardis.__pos.z, BlockID.tardis);
        Tardis.player.setInBlock(Tardis.__pos.x, Tardis.__pos.y, Tardis.__pos.z, 16);
        Tardis.player.play();

        Debug.message([Tardis.__pos.x, Tardis.__pos.y, Tardis.__pos.z]);

        Tardis.spawned = true;
    },
    despawn:function(){
        World.setBlock(Tardis.__pos.x, Tardis.__pos.y, Tardis.__pos.z, 0);
        Tardis.spawned = false;
    },
    tick:function(){
        if(Tardis.spawned){
            if(World.getWorldTime() % 24000 >= 23000){
                Tardis.despawn();
            }
        }else if(World.getWorldTime() % 24000 >= 17000 && World.getWorldTime() % 24000 < 20000){
            if(Utils.random(0, 1000) <= 1 || true){
                Tardis.spawn();
            }
        }
    }
};

Saver.addSavesScope("RW_Tardis",
    function read(scope){
        Tardis.spawned = scope.spawned || false;
        Tardis.__pos = scope.posistion || {x:0, y:0, z:0};

        Tardis.player.setInBlock(Tardis.__pos.x, Tardis.__pos.y, Tardis.__pos.z, 16);
    },

    function save(){
        return {
            spawned:Tardis.spawned || false,
            position:Tardis.__pos || {x:0, y:0, z:0}
        };
    }
);




// file: decor.js

IDRegistry.genBlockID("lenin");
Block.createBlockWithRotateAndModel("lenin", "Lenin's bust", "lena bl", "lena_bl", { x:.5, z:.5 });

IDRegistry.genBlockID("old_phone");
Block.createBlockWithRotateAndModel("old_phone", "Old Phone", "telePHon", "telePHon", { x:.5, z:.5 });




// file: utils.js

const Utils = {
    random:function(min, max){
        if(min === undefined) min=0;
        if(max === undefined) max=min+10;

        return Math.floor((max-min) * Math.random() + min);
    }
}




