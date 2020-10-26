IDRegistry.genBlockID("kvass_barrel");
Block.createBlockWithRotateAndModel("kvass_barrel", "Бочка с квасом", "kvass_barrel", "kvass_barrel", { x:0, z:0 }, "iron_block");
//Colision
(function(){
    let rotates = [
        [[0, -.8125, 1, 1.6875], [0, -.375, 1, 1.125]],
        [[0, -.6875, 1, 1.8125], [0, -.125, 1, 1.375]],
        [[-.8125, 0, 1.6875, 1], [-.375, 0, 1.125, 1]],
        [[-.6875, 0, 1.8125, 1], [-.125, 0, 1.375, 1]],
    ];
    for(let i = 0, l = rotates.length ; i < l; i++){
        let CollisionShape = new ICRender.CollisionShape();
        let Entry = CollisionShape.addEntry();
        
        Entry.addBox(rotates[i][0][0], 0, rotates[i][0][1], rotates[i][0][2], .375, rotates[i][0][3]);
        Entry.addBox(rotates[i][1][0], .375, rotates[i][1][1], rotates[i][1][2], 1.25, rotates[i][1][3]);

        BlockRenderer.setCustomCollisionShape(BlockID.kvass_barrel, i == 0 ? -1 : i, CollisionShape);
    }
})();