IDRegistry.genBlockID("gramophone");
Block.createBlockWithRotateAndModel("gramophone", "Gramophone", "gramophone", "gramophone", { x:0, z:0 }, "iron_block");

TileEntity.registerPrototype(BlockID.gramophone, {
    defaultData:{
        disk:null,
        playing:false
    },
    init:function(){
        this.player = new Sound();
        if(this.data.disk)
            this.player.setSource(GramophoneDisks.getSource(this.data.disk));

        this.player.setInBlock(this.x, this.y, this.z, 5);
    },
    click:function(id, count, data){
        Debug.message(id);

        if(GramophoneDisks.isDisk(id)){
            if(this.data.disk)
                World.drop(this.x, this.y+1, this.z, this.data.disk, 1);

            this.data.disk = id;
            this.player.setSource(GramophoneDisks.getSource(id));
            return;
        }
        if(this.data.playing){
            this.player.pause();
        }else{
            this.player.play();
        }
    },
    destroy:function(){
        if(this.data.disk != null){
            World.drop(this.x, this.y+1, this.z, this.data.disk, 1);
            this.data.disk = null;
            return false;
        }

        return true;
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
