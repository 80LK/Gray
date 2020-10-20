IDRegistry.genBlockID("cooler");
Block.createBlockWithRotateAndModel("cooler", "Refrigerator", "cooler", "cooler", { x:0, z:0 }, "iron_block");

(function(){
    let CollisionShape = new ICRender.CollisionShape();
    let Entry = CollisionShape.addEntry();
    Entry.addBox(0,0,0,1,2,1);

    BlockRenderer.setCustomCollisionShape(BlockID.cooler, -1, CollisionShape);
})()

TileEntity.registerPrototype(BlockID.cooler, {
    useNetworkItemContainer:true,
    getScreenName:function(){
        return "cooler";
    },
    getScreenByName:function(){
        var header = CoolerInterface.getWindow("header");
        header.contentProvider.drawing[2].text = Translation.translate("Refrigerator");
        
        return CoolerInterface;
    }
})