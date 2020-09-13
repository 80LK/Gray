IDRegistry.genBlockID("dendy");
Block.createBlockWithRotateAndModel("dendy", "Dendy", "dendy", "dendy", { x:0, z:0 });

IDRegistry.genBlockID("dendy_green");
Block.createBlockWithRotateAndModel("dendy_green", "Dendy", "dendy_0", "dendy", { x:0, z:0 });

IDRegistry.genBlockID("dendy_yellow");
Block.createBlockWithRotateAndModel("dendy_yellow", "Dendy", "dendy_1", "dendy", { x:0, z:0 });
Callback.addCallback("ItemUse", function(coords, item, block){
    switch(block.id){
        case BlockID.dendy_green:
            World.drop(coords.x, coords.y+1, coords.z, ItemID.cartridge_green, 1);
            World.setBlock(coords.x, coords.y, coords.z, BlockID.dendy, block.data);
        break;
        case BlockID.dendy_yellow:
            World.drop(coords.x, coords.y+1, coords.z, ItemID.cartridge_yellow, 1);
            World.setBlock(coords.x, coords.y, coords.z, BlockID.dendy, block.data);
        break;
    }
});

IDRegistry.genItemID("cartridge_green");
Item.createItem("cartridge_green", "Cartridge", {name:"cartridge", data:0}, {stack: 1 });
Item.registerUseFunction("cartridge_green", function(coords, item, block){
    if(block.id == BlockID.dendy){
        Player.setCarriedItem(0,0,0);
        World.setBlock(coords.x, coords.y, coords.z, BlockID.dendy_green, block.data);
    }
});

IDRegistry.genItemID("cartridge_yellow");
Item.createItem("cartridge_yellow", "Cartridge", {name:"cartridge", data:1}, {stack: 1 });
Item.registerUseFunction("cartridge_yellow", function(coords, item, block){
    if(block.id == BlockID.dendy){
        Player.setCarriedItem(0,0,0);
        World.setBlock(coords.x, coords.y, coords.z, BlockID.dendy_yellow, block.data);
    }
});