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