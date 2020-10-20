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