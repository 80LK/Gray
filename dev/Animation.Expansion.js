Animation.Expansion = function(x, y, z){
    Animation.Expansion.superclass.constructor.apply(this, arguments);
    this.x = x;
    this.y = y;
    this.z = z;
    this.currentScale = { x:1, y:1, z:1 };

    this.__load = this.load;
    this.load = function(){
        this.__load();
        this.init();
    }

    this.__loadCustom = this.loadCustom;
    this.loadCustom = function(f){
        this.__loadCustom(f);
    }

    this.__destroy = this.destroy;
    this.destroy = function(){
        this.currentScale = { x:1, y:1, z:1 };
        this.__destroy();
    }

    this.__setPos = this.setPos;
    this.setPos = function(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
        this.__setPos(x,y,z)
    }

}; Utils.extends(Animation.Expansion, Animation.Base);

Animation.Expansion.prototype.scale = function(x, y, z){
    let t = this.transform();
    if(!t) return this;//throw new Error("Not load animate");

    t.scale(x / this.currentScale.x,
        y / this.currentScale.y,
        z / this.currentScale.z);
    
    this.currentScale.x = x;
    this.currentScale.y = y;
    this.currentScale.z = z;
    
    return this;
}
Animation.Expansion.prototype.scaleX = function(x){
    if(x == undefined) return this.currentScale.x;
    let t = this.transform();
    if(!t) return this;//throw new Error("Not load animate");

    t.scale(x / this.currentScale.x, 1, 1);
    this.currentScale.x = x;
    return this;
}
Animation.Expansion.prototype.scaleY = function(y){
    if(y == undefined) return this.currentScale.y;
    let t = this.transform();
    if(!t)return this;// throw new Error("Not load animate");

    t.scale(1, y / this.currentScale.y, 1);
    this.currentScale.y = y;
    return this;
}
Animation.Expansion.prototype.scaleZ = function(z){
    if(z == undefined) return this;//return this.currentScale.z;
    let t = this.transform();
    if(!t) throw new Error("Not load animate");

    t.scale(1, 1, z / this.currentScale.z);
    this.currentScale.z = z;
    return this;
}
Animation.Expansion.prototype.inited = false;
Animation.Expansion.prototype.onInit = function(){};
Animation.Expansion.prototype.init = function(){
    if(!this.inited){
        this.onInit();
        //this.inited = true;
    }
}
