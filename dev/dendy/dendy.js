IDRegistry.genBlockID("dendy");
Block.createBlockWithRotateAndModel("dendy", "Dendy", "dendy", "dendy", { x:0, z:0 });

var DendyCartridgeMesh = (function(model){
    let mesh = new RenderMesh();
      mesh.importFromFile(__dir__ + "models/"+model+".obj", "obj", null);
      mesh.translate(.5,0,.5);
      
      return mesh;
})("cartridge");

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
    destroyBlock:function(){
        this.extractCartridge();
    },

    events:{
        init:function(){
            this.sendResponse("init", {
                data:this.tile.data,
                cartridge:this.data.cartridge
            });
        }
    },

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
            let t = this.animate.transform();
            if(this.data == 2 || this.data == 3)
                t.rotate(0, Math.PI/2, 0);

            if(this.data == 1){
                t.translate(2/16, 0, 7/16);
            }else if(this.data == 2){
                t.translate(2/16, 0, -9/16);
            }else if(this.data == 3){
                t.translate(0, 0, -1);
            }
        },
        extractCartridge:function(){
            this.animate.destroy();
        },
        load:function(){
            this.animate = new Animation.Base(this.x, this.y, this.z);
            this.animate.describe({
                mesh:DendyCartridgeMesh
            });

            this.sendPacket("init")
        },

        events:{
            init:function(data){
                this.data = data.data;
                if(data.cartridge)
                    this.insertCartridge(data.cartridge);
            },
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