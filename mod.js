/*
BUILD INFO:
  dir: dev/
  target: mod.js
  files: 10
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
        this.soundPlayer.setInBlock(this.x, this.y, this.z, 16);
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

    for(let i = files.length - 1; i <= 0; i-- )
        ret.push(new String(__dir__+"sounds/radio/" + files[i].getName()));

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
        Tardis.__pos.x += Util.random(-16, 17);
        Tardis.__pos.z += Util.random(-16, 17);
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
        if(Utility.random(0, 1000) <= 1){
            Tardis.spawn();
        }
    }
})




// decor.js

IDRegistry.genBlockID("lenin");
Block.createBlockWithRotateAndModel("lenin", "Lenin's bust", "lena bl", "lena_bl", { x:.5, z:.5 });




// utils.js

const Utils = {
    random:function(min, max){
        if(min === undefined) min=0;
        if(max === undefined) max=min+10;

        return Math.floor((max-min) * Math.random() + min);
    }
}




