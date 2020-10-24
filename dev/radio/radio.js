IDRegistry.genBlockID("radio");
Block.createBlockWithRotateAndModel("radio", "Radio", "radio", "radio", { x:.5, z:.5 }, "planks");

Sound.registerTileEntity(BlockID.radio, {
    init:function(){
        this.SetSource(__RadioAPI.getFile());
    },
    OnCompletion:function(){
        this.SetSource(__RadioAPI.getFile());
        if(this.isPlaying())
            this.Play();
    },
    isPlaying:function(){
        return this.networkData.getBoolean("playing", false);
    },
    click:function(){
        let playing = this.isPlaying();
        
        this.networkData.putBoolean("playing", !playing);
        this.networkData.sendChanges();
        
        if(playing){
            this.Stop(true);
        }else{
            this.Play();
        }
    }
});