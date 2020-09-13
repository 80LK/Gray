IDRegistry.genBlockID("arcade");
Block.createBlockWithRotateAndModel("arcade", "Arcade", "arcade", "arcade", { x:0, z:0 }, "planks");

(function(){
    let CollisionShape = new ICRender.CollisionShape();
    let Entry = CollisionShape.addEntry();
    Entry.addBox(0,0,0,1,1.5,1);
    
    BlockRenderer.setCustomCollisionShape(BlockID.arcade, -1, CollisionShape);
})()