/*
   ____                        
  / ___|  _ __    __ _   _   _ 
 | |  _  | '__|  / _` | | | | |
 | |_| | | |    | (_| | | |_| |
  \____| |_|     \__,_|  \__, |
                         |___/ 
                         by WolfTeam & Diskrizy
*/

const DEBUG = (function(){
   var config = FileTools.ReadJSON(__packdir__ + "/innercore/config.json") || {};
   return config["developer_mode"] === true;
})();
function getMesh(model, f){
   let mesh = new RenderMesh();
   mesh.importFromFile(__dir__ + "models/"+model+".obj", "obj", null);
   
   if(f && typeof f == "function")
      f.apply(mesh);

   mesh.translate(.5,0,.5);
   return mesh;
}
Block.createBlockWithRotateAndModel = function(sid, name, model, texture, offset, blockTexture, inCreative){
    if(typeof texture == "string")
        texture = {name:texture};
    
    if(texture.name == undefined)
      throw new Error("texture.name is undefined");

   if(blockTexture == undefined)
      blockTexture = texture.name;

   if(!offset) offset = {};

   if(inCreative === undefined)
      inCreative = true;

   Block.createBlockWithRotation(sid, [{
      name:name,
      texture: [[blockTexture, 0]],
      inCreative:inCreative
   }]);


   var rots = [
      Math.PI,
      0,
      Math.PI * .5,
      Math.PI * 1.5,
  ];
  for(let i = 0; i < 4; i++){
      let mesh = new RenderMesh();
      mesh.setBlockTexture(texture.name, texture.meta | 0);
      mesh.importFromFile(__dir__ + "models/"+model+".obj", "obj", null);
      mesh.rotate(0, rots[i], 0);
      mesh.translate(.5,0,.5);

      let render = new BlockRenderer.Model(mesh);
      let icrender = new ICRender.Model(); 
      icrender.addEntry(render);
      BlockRenderer.setStaticICRender(BlockID[sid], i, icrender);
  }
}

var View = android.view.View,
   Popup = android.widget.PopupWindow,
   NinePatchDrawable = android.graphics.drawable.NinePatchDrawable,
   RelativeLayout = android.widget.RelativeLayout,
   Button = android.widget.Button,
   ImageView = android.widget.ImageView,
   Thread = java.lang.Thread,
   Bitmap = android.graphics.Bitmap,
   Rect = android.graphics.Rect,
   Paint = android.graphics.Paint,
   Color = android.graphics.Color,
   System = java.lang.System,
   MotionEvent = android.view.MotionEvent,
   JavaArray = java.lang.reflect.Array
   BitmapFactory = android.graphics.BitmapFactory;

var ArcadeUIBitmap = new BitmapFactory.decodeFile(__dir__ + "gui/arcadeUI.png");
var ctx = UI.getContext();
var ICGame = Game;

function runUI(f){
   if(f)
      ctx.runOnUiThread(new java.lang.Runnable({
         run: function() {
            f();
         }
      }))
}

function createNinePatch(bitmap, x, y, c){
   let xL = x.length, yL = y.length, cL = (xL+1) * (yL+1);
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
      a.putInt(1);
   
   return new NinePatchDrawable(ctx.getResources(), bitmap, a.array(), new Rect(), "")
}

runUI(function(){
   ctx.getWindow().setFlags(
      android.view.WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
      android.view.WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
  );
});

IMPORT("SoundAPI");
