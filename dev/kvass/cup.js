IDRegistry.genItemID("cup");
Item.createItem("cup", "Cup", { name:"cup" }, {stack: 1 });
ItemModel.getFor(ItemID.cup).setHandModel(getMesh("cup", function(){
    this.rotate(0, Math.PI * .5, 0);
}), "terrain-atlas/kvass_barrel_0.png");

IDRegistry.genItemID("kvass_cup");
Item.createFoodItem("kvass_cup", "Cup Of Kvass", { name:"cup_of_kvass" }, {stack: 1, food:4});
Callback.addCallback("FoodEaten", function(){
    if(Player.getCarriedItem().id == ItemID.kvass_cup){
        Player.addItemToInventory(ItemID.cup, 1, 0);
    }
});
ItemModel.getFor(ItemID.kvass_cup).setHandModel(getMesh("cup_full"), "terrain-atlas/kvass_barrel_0.png");