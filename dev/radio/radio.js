IDRegistry.genBlockID("radio");
Block.createBlockWithRotateAndModel("radio", "Radio", "radio", "radio", { x:.5, z:.5 }, "planks");

TileEntity.registerPrototype(BlockID.radio, {
    defaultValue:{
        playing:false
    },
    init:function(){
        this.soundPlayer = new Sound();
        this.soundPlayer.setOnCompletion((function(){
            if(this.data.playing){
                this.soundPlayer.setSource(RadioFiles[Utils.random(0, RadioFiles.length)]);
                this.soundPlayer.play();
            }
        }).bind(this))
    },
    click:function(){
        if(this.data.playing){
            this.soundPlayer.stop();
            this.data.playing = false;
        }else{
            this.soundPlayer.setSource(RadioFiles[Utils.random(0, RadioFiles.length)]);
            this.soundPlayer.play();

            this.data.playing = true;
        }
    }
});

var RadioFiles = (function(){
    let ret = [];
    let files = FileTools.GetListOfFiles(__dir__ + "sounds/");

    for(let i in files)
        ret.push(new String(__dir__+"sounds/" + files[i].getName()));

    return ret;
})();

ModAPI.registerAPI("RetroWaveRadio", {
    addFile:function(path){
        RadioFiles.push(path);
    },
    addFiles:function(paths){
        RadioFiles = RadioFiles.concat(paths);
    }
})