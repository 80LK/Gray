var cupOffset = [
    [1, 0, 0, 1],
    [1, 0, 0, -1],
    [0, 1, 1, 0],
    [0, -1, 1, 0]
];
//var cupRotatte = [];

var meshBox = getMesh("box");
var liquidMehs = getMesh("cup_liquid");

const EMPTY = 0;
const WITH_CUP = 1;
const LOAD = 2;
const WITH_FULL_CUP = 3;

TileEntity.registerPrototype(BlockID.kvass_barrel, {
    defaultValues:{state:EMPTY},
    extractCup:function(){
        this.sendPacket("extractCup");
        this.blockSource.spawnDroppedItem(this.x, this.y+1, this.z, this.data.state == WITH_FULL_CUP ? ItemID.kvass_cup : ItemID.cup, 1, 0, null);
        this.data.state = EMPTY;
    },
    init:function(){
        this.ticks = 0;
        this.tile = this.blockSource.getBlock(this.x, this.y, this.z);        
    },
    destroyBlock:function(){
        if(this.data.state != EMPTY)
            this.extractCup();
    },
    click:function(id, count, data, coords, client){
        switch(this.data.state){
            case EMPTY:
                if(id == ItemID.cup){
                    this.sendPacket("insertCup");
                    Entity.setCarriedItem(client, 0,0,0);
                    this.data.state = WITH_CUP;
                }
                break;
            case WITH_CUP:
                if(Entity.getSneaking(client)){
                    this.extractCup();
                    break;
                }
                this.data.state = LOAD;
                this.sendPacket("loadCup");
                break;
            case WITH_FULL_CUP:
                this.ticks = 0;
                this.extractCup();
            break;
        }
    },
    tick:function(){
        if(this.data.state == LOAD && ++this.ticks == 60)
            this.data.state = WITH_FULL_CUP;
    },
    events:{
        init:function(){
            this.sendResponse("init", {
                tile:{id:this.tile.id, data:this.tile.data},
                state:this.data.state
            });
        }
    },
    client:{
        extractCup:function(){    
            this.cup.destroy();
            this.flow.destroy();
            this.cupLiquid.destroy();
        },
        insertCup:function(){
            this.cup.load();
        },
        setFull:function(){
            this.cupLiquid.load();
            this.cupLiquid.scaleY(6.05);
        },
        loadCup:function(){
            this.flow.tick = 0;
            this.flow.loadCustom(function(){
                this.tick++;
                if(this.tick == 1)
                    this.scale(.5,.1,.5).setPos(this.x, this.y + .1546875, this.z);

                if(this.tick < 20)
                    this.scaleY(this.scaleY() + .275);
                else if(this.tick > 50 && this.tick < 60){
                    this.scaleY(this.scaleY() - .275);
                    this.setPos(this.x, this.y - .0171875, this.z)
                }
            });

            this.cupLiquid.tick = 0;
            this.cupLiquid.loadCustom(function(){
                this.tick++;
                if(this.tick == 1)
                    this.scaleY(.05);
                      
                if(this.tick >= 20 && this.tick < 60)
                    this.scaleY(this.scaleY() + .15);
            });
        
        },
        init:function(data){
            let r = cupOffset[data.tile.data];
            this.cup = new Animation.Item(
                this.x + .5 + (-1 * r[1]),
                this.y + .5,
                this.z + .5 + (-1 * r[3]));
            this.cup.describeItem({
                id: ItemID.cup,
                count: 1,
                data: 0,
                size: 1,
                rotation: [0, 0, 0],
                notRandomize: true
            });
            
            this.flow = new Animation.Expansion(
                this.x + .234375 + (-.96875 * r[1]),
                this.y + .71875 - .1546875,
                this.z + .765625 + (-.96875 * r[3]));
            this.flow.describe({
                mesh:meshBox,
                skin:"textures/kvass_liquid.png"
            });
            this.flow.onInit = function(){
                this.transform().rotate(Math.PI, 0, 0)
            }


            this.cupLiquid = new Animation.Expansion(
                this.x + (-1 * r[1]),
                this.y + .5 - 0.125,
                this.z + (-1 * r[3]));
            this.cupLiquid.describe({
                    mesh:liquidMehs,
                    skin:"textures/kvass_liquid.png"
                });
            
            if(data.state != EMPTY){
                this.insertCup();
                if(data.state == LOAD)
                    this.loadCup();
                else if(data.state == WITH_FULL_CUP)
                    this.setFull();
            }
        },
        load:function(){
            this.sendPacket("init");
        },
        unload:function(){
            this.extractCup();
        },
        events:{
            init:function(data){
                this.init(data);
            },
            insertCup:function(){
                this.insertCup();
            },
            extractCup:function(){
                this.extractCup();
            },
            loadCup:function(){
                this.loadCup();
            }
        }
    } 
});