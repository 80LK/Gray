/*
BUILD INFO:
  dir: dev/
  target: mod.js
  files: 11
*/



// header.js

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

var View = android.view.View;
var Popup = android.widget.PopupWindow;
var ctx = UI.getContext();

IMPORT("SoundAPI");




// radio/radio.js

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




// gramophone/block.js

IDRegistry.genBlockID("gramophone");
Block.createBlockWithRotateAndModel("gramophone", "Gramophone", "gramophone", "gramophone", { x:0, z:0 }, "iron_block");
var gramophoneOffset = [
    [0, 0],
    [0, 0],
    [1/**(10/16) */, 0],
    [0, 0]
];
TileEntity.registerPrototype(BlockID.gramophone, {
    defaultData:{
        disk:null,
        playing:false
    },
    init:function(){
        this.player = new Sound();
        this.offsetDisk = gramophoneOffset[World.getBlock(this.x, this.y, this.z).data];
        

        this.player.setInBlock(this.x, this.y, this.z, 5);
        this.player.setOnCompletion((function(){ this.data.playing = false; }).bind(this));

        this.__extraxtDisk = this.__extraxtDisk.bind(this);
        this.__insertDisk = this.__insertDisk.bind(this);

        
        //this.animate = new Animation.Item(this.x + this.offsetDisk[0], this.y + (3.5 / 16), this.z + this.offsetDisk[1]);
        this.animate = new Animation.Item(this.x + .5, this.y + (3.5 / 16), this.z + .5);
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
            Game.prevent();
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




// arcade/arcade.js

IDRegistry.genBlockID("arcade");
Block.createBlockWithRotateAndModel("arcade", "Arcade", "arcade", "arcade", { x:0, z:0 }, "planks");

(function(){
    let CollisionShape = new ICRender.CollisionShape();
    let Entry = CollisionShape.addEntry();
    Entry.addBox(0,0,0,1,1.5,1);
    
    BlockRenderer.setCustomCollisionShape(BlockID.arcade, -1, CollisionShape);
})()




// dendy/dendy.js

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




// cooler/cooler.js

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




// cooler/interface.js

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




// tv/tv.js

IDRegistry.genBlockID("tvbox");
Block.createBlockWithRotateAndModel("tvbox", "TV", "tv", "tv", { x:0, z:0 }, "iron_block");




// tardis/tardis.js

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
        Tardis.__pos.y = GenerationUtils.findHighSurface(Tardis.__pos.x, Tardis.__pos.z);
        
        World.setBlock(Tardis.__pos.x, Tardis.__pos.y, Tardis.__pos.z, BlockID.tardis);
        player.setInBlock(Tardis.__pos.x, Tardis.__pos.y, Tardis.__pos.z, 16);
        player.play();

        Tardis.spawned = true;
    },
    despawn:function(){
        World.setBlock(Tardis.__pos.x, Tardis.__pos.y, Tardis.__pos.z, 0);
        Tardis.spawned = false;
    }
};
Callback.addCallback("tick", function(){
    if(Tardis.spawned){
        if(World.getWorldTime() % 24000 >= 23000){
            Tardis.despawn();
        }
    }else if(World.getWorldTime() % 24000 >= 17000 && World.getWorldTime() % 24000 < 20000){
        if(Utils.random(0, 1000) <= 1){
            Tardis.spawn();
        }
    }
})




// decor.js

IDRegistry.genBlockID("lenin");
Block.createBlockWithRotateAndModel("lenin", "Lenin's bust", "lena bl", "lena_bl", { x:.5, z:.5 });

IDRegistry.genBlockID("old_phone");
Block.createBlockWithRotateAndModel("old_phone", "Old Phone", "telePHon", "telePHon", { x:.5, z:.5 });




// utils.js

const Utils = {
    random:function(min, max){
        if(min === undefined) min=0;
        if(max === undefined) max=min+10;

        return Math.floor((max-min) * Math.random() + min);
    }
}




