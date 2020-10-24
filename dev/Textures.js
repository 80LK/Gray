var Textures = {
    __bitmaps:{},
    getBitmap:function(dir){
        if(!this.__bitmaps.hasOwnProperty(dir))
            this.__bitmaps[dir] = new BitmapFactory.decodeFile(dir);

        return this.__bitmaps[dir];
    },
    parseJSON:function(json){
        return this.parseObj(JSON.parse(json));
    },
    parseObj:function(obj){
        let bitmap = this.getBitmap(obj.file);
        bitmap = new Bitmap.createBitmap(bitmap, obj.bitmap.x, obj.bitmap.y, obj.bitmap.width, obj.bitmap.height);
        bitmap = Bitmap.createScaledBitmap(bitmap, obj.bitmap.width * obj.scale, obj.bitmap.height * obj.scale, false);
        if(obj.ninePatch)
            return this.createNinePatch(bitmap, obj.ninePatch.x.map(function(i){return i*obj.scale}),
                                    obj.ninePatch.y.map(function(i){return i*obj.scale}));
        
        return bitmap;
    },

    setStateImageButton(view, normal, pressed){
        view.setOnTouchListener(function(b, c){
            var f = c.getActionMasked();
            if (f == MotionEvent.ACTION_DOWN) {
                b.setImageBitmap(pressed);
            }
            if (f == MotionEvent.ACTION_CANCEL || f == MotionEvent.ACTION_UP) {
                b.setImageBitmap(normal);
            }
            return false;
        })
    },
    createNinePatch:function(bitmap, x, y, c){
        let xL = x.length, yL = y.length, cL = (xL+1) * (yL+1);
        if(c == undefined){
            c = [];
            for(let i = 0; i < cL; i++)
                c.push(1);
        }
        
        if(c.length != cL)
            throw new RangeError();

        var a = java.nio.ByteBuffer.allocate(32 + (xL+yL+cL) * 4).order(java.nio.ByteOrder.nativeOrder());
        a.put(1);
        a.put(xL);
        a.put(yL);
        a.put(cL);
        a.putInt(0);
        a.putInt(0);
        a.putInt(0);
        a.putInt(0);
        a.putInt(0);
        a.putInt(0);
        a.putInt(0);
     
        for(let i = 0; i < xL; i++)
           a.putInt(x[i]);
        for(let i = 0; i < yL; i++)
           a.putInt(y[i]);
        for(let i = 0; i < cL; i++)
           a.putInt(c[i]);
        
        return new NinePatchDrawable(ctx.getResources(), bitmap, a.array(), new Rect(), "")

    }
}

/*
{
    file:__dir__ + "gui/arcadeUI.png",
    bitmap:{
        x:0,
        y:0,
        width:64,
        height:58
    },
    ninePatch:{
        x:[23, 24, 40, 41],
        y:[5, 37]
    },
    scale:8
}


let bitmap = new Bitmap.createBitmap(ArcadeUIBitmap, 0, 0, 64, 58);
    bitmap = Bitmap.createScaledBitmap(bitmap, 64 * 8, 58 * 8, false);
    return 

*/