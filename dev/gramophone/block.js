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
        alert(this.tile.data);
    },
    click:function(id, count, data, coords, client){
        if(Entity.getSneaking(client)){
            this.extractDisk();
            return;
        }
        if(GramophoneDisks.isDisk(id)){
            alert(id);
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
            
            let render = new Render();
            let part = render.getPart("body");
            part.addBox(-1,0,-1,2,1,2);
            // this.animate.describe({
            //     render: render.getRenderType(),
            //     material:"entity_alphatest_custom",
            //     scale:2
            // });
            this.animate.describeItem({
                id:  id,
                count: 1,
                data: 0,
                size: 1,
                rotation: [Math.PI/2, 0, 0],
                material:"entity_alphatest_custom",
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
                alert(data.disk)
                this.insertDisk(data.disk);
            },
            extract:function(){
                this.extractDisk();
            }
        }
    }
});

TileEntity.registerPrototype2 = function(){};
TileEntity.registerPrototype2(BlockID.gramophone, {
    defaultValues:{
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