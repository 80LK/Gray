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