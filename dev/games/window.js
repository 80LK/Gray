Game.BaseWindow = function(settings){
    this.game = null;

    this.__popup = new Popup();
    this.__popup.setWidth(-1);
    this.__popup.setHeight(-1);

    this.rootView = new RelativeLayout(ctx);
    this.rootView.setBackgroundDrawable(Textures.parseObj(settings.window));
    this.__popup.setContentView(this.rootView);

    this.__surface = new android.view.TextureView(ctx);
    var surfaceParams = new RelativeLayout.LayoutParams(-1, -1);
    surfaceParams.setMargins(
        settings.window.border[0] * settings.window.scale,
        settings.window.border[1] * settings.window.scale,
        settings.window.border[2] * settings.window.scale,
        settings.window.border[3] * settings.window.scale);
    this.rootView.addView(this.__surface, surfaceParams);

    

    let exitNormal = Textures.parseObj(settings.exit.default),
        exitPressed = Textures.parseObj(settings.exit.pressed);

    let exit = new ImageView(ctx);
    exit.setImageBitmap(exitNormal);
    Textures.setStateImageButton(exit, exitNormal, exitPressed);

    let exitButtonParams  = new RelativeLayout.LayoutParams(-2, -2);
    exitButtonParams.setMargins(settings.exit.x, settings.exit.y, settings.exit.x, settings.exit.y);
    settings.exit.rules.map(function(i){ exitButtonParams.addRule(i); });
    this.rootView.addView(exit, exitButtonParams);
    
    if(settings.exit.onClick)
        this.__OnExit = settings.exit.onClick;
    
        let fClose = this.close.bind(this);
    exit.setOnClickListener(function(){
        fClose();
    });
    
    if(settings.game){
        if(settings.game instanceof Game){
            this.game = settings.game;
        } else if(settings.game.prototype.constructor){
            let game = new settings.game();
            if(game instanceof Game)
                this.game = game;
        }
    }

    this.__thread = this.__thread.bind(this);
}
Game.BaseWindow.prototype.rootView = null;
Game.BaseWindow.prototype.__surface = null;
Game.BaseWindow.prototype.game = null;
Game.BaseWindow.prototype.__popup = null;
Game.BaseWindow.prototype.__opened = false;
Game.BaseWindow.prototype.__drawing = false;
Game.BaseWindow.prototype.__errorBG = Color.BLUE;
Game.BaseWindow.prototype.__errorFont = (function(){
    let p = new Paint();
    p.setColor(Color.WHITE);
    p.setTypeface(Game.UI.Typeface);
    p.setTextSize(20);
    return p;
})();
Game.BaseWindow.prototype.__OnExit = function(){};
Game.BaseWindow.prototype.isOpened = function(){
    return this.__opened;
};
Game.BaseWindow.prototype.open = function(){
    if(!this.game instanceof Game)
        throw new TypeError();
    
    if(this.isOpened()) return;
    runUI((function(){
        this.__popup.showAtLocation(ctx.getWindow().getDecorView(), 51, 0, 0);
    }).bind(this));
    this.__opened = true;
    
    var a = this.__thread;
    (new Thread((function(ctx){
        return function(){
            ctx.__thread();
        }
    })(this))).start();
};
Game.BaseWindow.prototype.__thread = function(){
    var canvas = null,
        currentTime = 0,
        lastTime = System.currentTimeMillis();

    this.__drawing = true;
    while (this.__opened) {
        canvas = null;
        try{
            canvas = this.__surface.lockCanvas();
            if (canvas == null) continue;

            try{
                currentTime = System.currentTimeMillis();
                this.game.tick((currentTime - lastTime)/1000);
    
                this.game.draw(canvas);
            }catch(e){
                this.game.close();
                canvas.drawColor(this.__errorBG);
                let message = e.name + ":" + e.message + "(" + e.fileName + "#" + e.lineNumber + ")";
                if(e.stack)
                    message += "\n" + e.stack;
                message = message.split("\n");

                let rect = new Rect();
                this.__errorFont.getTextBounds(message[0], 0, message[0].length, rect);
                let height = rect.bottom - rect.top;

                for(let i = 0, l = message.length; i < l; ){
                    canvas.drawText(message[i], 10, (10 + height) * (++i), this.__errorFont);
                }
                break;
            }finally{
                this.__surface.unlockCanvasAndPost(canvas);
                lastTime = currentTime;
            }
        }catch(e){
            alert(e);
            break;
        }
    }
    this.__drawing = false;
};
Game.BaseWindow.prototype.close = function(){
    if(!this.isOpened()) return;

    this.__opened = false;
    while(this.__drawing){}
    if(this.game)
        this.game.close();

    this.__OnExit();
    runUI((function(){
        this.__popup.dismiss();
    }).bind(this));
};

Game.StandardWindow = function(settings){
    Game.StandardWindow.superclass.constructor.apply(this, arguments);
    //Left
    let leftNormal = Textures.parseObj(settings.left.default),
        leftPressed = Textures.parseObj(settings.left.pressed);

    let left = new ImageView(ctx);
    left.setImageBitmap(leftNormal);
    left.setOnClickListener((function(ctx){
        return function(){
            ctx.game.invoke(Game.CONTROLS.LEFT)
        }
    })(this))
    Textures.setStateImageButton(left, leftNormal, leftPressed);

    let leftButtonParams  = new RelativeLayout.LayoutParams(-2, -2);
    leftButtonParams.setMargins(settings.left.x, settings.left.y, settings.left.x, settings.left.y);
    settings.left.rules.map(function(i){ leftButtonParams.addRule(i); });
    this.rootView.addView(left, leftButtonParams);

    // Right
    let rightNormal = Textures.parseObj(settings.right.default),
        rightPressed = Textures.parseObj(settings.right.pressed);

    let right = new ImageView(ctx);
    right.setImageBitmap(rightNormal);
    right.setOnClickListener((function(ctx){
        return function(){
            ctx.game.invoke(Game.CONTROLS.RIGHT)
        }
    })(this))
    Textures.setStateImageButton(right, rightNormal, rightPressed);

    let rightButtonParams  = new RelativeLayout.LayoutParams(-2, -2);
    rightButtonParams.setMargins(settings.right.x, settings.right.y, settings.right.x, settings.right.y);
    settings.right.rules.map(function(i){ rightButtonParams.addRule(i); });
    this.rootView.addView(right, rightButtonParams);

    //Up
    let upNormal = Textures.parseObj(settings.up.default),
        upPressed = Textures.parseObj(settings.up.pressed);

    let up = new ImageView(ctx);
    up.setImageBitmap(upNormal);
    up.setOnClickListener((function(ctx){
        return function(){
            ctx.game.invoke(Game.CONTROLS.UP)
        }
    })(this))
    Textures.setStateImageButton(up, upNormal, upPressed);

    let upButtonParams  = new RelativeLayout.LayoutParams(-2, -2);
    upButtonParams.setMargins(settings.up.x, settings.up.y, settings.up.x, settings.up.y);
    settings.up.rules.map(function(i){ upButtonParams.addRule(i); });
    this.rootView.addView(up, upButtonParams);

    //Down
    let downNormal = Textures.parseObj(settings.down.default),
        downPressed = Textures.parseObj(settings.down.pressed);

    let down = new ImageView(ctx);
    down.setImageBitmap(downNormal);
    down.setOnClickListener((function(ctx){
        return function(){
            ctx.game.invoke(Game.CONTROLS.DOWN)
        }
    })(this))
    Textures.setStateImageButton(down, downNormal, downPressed);

    let downButtonParams  = new RelativeLayout.LayoutParams(-2, -2);
    downButtonParams.setMargins(settings.down.x, settings.down.y, settings.down.x, settings.down.y);
    settings.down.rules.map(function(i){ downButtonParams.addRule(i); });
    this.rootView.addView(down, downButtonParams);

}; Utils.extends(Game.StandardWindow, Game.BaseWindow);