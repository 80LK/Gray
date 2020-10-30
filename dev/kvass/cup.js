IDRegistry.genItemID("cup");
Item.createItem("cup", "Cup", { name:"cup" }, {stack: 1 });
ItemModel.getFor(ItemID.cup).setModel(getMesh("cup"), "terrain-atlas/kvass_barrel_0.png");

IDRegistry.genItemID("kvass_cup");
Item.createItem("kvass_cup", "Cup Of Kvass", { name:"cup_of_kvass" }, {stack: 1 });
ItemModel.getFor(ItemID.kvass_cup).setModel(getMesh("cup_full"), "terrain-atlas/kvass_barrel_0.png");