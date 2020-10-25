Dendy.Window = function(settings){
    Dendy.Window.superclass.constructor.apply(this, arguments);
    this.__cartridgeView = new RelativeLayout(ctx);
    
    //settings.cartridge
    let params  = new RelativeLayout.LayoutParams(
        settings.cartridge.width * settings.cartridge.scale,
        settings.cartridge.height * settings.cartridge.scale);
    params.setMargins(
        settings.cartridge.x,
        settings.cartridge.y,
        settings.cartridge.x,
        settings.cartridge.y);
    settings.cartridge.rules.map(function(i){ params.addRule(i); });
    this.rootView.addView(this.__cartridgeView, params);

}; Utils.extends(Dendy.Window, Game.StandardWindow);
Dendy.Window.prototype.setColorCartridge = function(color){
    this.__cartridgeView.setBackgroundColor(color);
}
Dendy.Window.prototype.open = function(id){
    if(!Dendy.isCartridge(id))
        throw new Error("Its not cartridge");
    
    let cartridge = Dendy.items[id];

    this.game = new cartridge.game();
    this.setColorCartridge(cartridge.texture.color);
    
    Dendy.Window.superclass.open.apply(this, arguments);
}