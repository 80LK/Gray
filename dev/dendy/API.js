var Dendy = {
    list:{},
    items:{},
    registerCartridge:function(sid, game, texture){
        if(Dendy.existCartridge(sid))
            throw new Error("Данный sid уже был зарегистрирован");
        texture.color = texture.color || Color.YELLOW;
        Dendy.list[sid] = {
            game:game,
            texture:texture
        };
        Dendy.items[ItemID["cartridge_" + sid]] = Dendy.list[sid];
    },
    existCartridge:function(sid){
        return Dendy.list.hasOwnProperty(sid);
    },
    isCartridge:function(id){
        return Dendy.items.hasOwnProperty(id);
    },
    getGameFromID:function(id){
        if(Dendy.isCartridge(id))
            return Dendy.items[id].game;
        
        return null;
    }
};

Game.registerCartridge = function(game, name, texture){
    let sid = game.prototype.sid;
    let item_sid = "cartridge_" + sid;
    if(Dendy.existCartridge(sid))
        throw new Error("Данный sid уже был зарегистрирован");

    IDRegistry.genItemID(item_sid);
    Item.createItem(item_sid, "Cartridge \""+name+"\"", texture, {stack: 1 });
    Dendy.registerCartridge(sid, game, texture);
}
Game.isCartridge = Dendy.isCartridge;
