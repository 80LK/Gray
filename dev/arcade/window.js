var ArcadeWindow = new Game.StandardWindow({
    window:{
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
        scale:8,
        border:[16, 5, 16, 21]
    },
    exit:{
        default:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:15,
            bitmap:{
                x:28,
                y:63,
                width:3,
                height:3
            }
        },
        pressed:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:15,
            bitmap:{
                x:28,
                y:66,
                width:3,
                height:3
            }
        },
        rules:[RelativeLayout.ALIGN_PARENT_RIGHT],
        x:8 * 5,
        y:8 * 5,
        onClick:function(){
            this.game = new ArcadeMenu();
        }
    },
    left:{
        default:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:0,
                y:58,
                width: 7, 
                height: 7
            }
        },
        pressed:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:0,
                y:65,
                width: 7, 
                height: 7
            }
        },
        rules:[RelativeLayout.ALIGN_PARENT_BOTTOM],
        x:150,
        y:8 * 2
    },
    right:{
        default:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:7,
                y:58,
                width: 7, 
                height: 7
            }
        },
        pressed:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:7,
                y:65,
                width: 7, 
                height: 7
            }
        },
        rules:[RelativeLayout.ALIGN_PARENT_BOTTOM],
        x:270,
        y:8 * 2
    },
    up:{
        default:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:21,
                y:58,
                width: 7, 
                height: 7
            }
        },
        pressed:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:21,
                y:65,
                width: 7, 
                height: 7
            }
        },
        rules:[RelativeLayout.ALIGN_PARENT_BOTTOM, RelativeLayout.ALIGN_PARENT_RIGHT],
        x:270,
        y:8 * 2
    },
    down:{
        default:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:14,
                y:58,
                width: 7, 
                height: 7
            }
        },
        pressed:{
            file:__dir__ + "gui/arcadeUI.png",
            scale:8,
            bitmap:{
                x:14,
                y:65,
                width: 7, 
                height: 7
            }
        },
        rules:[RelativeLayout.ALIGN_PARENT_BOTTOM, RelativeLayout.ALIGN_PARENT_RIGHT],
        x:150,
        y:8 * 2
    },
});
Callback.addCallback("PostLoaded", function(){
    ArcadeWindow.game = new ArcadeMenu();
});


Callback.addCallback("ItemUse", function(c, i, b){
    if(b.id == BlockID.arcade){
        ArcadeWindow.open();
        ICGame.prevent();
    }
});