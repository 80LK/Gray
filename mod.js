/*
BUILD INFO:
  dir: dev/
  target: mod.js
  files: 2
*/



// header.js

/*
   ____                        
  / ___|  _ __    __ _   _   _ 
 | |  _  | '__|  / _` | | | | |
 | |_| | | |    | (_| | | |_| |
  \____| |_|     \__,_|  \__, |
                         |___/ 
                         by WolfTeam & Diskrizy
*/




// radio/radio.js

IDRegistry.genBlockID("radio");
Block.createBlockWithRotation("radio", [{
    name:"Radio",
    texture:["radio", 0],
    inCreative:true
}]);

(function(sid, texture){
    var rots = [
        Math.PI,
        0,
        Math.PI * .5,
        Math.PI * 1.5,
    ];
    for(let i = 0; i < 4; i++){
        let mesh = new RenderMesh();
        mesh.setBlockTexture(texture, 0);
        mesh.importFromFile(__dir__ + "models/radio.obj", "obj", null);
        mesh.rotate(0, rots[i], 0);
        mesh.translate(.5,0,.5);

        let render = new BlockRenderer.Model(mesh);
        let icrender = new ICRender.Model(); 
        icrender.addEntry(render);
        BlockRenderer.setStaticICRender(BlockID[sid], i, icrender);
    }
})("radio", "radio");




