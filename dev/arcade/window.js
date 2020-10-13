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
    let errorPaint = (function(){
        let p = new Paint();
        p.setColor(Color.WHITE);
        p.setTypeface(Game.UI.Typeface);
        p.setTextSize(20);
        return p;
    })();

    let thisWindow =  {
        open:function(){
            if(thisWindow.opened) return;
            runUI(function(){
                popup.showAtLocation(ctx.getWindow().getDecorView(), 51, 0, 0);
            });
            thisWindow.opened = true;
            new Thread(function(){
                var canvas = null, error = false;
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
                        canvas.drawColor(Color.BLUE);
                        e = e.toString();
                        let rect = new Rect();
                        errorPaint.getTextBounds(e, 0, e.length || e.length(), rect)
                        canvas.drawText(e, 10, 10 + rect.bottom - rect.top, errorPaint)
                        error = true;
                    }finally {
                        if (canvas != null)
                            surface.unlockCanvasAndPost(canvas);
                        if(error)
                            break;
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
            return Bitmap.createScaledBitmap(bitmap, 3 * 15, 3 * 15, false);
        })(),
        exitButtonPressBitmap = (function(){
            let bitmap = new Bitmap.createBitmap(rootBitmap, 28, 66, 3, 3);
            return Bitmap.createScaledBitmap(bitmap, 3 * 10, 3 * 10, false);
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
    let buttonControlUpDefaultBitmap = (function(){
            let bitmap = new Bitmap.createBitmap(rootBitmap, 21, 58, 7, 7);
            return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
        })(),
        buttonControlUpPressBitmap = (function(){
            let bitmap = new Bitmap.createBitmap(rootBitmap, 21, 65, 7, 7);
            return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
        })();
    buttonControlUp.setImageBitmap(buttonControlUpDefaultBitmap);
    buttonControlUp.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.UP)
    });
    buttonControlUp.setOnTouchListener(function(b, c){
        var f = c.getActionMasked();
        if (f == MotionEvent.ACTION_DOWN) {
            b.setImageBitmap(buttonControlUpPressBitmap);
        }
        if (f == MotionEvent.ACTION_CANCEL || f == MotionEvent.ACTION_UP) {
            b.setImageBitmap(buttonControlUpDefaultBitmap);
        }
        return false;
    })
    let buttonControlUpParams  = new RelativeLayout.LayoutParams(-2, -2);
    buttonControlUpParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
    buttonControlUpParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
    buttonControlUpParams.setMargins(0, 0, 270, 8 * 2);
    rootLayout.addView(buttonControlUp, buttonControlUpParams);

    let buttonControlDown = new ImageView(ctx);
    let buttonControlDownDefaultBitmap = (function(){
        let bitmap = new Bitmap.createBitmap(rootBitmap, 14, 58, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
    })(),
    buttonControlDownPressBitmap = (function(){
        let bitmap = new Bitmap.createBitmap(rootBitmap, 14, 65, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
    })();

    buttonControlDown.setImageBitmap(buttonControlDownDefaultBitmap);
    buttonControlDown.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.DOWN)
    });
    buttonControlDown.setOnTouchListener(function(b, c){
        var f = c.getActionMasked();
        if (f == MotionEvent.ACTION_DOWN) {
            b.setImageBitmap(buttonControlDownPressBitmap);
        }
        if (f == MotionEvent.ACTION_CANCEL || f == MotionEvent.ACTION_UP) {
            b.setImageBitmap(buttonControlDownDefaultBitmap);
        }
        return false;
    })
    let buttonControlDownParams  = new RelativeLayout.LayoutParams(-2, -2);
    buttonControlDownParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
    buttonControlDownParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
    buttonControlDownParams.setMargins(0, 0, 150, 8 * 2);
    rootLayout.addView(buttonControlDown, buttonControlDownParams);

    let buttonControlLeft = new ImageView(ctx);
    let buttonControlLeftDefaultBitmap = (function(){
        let bitmap = new Bitmap.createBitmap(rootBitmap, 0, 58, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
    })(),
    buttonControlLeftPressBitmap = (function(){
        let bitmap = new Bitmap.createBitmap(rootBitmap, 0, 65, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
    })();

    buttonControlLeft.setImageBitmap(buttonControlLeftDefaultBitmap);
    buttonControlLeft.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.LEFT)
    });
    buttonControlLeft.setOnTouchListener(function(b, c){
        var f = c.getActionMasked();
        if (f == MotionEvent.ACTION_DOWN) {
            b.setImageBitmap(buttonControlLeftPressBitmap);
        }
        if (f == MotionEvent.ACTION_CANCEL || f == MotionEvent.ACTION_UP) {
            b.setImageBitmap(buttonControlLeftDefaultBitmap);
        }
        return false;
    })
    let buttonControlLeftParams  = new RelativeLayout.LayoutParams(-2, -2);
    buttonControlLeftParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
    buttonControlLeftParams.setMargins(150, 0, 0, 8 * 2);
    rootLayout.addView(buttonControlLeft, buttonControlLeftParams);

    let buttonControlRight = new ImageView(ctx);
    let buttonControlRightDefaultBitmap = (function(){
        let bitmap = new Bitmap.createBitmap(rootBitmap, 7, 58, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
    })(),
    buttonControlRightPressBitmap = (function(){
        let bitmap = new Bitmap.createBitmap(rootBitmap, 7, 65, 7, 7);
        return Bitmap.createScaledBitmap(bitmap, 7 * 8, 7 * 8, false);
    })();

    buttonControlRight.setImageBitmap(buttonControlRightDefaultBitmap);
    buttonControlRight.setOnClickListener(function(){
        Arcade.game.invoke(Game.CONTROLS.RIGHT)
    });
    buttonControlRight.setOnTouchListener(function(b, c){
        var f = c.getActionMasked();
        if (f == MotionEvent.ACTION_DOWN) {
            b.setImageBitmap(buttonControlRightPressBitmap);
        }
        if (f == MotionEvent.ACTION_CANCEL || f == MotionEvent.ACTION_UP) {
            b.setImageBitmap(buttonControlRightDefaultBitmap);
        }
        return false;
    })
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