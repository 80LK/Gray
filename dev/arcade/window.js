//MotionEvent
var Arcade = {
    game:null,
    window:null
};

Arcade.window = (function(){
    let popup = new Popup();
    popup.setWidth(-1);
    popup.setHeight(-1);
    let surface, surfaceHolder;


    let thisWindow =  {
        open:function(){
            if(thisWindow.opened) return;
            runUI(function(){
                popup.showAtLocation(ctx.getWindow().getDecorView(), 51, 0, 0);
            });
            thisWindow.opened = true;
            new Thread(function(){
                var canvas = null;
                thisWindow.drawing = true;
                let lastTime = System.currentTimeMillis();
                while (thisWindow.opened) {
                    let currentTime = System.currentTimeMillis();
                    Arcade.game.tick((currentTime - lastTime)/1000);
                    lastTime = currentTime;

                    canvas = null;
                    try {
                        canvas = surface.lockCanvas();
                        if (canvas == null) continue;

                        Arcade.game.draw(canvas);
                    } catch(e){
                        //canvas.drawColor(Color.BLUE);
                        alert(e);
                    }finally {
                        if (canvas != null)
                            surface.unlockCanvasAndPost(canvas);
                    }
                }
                thisWindow.drawing = false;
            }).start();
        },
        opened:false,
        drawing:false,
        close:function(){
            if(!thisWindow.opened) return;
        
            thisWindow.opened = false;
            while(thisWindow.drawing){}
            runUI(function(){
                popup.dismiss();
            });
        }
    };
    let rootBitmap = new BitmapFactory.decodeFile(__dir__ + "gui/arcadeUI.png");
    

    let rootLayout = new RelativeLayout(ctx);
    rootLayout.setBackgroundDrawable((function(){
        let bitmap = new Bitmap.createBitmap(rootBitmap, 0, 0, 64, 58);
        bitmap = Bitmap.createScaledBitmap(bitmap, 64 * 8, 58 * 8, false);
        return createNinePatch(bitmap, [23 * 8, 24 * 8, 40 * 8, 41 * 8], [5 * 8, 37 * 8], [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
    })());
    popup.setContentView(rootLayout);

    var surfaceParams = new RelativeLayout.LayoutParams(-1, -1);
    surfaceParams.setMargins(128, 40, 128, 168);
    runUI(function(){
        surface = new android.view.TextureView(ctx);
        surface.setOnClickListener(function(){alert("Click!")})
        rootLayout.addView(surface, surfaceParams);
    });

    

    let exitButton = new ImageView(ctx);
    let exitButtonDefaultBitmap = (function(){
            let bitmap = new Bitmap.createBitmap(rootBitmap, 28, 63, 3, 3);
            return Bitmap.createScaledBitmap(bitmap, 3 * 8, 3 * 8, false);;
        })(),
        exitButtonPressBitmap = (function(){
            let bitmap = new Bitmap.createBitmap(rootBitmap, 28, 66, 3, 3);
            return Bitmap.createScaledBitmap(bitmap, 3 * 8, 3 * 8, false);;
        })();
    exitButton.setImageBitmap(exitButtonDefaultBitmap);
    exitButton.setOnClickListener(thisWindow.close);
    exitButton.setOnTouchListener(function(b, c){
        var f = c.getActionMasked();
        if (f == MotionEvent.ACTION_DOWN) {
            b.setImageBitmap(exitButtonPressBitmap);
        }
        if (f == MotionEvent.ACTION_CANCEL || f == MotionEvent.ACTION_UP) {
            b.setImageBitmap(exitButtonDefaultBitmap);
        }
        return false;
    })
    let exitButtonParams  = new RelativeLayout.LayoutParams(-2, -2);
    exitButtonParams.setMargins(0, 8 * 5, 8 * 5, 0);
    exitButtonParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
    rootLayout.addView(exitButton, exitButtonParams);

    let buttonControlUp = new ImageView(ctx);
    buttonControlUp.setImageBitmap((function(){
        let bitmap = new BitmapFactory.decodeFile(__dir__ + "gui/arcadeUI.png");
        bitmap = new Bitmap.createBitmap(bitmap, 21, 58, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);;
    })());
    buttonControlUp.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.UP)
    });
    let buttonControlUpParams  = new RelativeLayout.LayoutParams(-2, -2);
    buttonControlUpParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
    buttonControlUpParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
    buttonControlUpParams.setMargins(0, 0, 270, 8 * 2);
    rootLayout.addView(buttonControlUp, buttonControlUpParams);

    let buttonControlDown = new ImageView(ctx);
    buttonControlDown.setImageBitmap((function(){
        let bitmap = new BitmapFactory.decodeFile(__dir__ + "gui/arcadeUI.png");
        bitmap = new Bitmap.createBitmap(bitmap, 14, 58, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);;
    })());
    buttonControlDown.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.DOWN)
    });
    let buttonControlDownParams  = new RelativeLayout.LayoutParams(-2, -2);
    buttonControlDownParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
    buttonControlDownParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
    buttonControlDownParams.setMargins(0, 0, 150, 8 * 2);
    rootLayout.addView(buttonControlDown, buttonControlDownParams);

    let buttonControlLeft = new ImageView(ctx);
    buttonControlLeft.setImageBitmap((function(){
        let bitmap = new BitmapFactory.decodeFile(__dir__ + "gui/arcadeUI.png");
        bitmap = new Bitmap.createBitmap(bitmap, 0, 58, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);;
    })());
    buttonControlLeft.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.LEFT)
    });
    let buttonControlLeftParams  = new RelativeLayout.LayoutParams(-2, -2);
    buttonControlLeftParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
    buttonControlLeftParams.setMargins(150, 0, 0, 8 * 2);
    rootLayout.addView(buttonControlLeft, buttonControlLeftParams);

    let buttonControlRight = new ImageView(ctx);
    buttonControlRight.setImageBitmap((function(){
        let bitmap = new BitmapFactory.decodeFile(__dir__ + "gui/arcadeUI.png");
        bitmap = new Bitmap.createBitmap(bitmap, 7, 58, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);;
    })());
    buttonControlRight.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.RIGHT)
    });
    let buttonControlRightParams  = new RelativeLayout.LayoutParams(-2, -2);
    buttonControlRightParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
    buttonControlRightParams.setMargins(270, 0, 0, 8 * 2);
    rootLayout.addView(buttonControlRight, buttonControlRightParams);

    return thisWindow;
})();


Callback.addCallback("ItemUse", function(c, i, b){
    if(b.id == BlockID.arcade){
        Arcade.window.open();
        ICGame.prevent();
    }
});